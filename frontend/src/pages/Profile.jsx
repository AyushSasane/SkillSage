// import React, { useEffect, useState } from 'react';
// import { db } from '../firebase'; // Ensure the correct path to firebase
// import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
// import { Container, Row, Col, Button, Table, Badge, Spinner } from 'react-bootstrap';
// import Navbar from '../components/Navbar';
// import 'bootstrap/dist/css/bootstrap.min.css';

// const Profile = () => {
//   const [profileData, setProfileData] = useState(null);
//   const [skillsExtracted, setSkillsExtracted] = useState([]); // State for extracted skills
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Function to fetch profile data based on the PRN stored in localStorage
//   const fetchProfileData = async () => {
//     const prn = localStorage.getItem('userPRN'); // Retrieve PRN from localStorage

//     if (!prn) {
//       setError('No PRN found in localStorage.');
//       setLoading(false);
//       return;
//     }

//     try {
//       const studentRef = collection(db, 'students');
//       const q = query(studentRef, where('prn', '==', prn));
//       const querySnapshot = await getDocs(q);

//       if (!querySnapshot.empty) {
//         const studentDoc = querySnapshot.docs[0];
//         const studentData = studentDoc.data();
//         setProfileData({
//           prn: studentData.prn,
//           name: studentData.name,
//           college: studentData.college,
//           department: studentData.department,
//           email: studentData.email,
//           resumeFileUrl: studentData.resumeFile,
//           skills: studentData.skills || [], // Assuming skills is an array of strings
//           quizHistory: studentData.quizHistory || [], // Assuming quizHistory is an array of objects
//           atsScore: studentData.atsScore || 0,
//           leaderboardRank: studentData.leaderboardRank || 0, // Add the leaderboard rank
//         });

//         // Check if skills are already present in Firestore
//         if (studentData.skills && studentData.skills.length > 0) {
//           setSkillsExtracted(studentData.skills);
//         } else {
//           // If skills are missing, extract them
//           extractSkills(studentDoc.ref);
//         }
//       } else {
//         setError('Profile not found.');
//       }
//     } catch (error) {
//       console.error('Error fetching profile data:', error);
//       setError(`Error fetching profile data: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Function to extract skills using the backend API
//   const extractSkills = async (studentDocRef) => {
//     if (!profileData?.prn) {
//       console.error('PRN is missing or undefined.');
//       return;
//     }

//     console.log('PRN being sent to backend:', profileData.prn); // Log the PRN being sent

//     try {
//       const response = await fetch('http://localhost:5000/api/extract-skills', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ prn: profileData.prn }), // Pass the PRN to the backend
//       });

//       if (!response.ok) {
//         const errorDetails = await response.json();
//         throw new Error(errorDetails.error || 'Failed to extract skills');
//       }

//       const { skills } = await response.json();
//       console.log('Extracted Skills:', skills);
//       setSkillsExtracted(skills); // Update the state with the extracted skills

//       // Update Firestore with the new skills
//       await updateDoc(studentDocRef, {
//         skills: skills,
//       });
//     } catch (error) {
//       console.error('Error fetching skills:', error.message);
//       setError('Error extracting skills: ' + error.message); // Display error in UI
//     }
//   };

//   // Fetch profile data when component mounts
//   useEffect(() => {
//     fetchProfileData();
//   }, []);

//   // Format the date to a more readable format
//   const formatDate = (date) => {
//     const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
//     return new Date(date).toLocaleDateString('en-US', options);
//   };

//   return (
//     <Container fluid className="p-0">
//       <Navbar />
//       {loading ? (
//         <div className="text-center">
//           <Spinner animation="border" />
//           <p>Loading profile...</p>
//         </div>
//       ) : error ? (
//         <p className="text-danger">{error}</p>
//       ) : (
//         <div>
//           {/* Header Section */}
//           <Row className="my-4">
//             <Col>
//               <h1 className="text-center">Profile</h1>
//             </Col>
//           </Row>

//           {/* User Details Section */}
//           <Row className="mb-4">
//             <Col>
//               <h4>User Details</h4>
//               <p>Username - {profileData.name || 'N/A'}</p>
//               <p>PRN Number - {profileData.prn || 'N/A'}</p>
//               <Button
//                 variant="primary"
//                 href={profileData.resumeFileUrl}
//                 target="_blank"
//                 rel="noopener noreferrer"
//               >
//                 View Resume
//               </Button>
//               <Button variant="outline-primary" className="ms-2">
//                 Upload New Resume
//               </Button>
//             </Col>
//             <Col className="text-end">
//               <h6>ATS Score</h6>
//               <p>{profileData.atsScore}</p>
//               <h6>Leaderboard Rank</h6>
//               <p>{profileData.leaderboardRank}</p> {/* Display the leaderboard rank */}
//             </Col>
//           </Row>

