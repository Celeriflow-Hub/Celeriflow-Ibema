# Plano de desenvolvimento do módulo Frotas

Referência: `CeleriFlow_POC_Frotas_Desenvolvimento_REV01.md`, revisão de 18/09/2026.

Planejamento final após a orientação do usuário: completar a integração Frotas ↔ Patrimônio ↔ Almoxarifado e enviar o código à branch `main`. Essa orientação amplia a restrição original de somente leitura dos módulos de origem. As alterações nesses módulos se limitam aos vínculos, às operações patrimoniais compartilhadas e à reutilização do serviço de estoque existente. Compras/Financeiro continuam com suas regras próprias.

## Direção aprovada

Frotas é um módulo independente, com card próprio no painel, código de autorização `FROTAS` e entrada `/frotas`. Conforme a orientação posterior do usuário, o cadastro operacional dentro de Obras é ignorado por esta implementação e permanece sem alterações. Não há migração ou sincronização automática dos registros de Obras.

## Diagnóstico do repositório

- Stack preservada: Next.js 16.2.12, React 19, TypeScript, Tailwind 4, Prisma 7 e PostgreSQL com adaptador Neon. Login e sessão permanecem no núcleo Firebase existente.
- `/frotas` continha um formulário simples de `FleetOperation`, autorizado por `PATRIMONIO`, limitado a bens patrimoniais classificados como veículos. Não havia cadastro operacional independente, rotas, planos periódicos, utilização, seguros ou agenda documental nessa rota.
- O histórico `FleetOperation` e o serviço `c7/operations-service` são preservados. Não foram convertidos em planos, consumos ou gastos novos, pois não contêm os dados de origem necessários para uma conversão confiável.
- A identidade do ERP usa Inter, superfícies brancas, bordas slate e ações com tons de verde/teal. O módulo reutiliza `PageFrame`, `PageHeader`, o cabeçalho institucional, o núcleo de autorização, a auditoria e o mecanismo de emissão de relatórios.
- Dashboard, configuração de módulos e matriz de perfis usam listas de códigos explícitas. O ponto de extensão inclui `FROTAS` nessas listas, sem conceder acesso automaticamente aos perfis operacionais.

## Pacotes e implementação

| Pacote | Entrega | Arquivos principais |
|---|---|---|
| P0 | Diagnóstico, limites e rastreabilidade dos 14 itens | Este plano e matriz de evidências |
| P1 | Card independente, acesso próprio, unidade operacional e rotas | Dashboard, configuração de módulos/perfis, `FleetUnit`, `FleetRoute` |
| P2 | Utilização, seguros, obrigações, documentos e ocorrências | `FleetUsage`, `FleetDocument`, `FleetOccurrence` |
| P3 | Plano periódico → OS → início → conclusão, emissão dos documentos | `FleetPlan`, `FleetWorkOrder` e serviço transacional |
| P4 | Combustível/lubrificante próprio/terceiro e consolidado de gastos | `FleetConsumption`, `FleetExpense` |
| P5 | Frota geral, vencimentos, abastecimentos e históricos emitíveis | `frotas/report.ts`, `/api/frotas/relatorios` |
| P5.1 | Bem de origem, transferências, responsável, baixa e manutenção compartilhada | Relação `FleetUnit.asset`, `FleetAssetEvent`, `AssetMaintenance`, ficha patrimonial e projeções no banco |
| P5.2 | Baixa de material ou apropriação de saída existente, com custo real | Relação `FleetConsumption.stockMovement`, serviço transacional existente `applyStockMovement` |
| P6 | Testes reproduzíveis, build, revisão visual e ensaio da instância | `npm run test:frotas`, matriz de evidências |

Os registros são persistidos por serviços de domínio e Server Actions. Consultas usam contagem, ordenação estável, filtros e paginação no banco. A página começa com cinco linhas, com opção de dez. As referências são pesquisadas no servidor em grupos de até vinte, sem limitar a busca ao primeiro conjunto carregado.

## Regras adotadas

