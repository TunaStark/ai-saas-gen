"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar"; 
import ChatArea from "../components/ChatArea"; 
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// --- TİP TANIMLAMALARI ---
interface HistoryItem {
  id: number;
  prompt: string;
  response: string;
  created_at: string;
}

interface Message {
  role: "user" | "model";
  parts: string[];
}

export default function Home() {
  // --- STATE ---
  const [prompt, setPrompt] = useState<string>("");
  const [result, setResult] = useState<string>(""); // Animasyon için gerekli
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [cooldown, setCooldown] = useState<number>(0);
  const [recentPrompt, setRecentPrompt] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // --- BAŞLANGIÇ AYARLARI (Session & History) ---
  useEffect(() => {
    let storedSessionId = localStorage.getItem("chat_session_id");
    if (!storedSessionId) {
      storedSessionId = crypto.randomUUID();
      localStorage.setItem("chat_session_id", storedSessionId);
    }
    setSessionId(storedSessionId);
    fetchHistory(storedSessionId);
  }, []);

  const fetchHistory = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/history/${id}`);
      if (res.ok) setHistory(await res.json());
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

  // --- İÇERİK ÜRETME (GENERATE) ---
  const generateContent = async () => {
    if (!prompt || cooldown > 0) return;

    const currentPrompt = prompt;
    setPrompt(""); // Input kutusunu temizle
    
    // 1. Kullanıcı mesajını ekrana hemen ekle
    const newUserMsg: Message = { role: "user", parts: [currentPrompt] };
    const newMessages = [...messages, newUserMsg];
    setMessages(newMessages); 

    setLoading(true);
    setResult(""); // ⚠️ KRİTİK: Önceki sonucu temizle ki yeni animasyon tetiklensin

    try {
      const response = await fetch(`${API_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: currentPrompt, 
          session_id: sessionId,
          history: messages // Önceki sohbet geçmişini gönder
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 2. AI cevabını state'e kaydet (Animasyon için)
        setResult(data.result);

        // 3. AI cevabını mesaj listesine ekle
        const newAiMsg: Message = { role: "model", parts: [data.result] };
        setMessages((prev) => [...prev, newAiMsg]);

        // 4. Sol menüye (History) ekle
        const newItem: HistoryItem = {
            id: Date.now(),
            prompt: currentPrompt,
            response: data.result,
            created_at: new Date().toISOString()
        };
        setHistory([newItem, ...history]);
        
        startCooldown(10); 

      } else {
        toast.error(data.detail || "Hata oluştu");
        setPrompt(currentPrompt); // Hata varsa geri koy
      }
    } catch (error) {
      toast.error("Bağlantı hatası");
      setPrompt(currentPrompt);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- YENİ SOHBET ---
  const handleNewChat = () => {
      setPrompt("");
      setMessages([]); // Ekranı temizle
      setResult("");   // Animasyon state'ini temizle
      setRecentPrompt(""); 
      setIsSidebarOpen(false);
  };

  // --- GEÇMİŞTEN YÜKLEME ---
  const loadHistoryItem = (item: HistoryItem) => {
    // Geçmişten yüklerken sadece o anki soru-cevabı gösteriyoruz
    // (İstersen tüm konuşmayı yükleyecek şekilde backend güncellenebilir)
    setMessages([
        { role: "user", parts: [item.prompt] },
        { role: "model", parts: [item.response] }
    ]);
    setResult(""); // Geçmiş yüklerken animasyon olmasın
    setPrompt("");
    setIsSidebarOpen(false);
  };

  // --- SİLME İŞLEMİ ---
  const deleteHistoryItem = async (id: number) => {
    if (!confirm("Bu sohbeti silmek istediğine emin misin?")) return;

    const loadingToast = toast.loading("Siliniyor...");

    try {
      const res = await fetch(`${API_URL}/api/history/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
        
        // Eğer silinen sohbet şu an ekranda açıksa temizle
        const currentItem = history.find(i => i.id === id);
        if (currentItem && messages.length > 0 && messages[0].parts[0] === currentItem.prompt) {
             handleNewChat();
        }
        
        toast.dismiss(loadingToast);
        toast.success("Sohbet başarıyla silindi! 🗑️");
      } else {
        toast.dismiss(loadingToast);
        toast.error("Silinemedi bir hata oluştu.");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Bağlantı hatası!");
      console.error(error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar
        history={history}
        sessionId={sessionId}
        onNewChat={handleNewChat}
        onLoadItem={loadHistoryItem}
        isOpen={isSidebarOpen} 
        close={() => setIsSidebarOpen(false)} 
        onDelete={deleteHistoryItem}
      />
      <ChatArea
        recentPrompt={recentPrompt}
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