from fastapi import FastAPI, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import openai
import os
import json
import requests
import firebase_admin
from firebase_admin import credentials, firestore
import base64  # Add this line

# Load environment variables
load_dotenv()

# Initialize Firebase
cred = credentials.Certificate("D:\AI-BASED CARRER COUNSELLING PLATFORM\AI Based Skill Assessment\AI Based Skill Assessment\serviceAccountKey.json")  # Replace with your Firebase service account key
firebase_admin.initialize_app(cred)
db = firestore.client()

openai.api_key = os.getenv("OPEN_AI_KEY")
openai.organization = os.getenv("OPEN_AI_ORGANIZATION")
elevenlabs_key = os.getenv("ELEVENLABS_KEY")

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
)

# Ensure database.json exists
DB_FILE = "database.json"
if not os.path.exists(DB_FILE):
    with open(DB_FILE, "w") as f:
        json.dump([], f)

@app.get("/")
async def root():
    return {"message": "Hello, World!"}

@app.post("/talk")
async def post_audio(file: UploadFile):
    user_message = transcribe_audio(file)
    chat_response = get_chat_response(user_message)

    # Convert chat response to speech
    audio_output = text_to_speech(chat_response)

    if not audio_output:
        return JSONResponse({"error": "Failed to generate audio"}, status_code=500)

    # Encode audio to base64 for JSON response
    audio_base64 = base64.b64encode(audio_output).decode("utf-8")

    # Return both audio and text in the response
    return JSONResponse({
        "audio": audio_base64,  # Base64-encoded audio
        "text": chat_response
    })

@app.post("/set_stage/{stage}")
async def set_stage(stage: str):
    """Sets the interview stage and updates the system prompt."""
    messages = load_messages()

    # Fetch student data from Firebase
    student_data = get_student_data("Sr6Hjgag6OYyW7e0Rz2n")

    # Clear previous messages and set the stage-specific prompt
    messages = [{
        "role": "system",
        "content": get_stage_prompt(stage, student_data)
    }]

    with open(DB_FILE, "w") as file:
        json.dump(messages, file, indent=4)

    return {"message": f"Interview stage set to {stage}"}

@app.get("/clear")
async def clear_history():
    """Clears the chat history."""
    with open(DB_FILE, "w") as f:
        json.dump([], f)
    return {"message": "Chat history has been cleared"}

# Functions
def transcribe_audio(file):
    """Transcribes audio file using OpenAI Whisper API."""
    with open(file.filename, "wb") as buffer:
        buffer.write(file.file.read())
    
    with open(file.filename, "rb") as audio_file:
        transcript = openai.Audio.transcribe("whisper-1", audio_file)
    
    return transcript.get("text", "No transcription available")

def get_chat_response(user_message):
    """Fetches response from OpenAI GPT and saves history."""
    messages = load_messages()
    messages.append({"role": "user", "content": user_message})

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages
    )

    gpt_response = response['choices'][0]['message']['content']

    # Save messages
    save_messages(user_message, gpt_response)

    return gpt_response

def load_messages():
    """Loads message history from the JSON database."""
    with open(DB_FILE, "r") as file:
        try:
            data = json.load(file)
        except json.JSONDecodeError:
            data = []  # Reset if file is corrupted

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
    voice_id = "pNInz6obpgDQGcFmaJgB"  # Corrected voice ID

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
            print("Error:", response.json())
            return b""  # Return empty audio in case of failure
    except Exception as e:
        print("Exception:", e)
        return b""

def get_stage_prompt(stage, student_data):
    """Returns a stage-specific prompt for the interview."""
    name = student_data.get("name", "the candidate")
    skills = ", ".join(student_data.get("skills", []))
    projects = ", ".join(student_data.get("projects", []))
    work_experience = "\n".join(student_data.get("workExperience", []))

    if stage == "introduction":
        return (
            f"You are interviewing {name}. "
            "You're an interviewer Jasper. Start with your own introduction. Ask the user to introduce themselves. "
            "Keep responses under 30 words."
        )
    elif stage == "behavioral":
        return (
            f"You are now in the behavioral stage of the interview. "
            f"Ask questions about how {name} has handled challenges, worked in teams, or resolved conflicts based on their work experiences: {work_experience}. "
            "Keep responses under 30 words."
        )
    elif stage == "technical":
        return (
            f"You are now in the technical stage of the interview. Take the interview "
            f"Ask questions about {name}'s skills: {skills}. "
            "Keep responses under 30 words. Take the interview when the user says hello."
        )
    else:
        return "You are interviewing the user for a front-end React developer position. Ask short questions. Keep responses under 30 words."

def get_student_data(doc_id):
    """Fetches student data from Firebase."""
    doc_ref = db.collection("students").document(doc_id)
    doc = doc_ref.get()
    if doc.exists:
        return doc.to_dict()
    else:
        return {}