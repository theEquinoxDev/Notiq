const Spinner = ({ size = "md", light = false }) => {
  const sizes = {
    sm: "w-3.5 h-3.5 border",
    md: "w-5 h-5 border-[1.5px]",
    lg: "w-7 h-7 border-2",
  };
  const color = light
    ? "border-white/30 border-t-white"
    : "border-border-subtle border-t-ink";

  return <div className={`${sizes[size]} ${color} rounded-full animate-spin`} />;
};

export default Spinner;
