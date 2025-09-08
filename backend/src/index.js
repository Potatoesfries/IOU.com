import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";

import noteRoutes from "./routes/notes.route.js";
import authRoutes from "./routes/auth.route.js";
import { connectDb } from "./lib/db.js";

dotenv.config();

const app = express();
const __dirname = path.resolve();
const PORT = process.env.PORT || 5001;

// CORS setup
const allowedOrigins = process.env.NODE_ENV === "production"
  ? [process.env.FRONTEND_URL] // set this in Railway env vars, e.g., https://yourfrontend.railway.app
  : ["http://localhost:5173"];

app.use(cors({ origin: allowedOrigins }));

// Middleware to parse JSON
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/debt-notes", noteRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const frontendDist = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendDist));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

// Start server only after DB connection
const startServer = async () => {
  try {
    await connectDb();
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to connect to DB:", err);
    process.exit(1); // exit if DB fails
  }
};

startServer();
