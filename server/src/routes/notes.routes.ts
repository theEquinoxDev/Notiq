import { Router } from "express";
import {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote
} from "../controllers/notes.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/", createNote);
router.get("/", getNotes);
router.get("/:id", getNoteById);
router.patch("/:id", updateNote);
router.delete("/:id", deleteNote);

export default router;