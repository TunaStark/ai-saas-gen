"use client";

interface HistoryItem {
  id: number;
  prompt: string;
  response: string;
  created_at: string;
}

// 1. Yeni özellikleri buraya tanıtıyoruz
interface SidebarProps {
  history: HistoryItem[];
  sessionId: string;
  onNewChat: () => void;
  onLoadItem: (item: HistoryItem) => void;
  isOpen: boolean;
  close: () => void;
}

export default function Sidebar({ history, sessionId, onNewChat, onLoadItem, isOpen, close }: SidebarProps) {
  return (
    <>
      {/* MOBİL İÇİN KARARTMA PERDESİ (Overlay) 
          Sadece menü açıksa ve mobildeysek görünür. */}
      {isOpen && (
        <div 
          onClick={close}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
        />
      )}

      {/* SIDEBAR ANA YAPISI 
          md:static -> Masaüstünde hep sabit dur
          fixed -> Mobilde ekranın üstüne çık
          -translate-x-full -> Kapalıyken sola saklan
      */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-80 bg-gray-900 border-r border-gray-800 
        flex flex-col transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
      `}>
        
        {/* Başlık ve Kapat Butonu */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            AI Studio
          </h2>
          {/* Sadece mobilde görünen kapatma (X) butonu */}
          <button onClick={close} className="md:hidden text-gray-400 hover:text-white p-1">
            ✕
          </button>
        </div>

        <div className="p-4 pt-0 mt-4">
            <button 
            onClick={onNewChat}
            className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
            >
            <span>+</span> Yeni Sohbet
            </button>
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
          {history.length === 0 ? (
            <div className="text-center text-gray-500 text-sm mt-10">
              Henüz geçmiş yok. <br/> Bir şeyler yaz! 🚀
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id}
                onClick={() => onLoadItem(item)}
                className="p-3 hover:bg-gray-800 rounded-lg cursor-pointer group transition-colors border border-transparent hover:border-gray-700"
              >
                <div className="text-sm font-medium text-gray-300 truncate mb-1 group-hover:text-white">
                  {item.prompt.slice(0, 30)}...
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {new Date(item.created_at).toLocaleDateString("tr-TR", {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-800 text-xs text-gray-600">
            Session: <span className="font-mono text-gray-500">{sessionId.slice(0, 6)}...</span>
        </div>
      </aside>
    </>
  );
}