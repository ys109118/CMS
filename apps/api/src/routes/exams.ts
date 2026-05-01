import { Router } from "express";
import { z } from "zod";

import { requireAuth, requireRole } from "../middleware/auth";
import { Exam } from "../models/Exam";
import { ExamResult } from "../models/ExamResult";
import { User } from "../models/User";

const router = Router();

const examSchema = z.object({
  title: z.string().min(1),
  courseId: z.string().min(1),
  batchId: z.string().min(1),
  date: z.string().min(8),
  startTime: z.string().min(4),
  endTime: z.string().min(4),
  room: z.string().optional(),
  maxMarks: z.number().min(1),
  status: z.enum(["scheduled", "completed"]).optional(),
});

const resultSchema = z.object({
  examId: z.string().min(1),
  studentId: z.string().min(1),
  marks: z.number().min(0),
  grade: z.string().optional(),
  remarks: z.string().optional(),
});

router.get("/", requireAuth, async (req, res) => {
  if (req.user?.role === "student") {
    const user = await User.findById(req.user.id).select("batchId");
    if (!user?.batchId) {
      return res.json([]);
    }
    const exams = await Exam.find({ batchId: user.batchId }).sort({ date: 1, startTime: 1 });
    return res.json(exams);
  }
  const exams = await Exam.find().sort({ date: 1, startTime: 1 });
  return res.json(exams);
});

router.post("/", requireAuth, requireRole(["admin"]), async (req, res) => {
  const parsed = examSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }
  const exam = await Exam.create({
    ...parsed.data,
    room: parsed.data.room || null,
    status: parsed.data.status ?? "scheduled",
  });
  return res.status(201).json(exam);
});

router.get("/results", requireAuth, async (req, res) => {
  if (req.user?.role === "student") {
    const results = await ExamResult.find({ studentId: req.user.id }).sort({ createdAt: -1 });
    return res.json(results);
  }
  const results = await ExamResult.find().sort({ createdAt: -1 });
  return res.json(results);
});

router.post("/results", requireAuth, requireRole(["admin", "faculty"]), async (req, res) => {
  const parsed = resultSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }
  const result = await ExamResult.findOneAndUpdate(
    { examId: parsed.data.examId, studentId: parsed.data.studentId },
    {
      examId: parsed.data.examId,
      studentId: parsed.data.studentId,
      marks: parsed.data.marks,
      grade: parsed.data.grade || null,
      remarks: parsed.data.remarks || null,
    },
    { upsert: true, new: true }
  );
  return res.status(201).json(result);
});

export default router;
