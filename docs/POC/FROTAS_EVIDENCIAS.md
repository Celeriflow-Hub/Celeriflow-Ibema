# Frotas — implementação e evidências técnicas

Referência: `CeleriFlow_POC_Frotas_Desenvolvimento_REV01.md`. Base analisada: commit `59b2366b12fcfc2f2231406a10397bea862783fd`. Plano: `PLANO_DESENVOLVIMENTO_FROTAS.md`.

Integração desenvolvida sobre a atualização de Almoxarifado/Patrimônio da `main`, commit `b2c9af9cfc9d8356b067478aecabf5de66243b5d`, preservando seu fluxo de recebimento/tombamento. A orientação posterior do usuário autorizou completar a integração e enviar para `main`, ampliando o limite original de somente leitura dos módulos de origem.

## Resultado entregue

Área própria `/frotas`, com card Frotas no painel, código de permissão `FROTAS` e tabelas independentes. As telas, serviços e registros de Obras permanecem preservados. O antigo registro genérico de operações e seu contrato de Server Action foram conservados para os consumidores existentes; não há migração automática desse histórico para o novo domínio.

Cadastros e consultas: veículos, máquinas, equipamentos e agregados; rotas; utilização; planos periódicos; ordens de serviço; manutenções efetuadas; combustíveis e lubrificantes próprios/de terceiros; gastos realizados; seguros; IPVA/licenciamento; documentos e vencimentos; ocorrências. Emissões em PDF, XLSX, CSV, TXT e HTML para impressão, com template institucional e autorização/auditoria do núcleo. Relatório de abastecimentos admite uma ou mais unidades selecionadas.

## Verificações realizadas

- `npm run test:frotas`: **15 verificações passaram**, contando o teste principal e seus 14 cenários. Banco PostgreSQL em memória criado exclusivamente pela suíte, via PGlite e adapter PostgreSQL do Prisma. As duas migrations incrementais de Frotas são executadas nesse banco, incluindo funções/triggers reais, não apenas substituídas por um mock de repositório.
- Sete verificações existentes direcionadas às correções necessárias ao build passaram: acesso/card por perfil, administrador, operações granulares, cancelamento financeiro, projeção pública da despesa, conector mock e planilha institucional com células protegidas de fórmulas.
- **25 testes de regressão de Almoxarifado/Patrimônio/Compras passaram**: estoque, tombamento do recebimento, disponibilidade concorrente, ciclo de vida patrimonial, requisição/entrega integral e correspondência do material com o processo de compra. Esses testes usam seus mocks de domínio existentes; a integração nova também é exercitada pelas 15 verificações de banco acima.
- ESLint das pastas de domínio, tela e APIs de Frotas, suíte e launcher: **sem erros ou avisos**.
- `npm run build`: compilação da aplicação e checagem de tipos completas. Três testes antigos receberam ajustes de fixtures/assertions para acompanhar os contratos atuais do núcleo; nenhuma regra operacional desses módulos foi modificada.
- Revisão no navegador em prévia local que compila os componentes reais de Frotas, com referências/dados fictícios e gravação desativada. Consulta de cinco linhas e paginação visíveis em 1366×650. Em viewport 390×844, largura útil de 375 px e conteúdo da página com os mesmos 375 px; tabela de aproximadamente 544 px com rolagem local. Formulário modal possui rolagem interna e botões de confirmação acessíveis.
- Revisão adicional dos componentes reais de integração: selecionar o bem preenche descrição/marca/modelo e mostra setor/responsável sem edição operacional; consumo próprio alterna entre estoque/lote e saída existente; ficha patrimonial oferece transferência, início e conclusão de manutenção. Em 390×844, conteúdo de 375 px sem alargamento global e rodapé de confirmação do consumo entre 742 e 811 px, dentro da viewport. A prévia não executa gravação nem substitui ensaio autenticado.

No GitHub, o build de prévia da Vercel passou. O job geral `verify` falhou em testes que dependem de banco/configuração ausentes e em outras assertions do núcleo; os passos posteriores de build/audit desse job foram pulados. O teste novo de Frotas inicialmente também encontrou ausência de configuração ao ser descoberto pelo runner geral. Sua preparação foi movida para um helper carregado antes dos imports no próprio worker, permitindo execução direta e pelo runner geral. Um job `Frotas isolado` executa a suíte separadamente. Os checks gerais foram preservados; suas falhas não foram suprimidas nem declaradas resolvidas por este módulo.

A prévia é um instrumento de revisão, não uma instância autenticada nem um site publicado. Não está incluída na aplicação ou no commit. Os testes de domínio usam um contexto autorizado construído pela suíte; não simulam sucesso de login Firebase. Não foram utilizadas credenciais de produção. No ambiente de execução do agente, um shim temporário de `os.userInfo` contornou uma limitação do sandbox; ele não faz parte do repositório. Uma chave RSA temporária e dados de Firebase fictícios satisfizeram apenas o parser de configuração durante testes/build, sem chamadas de autenticação.

