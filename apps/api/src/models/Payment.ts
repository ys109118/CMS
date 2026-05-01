import mongoose, { Schema } from "mongoose";

export interface PaymentDocument extends mongoose.Document {
  studentId: mongoose.Types.ObjectId;
  title: string;
  amount: number;
  dueDate: string;
  status: "pending" | "paid" | "overdue" | "waived";
  paidAt?: string | null;
  method?: string | null;
}

const PaymentSchema = new Schema<PaymentDocument>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: String, required: true },
    status: { type: String, required: true, enum: ["pending", "paid", "overdue", "waived"], default: "pending" },
    paidAt: { type: String, default: null },
    method: { type: String, default: null },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<PaymentDocument>("Payment", PaymentSchema);
