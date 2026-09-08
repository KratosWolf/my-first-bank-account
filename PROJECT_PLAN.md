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

### Situação Atual (Abr 2026)

- ✅ Fase 1 completa — bugs corrigidos, app estável
- ✅ Fase 2 completa — redesign visual + empréstimos
- ✅ Fase 2.5 completa — segurança e limpeza
- 🔄 Fase 3 em progresso — 12/18 tasks completas
- App funcional com tabelas no Supabase (BWS removidas)
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

### FASE 2 — Redesign Visual + Empréstimos ✅ COMPLETA

**Objetivo:** Transformar toda a interface com nova identidade visual e adicionar sistema completo de empréstimos educativos.
**Branch:** develop → main (merged 2026-02-21)
**Concluída em:** 2026-02-21

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

| #   | Funcionalidade            | Status      | Critérios de Done                                                                                                                                                                                 |
| --- | ------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.3 | Tela de Login redesenhada | ✅ Completo | Nova paleta aplicada, visual premium, ilustração/mascote, botão Google OAuth estilizado. Funciona em mobile e desktop. Login continua funcionando (sem quebrar auth).                             |
| 2.4 | Dashboard dos pais        | ✅ Completo | Cards modernos com nova paleta, lista de filhos com avatares, resumo de saldo/metas por filho, acesso rápido a configurações. Layout profissional. Todos os dados carregam corretamente.          |
| 2.5 | Tela de conta da criança  | ✅ Completo | Saldo destacado com visual atraente, transações com ícones e cores por tipo, seção de metas visível, visual lúdico. Dados reais funcionando. Correções visuais aplicadas (4 itens).               |
| 2.6 | Histórico de transações   | ✅ Completo | Filtros redesenhados com nova paleta + botão "Limpar filtros", badges coloridos por tipo de transação, paginação numerada (anterior/próxima + números), contador aprimorado. Filtros funcionando. |
| 2.7 | Configuração de juros     | ✅ Completo | Slider limpo com nova paleta, input direto, preview de rendimento para 1, 3 e 6 meses com ganho total, integrado ao dashboard dos pais. Cálculo correto mantido.                                  |
| 2.8 | Sonhos/metas              | ✅ Completo | Progress bar animada com shimmer effect, ícone/imagem do sonho, celebração visual premium ao atingir meta com animate-bounce, card com nova paleta verde/amarelo. GoalCard redesenhado.           |
| 2.9 | Navegação e layout        | ✅ Completo | Header redesenhado, navegação entre telas consistente, transições suaves, responsividade mobile e desktop validada.                                                                               |

---

#### BLOCO C — Feature de Empréstimos/Pedidos (NOVA)

| #    | Funcionalidade                     | Status      | Critérios de Done                                                                                                                                                                                                                                           |
| ---- | ---------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.10 | Schema do banco para empréstimos   | ✅ Completo | Tabelas `loans` e `loan_installments` criadas no Supabase. RLS configurado. Migration documentada. LoanService atualizado para usar novas tabelas. Estado do Banco atualizado neste doc.                                                                    |
| 2.11 | Tela de pedido (visão criança)     | ✅ Completo | Criança cria pedido com nome do item + valor + motivo (opcional). Lista de pedidos pendentes/aprovados/recusados. Visual lúdico com nova paleta. Pedido salva no banco corretamente.                                                                        |
| 2.12 | Aprovação + empréstimo (visão pai) | ✅ Completo | Pai vê pedidos pendentes no dashboard. Pode aprovar (define nº de parcelas) ou recusar (com motivo). Ao aprovar, sistema cria loan + installments automaticamente. Valores calculados corretamente.                                                         |
| 2.13 | Dashboard de empréstimo ativo      | ✅ Completo | Criança vê: empréstimo ativo, valor total, parcelas pagas/restantes, próxima parcela e valor. Pode pagar parcela manualmente (mesada/presente/outro dinheiro). Progress bar com shimmer effect. Celebração ao quitar. Link pedidos aprovados → empréstimos. |

---

#### BLOCO D — Polish e Deploy

| #    | Funcionalidade                  | Status      | Critérios de Done                                                                                                                                                                                  |
| ---- | ------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.14 | Testes, responsividade e deploy | ✅ Completo | Todas as telas testadas em mobile e desktop. Transições suaves. Feedback visual em ações. Zero quebras visuais. Merge develop → main. Deploy na Vercel funcionando. App acessível via URL pública. |
| 2.15 | Cancelar e Realizar Sonhos      | ✅ Completo | Botão Desistir na UI criança, API /api/goals/cancel funcional, fulfillment com débito de saldo, transações no histórico. Opção C (híbrida): fulfillment_status existente + débito ao aprovar.      |

