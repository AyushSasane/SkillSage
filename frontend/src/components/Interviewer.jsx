import React, { useState, useRef } from "react";

const Interviewer = () => {
  const [audioSrc, setAudioSrc] = useState("");
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

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
  };

  const sendAudioToBackend = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.wav");

    const response = await fetch("http://localhost:8000/talk", {
      method: "POST",
      body: formData,
    });

    const audioBlobResponse = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlobResponse);
    setAudioSrc(audioUrl);

    // Reset chunks for next recording
    audioChunksRef.current = [];
  };

  const setStage = async (stage) => {
    await fetch(`http://localhost:8000/set_stage/${stage}`, {
      method: "POST",
    });
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Interviewer Bot</h1>
      <div>
        <button onClick={() => setStage("introduction")}>Introduction</button>
        <button onClick={() => setStage("behavioral")}>Behavioral</button>
        <button onClick={() => setStage("technical")}>Technical</button>
      </div>
      <div>
        {isRecording ? (
          <button onClick={stopRecording}>Stop Recording</button>
        ) : (
          <button onClick={startRecording}>Start Recording</button>
        )}
      </div>
      {audioSrc && (
        <div>
          <audio controls src={audioSrc} />
          <p>{text}</p>
        </div>
      )}
    </div>
  );
};

export default Interviewer;