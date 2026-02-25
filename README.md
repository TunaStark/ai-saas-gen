# 🚀 AI Assistant Studio (Full-Stack AI SaaS)

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini_2.5-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A modern, context-aware artificial intelligence assistant powered by the **Google Gemini 2.5** infrastructure. It features real-time data streaming and session-based memory.

This project bridges modern web technologies (**Next.js & FastAPI**) to deliver a fluid, professional, and ChatGPT-like user experience.

![Project Screenshot](./frontend/public/ai-preview.png)

---

## ✨ Key Features

* 🧠 **Context-Aware Memory:** It doesn't just answer single queries; it remembers the entire session history to generate intelligent, context-driven responses.
* 🌊 **Real-Time Streaming:** AI responses are streamed to the client with a smooth "typewriter" effect, simulating a natural conversational flow.
* 📝 **Advanced Markdown Rendering:** Flawlessly renders code blocks (with syntax highlighting), tables, bold text, and lists.
* 📂 **Session Management:** Conversations never mix. Each chat is grouped under its own unique ID and securely stored for easy future retrieval.
* 📋 **One-Click Copy:** Instantly copy long AI responses or complex code blocks to your clipboard with a single click.
* 📱 **Fully Responsive UI:** A flawless Tailwind CSS architecture featuring a collapsible hamburger menu on mobile and an expansive layout on desktop.
* 🍞 **Elegant Notifications:** Real-time feedback for user actions (deletions, connection errors, etc.) presented as sleek pop-ups via React Hot Toast.

---

## 🛠️ Tech Stack

### Frontend (Client)
* **Framework:** [Next.js 14](https://nextjs.org/) (App Router) & React
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Markdown:** `react-markdown`, `remark-gfm`, `@tailwindcss/typography`
* **Notifications:** `react-hot-toast`

### Backend (Server & API)
* **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
* **AI Model:** Google Gemini API (`gemini-2.5-flash`)
* **Database:** Supabase (PostgreSQL)

---

## 🚀 Getting Started (Local Development)

Follow these steps to run the project on your local machine.

### 1. Clone the Repository
```bash
git clone https://github.com/TunaStark/ai-saas-gen.git
cd ai-saas-gen
```

### 2. Backend Setup
```bash
cd backend

# Install required Python dependencies
pip install fastapi uvicorn pydantic google-genai supabase python-dotenv

# Create a .env file and add your API keys
# GEMINI_API_KEY=your_api_key
# SUPABASE_URL=your_supabase_url
# SUPABASE_KEY=your_supabase_key

# Start the FastAPI server
uvicorn main:app --reload
```
*The backend server will start running at `http://127.0.0.1:8000`.*

### 3. Frontend Setup
```bash
cd ../frontend

# Install Node dependencies
npm install

# Create a .env.local file (if applicable)
# NEXT_PUBLIC_API_URL=http://127.0.0.1:8000

# Start the Next.js development server
npm run dev
```
*The frontend application will be available at `http://localhost:3000`.*

---

## 🗺️ Roadmap
- [x] Core Q&A API integration
- [x] Supabase database integration
- [x] Markdown rendering support
- [x] Real-time streaming (Typewriter effect)
- [x] Session-based memory management
- [ ] User Authentication (Supabase Auth / NextAuth)
- [ ] Speech-to-Text command support
- [ ] Document chat (PDF parsing & RAG)