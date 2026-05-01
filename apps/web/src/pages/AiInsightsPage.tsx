import { useEffect, useMemo, useState } from "react";
import { BrainCircuit, RefreshCw } from "lucide-react";

import { fetchAiInsights } from "../lib/api";

type AiInsights = Awaited<ReturnType<typeof fetchAiInsights>>;

export default function AiInsightsPage() {
  const [insights, setInsights] = useState<AiInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAiInsights();
      setInsights(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const generatedAt = useMemo(() => {
    if (!insights) return "";
    return new Date(insights.generatedAt).toLocaleString();
  }, [insights]);

  if (loading && !insights) {
    return <div className="card">Generating campus insights...</div>;
  }

  if (error && !insights) {
    return <div className="notice">{error}</div>;
  }

  return (
    <>
      <section className="hero ai-hero">
        <div>
          <span className="badge">Campus AI</span>
          <h2>Risk signals and next-best actions from live campus data.</h2>
          <p>Uses attendance, leave requests, feedback, and timetable load to produce explainable recommendations.</p>
        </div>
        <button className="button" onClick={loadInsights} disabled={loading}>
          <RefreshCw size={18} /> {loading ? "Refreshing" : "Refresh"}
        </button>
      </section>

      {insights ? (
        <>
          <section className="ai-summary">
            <div className={`ai-score ${insights.summary.riskLevel}`}>
              <BrainCircuit size={24} />
              <span>Risk score</span>
              <strong>{insights.summary.riskScore}</strong>
              <small>{insights.summary.riskLevel} priority</small>
            </div>
            <div className="metric-strip">
              <div>
                <span>Faculty completion</span>
                <strong>{insights.summary.facultyCompletionRate}%</strong>
              </div>
              <div>
                <span>Student participation</span>
                <strong>{insights.summary.studentParticipationRate}%</strong>
              </div>
              <div>
                <span>Feedback</span>
                <strong>{insights.summary.feedbackAverage}/5</strong>
              </div>
              <div>
                <span>Pending leaves</span>
                <strong>{insights.summary.pendingLeaves}</strong>
              </div>
            </div>
          </section>

          <section className="grid">
            {insights.cards.map((card) => (
              <article className={`card insight-card ${card.severity}`} key={card.title}>
                <div className="section-title">
                  <h3>{card.title}</h3>
                  <span className={`status-dot ${card.severity}`}>{card.value}</span>
                </div>
                <p>{card.insight}</p>
                <div className="recommendation">{card.action}</div>
              </article>
            ))}
          </section>

          <section className="card">
            <div className="section-title">
              <h3>Recommended actions</h3>
              <span className="muted-text">{generatedAt}</span>
            </div>
            <div className="recommendation-list">
              {insights.recommendations.map((item) => (
                <div className="recommendation" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </>
  );
}
