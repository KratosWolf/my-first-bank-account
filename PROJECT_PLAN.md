# PROJECT_PLAN.md — My First Bank Account (MyFirstBA2)

> Este documento é a fonte única de verdade sobre o que será construído,
> em que ordem, e com que tecnologias. Deve ser mantido atualizado.
> ⚠️ PROJETO EXISTENTE EM EVOLUÇÃO — não é um projeto novo.

---

## 📌 VISÃO GERAL

### O que é este projeto?

App educacional de finanças pessoais para crianças. Os pais criam contas bancárias simuladas para os filhos, com saldo, transações (depósitos, saques, presentes), rendimentos por juros configuráveis, sonhos/metas de economia, e empréstimos educativos com parcelas. O objetivo é ensinar educação financeira na prática, de forma lúdica e engajante. Pensado para futura comercialização.

### Público-alvo

- **Pais/responsáveis** — gerenciam as contas, configuram juros, fazem depósitos/saques, aprovam empréstimos
- **Crianças (filhos)** — visualizam saldo, transações, acompanham sonhos, veem rendimentos, pedem empréstimos

### Resultado esperado

App funcional com bugs corrigidos, visual redesenhado (verde escuro + amarelo/dourado + branco), sistema de empréstimos educativos completo, e fluxo de onboarding profissional para futura comercialização.

### Situação Atual (Fev 2026)

- ✅ Fase 1 completa — bugs corrigidos, app estável
- App funcional com 21 tabelas no Supabase
- Login com Google OAuth via NextAuth
- Dashboard de pais + visão de crianças
- Transações, juros (corrigidos), sonhos/metas com juros
- Código seguro no GitHub (branch main + develop)
- Supabase projeto: mqcfdwyhbtvaclslured

---

## 🛠️ TECH STACK

### Stack Atual

| Camada         | Tecnologia                | Motivo                         |
| -------------- | ------------------------- | ------------------------------ |
| Frontend       | Next.js 14 + React 18     | App Router, SSR, boa DX        |
| Linguagem      | TypeScript                | Type safety                    |
| Styling        | Tailwind CSS 4            | Utility-first, produtivo       |
| Backend/BaaS   | Supabase                  | Auth + DB + Storage integrados |
| Banco de Dados | PostgreSQL via Supabase   | Relacional com RLS             |
| Autenticação   | NextAuth + Google OAuth   | Sem fricção para pais          |
| Hospedagem     | Vercel (deploy na Fase 2) | Melhor para Next.js            |
| Versionamento  | GitHub                    | Padrão                         |

### Repositório

- **URL:** https://github.com/KratosWolf/my-first-bank-account.git
- **Branch principal:** main (produção)
- **Branch desenvolvimento:** develop (Fase 2)

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

### FASE 1 — Correção de Bugs ✅ COMPLETA

**Objetivo:** Corrigir todos os bugs identificados e estabilizar o app antes de qualquer mudança visual ou funcional nova.
**Concluída em:** 2026-02-17

| #   | Funcionalidade                   | Status      |
| --- | -------------------------------- | ----------- |
| 1.0 | Organização do projeto           | ✅ Completo |
| 1.1 | Histórico de transações completo | ✅ Completo |
| 1.2 | Taxa de juros configurável       | ✅ Completo |
| 1.3 | Juros nos sonhos/metas           | ✅ Completo |
| 1.4 | Keep-alive do Supabase           | ✅ Completo |
| 1.5 | Audit de dependências            | ✅ Completo |
| 1.6 | Correção de labels e cleanup     | ✅ Completo |
| 1.7 | Testes e validação               | ✅ Completo |

**Resultado:** App estável, zero erros críticos, juros funcionando em saldo + metas, dependências atualizadas, código no GitHub.

---

### FASE 2 — Redesign Visual + Empréstimos ⬅️ FASE ATUAL

**Objetivo:** Transformar toda a interface com nova identidade visual e adicionar sistema completo de empréstimos educativos.
**Branch:** develop
**Prazo estimado:** 3-4 semanas

#### Paleta de Cores Aprovada

