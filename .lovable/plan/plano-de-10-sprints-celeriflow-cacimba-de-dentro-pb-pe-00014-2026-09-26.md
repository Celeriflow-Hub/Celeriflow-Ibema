# Plano de 10 Sprints — CeleriFlow Cacimba de Dentro/PB (PE 00014/2026)

Objetivo: ao fim da Sprint 10, entregar os 7 sistemas do Lote Único (Gestão Tributária, Portal do Contribuinte, Folha de Pagamento, Portal do Servidor, Gestão de Frota, Portal da Frota, Farmácia), prontos para a POC do item 8.13 (SAGRES Mensal, SAGRES Frota, SAGRES Farmácia, em mês escolhido pela Comissão), com extras de valor: relatórios, campos adicionais, acesso mobile e painéis.

Duração sugerida: 2 semanas por sprint (cerca de 20 semanas). Cada sprint termina com build passando, testes do módulo e um roteiro de demonstração.

---

## Sprint 1 — Identidade Cacimba e base da instância
- Remover referências fixas a Divino de São Lourenço/ES (páginas, metadados, links, seeds, regras tributárias demonstrativas).
- Configuração da instância: brasão, CNPJ, endereço, secretarias, unidades gestoras, código IBGE e código SAGRES do município.
- Perfis de acesso por módulo (Administrador, Operador, Visualizador + perfis por secretaria).
- Liberar o preview (ajustar cabeçalhos de frame) e publicar ambiente de homologação com banco e login configurados.
- Extra: layout responsivo revisado no shell dos módulos (menu lateral recolhível em celular).

## Sprint 2 — Camada TCE-PB/SAGRES (fundação)
- Adaptador de prestação de contas por estado (TCE-ES mantido para Divino, TCE-PB/SAGRES para Cacimba).
- Modelo de remessa: competência (mês/ano), unidade gestora, versão do leiaute, validação, geração do arquivo, protocolo e histórico.
- Tela "Prestação de Contas SAGRES": escolher mês, validar pendências, gerar, baixar e registrar envio.
- Validador que aponta campos obrigatórios faltantes antes da geração (essencial para a POC).
- Base de testes com leiautes oficiais do TCE-PB.

## Sprint 3 — Folha de Pagamento: motor de cálculo
- Cadastro completo de servidores: vínculo, cargo, lotação, regime (RGPS/RPPS), dependentes, dados bancários, campos exigidos pelo SAGRES.
- Eventos parametrizáveis com fórmulas (vencimentos, descontos, incidências).
- Cálculo de INSS, IRRF (tabelas vigentes), RPPS, faltas, horas extras, adicionais, consignados.
- Tipos de folha: mensal, complementar, 13º (adiantamento e final), férias, rescisão.
- Fechamento e reabertura controlada da competência, com auditoria.

## Sprint 4 — Folha: obrigações, relatórios e SAGRES Mensal
- Arquivo SAGRES Mensal (Folha) gerado pelo adaptador da Sprint 2.
- Relatórios: resumo da folha, líquidos por banco, por secretaria, encargos patronais, provisões.
- Remessa bancária (CNAB) e integração contábil (empenho da folha no financeiro).
- Exportações auxiliares: eSocial (eventos principais), DIRF/informe de rendimentos, RAIS quando aplicável.
- Importação da base anterior da prefeitura (servidores e histórico) com relatório de inconsistências.

## Sprint 5 — Portal do Servidor
- Acesso por CPF com login seguro e primeiro acesso.
- Contracheques, informe de rendimentos, ficha financeira e declarações com validação por código/QR Code.
- Solicitações online: férias, licenças, atualização cadastral, com fluxo de aprovação no RH.
- Margem consignável e histórico funcional.
- Extra: versão mobile instalável (atalho na tela inicial do celular) e notificações de novo contracheque.

## Sprint 6 — Gestão de Frota completa
- Veículos e máquinas com hodômetro e horímetro (Obras e Agricultura).
- Abastecimentos com limite por veículo/cota, postos credenciados, ordens de abastecimento.
- Motoristas (CNH e vencimentos), viagens/diário de bordo, manutenções preventivas e corretivas, pneus, multas, seguros.
- Consumo médio e alertas de desvio.
- Relatórios de custo por veículo, secretaria e centro de custo.