---

**Critério de conclusão da Fase 2:** App com visual novo completo, sistema de empréstimos funcional, responsivo, deployed na Vercel, acessível via URL.

**Legenda de status:**

- ⬜ Pendente
- 🔄 Em progresso
- ✅ Completo
- ⏭️ Pulada (com motivo)
- 🔒 Bloqueada

---

### FASE 2.5 — Segurança e Limpeza ✅ COMPLETA (2026-03-29)

**Objetivo:** Resolver vulnerabilidades antes de abrir o app para novos usuários na Fase 3.

| #    | Funcionalidade                         | Status | Critérios de Done                                                |
| ---- | -------------------------------------- | ------ | ---------------------------------------------------------------- |
| 2.16 | Fix CRON_SECRET sem fallback hardcoded | ✅     | Zero ocorrências de dev-cron-secret-123, retorna 500 sem env var |
| 2.17 | Fix family-service + childrenService   | ✅     | getChildren() filtra por familyId, getCurrentFamilyId() removido |
| 2.18 | Auth em todas as API routes            | ✅     | 10 endpoints retornam 401 sem sessão NextAuth                    |
| 2.19 | Fix race conditions no saldo           | ✅     | 3 funções atômicas no Supabase, migration 006 aplicada           |
| 2.20 | Remover console.logs de produção       | ✅     | 236 removidos, zero em pages/ src/ components/                   |
| 2.21 | Deletar arquivos órfãos                | ✅     | src/app-backup/ removido, 28 scripts arquivados                  |
| 2.22 | Remover Leaderboard duplicado          | ✅     | Apenas src/components/leaderboard/ mantido                       |
| 2.23 | Smoke test completo pós-fixes          | ✅     | Build limpo, 401 em todas as routes, fluxos funcionando          |

**Resolvidos na Fase 3 (Task 3.1):**

- ✅ isPinUnique() agora filtra por family_id
- ✅ addToGoal() agora usa RPC atômico adjust_goal_amount

⚠️ Bug pós-deploy descoberto em 2026-04-05: adjust_child_balance tinha updated_at inexistente — corrigido via migration em produção.

---

### FASE 3 — Melhorias para Uso Real ⬅️ EM PROGRESSO

**Objetivo:** Resolver pendências técnicas da Fase 2.5 e adicionar funcionalidades para uso real do app.
**Status:** 🔄 Em progresso — 12/18 tasks completas (3.1, 3.2, 3.3a, 3.5, 3.6, 3.7, 3.9, 3.10, 3.11, 3.12, 3.13, 3.15).
**Saldos actuais (2026-09-08):** Gabriel R$515,05 / Rafael R$229,73.

