<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Regras obrigatórias

## Alterações em massa
- Nunca use regex/replace genérico em vários arquivos; analise e altere cada arquivo individualmente.

## Funções exportadas
- Antes de mudar parâmetros ou retorno, use `grep` e verifique todos os consumidores.
- Não troque `{ error: string }` por `throw` quando o cliente lê `result?.error`.

## Build
- Rode `npm run build` antes de commit/push e corrija qualquer falha.
- A publicação gera o Next em `dist/` e ignora sua checagem TypeScript para caber na memória; `npm run build:check` mantém a checagem completa.

## Server Actions
- Em `<form action={...}>`, retorne `void`/`Promise<void>` e lance erros.
- Quando chamada via `await` no cliente, retorne `{ error: string }`; não lance erros.
- Verifique o consumo antes de escolher o padrão.

## Identidade da instância
- Nome, endereço, UF, CNPJ, IBGE e links do município vêm só de `src/lib/platform/municipality.ts`; nunca texto fixo — permite trocar de município sem caçar strings.
