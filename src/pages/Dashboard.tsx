import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { fullName } from "@/lib/student";
import { StudentPhoto } from "@/components/StudentPhoto";

export interface DashboardProps {
  onView: () => void;
  onAddStudent: () => void;
}

export function Dashboard({ onView, onAddStudent }: DashboardProps) {
  const counts = useQuery(api.students.counts);
  const totals = useQuery(api.students.list, {
    paginationOpts: { numItems: 5, cursor: null },
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of student records in the Computer Engineering department.</p>
        </div>
        <button className="btn" onClick={onAddStudent}>
          + Add student
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-tile">
          <span className="stat-label">Total students</span>
          <span className="stat-value">
            {counts === undefined ? "…" : counts.total}
          </span>
        </div>
        {["ND1", "ND2"].map((level) => (
          <div className="stat-tile" key={level}>
            <span className="stat-label">Level {level}</span>
            <span className="stat-value">
              {counts === undefined ? "…" : (counts.byLevel[level] ?? 0)}
            </span>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="between" style={{ marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 16 }}>Status breakdown</h2>
        </div>
        {counts === undefined ? (
          <p className="muted">Loading…</p>
        ) : (
          <div className="stat-grid" style={{ marginBottom: 0 }}>
            {(["active", "graduated", "suspended", "withdrawn"] as const).map(
              (s) => (
                <div className="stat-tile" key={s}>
                  <span className="stat-label">{s}</span>
                  <span className="stat-value">
                    {counts.byStatus[s] ?? 0}
                  </span>
                </div>
              ),
            )}
          </div>
        )}
      </div>

      <div className="card mt-2">
        <div className="between" style={{ marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 16 }}>Recent students</h2>
          <button className="btn btn-secondary btn-sm" onClick={onView}>
            View all
          </button>
        </div>
        {totals === undefined ? (
          <p className="muted">Loading…</p>
        ) : totals.page.length === 0 ? (
          <p className="muted">No students yet. Add the first student record.</p>
        ) : (
          <div className="table-wrap" style={{ border: "none" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Matric</th>
                  <th>Student</th>
                  <th>Level</th>
                  <th>Program</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {totals.page.map((s) => (
                  <tr key={s._id}>
                    <td>{s.matricNumber}</td>
                    <td>
                      <div className="student-cell">
                        <StudentPhoto url={s.photoUrl} name={fullName(s)} />
                        <div className="student-cell-name">
                          <span>{fullName(s)}</span>
                          <small>{s.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>{s.level}</td>
                    <td>{s.program}</td>
                    <td>
                      <span className={`badge badge-${s.status}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
