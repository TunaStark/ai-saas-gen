import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai 
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# --- API KEY & DB ---
api_key = os.getenv("GEMINI_API_KEY")
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY eksik!")
if not supabase_url or not supabase_key:
    raise ValueError("SUPABASE bilgileri eksik!")

client = genai.Client(api_key=api_key)
supabase: Client = create_client(supabase_url, supabase_key)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GÜNCELLEME 1: Artık session_id de istiyoruz
class AIRequest(BaseModel):
    prompt: str
    session_id: str
    history: list = []

@app.get("/")
def read_root():
    return {"durum": "AI Servisi Hazır 🚀"} 

@app.get("/api/sessions")
def get_sessions():
    try:
        # Tüm geçmişi en eskiden en yeniye doğru çek
        response = supabase.table("history").select("*").order("created_at", desc=False).execute()
        
        # Python ile session_id'ye göre grupla
        sessions = {}
        for row in response.data:
            sid = row["session_id"]
            # Bir session ilk kez görülüyorsa (ilk mesajsa) onu başlık yap
            if sid not in sessions:
                sessions[sid] = {
                    "session_id": sid,
                    "title": row["prompt"], # İlk soruyu başlık yapıyoruz
                    "created_at": row["created_at"]
                }
        
        # Listeye çevir ve tarihe göre en yeni en üstte olacak şekilde sırala
        session_list = list(sessions.values())
        session_list.sort(key=lambda x: x["created_at"], reverse=True)
        
        return session_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# YENİ ENDPOINT: Geçmişi Getir
@app.get("/api/history/{session_id}")
def get_session_history(session_id: str):
    try:
        response = supabase.table("history")\
            .select("*")\
            .eq("session_id", session_id)\
            .order("created_at", desc=False)\
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate")
async def generate_content(request: AIRequest):
    max_retries = 3

    formatted_history = []
    for msg in request.history:
        formatted_history.append({
            "role": msg["role"],
            "parts": [{"text": part} for part in msg["parts"]]
        })
    
    chat_history = formatted_history
    
    for attempt in range(max_retries):
        try:
            chat = client.chats.create(
                model='gemini-2.5-flash',
                history=chat_history
            )
            
            response = chat.send_message(request.prompt)
            ai_response_text = response.text

            try:
                supabase.table("history").insert({
                    "prompt": request.prompt,
                    "response": ai_response_text,
                    "session_id": request.session_id
                }).execute()
            except Exception as db_error:
                print(f"⚠️ DB Hatası: {db_error}")

            return {"result": ai_response_text}
        
        except Exception as e:
            print(f"Deneme {attempt+1} Hatası: {e}")
            if attempt == max_retries - 1:
                 raise HTTPException(status_code=500, detail=str(e))
    
@app.delete("/api/sessions/{session_id}")
async def delete_session(session_id: str):
    try:
        # Supabase'den o session_id'ye ait TÜM satırları sil
        supabase.table("history").delete().eq("session_id", session_id).execute()
        return {"message": "Oturum başarıyla silindi"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))