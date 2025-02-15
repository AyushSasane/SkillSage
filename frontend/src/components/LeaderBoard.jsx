import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LeaderBoard = () => {
  const [leaderBoardData, setLeaderBoardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/leaderboard');
        setLeaderBoardData(response.data); // Fetch leaderboard data from backend
        setLoading(false);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load leaderboard. Please try again later.');
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-danger text-center">{error}</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="text-left mb-4">Leaderboard</h2>
      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Email</th>
              <th>Total Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderBoardData.map((student, index) => (
              <tr
                key={student.email}
                style={{
                  backgroundColor: index % 2 === 0 ? '#f0f8ff' : 'white',
                  padding: '12px 15px',
                }}
              >
                <td>{student.rank}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.totalScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderBoard;
