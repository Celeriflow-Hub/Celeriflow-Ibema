# Roadmap
- [x] Corrigir estouro de memória mesmo quando a publicação chama o script de build diretamente
- [x] Sprint 1 — Identidade Cacimba e base da instância
- [ ] Sprint 2 — SAGRES TCE-PB (aguarda leiautes oficiais)
- [ ] Sprints 3-10 — ver PLANO_SPRINTS_CACIMBA.md

- [x] Sprint 2: camada SAGRES (leiautes versionados, validador, geração, histórico e protocolo) em /prestacao-contas
- [ ] Substituir leiautes provisórios pelos oficiais do TCE-PB (aguarda documentos)
- [x] Sprint 3: motor de cálculo da folha (INSS/RPPS, IRRF 2026, faltas, horas extras, adicionais, consignados, 6 tipos de folha, fechamento com código de conferência e reabertura justificada)
- [x] Sprint 4: relatórios, encargos, provisões, CNAB 240, eSocial, informe, integração contábil e importação
- [x] Sprint 5: Portal do Servidor (primeiro acesso por CPF, documentos com QR Code, solicitações com aprovação do RH, margem e histórico)
- [x] Sprint 6: gestão de frota completa (horímetro, motoristas, postos, cotas, ordens, diário de bordo, pneus, multas, custos e alertas)
- [x] Sprint 7: Portal da Frota (motorista, posto, oficina), consulta pública e SAGRES Frota ampliado
- [x] Sprint 8: farmácia (alertas, posição, consumo, perdas, controlados, CATMAT, BNAFAR e SAGRES Farmácia)
- [x] Sprint 9: Portal do Contribuinte (2ª via com Pix, extrato, certidões validáveis)
- [x] Sprint 10: Central de Suporte com prazos, painel gerencial e roteiro da POC
- [x] Campos de regime/banco/admissão/PIS no formulário de servidores

## Plano pós-merge Vette (5 sprints)
- [x] S1 Estabilização (pendem: testes com banco de teste, migrações em homologação, branch de produção no painel Vercel)
- [x] S2 Validação: seed demo (prisma/seed-demo-cacimba.ts) e MATRIZ_CONFORMIDADE_POC.md (pendem: testes E2E com login e concorrência — exigem banco de teste)
- [~] S3 Lacunas do edital — feito: formulário do servidor, feriados nos prazos, gerador R-4010/S-1010. Pendentes abaixo.
- [~] S4 Padronização visual — feito: link 'Pular para o conteúdo', foco visível global, redução de movimento, campos sem zoom no celular, telas de carregamento, menus de RH e Compras no mesmo padrão dos demais módulos. Pendentes: conferência visual com login das telas internas de cada módulo, desempenho e contraste (exige login e dados).
- [ ] S5 Homologação e ensaio POC (aguarda leiautes e parâmetros oficiais)

## Pendências abertas (atualizar a cada sprint)
- [ ] Login próprio para postos e oficinas (hoje: código por ordem)
- [ ] Envio de guia por e-mail e aviso por e-mail (contracheque, chamado) — aguarda definir serviço de e-mail/domínio remetente
- [ ] Parcelamento online no Portal do Contribuinte — aguarda regras do CTM (entrada mínima, nº parcelas, juros)
- [x] Gerador único de PDF com brasão e rodapé (src/lib/platform/official-document.ts; migrar relatórios antigos aos poucos)
- [x] Download R-4010 e S-1010 na tela de obrigações da folha
- [ ] Assinatura ICP-Brasil e transmissão — aguarda certificado A1
- [ ] Lista oficial de feriados municipais de Cacimba de Dentro — aguarda Prefeitura
- [ ] Rodar seed demo e testes E2E/concorrência — aguarda banco de testes
- [ ] Leiautes oficiais SAGRES, tabelas INSS/IRRF/RPPS 2026, chave Pix, CTM, parâmetros de frota/Portaria 344 — aguardam órgãos
- [ ] Trocar senhas expostas; desativar login de teste antes da entrega
- [ ] Produção publicar só da `main` (painel Vercel)
