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

// CORS setup (allow both local dev and deployed site)
app.use(
  cors({
    origin: [
      "http://localhost:5173",       // local dev
      "https://iou-com.onrender.com" // deployed frontend
    ],
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

// Go 2 levels up: backend/src -> backend -> root -> frontend/dist
const frontendDist = path.join(__dirname, "../../frontend/dist");

app.use(express.static(frontendDist));

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
