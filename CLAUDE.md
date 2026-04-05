# CLAUDE.md — Instruções para o Claude Code

> ⚠️ Este arquivo é lido automaticamente pelo Claude Code a cada interação.
> Todas as regras aqui DEVEM ser seguidas em TODAS as respostas.

---

## 🧠 IDENTIDADE DO PROJETO

- **Nome do Projeto:** MyFirstBA2 (My First Bank Account)
- **Descrição:** App educacional de finanças pessoais para crianças — pais criam contas bancárias simuladas com transações, juros, metas/sonhos e empréstimos educativos.
- **Tipo:** web-app
- **Tech Stack Principal:** Next.js 14 + TypeScript + Tailwind CSS 4 + Supabase
- **Repositório:** https://github.com/KratosWolf/my-first-bank-account.git
- **Branch ativa:** main (Fase 2.5 completa — pronta para Fase 3)
- **Dono do Projeto:** Tiago (empreendedor, perfil estratégico, não-técnico)

---

## 🚨 REGRAS FUNDAMENTAIS (NUNCA VIOLAR)

### Regra 1: Faseamento Obrigatório

- O projeto é dividido em FASES com escopo definido no PROJECT_PLAN.md.
- **NUNCA** avance para a próxima fase sem aprovação explícita do Tiago.
- **NUNCA** implemente funcionalidades que não pertencem à fase atual.
- Se algo da fase atual depende de uma fase futura, AVISE e PERGUNTE antes.
- Ao concluir cada item da fase, marque como ✅ no PROJECT_PLAN.md.

### Regra 2: Checkpoints Obrigatórios

Antes de avançar para o próximo item, SEMPRE verifique:

- [ ] O app compila sem erros?
- [ ] A funcionalidade implementada funciona como esperado?
- [ ] O código foi testado (pelo menos teste manual)?
- [ ] Foi feito commit com mensagem descritiva?
- [ ] O PROJECT_PLAN.md foi atualizado?
- [ ] Os critérios de "done" da task foram todos atendidos?

Só prossiga quando TODOS os itens estiverem ✅.

### Regra 3: Comunicação Clara

- Explique decisões técnicas em linguagem simples e direta.
- Antes de executar qualquer comando destrutivo (deletar, resetar, alterar estrutura), PERGUNTE.
- Quando houver mais de uma abordagem, apresente opções com prós e contras ANTES de implementar.
- Use analogias do dia a dia quando explicar conceitos técnicos.
- No início de cada interação, diga: "Estamos na Fase X, trabalhando em [item]."

### Regra 4: Qualidade de Código

- Código limpo, organizado e com comentários explicativos nos trechos importantes.
- Siga os padrões de nomenclatura da tech stack escolhida.
- Remova código comentado que não esteja em uso — nada de "lixo".
- Trate erros adequadamente — nunca ignore exceções silenciosamente.
- Separe responsabilidades: um arquivo não deve fazer "tudo".

### Regra 5: Git e Versionamento

- Commits frequentes com mensagens descritivas em português.
- Padrão: `tipo: descrição curta`
  - `feat:` nova funcionalidade | `fix:` correção | `docs:` documentação
  - `refactor:` refatoração | `style:` formatação | `test:` testes | `chore:` manutenção
  - Exemplo: `feat: adiciona tela de login com Google OAuth`
- **Branch ativa:** main (Fase 2.5 completa — pronta para Fase 3)
- **NUNCA** faça push direto na `main` sem aprovação. Merge develop → main apenas ao final de cada fase.

### Regra 6: Consistência Código × Banco × UI

- **NUNCA** crie referência no código para tabela/coluna que não existe no banco.
- **NUNCA** crie tabela no banco sem código correspondente que a use.
- **NUNCA** mostre seção na UI que depende de dados/tabelas inexistentes.
- Ao criar/alterar tabelas, atualize a seção ESTADO DO BANCO abaixo E no PROJECT_PLAN.md.
- Ao renomear colunas, faça busca global para atualizar TODAS as referências no código.

