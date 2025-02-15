import express from 'express';
import axios from 'axios';
import pdf from 'pdf-parse';
import { db, bucket } from '../firebaseAdmin.js'; // Firebase Admin SDK
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const router = express.Router();

// Initialize OpenAI API using environment variable
const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });

/**
 * ATS Scoring API
 * @route POST /ats-score
 * @param {string} prn - PRN of the student whose resume is to be analyzed
 */
router.post('/ats-score', async (req, res) => {
  const { prn } = req.body;
  if (!prn) {
    return res.status(400).json({ message: 'PRN is required' });
  }

  try {
    // Fetch student data from Firestore using PRN
    const studentSnapshot = await db.collection('students').where('prn', '==', prn).get();
    if (studentSnapshot.empty) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const studentData = studentSnapshot.docs[0].data();
    const resumeUrl = studentData.resumeFile;

    if (!resumeUrl) {
      return res.status(400).json({ message: 'No resume file found for this student' });
    }

    // Download resume file from Firebase Storage
    const response = await axios.get(resumeUrl, { responseType: 'arraybuffer' });
    const resumeBuffer = Buffer.from(response.data);

    // Extract text from the resume (only for PDFs)
    const resumeText = await pdf(resumeBuffer).then(data => data.text);

    // Send text to OpenAI API for ATS scoring
    const openaiResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an ATS scoring assistant. Analyze the given resume and provide an ATS score out of 100." },
        { role: "user", content: `Analyze this resume:\n\n${resumeText}` }
      ],
      max_tokens: 300,
    });

    // Extract ATS Score from OpenAI Response
    const atsScoreMatch = openaiResponse.choices[0].message.content.match(/\d+/);
    const atsScore = atsScoreMatch ? parseInt(atsScoreMatch[0], 10) : 0;

    // Save ATS score in Firestore
    await db.collection('students').doc(studentSnapshot.docs[0].id).update({ atsScore });

    // Return ATS Score
    res.json({ prn, atsScore });

  } catch (error) {
    console.error('Error in ATS scoring:', error);
    res.status(500).json({ message: 'An error occurred while calculating ATS score' });
  }
});

export const atsScoreRoute = router; // Export the router
