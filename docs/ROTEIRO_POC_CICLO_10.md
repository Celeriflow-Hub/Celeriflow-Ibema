# Roteiro Reutilizável da POC - Ciclo 10

## Preparação

1. Aplicar migrations com `npx prisma migrate deploy`.
2. Carregar a massa sintética com `npm run seed:poc-base` e `npm run seed:poc` no ambiente isolado da POC.
3. Provisionar identidades de demonstração com `npm run seed:firebase`, `npm run provision:poc-evaluators` e `npm run provision:citizens`.
4. Validar a base com `npm run verify:poc-base`, `npm run verify:poc-users` e `npm run verify:group-a-evidence`.

Nenhum comando de seed deve ser executado contra produção ou com dados pessoais reais.

## Perfis de Demonstração

| Perfil | Evidência mínima |
| --- | --- |
| Administrador | Configura módulo, perfil e parâmetro municipal auditavelmente. |
| Operador | Cria cadastro, processo, solicitação, lançamento ou atendimento permitido. |
| Aprovador | Aprova etapa distinta do solicitante. |
| Somente leitura | Consulta dados autorizados e é bloqueado em operações de escrita. |
| Cidadão/Avaliador | Consulta portal e valida documento/aviso sem acesso interno. |

## Fluxos Críticos

| ID | Roteiro | Evidência |
| --- | --- | --- |
| POC-CORE-01 | Login, RBAC negativo, auditoria e configuração por instância. | Tela, evento de auditoria e bloqueio. |
| POC-PROC-02 | Processo com tramitação, documento assinado, notificação e consulta. | Histórico, hash/validação e notificação lida. |
| POC-C5-03 | Solicitação -> compra/contrato -> recebimento -> estoque ou tombamento -> empenho -> liquidação -> pagamento. | Referências entre os registros e projeção pública. |
| POC-C7-04 | Plano de controle com apontamento/evidência e operação de frota. | Auditoria, GED e indicador agregado. |
| POC-C8-05 | Lançamento tributário -> DAM -> baixa confirmada -> receita/tesouraria. | Guia, evento financeiro e situação fiscal interna. |
| POC-C9-06 | Um cenário de RH, Educação e Saúde pelos módulos internos. | Cadastro, persistência, permissão e relatório/tela do módulo. |

## Encerramento

1. Executar `npm run test:unit` no banco de teste provisionado.
2. Executar `npm run build`.
3. Registrar capturas, relatórios, documentos e IDs de auditoria por roteiro.
4. Reexecutar o seed limpo antes da rodada conduzida por pessoa que não implementou o fluxo.

Integrações externas devem ser identificadas no roteiro como `MOCK`, `SANDBOX` ou `PRODUÇÃO`; nenhuma simulação deve ser apresentada como integração produtiva.