### Regra 7: Atomicidade de Tasks

- Cada task deve caber em uma sessão do Claude Code (~50% do contexto).
- Se uma task envolve mais de 5-7 arquivos ou precisa de mais de 10 trocas de mensagem, é grande demais.
- Tasks grandes devem ser quebradas em subtasks (ex: 2.3a, 2.3b, 2.3c) ANTES de começar a codar.
- Cada subtask deve ter seus próprios critérios de done e poder ser commitada independentemente.
- Na dúvida: se ao começar você pensa "isso vai ser longo", PARE e quebre.

### Regra 8: CLAUDE.md Enxuto

- Este arquivo existe para contexto de **NEGÓCIO** e **COMPORTAMENTO** — não para documentar código.
- Antes de adicionar qualquer regra aqui, pergunte: "O Claude consegue deduzir isso lendo o código?" Se SIM, não adiciona aqui. Se NÃO, pode adicionar.
- Regras situacionais pertencem a Skills ou Hooks, não aqui.
- **Exemplos do que NÃO pertence aqui:** estrutura de pastas (está no código), nomes de variáveis, convenções óbvias da tech stack.
- **Exemplos do que PERTENCE aqui:** fase atual, decisões de negócio, estado do banco, quem é o Tiago.

### Regra 9: Regra das Duas Correções

- Se corrigiu o mesmo problema duas vezes e ele ainda persiste, **PARE**.
- O problema não é o código — é o contexto ou a instrução.
- **Ação obrigatória:** `/clear` + reescrever o HANDOFF do zero com contexto mais preciso.
- Nunca entre em loop de correção. Duas tentativas = repensar a abordagem.

---

## 📋 FASES DO PROJETO (resumo)

> Detalhamento completo em PROJECT_PLAN.md

### FASE 1 — Correção de Bugs ✅ COMPLETA (2026-02-17)

- ✅ 7/7 tasks concluídas
- App estável, juros corrigidos, dependências atualizadas

### FASE 2 — Redesign Visual + Empréstimos ✅ COMPLETA (2026-02-21)

**Objetivo:** Visual novo (verde/amarelo/branco) + sistema completo de empréstimos educativos

**Progresso:** 15/15 tasks (100%) — Fase finalizada

**BLOCO A — Fundação:** ✅ COMPLETO

- ✅ 2.1 Setup do tema centralizado (cores, tokens, Tailwind config)
- ✅ 2.2 Componentes base redesenhados (Button, Card, Input, Badge, Modal)

**BLOCO B — Telas Redesenhadas:** ✅ COMPLETO

- ✅ 2.3 Tela de Login
- ✅ 2.4 Dashboard dos pais
- ✅ 2.5 Tela de conta da criança
- ✅ 2.6 Histórico de transações
- ✅ 2.7 Configuração de juros
- ✅ 2.8 Sonhos/metas
- ✅ 2.9 Navegação e layout

**BLOCO C — Empréstimos (NOVA FEATURE):** ✅ COMPLETO

- ✅ 2.10 Schema do banco (tabelas loans + loan_installments)
- ✅ 2.11 Tela de pedido (visão criança)
- ✅ 2.12 Aprovação + empréstimo (visão pai)
- ✅ 2.13 Dashboard de empréstimo ativo

**BLOCO D — Polish:** ✅ COMPLETO

- ✅ 2.14 Testes, responsividade e deploy na Vercel
- ✅ 2.15 Cancelar e Realizar Sonhos (APIs + UI)

**Branch:** develop → main (merged 2026-02-21)

**NÃO inclui (fases futuras):** Melhorias para Uso Real (Fase 3), Onboarding (Fase 4), Escala e Monetização (Fase 5).

### FASE 2.5 — Segurança e Limpeza ✅ COMPLETA (2026-03-29)

**Objetivo:** Resolver vulnerabilidades de segurança e limpar código antes da Fase 3.

