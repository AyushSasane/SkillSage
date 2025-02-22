import React from 'react';
import { auth, provider, signInWithPopup } from '../firebase';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaGoogle } from 'react-icons/fa';
import logo from '../assets/SKILLSAGE LOGO FINAL.png';

// Import Google Fonts (add to your index.html <head> for better typography)
const fontStyles = {
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 500,
};

function SignIn() {
  const navigate = useNavigate();

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('User Info:', user);

      localStorage.setItem('userEmail', user.email);
      navigate('/register');
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center vh-100 p-3">
      {/* Logo */}
      <img
        src={logo}
        alt="SkillSage Logo"
        className="img-fluid"
        style={{ maxWidth: '100%', width: '500px', marginBottom: '-50px' }}
      />

      {/* Heading */}
      <h2 className="text-center mb-3" style={{ ...fontStyles, fontSize: 'clamp(1.5rem, 5vw, 2rem)', color: '#333' }}>
        Welcome to <span style={{ fontWeight: 700, color: '#6366f1' }}>SkillSage</span>
      </h2>
      <p
        className="text-muted text-center"
        style={{ fontSize: 'clamp(0.9rem, 3vw, 1rem)', maxWidth: '400px', lineHeight: '1.6' }}
      >
        A premier platform for skill assessment and career growth.
      </p>

      {/* Google Sign-In Button */}
      <button
        onClick={signInWithGoogle}
        className="btn d-flex align-items-center justify-content-center shadow"
        style={{
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          borderRadius: '50px',
          padding: '12px 25px',
          fontWeight: '600',
          fontSize: 'clamp(0.9rem, 3vw, 1rem)',
          color: '#333',
          width: '100%',
          maxWidth: '280px',
          transition: 'all 0.3s ease',
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = '#f8f9fa')}
        onMouseOut={(e) => (e.target.style.backgroundColor = '#fff')}
      >
        <FaGoogle className="me-2" size={20} />
        Sign in with Google
      </button>

      {/* Subtext */}
      <p
        className="mt-3 text-muted text-center"
        style={{ fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)', maxWidth: '400px' }}
      >
        By signing in, you agree to our{' '}
        <a href="/terms" style={{ color: '#6366f1', textDecoration: 'none' }}>
          Terms of Service
        </a>
        .
      </p>
    </div>
  );
}

export default SignIn;