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
  /**
   * 1. Fetch all chat sessions
   * Retrieves the list of sessions to display in the sidebar.
   */
  async getSessions(): Promise<SessionItem[]> {
    const res = await fetch(`${API_URL}/api/sessions`);
    if (!res.ok) throw new Error("Failed to fetch sessions");
    return res.json();
  },

  /**
   * 2. Fetch session history
   * Retrieves the full chat history for a specific session ID.
   */
  async getHistory(sessionId: string) {
    const res = await fetch(`${API_URL}/api/history/${sessionId}`);
    if (!res.ok) throw new Error("Failed to load chat history");
    return res.json();
  },

  /**
   * 3. Send Message and Stream Response
   * Sends the user prompt to the backend and reads the stream chunk by chunk.
   * @param onChunk - Callback function triggered every time a new word/chunk arrives.
   */
  async generateStream(
    prompt: string,
    sessionId: string,
    history: Message[],
    onChunk: (chunkText: string) => void
  ): Promise<string> {
    const res = await fetch(`${API_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, session_id: sessionId, history }),
    });

    if (!res.ok) {
      throw new Error("An error occurred while generating the AI response.");
    }

    // Connect to the stream reader
    const reader = res.body?.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullResponse = "";

    if (reader) {
      while (true) {
        // Read the stream chunk by chunk
        const { done, value } = await reader.read();
        
        // If the stream is finished, break the loop
        if (done) break;

        // Decode the binary chunk into a readable string
        const chunkText = decoder.decode(value, { stream: true });
        fullResponse += chunkText;
        
        // Send the chunk immediately to the UI component
        onChunk(chunkText);
      }
    }

    // Return the complete response string once the stream is fully closed
    return fullResponse;
  },

  /**
   * 4. Delete Session
   * Deletes a specific session and all its associated chat history.
   */
  async deleteSession(sessionId: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/sessions/${sessionId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete the session.");
  },
};