//           {/* Extracted Skills Section */}
//           <Row className="mb-4">
//             <Col>
//               <h4>Extracted Skills</h4>
//               <div>
//                 {skillsExtracted.length > 0 ? (
//                   skillsExtracted.slice(0, 10).map((skill, index) => (
//                     <Badge
//                       key={index}
//                       bg="dark"
//                       className="me-2 mb-2"
//                       style={{
//                         backgroundColor: 'dark',
//                         color: 'white',
//                         padding: '10px',
//                       }}
//                     >
//                       {skill}
//                     </Badge>
//                   ))
//                 ) : (
//                   <p>No skills extracted yet.</p>
//                 )}
//               </div>
//             </Col>
//           </Row>

//           {/* Quiz History Section */}
//           <Row className="mb-4">
//             <Col>
//               <h4>Quiz History</h4>
//               <Table striped bordered hover>
//                 <thead>
//                   <tr>
//                     <th>Quiz Name</th>
//                     <th>Category</th>
//                     <th>Date Attempted</th>
//                     <th>Score</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {profileData.quizHistory.length > 0 ? (
//                     profileData.quizHistory.map((quiz, index) => (
//                       <tr key={index}>
//                         <td>{quiz.quizName}</td>
//                         <td>{quiz.category}</td>
//                         <td>{formatDate(quiz.attemptDate)}</td>
//                         <td>{quiz.score}</td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="4" className="text-center">
//                         No quiz history available
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </Table>
//             </Col>
//           </Row>
//         </div>
//       )}
//     </Container>
//   );
// };

// export default Profile;


//new
import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; // Ensure the correct path to firebase
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { Button } from 'react-bootstrap';
import Navbar from '../components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import "../../css/Profile.css";
import "../../css/LeftPane.css";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import SocialLinksCard from '../components/SocialLinksCard';
import LeftPane from '../components/LeftPane';

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [skillsExtracted, setSkillsExtracted] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [photoURL, setPhotoURL] = useState('https://bootdey.com/img/Content/avatar/avatar7.png');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.photoURL) {
        setPhotoURL(user.photoURL);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchProfileData = async () => {
    const prn = localStorage.getItem('userPRN');
    const auth = getAuth();
    const user = auth.currentUser; 

    if (!prn) {
      setError('No PRN found in localStorage.');
      setLoading(false);
      return;
    }

    try {
      const studentRef = collection(db, 'students');
      const q = query(studentRef, where('prn', '==', prn));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const studentDoc = querySnapshot.docs[0];
        const studentData = studentDoc.data();

        setProfileData({
          prn: studentData.prn,
          name: studentData.name,
          college: studentData.college,
          department: studentData.department,
          email: studentData.email,
          resumeFileUrl: studentData.resumeFile,
          skills: studentData.skills || [],
          quizHistory: studentData.quizHistory || [],
        });

        if (studentData.skills?.length > 0) {
          setSkillsExtracted(studentData.skills);
        } else {
          extractSkills(studentDoc.ref);
        }
      } else {
        setError('Profile not found.');
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setError(`Error fetching profile data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const extractSkills = async (studentDocRef) => {
    if (!profileData?.prn) return;

    try {
      const response = await fetch('http://localhost:5000/api/extract-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prn: profileData.prn }),
      });

      if (!response.ok) throw new Error('Failed to extract skills');

      const { skills } = await response.json();
      setSkillsExtracted(skills);

      await updateDoc(studentDocRef, { skills });
    } catch (error) {
      console.error('Error fetching skills:', error.message);
      setError(`Error extracting skills: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  return (
    
    <div className="profile-container">
      <Navbar />
      <div style={{marginTop:'5rem'}}><LeftPane /></div>
      ,
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div className="profile-layout">
          <div className="profile-left">
            <div className="profile-card user-card">
              <img src={photoURL} alt="Profile" className="user-avatar" />
              <h2 className="user-name">{profileData.name}</h2>
              <p className="user-title">{profileData.department}</p>

              <div className="resume-actions">
                <Button
                  variant="primary"
                  href={profileData.resumeFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fas fa-file-pdf"></i> View Resume
                </Button>
              </div>

              <SocialLinksCard/>
            </div>
          </div>

          <div className="profile-right">
            <div className="profile-card info-card">
              <h3>Personal Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Full Name</label>
                  <p>{profileData.name}</p>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <p>{profileData.email}</p>
                </div>
                <div className="info-item">
                  <label>PRN Number</label>
                  <p>{profileData.prn}</p>
                </div>
                <div className="info-item">
                  <label>College</label>
                  <p>{profileData.college}</p>
                </div>
              </div>
            </div>

            <div className="profile-card skills-card">
              <h3>Technical Skills</h3>
              <div className="skills-grid">
                {skillsExtracted.slice(0, 10).map((skill, index) => (
                  <span key={index} className="skill-badge">{skill}</span>
                ))}
              </div>
            </div>

            <div className="profile-card quiz-card">
              <h3>Quiz History</h3>
              <div className="table-container">
                <table className="quiz-table">
                  <thead>
                    <tr>
                      <th>Quiz Name</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profileData.quizHistory.map((quiz, index) => (
                      <tr key={index}>
                        <td>{quiz.quizName}</td>
                        <td>{quiz.category}</td>
                        <td>{new Date(quiz.attemptDate).toLocaleDateString()}</td>
                        <td><span className="score-badge">{quiz.score}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;