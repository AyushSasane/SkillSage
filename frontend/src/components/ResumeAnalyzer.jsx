import React, { useState } from "react";
import axios from "axios";
import "../../css/ResumeAnalyzer.css"; // Import the CSS file

const ResumeAnalyzer = () => {
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysisType, setAnalysisType] = useState("Quick Scan");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleFileChange = (event) => {
    setResume(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!resume) {
      alert("Please upload a resume.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("jobDescription", jobDescription);
    formData.append("analysisType", analysisType);

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/analyze-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data.analysis);
    } catch (error) {
      console.error("Error analyzing resume:", error);
      alert("Failed to analyze the resume.");
    }
    setLoading(false);
  };

  return (
    <div className="resume-analyzer-container">
      <div className="resume-analyzer-card">
        <h1 className="resume-analyzer-title">ATS Resume Analyzer</h1>

        <form onSubmit={handleSubmit} className="resume-analyzer-form">
          {/* File Upload */}
          <div className="form-group">
            <label className="form-label">Upload Resume (PDF):</label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="form-input"
            />
          </div>

          {/* Job Description Input */}
          <div className="form-group">
            <label className="form-label">Job Description (Optional):</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="form-textarea"
              placeholder="Paste the job description here..."
            />
          </div>

          {/* Analysis Type Selector */}
          <div className="form-group">
            <label className="form-label">Select Analysis Type:</label>
            <select
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
              className="form-select"
            >
              <option value="Quick Scan">Quick Scan</option>
              <option value="Detailed Analysis">Detailed Analysis</option>
              <option value="ATS Optimization">ATS Optimization</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </form>

        {/* Result Display */}
        {result && (
          <div className="result-container">
            <h2 className="result-title">Analysis Results:</h2>
            <p className="result-text">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;


