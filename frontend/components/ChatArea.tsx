"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState, useEffect } from "react";

interface ChatAreaProps {
  prompt: string;
  setPrompt: (value: string) => void;
  result: string;
  loading: boolean;
  onGenerate: () => void;
  cooldown: number;
  recentPrompt: string;
  onOpenSidebar: () => void;
}

export default function ChatArea({
  prompt,
  setPrompt,
  result,
  loading,
  onGenerate,
  cooldown,
  recentPrompt,
  onOpenSidebar,
}: ChatAreaProps) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!result || loading) {
      setDisplayedText("");
      return;
    }

    let currentIndex = 0;
    const intervalId = setInterval(() => {
      setDisplayedText(result.slice(0, currentIndex + 1));
      currentIndex++;

      if (currentIndex === result.length) {
        clearInterval(intervalId);
      }
    }, 10);

    return () => clearInterval(intervalId);

  }, [result, loading]);

  return (
    <main className="flex-1 flex flex-col h-full relative bg-gray-950 w-full">
      {/* MOBİL HAMBURGER MENÜ BUTONU 
          md:hidden -> Masaüstünde gizle, mobilde göster.
      */}
      <div className="absolute top-4 left-4 z-10 md:hidden">
        <button
          onClick={onOpenSidebar}
          className="p-2 bg-gray-800 rounded-lg text-white border border-gray-700 hover:bg-gray-700 active:scale-95 transition-transform"
        >
          ☰
        </button>
      </div>

      {/* Scroll Edilebilir İçerik */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 custom-scrollbar">
        {!recentPrompt && !result ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50 px-4">
            <div className="text-6xl">✨</div>
            <h3 className="text-2xl font-bold text-gray-300">
              Nasıl yardımcı olabilirim?
            </h3>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pt-10 md:pt-0">
            {/* Soru */}
            <div className="flex gap-4 mb-8">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex shrink-0 items-center justify-center text-sm font-bold text-white">
                S
              </div>
              <div className="bg-gray-800 p-4 rounded-2xl rounded-tl-none border border-gray-700 text-gray-200">
                {recentPrompt}
              </div>
            </div>

            {/* Cevap */}
            {(result || loading) && (
              <div className="flex gap-4 pb-30">
                <div className="w-8 h-8 rounded-full bg-linear-to-r from-blue-600 to-purple-600 flex shrink-0 items-center justify-center text-xs font-bold text-white">
                  AI
                </div>
                <div className="flex-1 min-w-0">
                  {loading && !result ? (
                    <div className="flex space-x-2 animate-pulse p-4">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-gray-900/50 p-6 rounded-2xl rounded-tl-none border border-gray-800/50 text-gray-200 shadow-xl overflow-x-auto">
                        <div className="prose prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {displayedText}
                          </ReactMarkdown>
                        </div>
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

      {/* Input Alanı */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-950/80 backdrop-blur-md border-t border-gray-800 p-4 md:p-6">
        <div className="max-w-3xl mx-auto relative">
          <textarea
            className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 md:p-4 pr-16 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none shadow-lg text-sm md:text-base"
            placeholder="Bir şeyler yaz..."
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
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
      </div>
    </main>
  );
}
