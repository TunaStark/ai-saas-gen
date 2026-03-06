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

  // --- INITIALIZATION ---
  useEffect(() => {
    let storedSessionId = localStorage.getItem("chat_session_id");
    if (!storedSessionId) {
      storedSessionId = crypto.randomUUID();
      localStorage.setItem("chat_session_id", storedSessionId);
    }
    setCurrentSessionId(storedSessionId);
    fetchSessions();
  }, []);

  // --- FETCH CHAT SESSIONS ---
  const fetchSessions = async () => {
    try {
      const data = await apiService.getSessions();
      setSessions(data);
    } catch (err) {
      console.error(err);
    }
  };

  // --- COOLDOWN TIMER ---
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

  // --- GENERATE CONTENT (STREAMING LOGIC) ---
  const generateContent = async () => {
    if (!prompt || cooldown > 0) return;

    const currentPrompt = prompt;
    setPrompt("");

    // 1. Add the user message to the UI immediately
    const newUserMsg: Message = { role: "user", parts: [currentPrompt] };
    
    // 2. Add an EMPTY model message placeholder. 
    // This allows ChatArea to render the AI bubble while streaming.
    const emptyAiMsg: Message = { role: "model", parts: [""] };

    // Update messages array with both user and empty AI placeholder
    setMessages((prev) => [...prev, newUserMsg, emptyAiMsg]);
    
    setLoading(true);
    setResult(""); // Reset streaming text buffer

    try {
      // Pass the current messages (before adding the new ones to history) to the API
      // generateStream takes a 4th parameter: the onChunk callback
      const fullAiResponse = await apiService.generateStream(
        currentPrompt,
        currentSessionId,
        messages, 
        (chunkText) => {
          // As chunks arrive, append them to the 'result' state
          setResult((prev) => prev + chunkText);
        }
      );

      // Once the stream completes, replace the empty AI placeholder with the full response
      setMessages((prev) => {
        const updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 1].parts = [fullAiResponse];
        return updatedMessages;
      });

      // Refresh sidebar if this was the first message of a new session
      if (!sessions.find((s) => s.session_id === currentSessionId)) {
        fetchSessions();
      }
      
      startCooldown(10);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Connection error occurred.");
      setPrompt(currentPrompt); // Restore user prompt on error
      
      // Remove the empty AI placeholder on error
      setMessages((prev) => prev.slice(0, -1)); 
    } finally {
      setLoading(false);
      setResult(""); // Clear the active stream buffer
    }
  };

  // --- CREATE NEW CHAT ---
  const handleNewChat = () => {
    const newId = crypto.randomUUID();
    localStorage.setItem("chat_session_id", newId);
    setCurrentSessionId(newId);
    setPrompt("");
    setMessages([]);
    setResult("");
    setIsSidebarOpen(false);
  };

  // --- LOAD EXISTING SESSION ---
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("Failed to load chat history.");
    }
  };

  // --- DELETE SESSION ---
  const deleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to completely delete this chat?")) return;
    const loadingToast = toast.loading("Deleting...");

    try {
      await apiService.deleteSession(sessionId);
      setSessions((prev) =>
        prev.filter((item) => item.session_id !== sessionId)
      );

      if (currentSessionId === sessionId) handleNewChat();

      toast.dismiss(loadingToast);
      toast.success("Session deleted successfully! 🗑️");
    } catch (error) {
      const err = error as Error;
      toast.dismiss(loadingToast);
      toast.error(err.message || "Connection error!");
    }
  };

  // --- EXPORT STATE & HANDLERS ---
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