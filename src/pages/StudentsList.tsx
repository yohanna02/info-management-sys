import { usePaginatedQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";
import {
  STUDENT_LEVELS,
  STUDENT_STATUSES,
  fullName,
  statusBadgeClass,
  type StudentLevel,
  type StudentStatus,
} from "@/lib/student";
import { StudentPhoto } from "@/components/StudentPhoto";

export interface StudentsListProps {
  onAdd: () => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
}

export function StudentsList({ onAdd, onEdit, onView }: StudentsListProps) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<StudentLevel | "">("");
  const [status, setStatus] = useState<StudentStatus | "">("");

  useEffect(() => {
    const handle = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const args = {
    level: level || undefined,
    status: status || undefined,
    search: search || undefined,
  };

  const { results, status: queryStatus, loadMore } = usePaginatedQuery(
    api.students.list,
    args,
    { initialNumItems: 10 },
  );

  function reset() {
    setSearchInput("");
    setSearch("");
    setLevel("");
    setStatus("");
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Student records</h1>
          <p>Manage enrolled students of the Computer Engineering department.</p>
        </div>
        <button className="btn" onClick={onAdd}>
          + Add student
        </button>
      </div>

      <div className="filters">
        <div>
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="search"
            placeholder="Search by name, matric, email, program…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="level">Level</label>
          <select
            id="level"
            value={level}
            onChange={(e) => setLevel(e.target.value as StudentLevel | "")}
          >
            <option value="">All</option>
            {STUDENT_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as StudentStatus | "")}
          >
            <option value="">All</option>
            {STUDENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={reset}
            disabled={!searchInput && !level && !status}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Matric</th>
              <th>Student</th>
              <th>Level</th>
              <th>Program</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {queryStatus === "LoadingFirstPage" && (
              <tr>
                <td colSpan={6} className="table-empty">
                  Loading…
                </td>
              </tr>
            )}
            {queryStatus !== "LoadingFirstPage" && results.length === 0 && (
              <tr>
                <td colSpan={6} className="table-empty">
                  No students match the current filters.
                </td>
              </tr>
            )}
            {results.map((s) => (
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
                  <span className={statusBadgeClass(s.status)}>{s.status}</span>
                </td>
                <td>
                  <div
                    className="row-actions"
                    style={{ justifyContent: "flex-end" }}
                  >
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onView(s._id)}
                    >
                      View
                    </button>
                    <button
                      className="btn btn-sm"
                      onClick={() => onEdit(s._id)}
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(queryStatus === "LoadingMore" || queryStatus === "CanLoadMore") && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
          <button
            className="btn btn-secondary"
            disabled={queryStatus === "LoadingMore"}
            onClick={() => loadMore(20)}
          >
            {queryStatus === "LoadingMore"
              ? "Loading…"
              : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
