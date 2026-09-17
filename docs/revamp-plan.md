# Plano de Repaginação — recurring-expenses

Data: 2026-09-16
Status: aprovado para execução

## 1. Decisões fechadas

- **Ordem de execução:** `F1 -> F4 -> F2 -> F3 -> F5 -> F6 -> F9 -> F7 -> F8 -> F10 -> F11`.
  Motivo: fundação visual + API primeiro evita retrabalho; novas telas (F5–F8) antes da limpeza/QA final.
  Revisão 2026-09-16: incluídos pedidos do usuário — densidade da lista + overflow menu (F5), sidebar (F6), versionamento no shell (F9), novas páginas (F7), select/calendar custom (F8). Limpeza/QA e polish (antigas F5/F6) viraram F10/F11.
- **Tema:** escuro moderno como padrão, com toggle `light/dark`.
  Implementação: `darkMode: "class"` no Tailwind + CSS variables + toggle com persistência em `localStorage` (sem lib pesada a princípio; avaliar `next-themes` na F1).
- **Branch de trabalho:** `refactor/atomic-slices-redesign`.

## 2. Diagnóstico atual (ponto de partida)

- Front: `src/app/page.tsx` (state + fetch + cálculo), `src/app/components/ExpenseForm.tsx`, `src/app/components/ExpenseList.tsx`, 4 botões em `src/app/components/buttons/`, `PaymentModal.tsx`, `PaymentHistory.tsx`.
- API: handlers gordos em `src/app/api/expenses/route.ts`, `src/app/api/expenses/[id]/route.ts`, `src/app/api/payments/route.ts`, `src/app/api/payments/confirm/route.ts`, `src/app/api/notify/route.ts`.
- Domínio: `src/models/Expense.ts`, `src/models/Payment.ts`, `src/lib/dueDate.ts`, `src/lib/telegram.ts`, `src/lib/mongodb.ts`.
- Visual: tokens `ink/paper/petrol/mustard/rust/line` em `tailwind.config.js`, estilo "livro-caixa".

## 3. Alvo — Front (Atomic Design)

```
src/
  components/
    atoms/        Button, IconButton, Input, Select, Textarea, Checkbox,
                  Badge, Card, Skeleton, Spinner, ThemeToggle, Currency, Logo
    molecules/    FormField, SearchBar, FilterChips, StatCard, StatusPill,
                  ExpenseMeta, ConfirmDialog, Toast, EmptyState
    organisms/    AppHeader, Sidebar, ExpenseTable, ExpenseCards,
                  ExpenseDialog, NotifyBanner, PaymentDialog, PaymentHistoryPanel
    templates/    DashboardTemplate, AuthTemplate (se precisar no futuro)
  app/
    page.tsx      composição fina (Server Component + Suspense)
    layout.tsx    fonts + ThemeProvider + Toaster
    loading.tsx   skeleton da dashboard
    error.tsx     estado de erro padronizado
  hooks/          useExpenses, useNotify, useThemeMode, useFilters
  lib/
    format.ts     currency/date (extraído de ExpenseList)
    expense-status.ts  statusFor (extraído de ExpenseList)
```

Regras:

- `atoms/`: sem regra de negócio, só props + `cva` + `clsx`. Props com `variant`, `size`.
- `molecules/`: compõem 2+ atoms, sem fetch direto.
- `organisms/`: podem usar hooks e compor molecules.
- `templates/`: só layout/slots, sem dados.
- `app/page.tsx`: só composição. Fetch via Server Component ou hooks em componente client isolado.

## 4. Alvo — API (Vertical Slices)

