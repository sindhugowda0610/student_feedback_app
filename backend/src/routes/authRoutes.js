import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

// basic validators
const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
const isStrongPassword = (pw) =>
  /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/.test(pw); // ≥8, 1 number, 1 special

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role = "student" } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email, password required" });

    if (!isValidEmail(email))
      return res.status(400).json({ message: "Invalid email format" });

    if (!isStrongPassword(password))
      return res.status(400).json({
        message: "Weak password (min 8 chars, 1 number, 1 special char)"
      });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await user.matchPassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