## Sprint 7 — Portal da Frota e SAGRES Frota
- Portal da Frota (hoje ausente): acesso para motoristas, postos e oficinas.
- Motorista: registro de saída/chegada pelo celular, checklist do veículo, foto do hodômetro.
- Posto: confirma abastecimento com código da ordem; oficina: registra serviço executado.
- Consulta pública opcional da frota (transparência).
- Arquivo SAGRES Frota (combustível) com validação por competência.

## Sprint 8 — Farmácia Pública e SAGRES Farmácia
- Catálogo de medicamentos (CATMAT/BR), lotes, validade, estoque por unidade.
- Entrada por nota fiscal, transferências entre unidades, dispensação com receita e paciente (CNS/CPF).
- Controlados (Portaria 344) com livro de registro, alerta de vencimento e estoque mínimo.
- Integração com Hórus/BNAFAR quando exigido.
- Arquivo SAGRES Farmácia e relatórios de consumo, perdas e posição de estoque.

## Sprint 9 — Gestão Tributária e Portal do Contribuinte
- Parametrizar o Código Tributário de Cacimba de Dentro (IPTU, ISS, taxas, alíquotas, descontos e parcelamentos).
- Cadastros imobiliário e mobiliário, lançamentos, guias com Pix e boleto, baixa bancária, dívida ativa, CDA, NFS-e.
- Portal do Contribuinte: segunda via, certidões (negativa/positiva com efeito de negativa) validáveis, extrato de débitos, parcelamento online, emissão de NFS-e, alvará.
- Extra: pagamento por Pix direto no celular e envio de guia por e-mail.
- Importação da base tributária anterior.

## Sprint 10 — Extras, estabilização e ensaio da POC
- Painel gerencial por módulo (indicadores de folha, frota, farmácia, arrecadação).
- Gerador de relatórios com filtros e exportação PDF, Excel e CSV em todos os módulos.
- Campos adicionais configuráveis por cadastro (sem programação).
- Central de suporte: chat, abertura de chamados com prazos do edital (imediato, 12h, 24h, 5 dias úteis) e classificação de demandas (baixa, média, alta).
- Testes de desempenho, segurança, backup e auditoria.
- Ensaio completo da POC: roteiro item a item do Termo de Referência, geração dos três arquivos SAGRES em mês sorteado, material de treinamento e manuais.

---

## Mapa de cobertura do edital

```text
Item do Lote                 Sprints
1 Gestão Tributária          1, 9, 10
2 Portal do Contribuinte     9, 10
3 Folha de Pagamento         2, 3, 4
4 Portal do Servidor         5
5 Gestão de Frota            6
6 Portal da Frota            7
7 Farmácia                   8
POC 8.13 (SAGRES x3)         2, 4, 7, 8, 10
Suporte e prazos (TR)        10
Implantação e importação     1, 4, 9
```

## Riscos principais
- Leiautes oficiais SAGRES: precisam ser obtidos do TCE-PB até a Sprint 2.
- Base de dados atual da prefeitura: formato desconhecido; pedir amostras cedo.
- Legislação tributária municipal: necessária antes da Sprint 9.
- A POC tem convocação em até 2 dias úteis: o ambiente de demonstração deve estar estável desde a Sprint 8.

## Detalhes técnicos
- Projeto segue em Next.js + Prisma + PostgreSQL + Firebase; cada sprint adiciona migrações Prisma próprias e testes em `tests/`.
- Adaptador SAGRES em `src/lib/integrations/` seguindo o padrão do contrato de exportação já existente (layout versionado, credencial por referência, fila com status).
- Acesso mobile via manifesto de aplicativo instalável e layouts responsivos, sem app nativo.
- Regras do projeto mantidas: `npm run build` antes de cada commit, verificação de consumidores antes de alterar funções exportadas, sem substituições em massa.
