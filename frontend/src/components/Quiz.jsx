// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { db } from "../firebase";
// import { collection, query, where, getDocs, runTransaction } from "firebase/firestore";
// import { auth } from "../firebase";

// const Quiz = () => {
//   const [questions, setQuestions] = useState([]);
//   const [userAnswers, setUserAnswers] = useState({});
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [quizCompleted, setQuizCompleted] = useState(false);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [selectedCategory, setSelectedCategory] = useState(null);

//   // Valid categories as per quizapi.io documentation
//   const quizCategories = ['Linux', 'DevOps', 'Networking', 'Programming', 'Cloud', 'Docker', 'Kubernetes'];

//   const fetchQuestions = (category) => {
//     setLoading(true);
//     axios
//       .get('https://quizapi.io/api/v1/questions', {
//         params: {
//           apiKey: "eC6KdFkjESqGTyr8uye55uKHSdh8URRugFheUvJl",
//           category: category.toLowerCase(),
//           difficulty: 'Easy',
//           limit: 10,
//         },
//       })
//       .then((response) => {
//         const formattedQuestions = response.data.map((question) => ({
//           ...question,
//           incorrect_answers: Array.isArray(question.incorrect_answers)
//             ? question.incorrect_answers
//             : [],
//         }));
//         setQuestions(formattedQuestions);
//         setLoading(false);
//       })
//       .catch((error) => {
//         console.error('Error fetching questions:', error);
//         setError('Failed to load questions. Please try again later.');
//         setLoading(false);
//       });
//   };

//   // Handle category selection
//   const handleCategorySelect = (category) => {
//     setSelectedCategory(category);
//     fetchQuestions(category);
//   };

//   const handleAnswerSelect = (questionId, selectedAnswer) => {
//     setUserAnswers((prevAnswers) => ({
//       ...prevAnswers,
//       [questionId]: selectedAnswer,
//     }));
//   };

//   const handleNextQuestion = () => {
//     setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
//   };

//   const calculateScore = () => {
//     let score = 0;
//     questions.forEach((question) => {
//       if (userAnswers[question.id] === question.correct_answer) {
//         score += 1;
//       }
//     });
//     return score;
//   };

//   const saveQuizHistory = async (quizName, category, score) => {
//     const user = auth.currentUser;
//     if (!user) {
//       console.error('No user is currently signed in.');
//       return;
//     }

//     const email = user.email;
//     const studentsRef = collection(db, "students");

//     const q = query(studentsRef, where("email", "==", email));
//     const querySnapshot = await getDocs(q);

//     if (querySnapshot.empty) {
//       console.error("No student found with this email.");
//       return;
//     }

//     const studentDoc = querySnapshot.docs[0];
//     const studentDocRef = studentDoc.ref;

//     const quizHistoryEntry = {
//       quizName,
//       category, // Store category
//       score,
//       attemptDate: new Date().toISOString(), // Store the attempt date
//     };

//     try {
//       await runTransaction(db, async (transaction) => {
//         const studentDoc = await transaction.get(studentDocRef);

//         if (!studentDoc.exists()) {
//           throw new Error("Student document does not exist.");
//         }

//         const studentData = studentDoc.data();

//         if (!Array.isArray(studentData.quizHistory)) {
//           transaction.update(studentDocRef, { quizHistory: [] });
//         }

//         transaction.update(studentDocRef, {
//           quizHistory: [...(studentData.quizHistory || []), quizHistoryEntry],
//         });
//       });

//       console.log('Quiz history successfully saved!');
//     } catch (error) {
//       console.error('Error saving quiz history:', error);
//       setError('Failed to save quiz history. Please try again later.');
//     }
//   };

//   const handleSubmitQuiz = () => {
//     const score = calculateScore();
//     saveQuizHistory(selectedCategory, selectedCategory, score); // Pass category as parameter as well
//     setQuizCompleted(true);
//   };

//   // If quiz not started, show category selection
//   if (!selectedCategory) {
//     return (
//       <div className="container quiz-container">
//         <h2 className="text-left mb-4">Select a Quiz Category</h2>
//         <div className="row">
//           {quizCategories.map((category, index) => (
//             <div
//               key={index}
//               className="col-md-4 mb-4"
//               onClick={() => handleCategorySelect(category)}
//               style={{ cursor: 'pointer' }}
//             >
//               <div className="card shadow-sm border-primary text-center p-4">
//                 <div className="card-body">
//                   <h5 className="card-title">{category}</h5>
//                   <p className="card-text">Click to start a {category} quiz</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="text-center">
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
//         <p>Loading quiz questions...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return <div className="text-danger text-center">{error}</div>;
//   }

//   if (quizCompleted) {
//     const score = calculateScore();
//     return (
//       <div className="text-center">
//         <h3>Quiz Completed!</h3>
//         <p>Your score: {score}/{questions.length}</p>
//       </div>
//     );
//   }

//   const currentQuestion = questions[currentQuestionIndex];

//   return (
//     <div className="container quiz-container">
//       <div className="quiz-header text-left my-4">
//         <h2 className="text-primary">Quiz: {selectedCategory}</h2>
//         <p>Question {currentQuestionIndex + 1} of {questions.length}</p>
//       </div>

