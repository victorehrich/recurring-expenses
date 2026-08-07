export function HistoryButton({
  onHistory,
}: Readonly<{ onHistory: () => void }>) {
  return (
    <button
      type="button"
      onClick={onHistory}
      className="text-mustard hover:underline"
      title="Histórico de pagamentos"
    >
      histórico
    </button>
  );
}