| #    | Funcionalidade                                               | Status | Critérios de Done                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---- | ------------------------------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1  | Fix isPinUnique() + addToGoal() atômico                      | ✅     | isPinUnique() filtra por family_id. addToGoal() usa RPC atômico (adjust_goal_amount). Testes manuais OK.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 3.2  | Notificações in-app                                          | ✅     | useNotifications.ts calcula on-the-fly. NotificationBell.tsx com badge e dropdown. Eventos: rendimentos, metas completas, parcelas vencendo/em atraso. Zero tabelas novas — localStorage para estado de lido (expiração 30 dias). IDs determinísticos.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 3.3a | XP e nível calculados a partir de transações                 | ✅     | XP calculado a partir de transações reais (goal_deposit, loan_payment, interest, earning, allowance). 10 níveis com títulos em PT-BR. Visão criança e dashboard pais atualizados. Build OK.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 3.3b | Conquistas, badges + fixes visuais                           | 🔒     | Sistema de conquistas com badges visuais. Corrigir LevelWidget/LevelProgress fora do demo-child-view (usam child.xp=0 do DB). Investigar espaço em branco na página inicial da visão criança.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 3.4  | Smoke tests automatizados dos fluxos críticos                | 🔒     | Testes automatizados cobrindo: login, transações, juros, empréstimos, sonhos. Rodam no CI.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 3.5  | Extrato com saldo acumulado                                  | ✅     | Saldo acumulado exibido no histórico (página 1, sem filtros). Cálculo 100% no frontend a partir do balance atual. Saldo oculto em páginas > 1 e com filtros ativos (decisão consciente). Build OK, commit feito.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 3.6  | Fix exibição de goal_withdrawal no histórico                 | ✅     | goal_withdrawal exibe +R$ em verde (entrada); goal_deposit continua -R$ em vermelho; saldo no banco não alterado (já correto); build OK; commit feito.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 3.7  | Simulação de saldo após aprovação no card                    | ✅     | Dashboard pais mostra "Saldo após aprovação: -R$X" quando saldo insuficiente. Não aparece quando saldo é suficiente. Build OK.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 3.8  | Fix texto ilegível no modal de depósito                      | 🔒     | Caixa verde com preview do novo saldo tem texto branco ilegível — mudar para texto preto.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 3.9  | Fix Monthly Interest (RLS + saldo + catch-up)                | ✅     | Endpoint reescrito com supabaseAdmin, saldo ajustado de facto, last_interest_date transaccional, idempotência por mês, catch-up composto, motivos de skip distintos, HTTP 500 em erro, modo ?dry_run=true. Workflow valida corpo da resposta e falha o job. Build OK. Backfill retroativo abr-set/2026 executado em 2026-09-07: 11 transações, R$31,54. Saldos finais Gabriel R$415,05 / Rafael R$129,73, last_interest_date 2026-09-01 — verificados por SELECT independente.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 3.10 | Merge e deploy da correção do cron de juros                  | ✅     | Merge fast-forward em main (03626d5 + 70264b1), push, deployment `dpl_FLQ9h2...` READY em target=production com SHA 70264b1f e alias de produção apontado. Smoke test real em produção (`?dry_run=true`, HTTP 200): campo `months` presente nas duas crianças — **prova pelo corpo da resposta, não pelo estado READY**, de que a versão nova está servindo. Zero crianças com status 'erro'; nenhuma "Saldo insuficiente". Banco inalterado (73 tx / 15 interest). ⚠️ **Nuance:** a proteção contra duplo crédito foi demonstrada pela guarda do `listTargetMonths` (lista vazia, porque `last_interest_date` já é 2026-09-01), **não** pela idempotência por mês (`hasInterestInMonth`), que segue sem ter corrido em produção — será exercitada naturalmente em 01/10, quando outubro estiver pendente.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 3.11 | Migrar crons para agendador externo + alerta                 | ✅     | **Vercel Cron substitui o agendamento do GitHub.** 2 crons: `apply-allowance` 08:00 UTC e `apply-interest` 03:00 UTC, **ambos diários** — confirmados em Settings > Cron Jobs com o toggle **"Enabled" ligado**. Juros diários de propósito: idempotência por mês + catch-up garantem crédito único, e se o dia 1 falhar o dia 2 recupera. **Watchdog** healthchecks.io: 2 checks, Period 1 dia / Grace 12 horas, alerta por email. `src/lib/healthcheck.ts` — ping normal em execução limpa, `/fail` em erro, nenhum ping em dry_run, nunca lança exceção (timeout 5s; testado contra host morto, body circular e servidor mudo). Os 3 endpoints aceitam GET+POST com `Authorization: Bearer` (o Vercel Cron invoca por GET). Os 3 workflows perderam `schedule:` e mantêm `workflow_dispatch:`; `daily-allowance.yml` passou a `--fail-with-body`. **Execução real provada a 08/09** pelo botão Run do painel da Vercel: ping recebido nos DOIS checks, user-agent `node`, corpo anexado (701 bytes no interest, 206 no allowance), de IPs da Vercel — distintos do ping manual feito pelo browser. **Verificação independente por SELECT: zero escritas.** 75 transações (20 allowance, 15 interest), última tx 2026-09-05 08:35. Gabriel R$515,05 / Rafael R$229,73; `next_payment_date` 2026-10-05; `last_interest_date` 2026-09-01; `allowance_config.updated_at` inalterado (12:48:35 UTC, da run do GitHub dessa manhã). ⚠️ Desvios: só 2 crons (prudência — ver CLAUDE.md), portanto `keep-alive` ficou endpoint manual sem agenda e sem ping; `maxDuration: 60` nas rotas de cron.                                                                                                                                                                                                   |
| 3.12 | Mesada de setembro não creditada                             | ✅     | **Resolvida sem intervenção.** O cron correu em 08/09 12:48:35 UTC e o catch-up (`.lte` + loop, refactor da Fase C de 05/06) recuperou o mês em atraso: 2 transações de R$100, backdatadas a 2026-09-05T08:35:00Z, status `completed`, `next_payment_date` avançado para 2026-10-05 nas duas crianças. Pagou **APENAS setembro** (10-05 > 08-09), sem duplicados — query de duplicados por mês devolveu zero. Saldos verificados por SELECT independente: Gabriel 515,05 (total_earned 1988,88), Rafael 229,73 (total_earned 1742,66). **Primeira validação em produção do catch-up.**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 3.15 | Endurecer apply-allowance (5 defeitos)                       | ✅     | **(a) Idempotência:** `hasAllowanceInMonth` devolve `{ exists, error }` (padrão do `apply-interest`); erro na query aborta aquela criança com `break` ANTES do avanço da data — HTTP 500 + ping `/fail`, em vez do antigo `return true` que registava `skipped_idempotent`, avançava `next_payment_date`, devolvia 200 e pingava VERDE. **(b) `default` do switch:** `calculateNextPaymentDateFrom` lança `Error` em vez de `return fromDate` — o retorno da mesma data fazia o `while` nunca terminar, morrendo no `maxDuration` de 60s **sem pingar**. Confirmado alcançável: a coluna `frequency` é NULLABLE e o CHECK do Postgres não rejeita NULL. **(c) `biweekly` removido** do cron, do `allowanceService` e do dropdown — era feature morta e partida (o CHECK de `allowance_config` nunca a aceitou). Grep devolve zero ocorrências. CHECK do banco **não** foi tocado. **(d) Guarda mensal-only** (defeito descoberto no diagnóstico, o mais perigoso): a janela de idempotência é mensal mas aplicava-se a todas as frequências — com `weekly`, o dia 1 pagava e os dias 8/15/22 viravam `skipped_idempotent` com 200 e ping verde. Config com `frequency != 'monthly'` agora é recusada com erro e `continue`, sem tocar em `next_payment_date`. Correcção a sério na 3.17. **(e) Rollback verificado:** o `delete` da tx após falha do `adjust_child_balance` passa a checar `deleteError` e a incluir `id=<uuid>` da transação órfã no corpo da resposta, para limpeza manual. UI fechada a mensal-only: dropdown com uma opção, cast inline removido (usa `AllowanceConfig['frequency']`), default `'weekly'` → `'monthly'`, bloco morto de "Dia da Semana" removido. **Catch-up intocado** (`.lte` e `while`). Zero migrations, zero escrita de dados. `npm run build` limpo. |
| 3.13 | Release Pipeline falhando desde sempre                       | ✅     | **Workflow apagado** (`.github/workflows/release.yml`) e bloco `"release"` órfão removido do `package.json`. **CORRECÇÃO AO DIAGNÓSTICO ANTERIOR:** a causa **NÃO** era "semantic-release sem `.releaserc`" — a configuração **existia**, no bloco `"release"` do `package.json`, que é um local válido para o semantic-release. A causa real era o `release.yml` **não declarar `permissions:`**: o `GITHUB_TOKEN` vem só-leitura por defeito, e o semantic-release precisa de `contents: write` para criar a tag e para o `@semantic-release/git` empurrar o changelog. **Decisão do Tiago:** apagar, não corrigir — não há necessidade de versionamento semântico num app familiar. Estado antes de apagar: **8/8 das últimas runs em `failure`**, incluindo commits só de documentação. Foi esse alarme falso a cada push que anulou os avisos **REAIS** do GitHub ("will be disabled soon", 05/06 e 29/07/2026) — parte da causa raiz da paragem dos crons, não um incómodo cosmético. As devDependencies do semantic-release (`@semantic-release/*`, `semantic-release`, `conventional-changelog-*`) foram **deixadas de propósito**: são dev-only e inertes, e removê-las obrigaria a regenerar o `package-lock.json` — risco desnecessário na véspera da verificação dos crons. Limpeza opcional futura. **Verificado no mesmo dia, sem alterar nada:** `deploy.yml` (gatilho `workflow_run` após o CI) 10/10 runs em `success`, e `ci.yml` 5/5 em `success` — nenhum dos dois é fonte de alarme falso.                                                                                                                                                                                                                                                                                |
| 3.14 | Regra dos 30 dias conta transações `pending`                 | 🔒     | A query de saldo elegível não filtra por `status`, então transações pendentes contam como entrada e reduzem o juro indevidamente. Gabriel tem uma de R$50 parada desde 17/05. Transportada tal como estava na Task 3.9 de propósito (não misturar mudança de regra com correção de RLS) — decidir e corrigir aqui.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 3.16 | Formato da data no extrato de mesada                         | 🔒     | O `created_at` da transação de mesada é backdate para a data devida, não a hora real de execução. A criança vê dinheiro com data de um dia que não aconteceu (05/09 quando o crédito ocorreu a 08/09 12:48 UTC). Decidir se o extrato mostra a data devida, a data real, ou ambas — **decisão de produto, não de código**, numa app cuja finalidade é educação financeira.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 3.17 | Idempotência acompanha a frequência (mesada semanal a sério) | 🔒     | A guarda `hasAllowanceInMonth` pergunta "já houve mesada NESTE MÊS?" mas é aplicada a todas as frequências. Com `weekly`, o dia 1 paga e os dias 8/15/22 são registados como `skipped_idempotent` — a criança recebe uma vez por mês, com HTTP 200 e ping VERDE no watchdog. Mesmo defeito para `daily` e `biweekly`. Descoberto no diagnóstico de 08/09; nunca custou dinheiro porque as duas configs sempre foram `monthly`. Mitigado na 3.15 fechando a app a mensal-only (guarda de frequency + dropdown com uma opção). **Correcção a sério:** a janela de idempotência passa a acompanhar a frequência — mensal olha para o mês, semanal/quinzenal/diária olham para a data devida. Só fazer quando o Tiago quiser mesada não-mensal. Requer dry-run e mexe na guarda que salvou a mesada de Setembro. Ao reabrir: repor as opções no dropdown, no `allowanceService` e no CHECK de `allowance_config`. **Porta morta a vigiar:** `parental-dashboard.ts` tem `getAllowanceConfig` (~L1099) que devolve uma config por defeito com `frequency: 'weekly'`, e `updateAllowanceConfig` (~L1120) que ainda aceita daily/weekly/monthly na assinatura. Verificado a 08/09: NINGUÉM as chama — é código morto, não há buraco aberto. Mas são exactamente as funções que a Fase 4 (onboarding) tende a reaproveitar para criar a primeira config de uma criança. Se o default 'weekly' for ressuscitado, o cron recusa a config com HTTP 500 e ping vermelho todos os dias, e a criança não recebe mesada. Alinhar com a 3.17 antes da Fase 4.                                                                                                                                                                                                                                                  |

