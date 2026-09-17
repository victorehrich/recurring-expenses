"use client";

import { useState } from "react";
import { Button, Checkbox, Input, Spinner, Textarea } from "@/components/atoms";
import { CustomSelect, FormField } from "@/components/molecules";
import { cn } from "@/lib/cn";

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

const frequencies: ExpenseInput["frequency"][] = ["mensal", "semanal", "anual"];

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="text-xs font-medium uppercase tracking-wider text-muted">
      {children}
    </h3>
  );
}

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="space-y-4">
        <SectionTitle>Dados básicos</SectionTitle>
        <FormField label="Nome da despesa">
          <Input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ex.: Aluguel, Internet, Academia"
          />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Valor (R$)">
            <Input
              required
              type="number"
              min={0}
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            />
          </FormField>
          <FormField label="Categoria">
            <Input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Ex.: Moradia"
            />
          </FormField>
        </div>
      </section>

      <section className="space-y-4 border-t border-border pt-5">
        <SectionTitle>Vencimento e aviso</SectionTitle>
        <div role="radiogroup" aria-label="Frequência" className="flex gap-2">
          {frequencies.map((f) => {
            const selected = form.frequency === f;
            return (
              <button
                key={f}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setForm({ ...form, frequency: f })}
                className={cn(
                  "h-10 flex-1 rounded-xl border text-sm capitalize transition",
                  selected
                    ? "border-brand bg-brand/10 font-medium text-brand"
                    : "border-border text-muted hover:border-muted hover:text-foreground",
                )}
              >
                {f === "mensal" ? "Mensal" : f === "semanal" ? "Semanal" : "Anual"}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {form.frequency === "semanal" ? (
            <FormField label="Dia da semana" className="col-span-2">
              <CustomSelect
                value={String(form.dueDay)}
                onChange={(v) => setForm({ ...form, dueDay: Number(v) })}
                options={weekdays.map((w, i) => ({ value: String(i), label: w }))}
                label="Dia da semana"
              />
            </FormField>
          ) : (
            <FormField label="Dia do vencimento">
              <Input
                required
                type="number"
                min={1}
                max={31}
                value={form.dueDay}
                onChange={(e) => setForm({ ...form, dueDay: Number(e.target.value) })}
              />
            </FormField>
          )}
          {form.frequency === "anual" ? (
            <FormField label="Mês do vencimento">
              <CustomSelect
                value={String(form.dueMonth ?? 1)}
                onChange={(v) => setForm({ ...form, dueMonth: Number(v) })}
                options={Array.from({ length: 12 }, (_, i) => i + 1).map((m) => ({
                  value: String(m),
                  label: m.toString().padStart(2, "0"),
                }))}
                label="Mês do vencimento"
              />
            </FormField>
          ) : (
            form.frequency === "mensal" && (
              <FormField label="Avisar antes (dias)">
                <Input
                  type="number"
                  min={0}
                  max={30}
                  value={form.reminderDays}
                  onChange={(e) => setForm({ ...form, reminderDays: Number(e.target.value) })}
                />
              </FormField>
            )
          )}
        </div>
        {form.frequency !== "mensal" && (
          <FormField label="Avisar quantos dias antes">
            <Input
              type="number"
              min={0}
              max={30}
              value={form.reminderDays}
              onChange={(e) => setForm({ ...form, reminderDays: Number(e.target.value) })}
            />
          </FormField>
        )}
      </section>

      <details className="group rounded-xl border border-border bg-surface2/50 px-4 py-3">
        <summary className="cursor-pointer text-sm font-medium text-muted transition hover:text-foreground">
          Opções avançadas
          <span className="ml-2 text-xs">(Telegram alternativo, boleto, observação)</span>
        </summary>
        <div className="space-y-4 pt-4">
          <FormField label="Chat ID do Telegram (opcional)" hint="Vazio usa o padrão">
            <Input
              value={form.chatId}
              onChange={(e) => setForm({ ...form, chatId: e.target.value })}
              placeholder="Deixe em branco para usar o padrão"
            />
          </FormField>
          <FormField label="URL do boleto (opcional)">
            <Input
              value={form.boletoUrl}
              onChange={(e) => setForm({ ...form, boletoUrl: e.target.value })}
              placeholder="https://example.com/boleto.pdf"
            />
          </FormField>
          <FormField label="Observação (opcional)">
            <Textarea
              value={form.observation}
              onChange={(e) => setForm({ ...form, observation: e.target.value })}
              placeholder="Ex.: Pagamento em atraso, etc."
              rows={2}
            />
          </FormField>
        </div>
      </details>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.checked })}
        />
        <span className="text-muted">Despesa ativa (recebe avisos)</span>
      </label>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving && <Spinner />}
          {saving ? "Salvando..." : isEditing ? "Salvar alterações" : "Cadastrar despesa"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
