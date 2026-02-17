# PROJECT_PLAN.md — My First Bank Account (MyFirstBA2)

> Este documento é a fonte única de verdade sobre o que será construído,
> em que ordem, e com que tecnologias. Deve ser mantido atualizado.
> ⚠️ PROJETO EXISTENTE EM EVOLUÇÃO — não é um projeto novo.

---

## 📌 VISÃO GERAL

### O que é este projeto?

App educacional de finanças pessoais para crianças. Os pais criam contas bancárias simuladas para os filhos, com saldo, transações (depósitos, saques, presentes), rendimentos por juros configuráveis, e sonhos/metas de economia. O objetivo é ensinar educação financeira na prática, de forma lúdica e engajante. Pensado para futura comercialização.

### Público-alvo

- **Pais/responsáveis** — gerenciam as contas, configuram juros, fazem depósitos/saques
- **Crianças (filhos)** — visualizam saldo, transações, acompanham sonhos, veem rendimentos

### Resultado esperado

App funcional com bugs corrigidos, visual redesenhado (verde escuro + amarelo/dourado + branco), e fluxo de onboarding profissional para futura comercialização.

### Situação Atual (Fev 2026)

- App funcional com 21 tabelas no Supabase
- Login com Google OAuth via NextAuth
- Dashboard de pais + visão de crianças
- Transações, juros (com bugs), sonhos/metas
- 138 arquivos, ~31K linhas de código
- 0% test coverage, 28 dependências desatualizadas
- Supabase projeto: mqcfdwyhbtvaclslured (restaurado após auto-pause)

---

## 🛠️ TECH STACK

### Stack Atual

| Camada         | Tecnologia              | Motivo                         |
| -------------- | ----------------------- | ------------------------------ |
| Frontend       | Next.js 14 + React 18   | App Router, SSR, boa DX        |
| Linguagem      | TypeScript              | Type safety                    |
| Styling        | Tailwind CSS 4          | Utility-first, produtivo       |
| Backend/BaaS   | Supabase                | Auth + DB + Storage integrados |
| Banco de Dados | PostgreSQL via Supabase | Relacional com RLS             |
| Autenticação   | NextAuth + Google OAuth | Sem fricção para pais          |
| Hospedagem     | Vercel (provável)       | Melhor para Next.js            |
| Versionamento  | GitHub                  | Padrão                         |

### Dependências Principais

```
next: 14.x
react: 18.x
@supabase/supabase-js
@supabase/ssr
next-auth
tailwindcss: 4.x
typescript
```

---

## 📋 FASES DO PROJETO

---

### FASE 1 — Correção de Bugs ⬅️ FASE ATUAL

**Objetivo:** Corrigir todos os bugs identificados e estabilizar o app antes de qualquer mudança visual ou funcional nova.
**Prazo estimado:** 1-2 semanas

