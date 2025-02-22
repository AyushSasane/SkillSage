import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Alert,
  Box,
  Button,
} from '@mui/material';

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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
        <Typography variant="body1" style={{ marginLeft: '16px' }}>
          Loading leaderboard...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" style={{ marginTop: '40px' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography  style={{fontFamily:'lexend, sans-serif', fontSize:'32px'}} variant="h5">Leaderboard</Typography>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Total Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderBoardData.map((student, index) => (
              <TableRow
                key={student.email}
                style={{
                  backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white',
                }}
              >
                <TableCell>{student.rank}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.totalScore}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default LeaderBoard;