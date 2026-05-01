import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BrainCircuit, CalendarPlus, ClipboardList, CreditCard, Megaphone, UserPlus } from "lucide-react";

import { fetchAnalytics } from "../lib/api";

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<{
    totalSessions: number;
    totalFaculty: number;
    totalStudents: number;
    last7Days: { totalRecords: number; checkedOut: number; attendanceRate: number };
    signals: { pendingLeaves: number; feedbackAvg: number };
  } | null>(null);

  useEffect(() => {
    fetchAnalytics().then(setAnalytics).catch(() => setAnalytics(null));
  }, []);

  return (
    <>
      <section className="hero">
        <div>
          <span className="badge">Live campus</span>
          <h2>Attendance, insights, and timetable in one place.</h2>
          <p>Track daily participation, manage sessions, and spotlight faculty activity in real time.</p>
        </div>
        <Link className="button" to="/sessions">
          <CalendarPlus size={18} /> Create session
        </Link>
      </section>

      <section className="quick-actions" aria-label="Quick actions">
        <Link className="action-tile" to="/sessions">
          <CalendarPlus size={20} />
          <span>
            <strong>Schedule a class</strong>
            <small>Create courses and timetable sessions.</small>
          </span>
        </Link>
        <Link className="action-tile" to="/people">
          <UserPlus size={20} />
          <span>
            <strong>Add people</strong>
            <small>Manage departments, batches, staff, and students.</small>
          </span>
        </Link>
        <Link className="action-tile" to="/exams">
          <ClipboardList size={20} />
          <span>
            <strong>Plan examinations</strong>
            <small>Schedule exams and record student results.</small>
          </span>
        </Link>
        <Link className="action-tile" to="/payments">
          <CreditCard size={20} />
          <span>
            <strong>Track payments</strong>
            <small>Create fee records and update payment status.</small>
          </span>
        </Link>
        <Link className="action-tile" to="/engagement">
          <Megaphone size={20} />
          <span>
            <strong>Publish an update</strong>
            <small>Send announcements and review campus signals.</small>
          </span>
        </Link>
        <Link className="action-tile" to="/ai">
          <BrainCircuit size={20} />
          <span>
            <strong>Open Campus AI</strong>
            <small>Review risk signals and suggested actions.</small>
          </span>
        </Link>
      </section>

      <section className="grid">
        <div className="card">
          <h3>Total sessions</h3>
          <div className="kpi">{analytics?.totalSessions ?? "--"}</div>
          <p>Active timetable entries across departments.</p>
        </div>
        <div className="card">
          <h3>Faculty roster</h3>
          <div className="kpi">{analytics?.totalFaculty ?? "--"}</div>
          <p>Instructors with attendance access.</p>
        </div>
        <div className="card">
          <h3>Student count</h3>
          <div className="kpi">{analytics?.totalStudents ?? "--"}</div>
          <p>Active student profiles.</p>
        </div>
        <div className="card">
          <h3>7-day attendance</h3>
          <div className="kpi">{analytics?.last7Days.attendanceRate ?? 0}%</div>
          <p>{analytics?.last7Days.checkedOut ?? 0} checkouts completed.</p>
        </div>
        <div className="card">
          <h3>Signals</h3>
          <div className="kpi">{analytics?.signals.feedbackAvg ?? 0}/5</div>
          <p>{analytics?.signals.pendingLeaves ?? 0} leave requests pending.</p>
        </div>
      </section>
    </>
  );
}
