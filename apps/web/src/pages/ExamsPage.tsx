import { useEffect, useMemo, useState } from "react";

import {
  createExam,
  createExamResult,
  fetchBatches,
  fetchCourses,
  fetchExamResults,
  fetchExams,
  fetchUsers,
} from "../lib/api";

type Exam = Awaited<ReturnType<typeof fetchExams>>[number];
type ExamResult = Awaited<ReturnType<typeof fetchExamResults>>[number];
type Course = { _id: string; name: string; code: string };
type Batch = { _id: string; name: string };
type User = { _id: string; name: string; email: string; role: string; rollNumber: string | null };

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");
  const [room, setRoom] = useState("");
  const [maxMarks, setMaxMarks] = useState("100");
  const [examId, setExamId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [marks, setMarks] = useState("");
  const [grade, setGrade] = useState("");
  const [remarks, setRemarks] = useState("");

  const students = useMemo(() => users.filter((user) => user.role === "student"), [users]);
  const completedCount = exams.filter((exam) => exam.status === "completed").length;
  const scheduledCount = exams.filter((exam) => exam.status === "scheduled").length;

  const load = async () => {
    const [examData, resultData, courseData, batchData, userData] = await Promise.all([
      fetchExams(),
      fetchExamResults(),
      fetchCourses(),
      fetchBatches(),
      fetchUsers(),
    ]);
    setExams(examData);
    setResults(resultData);
    setCourses(courseData);
    setBatches(batchData);
    setUsers(userData);
  };

  useEffect(() => {
    load().catch(() => {
      setExams([]);
      setResults([]);
    });
  }, []);

  const handleCreateExam = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    try {
      await createExam({
        title,
        courseId,
        batchId,
        date,
        startTime,
        endTime,
        room: room || undefined,
        maxMarks: Number(maxMarks),
      });
      await load();
      setTitle("");
      setCourseId("");
      setBatchId("");
      setRoom("");
      setMaxMarks("100");
      setMessage("Exam scheduled.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Exam creation failed");
    }
  };

  const handleResult = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    try {
      await createExamResult({
        examId,
        studentId,
        marks: Number(marks),
        grade: grade || undefined,
        remarks: remarks || undefined,
      });
      await load();
      setExamId("");
      setStudentId("");
      setMarks("");
      setGrade("");
      setRemarks("");
      setMessage("Result saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Result save failed");
    }
  };

  return (
    <div className="grid">
      <section className="metric-strip wide-card">
        <div>
          <span>Scheduled exams</span>
          <strong>{scheduledCount}</strong>
        </div>
        <div>
          <span>Completed exams</span>
          <strong>{completedCount}</strong>
        </div>
        <div>
          <span>Results recorded</span>
          <strong>{results.length}</strong>
        </div>
      </section>

      <div className="card">
        <div className="section-title">
          <h3>Schedule exam</h3>
        </div>
        <form className="form-grid" onSubmit={handleCreateExam}>
          <label className="input">
            Title
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="input">
            Course
            <select value={courseId} onChange={(event) => setCourseId(event.target.value)}>
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.name}
                </option>
              ))}
            </select>
          </label>
          <label className="input">
            Batch
            <select value={batchId} onChange={(event) => setBatchId(event.target.value)}>
              <option value="">Select batch</option>
              {batches.map((batch) => (
                <option key={batch._id} value={batch._id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </label>
          <label className="input">
            Date
            <input value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <label className="input">
            Start
            <input value={startTime} onChange={(event) => setStartTime(event.target.value)} />
          </label>
          <label className="input">
            End
            <input value={endTime} onChange={(event) => setEndTime(event.target.value)} />
          </label>
          <label className="input">
            Room
            <input value={room} onChange={(event) => setRoom(event.target.value)} />
          </label>
          <label className="input">
            Max marks
            <input value={maxMarks} onChange={(event) => setMaxMarks(event.target.value)} />
          </label>
          <button className="button" type="submit">
            Schedule exam
          </button>
        </form>
        {message ? <div className="notice">{message}</div> : null}
      </div>

      <div className="card">
        <div className="section-title">
          <h3>Record result</h3>
        </div>
        <form className="form-grid" onSubmit={handleResult}>
          <label className="input">
            Exam
            <select value={examId} onChange={(event) => setExamId(event.target.value)}>
              <option value="">Select exam</option>
              {exams.map((exam) => (
                <option key={exam._id} value={exam._id}>
                  {exam.title}
                </option>
              ))}
            </select>
          </label>
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
            Marks
            <input value={marks} onChange={(event) => setMarks(event.target.value)} />
          </label>
          <label className="input">
            Grade
            <input value={grade} onChange={(event) => setGrade(event.target.value)} />
          </label>
          <label className="input">
            Remarks
            <input value={remarks} onChange={(event) => setRemarks(event.target.value)} />
          </label>
          <button className="button secondary" type="submit">
            Save result
          </button>
        </form>
      </div>

      <div className="card">
        <div className="section-title">
          <h3>Exam calendar</h3>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Exam</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam._id}>
                  <td data-label="Exam">{exam.title}</td>
                  <td data-label="Date">{exam.date}</td>
                  <td data-label="Time">
                    {exam.startTime} - {exam.endTime}
                  </td>
                  <td data-label="Status">{exam.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
