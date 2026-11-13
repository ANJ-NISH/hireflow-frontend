import { useEffect, useState, type FormEvent } from "react";
import {
  listNotes,
  addNote,
  deleteNote,
  listInterviews,
  scheduleInterview,
  cancelInterview,
  type ApplicationNote,
  type Interview,
  type InterviewMode,
} from "../lib/api/recruiterTools";

function formatDateTime(d: string) {
  return new Date(d).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

export default function ApplicationToolsPanel({ applicationId }: { applicationId: string }) {
  const [notes, setNotes] = useState<ApplicationNote[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const [scheduledAt, setScheduledAt] = useState("");
  const [mode, setMode] = useState<InterviewMode>("ONLINE");
  const [locationOrUrl, setLocationOrUrl] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    Promise.all([listNotes(applicationId), listInterviews(applicationId)])
      .then(([notesRes, interviewsRes]) => {
        setNotes(notesRes.notes);
        setInterviews(interviewsRes.interviews);
      })
      .catch((err) => setErrorMessage(err.message || "Could not load details"))
      .finally(() => setLoading(false));
  }, [applicationId]);

  const handleAddNote = async (e: FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      const { note } = await addNote(applicationId, noteText.trim());
      setNotes((prev) => [note, ...prev]);
      setNoteText("");
    } catch (err: any) {
      setErrorMessage(err.message || "Could not add note");
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err: any) {
      setErrorMessage(err.message || "Could not delete note");
    }
  };

  const handleSchedule = async (e: FormEvent) => {
    e.preventDefault();
    if (!scheduledAt) return;
    setScheduling(true);
    try {
      const { interview } = await scheduleInterview(applicationId, {
        scheduledAt: new Date(scheduledAt).toISOString(),
        mode,
        locationOrUrl: locationOrUrl || undefined,
        notes: interviewNotes || undefined,
      });
      setInterviews((prev) => [...prev, interview].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)));
      setScheduledAt("");
      setLocationOrUrl("");
      setInterviewNotes("");
    } catch (err: any) {
      setErrorMessage(err.message || "Could not schedule interview");
    } finally {
      setScheduling(false);
    }
  };

  const handleCancelInterview = async (id: string) => {
    try {
      const { interview } = await cancelInterview(id);
      setInterviews((prev) => prev.map((i) => (i.id === id ? interview : i)));
    } catch (err: any) {
      setErrorMessage(err.message || "Could not cancel interview");
    }
  };

  if (loading) return <p className="text-sm text-ink-soft">Loading notes & interviews…</p>;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {errorMessage && (
        <p className="col-span-full rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>
      )}

      {/* Internal notes */}
      <div>
        <h4 className="text-sm font-semibold text-ink">Internal notes</h4>
        <form onSubmit={handleAddNote} className="mt-2 flex gap-2">
          <input
            type="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a private note…"
            className="flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={addingNote}
            className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-deep disabled:opacity-50"
          >
            Add
          </button>
        </form>

        <div className="mt-3 flex flex-col gap-2">
          {notes.length === 0 && <p className="text-xs text-ink-soft">No notes yet.</p>}
          {notes.map((n) => (
            <div key={n.id} className="rounded-lg bg-surface p-3">
              <p className="text-sm text-ink-soft">{n.note}</p>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-xs text-ink-soft/60">{n.recruiter.name} · {formatDateTime(n.createdAt)}</p>
                <button onClick={() => handleDeleteNote(n.id)} className="text-xs font-semibold text-red-500 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interviews */}
      <div>
        <h4 className="text-sm font-semibold text-ink">Interviews</h4>
        <form onSubmit={handleSchedule} className="mt-2 flex flex-col gap-2">
          <input
            type="datetime-local"
            required
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <div className="flex gap-2">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as InterviewMode)}
              className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="ONLINE">Online</option>
              <option value="ONSITE">On-site</option>
              <option value="PHONE">Phone</option>
            </select>
            <input
              type="text"
              value={locationOrUrl}
              onChange={(e) => setLocationOrUrl(e.target.value)}
              placeholder="Link or address (optional)"
              className="flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <input
            type="text"
            value={interviewNotes}
            onChange={(e) => setInterviewNotes(e.target.value)}
            placeholder="Notes for this interview (optional)"
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={scheduling}
            className="self-start rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-deep disabled:opacity-50"
          >
            {scheduling ? "Scheduling…" : "Schedule interview"}
          </button>
        </form>

        <div className="mt-3 flex flex-col gap-2">
          {interviews.length === 0 && <p className="text-xs text-ink-soft">No interviews scheduled.</p>}
          {interviews.map((iv) => (
            <div key={iv.id} className="rounded-lg bg-surface p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-ink">{formatDateTime(iv.scheduledAt)}</p>
                  <p className="text-xs text-ink-soft">{iv.mode}{iv.locationOrUrl ? ` · ${iv.locationOrUrl}` : ""}</p>
                  {iv.notes && <p className="mt-1 text-xs text-ink-soft">{iv.notes}</p>}
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  iv.status === "SCHEDULED" ? "bg-primary-soft text-primary" :
                  iv.status === "COMPLETED" ? "bg-emerald-50 text-success" : "bg-surface text-ink-soft/60"
                }`}>
                  {iv.status}
                </span>
              </div>
              {iv.status === "SCHEDULED" && (
                <button
                  onClick={() => handleCancelInterview(iv.id)}
                  className="mt-2 text-xs font-semibold text-red-500 hover:underline"
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}