---
name: dream
description: Higiene de Auto-Memory — consolida e limpa memórias acumuladas entre sessões
---

# Skill: /dream

## Quando usar

- Ao perceber respostas contraditórias do Claude Code
- Ao final de cada fase concluída
- Quando `/memory` mostrar muitos arquivos acumulados
- Periodicamente (a cada 2-3 semanas de uso intenso)

## Comandos disponíveis

- `/dream` → limpa memória do projeto atual
- `/dream user` → limpa memória global (afeta todos os projetos)
- `/dream all` → executa os dois

## Como funciona

O Claude Code acumula Auto-Memory em `.claude/memory/` entre sessões.
Com o tempo, memórias contraditórias ou desatualizadas podem causar
comportamento inconsistente. O /dream consolida e limpa esse acúmulo.

## Checklist antes de rodar

- [ ] Fazer commit de qualquer trabalho em progresso
- [ ] Confirmar qual escopo quer limpar (projeto ou global)
- [ ] Depois do /dream, verificar se o comportamento está correto
