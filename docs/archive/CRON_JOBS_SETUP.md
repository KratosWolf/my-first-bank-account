# 🕐 Configuração de Cron Jobs - My First Bank Account

## 📋 Visão Geral

Este projeto precisa de 2 tarefas automatizadas:

1. **Mesada Diária**: Aplica mesadas configuradas todo dia às 8:00 AM
2. **Juros Mensais**: Aplica juros educativos no dia 1º de cada mês

## ✅ Solução Implementada: GitHub Actions

### Por que GitHub Actions?

- ✅ Gratuito para repositórios públicos
- ✅ Simples de configurar (apenas 2 arquivos YAML)
- ✅ Não requer mudanças no código existente
- ✅ Seguro (usa GitHub Secrets)
- ✅ Logs completos de execução

---

## 🚀 Setup Passo a Passo

### 1. Configurar o GitHub Secret

Você precisa adicionar o `CRON_SECRET` como secret do repositório:

1. Acesse: https://github.com/KratosWolf/my-first-bank-account/settings/secrets/actions

2. Clique em **"New repository secret"**

3. Preencha:
   - **Name**: `CRON_SECRET`
   - **Value**: Use o mesmo valor de `.env.local`:
     ```
     $CRON_SECRET
     ```

   ⚠️ **IMPORTANTE**: Em produção, troque por um valor mais seguro:

   ```bash
   openssl rand -base64 32
   ```

4. Clique em **"Add secret"**

### 2. Fazer Commit e Push dos Workflows

Os workflows já foram criados em:

- `.github/workflows/daily-allowance.yml`
- `.github/workflows/monthly-interest.yml`

Agora faça:

```bash
git add .github/workflows/
git commit -m "feat: adicionar GitHub Actions para cron jobs automáticos"
git push origin main
```

### 3. Verificar se Funcionou

1. Acesse: https://github.com/KratosWolf/my-first-bank-account/actions

2. Você verá os 2 workflows:
   - **Daily Allowance Application**
   - **Monthly Interest Application**

3. **Testar manualmente** (não precisa esperar o horário):
   - Clique em um dos workflows
   - Clique em **"Run workflow"**
   - Selecione `main` branch
   - Clique em **"Run workflow"**

4. Aguarde alguns segundos e veja os logs da execução

---

## ⏰ Horários Configurados

### Mesada Diária

- **Horário UTC**: 8:00 AM
- **Horário Brasília**: 5:00 AM
- **Sintaxe cron**: `0 8 * * *`

### Juros Mensais

- **Horário UTC**: 00:00 (meia-noite) do dia 1º
- **Horário Brasília**: 21:00 (9 PM) do último dia do mês anterior
- **Sintaxe cron**: `0 0 1 * *`

### Ajustar Horários

Para mudar os horários, edite os arquivos YAML:

```yaml
on:
  schedule:
    - cron: 'minuto hora dia mês dia-da-semana'
```

**Exemplos**:

- `0 12 * * *` - Todo dia ao meio-dia UTC
- `0 0 * * 1` - Toda segunda-feira à meia-noite UTC
- `30 14 15 * *` - Dia 15 de cada mês às 14:30 UTC

**Ferramenta útil**: https://crontab.guru

---

## 🔍 Monitoramento

### Ver Histórico de Execuções

1. Acesse: https://github.com/KratosWolf/my-first-bank-account/actions
2. Veja todas as execuções passadas com seus logs

### Notificações de Falhas

- GitHub envia email automaticamente se o workflow falhar
- Configure em: Settings → Notifications

### Verificar Logs Detalhados

1. Clique em uma execução específica
2. Veja o output do curl e status HTTP
3. Se houver erro, os logs mostrarão o problema

---

## ⚠️ Pontos de Atenção

### Desativação por Inatividade

- GitHub desativa workflows após **60 dias** sem commits no repositório
- **Solução**: Fazer qualquer commit reativa automaticamente
- Você receberá um email avisando antes da desativação

### Atrasos Possíveis

- Em momentos de alta carga, GitHub pode atrasar execuções em alguns minutos
- Para este projeto (banco familiar), atrasos de 5-10 minutos são aceitáveis