| Uso                            | Cor                     | Hex       |
| ------------------------------ | ----------------------- | --------- |
| Background principal           | Verde escuro            | #0D2818   |
| Background secundário          | Verde médio escuro      | #1A4731   |
| Cards/containers               | Verde com transparência | #1A4731CC |
| Cor primária (CTAs, destaques) | Amarelo/dourado         | #F5B731   |
| Cor secundária                 | Amarelo claro           | #FFD966   |
| Texto principal                | Branco                  | #FFFFFF   |
| Texto secundário               | Branco com opacidade    | #FFFFFFB3 |
| Sucesso/positivo               | Verde claro             | #22C55E   |
| Erro/negativo                  | Vermelho                | #EF4444   |

#### Conceito Visual

- **Para pais:** Visual profissional, limpo, como um app bancário real (referência ArobixBank)
- **Para crianças:** Elementos lúdicos, animações, mascote porquinho, micro-interações
- **Equilíbrio:** Credibilidade para adultos + engajamento para crianças

#### Fluxo de Empréstimos Aprovado

```
1. Criança cria pedido (nome do item + valor + motivo opcional)
2. Pai vê pedidos pendentes no dashboard → aprova ou recusa
3. Se aprovado: pai define número de parcelas
4. Sistema cria empréstimo + parcelas automaticamente
5. Parcelas descontadas da mesada OU pagas manualmente (presente, outro dinheiro)
6. Criança acompanha: empréstimo ativo, parcelas pagas/restantes, próxima parcela
7. Sem juros sobre empréstimos (por enquanto)
```

**Saldo separado:** Empréstimo NÃO deixa saldo negativo. Criança vê saldo normal + "Empréstimo a pagar" separado.

---

#### BLOCO A — Fundação

| #   | Funcionalidade                | Status      | Critérios de Done                                                                                                                                                                                        |
| --- | ----------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 | Setup do tema centralizado    | ✅ Completo | Arquivo de tema criado com todas as cores da paleta aprovada, tokens de espaçamento, tipografia. Tailwind config atualizado com custom colors. Variáveis CSS globais funcionando. App compila sem erros. |
| 2.2 | Componentes base redesenhados | ✅ Completo | Button, Card, Input, Badge, Modal, EmptyState criados com novo design. Cada componente aceita variantes (primary, secondary, danger). Usam o tema centralizado. Testados isoladamente.                   |

---

#### BLOCO B — Telas Existentes Redesenhadas

| #   | Funcionalidade            | Status      | Critérios de Done                                                                                                                                                                        |
| --- | ------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.3 | Tela de Login redesenhada | ✅ Completo | Nova paleta aplicada, visual premium, ilustração/mascote, botão Google OAuth estilizado. Funciona em mobile e desktop. Login continua funcionando (sem quebrar auth).                    |
| 2.4 | Dashboard dos pais        | ✅ Completo | Cards modernos com nova paleta, lista de filhos com avatares, resumo de saldo/metas por filho, acesso rápido a configurações. Layout profissional. Todos os dados carregam corretamente. |
| 2.5 | Tela de conta da criança  | ⬜ Pendente | Saldo destacado com visual atraente, transações com ícones e cores por tipo, seção de metas visível, visual lúdico. Dados reais funcionando.                                             |
| 2.6 | Histórico de transações   | ⬜ Pendente | Filtros redesenhados (período, tipo, categoria) com nova paleta, lista com ícones coloridos, paginação estilizada, contador de resultados. Filtros continuam funcionando.                |
| 2.7 | Configuração de juros     | ⬜ Pendente | Slider limpo com nova paleta, input direto, preview de rendimento ("quanto rende em 1/3/6 meses"), integrado ao dashboard dos pais. Cálculo correto mantido.                             |
| 2.8 | Sonhos/metas              | ⬜ Pendente | Progress bar animada, ícone/imagem do sonho, celebração visual ao atingir meta, card atraente para a criança. Dados reais funcionando.                                                   |
| 2.9 | Navegação e layout        | ⬜ Pendente | Header redesenhado, navegação entre telas consistente, transições suaves, responsividade mobile e desktop validada.                                                                      |

---

#### BLOCO C — Feature de Empréstimos/Pedidos (NOVA)

