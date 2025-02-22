// server.js

// import express from 'express';
// import cors from 'cors';
// import { jobSearchRoute } from './routes/jobSearchRoute.js'; // Import job search route
// import { registerRoute } from './routes/register.js'; // Import registration route
// import { authRoutes } from './routes/authRoutes.js'; // Import authentication routes
// import { SkillExtractionRoute } from './routes/SkillExtractionRoute.js'; // Skill extraction route
// import { leaderBoard } from './routes/leaderBoard.js';  // Leaderboard route

// const app = express();

// app.use(express.json()); // Parse JSON request bodies
// app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
// app.use(cors()); // Enable CORS for all routes

// // Set COOP and CORP headers to avoid blocking issues
// app.use((req, res, next) => {
//   res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
//   res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
//   next();
// });

// // Define API routes
// app.use('/api/jobsearch', jobSearchRoute); // Job search route
// app.use('/api', registerRoute); // Registration route
// app.use('/api', SkillExtractionRoute); // Skill extraction route
// app.use('/api', authRoutes); // Authentication routes
// app.use('/api/skill-extraction', SkillExtractionRoute);
// app.use('/api/leaderboard', leaderBoard);

// // Log incoming requests
// app.use((req, res, next) => {
//   console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
//   next();
// });

// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// server.js

import express from 'express';
import cors from 'cors';
import { jobSearchRoute } from './routes/jobSearchRoute.js';
import { registerRoute } from './routes/register.js';
import { authRoutes } from './routes/authRoutes.js';
import { SkillExtractionRoute } from './routes/SkillExtractionRoute.js';
import { leaderBoard } from './routes/leaderBoard.js';
import { quizRoute } from './routes/quiz.js'; // ✅ Import the quiz route
import dotenv from "dotenv";
import { ATSScoreRoute } from './routes/ATSScoreRoute.js';


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Set COOP and CORP headers
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  next();
});
app.use(cors({
  origin: "http://localhost:5173", // Replace with your frontend URL
  credentials: true,
}));

// ✅ Register API routes
app.use('/api/jobsearch', jobSearchRoute);
app.use('/api', registerRoute);
app.use('/api', SkillExtractionRoute);
app.use('/api', authRoutes);
app.use("/api", ATSScoreRoute);
app.use('/api/skill-extraction', SkillExtractionRoute);
app.use('/api/leaderboard', leaderBoard);
app.use('/api/quiz', quizRoute); // ✅ Now the quiz API is available

// Log incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

dotenv.config();