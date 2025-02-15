from fastapi import FastAPI, UploadFile, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import openai
import os
import json
import requests
import logging
import tempfile
import asyncio
import firebase_admin
from firebase_admin import credentials, firestore

# Load environment variables
load_dotenv()

# Initialize Firebase Admin SDK
cred = credentials.Certificate("D:\AI-BASED CARRER COUNSELLING PLATFORM\AI Based Skill Assessment\AI Based Skill Assessment\serviceAccountKey.json")  # Update with the correct path to your service account key
firebase_admin.initialize_app(cred)

# Initialize OpenAI and ElevenLabs
openai.api_key = os.getenv("OPEN_AI_KEY")
openai.organization = os.getenv("OPEN_AI_ORGANIZATION")
elevenlabs_key = os.getenv("ELEVENLABS_KEY")

# Set up logging
logging.basicConfig(level=logging.ERROR, format="%(asctime)s - %(levelname)s - %(message)s")

app = FastAPI()

# Enable CORS for frontend integration
origins = [
    "http://localhost:5174",
    "http://localhost:5173",
    "http://localhost:8000",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["x-bot-text"]
)

DB_FILE = "database.json"
if not os.path.exists(DB_FILE):
    with open(DB_FILE, "w") as f:
        json.dump([], f)

@app.get("/")
async def root():
    return {"message": "Hello, World!"}

@app.post("/talk")
async def post_audio(file: UploadFile):
    """Handles user audio, transcribes it, generates GPT response, and converts to speech."""
    try:
        user_message = transcribe_audio(file)
        if not user_message:
            raise HTTPException(status_code=400, detail="Failed to transcribe audio.")

        chat_response = get_chat_response(user_message)
        if not chat_response:
            raise HTTPException(status_code=500, detail="Failed to generate chat response.")

        audio_output = text_to_speech(chat_response)
        if not audio_output:
            raise HTTPException(status_code=500, detail="Failed to generate audio response.")

        headers = {"x-bot-text": chat_response}
        return StreamingResponse(iter([audio_output]), media_type="audio/mpeg", headers=headers)

    except HTTPException as e:
        logging.error(f"❌ API Error: {e.detail}")
        raise e  # Pass the exception to return correct HTTP response
    except Exception as e:
        logging.error(f"❌ Unexpected Error: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")

@app.get("/clear")
async def clear_history():
    """Clears the chat history."""
    with open(DB_FILE, "w") as f:
        json.dump([], f)
    return {"message": "Chat history has been cleared"}

# WebSocket for Real-time Transcription
@app.websocket("/ws/transcribe")
async def websocket_endpoint(websocket: WebSocket):
    """Handles real-time transcription via WebSockets."""
    await websocket.accept()
    print("🔗 Client connected for live transcription...")

    try:
        while True:
            audio_chunk = await websocket.receive_bytes()  # Receive small audio chunk
            transcription = await transcribe_chunk(audio_chunk)
            if transcription:
                await websocket.send_text(transcription)  # Send partial transcript to client
    except WebSocketDisconnect:
        print("❌ Client disconnected.")
    except Exception as e:
        logging.error(f"❌ WebSocket Error: {str(e)}")
        await websocket.close()

# Functions
def transcribe_audio(file):
    """Transcribes full audio file using OpenAI Whisper API."""
    temp_filename = "temp_audio.wav"
    
    with open(temp_filename, "wb") as buffer:
        buffer.write(file.file.read())
    
    try:
        with open(temp_filename, "rb") as audio_file:
            transcript = openai.Audio.transcribe("whisper-1", audio_file)
            return transcript.get("text", "No transcription available")
    except openai.error.OpenAIError as e:
        logging.error(f"❌ OpenAI Whisper Error: {str(e)}")
        return None
    except Exception as e:
        logging.error(f"❌ Unexpected Transcription Error: {str(e)}")
        return None
    finally:
        os.remove(temp_filename)

async def transcribe_chunk(audio_chunk):
    """Transcribes a small chunk of audio using OpenAI Whisper."""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
            temp_audio.write(audio_chunk)
            temp_audio_path = temp_audio.name
        
        with open(temp_audio_path, "rb") as audio_file:
            response = openai.Audio.transcribe("whisper-1", audio_file)

        os.remove(temp_audio_path)  # Clean up temp file
        return response.get("text", "")
    except openai.error.OpenAIError as e:
        logging.error(f"❌ OpenAI Whisper Error: {str(e)}")
        return None
    except Exception as e:
        logging.error(f"❌ Unexpected Transcription Error: {str(e)}")
        return None

def get_chat_response(user_message):
    """Fetches response from OpenAI GPT and saves history."""
    messages = load_messages()
    messages.append({"role": "user", "content": user_message})

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages
        )
        gpt_response = response['choices'][0]['message']['content']
        save_messages(user_message, gpt_response)
        return gpt_response
    except openai.error.OpenAIError as e:
        logging.error(f"❌ OpenAI Chat Error: {str(e)}")
        return None
    except Exception as e:
        logging.error(f"❌ Unexpected GPT Error: {str(e)}")
        return None

def load_messages():
    """Loads message history from the JSON database."""
    try:
        with open(DB_FILE, "r") as file:
            data = json.load(file)
    except json.JSONDecodeError:
        data = []  # Reset if file is corrupted

    if not data:
        # Fetch user data from Firestore
        db = firestore.client()
        user_ref = db.collection('students').document('2BViK1cvx01mv3chYLl0')  # Use the provided document ID
        user_data = user_ref.get().to_dict()

        if user_data:
            name = user_data.get('name', 'Unknown')
            skills = user_data.get('skills', [])
            projects = user_data.get('projects', [])
            work_experience = user_data.get('workExperience', [])

            prompt = f"You are interviewing {name}. His skills include {', '.join(skills)} and projects are {', '.join(projects)}, he has worked in {', '.join(work_experience)}. Ask short questions that are relevant. Your name is Jasper. The user is {name}. Keep responses under 30 words and be funny sometimes."
        else:
            prompt = "You are interviewing the user for a front-end React developer position. Ask short questions that are relevant to a junior developer. Your name is Jasper. The user is Ayush. Keep responses under 30 words and be funny sometimes."

        data.append({
            "role": "system",
            "content": prompt
        })
    
    return data

def save_messages(user_message, gpt_response):
    """Saves chat messages to JSON file."""
    messages = load_messages()
    messages.append({"role": "user", "content": user_message})
    messages.append({"role": "assistant", "content": gpt_response})

    with open(DB_FILE, "w") as file:
        json.dump(messages, file, indent=4)

def text_to_speech(text):
    """Converts text to speech using ElevenLabs API."""
    voice_id = "29vD33N1CtxCmqQRPOHJ"

    body = {
        "text": text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.5,
            "style": 0.5,
            "use_speaker_boost": True
        }
    }

    headers = {
        "Content-Type": "application/json",
        "accept": "audio/mpeg",
        "xi-api-key": elevenlabs_key
    }

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

    try:
        response = requests.post(url, json=body, headers=headers)
        if response.status_code == 200:
            return response.content
        else:
            logging.error(f"❌ ElevenLabs API Error: {response.json()}")
            return None
    except requests.RequestException as e:
        logging.error(f"❌ ElevenLabs Connection Error: {str(e)}")
        return None
    except Exception as e:
        logging.error(f"❌ Unexpected TTS Error: {str(e)}")
        return None