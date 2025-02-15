import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignIn from './pages/SignIn';
import RegistrationForm from './components/RegistrationForm';
import Dashboard from './components/Dashboard';
import Profile from './pages/Profile';
import PRNVerificationForm from './components/PRNVerificationForm';
import JobSearch from './components/JobSearch';
import LeftPane from './components/LeftPane';
import Quiz from './components/Quiz';
import CourseSuggestion from './components/CourseSuggestion'; // Import Course Suggestion component
import Interviewer from './components/Interviewer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/interviewer" element={<Interviewer />} />
        <Route path="/" element={<SignIn />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/verify-prn" element={<PRNVerificationForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile/:prn" element={<Profile />} />
        <Route path="/left-pane" element={<LeftPane />} />
        <Route path="/job-search" element={<JobSearch />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/course-suggestions" element={<CourseSuggestion />} /> {/* Add route for Course Suggestions */}
      </Routes>
    </Router>
  );
}

export default App;
