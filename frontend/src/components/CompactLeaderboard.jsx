import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Badge } from 'react-bootstrap';

const CompactLeaderboard = () => {
  const [topUsers, setTopUsers] = useState([]);

  // Fetch top leaderboard users
  const fetchTopUsers = async () => {
    try {
      const leaderboardRef = collection(db, 'students');
      const q = query(leaderboardRef, orderBy('rank', 'asc'), limit(5));
      const querySnapshot = await getDocs(q);

      const users = querySnapshot.docs.map((doc) => doc.data());
      setTopUsers(users);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    }
  };

  useEffect(() => {
    fetchTopUsers();
  }, []);

  return (
    <div className="card p-3" style={{ width: '98.5%', minHeight: '250px', borderRadius: '3px', marginLeft: '10px' }}>
      <h5 style={{ fontFamily: "'Lexend', sans-serif", fontSize:'24px', paddingTop:'10px' }}>🏆 Top Leaderboard</h5>
      <br/>
      <ul className="list-group list-group-flush">
        {topUsers.length > 0 ? (
          topUsers.map((user, index) => (
            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
              <span>{index + 1}. {user.name}</span>
              <Badge bg="primary">Rank {user.rank}</Badge>
            </li>
          ))
        ) : (
          <li className="list-group-item">No leaderboard data available</li>
        )}
      </ul>
    </div>
  );
};

export default CompactLeaderboard;
