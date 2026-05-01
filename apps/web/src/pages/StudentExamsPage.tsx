import { useEffect, useState } from "react";

import { fetchExamResults, fetchExams } from "../lib/api";

type Exam = Awaited<ReturnType<typeof fetchExams>>[number];
type Result = Awaited<ReturnType<typeof fetchExamResults>>[number];

export default function StudentExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    Promise.all([fetchExams(), fetchExamResults()])
      .then(([examData, resultData]) => {
        setExams(examData);
        setResults(resultData);
      })
      .catch(() => {
        setExams([]);
        setResults([]);
      });
  }, []);

  const resultFor = (examId: string) => results.find((result) => result.examId === examId);

  return (
    <div className="card">
      <div className="section-title">
        <h3>My exams</h3>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Exam</th>
              <th>Date</th>
              <th>Time</th>
              <th>Marks</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => {
              const result = resultFor(exam._id);
              return (
                <tr key={exam._id}>
                  <td data-label="Exam">{exam.title}</td>
                  <td data-label="Date">{exam.date}</td>
                  <td data-label="Time">
                    {exam.startTime} - {exam.endTime}
                  </td>
                  <td data-label="Marks">{result ? `${result.marks}/${exam.maxMarks}` : "--"}</td>
                  <td data-label="Grade">{result?.grade ?? "--"}</td>
                </tr>
              );
            })}
            {exams.length === 0 ? (
              <tr>
                <td data-label="Exams" colSpan={5}>
                  No exams assigned yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
