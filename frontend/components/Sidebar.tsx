"use client";

// YENİ: Tip tanımını API servisimizden çekiyoruz (DRY prensibi)
import { SessionItem } from "../services/api";

interface SidebarProps {
  sessions: SessionItem[];
  currentSessionId: string;
  onNewChat: () => void;
  onLoadSession: (sessionId: string) => void;
  isOpen: boolean;
  close: () => void;
  onDelete: (sessionId: string) => void;
}

export default function Sidebar({
  sessions,
  currentSessionId,
  onNewChat,
  onLoadSession,
  isOpen,
  close,
  onDelete,
}: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div onClick={close} className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity" />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-80 bg-gray-900 border-r border-gray-800 flex flex-col transform transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* BAŞLIK */}
        <div className="p-5 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent tracking-wide">
            TunaxG AI Studio
          </h2>
          <button 
            onClick={close} 
            className="md:hidden text-gray-500 hover:text-white p-1 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* YENİ SOHBET BUTONU */}
        <div className="p-4">
          <button
            onClick={onNewChat}
            className="w-full py-2.5 px-4 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:border-blue-500/50 rounded-xl flex items-center justify-center gap-2 transition-all text-sm font-semibold shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Yeni Sohbet
          </button>
        </div>

        {/* OTURUMLAR LİSTESİ */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
          {sessions.length === 0 ? (
            <div className="text-center text-gray-500 text-sm mt-10 flex flex-col items-center gap-2">
              <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <span>Henüz geçmiş yok.<br/>Bir şeyler yaz!</span>
            </div>
          ) : (
            sessions.map((item) => {
              const isActive = currentSessionId === item.session_id;
              
              return (
                <div
                  key={item.session_id}
                  onClick={() => onLoadSession(item.session_id)}
                  className={`group relative p-3 rounded-xl cursor-pointer transition-all pr-12 border
                    ${isActive 
                        ? 'bg-gray-800 border-gray-700 shadow-sm' // Aktif oturum daha belirgin (border ile desteklendi)
                        : 'border-transparent hover:bg-gray-800/50 text-gray-400 hover:text-gray-200'}`}
                >
                  <div className={`text-sm font-medium truncate mb-1 ${isActive ? 'text-blue-400' : ''}`}>
                    {item.title}
                  </div>
                  <div className="text-[11px] text-gray-500 truncate flex items-center gap-1.5">
                    {/* Saat/Tarih gösterimi */}
                    {new Date(item.created_at).toLocaleDateString("tr-TR", { hour: "2-digit", minute: "2-digit", day: "numeric", month:"short" })}
                  </div>

                  {/* SİLME BUTONU */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); 
                      onDelete(item.session_id);
                    }}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all
                      ${isActive ? 'opacity-100 md:opacity-0 md:group-hover:opacity-100' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'}`}
                    title="Sil"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-800 flex justify-between items-center text-xs text-gray-500 bg-gray-950/30">
          <span>Oturum:</span>
          <span className="font-mono bg-gray-800 px-2 py-1 rounded text-gray-400">
            {currentSessionId.slice(0, 8)}
          </span>
        </div>
      </aside>
    </>
  );
}