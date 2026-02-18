"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface SessionItem {
  session_id: string;
  title: string;
  created_at: string;
}

interface Message {
  role: "user" | "model";
  parts: string[];
}

export default function Home() {
  const [prompt, setPrompt] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  
  // 🛠️ YENİ STATELER: Oturumlar Listesi ve Aktif Oturum ID'si
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  
  const [cooldown, setCooldown] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // BAŞLANGIÇ: UUID oluştur ve Oturumları çek
  useEffect(() => {
    let storedSessionId = localStorage.getItem("chat_session_id");
    if (!storedSessionId) {
      storedSessionId = crypto.randomUUID();
      localStorage.setItem("chat_session_id", storedSessionId);
    }
    setCurrentSessionId(storedSessionId);
    fetchSessions(); // <-- Tüm oturum başlıklarını çek
  }, []);

  // 1. TÜM OTURUM BAŞLIKLARINI GETİR (Sidebar İçin)
  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_URL}/api/sessions`);
      if (res.ok) setSessions(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const startCooldown = (seconds: number) => {
    setCooldown(seconds);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // İÇERİK ÜRET (Mesaj Gönder)
  const generateContent = async () => {
    if (!prompt || cooldown > 0) return;

    const currentPrompt = prompt;
    setPrompt("");
    
    const newUserMsg: Message = { role: "user", parts: [currentPrompt] };
    const newMessages = [...messages, newUserMsg];
    setMessages(newMessages); 
    setLoading(true);
    setResult(""); 

    try {
      const response = await fetch(`${API_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: currentPrompt, 
          session_id: currentSessionId, // <-- Mevcut oturuma kaydet
          history: messages 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.result);
        const newAiMsg: Message = { role: "model", parts: [data.result] };
        setMessages((prev) => [...prev, newAiMsg]);

        // Eğer bu session listesinde yoksa (ilk mesajsa), Sidebar'ı güncelle
        if (!sessions.find(s => s.session_id === currentSessionId)) {
            fetchSessions();
        }
        startCooldown(10); 
      } else {
        toast.error(data.detail || "Hata oluştu");
        setPrompt(currentPrompt);
      }
    } catch (error) {
      toast.error("Bağlantı hatası");
      setPrompt(currentPrompt);
    } finally {
      setLoading(false);
    }
  };

  // 2. YENİ SOHBET AÇ
  const handleNewChat = () => {
      const newId = crypto.randomUUID(); // Yepyeni bir ID üret!
      localStorage.setItem("chat_session_id", newId); // Tarayıcıya kaydet
      setCurrentSessionId(newId); // Aktif ID'yi değiştir
      
      setPrompt("");
      setMessages([]); // Ekranı tertemiz yap
      setResult("");   
      setIsSidebarOpen(false);
  };

  // 3. GEÇMİŞTEN BİR OTURUM YÜKLE
  const loadSession = async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    localStorage.setItem("chat_session_id", sessionId);
    setIsSidebarOpen(false);
    
    // O oturuma ait TÜM mesajları backend'den çek
    try {
      const res = await fetch(`${API_URL}/api/history/${sessionId}`);
      if (res.ok) {
        const historyData = await res.json();
        // Backend'den gelen veriyi Frontend'in anladığı formata (Message[]) çevir
        const reconstructedMessages: Message[] = [];
        historyData.forEach((row: { prompt: string; response: string }) => {
            reconstructedMessages.push({ role: "user", parts: [row.prompt] });
            reconstructedMessages.push({ role: "model", parts: [row.response] });
        });
        
        setMessages(reconstructedMessages); // Ekranı doldur
        setResult(""); // Animasyonu iptal et
      }
    } catch (err) {
      toast.error("Sohbet yüklenemedi");
    }
  };

  // 4. OTURUMU SİL
  const deleteSession = async (sessionId: string) => {
    if (!confirm("Bu sohbeti tamamen silmek istediğine emin misin?")) return;

    const loadingToast = toast.loading("Siliniyor...");

    try {
      const res = await fetch(`${API_URL}/api/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Listeden çıkar
        setSessions((prev) => prev.filter((item) => item.session_id !== sessionId));
        
        // Eğer sildiğimiz oturum şu an açıksa, ekranı temizle ve yeni sohbete geç
        if (currentSessionId === sessionId) {
             handleNewChat();
        }
        
        toast.dismiss(loadingToast);
        toast.success("Oturum başarıyla silindi! 🗑️");
      } else {
        toast.dismiss(loadingToast);
        toast.error("Silinemedi bir hata oluştu.");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Bağlantı hatası!");
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={handleNewChat}
        onLoadSession={loadSession}
        isOpen={isSidebarOpen} 
        close={() => setIsSidebarOpen(false)} 
        onDelete={deleteSession}
      />
      <ChatArea
        recentPrompt=""
        messages={messages}
        prompt={prompt}
        setPrompt={setPrompt}
        result={result}
        loading={loading}
        onGenerate={generateContent}
        cooldown={cooldown}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />
    </div>
  );
}