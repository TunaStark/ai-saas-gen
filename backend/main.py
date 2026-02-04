# backend/main.py

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai 
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("HATA: .env dosyasında GEMINI_API_KEY bulunamadı!")

client = genai.Client(api_key=api_key)

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
    return {"durum": "AI Servisi (v2 SDK) Aktif 🚀"}

@app.post("/api/generate")
async def generate_content(request: AIRequest):
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash-lite', 
            contents=request.prompt
        )
        
        return {"result": response.text}
    
    except Exception as e:
        hata_mesaji = str(e)
        
        if "429" in hata_mesaji or "Quota" in hata_mesaji or "ResourceExhausted" in hata_mesaji:
            raise HTTPException(
                status_code=429, 
                detail="Üzgünüz, sistemin anlık kullanım limiti doldu. Lütfen 1-2 dakika bekleyip tekrar deneyin."
            )
        
        print(f"Bilinmeyen Hata: {hata_mesaji}")
        raise HTTPException(status_code=500, detail="Sunucu hatası oluştu.")