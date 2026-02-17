# 📦 Audit de Dependências - 2026-02-17

## 🎯 Objetivo

Atualizar apenas dependências **críticas** (segurança + funcionalidade) sem introduzir breaking changes.

---

## 📊 Análise de 28 Dependências Desatualizadas

### 🔴 CRÍTICAS (DEVEM ser atualizadas - Segurança/Bug fixes)

| Pacote                    | Atual   | → Wanted  | Tipo  | Motivo                                    |
| ------------------------- | ------- | --------- | ----- | ----------------------------------------- |
| **@supabase/supabase-js** | 2.86.0  | → 2.96.0  | Patch | Bug fixes e melhorias do cliente Supabase |
| **dotenv**                | 17.2.3  | → 17.3.1  | Patch | Possíveis bug fixes                       |
| **typescript**            | 5.9.2   | → 5.9.3   | Patch | Bug fixes do compilador                   |
| **next**                  | 14.2.32 | → 14.2.35 | Patch | Security fixes (CVE patches)              |
| **tailwindcss**           | 4.1.12  | → 4.1.18  | Patch | Bug fixes CSS                             |
| **@tailwindcss/postcss**  | 4.1.12  | → 4.1.18  | Patch | Acompanha tailwindcss                     |

**Total: 6 pacotes críticos**

---

### 🟡 IMPORTANTES (Recomendado atualizar - Minor/Patch safe)

| Pacote                        | Atual    | → Wanted   | Tipo  | Motivo                           |
| ----------------------------- | -------- | ---------- | ----- | -------------------------------- |
| **playwright**                | 1.55.0   | → 1.58.2   | Minor | Melhorias de browser automation  |
| **prettier**                  | 3.7.3    | → 3.8.1    | Minor | Melhorias de formatação          |
| **@types/react**              | 19.1.11  | → 19.2.14  | Minor | Type definitions atualizadas     |
| **@types/react-dom**          | 19.1.7   | → 19.2.3   | Minor | Type definitions atualizadas     |
| **@types/node**               | 20.19.11 | → 20.19.33 | Patch | Type definitions (manter em v20) |
| **tailwind-merge**            | 3.3.1    | → 3.4.1    | Minor | Utility para merge de classes    |
| **@testing-library/jest-dom** | 6.8.0    | → 6.9.1    | Minor | Testing utilities                |
| **@eslint/eslintrc**          | 3.3.1    | → 3.3.3    | Patch | ESLint config parser             |

**Total: 8 pacotes importantes**

---

### ⚠️ ATENÇÃO - Major Version (NÃO atualizar agora)

| Pacote                     | Atual   | Latest  | Motivo para NÃO atualizar                          |
| -------------------------- | ------- | ------- | -------------------------------------------------- |
| **react**                  | 18.3.1  | 19.2.4  | 🚨 Major version - breaking changes significativos |
| **react-dom**              | 18.3.1  | 19.2.4  | 🚨 Acompanha React - muito arriscado               |
| **next**                   | 14.2.32 | 16.1.6  | 🚨 Pular 2 major versions (14→16) é perigoso       |
| **eslint**                 | 9.34.0  | 10.0.0  | ⚠️ Major com breaking changes                      |
| **eslint-config-next**     | 15.4.5  | 16.1.6  | ⚠️ Acompanha Next.js version                       |
| **jest**                   | 29.7.0  | 30.2.0  | ⚠️ Breaking changes em test runners                |
| **husky**                  | 8.0.3   | 9.1.7   | ⚠️ Mudanças na API de hooks                        |
| **semantic-release**       | 22.0.12 | 24.2.9  | ⚠️ Breaking changes release flow                   |
| **@types/node**            | 20.x    | 25.2.3  | ⚠️ Manter em v20 (Node 20 LTS)                     |
| **@testing-library/react** | 15.0.7  | 16.3.2  | ⚠️ Breaking changes em React 19                    |
| **lint-staged**            | 15.5.2  | 16.2.7  | ⚠️ Breaking changes config                         |
| **vercel**                 | 44.7.3  | 50.18.1 | ⚠️ CLI breaking changes                            |

**Total: 12 pacotes com breaking changes**

---

### ⏭️ SKIP - Opcionais (Deixar para depois)

| Pacote                                     | Atual   | Latest | Motivo         |
| ------------------------------------------ | ------- | ------ | -------------- |
| @semantic-release/npm                      | 10.0.6  | 12.0.2 | Não crítico    |
| conventional-changelog-conventionalcommits | 6.1.0   | 9.1.0  | Não crítico    |
| @types/jest                                | 29.5.14 | 30.0.0 | Acompanha jest |
| jest-environment-jsdom                     | 29.7.0  | 30.2.0 | Acompanha jest |

**Total: 4 pacotes opcionais**

---

## 🎯 PLANO DE ATUALIZAÇÃO RECOMENDADO

### Fase 1: CRÍTICAS (Agora - Segurança)

```bash
npm install @supabase/supabase-js@2.96.0
npm install dotenv@17.3.1
npm install typescript@5.9.3
npm install next@14.2.35
npm install tailwindcss@4.1.18 @tailwindcss/postcss@4.1.18
```

### Fase 2: IMPORTANTES (Agora - Melhorias)

```bash
npm install playwright@1.58.2
npm install prettier@3.8.1
npm install @types/react@19.2.14 @types/react-dom@19.2.3
npm install @types/node@20.19.33
npm install tailwind-merge@3.4.1
npm install @testing-library/jest-dom@6.9.1
npm install @eslint/eslintrc@3.3.3
```

### Fase 3: MAJOR VERSIONS (Futura - Planejamento necessário)

**NÃO FAZER AGORA** - Requer:

- Testing extensivo
- Análise de breaking changes
- Possivelmente refactoring de código

Deixar para **Fase 4** do projeto (Melhorias Futuras).

---

## ✅ Resumo da Estratégia

| Categoria           | Quantidade | Ação                      |
| ------------------- | ---------- | ------------------------- |
| 🔴 Críticas         | 6          | ✅ Atualizar agora        |
| 🟡 Importantes      | 8          | ✅ Atualizar agora        |
| ⚠️ Breaking Changes | 12         | ❌ NÃO atualizar (Fase 4) |
| ⏭️ Opcionais        | 4          | ⏸️ Skip por enquanto      |

**Total de atualizações seguras: 14 pacotes**

---

## 🛡️ Validação Pós-Atualização

Após atualizar, executar:

```bash
# 1. Verificar que instalou corretamente
npm list --depth=0

# 2. Rodar build
npm run build

# 3. Rodar testes (se houver)
npm test

# 4. Verificar tipos TypeScript
npx tsc --noEmit

# 5. Testar localmente
npm run dev
```

---

## 📝 Notas

- **React 18 → 19**: Muito arriscado, requer migration guide completo
- **Next.js 14 → 16**: Pular major versions não é recomendado
- **ESLint 9 → 10**: Breaking changes na config, manter em v9
- **Node types**: Manter em v20 (Node 20 LTS até 2026)

---

**Criado em:** 2026-02-17
**Task:** 1.5 - Audit de Dependências
**Status:** Aguardando aprovação para executar Fase 1 + 2