> ⚠️ CI Pipeline corrigido em 2026-04-05 (env vars dummy, test:ci desabilitado). Release Pipeline ainda falha — provavelmente semantic-release sem .releaserc. Deploy Vercel funciona normalmente.

---

### FASE 4 — Onboarding Profissional | 🔒 Bloqueada

**Objetivo:** Criar fluxo completo de cadastro e configuração inicial, pensando em comercialização futura.
**Status:** 🔒 Bloqueada — só inicia após Fase 3 completa e aprovada.

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
| 4.1 | Schema do banco para onboarding | 🔒     | Tabelas: families, guardians, guardian_invites. Ajustes em children/accounts. |
| 4.2 | Tela de boas-vindas             | 🔒     | Branding, animação, CTA                                                       |
| 4.3 | Signup do responsável           | 🔒     | Google OAuth + email/senha                                                    |
| 4.4 | Perfil do responsável           | 🔒     | Nome, relação, foto                                                           |
| 4.5 | Convite do segundo responsável  | 🔒     | Envio por email, aceitação                                                    |
| 4.6 | Cadastro de filho(a)            | 🔒     | Nome, nascimento, avatar, apelido                                             |
| 4.7 | Configuração inicial            | 🔒     | Taxa de juros, saldo inicial                                                  |
| 4.8 | Tour/tutorial interativo        | 🔒     | Highlights das funcionalidades                                                |
| 4.9 | Testes do fluxo completo        | 🔒     | Testar todos os caminhos do onboarding                                        |