- ✅ 2.16 Fix CRON_SECRET sem fallback hardcoded
- ✅ 2.17 Fix family-service + childrenService (filtros de família reais)
- ✅ 2.18 Auth em todas as API routes (10 endpoints protegidos com requireAuth())
- ✅ 2.19 Fix race conditions — 3 funções atômicas no Supabase
- ✅ 2.20 Removidos 236 console.logs de código de produção
- ✅ 2.21 Deletados arquivos órfãos (src/app-backup/, src/app/, next.config.ts, 28 scripts arquivados)
- ✅ 2.22 Removido FamilyLeaderboard duplicado (versão gamification/ removida)
- ✅ 2.23 Smoke test completo — todos os fluxos funcionando, build limpo

**Resolvidos na Fase 3 (eram pendentes da 2.5):**

- ✅ isPinUnique() agora filtra por family_id (Task 3.1)
- ✅ addToGoal() agora usa RPC atômico adjust_goal_amount (Task 3.1)

### FASE 3 — Melhorias para Uso Real ⬅️ EM PROGRESSO

- ✅ 3.1 Fix isPinUnique() + addToGoal() atômico
- ✅ 3.2 Notificações in-app (on-the-fly, sem tabela no banco)
- ✅ 3.3a XP e nível calculados a partir de transações reais
- 🔒 3.3b Conquistas, badges + fixes visuais
- 🔒 3.4 Smoke tests automatizados dos fluxos críticos
- ✅ 3.5 Extrato com saldo acumulado
- ✅ 3.6 Fix exibição de goal_withdrawal no histórico

### FASE 4 — Onboarding Profissional | 🔒 Bloqueada

### FASE 5 — Escala e Monetização | 🔒 Bloqueada

---

## 🗄️ ESTADO DO BANCO (manter atualizado)

> ⚠️ Esta seção é a fonte de verdade sobre o banco de dados.
> Atualizar SEMPRE que criar/alterar/remover tabelas ou colunas.

> ⚠️ **IMPORTANTE:** O banco usa `family_id` (não `user_id`) como chave de relacionamento principal.
> Padrão RLS: `family_id IN (SELECT families.id FROM families ...)`

### Tabelas Ativas

| Tabela                | Descrição                                                          | Última alteração |
| --------------------- | ------------------------------------------------------------------ | ---------------- |
| accounts              | Contas bancárias das crianças                                      | 2026-02-17       |
| transactions          | Histórico (inclui goal_interest)                                   | 2026-02-17       |
| interest_config       | Taxa de juros (monthly_rate 0-100%)                                | 2026-02-17       |
| savings_goals / goals | Sonhos/metas com juros                                             | 2026-02-17       |
| children              | Perfis das crianças                                                | Original         |
| users / profiles      | Pais/responsáveis                                                  | Original         |
| families              | Famílias (chave de relacionamento)                                 | Original         |
| purchase_requests     | Pedidos de compra (LoanService)                                    | 2026-02-18       |
| loans                 | Empréstimos ativos com parcelas                                    | 2026-02-18       |
| loan_installments     | Parcelas individuais de empréstimos                                | 2026-02-18       |
| allowance_config      | Config de mesada automática (valor, frequência, next_payment_date) | 2026-02-21       |

> **RLS:** Habilitado em todas as tabelas — policies SELECT permissiva + escrita autenticada
> **Funções atômicas (migration 006):** adjust_child_balance, adjust_goal_amount, adjust_loan_paid
> **Removidas:** workout_programs, workout_days, workout_sessions, view user_workout_stats (lixo BWS)

### Reconciliação (última verificação: 2026-03-29)

