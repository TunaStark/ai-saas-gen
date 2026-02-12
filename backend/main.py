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

@app.get("/")
def read_root():
    return {"durum": "AI Servisi Hazır 🚀"} 

# YENİ ENDPOINT: Geçmişi Getir
@app.get("/api/history/{session_id}")
def get_history(session_id: str):
    try:
        # Sadece bu session_id'ye ait verileri çek, tarihe göre sırala
        response = supabase.table("history")\
            .select("*")\
            .eq("session_id", session_id)\
            .order("created_at", desc=True)\
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate")
async def generate_content(request: AIRequest):
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash-lite', 
            contents=request.prompt
        )
        ai_response_text = response.text

        # GÜNCELLEME 2: Kaydederken session_id'yi de ekliyoruz
        try:
            supabase.table("history").insert({
                "prompt": request.prompt,
                "response": ai_response_text,
                "session_id": request.session_id # <-- Kimlik eklendi
            }).execute()
            print("✅ Kayıt Başarılı")
        except Exception as db_error:
            print(f"⚠️ DB Hatası: {db_error}")

        return {"result": ai_response_text}
    
    except Exception as e:
        # Hata yakalama bloğu aynı kalabilir
        if "429" in str(e) or "Quota" in str(e):
             raise HTTPException(status_code=429, detail="Limit doldu.")
        print(f"Hata: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.delete("/api/history/{id}")
async def delete_history(id: int):
    try:
        # Supabase'den ID'ye göre sil
        supabase.table("history").delete().eq("id", id).execute()
        return {"message": "Başarıyla silindi"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))