| #   | Funcionalidade                   | Status      | Notas                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --- | -------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0 | Organização do projeto           | ✅ Completo | Movidos 24 arquivos .md para `docs/archive/`, 8 scripts para `scripts/`, 3 arquivos .sql para `database/`. Raiz limpa mantendo apenas CLAUDE.md, PROJECT_PLAN.md, README.md e configs (.js).                                                                                                                                                                                                                                                         |
| 1.1 | Histórico de transações completo | ✅ Completo | **IMPLEMENTADO:** TransactionService atualizado com filtros avançados (data, tipo, categoria) e paginação (20 itens/página). Componente TransactionHistory.tsx criado com UI completa: filtros por período (7/30/90 dias/todos), tipo (ganhos/gastos/etc.), categoria. Paginação "Carregar Mais", contador de resultados, empty state. Integrado em demo-child-view. Testado com 12 transações: filtros OK, cores OK, performance OK.                |
| 1.2 | Taxa de juros configurável       | ✅ Completo | **IMPLEMENTADO:** Renomeada coluna annual_rate → monthly_rate. Interface TypeScript atualizada (0-100%). Backend (transactions.ts, interestService.ts) corrigido. UI (InterestConfigManager.tsx) com "Taxa Mensal %" até 100%, slider 0-20%. Migration 004 executada no Supabase Studio. Constraint CHECK (0-100%) funcionando. Valores preservados (9.9 = 9.9% mensal). Scripts de validação criados.                                               |
| 1.3 | Juros nos sonhos/metas           | ✅ Completo | **IMPLEMENTADO:** Adicionado tipo `goal_interest` ao enum Transaction. Função `calculateInterest()` estendida para calcular juros separadamente para cada goal ativo (tabela `goals`). Juros aplicados sobre `current_amount` de cada goal com 30 dias+ de carência (baseado em `created_at`). Transações de rastreamento criadas com `type='goal_interest'` e `related_goal_id`. Goals não prejudicam juros do saldo principal (cálculo adicional). |
| 1.4 | Keep-alive do Supabase           | ✅ Completo | **Reativados 3 workflows GitHub Actions:** keep-supabase-alive.yml (pings Domingo/Quarta 9h UTC), monthly-interest.yml (dia 1 às 00h UTC), daily-allowance.yml. Workflows estavam em `disabled_inactivity` (60 dias sem commit). Testado keep-alive manualmente com sucesso (HTTP 200, Supabase respondendo). Próximo ping automático: Domingo ou Quarta às 9h UTC.                                                                                  |
| 1.5 | Audit de dependências            | ✅ Completo | **IMPLEMENTADO:** Auditadas 28 dependências outdated. Atualizadas 14 críticas/importantes: @supabase/supabase-js (2.96.0), dotenv (17.3.1), typescript (5.9.3), next (14.2.35), tailwindcss (4.1.18), playwright (1.58.2), prettier (3.8.1), @types/\* atualizados. Mantidos em versões atuais (sem breaking changes): React 18, Next 14, Jest 29, ESLint 9. Build validado. Documento de auditoria criado em docs/DEPENDENCY_AUDIT_2026-02-17.md.   |
| 1.6 | Correção de labels e cleanup     | ✅ Completo | **BUG FIX #1:** Corrigido label incorreto na seção "Meus Pedidos" (demo-child-view:875) - purchase_requests exibindo "Empréstimo: [categoria]" agora mostram "Pedido: [categoria]". **INVESTIGAÇÃO #2:** LoanService investigado - NÃO é órfão, usa tabela `purchase_requests` existente com filtro `category='Empréstimo'`. Serviço mantido como camada de abstração válida. Documentação completa em /tmp/loanservice-findings.md.                 |
| 1.7 | Testes e validação               | ✅ Completo | **TESTADO E VALIDADO:** Todos os fluxos corrigidos verificados manualmente. ✅ Histórico completo funcionando (Task 1.1), ✅ Juros configuráveis OK (Task 1.2), ✅ Juros nos sonhos aplicados (Task 1.3), ✅ Keep-alive ativo (Task 1.4), ✅ Dependências atualizadas (Task 1.5), ✅ Labels corrigidos na visão da criança (Task 1.6). App estável e sem erros. **FASE 1 COMPLETA!** 🎉                                                              |

**Critério de conclusão:** ✅ **FASE 1 CONCLUÍDA** - Todos os bugs corrigidos, app funcionando sem erros, juros calculados corretamente, histórico completo visível, labels corretos. Pronto para Fase 2 (Redesign Visual).

---

### FASE 2 — Redesign Visual Completo

**Objetivo:** Transformar toda a interface com nova identidade visual inspirada nas referências aprovadas.
**Status:** 🔒 Bloqueada — só inicia após Fase 1 completa e aprovada.

#### Paleta de Cores Aprovada

| Uso                            | Cor                     | Hex (sugerido) |
| ------------------------------ | ----------------------- | -------------- |
| Background principal           | Verde escuro            | #0D2818        |
| Background secundário          | Verde médio escuro      | #1A4731        |
| Cards/containers               | Verde com transparência | #1A4731CC      |
| Cor primária (CTAs, destaques) | Amarelo/dourado         | #F5B731        |
| Cor secundária                 | Amarelo claro           | #FFD966        |
| Texto principal                | Branco                  | #FFFFFF        |
| Texto secundário               | Branco com opacidade    | #FFFFFFB3      |
| Sucesso/positivo               | Verde claro             | #22C55E        |
| Erro/negativo                  | Vermelho                | #EF4444        |

