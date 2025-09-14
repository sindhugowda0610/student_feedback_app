import express from "express";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// GET current user's profile
router.get("/", protect, async (req, res) => {
  res.json(req.user);
});

// UPDATE profile
router.put("/", protect, async (req, res) => {
  const { name, phone, dob, address } = req.body;
  if (name !== undefined) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  if (dob !== undefined) req.user.dob = dob;
  if (address !== undefined) req.user.address = address;
  const saved = await req.user.save();
  res.json(saved);
});

// CHANGE password
router.put("/password", protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: "currentPassword and newPassword required" });

  const strong = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/.test(newPassword);
  if (!strong) return res.status(400).json({ message: "Weak password" });

  const ok = await req.user.matchPassword(currentPassword);
  if (!ok) return res.status(401).json({ message: "Current password incorrect" });

  req.user.password = newPassword;
  await req.user.save();
  res.json({ message: "Password updated" });
});

export default router;
