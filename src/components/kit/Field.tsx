export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