## Matriz dos 14 requisitos

O estado abaixo considera o aceite funcional completo, incluindo operação autenticada na instância. `PARCIAL` significa que o comportamento foi implementado e tem a evidência indicada, mas esse ensaio ainda precisa ocorrer. Não corresponde a falha nos testes isolados nem a declaração de homologação.

| Item | Estado | Evidência técnica obtida | Pendência de aceite |
|---|---|---|---|
| FRO-001 | PARCIAL | Quatro categorias persistidas; agregado vinculado à unidade principal; edição com versão; máquinas sem placa inventada | Operar e reabrir ficha em outra sessão real |
| FRO-002 | PARCIAL | Consolidado de 2.955,00; custos nulos separados de zero; origem única por consumo/OS | Conferir consolidado e origem pelas telas autenticadas |
| FRO-003 | PARCIAL | Plano gera OS com cópia dos serviços; fluxo de execução; 10/09 + 30 dias = 10/10; emissão conserva 12 serviços | Conferir apresentação final do documento institucional na instância |
| FRO-004 | PARCIAL | Utilizações de 60, 40 e 120 km; final menor que inicial rejeitado; rota histórica preservada após edição | Executar seletores de servidor/rota com dados autorizados |
| FRO-005 | PARCIAL | Vigência e vencimento do seguro persistidos em campos distintos; origem local permitida | Conferir seguradora existente e política do perfil |
| FRO-006 | PARCIAL | IPVA/licenciamento de veículos; agendamento/vencimento/cumprimento distintos; cumprimento não duplica vencimento | Agendar e cumprir pelo fluxo autenticado |
| FRO-007 | PARCIAL | Quatro ocorrências, datas e valores preservados; nenhum gasto automático por valor envolvido | Registrar gasto decorrente e conferir a ficha de origem |
| FRO-008 | PARCIAL | Manutenção realizada totaliza 1.700,00; estimativas e OS futura excluídas; reenvio não duplica gasto | Validar consultas e concorrência no PostgreSQL da instância |
| FRO-009 | PARCIAL | Quatro cruzamentos; saída real e apropriação de saída existente; custo de origem; rollback de estoque/movimento/consumo/gasto | Ensaiar estoque/lotes/perfis reais após aplicar migrations |
| FRO-010 | PARCIAL | Rota com origem/destino/percurso e edição protegida; utilizações conservam cópia do percurso | Operar o cadastro de rotas pela sessão real |
| FRO-011 | PARCIAL | Cadastro veicular com características, setor e vínculo patrimonial opcional validado no servidor | Conferir Patrimônio/Servidores e perfil real autorizado |
| FRO-012 | PARCIAL | 27 unidades; páginas de 10/10/7; busca global da unidade 27; CSV/XLSX/PDF recebem o conjunto completo | Revisar arquivos finais com template configurado e identidade institucional |
| FRO-013 | PARCIAL | Setembro retorna três vencimentos na fonte única, incluindo obrigação cumprida; datas inclusivas | Emitir e inspecionar relatório autenticado de vencimentos |
| FRO-014 | PARCIAL | V1: 70 L / 414,00; V2: 60 L / 360,00; seleção múltipla: 130 L / 774,00; máquina/lubrificante excluídos | Emitir os formatos com período e seleção pela tela real |

## Conciliações e proteção de dados

Gasto realizado do cenário principal: manutenção 1.700,00 + combustível 890,00 + lubrificante 275,00 + outros 90,00 = **2.955,00**. Por unidade: V1 954,00; V2 1.020,00; M1 626,00; E1 205,00; A1 150,00. O valor de combustível de 890,00 inclui máquinas; o relatório veicular corretamente retorna apenas 774,00.

Outro cenário cria 14 consumos: dois fora do período e 12 dentro dele. Consulta paginada mostra dez; emissão recebe os 12. Um custo não informado mantém total conhecido parcial, sem tratá-lo como zero.

Validações exercitadas incluem acesso próprio sem depender de Obras, perfil de consulta sem escrita, isolamento entre setores, usuário operacional sem setor, vínculo de unidade incompatível, repetição da confirmação, ocorrência repetida do plano e reversão de toda a transação quando a apropriação da despesa é forçada a falhar. Duas chamadas simultâneas da mesma programação retornam uma OS no banco isolado. Como o socket do PGlite utiliza uma conexão, esse ensaio não substitui teste de disputa entre múltiplas conexões reais do PostgreSQL/Neon.

A edição local de uma ficha conserva seu vínculo patrimonial sem exigir novamente acesso a Patrimônio. Criar ou trocar esse vínculo exige a permissão e validação do bem. O cenário também verifica que reenvio de uma confirmação após mudança do setor do usuário não retorna um registro fora de seu escopo atual.