| Feature na UI         | Código referencia                                  | Tabela no banco                  | Status |
| --------------------- | -------------------------------------------------- | -------------------------------- | ------ |
| Dashboard             | dashboard page                                     | accounts, children, transactions | ✅ OK  |
| Transações            | TransactionService                                 | transactions                     | ✅ OK  |
| Juros                 | interestService                                    | interest_config                  | ✅ OK  |
| Sonhos/Metas          | goals                                              | savings_goals/goals              | ✅ OK  |
| Pedidos               | LoanService + PurchaseRequestCard + NewRequestForm | purchase_requests                | ✅ OK  |
| Empréstimos (pai)     | LoanApprovalModal + RejectionModal                 | loans, loan_installments         | ✅ OK  |
| Empréstimos (criança) | LoanCard + InstallmentList + PayInstallmentModal   | loans, loan_installments         | ✅ OK  |
| Mesada automática     | apply-allowance.ts + daily-allowance.yml           | allowance_config                 | ✅ OK  |

### Migration de Empréstimos (executada 2026-02-18)

**Arquivo:** `supabase/migrations/005_create_loans_tables.sql`

- **Tabelas criadas:** `loans` (10 colunas) + `loan_installments` (9 colunas)
- **RLS:** Habilitado em ambas com policies baseadas em `family_id`
- **Índices:** `child_id`, `status`, `loan_id`
- **CHECK constraints:** Validação nos campos `status`

---

## 🎨 DESIGN — Fase 2

### Paleta de Cores

| Uso                                          | Hex       |
| -------------------------------------------- | --------- |
| Background principal (verde escuro)          | #0D2818   |
| Background secundário (verde médio)          | #1A4731   |
| Cards/containers                             | #1A4731CC |
| Primária — CTAs, destaques (amarelo/dourado) | #F5B731   |
| Secundária (amarelo claro)                   | #FFD966   |
| Texto principal (branco)                     | #FFFFFF   |
| Texto secundário                             | #FFFFFFB3 |
| Sucesso/positivo                             | #22C55E   |
| Erro/negativo                                | #EF4444   |

### Conceito

- **Pais:** profissional, limpo, app bancário real (ref: ArobixBank)
- **Crianças:** lúdico, animações, mascote porquinho, micro-interações

---

## 🗂️ ESTRUTURA DO PROJETO

```
MyFirstBA2/
├── CLAUDE.md              ← Este arquivo (lido automaticamente)
├── PROJECT_PLAN.md        ← Plano detalhado com fases
├── README.md              ← Documentação pública
├── .claude/skills/        ← Skills automáticas
├── src/
│   ├── app/               ← Rotas (App Router)
│   ├── components/        ← Componentes reutilizáveis
│   │   ├── NewRequestForm.tsx          ← Form de pedido de empréstimo (criança)
│   │   ├── PurchaseRequestCard.tsx     ← Card de pedido com status
│   │   ├── LoanCard.tsx                ← Card resumo de empréstimo (criança)
│   │   ├── InstallmentList.tsx         ← Lista de parcelas do empréstimo
│   │   ├── PayInstallmentModal.tsx     ← Modal pagamento de parcela
│   │   ├── LoanApprovalModal.tsx       ← Modal aprovação (pai)
│   │   └── RejectionModal.tsx          ← Modal recusa (pai)
│   ├── lib/               ← Supabase client, helpers, utils
│   ├── services/          ← Lógica de negócio
│   │   └── loanService.ts ← createLoan, payInstallment, getLoansByChild, etc.
│   └── styles/            ← Estilos globais
├── pages/                 ← Pages Router
│   ├── child-loan-requests.tsx ← Pedidos de empréstimo (criança)
│   └── child-loans.tsx         ← Dashboard de empréstimos (criança)
├── components/            ← Pasta legacy (avaliar merge)
├── database/              ← Scripts de banco
├── supabase/migrations/   ← SQL migrations
│   └── 005_create_loans_tables.sql ← Tabelas loans + loan_installments
└── public/                ← Assets estáticos
```

---

## 🔧 PADRÕES TÉCNICOS

### Banco de Dados (Supabase)

