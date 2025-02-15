// jobSearchRoute.js

import express from 'express';
import axios from 'axios';

const router = express.Router();

// Add the Adzuna API credentials directly here
const ADZUNA_APP_ID = "6ae342fa";
const ADZUNA_API_KEY = "1beec9bc623acf27b54b39920d4473d7";
const BASE_URL = "https://api.adzuna.com/v1/api/jobs";
const DEFAULT_COUNTRY = "in"; // Set the default country to India (modify if needed)

// POST request to search jobs based on skills and location
router.post('/search', async (req, res) => {
  const { skills, location } = req.body;

  // Validate input
  if (!skills || !location) {
    return res.status(400).json({ message: 'Skills and location are required.' });
  }

  // Ensure the skills are properly formatted as a comma-separated string
  const formattedSkills = skills.trim().split(',').map(skill => skill.trim()).join(', ');

  try {
    // Make a request to the Adzuna API
    const response = await axios.get(`${BASE_URL}/${DEFAULT_COUNTRY}/search/1`, {
      params: {
        app_id: ADZUNA_APP_ID,
        app_key: ADZUNA_API_KEY,
        what: formattedSkills, // Comma-separated skills
        where: location, // Location
      },
    });

    // Send back the job results to the frontend
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching job data:', error.message);
    res.status(500).json({ message: 'Failed to fetch jobs.' });
  }
});

export { router as jobSearchRoute };
