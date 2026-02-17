# CLAUDE.md — Instruções para o Claude Code

> ⚠️ Este arquivo é lido automaticamente pelo Claude Code a cada interação.
> Todas as regras aqui DEVEM ser seguidas em TODAS as respostas.

---

## 🧠 IDENTIDADE DO PROJETO

- **Nome do Projeto:** My First Bank Account (MyFirstBA2)
- **Descrição:** App educacional de finanças pessoais para crianças. Os pais criam contas bancárias simuladas para os filhos, com saldo, transações, rendimentos (juros configuráveis), sonhos/metas de economia, e um dashboard completo. Ferramenta pedagógica para ensinar educação financeira na prática.
- **Tipo:** web-app
- **Tech Stack Principal:** Next.js 14 + React 18 + Supabase + NextAuth + Tailwind CSS 4
- **Repositório:** GitHub (KratosWolf)
- **Supabase Project:** mqcfdwyhbtvaclslured (21 tabelas)
- **Pasta Local:** /Users/tiagofernandes/Desktop/VIBE/MyFirstBA2
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

- [ ] O app compila sem erros (`npm run build`)?
- [ ] A funcionalidade implementada funciona como esperado?
- [ ] O código foi testado (pelo menos teste manual no browser)?
- [ ] Foi feito commit com mensagem descritiva?
- [ ] O PROJECT_PLAN.md foi atualizado?

Só prossiga quando TODOS os itens estiverem ✅.

### Regra 3: Comunicação Clara

- Explique decisões técnicas em linguagem simples e direta.
- Antes de executar qualquer comando destrutivo (deletar, resetar, alterar banco/migrations), PERGUNTE.
- Quando houver mais de uma abordagem, apresente opções com prós e contras ANTES de implementar.
- Use analogias do dia a dia quando explicar conceitos técnicos.
- No início de cada interação, diga: "Estamos na Fase X, trabalhando em [item]."

### Regra 4: Qualidade de Código

- Código limpo, organizado e com comentários explicativos nos trechos importantes.
- Siga os padrões de nomenclatura do Next.js / React / TypeScript.
- Remova código comentado que não esteja em uso — nada de "lixo".
- Trate erros adequadamente — nunca ignore exceções silenciosamente.
- Separe responsabilidades: um arquivo não deve fazer "tudo".

### Regra 5: Git e Versionamento

- Commits frequentes com mensagens descritivas em português.
- Padrão: `tipo: descrição curta`
  - `feat:` nova funcionalidade | `fix:` correção | `docs:` documentação
  - `refactor:` refatoração | `style:` formatação | `test:` testes | `chore:` manutenção
  - Exemplo: `fix: corrige cálculo de juros para usar taxa mensal configurável`
- Branches: `main` (produção) → `develop` (desenvolvimento) → `feature/nome`
- NUNCA faça push direto na `main`.

### Regra 6: Banco de Dados (Supabase)

- **NUNCA** altere tabelas diretamente no dashboard do Supabase.
- Toda alteração de schema deve ser feita via migration SQL documentada.
- Antes de rodar qualquer migration, MOSTRE o SQL para aprovação.
- Mantenha backup do schema atual antes de alterações.
- RLS (Row Level Security) deve estar ativo em TODAS as tabelas.

---

## 📋 FASES DO PROJETO (resumo)

> ⚠️ PROJETO EXISTENTE EM EVOLUÇÃO — não é um projeto novo.
> Detalhamento completo em PROJECT_PLAN.md

### FASE 1 — Correção de Bugs ⬅️ FASE ATUAL

**Objetivo:** Corrigir bugs existentes e estabilizar funcionalidades

- [ ] 1.0 Organização do projeto (mover .md antigos, scripts soltos)
- [ ] 1.1 Histórico de transações completo (com filtros)
- [ ] 1.2 Taxa de juros configurável (sem teto fixo)
- [ ] 1.3 Juros nos sonhos/metas de economia
- [ ] 1.4 Keep-alive do Supabase (investigar e corrigir)
- [ ] 1.5 Testes e validação de todas as correções

**NÃO inclui (fases futuras):** Redesign visual, onboarding, novas features

### FASE 2 — Redesign Visual Completo | 🔒 Bloqueada

### FASE 3 — Onboarding Profissional | 🔒 Bloqueada

### FASE 4 — Melhorias Futuras | 🔒 Bloqueada

---

## 🗂️ ESTRUTURA DO PROJETO

