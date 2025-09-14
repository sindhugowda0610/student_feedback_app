import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "User not found" });

    next();
  } catch {
    res.status(401).json({ message: "Not authorized" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin")
    return res.status(403).json({ message: "Admins only" });
  next();
};

