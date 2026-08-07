"use client";

export function EditButton({
  onEdit,
}: Readonly<{
  onEdit: () => void;
}>) {
  return (
    <button
      type="button"
      onClick={() => onEdit}
      className="text-petrol hover:underline"
    >
      editar
    </button>
  );
}
