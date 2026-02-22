const EmptyState = ({ hasSearch, onNew }) => (
  <div className="flex flex-col items-start pt-16 anim-fade">
    <p className="font-mono text-xs uppercase tracking-widest text-ink-faint mb-4">
      {hasSearch ? "No results" : "No notes"}
    </p>
    {!hasSearch && (
      <button
        onClick={onNew}
        className="text-sm text-ink underline underline-offset-4 hover:text-ink-secondary transition-colors"
      >
        Create one →
      </button>
    )}
  </div>
);

export default EmptyState;
