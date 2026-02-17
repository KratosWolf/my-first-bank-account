---
name: session-workflow
description: Workflow de sessão no Claude Code. Usar ao iniciar nova sessão, ao trocar de tarefa, quando o contexto ficar grande, ou quando precisar planejar antes de codar. Inclui Plan Mode, /clear, e subagents.
---

# Session Workflow — Gerenciamento de Sessão no Claude Code

## Ao Iniciar uma Sessão

1. **Ler o `PROJECT_PLAN.md`** — identificar próxima tarefa / fase pendente
2. **Verificar branch** — `git branch` (deve estar em `develop` ou `feature/*`)
3. **Verificar status** — `git status` (não deve ter changes não commitados da sessão anterior)
4. **Identificar a tarefa** — uma funcionalidade por vez, não múltiplas

## Plan Mode (Shift+Tab 2x)

Ativar Plan Mode ANTES de codar quando:

- Tarefa envolve múltiplos arquivos
- Arquitetura nova (nova tela, novo service, novo model)
- Integração com API externa
- Refatoração significativa

No Plan Mode, o Claude Code analisa e planeja sem modificar arquivos.
Só implementar após o plano estar aprovado pelo Tiago.

## Fluxo de Trabalho por Tarefa

```
┌─────────────────────────────────────┐
│  1. PLANEJAR (Plan Mode)            │
│     → Que arquivos criar/editar?    │
│     → Que dependências?             │
│     → Que impacto no banco?         │
├─────────────────────────────────────┤
│  2. IMPLEMENTAR                     │
│     → Criar/editar arquivos         │
│     → Seguir padrões das Skills     │
├─────────────────────────────────────┤
│  3. TESTAR                          │
│     → Compilar                      │
│     → Testar funcionalidade         │
│     → Testar edge cases             │
├─────────────────────────────────────┤
│  4. COMMITAR                        │
│     → Secret scan (skill)           │
│     → git add + commit + push       │
├─────────────────────────────────────┤
│  5. ATUALIZAR                       │
│     → Marcar tarefa como ✅          │
│       no PROJECT_PLAN.md            │
└─────────────────────────────────────┘
```

## Quando Usar `/clear`

O contexto do Claude Code se degrada com conversas longas. Usar `/clear`:

- **Entre tarefas diferentes** (terminou feature A → /clear → começa feature B)
- **Quando o contexto passar de 50%** (aparece indicador no terminal)
- **Após fase de planejamento** (Plan Mode → aprovar plano → /clear → implementar)
- **Quando o Claude começar a alucinar** ou repetir erros

### Antes de `/clear`, SEMPRE:

1. Commitar todo código pendente
2. Anotar onde parou (atualizar PROJECT_PLAN.md)
3. Se houver plano em andamento, salvar em arquivo (plan.md)

### Após `/clear`:

1. O Claude relê o CLAUDE.md automaticamente
2. Dizer: "Continuar do PROJECT_PLAN.md — próxima tarefa é [X]"

## Subagents (Pesquisa em Contexto Separado)

Usar subagents para pesquisa que consumiria muito contexto:

```
Use subagents para investigar como o sistema de auth está configurado
e quais utilitários de Supabase já existem no projeto.
```

O subagent explora o codebase em contexto separado e retorna um resumo, sem poluir o contexto principal.

**Quando usar subagents:**

- Explorar codebase grande pela primeira vez
- Investigar como um módulo funciona
- Buscar padrões existentes antes de implementar algo novo
- Comparar implementações em diferentes partes do projeto

## Gerenciamento de Contexto

### Dicas para manter o contexto limpo

- **Uma tarefa por sessão** — escopo focado
- **Não ler arquivos desnecessários** — o Claude Code lê sob demanda
- **Referenciar ao invés de colar** — "veja o arquivo X" em vez de colar o conteúdo
- **Usar /clear entre fases** — planejamento, implementação, review
- **Commitar antes de /clear** — senão perde o contexto do que foi feito

### Níveis de raciocínio

- Tarefas simples (rename, ajuste de texto) → prompt normal
- Tarefas médias (nova tela, novo endpoint) → Plan Mode
- Tarefas complexas (arquitetura, refatoração) → "ultrathink" / "think step by step"

## Ao Finalizar uma Sessão

1. ✅ Todo código commitado e pushado
2. ✅ PROJECT_PLAN.md atualizado com progresso
3. ✅ Nenhum TODO/FIXME esquecido
4. ✅ Branch correta (develop)
5. ✅ Resumo do que foi feito (para retomar depois)