```
MyFirstBA2/
├── CLAUDE.md                ← Este arquivo (lido automaticamente)
├── PROJECT_PLAN.md          ← Plano detalhado com fases
├── README.md                ← Documentação pública
├── .env.local               ← Credenciais (NUNCA commitar)
├── .gitignore
├── .claude/
│   ├── settings.local.json  ← Config do Claude Code
│   └── skills/              ← Skills automáticas (10 skills)
│       ├── code-cleanup/
│       ├── code-review/
│       ├── dependency-update/
│       ├── git-workflow/
│       ├── pre-launch/
│       ├── project-audit/
│       ├── project-setup/
│       ├── secret-scan/
│       ├── session-workflow/
│       └── supabase-setup/
├── docs/
│   └── archive/             ← Documentação histórica (fases anteriores)
│       ├── AUDIT_REPORT.md
│       ├── AUDITORIA_FINAL_30NOV2025.md
│       ├── CORRECOES_FASE_2.5.1.md
│       ├── CRON_JOBS_SETUP.md
│       ├── DIAGNOSTICO_*.md
│       ├── FASE_*.md
│       ├── GUIA_*.md
│       ├── MYFIRSTBANKACCOUNT_MASTERPLAN_V6.md
│       ├── PROBLEMA_ATUAL.md
│       ├── PROJECT_SUMMARY.md
│       ├── ROTEIRO_TESTE_COMPLETO.md
│       ├── SISTEMA_REALIZACAO_SONHOS.md
│       └── TODO.md
├── src/
│   ├── app/                 ← Rotas e páginas (App Router)
│   ├── components/          ← Componentes reutilizáveis
│   ├── lib/                 ← Utilitários, Supabase client, helpers
│   ├── services/            ← API calls e lógica de negócio
│   └── styles/              ← Estilos globais e tema
├── components/              ← Componentes (pasta legacy — avaliar merge com src/)
├── database/                ← Scripts de banco
├── pages/                   ← Pages Router (legacy — avaliar migração para App Router)
├── scripts/                 ← Scripts utilitários (check-*.js, setup-*.js, etc.)
├── public/                  ← Assets estáticos
└── supabase/
    └── migrations/          ← SQL migrations (schema changes)
```

### ⚠️ Observações sobre a estrutura atual

- Existem **duas pastas de componentes**: `components/` (raiz) e `src/components/`. Avaliar na Fase 2 se faz sentido unificar.
- Existe a pasta `pages/` (Pages Router) além de `src/app/` (App Router). Avaliar se há rotas duplicadas.
- Scripts soltos na raiz (`check-*.js`, `setup-*.js`, `test-*.js`, `execute-sql.js`) devem ficar em `scripts/`.
- Arquivos `.sql` soltos na raiz devem ir para `database/` ou `supabase/migrations/`.

### 📁 docs/archive/ — Histórico do Projeto

A pasta `docs/archive/` contém toda a documentação das fases anteriores (Ago-Nov 2025). Estes arquivos são **referência histórica** — úteis para consultar decisões passadas, mas NÃO são a fonte de verdade atual. A fonte de verdade é este `CLAUDE.md` + `PROJECT_PLAN.md`.

---

## 🔧 PADRÕES TÉCNICOS

### Banco de Dados (Supabase PostgreSQL)

- **Projeto:** mqcfdwyhbtvaclslured
- **21 tabelas** existentes (incluindo: accounts, transactions, interest_config, savings_goals, etc.)
- RLS ativo em todas as tabelas
- Toda alteração via migration SQL em `supabase/migrations/`
- Naming: snake_case para tabelas e colunas
- Migration pendente conhecida: `003_fix_interest_config_columns.sql` (remover teto de taxa)

### Autenticação (NextAuth + Google OAuth)

- Login via Google OAuth configurado
- Sessões gerenciadas por NextAuth
- Tokens e secrets em `.env.local` (NUNCA commitar)
- Middleware de proteção de rotas ativo

### Segurança

- Validar TODOS os inputs do usuário.
- Nunca expor chaves de API no lado do cliente (usar NEXT*PUBLIC* apenas para keys públicas).
- HTTPS sempre. Sanitizar dados antes do banco.
- Credenciais e secrets APENAS em variáveis de ambiente (NUNCA commitar).

---

## 📝 DECISÕES TÉCNICAS REGISTRADAS

> Registre aqui para evitar que o Claude Code refaça escolhas já discutidas.

| Data       | Decisão                                                             | Motivo                                                    |
| ---------- | ------------------------------------------------------------------- | --------------------------------------------------------- |
| 2026-02-17 | Taxa de juros configurável pelo pai (sem teto)                      | Ferramenta educacional, não precisa refletir mercado real |
| 2026-02-17 | Sonhos/metas devem render juros igual ao saldo                      | Incentivo para criança guardar dinheiro nos sonhos        |
| 2026-02-17 | Onboarding: 1-2 responsáveis flexível                               | Cobre configurações familiares diversas sem complicar     |
| 2026-02-17 | Dados da criança: nome + data nascimento + avatar + apelido         | Suficiente para personalização sem ser invasivo           |
| 2026-02-17 | Prioridade: bugs → redesign → onboarding                            | Estabilizar o que existe antes de adicionar/mudar         |
| 2026-02-17 | Paleta redesign: verde escuro + amarelo/dourado + branco            | Aprovado com referências (porquinho + ArobixBank)         |
| 2026-02-17 | Conceito redesign: profissional pais + divertido filhos + animações | Equilíbrio entre credibilidade e engajamento              |

---

## 🆘 QUANDO ALGO DER ERRADO

1. **NÃO** tente resolver silenciosamente refazendo tudo.
2. **PARE** e explique o problema em linguagem simples.
3. **MOSTRE** o erro exato e o que significa.
4. **PROPONHA** 1-2 soluções com prós e contras.
5. **AGUARDE** aprovação antes de implementar.

---

## Comandos

- `npm run dev` — rodar em dev (localhost:3000)
- `npm run build` — build de produção
- `npm run lint` — verificar código

## Workflow por Sessão

1. Ler `PROJECT_PLAN.md` → identificar próxima tarefa
2. **Plan Mode** (Shift+Tab 2x) → planejar antes de codar
3. Implementar a tarefa
4. Testar (`npm run build` + teste manual no browser)
5. Commit → push para develop
6. Atualizar status no `PROJECT_PLAN.md`
7. Se contexto ficar grande → `/clear` e retomar
