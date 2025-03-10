import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { FaUser, FaUniversity, FaFileUpload } from 'react-icons/fa'; // Importing icons
import logo from '../assets/SKILLSAGE LOGO FINAL.png';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    prn: '',
    name: '',
    college: '',
    department: '',
    resumeFile: null, // New field for the resume file
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      resumeFile: e.target.files[0], // Update resume file
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const email = localStorage.getItem('userEmail');
      if (!email) {
        throw new Error('User email not found. Please sign in again.');
      }

      // Create a form data object to include the resume file
      const formDataToSend = new FormData();
      formDataToSend.append('prn', formData.prn);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('college', formData.college);
      formDataToSend.append('department', formData.department);
      formDataToSend.append('email', email);
      formDataToSend.append('resumeFile', formData.resumeFile); // Attach resume file

      const response = await axios.post('http://localhost:5000/api/register', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data', // Set multipart for file upload
        },
      });

      setSuccess(response.data.message);
      setError('');

      // Store PRN, Name, and Resume in localStorage
      localStorage.setItem('userPRN', formData.prn);
      localStorage.setItem('userName', formData.name);
      localStorage.setItem('resumeFileName', formData.resumeFile.name); // Store just the file name

      // Redirect to the dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000); // Wait 2 seconds before redirecting
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred.');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5 d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="border p-4 rounded shadow" style={{ maxWidth: '500px', width: '100%', backgroundColor: '#f8f9fa' }}>
        <div className="text-center mb-4">
          <img src={logo} alt="SkillSage Logo" style={{ width: '150px', marginBottom: '20px' }} />
          <h2 className="text-center" style={{ color: '#343a40', fontWeight: '600', fontSize: '1.75rem' }}>Complete Your Registration</h2>
        </div>
        {error && <p className="text-danger text-center">{error}</p>}
        {success && <p className="text-success text-center">{success}</p>}
        <form onSubmit={handleSubmit} className="mx-auto">
          <div className="mb-3">
            <label htmlFor="prn" className="form-label d-flex align-items-center" style={{ color: '#495057', fontWeight: '500' }}>
              <FaUser className="me-2" /> PRN:
            </label>
            <input
              type="text"
              name="prn"
              id="prn"
              className="form-control"
              value={formData.prn}
              onChange={handleChange}
              required
              style={{ borderRadius: '8px', padding: '10px' }}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="name" className="form-label d-flex align-items-center" style={{ color: '#495057', fontWeight: '500' }}>
              <FaUser className="me-2" /> Name:
            </label>
            <input
              type="text"
              name="name"
              id="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ borderRadius: '8px', padding: '10px' }}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="college" className="form-label d-flex align-items-center" style={{ color: '#495057', fontWeight: '500' }}>
              <FaUniversity className="me-2" /> College:
            </label>
            <select
              name="college"
              id="college"
              className="form-select"
              value={formData.college}
              onChange={handleChange}
              required
              style={{ borderRadius: '8px', padding: '10px' }}
            >
              <option value="" disabled>Select College</option>
              <option value="Vishwakarma Institute of Technology (Bibwewadi)">Vishwakarma Institute of Technology (Bibwewadi)</option>
              <option value="Vishwakarma Institute of Technology (Kondhwa)">Vishwakarma Institute of Technology (Kondhwa)</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="department" className="form-label d-flex align-items-center" style={{ color: '#495057', fontWeight: '500' }}>
              <FaUniversity className="me-2" /> Department:
            </label>
            <select
              name="department"
              id="department"
              className="form-select"
              value={formData.department}
              onChange={handleChange}
              required
              style={{ borderRadius: '8px', padding: '10px' }}
            >
              <option value="" disabled>Select Department</option>
              <option value="Computer Engineering">Computer Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Computer Science & Engineering (Artificial Intelligence & Machine Learning)">Computer Science & Engineering (Artificial Intelligence & Machine Learning)</option>
              <option value="Computer Science & Engineering (Artificial Intelligence)">Computer Science & Engineering (Artificial Intelligence)</option>
              <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
              <option value="Computer Engineering (Software Engineering)">Computer Engineering (Software Engineering)</option>
              <option value="Computer Science & Engineering (Data Science)">Computer Science & Engineering (Data Science)</option>
              <option value="Computer Science & Engineering (Internet of Things & Cyber Security including Block Chain Technology)">Computer Science & Engineering (Internet of Things & Cyber Security including Block Chain Technology)</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Electronics & Tele Communication Engineering">Electronics & Tele Communication Engineering</option>
              <option value="Instrumentation & Control Engineering">Instrumentation & Control Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="resumeFile" className="form-label d-flex align-items-center" style={{ color: '#495057', fontWeight: '500' }}>
              <FaFileUpload className="me-2" /> Resume:
            </label>
            <input
              type="file"
              name="resumeFile"
              id="resumeFile"
              className="form-control"
              onChange={handleFileChange}
              accept=".pdf, .doc, .docx"
              required
              style={{ borderRadius: '8px', padding: '10px' }}
            />
          </div>
          <button
            type="submit"
            className="btn w-100"
            disabled={loading}
            style={{
              backgroundColor: '#007bff',
              borderColor: '#007bff',
              color: '#fff',
              fontWeight: '600',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '1rem',
            }}
          >
            {loading ? 'Submitting...' : 'Register'}
          </button>
          <div className="text-center mt-3">
            <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
              Already registered?{' '}
              <span
                style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline', fontWeight: '500' }}
                onClick={() => navigate('/verify-prn')} // Redirect to PRN verification page
              >
                Click here
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;