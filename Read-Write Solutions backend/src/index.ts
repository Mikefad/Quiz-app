import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import questionRoutes from "./routes/questions";
import quizRoutes from "./routes/quiz";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: false }));
app.use(express.json()); // ← REQUIRED for JSON bodies

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/quiz", quizRoutes);

app.listen(process.env.PORT || 4000, () => {
  console.log("API on :4000");
});
