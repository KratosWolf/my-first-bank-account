# MCP Setup — Skill de Referência

## O que são MCPs?

MCP (Model Context Protocol) são servidores que dão ferramentas extras ao Claude Code, permitindo acessar serviços externos diretamente do terminal.

## MCPs Configurados

### 1. Docker MCP Toolkit (MCP_DOCKER)

- **O que faz:** Gateway para múltiplos MCPs via Docker Desktop
- **Como funciona:** Roda containers Docker com servidores MCP
- **Configuração:** Automática pelo Docker Desktop → Settings → MCP Toolkit
- **MCPs incluídos:** Context7, Exa, GitHub, Notion, Playwright, Neon, etc.
- **Verificar:** `docker mcp gateway run`

### 2. Context7

- **O que faz:** Busca documentação atualizada de qualquer biblioteca/framework
- **Quando usar:** Quando precisa de docs atualizados (ex: supabase_flutter, riverpod, etc.)
- **Tools:** `resolve-library-id` → `get-library-docs`
- **Exemplo de uso:**
  ```
  Busca a documentação do supabase_flutter usando Context7
  ```
- **Configuração:** Via Docker MCP Toolkit (automático)

### 3. GitHub Official

- **O que faz:** Acesso completo ao GitHub — repos, PRs, issues, commits, branches
- **Tools:** ~40 ferramentas (create_pull_request, push_files, search_code, etc.)
- **Quando usar:** Git operations, code review, CI/CD
- **Configuração:** Via Docker MCP Toolkit (requer GitHub auth)

### 4. Notion

- **O que faz:** Acessa o Notion workspace (Ultimate Brain, databases, pages)
- **Tools:** ~22 ferramentas (search, create page, update, query database, etc.)
- **Quando usar:** Consultar ou atualizar o Ultimate Brain, criar páginas
- **Configuração:** Via Docker MCP Toolkit (requer Notion API key)
- **API Key:** Criada em https://www.notion.so/my-integrations

### 5. Playwright

- **O que faz:** Automação de browser — navegar, clicar, preencher forms, screenshots
- **Tools:** ~22 ferramentas (browser_navigate, browser_click, browser_snapshot, etc.)
- **Quando usar:** Testes E2E, scraping, automação web
- **Configuração:** Via Docker MCP Toolkit (automático)

### 6. Supabase (Global — Claude Code direto)

- **O que faz:** Acesso ao Supabase — projetos, tabelas, schemas, queries
- **Modo:** READ-ONLY (segurança)
- **Tools:** list_projects, list_tables, execute_sql, get_schemas, etc.
- **Quando usar:** Consultar estrutura do banco, verificar dados, debug
- **Configuração:** Global em `~/.claude.json`
- **Token:** Supabase Access Token (dashboard → Account → Access Tokens)

```json
{
  "supabase": {
    "command": "npx",
    "args": ["-y", "@supabase/mcp-server-supabase@latest", "--read-only"],
    "env": {
      "SUPABASE_ACCESS_TOKEN": "<seu-token>"
    }
  }
}
```

**⚠️ Para dar permissão de escrita:** remover `--read-only` dos args. Não recomendado para produção.

## MCPs Opcionais (Disponíveis mas não prioritários)

### Exa

- **O que faz:** Web search avançado com AI
- **Status:** Disponível no Docker MCP Toolkit, mas desabilitado
- **Motivo:** Claude Chat já tem web search embutido, Context7 cobre docs
- **Quando habilitar:** Se precisar de research de mercado, análise competitiva

### Neon

- **O que faz:** Banco Postgres serverless (alternativa ao Supabase)
- **Status:** Disponível no Docker MCP Toolkit
- **Quando usar:** Se tiver projetos no Neon

## Comandos Úteis

### Verificar MCPs ativos

```bash
claude mcp list
```

### Adicionar MCP global (todos os projetos)

```bash
claude mcp add --scope user --transport stdio <nome> -- <comando>
```

### Adicionar MCP por projeto (só no projeto atual)

```bash
claude mcp add --scope project --transport stdio <nome> -- <comando>
```

### Remover MCP

```bash
claude mcp remove <nome>
```

### Arquivos de configuração

- **Global:** `~/.claude.json` (MCPs disponíveis em todos os projetos)
- **Por projeto:** `.claude/settings.json` (MCPs só naquele projeto)
- **Docker MCPs:** Gerenciados pelo Docker Desktop MCP Toolkit

## Troubleshooting

### MCP não conecta

1. Verificar: `claude mcp list` (mostra status ✓ ou ✗)
2. Se Docker MCP: verificar Docker Desktop está rodando
3. Se Supabase: verificar token válido em `~/.claude.json`
4. Reiniciar: `/exit` e abrir nova sessão

### MCP aparece mas tools não funcionam

1. Verificar permissões (read-only vs full)
2. Verificar credenciais (tokens, API keys)
3. Testar o comando manualmente no terminal

### Adicionar novo MCP do Docker Toolkit

1. Docker Desktop → Settings → MCP Toolkit
2. Ativar o server desejado
3. Reiniciar Claude Code
