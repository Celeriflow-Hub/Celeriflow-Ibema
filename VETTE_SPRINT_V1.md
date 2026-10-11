# Sprint V1 — Gestão de Frota (branch vette)

## Escopo

Responsabilidade integral pelas funcionalidades da antiga Sprint 6: arquitetura e integridade das operações de Gestão de Frota, permissões por setor, medidores, cadastros, custos e testes. A Sprint V2 tratará dos portais públicos e autenticados; impactos compartilhados entre V1 e V2 exigem teste cruzado.

## Implementações registradas na vette

- Gerador de código aleatório para ordens de abastecimento, independente da contagem de registros e preservando o gerador antigo para consumidores existentes.
- Edição de cotas e emissão de ordens serializadas por veículo usando transação e row lock no PostgreSQL.
- Verificação do volume já comprometido antes de reduzir cotas.
- Baixa administrativa protegida contra atualizações concorrentes, com criação de consumo e atualização da ordem na mesma transação.
- Saída e chegada de viagens com transações, bloqueio por motorista e veículo, impedimento de segunda viagem aberta e validação de leitura.
- Atualização dos medidores com bloqueio de veículo e validação de leitura. A troca de tipo de medidor com histórico requer procedimento específico.
- Aplicação do escopo de setor em veículos, cotas, ordens, viagens, pneus, multas e registro/revisão de oficinas.
- Validação de CPF dos motoristas e CNPJ dos postos.
- Consulta da Gestão de Frota filtrada por escopo para motoristas, pneus e relatórios recebidos das oficinas.
- Inclusão dos consumos originados nas ordens da Sprint 6 nos agrupamentos de custo, evitando contar novamente uma despesa já vinculada ao mesmo consumo.

## Verificações automatizadas

O workflow `.github/workflows/vette-frota-v1.yml` foi criado exclusivamente na vette para instalar dependências, executar testes unitários da Sprint 6, executar as integrações legadas de Frota em PGlite isolado, validar tipos da aplicação e tentar build sem migrar o banco da Vercel.

Na primeira execução, `npm ci` falhou porque `package.json` e `package-lock.json` estavam dessincronizados (dependências de qrcode ausentes do lockfile). Para diagnóstico apenas, o workflow passou a instalar sem reescrever o lockfile. **Não considerar o CI reproduzível até a equipe resolver a inconsistência do lockfile.**

## Critérios obrigatórios antes do aceite

- [ ] Workflow da vette conclui com testes, verificação de tipos e build aprovados.
- [ ] Testes de integração específicos da Sprint 6 reproduzem emissões e confirmações concorrentes, cotas no limite e tentativas duplicadas.
- [ ] Testar a interação da baixa administrativa com a confirmação no Portal do Posto, sem alteração indevida do ambiente final.
- [ ] Testar motoristas simultâneos, viagens paralelas, leituras inconsistentes e tentativas entre setores.
- [ ] Validar a conciliação do agrupamento de custos com o relatório exportado da Frota.
- [ ] Homologar com a Prefeitura os parâmetros assumidos: tolerância de consumo (15%), aviso de CNH (30 dias), vida útil de pneus (50.000 km) e regras simplificadas de habilitação.
- [ ] Confirmar migrações aplicáveis em banco de testes isolado; nenhuma migração na produção sem autorização.
- [ ] Revisão de código e autorização separada antes de qualquer merge ou implantação no ambiente final.

## Restrições

A branch `main` e o banco de produção não devem ser modificados por este trabalho. A V1 não inclui correções funcionais fora da Frota, exceto dependências indispensáveis às suas operações.
