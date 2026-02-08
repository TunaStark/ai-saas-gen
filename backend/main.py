import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai 
from dotenv import load_dotenv
from supabase import create_client, Client 

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
supabase_url = os.getenv("SUPABASE_URL") 
supabase_key = os.getenv("SUPABASE_KEY") 

if not api_key:
    raise ValueError("HATA: .env dosyasında GEMINI_API_KEY bulunamadı!")
if not supabase_url or not supabase_key:
    raise ValueError("HATA: .env dosyasında SUPABASE bilgileri eksik!")

client = genai.Client(api_key=api_key)
supabase: Client = create_client(supabase_url, supabase_key) 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AIRequest(BaseModel):
    prompt: str

@app.get("/")
def read_root():
    return {"durum": "AI Servisi (v2 SDK + Supabase DB) Aktif 🚀"}

@app.post("/api/generate")
async def generate_content(request: AIRequest):
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents=request.prompt
        )
        
        ai_response_text = response.text

        try:
            supabase.table("history").insert({
                "prompt": request.prompt,
                "response": ai_response_text
            }).execute()
            print("✅ Veritabanına kayıt başarılı!")
        except Exception as db_error:
            print(f"⚠️ Veritabanı Hatası: {db_error}")

        return {"result": ai_response_text}
    
    except Exception as e:
        hata_mesaji = str(e)
        
        if "429" in hata_mesaji or "Quota" in hata_mesaji or "ResourceExhausted" in hata_mesaji:
            raise HTTPException(
                status_code=429, 
                detail="Üzgünüz, sistemin anlık kullanım limiti doldu. Lütfen 1-2 dakika bekleyip tekrar deneyin."
            )
        
        print(f"Bilinmeyen Hata: {hata_mesaji}")
        raise HTTPException(status_code=500, detail="Sunucu hatası oluştu.")