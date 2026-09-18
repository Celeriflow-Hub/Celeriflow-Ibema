# Plano de desenvolvimento do módulo Frotas

Referência: `CeleriFlow_POC_Frotas_Desenvolvimento_REV01.md`, revisão de 18/09/2026.

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
| P6 | Testes reproduzíveis, build, revisão visual e ensaio da instância | `npm run test:frotas`, matriz de evidências |

Os registros são persistidos por serviços de domínio e Server Actions. Consultas usam contagem, ordenação estável, filtros e paginação no banco. A página começa com cinco linhas, com opção de dez. As referências são pesquisadas no servidor em grupos de até vinte, sem limitar a busca ao primeiro conjunto carregado.

## Regras adotadas

1. Veículo, máquina, equipamento e agregado compartilham um cadastro. Placa não é exigida de máquinas/equipamentos. Agregado pode apontar para uma unidade principal do mesmo setor; não cria controle de pneus/peças.
2. O setor é escolhido do organograma. Administrador técnico consulta os setores; operadores consultam e gravam no setor vinculado ao usuário. Usuário operacional sem setor precisa receber esse vínculo na Administração. A edição de ficha não transfere o histórico entre setores.
3. Valores são Decimal no banco e são transmitidos como strings. Custo desconhecido é nulo; zero é um valor conhecido. Totais identificam custos faltantes. Valores previstos e envolvidos em ocorrências não entram automaticamente no realizado.
4. Consumo cria uma apropriação de gasto dentro da mesma transação. Conclusão de OS cria uma apropriação dos serviços executados. Consumos já registrados e vinculados a uma OS são separados do valor dos serviços; o formulário explicita essa composição para evitar redigitação.
5. Cada fato derivado tem uma chave de origem única. Cada confirmação tem UUID e hash do conteúdo, vinculados ao usuário. Reenvio recupera a confirmação; conteúdo diferente não reutiliza uma confirmação anterior. Transações serializáveis e restrições únicas protegem OS/gastos.
6. Periodicidade por intervalo de dias de calendário. A próxima ocorrência parte da data programada, inclusive quando a conclusão atrasa. Plano de 10/09/2026 com 30 dias resulta em 10/10/2026. OS herda e conserva uma cópia dos serviços/estimativa da emissão.
7. OS segue Emitida → Em execução → Concluída. A confirmação conserva serviço executado, resultado e data efetiva. Histórico concluído não é apagado nem refeito por reenvio.
8. Seguros, obrigações e documentos compartilham a fonte de vencimentos. Agendamento, vigência, vencimento e cumprimento são datas distintas. IPVA/licenciamento são cadastros informados; não calculam incidência nem pagamento.
9. Relatórios e prévias usam as mesmas consultas. Emissões incluem todo o recorte autorizado. Quantidades são agrupadas por unidade; abastecimentos selecionam combustível de veículos e excluem lubrificantes e máquinas.

## Fronteiras e fontes

| Dependência | Fonte real | Implementação / limite |
|---|---|---|
| DEP-01 | `tenant-context`, `Department`, `ConfiguracaoModulo`, `audit-evidence` | Sessão, CRUD/relatórios, setor e auditoria reutilizados. Nenhum novo login. |
| DEP-02 | `Employee`, `Supplier` e nomes de `Person`/`Company` | Seletores de nomes/IDs existentes. Não cria RH, CNH, motorista ou seguradora paralelos. |
| DEP-03 | `Asset` | Vínculo opcional validado por permissão, situação e setor. Não altera tombamento, valores ou baixa patrimonial. |
| DEP-04 | Almoxarifado / movimentos de materiais | `DEPENDENCIA_OUTRO_MODULO`: não há apropriação automática adotada neste pacote. Consumo próprio local registra quantidade e custo informado, sem simular saldo/baixa. |
| DEP-05 | Compras / Contratos / Financeiro | `DEPENDENCIA_OUTRO_MODULO`: referências documentais são informativas. Não há importação automática, reconhecimento de pagamento nem escrita nesses módulos. Não relançar manualmente fatos já apropriados em Frotas. |
| DEP-06 | `reports/report-engine`, template global, renderizadores tabulares e PDFKit | Emissão reutiliza autorização, identidade, template e auditoria. Upload ao GED, assinatura digital e ajuda geral não foram recriados; validar essas capacidades no núcleo se necessárias ao aceite geral. |

Fontes externas aparecem identificadas nos campos e nas fichas. Não são exigidas para cadastrar uma unidade operacional local. GPS, mapas, telemetria, aplicativos próprios, notificações externas, otimização de rotas e pagamentos ficam fora do escopo.

## Implantação e aceite

1. Instalar pelo lockfile, gerar o cliente Prisma e executar os testes/build.
2. Aplicar `prisma migrate deploy` no ambiente de homologação. A migration adiciona apenas estruturas de Frotas e registra o código `FROTAS`, preservando uma configuração pré-existente com esse código.
3. Configurar os perfis em Configurações → Perfis, incluindo Mostrar card, Criar, Editar e Emitir relatórios conforme o papel. Operadores precisam de setor ativo no organograma. Administrador técnico usa o acesso já existente.
4. Entrar pelo card Frotas e preencher os cenários F-CAD, F-ROT, F-MAN, F-CONS e F-DOC pelas telas. Não há seed/importador de demonstração em produção.
5. Executar os 14 itens com perfil autorizado e de consulta, conferir persistência em outra sessão, arquivos emitidos e cenários concorrentes reais.
6. Testar a interface em 1366×650, 1440×800, 1920×900, zoom 200% e Chrome no celular. Acesso ao conteúdo prevalece sobre ausência de rolagem em telas pequenas/zoom.

As evidências técnicas e as pendências reais são mantidas em `FROTAS_EVIDENCIAS.md`. Código implementado e testes isolados não equivalem à homologação da comissão nem ao aceite de todos os requisitos gerais do edital.
