"use client";
export function DeleteButton({
  onDelete,
  busy,
}: Readonly<{
  onDelete: () => void;
  busy: boolean;
}>) {
  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={busy}
      className="text-rust hover:underline disabled:opacity-50"
    >
      {busy ? "excluindo..." : "excluir"}
    </button>
  );
}
