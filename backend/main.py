import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv # type: ignore
from supabase import create_client, Client # type: ignore

# Load environment variables
load_dotenv()

# --- API KEY & DB CONFIGURATION ---
api_key = os.getenv("GEMINI_API_KEY")
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not api_key:
    raise ValueError("Missing GEMINI_API_KEY environment variable!")
if not supabase_url or not supabase_key:
    raise ValueError("Missing SUPABASE credentials in environment variables!")

# Initialize clients
client = genai.Client(api_key=api_key)
supabase: Client = create_client(supabase_url, supabase_key)

# Initialize FastAPI App
app = FastAPI()

# Setup CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELS ---
class AIRequest(BaseModel):
    prompt: str
    session_id: str
    history: list = []

# --- ENDPOINTS ---

@app.get("/")
def read_root():
    """Health check endpoint to verify the API status."""
    return {"status": "AI Service is Up and Running 🚀"} 

@app.get("/api/sessions")
def get_sessions():
    """
    Retrieves all chat sessions from Supabase.
    Groups history rows by session_id and uses the very first prompt as the session title.
    """
    try:
        # Fetch all history ordered by creation time (oldest to newest)
        response = supabase.table("history").select("*").order("created_at", desc=False).execute()
        
        # Group data by session_id using Python
        sessions = {}
        for row in response.data:
            sid = row["session_id"]
            # If the session is seen for the first time, set the first prompt as title
            if sid not in sessions:
                sessions[sid] = {
                    "session_id": sid,
                    "title": row["prompt"], 
                    "created_at": row["created_at"]
                }
        
        # Convert dictionary to list and sort by created_at (newest on top)
        session_list = list(sessions.values())
        session_list.sort(key=lambda x: x["created_at"], reverse=True)
        
        return session_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history/{session_id}")
def get_session_history(session_id: str):
    """Retrieves the full chat history for a specific session."""
    try:
        response = supabase.table("history")\
            .select("*")\
            .eq("session_id", session_id)\
            .order("created_at", desc=False)\
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 🌟 THE NEW STREAMING LOGIC
async def generate_and_stream(request: AIRequest):
    """
    Generator function that streams Gemini response chunk by chunk.
    Also saves the complete response to Supabase after the stream finishes.
    """
    formatted_history = []
    for msg in request.history:
        formatted_history.append({
            "role": msg["role"],
            "parts": [{"text": part} for part in msg["parts"]]
        })
        
    try:
        chat = client.chats.create(
            model='gemini-2.5-flash',
            history=formatted_history
        )
        
        # Request a streamed response from Gemini
        response_stream = chat.send_message_stream(request.prompt)
        
        full_response = ""
        
        # Yield each chunk as it arrives to the client
        for chunk in response_stream:
            text_chunk = chunk.text
            full_response += text_chunk
            yield text_chunk

        # Once the stream is done, save the full interaction to Supabase
        try:
            supabase.table("history").insert({
                "prompt": request.prompt,
                "response": full_response,
                "session_id": request.session_id
            }).execute()
        except Exception as db_error:
            print(f"⚠️ DB Error: {db_error}")

    except Exception as e:
        yield f"\n[Error: {str(e)}]"

@app.post("/api/generate")
async def generate_content(request: AIRequest):
    """
    Receives user prompt and history, then returns a StreamingResponse
    to send the AI response back character by character (or chunk by chunk).
    """
    # We use text/event-stream or text/plain depending on how frontend consumes it.
    # text/plain is usually easier to parse with a basic ReadableStream on the frontend.
    return StreamingResponse(generate_and_stream(request), media_type="text/plain")
    
@app.delete("/api/sessions/{session_id}")
async def delete_session(session_id: str):
    """Deletes all chat history rows associated with a specific session_id."""
    try:
        supabase.table("history").delete().eq("session_id", session_id).execute()
        return {"message": "Session deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))