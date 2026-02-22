import { useState } from "react";
import toast from "react-hot-toast";
import useNotes from "../hooks/useNotes";
import Header from "../components/Header";
import NoteCard from "../components/NoteCard";
import NoteModal from "../components/NoteModal";
import EmptyState from "../components/EmptyState";
import Spinner from "../components/Spinner";
import Footer from "../components/Footer";

const Dashboard = () => {
  const {
    notes, pagination, loading,
    page, search, setPage, handleSearchChange,
    fetchNoteById, createNote, updateNote, deleteNote,
  } = useNotes();

  const [activeNote, setActiveNote] = useState(null);
  const [creating, setCreating] = useState(false);

  const openNote = async (note) => {
    setActiveNote(note);
    try {
      const fresh = await fetchNoteById(note._id);
      setActiveNote(fresh);
    } catch {
      return;
    }
  };

  const handleNew = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const created = await createNote();
      setActiveNote(created);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create note.");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (id, updates) => {
    const updated = await updateNote(id, updates);
    setActiveNote(updated);
    return updated;
  };

  const handleDelete = async (id) => {
    try {
      await deleteNote(id);
      setActiveNote(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete note.");
    }
  };

  return (
    <div className="h-full flex flex-col bg-bg">
      <Header
        onSearch={handleSearchChange}
        onNew={handleNew}
        creating={creating}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-5 py-8">
          {loading ? (
            <div className="flex justify-center py-24">
              <Spinner size="md" />
            </div>
          ) : notes.length === 0 ? (
            <EmptyState hasSearch={!!search} onNew={handleNew} />
          ) : (
            <>
              <p className="font-mono text-xs text-ink-muted uppercase tracking-widest mb-5">
                {pagination?.total ?? notes.length}{" "}
                {(pagination?.total ?? notes.length) === 1 ? "note" : "notes"}
              </p>

              <div className="border-t border-l border-border-subtle grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {notes.map((note, i) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    index={i}
                    onClick={() => openNote(note)}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center gap-5 mt-8">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page <= 1}
                    className="font-mono text-xs uppercase tracking-widest text-ink-muted hover:text-ink disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Prev
                  </button>
                  <span className="font-mono text-xs text-ink-faint">
                    {page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= pagination.totalPages}
                    className="font-mono text-xs uppercase tracking-widest text-ink-muted hover:text-ink disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />

      {activeNote && (
        <NoteModal
          note={activeNote}
          onClose={() => setActiveNote(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Dashboard;
