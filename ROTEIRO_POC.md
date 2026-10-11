# Roteiro de ensaio da POC — PE 00014/2026 (item 8.13)

Painel de acompanhamento: **/painel-poc** (sinaliza o que já tem dado demonstrável).

## Preparação (antes da janela de 2 dias)
1. Carregar base da Prefeitura (servidores, contribuintes, veículos, produtos) e conferir `src/lib/platform/municipality.ts`.
2. Fechar a folha da competência a ser sorteada; emitir ordens de abastecimento e dispensações do mês.
3. Criar usuário avaliador (modo POC) e abrir um chamado de teste na **Central de Suporte** (/suporte).

## Demonstração item a item
1. Gestão Tributária: contribuinte → lançamento → guia → baixa → dívida ativa → parcelamento.
2. Portal do Contribuinte (/portal/contribuinte): entrada por CPF/CNPJ + inscrição, 2ª via com Pix, certidão e validação.
3. Folha: variáveis, cálculo, fechamento com código de conferência, relatórios, CNAB 240, eSocial.
4. Portal do Servidor: primeiro acesso, contracheque com QR Code, validação pública, solicitações.
5. Gestão de Frota: cota, ordem, baixa com leitura, diário de bordo, pneus, multas, custos.
6. Portal da Frota: motorista pelo celular, posto e oficina com código, consulta pública.
7. Farmácia: entrada, dispensação, controlados (Portaria 344), alertas, BNAFAR.
8. **SAGRES** (/prestacao-contas): gerar Mensal/Folha, Frota e Farmácia do mês sorteado, validar, baixar e registrar protocolo.
9. Suporte: mostrar prazos (crítica 2h, alta 12h, média 24h, baixa 5 dias úteis) e o histórico do chamado.

## Checagens finais
- Login e permissões por perfil; trilha de auditoria; backup do banco feito no dia anterior.
- Acesso pelo celular (sistema instalável).
