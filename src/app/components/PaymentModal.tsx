"use client";
import { useState } from "react";
import { ExpenseInput } from "./ExpenseForm";

interface PaymentModalProps {
  expense: ExpenseInput & { _id: string };
  onClose: () => void;
}

export default function PaymentModal({ expense, onClose }: PaymentModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState<string>(today);
  const [amount, setAmount] = useState<string>(expense.amount.toString());
  const [method, setMethod] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`/api/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expenseId: expense._id,
          paidAt: date,
          amount: Number(amount),
          method: method || undefined,
          notes: notes || undefined,
        }),
      });
      // close modal and refresh list
      onClose();
      // Force reload to reflect updated status and confirmed flag
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-ink/60 hover:text-ink"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-4">Registrar pagamento</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-line rounded px-2 py-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Valor</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-line rounded px-2 py-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Método</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full border border-line rounded px-2 py-1"
            >
              <option value="">Selecione</option>
              <option value="Cartão">Cartão</option>
              <option value="Boleto">Boleto</option>
              <option value="PIX">PIX</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Observação (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-line rounded px-2 py-1"
              rows={2}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-petrol text-white py-2 rounded hover:bg-petrol/80"
          >
            {loading ? "Registrando..." : "Registrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