#### Conceito Visual

- **Para pais:** Visual profissional, limpo, como um app bancário real (referência ArobixBank)
- **Para crianças:** Elementos lúdicos, animações, mascote porquinho, micro-interações
- **Equilíbrio:** Credibilidade para adultos + engajamento para crianças

| #    | Funcionalidade                  | Status | Notas                                                                                                          |
| ---- | ------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------- |
| 2.1  | Setup do tema centralizado      | 🔒     | Criar arquivo de tema com todas as cores, fontes, espaçamentos. Componentes base (Button, Card, Input, Badge). |
| 2.2  | Tela de Login redesenhada       | 🔒     | Nova paleta, animação do porquinho, visual premium                                                             |
| 2.3  | Dashboard dos pais              | 🔒     | Cards modernos, gráficos com nova paleta, layout profissional                                                  |
| 2.4  | Tela de conta da criança        | 🔒     | Saldo animado, transações com ícones, visual lúdico                                                            |
| 2.5  | Tela de transações/histórico    | 🔒     | Lista com filtros, categorias coloridas, paginação                                                             |
| 2.6  | Tela de configuração de juros   | 🔒     | Slider ou input limpo, preview de rendimento                                                                   |
| 2.7  | Tela de sonhos/metas            | 🔒     | Progress bar animada, ícones de conquista, celebração ao atingir                                               |
| 2.8  | Componentes de navegação        | 🔒     | Bottom nav, header, sidebar (se aplicável)                                                                     |
| 2.9  | Micro-interações e animações    | 🔒     | Transições suaves, feedback visual, celebrações                                                                |
| 2.10 | Testes visuais e responsividade | 🔒     | Testar em mobile e desktop, dark/light consistency                                                             |

---

### FASE 3 — Onboarding Profissional

**Objetivo:** Criar fluxo completo de cadastro e configuração inicial, pensando em comercialização futura.
**Status:** 🔒 Bloqueada — só inicia após Fase 2 completa e aprovada.

#### Fluxo do Onboarding

```
1. Tela de boas-vindas → branding, proposta de valor
2. Criar conta do responsável → Google OAuth ou email/senha
3. Perfil do responsável → nome, relação com criança (pai/mãe/avô/tio/outro)
4. Adicionar segundo responsável? → opcional, convite por email
5. Adicionar filho(a) → nome + data nascimento + avatar + apelido
6. Adicionar mais filhos? → repetir step 5
7. Configuração inicial → taxa de juros, saldo inicial (opcional)
8. Tour/tutorial → mostrar funcionalidades principais
9. Dashboard → app pronto para usar
```

#### Dados do Responsável

- Nome completo
- Email (via OAuth ou manual)
- Relação com a criança (pai/mãe/padrasto/madrasta/avô/avó/tio/tia/outro)
- Foto (opcional, via OAuth)

#### Dados da Criança

- Nome
- Data de nascimento
- Avatar (seleção de opções pré-definidas)
- Apelido (como aparece no app)

#### Configuração da Família

- 1 ou 2 responsáveis por família
- Cada responsável pode gerenciar todos os filhos da família
- Convite do segundo responsável por email

| #   | Funcionalidade                  | Status | Notas                                                                         |
| --- | ------------------------------- | ------ | ----------------------------------------------------------------------------- |
| 3.1 | Schema do banco para onboarding | 🔒     | Tabelas: families, guardians, guardian_invites. Ajustes em children/accounts. |
| 3.2 | Tela de boas-vindas             | 🔒     | Branding, animação, CTA                                                       |
| 3.3 | Signup do responsável           | 🔒     | Google OAuth + email/senha                                                    |
| 3.4 | Perfil do responsável           | 🔒     | Nome, relação, foto                                                           |
| 3.5 | Convite do segundo responsável  | 🔒     | Envio por email, aceitação                                                    |
| 3.6 | Cadastro de filho(a)            | 🔒     | Nome, nascimento, avatar, apelido                                             |
| 3.7 | Configuração inicial            | 🔒     | Taxa de juros, saldo inicial                                                  |
| 3.8 | Tour/tutorial interativo        | 🔒     | Highlights das funcionalidades                                                |
| 3.9 | Testes do fluxo completo        | 🔒     | Testar todos os caminhos do onboarding                                        |