| #    | Funcionalidade                     | Status      | Critérios de Done                                                                                                                                                                                   |
| ---- | ---------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.10 | Schema do banco para empréstimos   | ⬜ Pendente | Tabelas `loans` e `loan_installments` criadas no Supabase. RLS configurado. Migration documentada. LoanService atualizado para usar novas tabelas. Estado do Banco atualizado neste doc.            |
| 2.11 | Tela de pedido (visão criança)     | ⬜ Pendente | Criança cria pedido com nome do item + valor + motivo (opcional). Lista de pedidos pendentes/aprovados/recusados. Visual lúdico com nova paleta. Pedido salva no banco corretamente.                |
| 2.12 | Aprovação + empréstimo (visão pai) | ⬜ Pendente | Pai vê pedidos pendentes no dashboard. Pode aprovar (define nº de parcelas) ou recusar (com motivo). Ao aprovar, sistema cria loan + installments automaticamente. Valores calculados corretamente. |
| 2.13 | Dashboard de empréstimo ativo      | ⬜ Pendente | Criança vê: empréstimo ativo, valor total, parcelas pagas/restantes, próxima parcela e valor. Pode pagar parcela manualmente. Desconto automático da mesada funciona. Saldo nunca fica negativo.    |

---

#### BLOCO D — Polish e Deploy

| #    | Funcionalidade                  | Status      | Critérios de Done                                                                                                                                                                                  |
| ---- | ------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.14 | Testes, responsividade e deploy | ⬜ Pendente | Todas as telas testadas em mobile e desktop. Transições suaves. Feedback visual em ações. Zero quebras visuais. Merge develop → main. Deploy na Vercel funcionando. App acessível via URL pública. |

---

**Critério de conclusão da Fase 2:** App com visual novo completo, sistema de empréstimos funcional, responsivo, deployed na Vercel, acessível via URL.

**Legenda de status:**

- ⬜ Pendente
- 🔄 Em progresso
- ✅ Completo
- ⏭️ Pulada (com motivo)
- 🔒 Bloqueada

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

| #   | Funcionalidade                  | Status | Critérios de Done                                                             |
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

## 🗄️ ESTADO DO BANCO DE DADOS

> ⚠️ Manter atualizado a cada migration ou mudança no banco.
> Última atualização: 2026-02-17

### Tabelas Ativas (21 tabelas — Supabase projeto: mqcfdwyhbtvaclslured)

| Tabela                        | Descrição                                           | Última alteração |
| ----------------------------- | --------------------------------------------------- | ---------------- |
| accounts                      | Contas bancárias das crianças                       | 2026-02-17       |
| transactions                  | Histórico de transações (inclui goal_interest)      | 2026-02-17       |
| interest_config               | Configuração de taxa de juros (monthly_rate 0-100%) | 2026-02-17       |
| savings_goals / goals         | Sonhos/metas de economia (com juros)                | 2026-02-17       |
| children                      | Perfis das crianças                                 | Original         |
| users / profiles              | Usuários (pais/responsáveis)                        | Original         |
| purchase_requests             | Pedidos de compra (usado pelo LoanService)          | Original         |
| [+ outras tabelas a detalhar] | Mapeamento completo pendente                        | —                |

### Tabelas Planejadas (Fase 2 — Empréstimos)

| Tabela            | Fase               | Dependências                | Descrição                   |
| ----------------- | ------------------ | --------------------------- | --------------------------- |
| loans             | Fase 2 (task 2.10) | children, purchase_requests | Empréstimos ativos          |
| loan_installments | Fase 2 (task 2.10) | loans                       | Parcelas de cada empréstimo |

### Tabelas Planejadas (Fase 3 — Onboarding)

| Tabela           | Fase   | Dependências         | Descrição    |
| ---------------- | ------ | -------------------- | ------------ |
| families         | Fase 3 | —                    | Famílias     |
| guardians        | Fase 3 | families, auth.users | Responsáveis |
| guardian_invites | Fase 3 | families, guardians  | Convites     |

### Schema — Empréstimos (Fase 2, task 2.10)

