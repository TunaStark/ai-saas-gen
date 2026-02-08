"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar"; // <-- Import ettik
import ChatArea from "../components/ChatArea"; // <-- Import ettik

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
      const res = await fetch(`http://127.0.0.1:8000/api/history/${id}`);
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
    setRecentPrompt(currentPrompt); // 1. Soruyu ekrana sabitle
    setPrompt(""); // 2. Input kutusunu temizle
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: currentPrompt, // Backend'e giden veri
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
        setResult("⚠️ Hata: " + data.detail);
        // Hata olursa inputa geri koy ki düzeltsin
        setPrompt(currentPrompt);
      }
    } catch (error) {
      setResult("🔌 Bağlantı Hatası");
      setPrompt(currentPrompt);
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setRecentPrompt(item.prompt); // Balona yaz
    setResult(item.response); // Cevabı yaz
    setPrompt(""); // Input boş kalsın
  };

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar
        history={history}
        sessionId={sessionId}
        onNewChat={() => {
          setPrompt("");
          setResult("");
        }}
        onLoadItem={loadHistoryItem}
      />

      <ChatArea
        recentPrompt={recentPrompt}
        prompt={prompt}
        setPrompt={setPrompt}
        result={result}
        loading={loading}
        onGenerate={generateContent}
        cooldown={cooldown}
      />
    </div>
  );
}
