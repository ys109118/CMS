import mongoose, { Schema } from "mongoose";

export interface ExamDocument extends mongoose.Document {
  title: string;
  courseId: mongoose.Types.ObjectId;
  batchId: mongoose.Types.ObjectId;
  date: string;
  startTime: string;
  endTime: string;
  room?: string | null;
  maxMarks: number;
  status: "scheduled" | "completed";
}

const ExamSchema = new Schema<ExamDocument>(
  {
    title: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    batchId: { type: Schema.Types.ObjectId, ref: "Batch", required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    room: { type: String, default: null },
    maxMarks: { type: Number, required: true, min: 1 },
    status: { type: String, required: true, enum: ["scheduled", "completed"], default: "scheduled" },
  },
  { timestamps: true }
);

export const Exam = mongoose.model<ExamDocument>("Exam", ExamSchema);
