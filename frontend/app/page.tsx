"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar"; // <-- Import ettik
import ChatArea from "../components/ChatArea"; // <-- Import ettik
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
// Tip Tanımlamaları
interface HistoryItem {
  id: number;
  prompt: string;
  response: string;
  created_at: string;
}

export default function Home() {
  // State
  const [prompt, setPrompt] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [cooldown, setCooldown] = useState<number>(0);
  const [recentPrompt, setRecentPrompt] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Başlangıç Ayarları
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

  const generateContent = async () => {
    if (!prompt || cooldown > 0) return;

    const currentPrompt = prompt;
    setRecentPrompt(currentPrompt);
    setPrompt(""); 
    setLoading(true);
    setResult("");

    try {
      const response = await fetch(`${API_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: currentPrompt, 
          session_id: sessionId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.result);

        const newItem: HistoryItem = {
          id: Date.now(),
          prompt: currentPrompt,
          response: data.result,
          created_at: new Date().toISOString(),
        };
        setHistory([newItem, ...history]);
        startCooldown(10);
      } else {
        toast.error(data.detail || "Bir hata oluştu");
        setPrompt(currentPrompt);
      }
    } catch (error) {
      setResult("🔌 Bağlantı Hatası: " + error);
      setPrompt(currentPrompt);
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setRecentPrompt(item.prompt);
    setResult(item.response); 
    setPrompt("");
    setIsSidebarOpen(false);
  };

  const deleteHistoryItem = async (id: number) => {
    // Çirkin confirm yerine Toast Promise kullanalım mı? 
    // Veya şimdilik basitlik için confirm kalsın, başarı mesajı toast olsun.
    // (Custom confirm biraz uzun sürer, şimdilik native confirm kalsın ama başarı mesajı toast olsun)
    
    if (!confirm("Bu sohbeti silmek istediğine emin misin?")) return;

    // Toast Promise: İşlem başlarken, sürerken ve bitince otomatik mesaj verir
    const loadingToast = toast.loading("Siliniyor...");

    try {
      const res = await fetch(`${API_URL}/api/history/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
        if (recentPrompt === history.find(i => i.id === id)?.prompt) {
             setPrompt("");
             setResult("");
             setRecentPrompt("");
        }
        
        // Yükleniyor mesajını sil ve başarı mesajı ver
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
        onNewChat={() => {
          setPrompt("");
          setResult("");
          setRecentPrompt(""); 
          setIsSidebarOpen(false); 
        }}
        onLoadItem={loadHistoryItem}
        isOpen={isSidebarOpen} 
        close={() => setIsSidebarOpen(false)} 
        onDelete={deleteHistoryItem}
      />
      <ChatArea
        recentPrompt={recentPrompt}
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
