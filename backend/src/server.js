import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";   // ✅ new import

dotenv.config();

const app = express();

// middleware FIRST
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// routes AFTER middleware
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);                  // ✅ new route

// connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => res.send("API is running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on :${PORT}`));
