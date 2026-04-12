# Decisões Técnicas — MyFirstBA2

> Registro de decisões importantes para evitar que sejam refeitas.
> Detalhamento completo também em CLAUDE.md (seção "Decisões Técnicas Registradas").

## Arquitetura

- family_id é a chave de relacionamento principal (NÃO user_id)
- RLS habilitado em todas as tabelas — writes via supabaseAdmin (service_role)
- Pages Router (legacy) coexiste com App Router — não migrar sem aprovação

## Banco de Dados

- Funções atômicas preferidas para operações de saldo: adjust_child_balance, adjust_goal_amount, adjust_loan_paid
- apply_migration para DDL (não execute_sql) — garante rastreamento de migrations
- Projeto Supabase: mqcfdwyhbtvaclslured (NUNCA tocar em gktvfldykmzhynqthbdn = BWS)

## Autenticação

- NextAuth + Google OAuth; sessão leva ~5s para hidratar em produção
- router.isReady guard obrigatório nas páginas child antes de ler router.query
- Fallback: busca familyId via user_links se session.user não tiver role enriquecido

## Gamificação

- XP calculado no frontend a partir de transações reais (gamification.ts)
- Sem coluna xp no banco — débito técnico a resolver na 3.3b
