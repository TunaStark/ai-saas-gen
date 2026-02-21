"use client";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState, useEffect, useRef } from "react";

// 1. KULLANILMAYAN ÇÖPLER TEMİZLENDİ (recentPrompt kaldırıldı)
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
  onOpenSidebar: () => void;
  messages: Message[];
}

// 2. MARKDOWN BİLEŞENLERİ DIŞARI ALINDI (Performans ve Temiz Kod)
// Bu sayede her render'da yeniden oluşturulmuyor ve JSX'i kirletmiyor.
const markdownComponents: Components = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  p: ({ node: _node, ...props }) => <p className="mb-4 leading-relaxed text-gray-300" {...props} />,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ul: ({ node: _node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ol: ({ node: _node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  li: ({ node: _node, ...props }) => <li className="mb-1 leading-relaxed" {...props} />,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  h1: ({ node: _node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4 text-white" {...props} />,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  h2: ({ node: _node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3 text-white" {...props} />,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  h3: ({ node: _node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2 text-white" {...props} />,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  strong: ({ node: _node, ...props }) => <strong className="font-bold text-blue-400" {...props} />,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  code: ({ node: _node, ...props }) => <code className="bg-gray-800 text-yellow-300 px-1.5 py-0.5 rounded text-sm font-mono break-words" {...props} />,
};

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
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null); 

  // SCROLL EFEKTİ
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // MATRİX (DAKTİLO) EFEKTİ
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
    }, 5);

    return () => clearInterval(intervalId);
  }, [result, loading]);

  // KOPYALAMA İŞLEMİ
  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // 4. YENİ: TEXTAREA AUTO-RESIZE (İçeriğe göre uzayan kutu)
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    
    // Yüksekliği önce sıfırla, sonra içeriğe (scrollHeight) göre ayarla
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      // Maksimum bir yükseklik sınırı koyuyoruz (örneğin 200px) ki tüm ekranı kaplamasın
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  // Gönderdikten sonra textarea boyutunu eski haline döndürmek için
  const handleSend = () => {
    onGenerate();
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <main className="flex-1 flex flex-col h-full relative bg-gray-950 w-full">
      <div className="absolute top-4 left-4 z-10 md:hidden">
        <button
          onClick={onOpenSidebar}
          className="p-3 bg-gray-900/80 backdrop-blur-md rounded-xl text-white border border-gray-700/50 hover:bg-gray-800 active:scale-95 transition-all shadow-lg flex items-center justify-center"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* İÇERİK ALANI */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50 px-4">
            <div className="text-6xl mb-2">✨</div>
            <h3 className="text-2xl font-bold text-gray-300">
              Nasıl yardımcı olabilirim?
            </h3>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto pt-16 md:pt-0 mb-32 space-y-8">
            {messages.map((msg, index) => {
              const isLastAiMessage = index === messages.length - 1 && msg.role === "model";
              const isStreaming = isLastAiMessage && result && !loading;
              const textToShow = isStreaming ? (displayedText || " ") : msg.parts[0];

              return (
                <div key={index} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex flex-col md:flex-row gap-2 md:gap-4 max-w-[95%] md:max-w-[85%] w-full md:w-auto ${msg.role === "user" ? "items-end md:items-start md:flex-row-reverse" : "items-start"}`}>
                    
                    {/* AVATARLAR */}
                    <div className={`w-7 h-7 md:w-8 md:h-8 shrink-0 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold text-white shadow-md
                      ${msg.role === "model" ? "bg-gradient-to-r from-blue-600 to-purple-600" : "bg-gray-700"}
                    `}>
                      {msg.role === "model" ? "AI" : "U"}
                    </div>

                    {/* MESAJ BALONU */}
                    <div className={`p-4 rounded-2xl border shadow-lg text-sm md:text-base text-gray-200 w-full md:w-auto relative group
                      ${msg.role === "user"
                          ? "bg-gray-800 border-gray-700 md:rounded-tr-none" 
                          : "bg-gray-900/50 border-gray-800/50 md:rounded-tl-none"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <div className="whitespace-pre-wrap">{msg.parts[0]}</div>
                      ) : (
                        <>
                          <div className="prose prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                              {textToShow} 
                            </ReactMarkdown>
                          </div>

                          {/* 📋 KOPYALA BUTONU */}
                          {(!isStreaming || textToShow.length > 5) && (
                            <div className="flex justify-end mt-2 pt-2 border-t border-gray-800/50">
                                <button 
                                    onClick={() => handleCopy(msg.parts[0], index)}
                                    className="text-xs flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors py-1 px-2 rounded hover:bg-gray-800"
                                    title="Metni Kopyala"
                                >
                                    {copiedIndex === index ? (
                                        <><span className="text-green-400">✓</span> Kopyalandı</>
                                    ) : (
                                        <>
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                            Kopyala
                                        </>
                                    )}
                                </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}

            {/* YÜKLENİYOR ANİMASYONU */}
            {loading && (
              <div className="flex w-full justify-start">
                <div className="flex flex-col md:flex-row gap-2 md:gap-4 max-w-[95%] md:max-w-[85%] items-start">
                  <div className="w-7 h-7 md:w-8 md:h-8 shrink-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-[10px] md:text-xs font-bold text-white shadow-md">
                    AI
                  </div>
                  <div className="flex space-x-2 animate-pulse p-4 bg-gray-900/50 rounded-2xl md:rounded-tl-none border border-gray-800/50 h-[52px] items-center">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gray-950/90 backdrop-blur-xl border-t border-gray-800 p-3 md:p-6 pb-6">
        <div className="max-w-3xl mx-auto relative flex items-end">
          <textarea
            ref={textareaRef} // Yeni ekledik
            className="w-full bg-gray-900 border border-gray-700 rounded-2xl py-3.5 pl-5 pr-16 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none shadow-lg text-sm md:text-base custom-scrollbar"
            placeholder="Bir şeyler yaz..."
            rows={1} // Başlangıçta 1 satır olsun
            style={{ minHeight: '52px', overflowY: 'auto' }} // Minimum yükseklik ve scroll
            value={prompt}
            onChange={handleTextareaChange} // Yeni ekledik
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(); // Yeni ekledik
              }
            }}
          />
          <button
            onClick={handleSend} // Yeni ekledik
            disabled={loading || !prompt || cooldown > 0}
            className={`absolute right-2.5 bottom-2 w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-sm
              ${cooldown > 0 ? "bg-gray-800 text-gray-500 cursor-wait" : "bg-blue-600 text-white hover:bg-blue-500 active:scale-95 hover:shadow-blue-500/25"} 
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : cooldown > 0 ? (
              <span className="text-xs font-mono font-bold">{cooldown}s</span>
            ) : (
              <svg className="w-5 h-5 ml-0.5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}