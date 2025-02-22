import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase"; // Import Firestore and Auth
import { doc, setDoc, getDoc } from "firebase/firestore";
import "../../css/Profile.css";
import { FaPlus, FaEdit } from "react-icons/fa";

const platformNames = {
  github: "GitHub",
  linkedin: "LinkedIn",
  leetcode: "LeetCode",
};
const platformIcons = {
  github: "fab fa-github",
  linkedin: "fab fa-linkedin",
  leetcode: "fas fa-code", 
};

const SocialLinksCard = () => {
  const [socialLinks, setSocialLinks] = useState({
    github: "",
    linkedin: "",
  });

  const [editingField, setEditingField] = useState(null);
  const [tempLink, setTempLink] = useState("");

  // Get current user
  const user = auth.currentUser;

  // Fetch social links from Firestore when the component mounts
  useEffect(() => {
    const fetchSocialLinks = async () => {
      if (!user) return; // Ensure user is logged in

      const userDocRef = doc(db, "students", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setSocialLinks(userDoc.data().socialLinks || {});
      }
    };

    fetchSocialLinks();
  }, [user]);

  // Save links to Firestore
  const handleSave = async () => {
    if (editingField && tempLink.trim() !== "" && user) {
      const updatedLinks = { ...socialLinks, [editingField]: tempLink };

      setSocialLinks(updatedLinks); // Update local state

      const userDocRef = doc(db, "students", user.uid);
      await setDoc(userDocRef, { socialLinks: updatedLinks }, { merge: true });

      setEditingField(null);
      setTempLink("");
    }
  };

  return (
    <div className="profile-card social-card">
      <h3>Social</h3>
      <ul className="social-list">
      {Object.keys(platformNames).map((platform) => (
        <li key={platform} className="social-item">
          <div className="social-icon">
            <i className={platformIcons[platform] || "fab fa-globe"}></i> 
          </div>
          {editingField === platform ? (
            <div className="input-container">
              <input
                type="text"
                className="black-input"
                placeholder="Enter link"
                value={tempLink}
                onChange={(e) => setTempLink(e.target.value)}
              />
              <button onClick={handleSave} className="add-link-btn">
                <FaPlus /> Add
              </button>
            </div>
          ) : socialLinks[platform] ? (
            <a
              href={socialLinks[platform]}
              target="_blank"
              rel="noopener noreferrer"
              className="social-name"
              style={{textDecoration:'none'}}
            >
              {platformNames[platform]}
            </a>
          ) : (
            <button onClick={() => setEditingField(platform)} className="edit-link-btn">
              <FaEdit /> Add Link
            </button>
          )}
        </li>
      ))}
    </ul>
    </div>
  );
};

export default SocialLinksCard;
