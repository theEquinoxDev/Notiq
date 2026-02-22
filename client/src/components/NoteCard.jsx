import { useState } from "react";
import { HiOutlineTrash } from "react-icons/hi";
import { formatDate } from "../utils/format";

const DELAYS = ["delay-1","delay-2","delay-3","delay-4","delay-5","delay-6"];

const NoteCard = ({ note, index, onClick, onDelete }) => {
  const [confirming, setConfirming] = useState(false);

  const date = formatDate(note.updatedAt);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setConfirming(true);
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    setConfirming(false);
  };

  const handleConfirm = (e) => {
    e.stopPropagation();
    onDelete(note._id);
  };

  return (
    <div
      className={`anim-slide ${DELAYS[index] ?? ""} relative border-b border-r border-border-subtle group`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => e.key === "Enter" && onClick()}
        className="w-full text-left p-5 hover:bg-surface transition-colors cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif italic text-base font-medium text-ink leading-snug clamp-2 group-hover:underline underline-offset-2">
            {note.title || "Untitled"}
          </h3>
          <button
            onClick={handleDeleteClick}
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-ink-faint hover:text-danger p-0.5 -mt-0.5"
            title="Delete"
          >
            <HiOutlineTrash className="text-sm" />
          </button>
        </div>

        {note.content?.trim() && (
          <p className="text-xs text-ink-secondary leading-relaxed clamp-3 mt-2">
            {note.content}
          </p>
        )}

        <span className="block font-mono text-[10px] text-ink-faint uppercase tracking-wider mt-4">
          {date}
        </span>
      </div>

      {confirming && (
        <div
          className="absolute inset-x-0 bottom-0 bg-bg border-t border-border-subtle px-5 py-3 flex items-center justify-between anim-slide"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-xs text-ink-secondary">Delete this note?</span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="text-xs text-ink-muted hover:text-ink hover:bg-surface px-2 py-1 transition-all duration-150"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="text-xs font-medium text-danger border border-danger px-2 py-1 hover:bg-danger hover:text-fill-inverse transition-all duration-150"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteCard;