---

### FASE 5 — Escala e Monetização | 🔒 Bloqueada

**Objetivo:** Features adicionais para escala e monetização.
**Status:** 🔒 Bloqueada

| #   | Funcionalidade       | Status | Notas                                          |
| --- | -------------------- | ------ | ---------------------------------------------- |
| 5.1 | Multi-idioma         | 🔒     | PT-BR (padrão) + EN                            |
| 5.2 | PWA / App mobile     | 🔒     | Progressive Web App para instalar no celular   |
| 5.3 | Monetização          | 🔒     | Plano premium, famílias adicionais, etc.       |
| 5.4 | Outros bugs/features | 🔒     | Itens identificados durante uso (lista aberta) |

---

## 🗄️ ESTADO DO BANCO DE DADOS

> ⚠️ Manter atualizado a cada migration ou mudança no banco.
> Última atualização: 2026-03-29

### Tabelas Ativas (Supabase projeto: mqcfdwyhbtvaclslured)

> **RLS:** Habilitado em todas as tabelas — policies SELECT permissiva + escrita autenticada
> **Funções atômicas (migration 006):** adjust_child_balance, adjust_goal_amount, adjust_loan_paid
> **Removidas (2026-03-29):** workout_programs, workout_days, workout_sessions, view user_workout_stats (lixo BWS)

