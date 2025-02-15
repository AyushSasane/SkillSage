import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../firebase'; // Ensure the correct path to Firebase setup
import { collection, query, where, getDocs } from 'firebase/firestore';

function JobSearch() {
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState([]); // Hidden skills fetched from the database
  const [jobResults, setJobResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Preprocess skills to remove irrelevant keywords
  const preprocessSkills = (skillsArray) => {
    const irrelevantKeywords = ['Energetic', 'Vibrations']; // Add more irrelevant keywords if needed
    return skillsArray.filter(skill => skill && !irrelevantKeywords.includes(skill));
  };

  // Helper function to chunk the skills into groups of 2
  const chunkSkills = (skillsArray) => {
    const chunks = [];
    for (let i = 0; i < skillsArray.length; i += 2) {
      chunks.push(skillsArray.slice(i, i + 2)); // Group skills into chunks of 2
    }
    return chunks;
  };

  // Function to fetch skills from Firestore
  const fetchSkills = async () => {
    const prn = localStorage.getItem('userPRN'); // Retrieve PRN from localStorage
    if (!prn) {
      setError('No PRN found in localStorage.');
      return;
    }

    try {
      const studentRef = collection(db, 'students');
      const q = query(studentRef, where('prn', '==', prn));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const studentData = querySnapshot.docs[0].data();
        const userSkills = studentData.skills ? studentData.skills.split(',').map(skill => skill.trim()) : [];
        const processedSkills = preprocessSkills(userSkills); // Preprocess skills
        setSkills(processedSkills); // Save the preprocessed skills
      } else {
        setError('Profile not found.');
      }
    } catch (error) {
      console.error('Error fetching skills:', error.message);
      setError('Error fetching skills: ' + error.message);
    }
  };

  // Function to search for jobs
  const handleSearch = async () => {
    if (skills.length === 0 || !location) {
      setError('Location is required to search jobs.');
      return;
    }

    setError('');
    setLoading(true);
    setJobResults([]);

    const skillChunks = chunkSkills(skills);
    let allJobResults = [];

    try {
      for (const chunk of skillChunks) {
        try {
          const response = await axios.post('http://localhost:5000/api/jobsearch/search', {
            skills: chunk.join(', '), // Join the chunk into a comma-separated string
            location: location,
          });

          if (response.data.results && response.data.results.length > 0) {
            allJobResults = [...allJobResults, ...response.data.results];
          } else {
            console.warn(`No results for chunk: ${chunk.join(', ')}`);
          }
        } catch (chunkError) {
          console.error(`Error fetching jobs for chunk: ${chunk.join(', ')}`, chunkError);
        }
      }

      // Remove duplicates by job URL
      allJobResults = [...new Map(allJobResults.map(job => [job.redirect_url, job])).values()];

      setJobResults(allJobResults);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to fetch jobs, please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch skills when the component mounts
  useEffect(() => {
    fetchSkills();
  }, []);

  return (
    <div className="container jobsearch-container mt-5">
      <h2 className="text-left mb-4">Job Search</h2>

      {/* Location Input */}
      <div className="form-group mb-3">
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="form-control"
          placeholder="Enter location"
        />
      </div>

      {/* Search Button */}
      <div className="text-center mb-4">
        <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search Jobs'}
        </button>
      </div>

      {/* Error Message */}
      {error && <p className="text-danger text-center">{error}</p>}

      {/* Job Results */}
      {jobResults.length > 0 && (
        <div className="row">
          {jobResults.map((job, index) => (
            <div key={index} className="col-md-4 mb-4">
              <div className="card fixed-card">
                <div className="card-body">
                  <h5 className="card-title">{job.title}</h5>
                  <p className="card-text"><strong>Company:</strong> {job.company.display_name}</p>
                  <p className="card-text"><strong>Location:</strong> {job.location.display_name}</p>
                  <a href={job.redirect_url} target="_blank" rel="noopener noreferrer" className="btn btn-success">View Job</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {!loading && jobResults.length === 0 && !error && (
        <p className="text-center">No jobs found. Try refining your search.</p>
      )}
    </div>
  );
}

export default JobSearch;
