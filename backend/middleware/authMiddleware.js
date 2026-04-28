import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-passwordHash");
    if (!req.user) return res.status(401).json({ error: "User not found" });
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export const allowRoles = (...roles) => {
  return (req, res, next) => {
    const user = req.user; // Assumes user is set in a previous auth middleware
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    next();
  };
};
