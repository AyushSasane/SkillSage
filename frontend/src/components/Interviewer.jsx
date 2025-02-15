import React, { useState, useRef } from "react";
import axios from "axios";
import { Button, CircularProgress, Box, Typography } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DeleteIcon from "@mui/icons-material/Delete";

const Interviewer = () => {
  const [botText, setBotText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // Typing indicator state
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsTyping(true); // Show typing indicator
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        sendAudioToBot(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("❌ Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToBot = async (audioBlob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.wav");

    try {
      const response = await axios.post("http://localhost:8000/talk", formData, {
        responseType: "blob",
        headers: { Accept: "audio/mpeg" },
      });

      // Extract bot response text
      const botResponseText = response.headers["x-bot-text"] || "No response available";
      setBotText(botResponseText);
      setIsTyping(false); // Hide typing indicator

      // Create an audio URL
      const responseAudioBlob = new Blob([response.data], { type: "audio/mpeg" });
      const audioObjectUrl = URL.createObjectURL(responseAudioBlob);
      setAudioUrl(audioObjectUrl);

      if (audioRef.current) {
        audioRef.current.src = audioObjectUrl;
        audioRef.current.play().catch((error) => {
          console.error("❌ Playback failed. User interaction required:", error);
        });
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setIsTyping(false); // Hide typing indicator even if there's an error
    }
  };

  const clearChatHistory = async () => {
    try {
      await axios.get("http://localhost:8000/clear");
      setBotText("");
      setAudioUrl("");
    } catch (error) {
      console.error("❌ Error clearing chat history:", error);
    }
  };

  return (
    <Box sx={styles.container}>
      <Box sx={styles.card}>
        <Typography variant="h4" sx={styles.heading}>
          Interviewer Bot
        </Typography>

        <Button
          onClick={isRecording ? stopRecording : startRecording}
          variant="contained"
          color={isRecording ? "error" : "primary"}
          startIcon={isRecording ? <StopIcon /> : <MicIcon />}
          sx={styles.recordButton}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </Button>

        {isTyping && (
          <Box sx={styles.typingIndicator}>
            <CircularProgress size={20} />
            <Typography variant="body1" sx={{ marginLeft: "8px" }}>
              Bot is typing...
            </Typography>
          </Box>
        )}

        <Box sx={styles.chatContainer}>
          {botText && (
            <Box sx={styles.chatBubble}>
              <Typography>{botText}</Typography>
            </Box>
          )}
        </Box>

        {audioUrl && (
          <>
            <audio ref={audioRef} controls style={{ marginTop: "10px" }} />
            <Button
              onClick={() => audioRef.current?.play()}
              variant="contained"
              color="success"
              startIcon={<PlayArrowIcon />}
              sx={styles.playButton}
            >
              Play Bot Response
            </Button>
          </>
        )}

        <Button
          onClick={clearChatHistory}
          variant="contained"
          color="secondary"
          startIcon={<DeleteIcon />}
          sx={styles.clearButton}
        >
          Clear Chat History
        </Button>
      </Box>
    </Box>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f7f7f7",
    fontFamily: "'Roboto', sans-serif",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    padding: "30px",
    width: "400px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  heading: {
    fontSize: "24px",
    color: "#333",
    marginBottom: "20px",
    fontWeight: "600",
  },
  recordButton: {
    width: "100%",
    marginBottom: "15px",
  },
  typingIndicator: {
    display: "flex",
    alignItems: "center",
    marginTop: "10px",
    color: "#777",
  },
  chatContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: "15px",
    marginTop: "20px",
    width: "100%",
  },
  chatBubble: {
    backgroundColor: "#e0f7fa",
    borderRadius: "20px",
    padding: "15px",
    width: "80%",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
  },
  playButton: {
    width: "100%",
    marginTop: "10px",
  },
  clearButton: {
    width: "100%",
    marginTop: "10px",
  },
};

export default Interviewer;