---

### FASE 4 — Melhorias Futuras

**Objetivo:** Features adicionais identificadas durante o uso.
**Status:** 🔒 Bloqueada

| #   | Funcionalidade       | Status | Notas                                          |
| --- | -------------------- | ------ | ---------------------------------------------- |
| 4.1 | Testes automatizados | 🔒     | Coverage mínima para fluxos críticos           |
| 4.2 | Notificações         | 🔒     | Push/email para rendimentos, metas atingidas   |
| 4.3 | Gamificação          | 🔒     | Conquistas, streaks de economia, badges        |
| 4.4 | Multi-idioma         | 🔒     | PT-BR (padrão) + EN                            |
| 4.5 | PWA / App mobile     | 🔒     | Progressive Web App para instalar no celular   |
| 4.6 | Monetização          | 🔒     | Plano premium, famílias adicionais, etc.       |
| 4.7 | Outros bugs/features | 🔒     | Itens identificados durante uso (lista aberta) |

---

## 🏗️ ARQUITETURA

### Estrutura de Pastas Atual

```
MyFirstBA2/
├── CLAUDE.md                ← Instruções para Claude Code
├── PROJECT_PLAN.md          ← Este arquivo (plano detalhado)
├── README.md
├── .claude/
│   ├── settings.local.json  ← Config do Claude Code
│   └── skills/              ← 10 skills automáticas
├── docs/
│   └── archive/             ← Documentação histórica (fases Ago-Nov 2025)
├── src/
│   ├── app/                 ← Rotas (App Router)
│   │   ├── api/             ← API routes (auth, transactions, interest, etc.)
│   │   ├── dashboard/       ← Painel dos pais
│   │   ├── child/           ← Visão da criança
│   │   ├── settings/        ← Configurações
│   │   └── login/           ← Tela de login
│   ├── components/          ← Componentes reutilizáveis
│   ├── lib/                 ← Supabase client, helpers, utils
│   ├── services/            ← Lógica de negócio
│   └── styles/              ← Estilos globais
├── components/              ← Componentes (pasta legacy — avaliar merge)
├── database/                ← Scripts de banco
├── pages/                   ← Pages Router (legacy — avaliar migração)
├── scripts/                 ← Scripts utilitários
├── public/                  ← Assets estáticos
└── supabase/
    └── migrations/          ← SQL migrations
```

### Banco de Dados (Supabase — 21 tabelas)

```
Tabelas conhecidas (a investigar estrutura completa na Fase 1):
- accounts              ← Contas bancárias das crianças
- transactions          ← Histórico de transações
- interest_config       ← Configuração de taxa de juros
- savings_goals         ← Sonhos/metas de economia
- children              ← Perfis das crianças
- users / profiles      ← Usuários (pais/responsáveis)
- [+ outras tabelas a mapear]

⚠️ PRIMEIRO PASSO DA FASE 1: Mapear todas as 21 tabelas,
   seus campos e relacionamentos antes de fazer qualquer alteração.
```

### Fluxos Principais

```
1. Pai abre o app → Verifica sessão (NextAuth) → Login Google ou Dashboard
2. Dashboard → Lista de filhos → Selecionar filho → Ver conta
3. Conta do filho → Saldo + Transações + Sonhos + Rendimentos
4. Pai configura juros → Taxa mensal (%) → Aplicada automaticamente
5. Filho cria sonho → Define valor + prazo → Acompanha progresso
6. Rendimento mensal → Calculado sobre saldo + saldo dos sonhos
```

---

## 🔧 DETALHAMENTO TÉCNICO — FASE 1

### 1.1 Histórico de Transações Completo

**Problema:** Só mostra transações do último mês.
**Solução:**

