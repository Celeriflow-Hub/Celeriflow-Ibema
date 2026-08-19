# Dossiê Operacional - Ciclo 11

## Evidências do Repositório

| Item | Evidência | Situação |
| --- | --- | --- |
| Saúde da aplicação | `GET /api/health` consulta o banco e retorna `200` ou `503` sem cache. | Implementado |
| Migrações | `npx prisma migrate status` deve retornar banco atualizado antes da rodada. | Verificável |
| Build | `npm run build` deve passar no commit candidato. | Verificável |
| Integrações | Política bloqueia `PRODUCAO`; Banco Virtual é `SANDBOX` e demais conectores são `MOCK`. | Implementado |
| Seed e usuários | `docs/ROTEIRO_POC_CICLO_10.md` define preparação e validadores. | Implementado |

## Evidências Externas Obrigatórias

- [ ] Domínio da POC com certificado HTTPS válido.
- [ ] Provedor, região, redundância, firewall e monitoramento documentados.
- [ ] Backup automatizado e restauração testada, com data, responsável e resultado.
- [ ] Plano de continuidade e contatos de escalonamento aprovados.
- [ ] Evidência de LGPD, gestão de acesso e revogação de credenciais.

## Rodada Técnica

1. Executar migrations, seed isolado, verificadores de POC e build.
2. Consultar `/api/health` autenticada e anonimamente conforme a política do ambiente.
3. Exercitar login, logout, troca de perfil, bloqueio de permissão e auditoria.
4. Executar um cenário `MOCK` e o health check `SANDBOX` do Banco Virtual, registrando ambiente e retorno.
5. Reexecutar os fluxos do roteiro do Ciclo 10 por pessoa não autora.

## Congelamento

O congelamento só começa quando as evidências externas acima estiverem anexadas e não houver falha crítica aberta. Durante a janela de POC são permitidas apenas correções de defeitos críticos; funcionalidades, schema, integrações e arquitetura não podem ser alterados.

## Resultado da Verificação - 19/08/2026

| Verificação | Resultado |
| --- | --- |
| `npx prisma migrate status` | Aprovado: schema atualizado. |
| `npm run verify:group-a-evidence` | Aprovado. |
| `npm run build` | Aprovado. |
| `npm run verify:poc-base` | Bloqueado: a massa esperada para UG 0101, exercícios, contas, sandbox bancário e regras constitucionais não está carregada. |
| `npm run verify:poc-users` | Bloqueado: `adminteste@email.com`, `gestao1@email.com` e `contadorteste@email.com` não existem no Firebase nem no cadastro municipal. |

Os comandos de seed e provisionamento devem ser executados somente após confirmar um banco isolado de POC. O ambiente atual não pode ser considerado pronto para demonstração até que esses bloqueios e as evidências externas sejam resolvidos.
