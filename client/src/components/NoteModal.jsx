import { useState, useEffect, useRef, useCallback } from "react";
import { HiOutlineX, HiOutlineTrash, HiCheck } from "react-icons/hi";
import { formatDateTime, wordCount } from "../utils/format";

const NoteModal = ({ note, onClose, onUpdate, onDelete }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle");
  const [confirming, setConfirming] = useState(false);
  const saveTimer = useRef(null);
  const latestNote = useRef(note);
  const titleRef = useRef(null);

  useEffect(() => { latestNote.current = note; }, [note]);

  useEffect(() => {
    if (!note) return;
    setTitle(note.title ?? "");
    setContent(note.content ?? "");
    setSaveStatus("idle");
    setConfirming(false);
    setTimeout(() => titleRef.current?.focus(), 80);
  }, [note?._id]);

  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  const triggerSave = useCallback((t, c) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const n = latestNote.current;
      if (t === n.title && c === n.content) return;
      setSaveStatus("saving");
      try {
        await onUpdate(n._id, { title: t || "Untitled", content: c });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("idle");
      }
    }, 700);
  }, [onUpdate]);

  const handleTitle = (e) => { setTitle(e.target.value); triggerSave(e.target.value, content); };
  const handleContent = (e) => { setContent(e.target.value); triggerSave(title, e.target.value); };

  const handleDeleteClick = () => setConfirming(true);
  const handleDeleteCancel = () => setConfirming(false);
  const handleDeleteConfirm = () => { onDelete(note._id); onClose(); };

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const count = wordCount(content);
  const updated = note ? formatDateTime(note.updatedAt) : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/20 anim-fade" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-bg border border-border flex flex-col max-h-[85vh] anim-slide">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
            <span>{count}w</span>
            {saveStatus === "saving" && <span className="animate-pulse">saving…</span>}
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1 text-success">
                <HiCheck /> saved
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleDeleteClick}
              className="p-1.5 text-sm text-ink-faint hover:text-danger transition-colors"
              title="Delete"
            >
              <HiOutlineTrash />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-ink-faint hover:text-ink transition-colors"
            >
              <HiOutlineX />
            </button>
          </div>
        </div>

        {confirming && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle bg-danger-subtle anim-slide shrink-0">
            <span className="text-xs text-danger">Delete this note permanently?</span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeleteCancel}
                className="text-xs text-ink-muted hover:text-ink hover:bg-surface px-2 py-1 transition-all duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="text-xs font-medium text-danger border border-danger px-2 py-1 hover:bg-danger hover:text-fill-inverse transition-all duration-150"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-8 py-8">
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={handleTitle}
            placeholder="Untitled"
            className="w-full bg-transparent font-serif text-2xl font-medium italic text-ink outline-none placeholder-ink-faint leading-tight mb-2"
          />
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint mb-8">{updated}</p>
          <textarea
            value={content}
            onChange={handleContent}
            placeholder="Write something…"
            className="w-full bg-transparent text-sm text-ink-secondary leading-loose outline-none resize-none min-h-[45vh] placeholder-ink-faint"
          />
        </div>
      </div>
    </div>
  );
};

export default NoteModal;