- Query sem filtro de data (ou com paginação: 50 por página)
- Adicionar filtros na UI: por período (mês/ano), por tipo (depósito, saque, presente, rendimento)
- Scroll infinito ou botão "carregar mais"
- Ordenação: mais recente primeiro (padrão)

### 1.2 Taxa de Juros Configurável ✅ COMPLETO

**Problema:** UI mostra "Taxa Anual" mas aplica como mensal. Teto fixo de 9.9%.

**Solução Implementada:**

- ✅ Renomeada coluna `annual_rate` → `monthly_rate` no banco
- ✅ Interface TypeScript atualizada (`InterestConfig.monthly_rate: number`)
- ✅ Backend atualizado (transactions.ts, interestService.ts)
- ✅ UI atualizada (InterestConfigManager.tsx):
  - Label: "Taxa Mensal (%)" (input direto 0-100%)
  - Slider: 0-20% (pode digitar até 100%)
  - Removido conceito "anual"
- ✅ Constraint atualizado: `CHECK (monthly_rate >= 0 AND monthly_rate <= 100)`
- ✅ Migration 004 executada no Supabase Studio
- ✅ Valores preservados: 9.9 continua sendo 9.9% ao mês

**Arquivos modificados:**

- `src/lib/supabase.ts` (interface)
- `src/lib/services/interestService.ts` (CRUD + validação 0-100%)
- `src/lib/services/transactions.ts` (cálculo de juros)
- `components/InterestConfigManager.tsx` (UI completa)
- `supabase/migrations/004_rename_annual_rate_to_monthly_rate.sql` (migration)

**Scripts criados:**

- `scripts/validate-task-1.2.js` (validação de banco)
- `scripts/validate-code-references.js` (validação de código)
- `scripts/update-interest-rate.js` (correção de taxa para 1%)
- `INSTRUCOES_MIGRATION_1.2.md` (documentação)

**Taxa Padrão Recomendada:**

- ✅ **1.0% ao mês** (taxa educacional realista)
- Taxa anterior de 9.9% ao mês era muito alta para fins educacionais
- Todos os registros foram atualizados para 1.0% em 2026-02-17

### 1.3 Juros nos Sonhos/Metas ✅ COMPLETO

**Problema:** Dinheiro guardado em sonhos não rende.

**Solução Implementada:**

- ✅ Adicionado tipo `'goal_interest'` ao enum `Transaction.type` (supabase.ts)
- ✅ Função `calculateInterest()` estendida para processar goals após calcular juros do saldo
- ✅ Busca todos os goals ativos com `current_amount > 0` da tabela `goals`
- ✅ Aplica regra de 30 dias de carência por goal (baseado em `goal.created_at`)
- ✅ Calcula juros sobre `current_amount` de cada goal usando mesma `monthly_rate`
- ✅ Atualiza `current_amount` do goal com o valor dos juros
- ✅ Cria transação de rastreamento com `type='goal_interest'` e `related_goal_id`
- ✅ Juros do saldo principal não são afetados (cálculo adicional, não substitui)

**Arquivos modificados:**

- `src/lib/supabase.ts` (Transaction.type enum + related_goal_id)
- `src/lib/services/transactions.ts` (calculateInterest + createTransaction)

**Lógica:**
Quando `calculateInterest(childId)` é executado mensalmente:

1. Calcula e aplica juros do saldo principal (comportamento original)
2. Busca goals ativos com dinheiro
3. Para cada goal elegível (30+ dias), calcula e aplica juros separados
4. Registra transação goal_interest para cada goal que rendeu

**Resultado:**

- Criança com goal "Camisa do Real Madrid" (R$ 285.02) agora receberá juros mensais sobre esse valor
- Transparência total: cada goal tem transações de juros rastreáveis

### 1.4 Keep-alive do Supabase

**Problema:** Projeto pausou (free tier pausa após 7 dias sem uso).
**Solução:**

- Opção A: GitHub Actions — cron job que faz `SELECT 1` no banco a cada 5 dias
- Opção B: UptimeRobot — ping no health endpoint do app
- Opção C: Supabase Edge Function com schedule
- Recomendação: GitHub Actions (gratuito, controlado, visível no repo)

