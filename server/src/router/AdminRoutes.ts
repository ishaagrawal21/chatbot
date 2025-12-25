import express from "express";
import { adminLogin, getCurrentAdmin } from "../controller/admin.controller";
import auth from "../middleware/auth";

const router = express.Router();

router.post("/login", adminLogin);
router.get("/me", auth, getCurrentAdmin);

export default router;

