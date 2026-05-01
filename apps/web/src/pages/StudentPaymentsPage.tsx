import { useEffect, useMemo, useState } from "react";

import { fetchPayments } from "../lib/api";

type Payment = Awaited<ReturnType<typeof fetchPayments>>[number];

const money = new Intl.NumberFormat("en-IN", { currency: "INR", style: "currency", maximumFractionDigits: 0 });

export default function StudentPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    fetchPayments().then(setPayments).catch(() => setPayments([]));
  }, []);

  const dueTotal = useMemo(
    () =>
      payments
        .filter((payment) => payment.status === "pending" || payment.status === "overdue")
        .reduce((sum, payment) => sum + payment.amount, 0),
    [payments]
  );

  return (
    <div className="grid">
      <section className="hero">
        <div>
          <span className="badge">Fee desk</span>
          <h2>{money.format(dueTotal)} due</h2>
          <p>View fee records and payment status. Online payment processing is not enabled in this demo.</p>
        </div>
      </section>
      <div className="card">
        <div className="section-title">
          <h3>My payments</h3>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Fee</th>
                <th>Amount</th>
                <th>Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td data-label="Fee">{payment.title}</td>
                  <td data-label="Amount">{money.format(payment.amount)}</td>
                  <td data-label="Due">{payment.dueDate}</td>
                  <td data-label="Status">{payment.status}</td>
                </tr>
              ))}
              {payments.length === 0 ? (
                <tr>
                  <td data-label="Payments" colSpan={4}>
                    No payment records assigned.
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
