"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button, Input, Spinner, Textarea } from "@/components/atoms";
import { CustomSelect, DatePicker, FormField } from "@/components/molecules";
import { formatBRL } from "@/lib/format";
import { Dialog } from "./dialog";

export function PaymentDialog({
  expense,
  onClose,
  onRegistered,
}: {
  expense: { _id: string; name: string; amount: number };
  onClose: () => void;
  onRegistered: () => void;
}) {
  const [date, setDate] = useState<Date>(() => new Date());
  const [amount, setAmount] = useState(expense.amount.toString());
  const [method, setMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expenseId: expense._id,
          paidAt: date.toISOString(),
          amount: Number(amount),
          method: method || undefined,
          notes: notes || undefined,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Não foi possível registrar");
      toast.success(`Pagamento de ${expense.name} registrado`);
      onRegistered();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao registrar pagamento");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog title={`Registrar pagamento · ${expense.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Data do pagamento">
          <DatePicker value={date} onChange={setDate} label="Data do pagamento" />
        </FormField>
        <FormField label={`Valor (valor da despesa: ${formatBRL(expense.amount)})`}>
          <Input
            type="number"
            required
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </FormField>
        <FormField label="Método">
          <CustomSelect
            value={method}
            onChange={setMethod}
            options={[
              { value: "", label: "Selecione" },
              { value: "Cartão", label: "Cartão" },
              { value: "Boleto", label: "Boleto" },
              { value: "PIX", label: "PIX" },
            ]}
            label="Método"
          />
        </FormField>
        <FormField label="Observação (opcional)">
          <Textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </FormField>
        <Button type="submit" disabled={saving} className="w-full">
          {saving && <Spinner />}
          {saving ? "Registrando..." : "Registrar pagamento"}
        </Button>
      </form>
    </Dialog>
  );
}
