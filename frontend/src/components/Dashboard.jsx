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
import LineGraph from './LineGraph';
import CompactLeaderboard from './compactLeaderboard';
import Interviewer from './Interviewer';
import ResumeAnalyzer from './ResumeAnalyzer';
import "../../css/DashboardCards.css"




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
      case 'Interviewer':
          return <Interviewer />;
      case 'Resume_Analyzer':
          return <ResumeAnalyzer />;
      case 'home': // Dashboard specific content
        return (
        <div></div>
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
            // flexWrap: 'wrap',
            gap: '10px',
            justifyContent: 'left',
            marginTop: '50px',
           
          }}
        >
          {/* Profile Stats Card */}
          <div className="card" style={{ width: '18rem' , borderRadius:'3px', paddingTop:'30px',paddingBottom:'30px',paddingLeft:'15px'}}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div className="circle-icon" style={{
                backgroundColor: '#007bff',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <i className="bi bi-person-circle" style={{fontSize: '1.8rem', color: '#fff' }}></i>
              </div>
              <div>
                <h5 className="card-title" style={{fontFamily: "'Lexend', sans-serif"}} >Profile Stats</h5>
                <p className="card-text">PRN: {localStorage.getItem('userPRN')}</p>
              </div>
            </div>
          </div>

          {/* Resume Status Card */}
          <div className="card" style={{ width: '18rem', borderRadius:'3px', paddingTop:'30px',paddingBottom:'30px',paddingLeft:'15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div className="circle-icon" style={{
                backgroundColor: '#28a745',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <i className="bi bi-file-earmark-arrow-up" style={{ fontSize: '1.8rem', color: '#fff' }}></i>
              </div>
              <div>
                <h5 className="card-title" style={{fontFamily: "'Lexend', sans-serif"}}>Resume Status</h5>
                <p className="card-text" >Resume Uploaded: Yes</p>
              </div>
            </div>
          </div>

          {/* Leaderboard Rank Card */}
          <div className="card" style={{ width: '18rem', paddingTop:'30px',paddingBottom:'30px',paddingLeft:'15px',borderRadius:'3px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div className="circle-icon" style={{
                backgroundColor: '#ffc107',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <i className="bi bi-trophy" style={{ fontSize: '1.8rem', color: '#fff' }}></i>
              </div>
              <div>
                <h5 className="card-title" style={{fontFamily: "'Lexend', sans-serif"}}>Leaderboard Rank</h5>
                <p className="card-text">Rank: {profileData?.rank || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* ATS Score Card */}
          <div className="card" style={{ width: '18rem', paddingTop:'30px',paddingBottom:'30px',paddingLeft:'15px',borderRadius:'3px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div className="circle-icon" style={{
                backgroundColor: '#17a2b8',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <i className="bi bi-bar-chart-line" style={{ fontSize: '1.8rem', color: '#fff' }}></i>
              </div>
              <div>
                <h5 className="card-title" style={{fontFamily: "'Lexend', sans-serif"}}>ATS Score</h5>
                <p className="card-text">Score: 85</p> {/* Hardcoded for now */}
              </div>

            </div>
          </div>

        </div> 
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '20px' }}>
  
  {/* Line Graph Section */}
  <div style={{ background: 'white', border: '1px solid #d2d2d2', width: '50%',height:'400px', borderRadius: '3px', padding: '10px' }}>
    <LineGraph />
  </div>

  {/* Compact Leaderboard Section */}
  <div style={{ background: 'white',backgroundColor:'#f9fafb' , border: '1px solid #f9fafb ', width: '50%',height:'400px', borderRadius: '3px'}}>
    <CompactLeaderboard />
  </div>

</div>

 
      </div>
    );
};


  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh'}}>
      <Navbar onProfileClick={handleProfileClick} toggleLeftPane={toggleLeftPane} />
      <div className="container-fluid">
        <div className="row" style={{marginTop:'5rem'}}>
          <div style={{width:'19%'}} className={`col-md-3  p-0 ${isCollapsed ? 'd-none' : ''}`}>
            <LeftPane
              isCollapsed={isCollapsed}
              toggleCollapse={toggleLeftPane}
              onMenuClick={setActiveComponent}
            />
          </div>
          <div className="col-md-9" style={{
            marginLeft: '-35px',
            marginTop:'-23px'
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