//       <div className="question mb-4 card shadow-sm p-4">
//         <h3>{currentQuestion.question}</h3>
//         {currentQuestion.description && (
//           <p><strong>Description:</strong> {currentQuestion.description}</p>
//         )}

//         <div className="options">
//           {Object.entries(currentQuestion.answers)
//             .filter(([_, value]) => value) 
//             .map(([key, answer]) => {
//               const isSelected = userAnswers[currentQuestion.id] === key;
//               return (
//                 <div key={key} className="card mb-3 shadow-sm">
//                   <div className={`card-body ${isSelected ? 'bg-success text-white' : ''}`}>
//                     <div className="form-check">
//                       <input
//                         type="radio"
//                         className="form-check-input"
//                         name={currentQuestion.id}
//                         value={key}
//                         checked={isSelected}
//                         onChange={() => handleAnswerSelect(currentQuestion.id, key)}
//                         id={`option-${key}`}
//                       />
//                       <label className="form-check-label" htmlFor={`option-${key}`}>
//                         {answer}
//                       </label>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//         </div>
//       </div>

//       <div className="quiz-footer text-center mt-4">
//         {currentQuestionIndex < questions.length - 1 ? (
//           <button className="btn btn-primary btn-lg" onClick={handleNextQuestion}>
//             Next Question
//           </button>
//         ) : (
//           <button className="btn btn-success btn-lg" onClick={handleSubmitQuiz}>
//             Submit Quiz
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Quiz;


//new
import React, { useEffect, useState } from "react";
import axios from "axios";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, runTransaction } from "firebase/firestore";
import "../../css/Quiz.css";

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState(null);

  const quizCategories = ["Linux", "DevOps", "Networking", "Programming", "Cloud", "Docker", "Kubernetes"];

  // Fetch quiz questions from backend
  const fetchQuestions = async (category) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`http://localhost:5000/api/quiz/generate-quiz?category=${category}`);
      setQuestions(response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setError("Failed to load questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    fetchQuestions(category);
  };

  // Handle user selecting an answer
  const handleAnswerSelect = (questionId, selectedAnswer) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: selectedAnswer }));
  };

  // Move to next question
  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  // Calculate score
  const calculateScore = () => {
    return questions.reduce((score, question) => {
      if (userAnswers[question.id] === question.correct_answer) score += 1;
      return score;
    }, 0);
  };

  // Save quiz results to Firebase
  const saveQuizHistory = async (score) => {
    const user = auth.currentUser;
    if (!user) {
      console.error("No user signed in.");
      return;
    }

    const email = user.email;
    const studentsRef = collection(db, "students");
    const q = query(studentsRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error("No student found with this email.");
      return;
    }

    const studentDoc = querySnapshot.docs[0];
    const studentDocRef = studentDoc.ref;

    const quizHistoryEntry = {
      quizName: selectedCategory,
      category: selectedCategory,
      score,
      attemptDate: new Date().toISOString(),
    };

    try {
      await runTransaction(db, async (transaction) => {
        const studentDoc = await transaction.get(studentDocRef);
        if (!studentDoc.exists()) throw new Error("Student does not exist.");

        transaction.update(studentDocRef, {
          quizHistory: [...(studentDoc.data().quizHistory || []), quizHistoryEntry],
        });
      });

      console.log("Quiz history saved!");
    } catch (error) {
      console.error("Error saving quiz history:", error);
    }
  };

  // Submit quiz
  const handleSubmitQuiz = async () => {
    const score = calculateScore();
    await saveQuizHistory(score);
    setQuizCompleted(true);
  };

  // Category selection screen
  if (!selectedCategory) {
    return (
      <div className="category-selection">
        <h2 style={{marginTop:'50px',marginBottom: '1rem'}}>Select a Quiz Category</h2>
        <div className="category-grid">
          {quizCategories.map((category) => (
            <button key={category} className="category-card" onClick={() => handleCategorySelect(category)}>
              {category}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Loading screen
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading quiz questions...</p>
      </div>
    );
  }

  // Error screen
  if (error) {
    return <div className="error-screen">{error}</div>;
  }

  // Quiz completed screen
  if (quizCompleted) {
    const score = calculateScore();
    return (
      <div className="quiz-completed">
        <h3>Quiz Completed!</h3>
        <p>Your score: {score}/{questions.length}</p>
      </div>
    );
  }

  // Current question
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="quiz-container">
      <h2>Quiz: {selectedCategory}</h2>
      <p>Question {currentQuestionIndex + 1} of {questions.length}</p>

      <div className="question-card">
        <h3>{currentQuestion.question}</h3>
        <div className="options">
          {Object.entries(currentQuestion.options).map(([key, answer]) => {
            const isSelected = userAnswers[currentQuestion.id] === key;
            return (
              <div key={key} className={`option ${isSelected ? "selected" : ""}`}>
                <label>
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={key}
                    checked={isSelected}
                    onChange={() => handleAnswerSelect(currentQuestion.id, key)}
                  />
                  {answer}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      <div className="navigation">
        {currentQuestionIndex < questions.length - 1 ? (
          <button className="btn-next" onClick={handleNextQuestion}>
            Next Question
          </button>
        ) : (
          <button className="btn-submit" onClick={handleSubmitQuiz}>
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
