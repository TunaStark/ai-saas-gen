# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Uygulamayı oluştur
app = FastAPI(title="AI SaaS API", version="1.0.0")

# --- GÜVENLİK AYARI (CORS) ---
# Frontend'in adresi (Next.js genelde 3000'de çalışır)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Middleware ekliyoruz: Bu, kapıdaki güvenlik görevlisi gibidir.
# Sadece izin verilen adreslerden gelen isteklere "Geç" der.
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # Hangi siteler erişebilir?
    allow_credentials=True,     # Çerezlere (cookie) izin verelim mi?
    allow_methods=["*"],        # GET, POST, DELETE... hepsine izin ver
    allow_headers=["*"],        # Tüm başlıklara izin ver
)

# --- ENDPOINTLER (Uç Noktalar) ---

@app.get("/")
def read_root():
    return {"message": "AI SaaS Backend Çalışıyor! 🚀"}

@app.get("/api/health")
def health_check():
    """
    Sistemin sağlıklı olup olmadığını kontrol eden endpoint.
    Frontend bunu çağırarak sunucunun açık olup olmadığını anlar.
    """
    return {"status": "ok", "message": "Bağlantı Başarılı"}