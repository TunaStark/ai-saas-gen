"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState, useEffect, useRef } from "react";

interface Message {
  role: "user" | "model";
  parts: string[];
}

interface ChatAreaProps {
  prompt: string;
  setPrompt: (value: string) => void;
  result: string;
  loading: boolean;
  onGenerate: () => void;
  cooldown: number;
  recentPrompt: string;
  onOpenSidebar: () => void;
  messages: Message[];
}

export default function ChatArea({
  prompt,
  setPrompt,
  result,
  loading,
  onGenerate,
  cooldown,
  onOpenSidebar,
  messages,
}: ChatAreaProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null); // 📋 YENİ STATE
  const bottomRef = useRef<HTMLDivElement>(null);

  // 1. SCROLL EFEKTİ
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // 2. MATRİX (DAKTİLO) EFEKTİ
  useEffect(() => {
    if (!result || loading) {
      setDisplayedText("");
      return;
    }

    let currentIndex = 0;
    setDisplayedText(result[0] || "");

    const intervalId = setInterval(() => {
      if (currentIndex >= result.length - 1) {
        clearInterval(intervalId);
        return;
      }
      currentIndex++;
      setDisplayedText(() => result.slice(0, currentIndex + 1));
    }, 3);

    return () => clearInterval(intervalId);
  }, [result, loading]);

  // 📋 YENİ FONKSİYON: Kopyalama İşlemi
  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    // 2 saniye sonra ikonu eski haline getir
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <main className="flex-1 flex flex-col h-full relative bg-gray-950 w-full">
      {/* MOBİL MENÜ BUTONU */}
      <div className="absolute top-4 left-4 z-10 md:hidden">
        <button
          onClick={onOpenSidebar}
          className="p-2 bg-gray-800 rounded-lg text-white border border-gray-700 hover:bg-gray-700 active:scale-95 transition-transform"
        >
          ☰
        </button>
      </div>

      {/* İÇERİK ALANI */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50 px-4">
            <div className="text-6xl">✨</div>
            <h3 className="text-2xl font-bold text-gray-300">
              Nasıl yardımcı olabilirim?
            </h3>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto pt-10 md:pt-0 mb-32 space-y-8">
            {messages.map((msg, index) => {
              const isLastAiMessage =
                index === messages.length - 1 && msg.role === "model";
              const isStreaming = isLastAiMessage && result && !loading;
              const textToShow = isStreaming
                ? displayedText || " "
                : msg.parts[0];

              return (
                <div
                  key={index}
                  className={`flex gap-4 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {/* AI AVATAR */}
                  {msg.role === "model" && (
                    <div className="w-8 h-8 rounded-full bg-linear-to-r from-blue-600 to-purple-600 flex shrink-0 items-center justify-center text-xs font-bold text-white">
                      AI
                    </div>
                  )}

                  {/* MESAJ BALONU */}
                  <div
                    className={`
                      p-4 rounded-2xl max-w-[85%] border shadow-xl text-gray-200 relative group
                      ${
                        msg.role === "user"
                          ? "bg-gray-800 border-gray-700 rounded-tr-none"
                          : "bg-gray-900/50 border-gray-800/50 rounded-tl-none"
                      }
                    `}
                  >
                    {msg.role === "user" ? (
                      msg.parts[0]
                    ) : (
                      <>
                        {/* MARKDOWN ALANI */}
                        <div className="prose prose-invert max-w-none">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                              p: ({ node, ...props }) => (
                                <p
                                  className="mb-4 leading-relaxed text-gray-300"
                                  {...props}
                                />
                              ),
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                              ul: ({ node, ...props }) => (
                                <ul
                                  className="list-disc pl-6 mb-4 space-y-2"
                                  {...props}
                                />
                              ),
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                              ol: ({ node, ...props }) => (
                                <ol
                                  className="list-decimal pl-6 mb-4 space-y-2"
                                  {...props}
                                />
                              ),
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                              li: ({ node, ...props }) => (
                                <li
                                  className="mb-1 leading-relaxed"
                                  {...props}
                                />
                              ),
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                              h1: ({ node, ...props }) => (
                                <h1
                                  className="text-2xl font-bold mt-6 mb-4 text-white"
                                  {...props}
                                />
                              ),
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                              h2: ({ node, ...props }) => (
                                <h2
                                  className="text-xl font-bold mt-5 mb-3 text-white"
                                  {...props}
                                />
                              ),
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                              h3: ({ node, ...props }) => (
                                <h3
                                  className="text-lg font-bold mt-4 mb-2 text-white"
                                  {...props}
                                />
                              ),
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                              strong: ({ node, ...props }) => (
                                <strong
                                  className="font-bold text-blue-400"
                                  {...props}
                                />
                              ),
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                              code: ({ node, ...props }) => (
                                <code
                                  className="bg-gray-800 text-yellow-300 px-1.5 py-0.5 rounded text-sm font-mono"
                                  {...props}
                                />
                              ),
                            }}
                          >
                            {textToShow}
                          </ReactMarkdown>
                        </div>
                        {/* 📋 KOPYALA BUTONU (Sadece AI mesajlarında ve metin oluştuğunda) */}
                        {(!isStreaming || textToShow.length > 5) && (
                          <div className="flex justify-end mt-2 pt-2 border-t border-gray-800/50">
                            <button
                              onClick={() => handleCopy(msg.parts[0], index)}
                              className="text-xs flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors py-1 px-2 rounded hover:bg-gray-800"
                              title="Metni Kopyala"
                            >
                              {copiedIndex === index ? (
                                <>
                                  <span className="text-green-400">✓</span>{" "}
                                  Kopyalandı
                                </>
                              ) : (
                                <>
                                  <span>📋</span> Kopyala
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* USER AVATAR */}
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex shrink-0 items-center justify-center text-sm font-bold text-white">
                      U
                    </div>
                  )}
                </div>
              );
            })}

            {/* YÜKLENİYOR ANİMASYONU */}
            {loading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-linear-to-r from-blue-600 to-purple-600 flex shrink-0 items-center justify-center text-xs font-bold text-white">
                  AI
                </div>
                <div className="flex space-x-2 animate-pulse p-4 bg-gray-900/50 rounded-2xl rounded-tl-none border border-gray-800/50">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* INPUT ALANI */}
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
