import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { apiService, SessionItem, Message } from "../services/api";

export function useChat() {
  const [prompt, setPrompt] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [cooldown, setCooldown] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // BAŞLANGIÇ
  useEffect(() => {
    let storedSessionId = localStorage.getItem("chat_session_id");
    if (!storedSessionId) {
      storedSessionId = crypto.randomUUID();
      localStorage.setItem("chat_session_id", storedSessionId);
    }
    setCurrentSessionId(storedSessionId);
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const data = await apiService.getSessions();
      setSessions(data);
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
    setPrompt("");

    const newUserMsg: Message = { role: "user", parts: [currentPrompt] };
    setMessages((prev) => [...prev, newUserMsg]);
    setLoading(true);
    setResult("");

    try {
      const aiResult = await apiService.generate(
        currentPrompt,
        currentSessionId,
        messages,
      );

      setResult(aiResult);
      const newAiMsg: Message = { role: "model", parts: [aiResult] };
      setMessages((prev) => [...prev, newAiMsg]);

      if (!sessions.find((s) => s.session_id === currentSessionId)) {
        fetchSessions();
      }
      startCooldown(10);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Bağlantı hatası");
      setPrompt(currentPrompt);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    const newId = crypto.randomUUID();
    localStorage.setItem("chat_session_id", newId);
    setCurrentSessionId(newId);
    setPrompt("");
    setMessages([]);
    setResult("");
    setIsSidebarOpen(false);
  };

  const loadSession = async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    localStorage.setItem("chat_session_id", sessionId);
    setIsSidebarOpen(false);

    try {
      const historyData = await apiService.getHistory(sessionId);
      const reconstructedMessages: Message[] = [];
      historyData.forEach((row: { prompt: string; response: string }) => {
        reconstructedMessages.push({ role: "user", parts: [row.prompt] });
        reconstructedMessages.push({ role: "model", parts: [row.response] });
      });
      setMessages(reconstructedMessages);
      setResult("");
    } catch (err) {
      toast.error("Sohbet yüklenemedi");
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm("Bu sohbeti tamamen silmek istediğine emin misin?")) return;
    const loadingToast = toast.loading("Siliniyor...");

    try {
      await apiService.deleteSession(sessionId);
      setSessions((prev) =>
        prev.filter((item) => item.session_id !== sessionId),
      );

      if (currentSessionId === sessionId) handleNewChat();

      toast.dismiss(loadingToast);
      toast.success("Oturum başarıyla silindi! 🗑️");
    } catch (error) {
      const err = error as Error;
      toast.dismiss(loadingToast);
      toast.error(err.message || "Bağlantı hatası!");
    }
  };

  // UI'ın ihtiyaç duyduğu her şeyi dışarı aktarıyoruz
  return {
    prompt,
    setPrompt,
    result,
    loading,
    sessions,
    currentSessionId,
    cooldown,
    isSidebarOpen,
    setIsSidebarOpen,
    messages,
    generateContent,
    handleNewChat,
    loadSession,
    deleteSession,
  };
}
