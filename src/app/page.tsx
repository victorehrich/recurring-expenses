"use client";

import { useEffect, useState } from "react";
import ExpenseForm, { ExpenseInput } from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";

type Expense = ExpenseInput & { _id: string };

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [notifyMsg, setNotifyMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/expenses");
    const data = await res.json();
    setExpenses(data.expenses ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(expense: Expense) {
    setEditing(expense);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  async function testNotify() {
    setNotifyMsg("Verificando...");
    try {
      const res = await fetch("/api/notify");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNotifyMsg(
        data.notified.length
          ? `Avisos enviados: ${data.notified.join(", ")}`
          : "Nenhuma despesa precisa de aviso hoje.",
      );
    } catch (err: any) {
      setNotifyMsg(`Erro: ${err.message}`);
    }
  }

  const totalAtivo = expenses
    .filter((e) => e.active)
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <main className="min-h-screen max-w-3xl mx-auto px-5 py-12">
      <header className="mb-10 flex items-end justify-between border-b border-line pb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-petrol font-mono mb-2">
            Livro-caixa · avisos via Telegram
          </p>
          <h1 className="font-display text-3xl font-semibold">
            Despesas recorrentes
          </h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-ink/50 uppercase tracking-wide">
            Total ativo/mês
          </p>
          <p className="font-mono text-xl">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(totalAtivo)}
          </p>
        </div>
      </header>

      <div className="mb-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => (showForm ? closeForm() : setShowForm(true))}
          className="bg-ink text-paper px-4 py-2 text-sm font-medium hover:bg-ink/90"
        >
          {showForm ? "Fechar formulário" : "+ Nova despesa"}
        </button>
        <button
          type="button"
          onClick={testNotify}
          className="text-sm text-petrol hover:underline"
        >
          Testar notificações agora
        </button>
        {notifyMsg && <span className="text-xs text-ink/60">{notifyMsg}</span>}
      </div>

      {showForm && (
        <div className="mb-8">
          <ExpenseForm
            initial={editing ?? undefined}
            onSaved={() => {
              closeForm();
              load();
            }}
            onCancel={closeForm}
          />
        </div>
      )}

      {loading ? (
        <p className="text-sm text-ink/50">Carregando...</p>
      ) : (
        <ExpenseList expenses={expenses} onEdit={startEdit} onChanged={load} />
      )}

      <footer className="mt-10 text-xs text-ink/40">
        Um aviso é enviado automaticamente pelo cron diário quando faltam os
        dias configurados (ou no dia do vencimento). Configure o bot no arquivo
        .env — veja o README.
      </footer>
    </main>
  );
}
