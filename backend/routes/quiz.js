// // quiz.js
// import express from 'express';
// import { db } from '../firebaseAdmin.js'; // Firebase Admin SDK for Firestore

// const router = express.Router();

// // Quiz submission endpoint
// router.post('/submit-quiz', async (req, res) => {
//   const { prn, quizName, score } = req.body;

//   try {
//     if (!prn || !quizName || score === undefined) {
//       return res.status(400).json({ message: 'All fields are required.' });
//     }

//     // Quiz data to be added
//     const quizData = {
//       quizName,
//       score,
//       timestamp: new Date().toISOString(), // Add timestamp
//     };

//     // Fetch the student document by PRN
//     const studentRef = db.collection('students').where('prn', '==', prn);
//     const studentSnapshot = await studentRef.get();

//     if (studentSnapshot.empty) {
//       return res.status(404).json({ message: 'Student not found.' });
//     }

//     const studentDocId = studentSnapshot.docs[0].id; // Get the document ID of the student
//     const studentDocRef = db.collection('students').doc(studentDocId);

//     // Update the student's document with the new quiz history
//     await studentDocRef.update({
//       quizHistory: admin.firestore.FieldValue.arrayUnion(quizData), // Append to the quizHistory array
//     });

//     res.status(201).json({ message: 'Quiz submitted successfully.' });
//   } catch (error) {
//     console.error('Error submitting quiz:', error);
//     res.status(500).json({ message: 'An error occurred while submitting the quiz.' });
//   }
// });

// export const quizRoute = router;

import express from "express";
import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

// ✅ Generate Quiz Questions
router.get("/generate-quiz", async (req, res) => {
  const { category } = req.query;

  if (!category) {
    return res.status(400).json({ message: "Category is required." });
  }

  try {
    const prompt = `Generate 10 multiple-choice questions about ${category} with 4 options each and indicate the correct answer. Format:
    [
      {
        "question": "What is Linux?",
        "options": { "A": "An OS", "B": "A programming language", "C": "A database", "D": "A cloud service" },
        "correct_answer": "A"
      }
    ]`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000, // Increased max_tokens to accommodate more questions
      temperature: 0.7,
    });

    console.log("OpenAI API Response:", response);

    const textResponse = response.choices[0]?.message?.content?.trim();

    if (!textResponse) {
      console.error("OpenAI returned empty response.");
      return res.status(500).json({ message: "Failed to generate quiz." });
    }

    let quizQuestions;
    try {
      quizQuestions = JSON.parse(textResponse);
    } catch (jsonError) {
      console.error("JSON Parsing Error:", jsonError);
      return res.status(500).json({ message: "Invalid response format from OpenAI." });
    }

    res.json(quizQuestions);
  } catch (error) {
    console.error("Error generating quiz:", error.response?.data || error.message);
    res.status(500).json({ message: "Error generating quiz.", error: error.message });
  }
});

export const quizRoute = router;