1. Veículo, máquina, equipamento e agregado compartilham um cadastro. Placa não é exigida de máquinas/equipamentos. Agregado pode apontar para uma unidade principal do mesmo setor; não cria controle de pneus/peças.
2. Sem vínculo patrimonial, o setor é escolhido do organograma. Para unidade vinculada, Patrimônio define setor e responsável; o formulário recupera os dados de origem. A transferência aprovada na ficha do bem atualiza automaticamente a unidade e o escopo de todos os seus históricos/relatórios. Operadores do setor anterior perdem acesso à unidade transferida; o novo setor recebe seu histórico. Bem sem setor fica inativo e só aparece ao administrador. A edição operacional não realiza transferência patrimonial.
3. Valores são Decimal no banco e são transmitidos como strings. Custo desconhecido é nulo; zero é um valor conhecido. Totais identificam custos faltantes. Valores previstos e envolvidos em ocorrências não entram automaticamente no realizado.
4. Consumo cria uma apropriação de gasto dentro da mesma transação. Conclusão de OS cria uma apropriação dos serviços executados. Consumos já registrados e vinculados a uma OS são separados do valor dos serviços; o formulário explicita essa composição para evitar redigitação.
5. Cada fato derivado tem uma chave de origem única. Cada confirmação tem UUID e hash do conteúdo, vinculados ao usuário. Reenvio recupera a confirmação; conteúdo diferente não reutiliza uma confirmação anterior. Transações serializáveis e restrições únicas protegem OS/gastos.
6. Periodicidade por intervalo de dias de calendário. A próxima ocorrência parte da data programada, inclusive quando a conclusão atrasa. Plano de 10/09/2026 com 30 dias resulta em 10/10/2026. OS herda e conserva uma cópia dos serviços/estimativa da emissão.
7. OS segue Emitida → Em execução → Concluída. A confirmação conserva serviço executado, resultado e data efetiva. Histórico concluído não é apagado nem refeito por reenvio.
8. Seguros, obrigações e documentos compartilham a fonte de vencimentos. Agendamento, vigência, vencimento e cumprimento são datas distintas. IPVA/licenciamento são cadastros informados; não calculam incidência nem pagamento.
9. Relatórios e prévias usam as mesmas consultas. Emissões incluem todo o recorte autorizado. Quantidades são agrupadas por unidade; abastecimentos selecionam combustível de veículos e excluem lubrificantes e máquinas.
10. Tombamento, aquisição, valor e depreciação pertencem a Patrimônio. O cadastro de Frotas seleciona o bem e recupera descrição, marca/modelo, setor e responsável. A classificação operacional é escolhida pelo usuário; não se cria uma unidade para todo bem permanente. O vínculo é único e protegido por chave estrangeira. Depois de existir histórico, não pode ser removido ou trocado pela ficha operacional.
11. Disponibilidade operacional é conservada separadamente da situação patrimonial. Manutenção prevalece na situação efetiva e bloqueia nova utilização; baixa prevalece sobre qualquer disponibilidade e bloqueia novos fatos operacionais. Baixa conserva os históricos e relatórios. Setor/responsável/situação são projetados por triggers na mesma transação da origem, incluindo alterações realizadas pelos serviços patrimoniais existentes. Transferência não leva automaticamente agregados de outro setor; esses vínculos são removidos, sem apagar os cadastros ou seus históricos.
12. Iniciar uma OS de unidade patrimonializada cria uma manutenção patrimonial vinculada. Concluir em Frotas atualiza essa manutenção; concluir a mesma manutenção em Patrimônio atualiza a OS, execução/custo e próxima ocorrência do plano. A chave `asset-maintenance:<id>` identifica uma única apropriação nos dois caminhos. Manutenção patrimonial avulsa concluída também alimenta o histórico de Frotas, inclusive quando anterior ao vínculo. Duas manutenções simultâneas conservam a indisponibilidade até a última conclusão, restaurando a situação anterior. Não se permite baixa com manutenção aberta.
13. Consumo próprio oferece baixa ao confirmar e vínculo com saída já registrada. A baixa chama `applyStockMovement` dentro da transação que registra consumo, gasto, confirmação e auditoria. Estoque insuficiente, lote vencido, inventário bloqueado ou falha em qualquer etapa revertem tudo. Material, unidade, quantidade da saída existente e custo são obtidos do Almoxarifado; custo total = quantidade × custo unitário de origem, com duas casas decimais. Custo desconhecido continua nulo. Cada saída é apropriada uma vez; saída de tombamento/Obras ou de outro setor é rejeitada. Vincular saída existente não realiza segunda baixa.
14. Consultar referências de material exige acesso a `PATRIMONIO`; criar baixa exige também a operação Criar desse módulo. Transferir/iniciar/concluir diretamente pela ficha patrimonial exige Editar em `PATRIMONIO` e escopo sobre o bem atual. Operar OS em Frotas exige sua permissão própria; a manutenção patrimonial é um registro derivado dessa OS. O modo local continua explícito para material sem origem de estoque e não é apresentado como integração executada.

## Fronteiras e fontes

