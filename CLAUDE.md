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
- **Branch ativa:** develop (Fase 2)
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
- **Branch ativa:** develop (Fase 2)
- **NUNCA** faça push direto na `main`. Merge develop → main apenas ao final da fase.

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

---

## 📋 FASES DO PROJETO (resumo)

> Detalhamento completo em PROJECT_PLAN.md

### FASE 1 — Correção de Bugs ✅ COMPLETA (2026-02-17)

- ✅ 7/7 tasks concluídas
- App estável, juros corrigidos, dependências atualizadas

### FASE 2 — Redesign Visual + Empréstimos ⬅️ FASE ATUAL

**Objetivo:** Visual novo (verde/amarelo/branco) + sistema completo de empréstimos educativos

**Progresso:** 13/14 tasks (93%) — falta apenas 2.14

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

**BLOCO D — Polish:**

- [ ] 2.14 Testes, responsividade e deploy na Vercel

**NÃO inclui (fases futuras):** Onboarding (Fase 3), Notificações, Gamificação, PWA, Monetização (Fase 4).

### FASE 3 — Onboarding Profissional | 🔒 Bloqueada

### FASE 4 — Melhorias Futuras | 🔒 Bloqueada

---

## 🗄️ ESTADO DO BANCO (manter atualizado)

> ⚠️ Esta seção é a fonte de verdade sobre o banco de dados.
> Atualizar SEMPRE que criar/alterar/remover tabelas ou colunas.

> ⚠️ **IMPORTANTE:** O banco usa `family_id` (não `user_id`) como chave de relacionamento principal.
> Padrão RLS: `family_id IN (SELECT families.id FROM families ...)`

### Tabelas Ativas

| Tabela                | Descrição                           | Última alteração |
| --------------------- | ----------------------------------- | ---------------- |
| accounts              | Contas bancárias das crianças       | 2026-02-17       |
| transactions          | Histórico (inclui goal_interest)    | 2026-02-17       |
| interest_config       | Taxa de juros (monthly_rate 0-100%) | 2026-02-17       |
| savings_goals / goals | Sonhos/metas com juros              | 2026-02-17       |
| children              | Perfis das crianças                 | Original         |
| users / profiles      | Pais/responsáveis                   | Original         |
| families              | Famílias (chave de relacionamento)  | Original         |
| purchase_requests     | Pedidos de compra (LoanService)     | 2026-02-18       |
| loans                 | Empréstimos ativos com parcelas     | 2026-02-18       |
| loan_installments     | Parcelas individuais de empréstimos | 2026-02-18       |
| [+ outras]            | Mapear quando necessário            | —                |

### Reconciliação (última verificação: 2026-02-18)

| Feature na UI         | Código referencia                                  | Tabela no banco                  | Status |
| --------------------- | -------------------------------------------------- | -------------------------------- | ------ |
| Dashboard             | dashboard page                                     | accounts, children, transactions | ✅ OK  |
| Transações            | TransactionService                                 | transactions                     | ✅ OK  |
| Juros                 | interestService                                    | interest_config                  | ✅ OK  |
| Sonhos/Metas          | goals                                              | savings_goals/goals              | ✅ OK  |
| Pedidos               | LoanService + PurchaseRequestCard + NewRequestForm | purchase_requests                | ✅ OK  |
| Empréstimos (pai)     | LoanApprovalModal + RejectionModal                 | loans, loan_installments         | ✅ OK  |
| Empréstimos (criança) | LoanCard + InstallmentList + PayInstallmentModal   | loans, loan_installments         | ✅ OK  |

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
- Maioria das tabelas antigas com RLS desabilitado (segurança na aplicação)
- RLS habilitado nas tabelas novas (loans, loan_installments)
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

| Data       | Decisão                                                          | Motivo                                                                             |
| ---------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 2026-02-17 | Taxa de juros: monthly_rate (0-100%)                             | Educacional, taxa mensal é mais intuitiva                                          |
| 2026-02-17 | Goals rendem juros separados                                     | Transparência: cada goal tem transações rastreáveis                                |
| 2026-02-17 | LoanService usa purchase_requests                                | Já existia, CRUD funcional, mantido como abstração                                 |
| 2026-02-17 | Empréstimo com saldo separado (não negativo)                     | Mais educativo e seguro tecnicamente                                               |
| 2026-02-17 | Sem juros em empréstimos (por enquanto)                          | Simplicidade para MVP de empréstimos                                               |
| 2026-02-17 | Deploy Vercel no final da Fase 2                                 | App precisa ter visual novo antes de ir pra produção                               |
| 2026-02-18 | family_id é chave de relacionamento (não user_id)                | Descoberto durante task 2.10: children, loans etc. usam family_id                  |
| 2026-02-18 | Maioria das tabelas antigas tem RLS desabilitado                 | Segurança feita na camada de aplicação; tabelas novas (loans) têm RLS              |
| 2026-02-18 | Empréstimos: 3 componentes criança + 2 componentes pai           | LoanCard, InstallmentList, PayInstallmentModal + LoanApprovalModal, RejectionModal |
| 2026-02-18 | Pedidos aprovados linkam para empréstimo via purchase_request_id | Navegação child-loan-requests → child-loans com query param                        |
| 2026-02-18 | Mesada automática NÃO implementada                               | payInstallment pronto para integração futura quando mesada automática existir      |
| 2026-02-18 | Parcelas com detecção automática de atraso                       | InstallmentList compara due_date com data atual para marcar overdue                |

---

## 🆘 QUANDO ALGO DER ERRADO

1. **NÃO** tente resolver silenciosamente refazendo tudo.
2. **PARE** e explique o problema em linguagem simples.
3. **MOSTRE** o erro exato e o que significa.
4. **PROPONHA** 1-2 soluções com prós e contras.
5. **AGUARDE** aprovação antes de implementar.

---

## 🔄 WORKFLOW POR SESSÃO

1. Ler `PROJECT_PLAN.md` → identificar próxima tarefa
2. Avaliar tamanho: cabe em ~50% do contexto? Se não, quebrar (Regra 7)
3. **Plan Mode** (Shift+Tab 2x) → planejar antes de codar
4. Implementar a tarefa
5. Verificar critérios de "done" da task
6. Testar
7. Secret scan → commit → push (para develop)
8. Atualizar status no `PROJECT_PLAN.md`
9. Atualizar ESTADO DO BANCO se houve mudança no banco
10. Se contexto ficar grande → `/clear` e retomar

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