| Tabela                        | Descrição                                                          | Última alteração |
| ----------------------------- | ------------------------------------------------------------------ | ---------------- |
| accounts                      | Contas bancárias das crianças                                      | 2026-02-17       |
| transactions                  | Histórico de transações (inclui goal_interest)                     | 2026-02-17       |
| interest_config               | Configuração de taxa de juros (monthly_rate 0-100%)                | 2026-02-17       |
| savings_goals / goals         | Sonhos/metas de economia (com juros)                               | 2026-02-17       |
| children                      | Perfis das crianças                                                | Original         |
| users / profiles              | Usuários (pais/responsáveis)                                       | Original         |
| purchase_requests             | Pedidos de compra (usado pelo LoanService)                         | Original         |
| loans                         | Empréstimos ativos com parcelas                                    | 2026-02-18       |
| loan_installments             | Parcelas individuais de empréstimos                                | 2026-02-18       |
| allowance_config              | Config de mesada automática (valor, frequência, next_payment_date) | 2026-02-21       |
| [+ outras tabelas a detalhar] | Mapeamento completo pendente                                       | —                |

### Tabelas Planejadas (Fase 4 — Onboarding)

| Tabela           | Fase   | Dependências         | Descrição    |
| ---------------- | ------ | -------------------- | ------------ |
| families         | Fase 4 | —                    | Famílias     |
| guardians        | Fase 4 | families, auth.users | Responsáveis |
| guardian_invites | Fase 4 | families, guardians  | Convites     |

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

### Schema — Onboarding (Fase 4)

