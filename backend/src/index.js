import express from "express";
import dotenv from "dotenv";
import noteRoutes from "./routes/notes.route.js";
import authRoutes from "./routes/auth.route.js";
import { connectDb } from "./lib/db.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// CORS setup (adjust origin later for production if needed)
app.use(
  cors({
    origin: "http://localhost:5173", // for dev
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/debt-notes", noteRoutes);

// ----------------------
// Serve frontend build
// ----------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDist = path.join(__dirname, "../frontend/dist");

// Serve static files from Vite build
app.use(express.static(frontendDist));

// Catch-all route → send index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

// ----------------------
// Start server
// ----------------------
app.listen(port, () => {
  console.log("✅ Server is running on port", port);
  connectDb();
});
