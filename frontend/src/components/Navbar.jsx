import React, { useState, useEffect, useRef } from 'react';
import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';
import owlLogo from '../assets/OWL SKILLSAGE.png'; // Owl image
import profilePlaceholder from '../assets/logo.jpg'; // Default profile image
import '../../css/Navbar.css'; // Import the CSS file
import profile from '../assets/logo.jpg'

const Navbar = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();

  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({ ...userDoc.data(), prn: userDoc.data().prn });
        } else {
          setUser({ name: firebaseUser.displayName || 'User', role: 'Member', prn: 'default-prn' });
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [auth, db]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Redirect after logout
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleProfileRedirect = () => {
    if (user && user.prn) {
      navigate(`/profile/${user.prn}`);
      setShowDropdown(false);
    } else {
      alert('PRN not found. Please update your profile.');
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <BootstrapNavbar bg="white" expand="lg" fixed="top" className="shadow-sm px-3">
  <Container fluid>
    {/* Logo & Branding */}
    <BootstrapNavbar.Brand as={Link} to="/dashboard" className="d-flex align-items-center logo-container">
      <img src={owlLogo} alt="SkillSage Owl" className="logo-image" />
      <div className="logo-text">
        <span className="logo-title">SkillSage</span>
        <span className="logo-subtitle">A Skill Assessment Platform</span>
      </div>
    </BootstrapNavbar.Brand>

    <BootstrapNavbar.Toggle aria-controls="navbarScroll" />
    <BootstrapNavbar.Collapse id="navbarScroll">
      <Nav className="ms-auto">
        {user && (
          <div ref={dropdownRef} className="position-relative">
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              className="d-flex align-items-center p-2 rounded-3 profile-container"
            >
              <img
                src={user.photoURL || profilePlaceholder} // Dynamic profile image
                alt="Profile"
                className="profile-image"
              />
              <span className="user-greeting">Hi, {user.name}</span>
            </div>

            {showDropdown && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '60px',
                  width: '200px',
                  backgroundColor: 'white',
                  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                  padding: '10px',
                  zIndex: 1000,}}
              >
                <div style={{ padding: '6px 0', fontSize: '14px', fontWeight: 'bold' }}>
                  Logged As <br />
                  {user.name}
                </div>
                <hr style={{ margin: '5px 0' }} />
                <div
                  onClick={handleProfileRedirect}
                  style={{
                    padding: '6px 10px',
                    cursor: 'pointer',
                    display: 'block',
                    color: 'black',}}
                >
                  User Profile
                </div>
                <hr style={{ margin: '5px 0' }} />
                <div
                  onClick={handleLogout}
                  style={{
                    padding: '6px 10px',
                    cursor: 'pointer',
                    display: 'block',
                    color: 'red',}}
                >
                  Sign out
                </div>
              </div>
            )}
          </div>
        )}
      </Nav>
    </BootstrapNavbar.Collapse>
  </Container>
</BootstrapNavbar>

  );
};

export default Navbar;