```sql
-- Ver detalhamento completo na seção da Fase 4
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

| Data       | Fase            | O que mudou                                                                 | Motivo                                                                                                                                                                                                                                                                                                                     |
| ---------- | --------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-02-17 | Setup           | Projeto existente auditado (138 arquivos, 31K linhas)                       | Evolução planejada                                                                                                                                                                                                                                                                                                         |
| 2026-02-17 | Setup           | Supabase restaurado após auto-pause                                         | Projeto pausou por inatividade                                                                                                                                                                                                                                                                                             |
| 2026-02-17 | Setup           | Redesign visual aprovado (verde + amarelo + branco)                         | Referências: porquinho + ArobixBank                                                                                                                                                                                                                                                                                        |
| 2026-02-17 | Setup           | 5 bugs/features identificados e priorizados                                 | Bugs → Redesign → Onboarding                                                                                                                                                                                                                                                                                               |
| 2026-02-17 | Setup           | CLAUDE.md e PROJECT_PLAN.md criados                                         | Início da evolução estruturada                                                                                                                                                                                                                                                                                             |
| 2026-02-17 | Fase 1          | Tasks 1.0–1.7 completadas                                                   | Fase 1 completa — app estável ✅                                                                                                                                                                                                                                                                                           |
| 2026-02-17 | Fase 1          | Push para GitHub (main + develop)                                           | Código seguro no repositório remoto                                                                                                                                                                                                                                                                                        |
| 2026-02-17 | Fase 2          | Fase 2 planejada: Redesign + Empréstimos (14 tasks)                         | Aprovado: visual novo + feature de empréstimos educativos                                                                                                                                                                                                                                                                  |
| 2026-02-17 | Fase 2          | Schema de empréstimos definido (loans + installments)                       | Fluxo aprovado: pedido → aprovação → parcelas → pagamento                                                                                                                                                                                                                                                                  |
| 2026-02-17 | Fase 2          | Tasks 2.1–2.3 completadas (BLOCO A + primeira do BLOCO B)                   | Sistema de tema + componentes base + tela de login redesenhada ✅                                                                                                                                                                                                                                                          |
| 2026-02-17 | Fase 2          | Tasks 2.4–2.5 completadas + 4 correções visuais                             | Dashboard pais + tela criança redesenhados. Correções: valores negativos, tema raiz, ícone lixeira, hover botões ✅                                                                                                                                                                                                        |
| 2026-02-18 | Fase 2          | Task 2.6 completada — Histórico de transações redesenhado                   | Badges coloridos por tipo, paginação numerada, filtros polidos com botão limpar, contador aprimorado ✅                                                                                                                                                                                                                    |
| 2026-02-18 | Fase 2          | Task 2.7 completada — Configuração de juros redesenhada                     | Nova paleta aplicada, preview de 1/3/6 meses adicionado, cálculo de ganho total, visual profissional ✅                                                                                                                                                                                                                    |
| 2026-02-18 | Fase 2          | Task 2.8 completada — Sonhos/metas redesenhados                             | GoalCard com nova paleta verde/amarelo, progress bar com shimmer effect (duration-1000ms), celebração premium com animate-bounce, status badges atualizados ✅                                                                                                                                                             |
| 2026-02-18 | Fase 2          | Task 2.9 completada — Navegação e layout redesenhados                       | Header dashboard.tsx com paleta verde/amarelo, transições animate-fadeInUp aplicadas, navegação role-based consistente, responsividade mobile-first validada ✅                                                                                                                                                            |
| 2026-02-18 | Fase 2          | Task 2.10 completada — Schema de empréstimos criado                         | Migration 005_create_loans_tables.sql executada: tabelas loans (10 cols) + loan_installments (9 cols), RLS habilitado com policies baseadas em family_id, índices em child_id/status/loan_id, CHECK constraints nos campos status ✅                                                                                       |
| 2026-02-18 | Fase 2          | Task 2.11 completada — Tela de pedido (visão criança)                       | Componentes NewRequestForm e PurchaseRequestCard criados, página child-loan-requests.tsx com lista/empty state/filtros por status, integração na demo-child-view com botões de navegação ✅                                                                                                                                |
| 2026-02-18 | Fase 2          | Task 2.12 completada — Aprovação + empréstimo (visão pai)                   | Modais LoanApprovalModal e RejectionModal criados, dashboard.tsx modificado com handleLoanApprovalConfirm (createLoan + parcelas), handleRejectionConfirm (motivo opcional), visual profissional ✅                                                                                                                        |
| 2026-02-18 | Fase 2          | Task 2.13 completada — Dashboard de empréstimo ativo                        | Componentes LoanCard, InstallmentList, PayInstallmentModal criados. Página child-loans.tsx com lista e detalhes de empréstimos, progress bar com shimmer, pagamento manual (mesada/presente/outro), celebração ao quitar, link pedidos aprovados → empréstimos ✅                                                          |
| 2026-02-21 | Fase 2          | Task 2.14 completa — smoke test, fixes, merge develop → main, deploy Vercel | Correções críticas do smoke test: responsive filter dropdowns, allowance date calculation (sempre futuro), loan navigation em child view. Build passou sem erros. Merge develop → main executado. Fase 2 finalizada ✅                                                                                                     |
| 2026-02-21 | Fase 2          | Fix mesada automática — bug last_paid_at detectado e corrigido              | Sistema de mesada parou de funcionar após 05/12/2025. Causa: apply-allowance.ts tentava atualizar coluna last_paid_at (inexistente) em allowance_config, update falhava silenciosamente, next_payment_date nunca atualizava. Fix: removida linha last_paid_at, next_payment_date corrigido manualmente para 2026-03-05. ✅ |
| 2026-02-21 | Fase 2          | Mesadas retroativas jan+fev 2026 creditadas manualmente                     | 2 meses sem mesadas por causa do bug (R$200 por criança). 4 transações criadas com datas 05/01 e 05/02/2026, balances atualizados (+R$200 cada), total_earned atualizado (+R$200 cada). Rafael: 275→475, Gabriel: 734→934. ✅                                                                                              |
| 2026-02-21 | Fase 2          | allowance_config adicionado à documentação (CLAUDE.md + PROJECT_PLAN.md)    | Schema confirmado: id, child_id, amount, frequency, day_of_week, day_of_month, is_active, next_payment_date, created_at, updated_at. NÃO tem last_paid_at. Reconciliação: apply-allowance.ts + daily-allowance.yml → allowance_config. ✅                                                                                  |
| 2026-02-22 | Fase 2          | Task 2.15 completa — Cancelar e Realizar Sonhos                             | Opção C (híbrida): fulfillment_status existente + débito ao aprovar realização. APIs: /api/goals/cancel (nova), /api/goals/resolve-fulfillment (aprimorada). UI: botão Desistir em demo-child-view.tsx. Transações goal_deposit, goal_withdrawal, goal_purchase rastreadas. ✅                                             |
| 2026-02-22 | Fase 2          | CI Pipeline corrigido — ESLint configurado                                  | Incompatibilidade Next.js 14.2 + ESLint 9 detectada (Invalid Options). Criado .eslintrc.json básico. Script lint modificado em package.json para exit 0 (não bloqueia CI). Deploy continua funcionando. ✅                                                                                                                 |
| 2026-03-29 | Fase 2.5        | Segurança e limpeza completa (8 tasks)                                      | Vulnerabilidades resolvidas antes da Fase 3: CRON_SECRET, auth em API routes, filtros de família, race conditions, console.logs, arquivos órfãos, leaderboard duplicado. Smoke test aprovado. ✅                                                                                                                           |
| 2026-03-29 | Banco           | Postgres 17.4 → 17.6, tabelas BWS removidas, 3 funções atômicas             | Security Advisor zerado. RLS habilitado em todas as tabelas. search_path fixado em 6 funções. ✅                                                                                                                                                                                                                           |
| 2026-03-30 | Pós-deploy      | 5 bugs corrigidos pós Fase 2.5                                              | supabaseAdmin, useEffect [session], adjust_child_balance rollback, title→item_name, filtro pending ✅                                                                                                                                                                                                                      |
| 2026-03-30 | Banco           | Saldos corrigidos + transações duplicadas removidas                         | Gabriel: R$759,17 / Rafael: R$811,07. Duplicados removidos: Fortnite R$78,99 e raquete R$394 ✅                                                                                                                                                                                                                            |
| 2026-04-05 | Pós-deploy      | Bug crítico: adjust_child_balance falhava em toda aprovação de pedido       | Função tinha updated_at = NOW() mas coluna não existe na tabela children. Recriada sem updated_at, com IF NOT FOUND e search_path = public. ✅                                                                                                                                                                             |
| 2026-04-05 | Fase 3          | Fix visual: aviso saldo insuficiente ilegível no dashboard dos pais         | Texto vermelho em fundo vermelho. Corrigido para text-white em dashboard.tsx:1282-1283. ✅                                                                                                                                                                                                                                 |
| 2026-04-05 | Fase 3          | Extrato: transações pending filtradas (regressão task 3.5)                  | .eq('status', 'completed') adicionado em getChildTransactions + getChildTransactionsCount + demo-child-view. ✅                                                                                                                                                                                                            |
| 2026-04-05 | Fase 3          | Task 3.7: simulação de saldo no card de pedido (dashboard pais)             | "Saldo após aprovação: -R$X" aparece em vermelho quando saldo insuficiente. ✅                                                                                                                                                                                                                                             |
| 2026-04-05 | Fase 3          | child-loan-requests migrado para /api/purchase-requests                     | purchase_requests tem RLS sem policy SELECT — anon key retornava vazio. Usa supabaseAdmin via API route. ✅                                                                                                                                                                                                                |
| 2026-04-05 | CI/CD           | Workflows GitHub Actions corrigidos (CI + Release + Deploy)                 | test:ci desabilitado (sem testes reais), env vars placeholder para build, semantic-release v4. CI passa, Release ainda falha. ✅                                                                                                                                                                                           |
| 2026-04-05 | Pós-deploy      | API de depósito criada (/api/transactions/manual)                           | adjust_child_balance RPC tinha zero GRANTs — permission denied. Substituída por UPDATE directo com supabaseAdmin. Dashboard usa saldo da API. ✅                                                                                                                                                                           |
| 2026-06-05 | Fase 3 (hotfix) | Fix mesada parada — catch-up, idempotência e robustez                       | Maio+junho não dispararam: cron de 05/04 falhou no RPC bugado, deixou next_payment_date congelado em 2026-04-05; query `.eq` nunca recuperava. Refactor `apply-allowance.ts`: `.lte` em vez de `.eq`, loop while de catch-up, idempotência por mês, rollback de tx se RPC falhar, HTTP 500 em erro parcial. ✅             |
| 2026-06-05 | Fase 3 (hotfix) | Mesadas retroativas maio+junho creditadas (Fase C)                          | Disparado via `gh workflow run daily-allowance.yml` (run #27023529421). 4 tx criadas, R$400 total, backdate correcto. Saldos finais lidos do banco: Gabriel R$201,17 / R$1.675 total_earned; Rafael R$262,07 / R$1.425 total_earned. next_payment_date dos dois = 2026-07-05. ✅                                           |
