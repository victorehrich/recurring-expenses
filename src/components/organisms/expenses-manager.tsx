"use client";

import ExpenseForm from "@/app/components/ExpenseForm";
import ExpenseList from "@/app/components/ExpenseList";
import { Button, Skeleton } from "@/components/atoms";
import { CustomSelect, EmptyState, SearchBar } from "@/components/molecules";
import { ExpenseDialog, NotifyBanner } from "@/components/organisms";
import {
  FILTER_OPTIONS,
  useExpenseDialog,
  useExpenseFilters,
  useExpenses,
} from "@/hooks";

/**
 * Gestão completa de despesas (busca + filtros + lista + dialog).
 * Usado pela página /expenses. O dialog é compartilhado via hook para
 * a página disparar "Nova despesa" do próprio header.
 */
export function ExpensesManager({
  dialog,
}: {
  dialog?: ReturnType<typeof useExpenseDialog>;
}) {
  const { expenses, loading, error, reload } = useExpenses();
  const { query, setQuery, status, setStatus, filtered } = useExpenseFilters(expenses);
  const internal = useExpenseDialog();
  const d = dialog ?? internal;

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <SearchBar
            placeholder="Buscar por nome ou categoria..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar despesas"
          />
        </div>
        <CustomSelect
          value={status}
          onChange={(v) => setStatus(v as typeof status)}
          options={FILTER_OPTIONS}
          label="Filtrar por status"
          className="sm:w-52"
        />
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-3">
          <div className="flex-1">
            <NotifyBanner message={`Erro ao carregar: ${error}`} tone="error" />
          </div>
          <Button variant="secondary" size="sm" onClick={reload}>
            Tentar de novo
          </Button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : filtered.length === 0 && expenses.length > 0 ? (
        <EmptyState
          title="Nenhum resultado para os filtros."
          description="Ajuste a busca ou o filtro de status."
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setQuery("");
                setStatus("all");
              }}
            >
              Limpar filtros
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma despesa cadastrada ainda."
          description="Cadastre a primeira para começar a receber avisos."
          action={<Button size="sm" onClick={d.openNew}>Nova despesa</Button>}
        />
      ) : (
        <ExpenseList expenses={filtered} onEdit={d.openEdit} onChanged={reload} />
      )}

      {d.dialogOpen && (
        <ExpenseDialog
          title={d.editing ? "Editar despesa" : "Nova despesa"}
          onClose={d.close}
        >
          <ExpenseForm
            key={d.editing?._id ?? "new"}
            initial={d.editing ?? undefined}
            onSaved={() => {
              d.close();
              reload();
            }}
            onCancel={d.close}
          />
        </ExpenseDialog>
      )}
    </>
  );
}