| Dependência | Fonte real | Implementação / limite |
|---|---|---|
| DEP-01 | `tenant-context`, `Department`, `ConfiguracaoModulo`, `audit-evidence` | Sessão, CRUD/relatórios, setor e auditoria reutilizados. Nenhum novo login. |
| DEP-02 | `Employee`, `Supplier` e nomes de `Person`/`Company` | Seletores de nomes/IDs existentes. Não cria RH, CNH, motorista ou seguradora paralelos. |
| DEP-03 | `Asset`, `AssetTransfer`, `AssetMaintenance`, `AssetWriteOff` | Bem de origem real; setor/responsável/situação sincronizados; navegação entre fichas; OS/manutenção compartilhada; baixa bloqueia operação e conserva histórico. Tombamento, depreciação e valores permanecem patrimoniais. |
| DEP-04 | `MaterialStock`, `MaterialMovement`, `patrimonio/stock-service.applyStockMovement` | Baixa real ou apropriação de saída existente; quantidade/custo da origem; vínculo único, transação única e navegação entre consumo/movimento. Sem estoque paralelo ou conversão implícita de unidade. |
| DEP-05 | Compras / Contratos / Financeiro | `DEPENDENCIA_OUTRO_MODULO`: referências documentais são informativas. Não há importação automática, reconhecimento de pagamento nem escrita nesses módulos. Não relançar manualmente fatos já apropriados em Frotas. |
| DEP-06 | `reports/report-engine`, template global, renderizadores tabulares e PDFKit | Emissão reutiliza autorização, identidade, template e auditoria. Upload ao GED, assinatura digital e ajuda geral não foram recriados; validar essas capacidades no núcleo se necessárias ao aceite geral. |

Fontes externas aparecem identificadas nos campos e nas fichas. Não são exigidas para cadastrar uma unidade operacional local. GPS, mapas, telemetria, aplicativos próprios, notificações externas, otimização de rotas e pagamentos ficam fora do escopo.

## Implantação e aceite

1. Instalar pelo lockfile, gerar o cliente Prisma e executar os testes/build.
2. Aplicar `prisma migrate deploy` antes de disponibilizar as novas telas. A primeira migration cria as dez tabelas de Frotas e registra o módulo; a segunda adiciona relações, campos de projeção, `FleetAssetEvent` e funções/triggers de integração. A migration de recebimento/tombamento já existente na `main` é preservada e executada na ordem. Fazer cópia de segurança pelo processo operacional da instância antes da implantação. O comando não foi executado no banco do usuário durante o desenvolvimento.
3. Configurar os perfis em Configurações → Perfis, incluindo Mostrar card, Criar, Editar e Emitir relatórios conforme o papel. Operadores precisam de setor ativo no organograma. Administrador técnico usa o acesso já existente.
4. Entrar pelo card Frotas e preencher os cenários F-CAD, F-ROT, F-MAN, F-CONS e F-DOC pelas telas. Não há seed/importador de demonstração em produção.
5. Executar os 14 itens com perfil autorizado e de consulta, conferir persistência em outra sessão, arquivos emitidos e cenários concorrentes reais.
6. Testar a interface em 1366×650, 1440×800, 1920×900, zoom 200% e Chrome no celular. Acesso ao conteúdo prevalece sobre ausência de rolagem em telas pequenas/zoom.
7. Ensaiar aquisição/recebimento/tombamento já existentes → seleção do bem em Frotas; OS concluída em cada módulo; manutenção avulsa anterior/posterior ao vínculo; duas manutenções abertas; transferência com responsável; unidade sem setor; baixa; consumo com custo conhecido/desconhecido; estoque insuficiente; inventário bloqueado; saída já apropriada e reenvio. Testar disputa com múltiplas conexões reais. Conferir que não há segunda baixa, gasto ou valor patrimonial criado por Frotas.
8. Enviar a implementação validada à `main`, conforme autorização expressa do usuário, preservando as alterações recentes dos módulos de origem. Verificar os checks do GitHub e da hospedagem. Build local/testes isolados não representam aplicação das migrations nem implantação do banco de produção.

Referência técnica para as projeções transacionais: [PostgreSQL — CREATE TRIGGER](https://www.postgresql.org/docs/current/sql-createtrigger.html) e [funções de trigger em PL/pgSQL](https://www.postgresql.org/docs/current/plpgsql-trigger.html). Essas funções fazem parte da migration versionada; `prisma db push` sozinho não as instala.

As evidências técnicas e as pendências reais são mantidas em `FROTAS_EVIDENCIAS.md`. Código implementado e testes isolados não equivalem à homologação da comissão nem ao aceite de todos os requisitos gerais do edital.