---

## 📐 SCHEMA DE BANCO — ALTERAÇÕES PREVISTAS

### Fase 1 — Alterações

```sql
-- 1.2: Remover teto da taxa de juros e mudar label
ALTER TABLE interest_config
  ALTER COLUMN annual_rate TYPE DECIMAL(10,4);
-- Remover constraint de máximo se existir
-- Adicionar coluna monthly_rate se não existir
-- OU renomear annual_rate para monthly_rate

-- 1.3: Registrar rendimentos dos sonhos
-- Verificar se savings_goals tem campo para tracking de juros
-- Pode precisar de tabela savings_goals_interest ou coluna adicional

-- ⚠️ INVESTIGAR PRIMEIRO: Mapear schema completo antes de alterar
```

### Fase 3 — Novas Tabelas (Onboarding)

```sql
-- Tabela de famílias
CREATE TABLE families (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT, -- "Família Fernandes"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de responsáveis (guardians)
CREATE TABLE guardians (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id), -- liga ao NextAuth/Supabase user
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  relationship TEXT NOT NULL, -- 'pai', 'mãe', 'avô', 'avó', 'tio', 'tia', 'outro'
  avatar_url TEXT,
  is_primary BOOLEAN DEFAULT false, -- primeiro responsável cadastrado
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de convites
CREATE TABLE guardian_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES guardians(id),
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'expired'
  token TEXT UNIQUE NOT NULL, -- token único para o link de convite
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- Alterar children para vincular à família
ALTER TABLE children ADD COLUMN family_id UUID REFERENCES families(id);
ALTER TABLE children ADD COLUMN nickname TEXT;
ALTER TABLE children ADD COLUMN avatar_preset TEXT; -- 'astronaut', 'princess', 'dinosaur', etc.

-- RLS para todas as novas tabelas
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_invites ENABLE ROW LEVEL SECURITY;

-- ⚠️ SQL COMPLETO será definido na Fase 3 após investigar schema atual
```

---

## 📝 HISTÓRICO DE MUDANÇAS

| Data       | Fase   | O que mudou                                             | Motivo                                                                     |
| ---------- | ------ | ------------------------------------------------------- | -------------------------------------------------------------------------- |
| 2026-02-17 | Setup  | Projeto existente auditado (138 arquivos, 31K linhas)   | Evolução planejada                                                         |
| 2026-02-17 | Setup  | Supabase restaurado após auto-pause                     | Projeto pausou por inatividade                                             |
| 2026-02-17 | Setup  | Redesign visual aprovado (verde + amarelo + branco)     | Referências: porquinho + ArobixBank                                        |
| 2026-02-17 | Setup  | 5 bugs/features identificados e priorizados             | Bugs → Redesign → Onboarding                                               |
| 2026-02-17 | Setup  | CLAUDE.md e PROJECT_PLAN.md criados                     | Início da evolução estruturada                                             |
| 2026-02-17 | Fase 1 | Task 1.4 completa - workflows GitHub Actions reativados | Keep-alive do Supabase                                                     |
| 2026-02-17 | Fase 1 | Task 1.2 completa - annual_rate → monthly_rate (0-100%) | Correção de bug: taxa de juros                                             |
| 2026-02-17 | Fase 1 | Task 1.5 completa - 14 dependências atualizadas         | Audit e update de dependências                                             |
| 2026-02-17 | Fase 1 | Task 1.3 completa - juros em sonhos/metas implementado  | Goals agora rendem juros mensais                                           |
| 2026-02-17 | Fase 1 | Taxa de juros corrigida: 9.9% → 1.0% ao mês             | Valor educacional realista                                                 |
| 2026-02-17 | Fase 1 | Task 1.6 completa - labels corrigidos + LoanService OK  | Labels "Empréstimo"→"Pedido", LoanService validado como serviço ativo      |
| 2026-02-17 | Fase 1 | Task 1.7 completa - testes e validação OK               | Todos os fluxos testados manualmente e validados - **FASE 1 COMPLETA!** 🎉 |
