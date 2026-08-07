"use client";

import { useState } from "react";

export type ExpenseInput = {
  _id?: string;
  name: string;
  amount: number;
  category: string;
  frequency: "mensal" | "semanal" | "anual";
  dueDay: number;
  dueMonth?: number;
  reminderDays: number;
  active: boolean;
  chatId?: string;
  boletoUrl?: string;
  observation?: string; // opcional
};

const emptyForm: ExpenseInput = {
  name: "",
  amount: 0,
  category: "Geral",
  frequency: "mensal",
  dueDay: 5,
  dueMonth: 1,
  reminderDays: 3,
  active: true,
  chatId: "",
  boletoUrl: "",
  observation: "",
};

const weekdays = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

export default function ExpenseForm({
  initial,
  onSaved,
  onCancel,
}: Readonly<{
  initial?: ExpenseInput;
  onSaved: () => void;
  onCancel?: () => void;
}>) {
  const [form, setForm] = useState<ExpenseInput>(initial ?? emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(initial?._id);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = isEditing ? `/api/expenses/${initial!._id}` : "/api/expenses";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Não foi possível salvar a despesa");
      }

      onSaved();
      if (!isEditing) setForm(emptyForm);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-line bg-white/60 p-5 space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink/70">Nome da despesa</span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ex.: Aluguel, Internet, Academia"
            className="border border-line bg-white px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink/70">Valor (R$)</span>
          <input
            required
            type="number"
            min={0}
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            className="border border-line bg-white px-3 py-2 text-sm font-mono"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink/70">Categoria</span>
          <input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="Ex.: Moradia, Assinaturas"
            className="border border-line bg-white px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink/70">Frequência</span>
          <select
            value={form.frequency}
            onChange={(e) =>
              setForm({ ...form, frequency: e.target.value as ExpenseInput["frequency"] })
            }
            className="border border-line bg-white px-3 py-2 text-sm"
          >
            <option value="mensal">Mensal</option>
            <option value="semanal">Semanal</option>
            <option value="anual">Anual</option>
          </select>
        </label>

        {form.frequency === "semanal" ? (
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-ink/70">Dia da semana</span>
            <select
              value={form.dueDay}
              onChange={(e) => setForm({ ...form, dueDay: Number(e.target.value) })}
              className="border border-line bg-white px-3 py-2 text-sm"
            >
              {weekdays.map((w, i) => (
                <option key={w} value={i}>
                  {w}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-ink/70">Dia do vencimento</span>
            <input
              required
              type="number"
              min={1}
              max={31}
              value={form.dueDay}
              onChange={(e) => setForm({ ...form, dueDay: Number(e.target.value) })}
              className="border border-line bg-white px-3 py-2 text-sm font-mono"
            />
          </label>
        )}

        {form.frequency === "anual" && (
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-ink/70">Mês do vencimento</span>
            <select
              value={form.dueMonth}
              onChange={(e) => setForm({ ...form, dueMonth: Number(e.target.value) })}
              className="border border-line bg-white px-3 py-2 text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m.toString().padStart(2, "0")}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink/70">Avisar com quantos dias de antecedência</span>
          <input
            type="number"
            min={0}
            max={30}
            value={form.reminderDays}
            onChange={(e) => setForm({ ...form, reminderDays: Number(e.target.value) })}
            className="border border-line bg-white px-3 py-2 text-sm font-mono"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink/70">Chat ID do Telegram (opcional)</span>
          <input
            value={form.chatId}
            onChange={(e) => setForm({ ...form, chatId: e.target.value })}
            placeholder="Deixe em branco para usar o padrão"
            className="border border-line bg-white px-3 py-2 text-sm font-mono"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink/70">URL do boleto (opcional)</span>
          <input
            value={form.boletoUrl}
            onChange={(e) => setForm({ ...form, boletoUrl: e.target.value })}
            placeholder="https://example.com/boleto.pdf"
            className="border border-line bg-white px-3 py-2 text-sm font-mono"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink/70">Observação (opcional)</span>
          <textarea
            value={form.observation}
            onChange={(e) => setForm({ ...form, observation: e.target.value })}
            placeholder="Ex.: Pagamento em atraso, etc."
            className="border border-line bg-white px-3 py-2 text-sm font-mono resize-none"
            rows={2}
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.checked })}
        />
        <span className="text-ink/70">Despesa ativa (recebe avisos)</span>
      </label>

      {error && <p className="text-sm text-rust">{error}</p>}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="bg-petrol text-paper px-4 py-2 text-sm font-medium hover:bg-petrol/90 disabled:opacity-60"
        >
          {saving ? "Salvando..." : isEditing ? "Salvar alterações" : "Cadastrar despesa"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-ink/70 hover:text-ink"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
