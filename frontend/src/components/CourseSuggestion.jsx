import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../firebase'; // Firebase setup
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Spinner } from 'react-bootstrap'; // Import Spinner for loading state

function CourseSuggestions() {
  const [skills, setSkills] = useState([]);
  const [courseResults, setCourseResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Manually added token (replace with actual token)
  const token = {
    accessToken: 'fLuCbQpAjcTwf0L3NdPRL4vpKL3e', // Example token
    expiresAt: Date.now() + 30 * 60 * 1000 - 60000, // Token expiration (30 minutes)
  };

  // Fetch Skills from Firebase
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
        setSkills(userSkills);
      } else {
        setError('Profile not found.');
      }
    } catch (err) {
      setError('Error fetching skills: ' + err.message);
    }
  };

  // Fetch Courses for a Skill
  const fetchCourses = async (skill) => {
    if (!token.accessToken || Date.now() > token.expiresAt) {
      setError('Token expired. Please update the token manually in the code.');
      return [];
    }

    try {
      const response = await axios.get(
        `/api/api/courses.v1?q=search&query=${encodeURIComponent(skill)}`,
        {
          headers: { Authorization: `Bearer ${token.accessToken}` },
        }
      );
      if (response.data && response.data.elements) {
        return response.data.elements.slice(0, 2); // Limit to two courses per skill
      }
      return [];
    } catch (err) {
      console.error(`Error fetching courses for skill "${skill}":`, err);
      return [];
    }
  };

  // Fetch Courses based on skills
  const fetchAllCourses = async () => {
    if (skills.length === 0) {
      setError('Skills are required to fetch courses.');
      return;
    }

    setError('');
    setLoading(true);
    setCourseResults([]); // Reset course results on new fetch

    try {
      for (const skill of skills) {
        const skillCourses = await fetchCourses(skill);
        if (skillCourses.length > 0) {
          // Add courses one by one as they come in
          setCourseResults((prevResults) => [
            ...prevResults,
            { skill, courses: skillCourses },
          ]);
        }
      }
    } catch (err) {
      setError('Failed to fetch courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch skills when the component mounts
  useEffect(() => {
    fetchSkills();
  }, []);

  // Automatically fetch courses when skills are available
  useEffect(() => {
    if (skills.length > 0) {
      fetchAllCourses();
    }
  }, [skills]); // Runs when skills are fetched or updated

  return (
    <div className="container course-suggestions-container mt-5">
      <h2 className="text-left mb-4">Course Suggestions</h2> {/* Align text to left */}

      {/* Token expired message */}
      {error && error.includes('Token expired') && (
        <div className="alert alert-warning text-center">
          <strong>Token expired!</strong> Please update the token manually in the code.
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="text-center mb-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p>Fetching Courses...</p>
        </div>
      )}

      {/* Error Message */}
      {error && !error.includes('Token expired') && (
        <p className="text-danger text-center">{error}</p>
      )}

      {/* Course Results */}
      {courseResults.length > 0 && (
        <div className="row">
          {courseResults.map((result, index) => (
            <div key={index} className="col-md-6 mb-3">
              <div className="card h-100 d-flex align-items-stretch">
                <div className="card-body">
                  <h5 className="card-title">{result.skill}</h5>
                  {result.courses.map((course, courseIndex) => (
                    <div key={courseIndex} className="mb-3">
                      <h6>{course.name}</h6>
                      <a
                        href={`https://www.coursera.org/learn/${course.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-success"
                      >
                        View Course
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {!loading && courseResults.length === 0 && !error && (
        <p className="text-center">No courses found. Try refining your search.</p>
      )}
    </div>
  );
}

export default CourseSuggestions;
