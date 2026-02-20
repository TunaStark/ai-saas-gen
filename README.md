# 🚀 AI Assistant Studio (Full-Stack AI SaaS)

Google Gemini 2.0 altyapısını kullanan, bağlam farkındalığına (Context Awareness) sahip, gerçek zamanlı veri akışı (Streaming) sunan modern bir yapay zeka asistanı. 

Bu proje, modern web teknolojilerini (Next.js & FastAPI) bir araya getirerek, kullanıcılara ChatGPT benzeri akıcı ve profesyonel bir deneyim sunmayı amaçlamaktadır.

![Proje Ekran Görüntüsü](frontend/public/ai-preview.png) *(Buraya kendi ekran görüntünün yolunu veya GitHub URL'sini koyabilirsin)*

---

## ✨ Öne Çıkan Özellikler

* 🧠 **Bağlam Farkındalığı (Context-Aware):** Sadece tek bir soruyu değil, tüm oturumun geçmişini hatırlayarak akıllı cevaplar üretir.
* 🌊 **Gerçek Zamanlı Yazım Efekti (Streaming):** Yapay zekanın cevapları, doğal bir hissiyat vermek için "daktilo" (matrix) efektiyle ekrana dökülür.
* 📝 **Gelişmiş Markdown Desteği:** Kod blokları (syntax highlighting), tablolar, kalın yazılar ve listeler kusursuz bir şekilde render edilir.
* 📂 **Oturum Yönetimi (Session-Based History):** Sohbetler birbirine karışmaz; her konuşma kendi ID'si altında gruplanır ve geçmişten kolayca yüklenebilir.
* 📋 **Tek Tıkla Kopyalama:** Uzun cevapları veya kod bloklarını anında panoya kopyalama imkanı sunar.
* 📱 **Tam Responsive Tasarım:** Mobilde hamburger menü ile daralan, masaüstünde genişleyen kusursuz Tailwind CSS mimarisi.
* 🍞 **Şık Bildirimler:** İşlem durumları (Silme, Hata vs.) React Hot Toast ile şık pop-up'lar halinde kullanıcıya sunulur.

---

## 🛠️ Kullanılan Teknolojiler (Tech Stack)

### Frontend (Kullanıcı Arayüzü)
* **Framework:** [Next.js 14](https://nextjs.org/) (App Router) & React
* **Dil:** TypeScript
* **Stil:** Tailwind CSS
* **Markdown:** `react-markdown`, `remark-gfm`, `@tailwindcss/typography`
* **Bildirimler:** `react-hot-toast`

### Backend (Sunucu & API)
* **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
* **AI Model:** Google Gemini API (`gemini-2.5-flash`)
* **Veritabanı:** Supabase (PostgreSQL)

---

## 🚀 Kurulum (Local Development)

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyebilirsiniz.

🗺️ Yol Haritası (Roadmap)
[x] Temel Soru-Cevap API'si

[x] Supabase veritabanı entegrasyonu

[x] Markdown render desteği

[x] Matrix/Streaming daktilo efekti

[x] Oturum (Session) bazlı hafıza yönetimi

[ ] Kullanıcı Girişi (Auth - Supabase veya NextAuth)

[ ] Sesli komut (Speech-to-Text) desteği

[ ] PDF okutma ve doküman üzerinde sohbet

### 1. Depoyu Klonlayın
```bash
git clone [https://github.com/TunaStark/ai-saas-gen.git](https://github.com/TunaStark/ai-saas-gen.git)
cd REPON

cd backend
# Gerekli kütüphaneleri yükleyin
pip install fastapi uvicorn pydantic google-genai supabase python-dotenv

# .env dosyasını oluşturun ve API anahtarlarınızı girin
# GEMINI_API_KEY=your_api_key
# SUPABASE_URL=your_supabase_url
# SUPABASE_KEY=your_supabase_key

# Sunucuyu başlatın
uvicorn main:app --reload

cd frontend
# Bağımlılıkları yükleyin
npm install

# .env.local dosyasını oluşturun (Varsa)
# NEXT_PUBLIC_API_URL=[http://127.0.0.1:8000](http://127.0.0.1:8000)

# Uygulamayı başlatın
npm run dev