```
src/server/
  shared/
    db.ts         (migra src/lib/mongodb.ts com cache)
    http.ts       ok(), created(), fail(), parseBody()
    auth.ts       isAuthorized (migra de notify/route.ts) — Bearer + ?token=
    errors.ts     AppError, handler wrapper
    validate.ts   helper zod
  features/
    expenses/
      types.ts       DTOs + ExpenseInput
      schema.ts      zod: createExpenseSchema, updateExpenseSchema
      repository.ts  findAll, findById, create, update, remove (lean)
      service.ts     regras: defaults (category, reminderDays, DIAS_DE_AVISO)
      route-helpers.ts (se precisar)
    payments/
      types.ts / schema.ts / repository.ts / service.ts
      regras: periodKey, alreadyPaid, confirm
    notifications/
      service.ts     checkDue + shouldNotify (extrai loop de notify/route.ts)
      templates.ts   monta texto Telegram (extrai template atual)
      telegram.ts    (migra src/lib/telegram.ts)
      repository.ts  marca lastNotifiedKey

src/app/api/
  expenses/route.ts          thin: chama features/expenses/service
  expenses/[id]/route.ts     thin: GET/PUT/DELETE
  payments/route.ts          thin
  payments/confirm/route.ts  thin
  notify/route.ts            thin: auth + notifications/service
```

Regras:

- Handler em `app/api` com < 25 linhas: auth → validate → service → response.
- Cada slice é dono de schema + service + repository. `shared/` não importa de `features/`.
- Sem mudança de contrato REST na F4 (só refator interno + zod). Mudança de contrato, se precisar, fica para F5 com front junto.

## 5. Alvo — Novo design (escuro moderno + toggle)

- **Tema default:** dark moderno. Toggle no header (`ThemeToggle` atom) com `light/dark`, persistido, respeitando `prefers-color-scheme` no primeiro load.
- **Implementação técnica:**
  1. `tailwind.config.js`: `darkMode: "class"`, trocar paleta para tokens semânticos via CSS vars:
     `bg / surface / border / text / muted / brand / success / warning / danger`.
     Manter compat temporária com `ink/paper/petrol/...` até F3 concluir, depois remover.
  2. `src/app/globals.css`: `:root` (light) + `.dark` (dark), `color-scheme`, `::selection`, `focus-visible`, scrollbar, skeleton shimmer.
  3. `layout.tsx`: adiciona `ThemeProvider` (context próprio ou `next-themes`), `suppressHydrationWarning` se necessário, Toaster.
- **Layout dashboard:**
  Header (logo + ThemeToggle + botão Testar notificações) + grid KPIs (Total ativo/mês, Vence em 7d, Atrasadas) + filtros/busca + lista (tabela desktop / cards mobile) + FAB/dialog Nova despesa.
- **Estados obrigatórios:** loading skeleton, empty, erro com retry, toast de notify, confirm delete.
- **A11y:** contraste AA nos dois temas, foco visível, labels em todos inputs, dialog com ESC/focus trap simples.

## 6. Fases de execução (ordem aprovada)

### F1 — Fundação visual + tokens + atoms [CONCLUÍDA em 2026-09-16]

- [x] Criar branch `refactor/atomic-slices-redesign`.
- [x] Instalar: `zod clsx tailwind-merge class-variance-authority lucide-react sonner next-themes`.
- [x] `tailwind.config.js`: `darkMode: "class"` + novos tokens + content incluindo `src/components`.
- [x] `globals.css`: vars light/dark + base.
- [x] `ThemeProvider` + `ThemeToggle` + persistência + teste manual dos 2 temas.
- [ ] Atoms: `Button, Input, Select, Textarea, Badge, Card, Skeleton, Spinner`.
- [ ] Rota temporária `/design` para preview dos atoms nos 2 temas (remover na F6).
- Aceite: build passa, toggle funciona com reload, sem regressão nas rotas antigas.

### F4 — API em Vertical Slices [CONCLUÍDA em 2026-09-16]

- [x] `src/server/shared/`: `db, http, auth, errors, validate`.
- [x] Slice `expenses`: `schema → repository → service`, handlers viram thin.
- [x] Slice `payments` (+ confirm): mesma sequência.
- [x] Slice `notifications`: extrair `service + templates`, manter mensagem atual idêntica.
- [x] Zod em POST/PUT com erro 400 padronizado `{ error }`.
- [ ] Teste manual com Mongo: `GET /api/expenses`, `POST/PUT/DELETE`, `GET /api/payments`, `GET /api/notify?token=` (pendente — sem banco no ambiente atual).
- Aceite: contratos inalterados, handlers thin (grep sem `@/models` em `app/api`), `tsc + build` ok.
- Nota: PUT de expenses agora persiste `boletoUrl`/`observation` (antes eram descartados — bugfix compatível).

