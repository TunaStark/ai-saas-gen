// frontend/src/app/page.tsx
"use client"; // Bu satır şart, çünkü butona tıklama olayı var (Client Component)

import { useState } from "react";

export default function Home() {
  const [mesaj, setMesaj] = useState<string>("Test bekleniyor...");
  const [yukleniyor, setYukleniyor] = useState<boolean>(false);

  const baglantiyiTestEt = async () => {
    setYukleniyor(true);
    setMesaj("Sinyal gönderiliyor...");

    try {
      // Backend'e (Python'a) istek atıyoruz
      const cevap = await fetch("http://127.0.0.1:8000/api/health");
      
      if (!cevap.ok) throw new Error("Bağlantı hatası!");

      const veri = await cevap.json();
      
      // Gelen cevabı ekrana yazalım
      setMesaj(`BAŞARILI! 🚀 Gelen Cevap: ${veri.message} (Durum: ${veri.status})`);
    } catch (hata) {
      console.error(hata);
      setMesaj("HATA: Backend'e ulaşılamadı. Terminali kontrol et!");
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl text-center">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          AI SaaS Platform
        </h1>
        <p className="text-gray-400 mb-8">Frontend & Backend Bağlantı Testi</p>

        <div className="bg-gray-800 rounded-lg p-4 mb-6 min-h-[80px] flex items-center justify-center">
          <p className={`${mesaj.includes("HATA") ? "text-red-400" : mesaj.includes("BAŞARILI") ? "text-green-400" : "text-gray-300"} font-mono text-sm`}>
            {mesaj}
          </p>
        </div>

        <button
          onClick={baglantiyiTestEt}
          disabled={yukleniyor}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          {yukleniyor ? "Bağlanılıyor..." : "Backend'e Sinyal Gönder"}
        </button>
      </div>
    </div>
  );
}