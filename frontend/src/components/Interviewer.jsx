import React, { useState, useRef } from "react";
import "../../css/Interviewer.css";

const Interviewer = () => {
  const [audioSrc, setAudioSrc] = useState("");
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };
    mediaRecorderRef.current.onstop = sendAudioToBackend;
    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setIsLoading(true);
  };

  const sendAudioToBackend = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.wav");

    try {
      const response = await fetch("http://localhost:8000/talk", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      const byteCharacters = atob(data.audio);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const audioBlobResponse = new Blob([byteArray], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlobResponse);

      setAudioSrc(audioUrl);
      setText(data.text);
    } catch (error) {
      console.error("Error sending audio to backend:", error);
    } finally {
      setIsLoading(false);
      audioChunksRef.current = [];
    }
  };

  const setStage = async (stage) => {
    setIsLoading(true); // Show loading state
    await fetch(`http://localhost:8000/set_stage/${stage}`, {
      method: "POST",
    });
    setIsLoading(false); // Hide loading state
  };

  return (
    <div className="interviewer-container">
      <div className="interviewer-header">
        <h1>Interviewer Bot</h1>
        <p>Practice your interview skills with AI</p>
      </div>
      <div className="buttons-container">
        <button
          className="stage-button"
          onClick={() => setStage("introduction")}
          disabled={isLoading}
        >
          Introduction
          {isLoading && <span className="button-loading" />}
        </button>
        <button
          className="stage-button"
          onClick={() => setStage("behavioral")}
          disabled={isLoading}
        >
          Behavioral
          {isLoading && <span className="button-loading" />}
        </button>
        <button
          className="stage-button"
          onClick={() => setStage("technical")}
          disabled={isLoading}
        >
          Technical
          {isLoading && <span className="button-loading" />}
        </button>
      </div>
      <button
        className="recording-button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isLoading}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
        {isLoading && <span className="button-loading" />}
      </button>
      {audioSrc && (
        <div className="audio-section">
          <h3>Your Response</h3>
          <audio
            ref={audioRef}
            controls
            src={audioSrc}
            autoPlay
          />
          <div className="transcribed-text">{text}</div>
        </div>
      )}
    </div>
  );
};

export default Interviewer;