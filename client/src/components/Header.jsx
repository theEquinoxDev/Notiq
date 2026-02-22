import { HiOutlinePlus } from "react-icons/hi";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { useAuth } from "../context/AuthContext";
import Spinner from "./Spinner";

const Header = ({ onSearch, onNew, creating }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-bg border-b border-border-subtle">
      <div className="max-w-5xl mx-auto px-5 h-12 flex items-center gap-5">

        <div className="flex items-center gap-3 shrink-0">
          <span className="font-serif italic text-lg font-medium text-ink tracking-tight select-none">
            Notiq
          </span>
        </div>

        <div className="flex-1" />

        <div className="relative w-44 shrink-0">
          <HiMagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted text-sm pointer-events-none" />
          <input
            type="search"
            placeholder="Search…"
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-surface border border-border-subtle focus:border-border pl-8 pr-3 py-1.5 text-sm text-ink placeholder-ink-faint outline-none transition-colors"
          />
        </div>

        <button
          onClick={onNew}
          disabled={creating}
          className="btn-slide flex items-center gap-1.5 border border-border text-ink-secondary px-3 py-1.5 text-xs uppercase tracking-widest font-medium disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {creating ? <Spinner size="sm" /> : <HiOutlinePlus />}
          New
        </button>

        <button
          onClick={logout}
          title={user?.email}
          className="text-sm text-ink-muted hover:text-fill hover:bg-fill/10 px-2 py-1 transition-all duration-150 shrink-0"
        >
          Sign out
        </button>

      </div>
    </header>
  );
};

export default Header;
