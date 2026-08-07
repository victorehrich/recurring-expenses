import { useEffect, useState } from "react";
import { PaymentDocument } from "@/models/Payment"; // for type only, not used at runtime

interface PaymentHistoryProps {
  expenseId: string;
  onClose: () => void;
}

export default function PaymentHistory({
  expenseId,
  onClose,
}: Readonly<PaymentHistoryProps>) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayments() {
      try {
        const res = await fetch(`/api/payments?expenseId=${expenseId}`);
        const data = await res.json();
        setPayments(data.payments ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, [expenseId]);

  async function confirmPayment(paymentId: string) {
    await fetch(`/api/payments/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId }),
    });
    // refresh list
    setPayments((prev) =>
      prev.map((p) => (p._id === paymentId ? { ...p, confirmed: true } : p)),
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg max-w-lg w-full p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-ink/60 hover:text-ink"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-4">Histórico de pagamentos</h2>
        {loading ? (
          <p>Carregando…</p>
        ) : payments.length === 0 ? (
          <p>Sem pagamentos registrados.</p>
        ) : (
          <ul className="space-y-3 max-h-80 overflow-y-auto">
            {payments.map((p) => (
              <li
                key={p._id}
                className="p-3 border border-line rounded bg-white/60"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {new Date(p.paidAt).toLocaleDateString("pt-BR")}
                    </p>
                    <p>
                      {p.amount?.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                    {p.method && <p>Método: {p.method}</p>}
                    {p.notes && <p>Obs: {p.notes}</p>}
                  </div>
                  {!p.confirmed && (
                    <button
                      onClick={() => confirmPayment(p._id)}
                      className="text-petrol hover:underline"
                    >
                      Confirmar
                    </button>
                  )}
                  {p.confirmed && (
                    <span className="text-mustard">Confirmado</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
