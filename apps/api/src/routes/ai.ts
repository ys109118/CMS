import { Router } from "express";
import dayjs from "dayjs";

import { requireAuth, requireRole } from "../middleware/auth";
import { Attendance } from "../models/Attendance";
import { Feedback } from "../models/Feedback";
import { LeaveRequest } from "../models/LeaveRequest";
import { Session } from "../models/Session";
import { StudentAttendance } from "../models/StudentAttendance";
import { User } from "../models/User";

const router = Router();

function scoreSeverity(score: number) {
  if (score >= 75) return "high";
  if (score >= 45) return "medium";
  return "low";
}

router.get("/insights", requireAuth, requireRole(["admin"]), async (_req, res) => {
  const since = dayjs().subtract(7, "day").format("YYYY-MM-DD");
  const [sessions, facultyAttendance, studentAttendance, pendingLeaves, feedback, students, faculty] = await Promise.all([
    Session.find().sort({ dayOfWeek: 1, startTime: 1 }),
    Attendance.find({ date: { $gte: since } }),
    StudentAttendance.find({ date: { $gte: since } }),
    LeaveRequest.find({ status: "pending" }),
    Feedback.find(),
    User.find({ role: "student" }),
    User.find({ role: "faculty" }),
  ]);

  const checkedOut = facultyAttendance.filter((record) => record.status === "checked-out").length;
  const facultyCompletionRate =
    facultyAttendance.length === 0 ? 0 : Math.round((checkedOut / facultyAttendance.length) * 100);
  const presentStudentRecords = studentAttendance.filter((record) => record.status === "present" || record.status === "late").length;
  const studentParticipationRate =
    studentAttendance.length === 0 ? 0 : Math.round((presentStudentRecords / studentAttendance.length) * 100);
  const feedbackAverage =
    feedback.length === 0 ? 0 : Math.round((feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length) * 10) / 10;

  const dayLoad = Array.from({ length: 7 }, (_, day) => ({
    day,
    sessions: sessions.filter((session) => session.dayOfWeek === day).length,
  }));
  const busiestDay = dayLoad.reduce((highest, item) => (item.sessions > highest.sessions ? item : highest), dayLoad[0]);
  const lightestDay = dayLoad.reduce((lowest, item) => (item.sessions < lowest.sessions ? item : lowest), dayLoad[0]);
  const riskScore = Math.min(
    100,
    Math.round(
      (100 - facultyCompletionRate) * 0.35 +
        (100 - studentParticipationRate) * 0.3 +
        pendingLeaves.length * 8 +
        Math.max(0, 4 - feedbackAverage) * 12
    )
  );

  const cards = [
    {
      title: "Faculty checkout discipline",
      severity: scoreSeverity(100 - facultyCompletionRate),
      value: `${facultyCompletionRate}%`,
      insight:
        facultyCompletionRate >= 80
          ? "Most sessions are being closed properly."
          : "Several sessions are missing checkout completion, which can weaken attendance analytics.",
      action:
        facultyCompletionRate >= 80
          ? "Keep the current checkout routine visible in faculty workflows."
          : "Ask faculty to close sessions before leaving class and review open records daily.",
    },
    {
      title: "Student participation",
      severity: scoreSeverity(100 - studentParticipationRate),
      value: `${studentParticipationRate}%`,
      insight:
        studentParticipationRate >= 75
          ? "Recent student check-ins look healthy."
          : "Recent student check-ins are thin enough to deserve follow-up.",
      action:
        studentParticipationRate >= 75
          ? "Use this as the baseline for cohort health."
          : "Nudge batches with low check-ins and verify that session QR codes are visible.",
    },
    {
      title: "Leave queue",
      severity: scoreSeverity(pendingLeaves.length * 25),
      value: String(pendingLeaves.length),
      insight:
        pendingLeaves.length === 0
          ? "No pending leave requests are waiting."
          : "Pending leave requests may affect attendance interpretation.",
      action:
        pendingLeaves.length === 0
          ? "No immediate action needed."
          : "Resolve pending leave requests before weekly attendance review.",
    },
    {
      title: "Feedback sentiment",
      severity: scoreSeverity(Math.max(0, 5 - feedbackAverage) * 20),
      value: `${feedbackAverage}/5`,
      insight:
        feedbackAverage >= 4
          ? "Student feedback is currently positive."
          : "Feedback average suggests some sessions may need attention.",
      action:
        feedbackAverage >= 4
          ? "Pull strong session practices into faculty sharing."
          : "Review low-rated session comments and identify repeated friction.",
    },
  ];

  const recommendations = [
    `Balance timetable load by comparing the busiest day (${busiestDay.sessions} sessions) with the lightest day (${lightestDay.sessions} sessions).`,
    `Prioritize checkout completion for the next ${Math.min(Math.max(faculty.length, 1), 3)} faculty-facing reminders.`,
    `Use attendance and leave data together before escalating student absence concerns.`,
  ];

  return res.json({
    generatedAt: new Date().toISOString(),
    summary: {
      riskScore,
      riskLevel: scoreSeverity(riskScore),
      totalSessions: sessions.length,
      totalStudents: students.length,
      totalFaculty: faculty.length,
      facultyCompletionRate,
      studentParticipationRate,
      feedbackAverage,
      pendingLeaves: pendingLeaves.length,
    },
    cards,
    recommendations,
  });
});

export default router;