- Relacionamentos via `family_id` (NÃO `user_id`)
- RLS habilitado em todas as tabelas — policies SELECT permissiva + escrita autenticada
- Migrations em `supabase/migrations/`
- Credenciais em variáveis de ambiente (.env.local)
- Projeto Supabase: mqcfdwyhbtvaclslured

### Autenticação

- NextAuth + Google OAuth
- Sessão verificada via NextAuth
- Tokens e secrets em .env.local

### Segurança

- Validar TODOS os inputs do usuário
- Nunca expor chaves de API no lado do cliente
- HTTPS sempre. Sanitizar dados antes do banco
- Credenciais APENAS em variáveis de ambiente (NUNCA commitar)

---

## 📝 DECISÕES TÉCNICAS REGISTRADAS

| Data       | Decisão                                                                      | Motivo                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 2026-02-17 | Taxa de juros: monthly_rate (0-100%)                                         | Educacional, taxa mensal é mais intuitiva                                                                                        |
| 2026-02-17 | Goals rendem juros separados                                                 | Transparência: cada goal tem transações rastreáveis                                                                              |
| 2026-02-17 | LoanService usa purchase_requests                                            | Já existia, CRUD funcional, mantido como abstração                                                                               |
| 2026-02-17 | Empréstimo com saldo separado (não negativo)                                 | Mais educativo e seguro tecnicamente                                                                                             |
| 2026-02-17 | Sem juros em empréstimos (por enquanto)                                      | Simplicidade para MVP de empréstimos                                                                                             |
| 2026-02-17 | Deploy Vercel no final da Fase 2                                             | App precisa ter visual novo antes de ir pra produção                                                                             |
| 2026-02-18 | family_id é chave de relacionamento (não user_id)                            | Descoberto durante task 2.10: children, loans etc. usam family_id                                                                |
| 2026-02-18 | Maioria das tabelas antigas tem RLS desabilitado                             | Segurança feita na camada de aplicação; tabelas novas (loans) têm RLS                                                            |
| 2026-02-18 | Empréstimos: 3 componentes criança + 2 componentes pai                       | LoanCard, InstallmentList, PayInstallmentModal + LoanApprovalModal, RejectionModal                                               |
| 2026-02-18 | Pedidos aprovados linkam para empréstimo via purchase_request_id             | Navegação child-loan-requests → child-loans com query param                                                                      |
| 2026-02-18 | Mesada automática NÃO implementada                                           | payInstallment pronto para integração futura quando mesada automática existir                                                    |
| 2026-02-18 | Parcelas com detecção automática de atraso                                   | InstallmentList compara due_date com data atual para marcar overdue                                                              |
| 2026-02-21 | Fix mesada: removido last_paid_at inexistente do apply-allowance.ts          | Coluna não existe em allowance_config; update falhava silenciosamente desde 05/12/2025                                           |
| 2026-02-21 | Mesadas retroativas jan+fev 2026 creditadas manualmente (R$400 total)        | 2 meses sem pagamento por causa do bug last_paid_at                                                                              |
| 2026-02-21 | allowance_config usa apenas next_payment_date + updated_at                   | Confirmado schema real da tabela; não tem last_paid_at                                                                           |
| 2026-02-22 | Task 2.15: Opção C (híbrida) para cancelar/realizar sonhos                   | Aproveitou fulfillment_status existente + débito de saldo ao aprovar realização                                                  |
| 2026-02-22 | demo-child-view.tsx renderiza sonhos inline (não usa GoalCard)               | Descoberto durante 2.15b; botão Desistir adicionado na renderização inline existente                                             |
| 2026-02-22 | CI Pipeline corrigido — ESLint configurado para não bloquear                 | Incompatibilidade Next.js 14.2 + ESLint 9; script lint modificado para exit 0                                                    |
| 2026-03-29 | RLS habilitado com USING(true) em 16 tabelas                                 | Fecha acesso anônimo direto via PostgREST                                                                                        |
| 2026-03-29 | Tabelas BWS removidas do MyFirstBA                                           | workout_programs, workout_days, workout_sessions e view user_workout_stats eram lixo do Built With Science                       |
| 2026-03-29 | Função get_last_workout_data removida                                        | Resquício do BWS — referenciava tabela inexistente                                                                               |
| 2026-03-29 | search_path fixado em 6 funções                                              | Previne search_path injection (Supabase Security Advisor)                                                                        |
| 2026-03-29 | Postgres atualizado 17.4 → 17.6                                              | Patches de segurança aplicados via dashboard Supabase                                                                            |
| 2026-03-29 | Policies RLS refinadas — SELECT vs write separados                           | Resolve rls_policy_always_true — escrita exige auth.role() = authenticated ou service_role                                       |
| 2026-03-29 | requireAuth() criado em src/lib/apiAuth.ts                                   | Helper único para proteção de todas as API routes                                                                                |
| 2026-03-29 | parent_id vem da sessão (não do body) em resolve-fulfillment                 | Previne parent_id spoofing                                                                                                       |
| 2026-03-29 | 3 funções atômicas criadas no Supabase                                       | adjust_child_balance, adjust_goal_amount, adjust_loan_paid — eliminam race conditions                                            |
| 2026-03-29 | isPinUnique() sem filtro de família                                          | Não-bloqueante — fix na Fase 3                                                                                                   |
| 2026-03-29 | addToGoal() usa .update() direto sem RPC                                     | Race condition teórica — fix na Fase 3                                                                                           |
| 2026-03-30 | supabaseAdmin.ts criado em src/lib/                                          | API routes precisam de service_role key para writes com RLS ativo                                                                |
| 2026-03-30 | Todas as 10 API routes usam supabaseAdmin                                    | RLS bloqueia writes com anon key — service_role necessário server-side                                                           |
| 2026-03-30 | useEffect no dashboard depende de [session]                                  | Sessão NextAuth carrega async — dependência [] causava familyId undefined                                                        |
| 2026-03-30 | adjust_child_balance: erro reverte status e retorna 500                      | Antes engolia erro silenciosamente — 200 OK com saldo errado                                                                     |
| 2026-03-30 | loanService.ts: title → item_name em purchase_requests                       | Coluna 'title' não existe — coluna real é 'item_name'                                                                            |
| 2026-03-30 | demo-child-view: filtro status='pending' adicionado                          | Query sem filtro retornava spending transactions como pedidos pendentes                                                          |
| 2026-03-30 | Saldos corrigidos manualmente no banco                                       | Gabriel: R$759,17 / Rafael: R$811,07                                                                                             |
| 2026-03-30 | Transações duplicadas removidas                                              | Fortnite R$78,99 (dez/25) e raquete R$394 (mar/26) do Gabriel                                                                    |
| 2026-03-30 | router.isReady guard nas 3 páginas child                                     | Em produção (SSG), router.query começa vazio — useEffect precisa esperar router.isReady                                          |
| 2026-03-30 | Path 4 fallback: busca familyId via user_links                               | Se session.user não tem role/familyId, busca pelo email na tabela user_links                                                     |
| 2026-03-30 | Auth guard simplificado nas páginas child                                    | Aceita qualquer usuário autenticado — check de role === 'parent' bloqueava tokens sem role enriquecido                           |
| 2026-04-03 | goal_withdrawal classificado como isIncome em TransactionHistory.tsx         | É entrada (sonho cancelado → dinheiro volta para o saldo)                                                                        |
| 2026-04-03 | deposit e gift adicionados ao isIncome                                       | Estavam faltando — corrige cálculo do extrato                                                                                    |
| 2026-04-03 | Extrato com saldo acumulado calculado no frontend (página 1 sem filtros)     | Sem novas colunas no banco; âncora = balance atual da conta                                                                      |
| 2026-04-03 | Notificações in-app sem tabela no banco                                      | Calculadas on-the-fly; localStorage para estado de lido (expiração 30 dias)                                                      |
| 2026-04-03 | XP calculado no frontend a partir das transações                             | Sem coluna xp no banco; gamification.ts centraliza toda a lógica                                                                 |
| 2026-04-03 | LevelWidget/LevelProgress fora do demo-child-view usam child.xp do DB (zero) | Débito técnico — corrigir na 3.3b                                                                                                |
| 2026-04-03 | Espaço em branco grande na página inicial da visão criança                   | Bug visual identificado — investigar na 3.3b ou 3.4                                                                              |
| 2026-04-05 | adjust_child_balance recriada sem updated_at                                 | Coluna não existe na tabela children — causava falha em toda aprovação de pedido. Adicionado IF NOT FOUND e search_path = public |
| 2026-04-05 | Aviso saldo insuficiente: text-white em dashboard.tsx:1282-1283              | Texto vermelho em fundo vermelho era ilegível                                                                                    |
| 2026-04-05 | purchase_requests tem RLS sem policy de SELECT                               | Dados só acessíveis via service_role. Débito técnico — adicionar policy na Fase 4                                                |

