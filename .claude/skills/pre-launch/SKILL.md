---
name: pre-launch
description: Checklist de pré-lançamento e preparação para produção. Usar antes de publicar o app, antes de deploy para produção, ou quando o projeto estiver pronto para ir ao ar.
allowed-tools: Bash, Read, Grep, Glob
---

# Pre-Launch — Checklist de Produção

## Quando Usar

- App pronto para publicação
- Deploy para produção/staging
- Entrega de fase final ao cliente

## Gate 1 — Código

### Segurança

- [ ] Secret scan completo (0 resultados) — rodar skill secret-scan
- [ ] Secret scan no histórico Git (0 resultados)
- [ ] .env.local no .gitignore
- [ ] Nenhuma API key hardcoded
- [ ] RLS ativado em TODAS as tabelas do Supabase
- [ ] RLS testado (usuário normal NÃO vê dados de outro)

### Qualidade

- [ ] Code review completo (rodar skill code-review)
- [ ] Zero console.log/print de debug
- [ ] Zero TODO/FIXME pendente
- [ ] Todos os testes passando
- [ ] Build de produção sem warnings

### Git

- [ ] Tudo commitado e pushado
- [ ] Branch develop merged em main
- [ ] Tag de versão criada (ex: v1.0.0)

## Gate 2 — Infraestrutura

### Supabase

- [ ] Projeto de PRODUÇÃO criado (separado do dev!)
- [ ] migrations.sql aplicado no projeto de produção
- [ ] RLS policies replicadas
- [ ] Auth provider configurado (Google OAuth, etc.)
- [ ] Redirect URLs apontando para domínio de produção
- [ ] Storage buckets criados com policies corretas
- [ ] Service Role Key NÃO exposta no frontend

### Variáveis de Ambiente

- [ ] .env.local de PRODUÇÃO com keys do projeto de produção
- [ ] SUPABASE_URL → projeto de produção (não dev!)
- [ ] SUPABASE_ANON_KEY → do projeto de produção
- [ ] Todas as API keys são de produção (não dev/sandbox)

### Deploy

- [ ] Build de produção gerado e testado
- [ ] Domínio configurado (se web)
- [ ] HTTPS funcionando (se web)
- [ ] App assinado (se mobile — keystore/signing config)

## Gate 3 — Experiência do Usuário

### Funcionalidade

- [ ] Fluxo principal testado do início ao fim
- [ ] Login/Logout funciona
- [ ] Dados persistem corretamente
- [ ] Funciona offline/sem conexão (se aplicável)
- [ ] Notificações funcionam (se aplicável)

### UX

- [ ] Loading states em todas as ações
- [ ] Mensagens de erro amigáveis (não erros técnicos)
- [ ] Estados vazios tratados (primeiro acesso, lista vazia)
- [ ] Navegação coerente (back button, deep links)
- [ ] Testado em telas diferentes (mobile pequeno, tablet)

### Performance

- [ ] App abre em <3 segundos
- [ ] Listas com muitos itens usam paginação/lazy loading
- [ ] Imagens otimizadas (não carregando originais de 5MB)
- [ ] Sem memory leaks óbvios

## Gate 4 — Publicação (Mobile)

### Google Play Store

- [ ] App Bundle (.aab) gerado
- [ ] Screenshots preparadas (celular + tablet)
- [ ] Descrição da loja escrita
- [ ] Ícone em alta resolução (512x512)
- [ ] Classificação indicativa definida
- [ ] Política de privacidade URL
- [ ] Conta de desenvolvedor Google Play ativa

### Apple App Store (se aplicável)

- [ ] Archive gerado no Xcode
- [ ] Screenshots para todos os tamanhos de iPhone
- [ ] App Store Connect preenchido
- [ ] App Review guidelines atendidos

## Gate 5 — Pós-Lançamento

### Monitoramento

- [ ] Crash reporting configurado (Firebase Crashlytics ou similar)
- [ ] Analytics básico (page views, eventos principais)
- [ ] Alertas de erro configurados

### Backup

- [ ] Backup do banco de dados configurado (Supabase faz automático)
- [ ] Código fonte em repo privado com acesso controlado
- [ ] .env.local de produção salvo em local seguro (não no repo!)

## Comando: Rodar Todos os Checks Automatizados

```bash
echo "=== PRE-LAUNCH CHECK ==="

echo "--- 1. Secret Scan ---"
grep -rn -i -e "sk-ant-" -e "AIza" -e "supabase.*service.*role" \
  -e "secret.*=.*[A-Za-z0-9]" -e "password.*=.*[A-Za-z0-9]" \
  -e "BEGIN.*PRIVATE.*KEY" -e "ghp_" -e "sk-proj-" \
  --include="*.ts" --include="*.tsx" --include="*.dart" \
  --include="*.js" --include="*.json" \
  --exclude-dir=node_modules --exclude-dir=.dart_tool \
  --exclude=".env.local" . \
  && echo "🛑 SECRETS ENCONTRADOS!" || echo "✅ Nenhum secret"

echo "--- 2. Debug Logs ---"
grep -rn "console\.log\|print(" \
  --include="*.dart" --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules . \
  && echo "⚠️ Debug logs encontrados" || echo "✅ Sem debug logs"

echo "--- 3. TODOs ---"
grep -rn "TODO\|FIXME\|HACK\|XXX" \
  --include="*.dart" --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules . \
  && echo "⚠️ TODOs pendentes" || echo "✅ Sem TODOs"

echo "--- 4. .gitignore ---"
cat .gitignore | grep -q "env.local" \
  && echo "✅ .env.local protegido" || echo "🛑 .env.local NÃO está no .gitignore!"

echo "--- 5. Git Status ---"
git status --short \
  && echo "(acima: arquivos não commitados)" || echo "✅ Tudo commitado"

echo "=== FIM DO CHECK ==="
```
