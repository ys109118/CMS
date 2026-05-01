import dayjs from "dayjs";
import { Router } from "express";
import { z } from "zod";

import { requireAuth, requireRole } from "../middleware/auth";
import { Payment } from "../models/Payment";

const router = Router();

const paymentSchema = z.object({
  studentId: z.string().min(1),
  title: z.string().min(1),
  amount: z.number().min(0),
  dueDate: z.string().min(8),
});

const statusSchema = z.object({
  status: z.enum(["pending", "paid", "overdue", "waived"]),
  method: z.string().optional(),
});

router.get("/", requireAuth, async (req, res) => {
  const query = req.user?.role === "student" ? { studentId: req.user.id } : {};
  const payments = await Payment.find(query).sort({ dueDate: 1 });
  return res.json(payments);
});

router.post("/", requireAuth, requireRole(["admin"]), async (req, res) => {
  const parsed = paymentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }
  const payment = await Payment.create({
    ...parsed.data,
    status: dayjs(parsed.data.dueDate).isBefore(dayjs(), "day") ? "overdue" : "pending",
  });
  return res.status(201).json(payment);
});

router.patch("/:id/status", requireAuth, requireRole(["admin"]), async (req, res) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }
  const payment = await Payment.findById(req.params.id);
  if (!payment) {
    return res.status(404).json({ error: "Payment record not found" });
  }
  payment.status = parsed.data.status;
  payment.method = parsed.data.method || null;
  payment.paidAt = parsed.data.status === "paid" ? dayjs().toISOString() : null;
  await payment.save();
  return res.json(payment);
});

export default router;