### F2 — Molecules + Organisms (migração do front legado) [CONCLUÍDA em 2026-09-16]

- [x] `lib/format.ts` (`formatBRL`, `formatDateBR`), `lib/expense-status.ts` (`getExpenseStatus` — mesmos rótulos).
- [x] Molecules: `FormField, StatusPill, StatCard, SearchBar, EmptyState` (+ barrel).
- [x] Organisms: `Dialog` (shell com ESC/overlay), `ExpenseDialog`, `AppHeader`, `NotifyBanner`, `PaymentDialog` (novo, com toast + `onRegistered` em vez de `location.reload`), `PaymentHistoryPanel` (novo, sem importar mongoose no client).
- [x] `ExpenseForm` migrado p/ atoms + `FormField` (mesma API/props).
- [x] `ExpenseList` migrado p/ `StatusPill`, `EmptyState`, icon-buttons atoms, novos dialogs. Apagados `components/buttons/` (4 arquivos), `PaymentModal.tsx`, `PaymentHistory.tsx`.
- [x] `/design` estendido com preview de molecules/organisms nos 2 temas.
- Aceite: zero imports de `app/components/buttons/*`, `tsc + build` ok.
- Notas: (1) `ExpenseTable/Cards` foram incorporados à migração do `ExpenseList` em vez de componentes separados — evita duplicação; a F3 evolui a lista para o dashboard. (2) Bugfix: botão editar nunca disparava (`onClick={() => onEdit}` sem invocar) — corrigido na migração. (3) Tipos de atoms (`ButtonProps`, `InputProps` etc.) exportados no barrel.

### F3 — Templates + Pages (novo dashboard) [CONCLUÍDA em 2026-09-16]

- [x] `DashboardTemplate` (slots: header/stats/toolbar/feedback/list/footer) + `DashboardClient` + `page.tsx` fino (server, só metadata + composição) + `loading.tsx` (skeletons) + `error.tsx` (retry).
- [x] KPIs (Total ativo/mês, Vencem em 7 dias, Atrasadas) + busca + filtro de status + dialog (nova/edição) no lugar do form inline.
- [x] Hooks `useExpenses, useNotify, useExpenseFilters` (+ `lib/expense-status.getDueInfo`).
- [x] Responsivo + dark/light (tokens semânticos em tudo novo).
- [x] Fix modal em viewport baixo (1366x760): overlay com `overflow-y-auto` + wrapper `min-h-full` — vale para despesa, pagamento e histórico.
- Aceite: `tsc + build` ok; smoke test em prod (`/`, `/design` 200 + `GET /api/expenses` 200 com dado real). Fluxos de escrita (criar/editar/pagar/testar-notify) validar no browser nos 2 temas.
- Nota: mantido fetch client-side (sem duplicar regra no RSC) — `page.tsx` server fino renderiza `DashboardClient`.

### F5 — Lista de despesas: densidade + overflow menu [CONCLUÍDA em 2026-09-16]

- [x] Molecule `Menu` (botão 3 pontos, dropdown com ESC/clique-fora/foco, `aria-haspopup/expanded`, item `danger`).
- [x] `ExpenseList`: linhas densas (valor incorporado ao meta), grupos por status (Atrasadas/A vencer/Em dia/Pagas/Pausadas) com cabeçalhos, ordenação por criticidade, paginação "Mostrar mais" (15/página, reseta ao trocar filtro), ações só no `Menu`. Props inalteradas.
- [x] Preview do `Menu` no `/design`.
- Aceite: linha sem botões visíveis; `tsc + build` ok.

### F6 — AppShell com sidebar (ocupar a tela) [CONCLUÍDA em 2026-09-16]