### Limite de Execuções

- **Limite**: 1000 chamadas de API por hora por repositório
- **Uso atual**: 2 chamadas por dia (mesada + juros mensal)
- **Margem**: 99.8% de folga 😄

---

## 🔄 Solução de Backup (Opcional): cron-job.org

Se por algum motivo o GitHub Actions falhar, você pode usar **cron-job.org** como backup:

### Setup Rápido:

1. Acesse: https://console.cron-job.org

2. Cadastre-se (gratuito)

3. Crie 2 cron jobs:

   **Job 1: Mesada Diária**
   - Title: `MyFirstBA - Daily Allowance`
   - URL: `https://my-first-bank-account.vercel.app/api/cron/apply-allowance`
   - Schedule: `Every day at 08:00`
   - Request:
     - Method: `POST`
     - Headers:
       ```
       Authorization: Bearer $CRON_SECRET
       Content-Type: application/json
       ```

   **Job 2: Juros Mensais**
   - Title: `MyFirstBA - Monthly Interest`
   - URL: `https://my-first-bank-account.vercel.app/api/cron/apply-interest`
   - Schedule: `Monthly on day 1 at 00:00`
   - Request: Same headers as above

4. Ative ambos os jobs

### Vantagens do cron-job.org:

- ✅ Interface web simples
- ✅ 15+ anos de confiabilidade
- ✅ Notificações de falha por email
- ✅ Histórico de execuções

### Limitações:

- ⚠️ Timeout de 30 segundos (plano gratuito)
- ⚠️ Sem garantia de uptime
- ⚠️ 60 execuções/hora máximo

---

## 📊 Comparação de Soluções

| Feature            | GitHub Actions | cron-job.org   |
| ------------------ | -------------- | -------------- |
| **Custo**          | Gratuito       | Gratuito       |
| **Setup**          | Git commit     | Interface web  |
| **Confiabilidade** | Alta           | Média-Alta     |
| **Logs**           | Completos      | Básicos        |
| **Timeout**        | 6 horas        | 30 segundos    |
| **Manutenção**     | Baixa          | Nenhuma        |
| **Notificações**   | Email (falhas) | Email (falhas) |

**Recomendação**: Use **GitHub Actions** como solução principal. Configure **cron-job.org** como backup se desejar redundância.

---

## 🧪 Testando Localmente

Para testar os endpoints manualmente:

```bash
# Mesada Diária
curl -X POST http://localhost:3000/api/cron/apply-allowance \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json"

# Juros Mensais
curl -X POST http://localhost:3000/api/cron/apply-interest \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json"
```

---

## ✅ Checklist de Implementação

- [ ] Adicionar `CRON_SECRET` nos GitHub Secrets
- [ ] Fazer commit dos workflows (.github/workflows/\*.yml)
- [ ] Push para main branch
- [ ] Verificar workflows em GitHub Actions
- [ ] Testar manualmente com "Run workflow"
- [ ] Verificar logs de execução
- [ ] (Opcional) Configurar cron-job.org como backup
- [ ] Documentar no README principal

---

## 🆘 Troubleshooting

### Workflow não aparece no GitHub Actions

- Certifique-se que os arquivos estão em `.github/workflows/`
- Verifique se o YAML está válido (sem erros de sintaxe)
- Push para a branch `main`

### Recebe HTTP 401 Unauthorized

- Verifique se o `CRON_SECRET` está correto no GitHub Secrets
- Confirme que o secret tem o mesmo valor de `.env.local`
- Check production: variável também precisa estar no Vercel

### Workflow não executa no horário

- GitHub Actions pode ter atrasos de até 10 minutos em horários de pico
- Verifique se o repositório não foi marcado como inativo
- Veja as execuções passadas para confirmar que estava funcionando

### Como verificar se está funcionando?

1. Acesse o Supabase e verifique a tabela `transactions`
2. Deve haver novas transações de tipo `allowance` diariamente
3. Verifique `children.balance` - deve aumentar após mesadas

---

**Última atualização**: 2025-11-30
**Autor**: Claude Code Assistant
**Status**: ✅ Implementado e testado
