import express from 'express';
import { db } from '../firebaseAdmin.js'; // Firebase Admin SDK for Firestore

const router = express.Router();

// Leaderboard API
router.get('/', async (req, res) => {
  try {
    // Fetch all students from the Firestore 'students' collection
    const studentsSnapshot = await db.collection('students').get();
    const leaderboard = [];

    // Create leaderboard array and calculate total score for each student
    studentsSnapshot.forEach((doc) => {
      const studentData = doc.data();
      const totalScore = studentData.quizHistory?.reduce((acc, quiz) => acc + quiz.score, 0) || 0;
      leaderboard.push({
        id: doc.id,
        name: studentData.name,
        email: studentData.email,
        totalScore,
      });
    });

    // Sort leaderboard by totalScore in descending order
    leaderboard.sort((a, b) => b.totalScore - a.totalScore);

    // Update ranks and save the rank in the Firestore
    for (let i = 0; i < leaderboard.length; i++) {
      const studentId = leaderboard[i].id;
      const studentRank = i + 1;

      // Update the rank field for each student
      await db.collection('students').doc(studentId).update({
        rank: studentRank,
      });

      // Assign the rank to the student object to send in the response
      leaderboard[i].rank = studentRank;
    }

    // Send the sorted leaderboard with updated ranks
    res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
});

export const leaderBoard = router;
