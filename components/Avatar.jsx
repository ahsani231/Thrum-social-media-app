export default function Avatar({ color, letter, size = "md" }) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-xl",
  };
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-display font-medium text-ink ${sizes[size]}`}
      style={{ background: color }}
    >
      {letter}
    </div>
  );
}
