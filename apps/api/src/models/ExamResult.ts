import mongoose, { Schema } from "mongoose";

export interface ExamResultDocument extends mongoose.Document {
  examId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  marks: number;
  grade?: string | null;
  remarks?: string | null;
}

const ExamResultSchema = new Schema<ExamResultDocument>(
  {
    examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    marks: { type: Number, required: true, min: 0 },
    grade: { type: String, default: null },
    remarks: { type: String, default: null },
  },
  { timestamps: true }
);

ExamResultSchema.index({ examId: 1, studentId: 1 }, { unique: true });

export const ExamResult = mongoose.model<ExamResultDocument>("ExamResult", ExamResultSchema);
