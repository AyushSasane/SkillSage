// import React, { useEffect, useState } from 'react';
// import { Line } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   LineElement,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   Tooltip,
//   Legend,
// } from 'chart.js';
// import { db, auth } from '../firebase';
// import { collection, query, where, getDocs } from 'firebase/firestore';
// import { onAuthStateChanged } from 'firebase/auth';

// ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

// const LineGraph = () => {
//   const [quizData, setQuizData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const categoryColors = {
//     Linux: 'rgba(255, 99, 132, 1)',
//     DevOps: 'rgba(54, 162, 235, 1)',
//     Networking: 'rgba(255, 206, 86, 1)',
//     Programming: 'rgba(75, 192, 192, 1)',
//     Cloud: 'rgba(153, 102, 255, 1)',
//     Docker: 'rgba(255, 159, 64, 1)',
//     Kubernetes: 'rgba(0, 204, 102, 1)',
//   };

//   useEffect(() => {
//     const fetchQuizData = async (user) => {
//       setLoading(true);

//       const email = user.email;
//       const studentsRef = collection(db, 'students');
//       const q = query(studentsRef, where('email', '==', email));
//       const querySnapshot = await getDocs(q);

//       if (querySnapshot.empty) {
//         console.error('No student found with this email.');
//         setLoading(false);
//         return;
//       }

//       const studentData = querySnapshot.docs[0].data();

//       if (Array.isArray(studentData.quizHistory)) {
//         const quizByCategory = {};
//         studentData.quizHistory.forEach((quiz, index) => {
//           if (!quizByCategory[quiz.category]) {
//             quizByCategory[quiz.category] = { labels: [], scores: [] };
//           }
//           quizByCategory[quiz.category].labels.push(`Quiz ${index + 1}`);
//           quizByCategory[quiz.category].scores.push(quiz.score);
//         });

//         setQuizData(quizByCategory);
//       } else {
//         console.error('No quiz history found.');
//       }
//       setLoading(false);
//     };

//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         fetchQuizData(user);
//       } else {
//         console.error('No user is currently signed in.');
//         setLoading(false);
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   const chartData = {
//     labels: Array.from(
//       new Set(Object.values(quizData).flatMap((category) => category.labels))
//     ),
//     datasets: Object.entries(quizData).map(([category, data]) => ({
//       label: category,
//       data: data.scores,
//       borderColor: categoryColors[category] || 'rgba(0, 0, 0, 1)',
//       backgroundColor: categoryColors[category] || 'rgba(0, 0, 0, 0.2)',
//       borderWidth: 2,
//       tension: 0.2,
//       pointBackgroundColor: categoryColors[category] || 'rgba(0, 0, 0, 1)',
//       fill: false,
//     })),
//   };

//   const options = {
//     scales: {
//       y: {
//         beginAtZero: true,
//         max: 10,
//       },
//     },
//     animation: {
//       duration: 0,
//     },
//   };

//   if (loading) {
//     return (
//       <div className="text-center">
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
//         <p>Loading quiz progress...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container my-3 text-start">
//       <h2 className="mb-4" style={{fontFamily: "'Lexend', sans-serif", fontSize:'24px'}}>Quiz Progress</h2>
//       <div style={{ width: '600px', maxWidth: '100%', overflowX: 'auto' }}>
//         <Line data={chartData} options={options} />
//       </div>
//     </div>
//   );
// };

// export default LineGraph;


import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const LineGraph = () => {
  const [quizData, setQuizData] = useState({});
  const [loading, setLoading] = useState(true);
  const [labels, setLabels] = useState([]);

  const categoryColors = {
    Linux: 'rgba(255, 99, 132, 1)',
    DevOps: 'rgba(54, 162, 235, 1)',
    Networking: 'rgba(255, 206, 86, 1)',
    Programming: 'rgba(75, 192, 192, 1)',
    Cloud: 'rgba(153, 102, 255, 1)',
    Docker: 'rgba(255, 159, 64, 1)',
    Kubernetes: 'rgba(0, 204, 102, 1)',
  };

  useEffect(() => {
    let unsubscribe;

    const fetchQuizData = (user) => {
      if (!user) {
        console.error('No user signed in.');
        setLoading(false);
        return;
      }

      setLoading(true);

      const email = user.email;
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, where('email', '==', email));

      // Listen for real-time updates
      unsubscribe = onSnapshot(q, (querySnapshot) => {
        if (querySnapshot.empty) {
          console.error('No student found with this email.');
          setQuizData({});
          setLabels([]);
          setLoading(false);
          return;
        }

        const studentData = querySnapshot.docs[0].data();
        const quizHistory = studentData.quizHistory || [];

        if (quizHistory.length === 0) {
          console.error('No quiz history found.');
          setQuizData({});
          setLabels([]);
          setLoading(false);
          return;
        }

        // Organizing quiz data by category
        const quizByCategory = {};
        const quizLabels = [];

        quizHistory.forEach((quiz, index) => {
          if (!quizByCategory[quiz.category]) {
            quizByCategory[quiz.category] = { labels: [], scores: [] };
          }
          quizByCategory[quiz.category].labels.push(`Quiz ${index + 1}`);
          quizByCategory[quiz.category].scores.push(quiz.score);
          quizLabels.push(`Quiz ${index + 1}`);
        });

        setQuizData(quizByCategory);
        setLabels([...new Set(quizLabels)]); // Ensuring unique and sorted labels
        setLoading(false);
      });
    };

    // Listen for authentication changes
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchQuizData(user);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe(); // Unsubscribe from Firestore updates
      authUnsubscribe(); // Unsubscribe from auth listener
    };
  }, []);

  const chartData = {
    labels: labels,
    datasets: Object.entries(quizData).map(([category, data]) => ({
      label: category,
      data: data.scores,
      borderColor: categoryColors[category] || 'rgba(0, 0, 0, 1)',
      backgroundColor: categoryColors[category] || 'rgba(0, 0, 0, 0.2)',
      borderWidth: 2,
      tension: 0.2,
      pointBackgroundColor: categoryColors[category] || 'rgba(0, 0, 0, 1)',
      fill: false,
    })),
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
      },
    },
    animation: {
      duration: 0,
    },
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading quiz progress...</p>
      </div>
    );
  }

  return (
    <div className="container my-3 text-start">
      <h2 className="mb-4" style={{ fontFamily: "'Lexend', sans-serif", fontSize: '24px' }}>
        Quiz Progress
      </h2>
      <div style={{ width: '100%', maxWidth: '700px', overflowX: 'auto' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LineGraph;