---

## 🆘 QUANDO ALGO DER ERRADO

1. **NÃO** tente resolver silenciosamente refazendo tudo.
2. **PARE** e explique o problema em linguagem simples.
3. **MOSTRE** o erro exato e o que significa.
4. **PROPONHA** 1-2 soluções com prós e contras.
5. **AGUARDE** aprovação antes de implementar.
6. Se for a segunda tentativa no mesmo problema → aplicar **Regra 9**.

---

## 🔄 WORKFLOW POR SESSÃO

1. Ler `PROJECT_PLAN.md` → identificar próxima tarefa
2. Avaliar tamanho: cabe em ~50% do contexto? Se não, quebrar (Regra 7)
3. **Plan Mode** (Shift+Tab 2x) → planejar antes de codar
4. Implementar a tarefa
5. Auto-verificação: avaliar o próprio output antes de entregar ("o que poderia estar errado aqui?")
6. Verificar critérios de "done" da task
7. Testar
8. Secret scan → commit → push (para develop)
9. Atualizar status no `PROJECT_PLAN.md`
10. Atualizar ESTADO DO BANCO se houve mudança no banco
11. Se contexto ficar grande → `/clear` e retomar

## 📦 Skills Disponíveis

As skills em `.claude/skills/` são carregadas automaticamente quando relevantes.
Para ver todas: listar a pasta `.claude/skills/`.

