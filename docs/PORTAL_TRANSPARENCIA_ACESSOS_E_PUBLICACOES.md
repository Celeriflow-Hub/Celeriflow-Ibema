# Portal da Transparência — acessos e publicação de documentos

## Endereços e navegação

- **Cidadão:** `https://www.ibema.celeriflow.com.br/portal/portaldatransparencia`.
- A página usa o cabeçalho, rodapé e recursos de acessibilidade do Portal Institucional. O menu Transparência inclui **Documentos e publicações**.
- A entrada antiga `/portal-transparencia` encaminha ao endereço institucional, preservando parâmetros.
- **Gestão autenticada:** Dashboard → card Portal e Transparência → **Configurações e upload de documentos**, em `/transparencia/publicacoes`.
- A mesma opção está na navegação interna do módulo. O botão **Abrir portal público** permite conferir o resultado como cidadão.

## Fluxo do acervo

1. Em Configurações, definir exercícios disponíveis, entidades e consultas habilitadas.
2. Selecionar PDFs de `Novos Docs` ou novos documentos. Todos os arquivos desse acervo foram informados pelo responsável como provenientes do Portal da Transparência anterior.
3. Informar entidade, exercício, assunto, competência/período e consulta de destino. Separar lotes com metadados diferentes.
4. Em upload múltiplo, cada nome de arquivo é usado como título. Em upload único, é possível definir um título próprio.
5. O arquivo é enviado ao armazenamento privado da instância e registrado como **Rascunho**. O SHA-256 corresponde aos bytes do arquivo.
6. **Publicar externamente** verifica o arquivo preservado e libera consulta/download sem login. A biblioteca pública abre na fonte Documentos.
7. **Retirar do portal** mantém o registro e bloqueia novas consultas/downloads públicos. Para nova versão, enviar novo documento.

Uploads e mudanças de estado exigem permissões de criação/alteração do módulo `TRANSPARENCIA`. Downloads públicos verificam status, entidade, exercício, consulta habilitada e integridade do arquivo. Arquivos de outras áreas privadas não são liberados automaticamente.

## Configurações disponíveis

- Ano inicial e exercícios publicáveis.
- Fonte inicial das consultas: API Ibema, registros nativos, documentos ou exemplos fictícios.
- Nome e disponibilidade da Prefeitura/Câmara.
- IDs de entidades nativas e código externo confirmado; o código da Câmara não é presumido.
- Consultas habilitadas e horário de atendimento.

## Consultas públicas

Menu por assunto, contexto Prefeitura/Câmara/consolidado, fonte explícita, pesquisa, filtros específicos, datas, ordenação, paginação, detalhes e links de download.

CSV exporta o conjunto filtrado completo, com origem e proteção contra fórmulas. JSON entrega uma página com totais integrais. API indisponível não gera total zero nem troca silenciosa para exemplos. Campos financeiros ausentes deixam o total correspondente indisponível.

## Ativação operacional

- Aplicar a migration aditiva `20261013010000_transparency_publications` pelo fluxo de deploy de `prisma/migrations-ibema`.
- Configurar `BLOB_READ_WRITE_TOKEN` para o armazenamento privado da instância.
- Garantir configuração de instância e permissões `TRANSPARENCIA` dos responsáveis.
- Carregar e publicar os PDFs por lotes de assunto/exercício. **Este desenvolvimento não executou a carga dos arquivos locais no armazenamento de produção.** A presença em `docs/Novos docs` não equivale a publicação externa; essa pasta não é asset de runtime/deploy.
- Conferir consulta e download sem sessão após o deploy.

## Limites registrados

Esta entrega organiza os acessos e o fluxo de documentos, e disponibiliza o contrato de consultas. A carga integral do acervo, validação de todos os campos/endpoints reais da API, integração nativa de todas as famílias, projeção oficial de restos a pagar, formatos adicionais e auditoria PNTP integral continuam no backlog T00–T09. Os documentos de referência não são inseridos na biblioteca pública antes da efetiva publicação do arquivo.

## Verificação local

- `npm run build`: aprovado (Prisma generate, Next typegen, TypeScript e build de produção).
- ESLint direcionado aos serviços, páginas, rotas, navegação e testes alterados: sem erros ou avisos.
- 39 testes aprovados: consultas novas, proxy/navegação, financeiro público, publicações de planejamento e política de avisos públicos.
- Casos novos cobrem 180 registros com página intermediária/exportação integral, filtros combinados, origem fictícia, total ausente, falha externa sem fallback, Câmara sem código confirmado e hash de bytes divergentes.
- Migration e upload/download real no armazenamento da instância ainda dependem da ativação operacional descrita acima; nenhum deploy foi executado nesta rodada.
