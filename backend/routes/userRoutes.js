import express from "express";
import {
  login,
  register,
  updateProfile,
  getUserData,
  changePassword
} from "../controllers/userController.js";
import { allowRoles, authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", authenticate, allowRoles("admin"), register);
router.post("/login", login);
// Auth routes
router.get("/", authenticate, allowRoles("admin", "accountant"), getUserData);

router.post(
  "/profile/update",
  authenticate,
  allowRoles("admin", "accountant"),
  updateProfile
);
router.post(
  "/change-password",
  authenticate,
  changePassword
);

export default router;
