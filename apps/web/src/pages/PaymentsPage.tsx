import { useEffect, useMemo, useState } from "react";

import { createPayment, fetchPayments, fetchUsers, updatePaymentStatus } from "../lib/api";

type Payment = Awaited<ReturnType<typeof fetchPayments>>[number];
type User = { _id: string; name: string; email: string; role: string; rollNumber: string | null };

const money = new Intl.NumberFormat("en-IN", { currency: "INR", style: "currency", maximumFractionDigits: 0 });

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [studentId, setStudentId] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [message, setMessage] = useState<string | null>(null);

  const students = useMemo(() => users.filter((user) => user.role === "student"), [users]);
  const totals = useMemo(
    () => ({
      pending: payments.filter((payment) => payment.status === "pending").reduce((sum, payment) => sum + payment.amount, 0),
      overdue: payments.filter((payment) => payment.status === "overdue").reduce((sum, payment) => sum + payment.amount, 0),
      paid: payments.filter((payment) => payment.status === "paid").reduce((sum, payment) => sum + payment.amount, 0),
    }),
    [payments]
  );

  const load = async () => {
    const [paymentData, userData] = await Promise.all([fetchPayments(), fetchUsers()]);
    setPayments(paymentData);
    setUsers(userData);
  };

  useEffect(() => {
    load().catch(() => {
      setPayments([]);
      setUsers([]);
    });
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    try {
      await createPayment({ studentId, title, amount: Number(amount), dueDate });
      await load();
      setStudentId("");
      setTitle("");
      setAmount("");
      setMessage("Fee record created.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Fee creation failed");
    }
  };

  const handleStatus = async (payment: Payment, status: "pending" | "paid" | "overdue" | "waived") => {
    await updatePaymentStatus(payment._id, status, status === "paid" ? "manual receipt" : undefined);
    await load();
  };

  const studentName = (id: string) => students.find((student) => student._id === id)?.name ?? "Student";

  return (
    <div className="grid">
      <section className="metric-strip wide-card">
        <div>
          <span>Pending</span>
          <strong>{money.format(totals.pending)}</strong>
        </div>
        <div>
          <span>Overdue</span>
          <strong>{money.format(totals.overdue)}</strong>
        </div>
        <div>
          <span>Collected</span>
          <strong>{money.format(totals.paid)}</strong>
        </div>
      </section>

      <div className="card">
        <div className="section-title">
          <h3>Create fee record</h3>
        </div>
        <form className="form-grid" onSubmit={handleCreate}>
          <label className="input">
            Student
            <select value={studentId} onChange={(event) => setStudentId(event.target.value)}>
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name}
                </option>
              ))}
            </select>
          </label>
          <label className="input">
            Fee title
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="input">
            Amount
            <input value={amount} onChange={(event) => setAmount(event.target.value)} />
          </label>
          <label className="input">
            Due date
            <input value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </label>
          <button className="button" type="submit">
            Create fee
          </button>
        </form>
        {message ? <div className="notice">{message}</div> : null}
      </div>

      <div className="card">
        <div className="section-title">
          <h3>Payment records</h3>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Fee</th>
                <th>Amount</th>
                <th>Due</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td data-label="Student">{studentName(payment.studentId)}</td>
                  <td data-label="Fee">{payment.title}</td>
                  <td data-label="Amount">{money.format(payment.amount)}</td>
                  <td data-label="Due">{payment.dueDate}</td>
                  <td data-label="Status">{payment.status}</td>
                  <td data-label="Action">
                    <div className="button-group">
                      <button className="button secondary" onClick={() => handleStatus(payment, "paid")}>
                        Mark paid
                      </button>
                      <button className="button secondary" onClick={() => handleStatus(payment, "waived")}>
                        Waive
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {payments.length === 0 ? (
                <tr>
                  <td data-label="Payments" colSpan={6}>
                    No payment records yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