- [x] Organism `Sidebar` + `MobileNav` (drawer mobile com overlay) + template `AppShell` client usado no `layout.tsx`.
- [x] `NAV_ITEMS` exportado (Dashboard, Despesas, Notificações, Pagamentos) — base p/ customização futura; ativo via `usePathname`.
- [x] Sidebar colapsável (ícones só) com persistência `localStorage`; `ThemeToggle` no rodapé; topbar mobile com hamburger.
- [x] `DashboardTemplate` alargado (`max-w-4xl` → `max-w-6xl` fluido); stubs `/expenses`, `/notifications`, `/payments` (páginas completas na F7).
- [x] Navbar global (título da seção atual + toggle de tema); toggle removido da sidebar, do drawer e do `AppHeader`.
- Aceite: `tsc + build` ok, 4 rotas estáticas geradas. Validar no browser: colapso, drawer, 2 temas.

### F7 — Novas páginas + APIs de suporte [CONCLUÍDA em 2026-09-16]

- [x] API: `GET /api/notifications/scheduled?days=` (dry-run `previewScheduled`, sem enviar) + `GET /api/payments` com filtros opcionais `expenseId/from/to` (repository com `$gte/$lte` em `paidAt`).
- [x] Front: `lib/period.ts` (presets este mês/passado/30/90d), hooks `usePayments` + `useExpenseDialog`, organisms `PageHeader` + `ExpensesManager` (gestão reutilizável), clients `expenses/notifications/payments` + `dashboard-client` refeito (overview).
- [x] `/` overview: KPIs + filtro de período + card de confirmados + por categoria + próximos vencimentos (top 5 reutilizando `ExpenseList`, link “Ver todas”). `/expenses`: gestão completa. `/notifications`: horizonte 7/15/30d + badges (será avisado/pago/sem aviso) + testar agora. `/payments`: tabela global com período + total do período.
- Aceite: `tsc + build` ok; smoke em prod com banco real (`scheduled` e `payments?from&to` retornando dados, 4 páginas 200).
- Nota: tipos de client definidos localmente (nunca importar `@/server` ou `@/models` no browser). Decisão home: `/` virou overview (sem lista completa duplicada); gestão completa mora em `/expenses` via `ExpensesManager` reutilizável. Fix pós-F7: `GET /api/payments` exclui por padrão pagamentos de despesas removidas (`includeRemoved=true` mostra tudo, com `removedCount`); página `/payments` tem checkbox “Mostrar despesas removidas” (desmarcado por padrão).

### F8 — Componentes custom (Select + Calendar) [CONCLUÍDA em 2026-09-16]

- [x] Decisão: headless próprio (sem Radix/nova lib) — mesmo padrão de portal do `Menu`.
- [x] `CustomSelect`: botão + listbox em portal, busca interna opcional, keyboard (Enter/Espaço/setas/ESC), flip medido, `value/onChange/options`.
- [x] `Calendar` (grade pt-BR seg–dom, nav mês, hoje/selecionado, min/max), `DatePicker` (botão + popover), `DateRangePicker` (presets este mês/passado/30/90d + custom com 2 calendários).
- [x] Migração: filtros (status, horizonte, períodos do dashboard/pagamentos — agora com range custom), `ExpenseForm` (frequência/dia/mês), `PaymentDialog` (método + data). Zero `<select>` nativo e zero `type="date"` nas telas (só preview usa os novos).
- [x] Preview no `/design`.
- Aceite: `tsc + build` ok. Validar no browser: keyboard, portal em dialog com scroll, 2 temas.

### F9 — Versionamento + refinamentos do shell [CONCLUÍDA em 2026-09-16]

- [x] `NEXT_PUBLIC_APP_VERSION` via `next.config.js` (lê `package.json`); `v1.0.0` no rodapé da sidebar (2 temas, com `title`).
- [x] Toggle de colapso movido da sidebar para a navbar (desktop); rodapé da sidebar só com versão.
- Aceite: `tsc + build` ok.

### F10 — Integração + QA (era F5) [CONCLUÍDA em 2026-09-16]

- [x] Limpeza: removidos `/design`, tokens legados do `tailwind.config` (`ink/paper/petrol/mustard/rust/line` — grep confirma zero uso em `src`), atom `Select` nativo (sem uso pós-F8), import órfão no `Menu`.
- [x] `README.md` reescrito (nova estrutura, contratos da API, customizações); `docker-compose.yml`/`vercel.json`/`Dockerfile` checados — sem mudanças (rotas preservadas).
- [x] Smoke em prod: 8/8 rotas 200 (`/`, `/expenses`, `/notifications`, `/payments`, `/api/expenses`, `/api/payments`, `/api/notify`, `/api/notifications/scheduled`).
- Aceite: `tsc + build` verdes. Checklist manual de browser (fluxos + 2 temas) fica com o usuário — ver F11.

