type Size = "sm" | "md";

const sizeClass: Record<Size, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
};

type Props = {
  avatarDataUrl: string | null;
  initials: string;
  size: Size;
  effectiveDark: boolean;
};

/**
 * Workspace profile avatar: custom photo when set, otherwise initials on a solid circle.
 */
export function WorkspaceAvatar({ avatarDataUrl, initials, size, effectiveDark }: Props) {
  const base = sizeClass[size];
  const initialsSurface = effectiveDark ? "bg-zinc-700 text-zinc-100" : "bg-ink/10 text-ink";

  if (avatarDataUrl) {
    return (
      <span className={`relative inline-flex shrink-0 overflow-hidden rounded-full ${base}`}>
        <img src={avatarDataUrl} alt="" className="h-full w-full object-cover" decoding="async" />
      </span>
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${base} ${initialsSurface}`}
      aria-hidden
    >
      {initials}
    </span>
  );
}
