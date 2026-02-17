---
name: secret-scan
description: Verificação de secrets e credenciais no código. Usar SEMPRE antes de git add, git commit, ou qualquer operação de versionamento. Também usar quando criar ou editar arquivos que possam conter configurações, URLs ou chaves de API.
allowed-tools: Bash, Read, Grep, Glob
---

# Secret Scan — Proteção contra Vazamento de Credenciais

## Quando Usar

- Antes de QUALQUER `git add` ou `git commit`
- Ao criar/editar arquivos de configuração
- Ao fazer code review
- Antes de push para repositório remoto

## Comando de Scan

```bash
# Scan em arquivos staged para commit
git diff --cached --name-only | xargs grep -rn -i \
  -e "sk-ant-" \
  -e "AIza" \
  -e "supabase.*service.*role.*=.*[A-Za-z0-9]" \
  -e "SUPABASE_SERVICE_ROLE_KEY=.*[A-Za-z0-9]" \
  -e "secret.*key.*=.*[A-Za-z0-9]" \
  -e "password.*=.*[A-Za-z0-9]" \
  -e "BEGIN.*PRIVATE.*KEY" \
  -e "ghp_" \
  -e "gho_" \
  -e "sk-proj-" \
  2>/dev/null
```

Se retornar vazio → ✅ seguro para commitar.
Se encontrar algo → 🛑 PARAR imediatamente.

## Protocolo ao Encontrar Secret

1. **NÃO commitar**
2. Mostrar ao Tiago exatamente o que foi encontrado
3. Mover o valor para `.env.local`
4. Substituir no código por referência à variável de ambiente
5. Rodar scan novamente
6. Só commitar quando scan retornar vazio

## Scan Completo do Projeto (para Gates e Code Review)

```bash
grep -rn -i \
  -e "sk-ant-" -e "AIza" -e "supabase.*service.*role" \
  -e "secret.*=.*[A-Za-z0-9]" -e "password.*=.*[A-Za-z0-9]" \
  -e "BEGIN.*PRIVATE.*KEY" -e "ghp_" -e "sk-proj-" \
  --include="*.ts" --include="*.tsx" --include="*.dart" \
  --include="*.js" --include="*.json" --include="*.py" \
  --include="*.yaml" --include="*.yml" --include="*.env*" \
  --exclude-dir=node_modules --exclude-dir=.dart_tool \
  --exclude=".env.local" \
  .
```

## Scan do Histórico Git (para Gate 2 / Pré-produção)

```bash
git log --all -p | grep -i \
  -e "sk-ant-" -e "AIza" -e "service.role" \
  -e "ghp_" -e "sk-proj-" | head -50
```

Se encontrar secrets no histórico → repositório comprometido → recriar ou usar git filter-branch.

## Verificação do .gitignore

```bash
cat .gitignore | grep -c "env.local" && echo "✅ .env.local protegido" || echo "🛑 ADICIONAR .env.local ao .gitignore!"
```

## Falsos Positivos Comuns

- Nomes de variáveis sem valor (ex: `SUPABASE_SERVICE_ROLE_KEY=` vazio) → OK
- Comentários explicando o que vai no .env → OK
- Arquivo `.env.example` com campos vazios → OK
- Se for falso positivo confirmado, pode prosseguir
