// import express from "express";
// import multer from "multer";
// import * as pdfjs from "pdfjs-dist";
// import dotenv from "dotenv";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// import { getDocument } from "pdfjs-dist/legacy/build/pdf.js";

// dotenv.config();

// const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// // Function to get AI response
// const getGeminiOutput = async (pdfText, prompt) => {
//   try {
//     const result = await model.generateContent([pdfText, prompt]);
//     return result.response.text();
//   } catch (error) {
//     console.error("Gemini API Error:", error);
//     return "Error generating response.";
//   }
// };

// // Function to extract text from PDF using pdfjs-dist
// const extractTextFromPDF = async (buffer) => {
//   const loadingTask = pdfjs.getDocument({ data: buffer });
//   const pdfDocument = await loadingTask.promise;
//   let text = "";

//   for (let i = 1; i <= pdfDocument.numPages; i++) {
//     const page = await pdfDocument.getPage(i);
//     const content = await page.getTextContent();
//     text += content.items.map((item) => item.str).join(" ");
//   }

//   return text;
// };

// // Route to analyze ATS score
// router.post("/analyze-resume", upload.single("resume"), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: "Please upload a resume (PDF)." });
//   }

//   try {
//     // Extract text from the uploaded PDF
//     const pdfText = await extractTextFromPDF(req.file.buffer);
//     const { jobDescription, analysisType } = req.body;

//     let prompt = "";

//     if (analysisType === "Quick Scan") {
//       prompt = `
//         You are ResumeChecker, an expert in resume analysis. Provide a quick scan:
//         1. Identify the most suitable profession.
//         2. List 3 key strengths.
//         3. Suggest 2 quick improvements.
//         4. Provide an ATS score out of 100.
//         Resume: ${pdfText}
//         Job Description: ${jobDescription}
//       `;
//     } else if (analysisType === "Detailed Analysis") {
//       prompt = `
//         You are ResumeChecker, an expert in resume analysis. Provide a detailed review:
//         1. Identify the most suitable profession.
//         2. List 5 strengths.
//         3. Suggest 3-5 areas for improvement.
//         4. Rate aspects like Impact, Brevity, Style, Structure, and Skills.
//         5. Provide a review of each section (Summary, Experience, Education).
//         6. Give an ATS score breakdown.
//         Resume: ${pdfText}
//         Job Description: ${jobDescription}
//       `;
//     } else {
//       prompt = `
//         You are ResumeChecker, an expert in ATS optimization. Analyze and optimize:
//         1. Identify missing keywords from the job description.
//         2. Suggest restructuring for better ATS readability.
//         3. Recommend keyword density improvements.
//         4. Provide 3-5 bullet points for resume tailoring.
//         5. Give an ATS compatibility score.
//         Resume: ${pdfText}
//         Job Description: ${jobDescription}
//       `;
//     }

//     const response = await getGeminiOutput(pdfText, prompt);
//     res.json({ analysis: response });
//   } catch (error) {
//     console.error("Error processing resume:", error);
//     res.status(500).json({ error: "Internal server error." });
//   }
// });

// export const ATSScoreRoute = router;


import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdfjs from "pdfjs-dist/legacy/build/pdf.js"; // ✅ Import the default export
const { getDocument } = pdfjs; // ✅ Destructure `getDocument` from the default export

dotenv.config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to get AI response
const getGeminiOutput = async (pdfText, prompt) => {
  try {
    const result = await model.generateContent([pdfText, prompt]);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating response.";
  }
};

// Function to extract text from PDF
const extractTextFromPDF = async (buffer) => {
  const loadingTask = getDocument({ data: buffer }); // ✅ Use `getDocument` directly
  const pdfDocument = await loadingTask.promise;
  let text = "";

  for (let i = 1; i <= pdfDocument.numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(" ");
  }

  return text;
};

// Route to analyze ATS score
router.post("/analyze-resume", upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Please upload a resume (PDF)." });
  }

  try {
    const pdfText = await extractTextFromPDF(req.file.buffer);
    const { jobDescription, analysisType } = req.body;

    let prompt = "";

    if (analysisType === "Quick Scan") {
      prompt = `
        You are ResumeChecker, an expert in resume analysis. Provide a quick scan:
        1. Identify the most suitable profession.
        2. List 3 key strengths.
        3. Suggest 2 quick improvements.
        4. Provide an ATS score out of 100.
        Resume: ${pdfText}
        Job Description: ${jobDescription}
      `;
    } else if (analysisType === "Detailed Analysis") {
      prompt = `
        You are ResumeChecker, an expert in resume analysis. Provide a detailed review:
        1. Identify the most suitable profession.
        2. List 5 strengths.
        3. Suggest 3-5 areas for improvement.
        4. Rate aspects like Impact, Brevity, Style, Structure, and Skills.
        5. Provide a review of each section (Summary, Experience, Education).
        6. Give an ATS score breakdown.
        Resume: ${pdfText}
        Job Description: ${jobDescription}
      `;
    } else {
      prompt = `
        You are ResumeChecker, an expert in ATS optimization. Analyze and optimize:
        1. Identify missing keywords from the job description.
        2. Suggest restructuring for better ATS readability.
        3. Recommend keyword density improvements.
        4. Provide 3-5 bullet points for resume tailoring.
        5. Give an ATS compatibility score.
        Resume: ${pdfText}
        Job Description: ${jobDescription}
      `;
    }

    const response = await getGeminiOutput(pdfText, prompt);
    res.json({ analysis: response });
  } catch (error) {
    console.error("Error processing resume:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

export const ATSScoreRoute = router;