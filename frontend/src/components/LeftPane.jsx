//new
import React, { useState } from 'react';
import { FaTrophy, FaQuestionCircle, FaBriefcase, FaGraduationCap, FaUserTie } from 'react-icons/fa';
import { ListGroup } from 'react-bootstrap';
import { MdDashboard } from 'react-icons/md';
import '../../css/LeftPane.css'; // Import external CSS
import {AiOutlineFileSearch} from 'react-icons/ai';

const LeftPane = ({ onMenuClick }) => {
  const [activeItem, setActiveItem] = useState('home'); // State to track active menu item

  // Handle menu click and update active state
  const handleMenuClick = (menu) => {
    setActiveItem(menu);
    onMenuClick(menu);
  };

  return (
    <div className="sidebar">
      {/* Menu Title */}
      <div className="menu-title">Menu</div>

      {/* Menu Items */}
      <ListGroup className="sidebar-list">
        <ListGroup.Item
          action
          onClick={() => handleMenuClick('home')}
          className={`sidebar-item ${activeItem === 'home' ? 'active' : ''}`}
        >
          <MdDashboard className="sidebar-icon" /> Dashboard
        </ListGroup.Item>
        <ListGroup.Item
          action
          onClick={() => handleMenuClick('quiz')}
          className={`sidebar-item ${activeItem === 'quiz' ? 'active' : ''}`}
        >
          <FaQuestionCircle className="sidebar-icon" /> Quiz
        </ListGroup.Item>
        <ListGroup.Item
          action
          onClick={() => handleMenuClick('job-search')}
          className={`sidebar-item ${activeItem === 'job-search' ? 'active' : ''}`}
        >
          <FaBriefcase className="sidebar-icon" /> Job Search
        </ListGroup.Item>
        <ListGroup.Item
          action
          onClick={() => handleMenuClick('course-suggestions')}
          className={`sidebar-item ${activeItem === 'course-suggestions' ? 'active' : ''}`}
        >
          <FaGraduationCap className="sidebar-icon" /> Course Suggestions
        </ListGroup.Item>
        <ListGroup.Item
          action
          onClick={() => handleMenuClick('leaderboard')}
          className={`sidebar-item ${activeItem === 'leaderboard' ? 'active' : ''}`}
        >
          <FaTrophy className="sidebar-icon" /> Leader Board
        </ListGroup.Item>
        <ListGroup.Item
          action
          onClick={() => handleMenuClick('Interviewer')}
          className={`sidebar-item ${activeItem === 'Interviewer' ? 'active' : ''}`}
        >
          <FaUserTie className="sidebar-icon" /> Interviewer
        </ListGroup.Item>
        <ListGroup.Item
          action
          onClick={() => handleMenuClick('Resume_Analyzer')}
          className={`sidebar-item ${activeItem === 'Resume_Analyzer' ? 'active' : ''}`}
        >
          <AiOutlineFileSearch className="sidebar-icon" /> Resume Analyzer
        </ListGroup.Item>
      </ListGroup>
    </div>
  );
};

export default LeftPane;

// import React from 'react';
// import { FaTrophy, FaQuestionCircle, FaChevronLeft, FaChevronRight, FaBriefcase, FaGraduationCap } from 'react-icons/fa'; // Import the icon for Course Suggestions
// import { ListGroup } from 'react-bootstrap';

// const LeftPane = ({ isCollapsed, toggleCollapse, onMenuClick }) => {
//   // Handle menu item click to set active component
//   const handleMenuClick = (menu) => {
//     onMenuClick(menu); // Update active component based on the clicked menu
//   };

//   return (
//     <div
//       style={{
//         width: isCollapsed ? '60px' : '250px',
//         height: '100vh',
//         backgroundColor: '#f8f9fa',
//         borderRight: '1px solid #ddd',
//         position: 'fixed',
//         transition: 'width 0.3s ease',
//         padding: isCollapsed ? '10px' : '20px',
//         overflow: 'hidden',
//       }}
//     >
//       {/* Header with Collapse Toggle
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         {!isCollapsed && <h4>Menu</h4>}
//         <button
//           className="btn btn-sm btn-light"
//           onClick={toggleCollapse}
//           style={{
//             border: 'none',
//             background: 'transparent',
//             cursor: 'pointer',
//             padding: 0,
//           }}
//         >
//           {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
//         </button>
//       </div> */}

//       {/* Menu Items */}
//       <ListGroup>
//         <ListGroup.Item
//           action
//           onClick={() => handleMenuClick('home')}
//         >
//           <FaTrophy /> {!isCollapsed && 'Dashboard'}
//         </ListGroup.Item>
//         <ListGroup.Item
//           action
//           onClick={() => handleMenuClick('quiz')}
//         >
//           <FaQuestionCircle /> {!isCollapsed && 'Quiz'}
//         </ListGroup.Item>
//         <ListGroup.Item
//           action
//           onClick={() => handleMenuClick('job-search')}
//         >
//           <FaBriefcase /> {!isCollapsed && 'Job Search'}
//         </ListGroup.Item>
//         {/* Add new menu item for Course Suggestions */}
//         <ListGroup.Item
//           action
//           onClick={() => handleMenuClick('course-suggestions')}
//         >
//           <FaGraduationCap /> {!isCollapsed && 'Course Suggestions'}
//         </ListGroup.Item>
//         {/* Add new menu item for Leader Board */}
//         <ListGroup.Item
//           action
//           onClick={() => handleMenuClick('leaderboard')}
//         >
//           <FaGraduationCap /> {!isCollapsed && 'Leader Board'}
//         </ListGroup.Item>
//       </ListGroup>
//     </div>
//   );
// };

// export default LeftPane;


