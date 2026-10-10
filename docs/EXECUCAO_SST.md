# Execução do plano SST

## Estado em 10/10/2026

O plano de 74 requisitos **ainda não está concluído**. Esta entrega implementa a primeira jornada de atestados/perícias e a fundação de acesso clínico por UG. A matriz de `PLANO_IMPLEMENTACAO_SST.md` permanece referência de escopo; não marcar 74/74 nem mínimo POC atingido.

### Implementado

- `/sst/atestados`: consulta administrativa paginada no servidor com 20 registros, busca/situação e ordenação estável; não envia CIDs, pareceres ou URLs de anexos ao cliente administrativo.
- `/sst/atestados/novo`: servidor/dependente canônicos de RH, emitente `Person` do Cadastro Único, conselho, datas/horas, múltiplos códigos CID, motivo, protocolo/entrega automáticos ou manuais.
- `/sst/configuracoes`: motivos com política de dependente, restrições por cargo, impressão de comprovante, sugestão de afastamento e geração após deferimento; autorização clínica adicional por usuário/UG administrada pelo perfil técnico.
- `/sst/atestados/[id]`: detalhes clínicos restritos, anexos no GED com versões/hash, parecer e decisão pericial imutável.
- `/sst/atestados/[id]/comprovante`: relatório de recebimento, sem diagnósticos, com permissão de emissão de relatórios e impressão automática parametrizada.
- Deferimento pode criar `Leave` canônico, transacionalmente e com vínculo único; requer RH ativo e permissão de inclusão. Repetição de decisão não duplica afastamento; conflito com licença ativa aborta a transação.
- Protocolo automático estável por submissão: nova tentativa não duplica o atestado com os mesmos dados. Reutilização do protocolo com outros dados é rejeitada.
- Anexos usam `ingestGedDocument`, classe `SST_OCUPACIONAL` e `SstCertificateDocument`. Download valida SST, UG e acesso clínico antes de acessar o arquivo privado, inclusive quando houver cópias genéricas da URL.
- Vínculo opcional a processo digital existente: valida módulo Processos e escopo do setor; não encaminha o arquivo clínico para setores não autorizados.
- RH impede edição/exclusão direta de licença originada da decisão SST, preservando o vínculo e o parecer; contratos de retorno das actions existentes preservados.
- Auditoria de registro, decisão, autorização, leitura clínica, impressão e download, sem diagnóstico ou parecer em logs gerais.
- Função de cálculo de absenteísmo por interseção da jornada e união de intervalos testada; ainda não ligada a uma tela/relatório nem a uma fonte de jornadas planejadas por competência.

### Banco e sincronização

Sincronizado por fast-forward com `087010c — Social2`, preservando alterações locais SST. As cinco migrações Social já presentes no banco passaram a existir nesta cópia. A migração aditiva `20261010150000_add_sst_certificates` foi aplicada pelo `prisma migrate deploy`; não houve reset nem backfill destrutivo. A migração aplicada deve permanecer imutável.

### Cobertura contratual ainda pendente

- Item 3: perícia/afastamento implementados; **reflexos automáticos na folha pendentes**. `processPayroll` é uma simulação e não consome `Leave`; não deduzir salário automaticamente sem regra válida por regime/competência.
- Item 8: sugestão/confirmação disponível na ficha pericial; ainda não abre automaticamente a rotina de afastamentos imediatamente após cadastrar atestado.
- Item 9: restrição por cargo disponível; restrição por regime depende do vínculo funcional/regime canônico do RH ainda não associado ao servidor nesse fluxo.
- Item 1: registro e anexos implementados; códigos CID são validados sintaticamente, não por catálogo oficial nesta etapa.
- Motivos ainda não possuem edição/inativação na UI. Retificação/anulação de decisão com tratamento dos reflexos precisa de fluxo próprio antes de liberar essas operações.
- Juntas médicas, agenda ocupacional, relatórios completos de atestados/absenteísmo, GHE, programas, ASO, equipamentos/estoque, CAT, restrições, prevenção, planos, prontuários especializados, PPP e eSocial permanecem pendentes.
- A integração com Saúde assistencial/exames/vacinação ainda não foi implementada; os registros ocupacionais não consultam o prontuário SUS.
- Associação servidor/UG usa compatibilidade com a secretaria da lotação e autorização à UG. Se houver múltiplas UGs/entidades com a mesma secretaria, definir o vínculo funcional explícito para essa situação antes de homologar segregação por entidade.
- Leitor biométrico, certificado/ambiente eSocial e rotinas de emissão/transmissão precisam de integração real e evidência em homologação.

### Validação

- Nove testes direcionados passaram: isolamento dos módulos, política de horários/overlap, dependentes/cargos, ACL clínica/UG, decisão sem duplicação, repetição de protocolo e migração aditiva em PGlite.
- Prisma validate e geração do cliente passaram.
- `npm run build` passou na base sincronizada Social2 e após os últimos ajustes. Lint dos arquivos alterados passou; `prisma migrate status` confirmou banco atualizado com 21 migrações.
- Lint global apresentou oito erros fora dos arquivos SST: seis `no-explicit-any` em `prisma/seed-patrimonio.ts` e dois `set-state-in-effect` em `src/components/portal-institucional/PortalShell.tsx`.
- Não houve validação visual em navegador nem homologação de upload, impressão e fluxo com usuários reais. Testes de serviço com objetos simulados não equivalem a POC completa.

## Continuação

Concluir F1: edição/inativação de motivos, juntas, agenda, confirmação imediata de afastamento, relatórios e fonte de jornada planejada; definir contratos de RH/Folha. Em seguida executar F2–F8 na ordem do plano, atualizando a evidência por requisito e conservando a separação dos dados clínicos.
