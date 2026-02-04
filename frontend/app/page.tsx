"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const generateContent = async () => {
    if (!prompt) return;

    setLoading(true);
    setResult("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.result);
      } else if (response.status === 429) {
        setResult("⏳ " + data.detail);
      } else {
        setResult("⚠️ Hata: " + (data.detail || "Bir sorun oluştu."));
      }
    } catch (error) {
      console.error(error);
      setResult("🔌 Bağlantı Hatası: Backend'e ulaşılamıyor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center py-10 px-4">
      <div className="max-w-3xl w-full text-center mb-10">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
          AI Content Generator
        </h1>
        <p className="text-gray-400 text-lg">
          Google Gemini destekli, yeni nesil içerik üretim asistanınız.
        </p>
      </div>

      <div className="max-w-3xl w-full bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl shadow-blue-900/20">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            AI&apos;ya ne yaptırmak istersin?
          </label>
          <textarea
            className="w-full h-32 bg-gray-800 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
            placeholder="Örn: Yazılım mühendisliği kariyeri hakkında motive edici bir LinkedIn gönderisi yaz..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <button
          onClick={generateContent}
          disabled={loading || !prompt}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold text-lg shadow-lg transform active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Düşünüyor...
            </>
          ) : (
            "İçerik Üret ⚡"
          )}
        </button>

        {result && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-300">Sonuç:</h3>
              <button
                onClick={() => navigator.clipboard.writeText(result)}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Kopyala
              </button>
            </div>

            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700/50 text-gray-200 leading-relaxed whitespace-pre-wrap">
              {result}
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 text-gray-600 text-sm">
        Powered by Google Gemini 1.5 Flash
      </div>
    </div>
  );
}