### F11 — Polish (era F6) [CONCLUÍDA em 2026-09-16 — código]

### Hotfix pós-v1.1.0 — 401 no botão testar + logs (2026-09-17, não commitado)

- Causa: botão "Testar agora" chamava `GET /api/notify` sem token → 401 sempre que `CRON_SECRET` configurado.
- Fix: novo `POST /api/notifications/test` (same-origin via Origin/Referer + cooldown 60s em memória, sem segredo no browser); `useNotify` migrado; `/api/notify` segue exclusivo do cron.
- Logs: `server/shared/logger.ts` (`[ISO] [scope] msg`); `notify` loga unauthorized (via/secretConfigured), start/done (checked/notified/errors) e falha de envio por despesa; `notify-test` loga bloqueios, start e done. Sem segredos nos logs.
- Smoke: 401 sem token, 401 cross-origin, 429 no replay, 200 same-origin (500 aqui por Mongo local inalcançável — caminho validado).
- Troubleshoot cron no servidor: ver `docker compose logs cron` (curl `-fsS` falha em 401) e `docker compose logs app | grep notify`; `CRON_SECRET` com `& ? #` quebra a URL do Ofelia — usar valor alfanumérico.
- Logs visuais (pós-hotfix, não commitado): `server/shared/logger.ts` com cores ANSI (método/status/duração, `token=***`, `NO_COLOR`/`LOG_LEVEL`); `withLogging` envolve os 7 handlers (uma linha por request + ERR em exceção); front com `lib/debug.ts` (só em `npm run dev`) nos hooks `useExpenses/usePayments/useNotify`.

- [x] Auditoria: zero `<select>` nativo / `type="date"` / tokens legados em `src`; todos os botões icon-only com `aria-label` (fix no sino do `AppHeader`); rotas com `metadata`; labels em todos os inputs; dialogs com ESC/focus.
- [x] `tsconfig.tsbuildinfo` no `.gitignore`; versão bump `1.0.0` → `1.1.0` (refletida na sidebar via `NEXT_PUBLIC_APP_VERSION`).
- [x] Reorganização do `ExpenseForm` (pós-QA, a pedido): seções Dados básicos / Vencimento e aviso / Opções avançadas (colapsado), frequência em segmented control, sem card duplo no dialog.
- [ ] Checklist manual do usuário no browser (pendente — buscar/filtrar, CRUD, pagar, testar notify, keyboard nos popovers, drawer, 2 temas).
- [ ] Squash/merge da branch `refactor/atomic-slices-redesign` (aguardando checklist).

## 7. Riscos e mitigação

- Quebrar `/api/notify` silenciosamente → manter template de mensagem idêntico na F4, testar com botão da UI + curl antes/depois.
- Hydration mismatch no toggle → `suppressHydrationWarning` + tema aplicado via `useEffect` ou `next-themes`.
- Tokens antigos espalhados → grep por `ink|paper|petrol|mustard|rust|line` na F10 e remover.
- Escopo do redesign crescer → F1 congela tokens; mudanças visuais após F3 vão para backlog.

## 8. Como executar (comandos)

```bash
git checkout -b refactor/atomic-slices-redesign
npm install zod clsx tailwind-merge class-variance-authority lucide-react sonner
npm run dev
npm run build
curl "http://localhost:3000/api/expenses"
curl "http://localhost:3000/api/notify?token=SEU_CRON_SECRET"
```

## 9. Próximo passo imediato

F11 (polish) — só após checklist manual do usuário no browser: criar/editar/excluir/pagar/histórico/testar-notify, filtros de período, Menu/Select/Calendar (keyboard + portal em dialog), sidebar colapso/drawer, tudo nos 2 temas. Depois: bump de versão no `package.json` + squash/merge da branch `refactor/atomic-slices-redesign`.
