// frontend/components/ChatArea.tsx
"use client";

interface ChatAreaProps {
  prompt: string;
  setPrompt: (value: string) => void;
  result: string;
  loading: boolean;
  onGenerate: () => void;
  cooldown: number;
  recentPrompt: string; // <-- YENİ PROP EKLENDİ
}

export default function ChatArea({ 
  prompt, 
  setPrompt, 
  result, 
  loading, 
  onGenerate, 
  cooldown,
  recentPrompt // <-- Karşıla
}: ChatAreaProps) {
  return (
    <main className="flex-1 flex flex-col h-full relative bg-gray-950">
      
      <div className="flex-1 overflow-y-auto p-8 pb-32 custom-scrollbar">
        {/* Koşulu Değiştirdik: Son soru VEYA Sonuç varsa göster */}
        {!recentPrompt && !result ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <div className="text-6xl">✨</div>
              <h3 className="text-2xl font-bold text-gray-300">Nasıl yardımcı olabilirim?</h3>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
             
             {/* KULLANICI SORUSU: Artık recentPrompt kullanıyor */}
             <div className="flex gap-4 mb-8">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-white">S</div>
                <div className="bg-gray-800 p-4 rounded-2xl rounded-tl-none border border-gray-700 text-gray-200">
                  {recentPrompt} 
                </div>
             </div>

             {/* AI CEVABI */}
             {(result || loading) && (
               <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white">AI</div>
                  <div className="flex-1">
                    {loading && !result ? (
                        // Yüklenirken gösterilecek iskelet (Opsiyonel Güzellik)
                        <div className="flex space-x-2 animate-pulse p-4">
                            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        </div>
                    ) : (
                        // Cevap gelince
                        <>
                        <div className="bg-gray-900/50 p-6 rounded-2xl rounded-tl-none border border-gray-800/50 text-gray-200 leading-relaxed whitespace-pre-wrap shadow-xl">
                            {result}
                        </div>
                        <button 
                            onClick={() => navigator.clipboard.writeText(result)}
                            className="mt-2 text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1"
                        >
                            📋 Kopyala
                        </button>
                        </>
                    )}
                  </div>
               </div>
             )}
          </div>
        )}
      </div>

      {/* INPUT ALANI: Burası hala 'prompt' kullanıyor (Temizlenmesi gereken yer) */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-950/80 backdrop-blur-md border-t border-gray-800 p-6">
        <div className="max-w-3xl mx-auto relative">
          <textarea
            className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 pr-16 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none shadow-lg"
            placeholder="Bir şeyler yaz..."
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
                if(e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onGenerate();
                }
            }}
          />
          <button
            onClick={onGenerate}
            disabled={loading || !prompt || cooldown > 0} 
            className={`absolute right-3 bottom-3 p-2 rounded-lg transition-colors text-white 
              ${cooldown > 0 ? "bg-gray-600 cursor-wait" : "bg-blue-600 hover:bg-blue-500"} 
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : cooldown > 0 ? (
               <span className="text-xs font-mono font-bold">{cooldown}s</span>
            ) : (
               <span>🚀</span>
            )}
          </button>
        </div>
        <div className="text-center mt-2 text-xs text-gray-600">
           Gemini 2.5 Flash Lite & Supabase
        </div>
      </div>
    </main>
  );
}