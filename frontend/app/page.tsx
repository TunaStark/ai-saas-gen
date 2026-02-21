"use client";

import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import { useChat } from "../hooks/useChat"; 

export default function Home() {
  const chatLogic = useChat();

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar
        sessions={chatLogic.sessions}
        currentSessionId={chatLogic.currentSessionId}
        onNewChat={chatLogic.handleNewChat}
        onLoadSession={chatLogic.loadSession}
        isOpen={chatLogic.isSidebarOpen} 
        close={() => chatLogic.setIsSidebarOpen(false)} 
        onDelete={chatLogic.deleteSession}
      />
      
      <ChatArea
        recentPrompt=""
        messages={chatLogic.messages}
        prompt={chatLogic.prompt}
        setPrompt={chatLogic.setPrompt}
        result={chatLogic.result}
        loading={chatLogic.loading}
        onGenerate={chatLogic.generateContent}
        cooldown={chatLogic.cooldown}
        onOpenSidebar={() => chatLogic.setIsSidebarOpen(true)}
      />
    </div>
  );
}