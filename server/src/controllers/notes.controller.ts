import type { Request, Response } from "express";
import { z } from "zod";
import Note from "../models/note.model.js";

const createNoteSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().optional().default(""),
});

const updateNoteSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
});

export const createNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content } = createNoteSchema.parse(req.body);

    const note = await Note.create({
      title,
      content,
      userId: req.user!.id,
    });

    res.status(201).json({
      success: true,
      message: "Note created successfully",
      data: note,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: "Validation failed", errors: error.issues });
      return;
    }
    console.error("[createNote]", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const search = req.query.search as string | undefined;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {
      userId: req.user!.id,
      deletedAt: null,
    };

    if (search) {
      filter.$text = { $search: search };
    }

    const [notes, total] = await Promise.all([
      Note.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
      Note.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      message: "Notes fetched successfully",
      data: notes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[getNotes]", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getNoteById = async (req: Request, res: Response): Promise<void> => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user!.id,
      deletedAt: null,
    });

    if (!note) {
      res.status(404).json({ success: false, message: "Note not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Note fetched successfully",
      data: note,
    });
  } catch (error) {
    console.error("[getNoteById]", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const updates = updateNoteSchema.parse(req.body);

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id, deletedAt: null },
      updates,
      { returnDocument: "after" }
    );

    if (!note) {
      res.status(404).json({ success: false, message: "Note not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Note updated successfully",
      data: note,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: "Validation failed", errors: error.issues });
      return;
    }
    console.error("[updateNote]", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id, deletedAt: null },
      { deletedAt: new Date() },
      { returnDocument: "after" }
    );

    if (!note) {
      res.status(404).json({ success: false, message: "Note not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("[deleteNote]", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
