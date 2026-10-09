import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { type Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { fullName, statusBadgeClass } from "@/lib/student";
import { StudentPhoto } from "@/components/StudentPhoto";

export interface StudentDetailProps {
  id: Id<"students">;
  onEdit: () => void;
  onBack: () => void;
}

export function StudentDetail({ id, onEdit, onBack }: StudentDetailProps) {
  const student = useQuery(api.students.getById, { id });
  const remove = useMutation(api.students.remove);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setError(null);
    setDeleting(true);
    try {
      await remove({ id });
      onBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete student.");
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (student === undefined) {
    return <p className="muted">Loading student…</p>;
  }
  if (student === null) {
    return (
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Student not found</h2>
        <p className="muted">
          The student you are looking for has been removed or never existed.
        </p>
        <button className="btn btn-secondary" onClick={onBack}>
          Back to list
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <StudentPhoto url={student.photoUrl} name={fullName(student)} size="lg" />
          <div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onBack}
            >
              ← Back
            </button>
            <h1 style={{ marginTop: 12, marginBottom: 4 }}>{fullName(student)}</h1>
            <p style={{ margin: 0 }}>
              Matric <strong>{student.matricNumber}</strong> ·{" "}
              <span className={statusBadgeClass(student.status)}>
                {student.status}
              </span>
            </p>
          </div>
        </div>
        <div className="flex">
          <button className="btn btn-secondary" onClick={onEdit}>
            Edit
          </button>
          {!confirming ? (
            <button
              className="btn btn-danger"
              onClick={() => setConfirming(true)}
              disabled={deleting}
            >
              Delete
            </button>
          ) : (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setConfirming(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => void handleDelete()}
                disabled={deleting}
              >
                {deleting && <span className="spinner" />}
                Confirm delete
              </button>
            </>
          )}
        </div>
      </div>

      {error && <div className="notice notice-error">{error}</div>}

      <div className="card">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Personal</h2>
        <div className="detail-grid">
          <div>
            <div className="label">First name</div>
            <div className="value">{student.firstName}</div>
          </div>
          <div>
            <div className="label">Last name</div>
            <div className="value">{student.lastName}</div>
          </div>
          <div>
            <div className="label">Middle name</div>
            <div className="value">{student.middleName || "—"}</div>
          </div>
          <div>
            <div className="label">Gender</div>
            <div className="value">{student.gender}</div>
          </div>
          <div>
            <div className="label">Date of birth</div>
            <div className="value">{student.dateOfBirth}</div>
          </div>
          <div>
            <div className="label">State of origin</div>
            <div className="value">{student.stateOfOrigin || "—"}</div>
          </div>
        </div>
      </div>

      <div className="card mt-2">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Contact</h2>
        <div className="detail-grid">
          <div>
            <div className="label">Email</div>
            <div className="value">{student.email}</div>
          </div>
          <div>
            <div className="label">Phone</div>
            <div className="value">{student.phone}</div>
          </div>
          <div className="full">
            <div className="label">Address</div>
            <div className="value">{student.address || "—"}</div>
          </div>
        </div>
      </div>

      <div className="card mt-2">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Academic</h2>
        <div className="detail-grid">
          <div>
            <div className="label">Level</div>
            <div className="value">{student.level}</div>
          </div>
          <div>
            <div className="label">Program</div>
            <div className="value">{student.program}</div>
          </div>
          <div>
            <div className="label">Entry year</div>
            <div className="value">{student.entryYear}</div>
          </div>
          <div>
            <div className="label">Graduation year</div>
            <div className="value">{student.graduationYear || "—"}</div>
          </div>
        </div>
      </div>

      <div className="card mt-2">
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Guardian / Next of kin</h2>
        <div className="detail-grid">
          <div>
            <div className="label">Name</div>
            <div className="value">{student.guardianName}</div>
          </div>
          <div>
            <div className="label">Relationship</div>
            <div className="value">{student.guardianRelationship || "—"}</div>
          </div>
          <div>
            <div className="label">Phone</div>
            <div className="value">{student.guardianPhone}</div>
          </div>
          <div>
            <div className="label">Email</div>
            <div className="value">{student.guardianEmail || "—"}</div>
          </div>
        </div>
      </div>

      {student.notes && (
        <div className="card mt-2">
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Notes</h2>
          <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{student.notes}</p>
        </div>
      )}

      <p className="muted" style={{ marginTop: 12 }}>
        Record created on {new Date(student._creationTime).toLocaleString()}
      </p>
    </div>
  );
}
