import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Navbar from './Navbar';
import LeftPane from './LeftPane';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Import Bootstrap Icons
import Quiz from './Quiz';
import JobSearch from './JobSearch';
import CourseSuggestion from './CourseSuggestion';
import { Badge } from 'react-bootstrap';
import LeaderBoard from './LeaderBoard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [username, setUsername] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [skillsExtracted, setSkillsExtracted] = useState([]); // Defaulting to an empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeComponent, setActiveComponent] = useState('home'); // Default to 'home'
  const [quizHistory, setQuizHistory] = useState([]);

  // Fetch profile data
  const fetchUserData = async () => {
    const userPrn = localStorage.getItem('userPRN');
    if (userPrn) {
      try {
        const studentRef = collection(db, 'students');
        const q = query(studentRef, where('prn', '==', userPrn));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const studentData = querySnapshot.docs[0].data();
          setUsername(studentData.name);
          setProfileData(studentData); // Set profile data, including rank
          setQuizHistory(studentData.quizHistory || []); // Set quiz history
          setSkillsExtracted(studentData.skills || []); // Extract skills directly from the profile data
        } else {
          setError('User not found.');
        }
      } catch (error) {
        setError('Error fetching user data.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Fetch skills (already part of the previous explanation)
  const extractSkills = async () => {
    const prn = localStorage.getItem('userPRN'); // Retrieve PRN from localStorage

    if (!prn) {
      console.error('No PRN found in localStorage.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/extract-skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prn }), // Pass the PRN to the backend
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(errorDetails.error || 'Failed to extract skills');
      }

      const { skills } = await response.json();
      setSkillsExtracted(skills); // Update the state with the extracted skills
    } catch (error) {
      console.error('Error fetching skills:', error.message);
      setError('Error extracting skills: ' + error.message); // Display error in UI
    }
  };

  // Fetch user data and extract skills when the component mounts
  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (profileData) {
      extractSkills(); // Automatically extract skills after profile data is loaded
    }
  }, [profileData]); // Runs when profileData is successfully fetched

  const handleProfileClick = () => {
    const userPrn = localStorage.getItem('userPRN');
    if (userPrn) {
      navigate(`/profile/${userPrn}`);
    } else {
      alert('PRN not found. Please log in or register.');
      navigate('/login');
    }
  };

  const toggleLeftPane = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Format the date to a more readable format
  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  // Function to update quiz history after a quiz attempt
  const updateQuizHistory = async (quizName, category, score) => {
    const userPrn = localStorage.getItem('userPRN');
    if (!userPrn) return;

    try {
      // Update quiz history in the Firestore
      const studentRef = doc(db, 'students', userPrn);
      const newQuiz = {
        quizName,
        category,
        score,
        attemptDate: new Date(),
      };

      await updateDoc(studentRef, {
        quizHistory: [...profileData.quizHistory, newQuiz],
      });

      // Update local state
      setQuizHistory([...quizHistory, newQuiz]);
    } catch (error) {
      console.error("Error updating quiz history: ", error);
    }
  };

  // Render content based on active component
  const renderContent = () => {
    switch (activeComponent) {
      case 'quiz':
        return <Quiz onQuizFinish={updateQuizHistory} />;
      case 'job-search':
        return <JobSearch />;
      case 'course-suggestions':
        return <CourseSuggestion />;
      case 'leaderboard':
        return <LeaderBoard />;
      case 'home': // Dashboard specific content
        return (
          <div>
            {loading ? (
              <h2>Loading...</h2>
            ) : error ? (
              <p className="text-danger">{error}</p>
            ) : (
              <h1 style={{ marginTop: '30px' }}>Welcome, {username || 'User'}!</h1> // Only render the Welcome message here
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // Render cards with profile data (Skills, Resume, etc.)
  const renderDashboardCards = () => {
    if (activeComponent !== 'home') return null; // Only render cards on the Dashboard

    return (
      <div>
        {/* Cards Layout */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '40px',
            justifyContent: 'left',
            marginTop: '50px',
          }}
        >
          {/* Profile Stats Card */}
          <div className="card" style={{ width: '18rem' }}>
            <div className="circle-icon" style={{
              backgroundColor: '#007bff',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '-25px auto 15px',
            }}>
              <i className="bi bi-person-circle" style={{ fontSize: '2rem', color: '#fff' }}></i>
            </div>
            <div className="card-body">
              <h5 className="card-title">Profile Stats</h5>
              <p className="card-text">PRN: {localStorage.getItem('userPRN')}</p>
              <p className="card-text">ATS Score: {profileData?.atsScore || 'N/A'}</p>
              <p className="card-text">Leaderboard Rank: {profileData?.rank || 'N/A'}</p> {/* Display rank here */}
            </div>
          </div>

          {/* Resume Status Card */}
          <div className="card" style={{ width: '18rem' }}>
            <div className="circle-icon" style={{
              backgroundColor: '#28a745',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '-25px auto 15px',
            }}>
              <i className="bi bi-file-earmark-arrow-up" style={{ fontSize: '2rem', color: '#fff' }}></i>
            </div>
            <div className="card-body">
              <h5 className="card-title">Resume Status</h5>
              <p className="card-text">Resume Uploaded: Yes</p>
              <p className="card-text">Last Uploaded: 12th November 2024</p>
              {/* <a href="/upload-resume" className="btn btn-primary">
                Upload New Resume
              </a> */}
            </div>
          </div>

          {/* Quiz Performance Card */}
          <div className="card" style={{ width: '18rem' }}>
            <div className="circle-icon" style={{
              backgroundColor: '#ffc107',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '-25px auto 15px',
            }}>
              <i className="bi bi-clipboard2-check" style={{ fontSize: '2rem', color: '#fff' }}></i>
            </div>
            <div className="card-body">
              <h5 className="card-title">Quiz Performance</h5>
              {quizHistory.length > 0 ? (
                <ul>
                  {quizHistory.map((quiz, index) => (
                    <li key={index}>
                      {quiz.quizName}: {quiz.score}/10 on {formatDate(quiz.attemptDate)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No quiz attempts yet</p>
              )}
              <p className="card-text">Total Quizzes Attempted: {quizHistory.length}</p>
            </div>
          </div>

          {/* Skill Insights Card */}
          <div className="card" style={{ width: '18rem' }}>
            <div className="circle-icon" style={{
              backgroundColor: '#17a2b8',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '-25px auto 15px',
            }}>
              <i className="bi bi-gear" style={{ fontSize: '2rem', color: '#fff' }}></i>
            </div>
            <div className="card-body">
              <h5 className="card-title">Skill Insights</h5>
              {Array.isArray(skillsExtracted) && skillsExtracted.length > 0 ? (
                <div>
                  {skillsExtracted.slice(0, 5).map((skill, index) => (
                    <Badge key={index} pill bg="info" className="me-2 mb-2">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p>No skills extracted yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Navbar onProfileClick={handleProfileClick} toggleLeftPane={toggleLeftPane} />
      <div className="container-fluid">
        <div className="row">
          <div className={`col-md-3 ${isCollapsed ? 'd-none' : ''}`}>
            <LeftPane
              isCollapsed={isCollapsed}
              toggleCollapse={toggleLeftPane}
              onMenuClick={setActiveComponent}
            />
          </div>
          <div className="col-md-9" style={{
            marginLeft: '-35px',
          }}>
            {renderContent()}
            {renderDashboardCards()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
