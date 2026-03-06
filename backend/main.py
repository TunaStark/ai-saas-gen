import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv  # type: ignore
from supabase import create_client, Client  # type: ignore

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
    Fetches all chat sessions directly from the 'sessions' table. 
    Fast, relational, and highly scalable!
    """
    try:
        # We NO LONGER download all history. We just ask the 'sessions' table!
        response = supabase.table("sessions").select("*").order("created_at", desc=True).execute()
        return response.data
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

# 🌟 THE STREAMING & DB INSERT LOGIC
async def generate_and_stream(request: AIRequest):
    """
    Streams Gemini response chunk by chunk.
    Creates a new Session if it doesn't exist, then saves the History.
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
        
        response_stream = chat.send_message_stream(request.prompt)
        full_response = ""
        
        for chunk in response_stream:
            text_chunk = chunk.text
            full_response += text_chunk
            yield text_chunk

        # Once the stream is done, save the interaction to Supabase
        try:
            # 1. Check if this session already exists in the "sessions" table
            session_check = supabase.table("sessions").select("session_id").eq("session_id", request.session_id).execute()
            
            # If not (new chat), insert the title into "sessions" table first!
            if not session_check.data:
                supabase.table("sessions").insert({
                    "session_id": request.session_id,
                    "title": request.prompt 
                }).execute()

            # 2. Then, insert the message into the "history" table
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
    """Returns a StreamingResponse to send the AI response character by character."""
    return StreamingResponse(generate_and_stream(request), media_type="text/plain")
    
@app.delete("/api/sessions/{session_id}")
async def delete_session(session_id: str):
    """
    Deletes a session from the 'sessions' table. 
    Thanks to 'ON DELETE CASCADE' in SQL, all related history is automatically wiped!
    """
    try:
        supabase.table("sessions").delete().eq("session_id", session_id).execute()
        return {"message": "Session deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))