## Integração implementada e exercitada

- Bem patrimonial real, vínculo único com chave estrangeira e ficha de origem navegável. Setor e responsável vêm do bem; disponibilidade operacional é separada da situação patrimonial.
- Manutenção concluída antes do vínculo aparece no histórico uma vez. Manutenção avulsa realizada em Patrimônio e OS executada em Frotas compartilham a apropriação pela chave `asset-maintenance:<id>`.
- Início de OS cria manutenção vinculada. Conclusão por Patrimônio atualiza a OS, resultado/custo e a próxima ocorrência. Reenvio em ambos os caminhos conserva um gasto. O cenário adicional totaliza **272,50**: histórico anterior 55,00 + serviço avulso 17,50 + serviço de custo conhecido zero + OS 200,00.
- Duas manutenções simultâneas mantêm o bem/unidade indisponível até a última conclusão, restaurando `Ocioso`, sua situação anterior. Nova utilização é rejeitada durante manutenção. Baixa com manutenção aberta é rejeitada.
- Transferência aprovada conserva o histórico e muda o escopo: setor anterior consulta zero registros dessa unidade; destino consulta os mesmos 272,50. Reenvio da confirmação antiga pelo setor anterior é rejeitado. Agregado de outro setor é desvinculado, preservando cadastro e histórico.
- Remover alocação do bem produz setor nulo na unidade, retirando acesso dos operadores. Baixa patrimonial inativa a unidade, impede novos planos e conserva os gastos históricos. As projeções ocorrem na transação da origem, sem depender de abrir Frotas para sincronizar.
- Consumo de **20,5 L × 5,25 = 107,63** apropria material/unidade/custo reais, ignorando texto/unidade/custo digitados em desacordo. Saldo 100 → 79,5; reenvio conserva uma saída, consumo e gasto.
- Vincular uma saída existente de 10 L conserva o saldo já reduzido, sem nova baixa. Apropriar a mesma saída noutra unidade é rejeitado. Custo unitário ausente mantém custo nulo. Falta de permissão, saldo insuficiente, inventário bloqueado e lote vencido são rejeitados.
- Falha forçada ao registrar gasto reverte saldo, movimento, consumo e despesa juntos. O teste usa trigger temporária exclusivamente no banco isolado; não cria esse mecanismo de falha no produto.

As fichas patrimoniais e de movimentos recebem navegação para Frotas conforme permissão/escopo. Transferência e manutenção direta usam a autorização de edição patrimonial; a saída de material usa o serviço existente e exige permissão patrimonial de criação. Não há cadastros paralelos de bens, materiais, fornecedores ou responsáveis.

## Dependências e implantação

| Dependência | Estado / limite |
|---|---|
| Sessão, perfil, setor e auditoria | Serviços existentes reutilizados; confirmar configuração e acesso reais |
| Organograma, Servidores, Fornecedores | Leitura/validação de IDs existentes; sem novos cadastros paralelos |
| Patrimônio | Integração implementada/testada em banco isolado: origem, setor, responsável, transferência, baixa, OS/manutenção e histórico compartilhado; falta ensaio autenticado |
| Almoxarifado | Baixa e apropriação implementadas/testadas em banco isolado; falta ensaio dos dados/perfis da instância. Modo local sem vínculo continua explícito |
| Compras, Contratos e Financeiro | DEPENDENCIA_OUTRO_MODULO para importação/integração automática; referências locais são informativas, sem registrar pagamento |
| GED, assinatura digital e ajuda geral | Capacidades gerais não foram recriadas; ensaio do núcleo conforme exigência de aceite |

Para disponibilizar na instância: instalar pelo lockfile, aplicar `prisma migrate deploy`, gerar o cliente Prisma e publicar a aplicação pelo processo existente. As duas migrations de Frotas criam onze tabelas no total, registram `FROTAS` e instalam as relações/projeções/triggers, sem transferir registros de Obras. A migration recente de tombamento/recebimento na `main` é preservada. Não foram aplicadas ao banco do usuário nesta tarefa. `prisma db push` sozinho não instala os triggers versionados. Configurar Mostrar card/Criar/Editar/Emitir relatórios em Configurações → Perfis e os vínculos individuais de módulo, quando utilizados. Para materiais integrados, configurar também Consultar/Criar em `PATRIMONIO`; operações diretas na ficha patrimonial exigem Editar. Operadores precisam de setor ativo; o administrador técnico conserva o acesso do núcleo.

Pendentes: sessão Firebase real, persistência entre sessões, multiusuário com várias conexões, revisão visual dos documentos emitidos com template configurado, 1440×800/1920×900/zoom 200% e Chrome em dispositivo físico. Esta entrega não declara publicação em produção nem aceite pela comissão.
