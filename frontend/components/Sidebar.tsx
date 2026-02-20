"use client";

// YENİ TİP: Artık HistoryItem değil, SessionItem kullanıyoruz
interface SessionItem {
  session_id: string;
  title: string;
  created_at: string;
}

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
        <div onClick={close} className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-80 bg-gray-900 border-r border-gray-800 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Başlık */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            AI Studio
          </h2>
          <button onClick={close} className="md:hidden text-gray-400 hover:text-white p-1">✕</button>
        </div>

        {/* Yeni Sohbet Butonu */}
        <div className="p-4 pt-0 mt-4">
          <button
            onClick={onNewChat}
            className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <span>+</span> Yeni Sohbet
          </button>
        </div>

        {/* OTURUMLAR LİSTESİ */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
          {sessions.length === 0 ? (
            <div className="text-center text-gray-500 text-sm mt-10">Henüz geçmiş yok. <br /> Bir şeyler yaz! 🚀</div>
          ) : (
            sessions.map((item) => (
              <div
                key={item.session_id}
                onClick={() => onLoadSession(item.session_id)}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors border pr-10
                  ${currentSessionId === item.session_id 
                      ? 'bg-blue-900/20 border-blue-800 text-white' 
                      : 'hover:bg-gray-800 border-transparent hover:border-gray-700 text-gray-300'}`}
              >
                <div className="text-sm font-medium truncate mb-1">
                  {item.title}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {new Date(item.created_at).toLocaleDateString("tr-TR", { hour: "2-digit", minute: "2-digit", day: "numeric", month:"short" })}
                </div>

                {/* SİLME BUTONU */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); 
                    onDelete(item.session_id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                  title="Sil"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 text-xs text-gray-600">
          Session: <span className="font-mono text-gray-500">{currentSessionId.slice(0, 6)}...</span>
        </div>
      </aside>
    </>
  );
}