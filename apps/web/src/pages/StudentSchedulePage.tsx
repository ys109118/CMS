import { useEffect, useMemo, useState } from "react";

import { fetchStudentSchedule } from "../lib/api";

type Session = { _id: string; title: string; dayOfWeek: number; startTime: string; endTime: string };

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function StudentSchedulePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [dayFilter, setDayFilter] = useState("all");

  useEffect(() => {
    fetchStudentSchedule().then(setSessions).catch(() => setSessions([]));
  }, []);

  const filteredSessions = useMemo(() => {
    if (dayFilter === "all") return sessions;
    return sessions.filter((session) => session.dayOfWeek === Number(dayFilter));
  }, [dayFilter, sessions]);

  return (
    <div className="card">
      <div className="section-title">
        <h3>My timetable</h3>
        <label className="input compact-input">
          Day
          <select value={dayFilter} onChange={(event) => setDayFilter(event.target.value)}>
            <option value="all">All days</option>
            {days.map((day, index) => (
              <option key={day} value={index}>
                {day}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Session</th>
              <th>Day</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredSessions.map((session) => (
              <tr key={session._id}>
                <td data-label="Session">{session.title}</td>
                <td data-label="Day">{days[session.dayOfWeek]}</td>
                <td data-label="Time">
                  {session.startTime} - {session.endTime}
                </td>
              </tr>
            ))}
            {filteredSessions.length === 0 ? (
              <tr>
                <td data-label="Schedule" colSpan={3}>
                  No sessions for this day.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
