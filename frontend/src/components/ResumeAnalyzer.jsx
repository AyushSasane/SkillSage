import React, { useState } from "react";
import axios from "axios";
import "../../css/ResumeAnalyzer.css"; // Import the CSS file
import ReactMarkdown from "react-markdown";

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

  // Function to clean content using regex
  const cleanContent = (text) => {
    // Remove unwanted characters like *, #, etc.
    return text.replace(/[*#]/g, "").trim();
  };

  // Function to split the result into sections
  const splitResultIntoSection = (result) => {
    const sections = result.split(/\d+\.\s+/).filter(section => section.trim() !== "");
    return sections.map((section, index) => ({
      title: `${index + 1}. ${cleanContent(section.split("\n")[0])}`, // Clean the title
      content: cleanContent(section.split("\n").slice(1).join("\n")), // Clean the content
    }));
  };

  const sections = result ? splitResultIntoSection(result) : [];

  return (
    <div className="resume-analyzer-container">
      <div className="resume-analyzer-card">
        <h1 className="resume-analyzer-title">ATS Resume Analyzer</h1>

        <form onSubmit={handleSubmit} className="resume-analyzer-form">
          {/* File Upload */}
          <div className="form-group">
            <label className="form-label">Upload Resume (PDF):</label>
            <div className="custom-file-upload">
              <input
                type="file"
                id="file-upload"
                accept=".pdf"
                onChange={handleFileChange}
                className="form-input"
              />
              <label htmlFor="file-upload" className="custom-file-button">
                {resume ? resume.name : "Choose File"}
              </label>
            </div>
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
            <div className="result-cards">
              {sections.map((section, index) => (
                <div key={index} className="result-card">
                  <h3 className="result-card-title">{section.title}</h3>
                  <div className="result-card-content">
                    <ReactMarkdown
                      components={{
                        h1: ({ node, ...props }) => <h1 className="text-xl font-bold" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-lg font-semibold" {...props} />,
                        p: ({ node, ...props }) => <p className="text-gray-700" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc list-inside" {...props} />,
                        li: ({ node, ...props }) => <li className="ml-4" {...props} />,
                      }}
                    >
                      {section.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;