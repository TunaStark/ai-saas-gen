const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface SessionItem {
  session_id: string;
  title: string;
  created_at: string;
}

export interface Message {
  role: "user" | "model";
  parts: string[];
}

export const apiService = {
  // 1. Oturumları Getir
  async getSessions(): Promise<SessionItem[]> {
    const res = await fetch(`${API_URL}/api/sessions`);
    if (!res.ok) throw new Error("Oturumlar getirilemedi");
    return res.json();
  },

  // 2. Geçmişi Getir
  async getHistory(sessionId: string) {
    const res = await fetch(`${API_URL}/api/history/${sessionId}`);
    if (!res.ok) throw new Error("Sohbet yüklenemedi");
    return res.json();
  },

  // 3. Mesaj Gönder
  async generate(prompt: string, sessionId: string, history: Message[]): Promise<string> {
    const res = await fetch(`${API_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, session_id: sessionId, history }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Hata oluştu");
    return data.result;
  },

  // 4. Oturum Sil
  async deleteSession(sessionId: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/sessions/${sessionId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Silinemedi bir hata oluştu.");
  },
};