```sql
-- Tabela de empréstimos ativos
CREATE TABLE loans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  purchase_request_id UUID REFERENCES purchase_requests(id),
  total_amount DECIMAL(10,2) NOT NULL,
  installment_count INTEGER NOT NULL,
  installment_amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active',  -- 'active', 'paid_off', 'cancelled'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de parcelas individuais
CREATE TABLE loan_installments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date TIMESTAMPTZ,
  paid_from TEXT,  -- 'allowance', 'manual', 'gift'
  status TEXT DEFAULT 'pending',  -- 'pending', 'paid', 'overdue'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_installments ENABLE ROW LEVEL SECURITY;

-- Índices
CREATE INDEX idx_loans_child_id ON loans(child_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_installments_loan_id ON loan_installments(loan_id);
CREATE INDEX idx_installments_status ON loan_installments(status);
```

### Schema — Onboarding (Fase 3)

```sql
-- Ver detalhamento completo na seção da Fase 3
-- families, guardians, guardian_invites
-- SQL será definido quando a Fase 3 iniciar
```

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
│   └── skills/              ← 10+ skills automáticas
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
│   ├── services/            ← Lógica de negócio (LoanService, etc.)
│   └── styles/              ← Estilos globais
├── components/              ← Componentes (pasta legacy — avaliar merge na Fase 2)
├── database/                ← Scripts de banco
├── pages/                   ← Pages Router (legacy — avaliar migração)
├── scripts/                 ← Scripts utilitários
├── public/                  ← Assets estáticos
└── supabase/
    └── migrations/          ← SQL migrations
```

### Fluxos Principais

```
1. Pai abre o app → Verifica sessão (NextAuth) → Login Google ou Dashboard
2. Dashboard → Lista de filhos → Selecionar filho → Ver conta
3. Conta do filho → Saldo + Transações + Sonhos + Rendimentos + Empréstimos
4. Pai configura juros → Taxa mensal (%) → Aplicada automaticamente
5. Filho cria sonho → Define valor + prazo → Acompanha progresso
6. Rendimento mensal → Calculado sobre saldo + saldo dos sonhos
7. NOVO: Criança pede empréstimo → Pai aprova/recusa → Parcelas criadas → Desconto na mesada
```

---

## 📐 ESTRATÉGIA DE GIT E DEPLOY

### Git

- **main:** código estável (produção)
- **develop:** desenvolvimento ativo da Fase 2
- Feature branches quando necessário: `feature/nome`
- Merge develop → main ao final da Fase 2

### Deploy

1. **Agora:** Código seguro no GitHub ✅
2. **Final da Fase 2:** Deploy na Vercel (app bonito + funcional)
3. **Final da Fase 3:** Produção "real" (com onboarding, pronto para outros usuários)

---

## 📝 HISTÓRICO DE MUDANÇAS

| Data       | Fase   | O que mudou                                               | Motivo                                                            |
| ---------- | ------ | --------------------------------------------------------- | ----------------------------------------------------------------- |
| 2026-02-17 | Setup  | Projeto existente auditado (138 arquivos, 31K linhas)     | Evolução planejada                                                |
| 2026-02-17 | Setup  | Supabase restaurado após auto-pause                       | Projeto pausou por inatividade                                    |
| 2026-02-17 | Setup  | Redesign visual aprovado (verde + amarelo + branco)       | Referências: porquinho + ArobixBank                               |
| 2026-02-17 | Setup  | 5 bugs/features identificados e priorizados               | Bugs → Redesign → Onboarding                                      |
| 2026-02-17 | Setup  | CLAUDE.md e PROJECT_PLAN.md criados                       | Início da evolução estruturada                                    |
| 2026-02-17 | Fase 1 | Tasks 1.0–1.7 completadas                                 | Fase 1 completa — app estável ✅                                  |
| 2026-02-17 | Fase 1 | Push para GitHub (main + develop)                         | Código seguro no repositório remoto                               |
| 2026-02-17 | Fase 2 | Fase 2 planejada: Redesign + Empréstimos (14 tasks)       | Aprovado: visual novo + feature de empréstimos educativos         |
| 2026-02-17 | Fase 2 | Schema de empréstimos definido (loans + installments)     | Fluxo aprovado: pedido → aprovação → parcelas → pagamento         |
| 2026-02-17 | Fase 2 | Tasks 2.1–2.3 completadas (BLOCO A + primeira do BLOCO B) | Sistema de tema + componentes base + tela de login redesenhada ✅ |