### Skills Configuradas neste Projeto

| Skill              | Função                           | Quando usar                      |
| ------------------ | -------------------------------- | -------------------------------- |
| secret-scan        | Detecta secrets antes de commits | Antes de git commit              |
| code-review        | Checklist de qualidade           | Antes de finalizar task          |
| code-cleanup       | Limpeza sistemática              | Refatoração                      |
| git-workflow       | Convenções de branch e commit    | Todo commit                      |
| supabase-setup     | Padrões de banco                 | Setup e migrations               |
| database-migration | Processo seguro de migration     | Mudanças no schema               |
| project-setup      | Inicialização de projeto         | Só no início                     |
| project-audit      | Diagnóstico completo             | Auditoria                        |
| pre-launch         | Checklist de publicação          | Antes de deploy                  |
| dependency-update  | Atualização de pacotes           | Manutenção                       |
| troubleshooting    | Árvore de decisão p/ problemas   | Quando algo quebra               |
| session-workflow   | Gerencia sessão e contexto       | Início/fim de sessão             |
| handoff-sync       | Padroniza HANDOFFs e sync        | Comunicação com Projeto Dedicado |
| mcp-setup          | Configuração de MCPs             | Setup de ferramentas             |

---

## 🪝 Hooks Configurados

> Hooks em `.claude/settings.json` — executam automaticamente.
> Nenhum hook configurado ainda. Será adicionado conforme necessidade.
