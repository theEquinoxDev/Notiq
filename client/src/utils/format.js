export const formatDate = (dateStr, options) => {
  const defaults = { month: "short", day: "numeric", year: "numeric" };
  return new Date(dateStr).toLocaleDateString("en-US", options ?? defaults);
};

export const formatDateTime = (dateStr) =>
  new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export const wordCount = (text) =>
  text?.trim() ? text.trim().split(/\s+/).length : 0;
