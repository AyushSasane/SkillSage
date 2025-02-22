import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import { db } from '../firebaseAdmin.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const API_KEY = process.env.AFINDA_API_KEY;
const RESUMES_DIR = path.resolve('resumes');

// Helper function to find resume by PRN
const findResumeByPRN = (prn) => {
  try {
    const files = fs.readdirSync(RESUMES_DIR);
    const resumeFile = files.find((file) => file.startsWith(`${prn}-`));
    if (!resumeFile) {
      throw new Error('Resume file not found');
    }
    return path.join(RESUMES_DIR, resumeFile);
  } catch (error) {
    throw error;
  }
};

// Route to extract resume details
router.post('/extract-skills', async (req, res) => {
  const { prn } = req.body;

  if (!prn) {
    return res.status(400).json({ error: 'PRN is required' });
  }

  try {
    // Step 1: Check Firestore for existing data
    const studentSnapshot = await db.collection('students').where('prn', '==', prn).get();
    
    if (studentSnapshot.empty) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    const studentDoc = studentSnapshot.docs[0].data();
    const studentDocId = studentSnapshot.docs[0].id;

    if (studentDoc.skills?.length && studentDoc.projects?.length && studentDoc.workExperience?.length) {
      // If data already exists, return it
      return res.status(200).json({
        name: studentDoc.name,
        skills: studentDoc.skills,
        projects: studentDoc.projects,
        workExperience: studentDoc.workExperience,
      });
    }

    // Step 2: If no data, find and parse the resume
    let resumePath;
    try {
      resumePath = findResumeByPRN(prn);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(resumePath));
    formData.append('indices', 'skills, projects, name, sections, experience');

    const response = await axios.post(
      'https://api.affinda.com/v2/resumes',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    const parsedData = response.data.data;
    if (!parsedData) {
      return res.status(500).json({ error: 'Failed to parse resume' });
    }

    // Extract relevant data
    const name = parsedData.name?.raw || studentDoc.name || 'Unknown';
    const skills = parsedData.skills?.map(skill => skill.name) || [];
    
    let projects = [];
    if (parsedData.projects?.text) {
      projects = parsedData.projects.text.split("\n").filter(proj => proj.trim() !== "" && proj !== "PROJECTS");
    } else {
      const projSection = parsedData.sections?.find(sec => sec.sectionType.toLowerCase().includes('projects'));
      if (projSection) {
        projects = projSection.text.split("\n").filter(proj => proj.trim() !== "" && proj !== "PROJECTS");
      }
    }

    let workExperience = [];
    if (parsedData.experience && parsedData.experience.length > 0) {
      workExperience = parsedData.experience.map(exp => ({
        role: exp.jobTitle || 'Unknown Role',
        company: exp.organization || 'Unknown Company',
        duration: exp.dates || 'Unknown Duration'
      }));
    } else {
      const workSection = parsedData.sections?.find(sec => sec.sectionType.toLowerCase().includes('experience'));
      if (workSection) {
        workExperience = workSection.text.split("\n").filter(exp => exp.trim() !== "");
      }
    }

    // Step 3: Store parsed data in Firestore
    await db.collection('students').doc(studentDocId).update({
      name,
      skills,
      projects,
      workExperience
    });

    return res.status(200).json({
      name,
      skills,
      projects,
      workExperience
    });

  } catch (error) {
    console.error('Error extracting resume details:', error.message);
    return res.status(500).json({ error: 'Failed to extract resume details' });
  }
});

export const SkillExtractionRoute = router;
