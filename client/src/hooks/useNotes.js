import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";

const DEFAULT_LIMIT = 12;

const useNotes = () => {
  const [notes, setNotes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const searchTimer = useRef(null);

  const fetchNotes = useCallback(async (p, s) => {
    try {
      setLoading(true);
      const params = { page: p, limit: DEFAULT_LIMIT };
      if (s) params.search = s;
      const res = await api.get("/notes", { params });
      setNotes(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load notes.");
      setNotes([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes(page, search);
  }, [fetchNotes, page, search]);

  const handleSearchChange = useCallback((value) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      setSearch(value);
    }, 350);
  }, []);

  const createNote = useCallback(async () => {
    const res = await api.post("/notes", { title: "Untitled", content: "" });
    const created = res.data.data;
    setNotes((prev) => [created, ...prev]);
    setPagination((prev) => {
      if (!prev) return prev;
      const total = prev.total + 1;
      return { ...prev, total, totalPages: Math.ceil(total / DEFAULT_LIMIT) };
    });
    return created;
  }, []);

  const updateNote = useCallback(async (id, updates) => {
    const res = await api.patch(`/notes/${id}`, updates);
    const updated = res.data.data;
    setNotes((prev) => prev.map((n) => (n._id === id ? updated : n)));
    return updated;
  }, []);

  const deleteNote = useCallback(async (id) => {
    await api.delete(`/notes/${id}`);
    setNotes((prev) => prev.filter((n) => n._id !== id));
    setPagination((prev) => {
      if (!prev) return prev;
      const total = prev.total - 1;
      return { ...prev, total, totalPages: Math.ceil(total / DEFAULT_LIMIT) };
    });
    toast.success("Note deleted.");
  }, []);

  const fetchNoteById = useCallback(async (id) => {
    const res = await api.get(`/notes/${id}`);
    return res.data.data;
  }, []);

  return {
    notes,
    pagination,
    loading,
    page,
    search,
    setPage,
    handleSearchChange,
    fetchNoteById,
    createNote,
    updateNote,
    deleteNote,
    refetch: () => fetchNotes(page, search),
  };
};

export default useNotes;
