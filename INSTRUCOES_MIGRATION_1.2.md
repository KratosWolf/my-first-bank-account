# 📋 INSTRUÇÕES: Executar Migration Task 1.2

## ⚠️ IMPORTANTE: Migração Manual Necessária

A migração do banco de dados **NÃO foi executada automaticamente**. Você precisa rodar o SQL manualmente no Supabase Studio.

## 🎯 O que esta migration faz:

- ✅ Renomeia coluna `annual_rate` → `monthly_rate`
- ✅ Remove constraint antigo (máximo 9.9%)
- ✅ Adiciona novo constraint (0% a 100%)
- ✅ Preserva todos os valores existentes (9.9 continua sendo 9.9)

## 📝 Passo a Passo:

### 1. Abrir Supabase Studio SQL Editor

Acesse: https://supabase.com/dashboard/project/mqcfdwyhbtvaclslured/sql

### 2. Copiar SQL do arquivo MIGRATION_TO_RUN.sql

```bash
# Ver o conteúdo do arquivo:
cat MIGRATION_TO_RUN.sql
```

Ou abra o arquivo diretamente: `/Users/tiagofernandes/Desktop/VIBE/MyFirstBA2/MIGRATION_TO_RUN.sql`

### 3. Colar no SQL Editor do Supabase

1. Selecione **todo o conteúdo** de MIGRATION_TO_RUN.sql
2. Cole no SQL Editor
3. Clique em **Run** (ou Ctrl+Enter)

### 4. Verificar resultado

Você deve ver:

```
ALTER TABLE
ALTER TABLE
ALTER TABLE
ALTER TABLE
COMMENT
SELECT (mostrando dados atualizados)
```

Se aparecer algum erro, **NÃO CONTINUE** - reporte o erro.

### 5. Validar a migration

Depois de rodar o SQL, execute o script de validação:

```bash
node scripts/validate-task-1.2.js
```

Você deve ver:

```
✅ TODOS OS TESTES PASSARAM!

Migração aplicada corretamente:
   ✅ Coluna annual_rate → monthly_rate
   ✅ Valores preservados
   ✅ Constraint 0-100% funcionando
```

## 🚨 Se algo der errado:

### Erro: "column annual_rate does not exist"

**Causa**: Migration já foi rodada antes

**Solução**: Ignorar - pular para validação (passo 5)

### Erro: "constraint already exists"

**Causa**: Parte da migration já foi aplicada

**Solução**: Comentar linhas duplicadas no SQL e rodar novamente

### Erro: outro

**Solução**:

1. Tire print do erro
2. Reverta mudanças (se possível)
3. Reporte o problema antes de continuar

## ✅ Após validação bem-sucedida:

Marque a task como completa:

```bash
# Atualizar PROJECT_PLAN.md
# Fazer commit
git add .
git commit -m "fix: renomear annual_rate → monthly_rate (Task 1.2)"
```

## 📊 Status Atual:

- ✅ Código TypeScript/JavaScript atualizado
- ✅ UI (InterestConfigManager) atualizado
- ✅ Scripts de validação criados
- ⏳ **AGUARDANDO**: Execução manual da migration no Supabase Studio
- ⏳ **AGUARDANDO**: Validação do banco com `validate-task-1.2.js`

---

💡 **Dúvidas?** Verifique o arquivo `MIGRATION_TO_RUN.sql` para ver exatamente o SQL que será executado.
