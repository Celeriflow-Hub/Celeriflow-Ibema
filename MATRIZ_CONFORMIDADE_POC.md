# Matriz de conformidade — PE 00014/2026 (Cacimba de Dentro/PB)

Legenda: **Atende** | **Parcial** (existe, mas depende de dado/homologação) | **Falta**

| # | Módulo / requisito | Situação | Observação |
|---|---|---|---|
| 1 | Tributação: cadastro, lançamento, guia, baixa, dívida ativa | Atende | Alíquotas dependem do CTM municipal |
| 2 | Tributação: parcelamento | Parcial | Interno ok; parcelamento online no portal falta (S3) |
| 3 | Portal do Contribuinte: 2ª via Pix, extrato, certidão validável | Parcial | Chave Pix/convênio oficiais pendentes |
| 4 | Portal do Contribuinte: envio de guia por e-mail | Falta | Sprint 3 |
| 5 | Folha: cálculo 6 tipos, INSS/IRRF/RPPS, consignados, fechamento | Parcial | Tabelas 2026 e patronais a confirmar |
| 6 | Folha: CNAB 240, eSocial, informe, relatórios | Parcial | Homologação bancária; S-1010 e EFD-Reinf R-4010 faltam (S3) |
| 7 | Folha: cadastro manual com regime/banco/admissão/PIS | Falta | Formulário sem os campos (S3) |
| 8 | Portal do Servidor: acesso, contracheque QR, solicitações, margem | Atende | Aviso por e-mail falta (S3) |
| 9 | Frota: veículos, cotas, ordens, diário, pneus, multas, custos | Atende | Parâmetros operacionais a confirmar |
| 10 | Portal da Frota: motorista, posto/oficina por código, consulta pública | Parcial | Login próprio de posto/oficina (S3) |
| 11 | Farmácia: estoque, lotes, dispensação, Portaria 344, alertas | Atende | Receituários a confirmar com farmacêutico |
| 12 | Farmácia: BNAFAR | Parcial | Planilha ok; envio automático exige credenciamento MS |
| 13 | SAGRES Mensal/Folha, Frota, Farmácia | Parcial | Leiautes provisórios CF-2026.1 — aguarda TCE-PB |
| 14 | Suporte com prazos (2h/12h/24h/5 dias úteis) | Parcial | Feriados municipais e e-mail de chamado (S3) |
| 15 | Acesso mobile / instalável | Atende | Revisão visual na S4 |
| 16 | Base demonstrativa da POC | Atende | `npx tsx prisma/seed-demo-cacimba.ts --apply` |
| 17 | Testes ponta a ponta com login | Parcial | Unitários passam; E2E exige banco de teste |
| 18 | Concorrência motorista x administrativo | Parcial | Teste `tests/frota-concurrency.pg.test.ts` exige PostgreSQL de teste |
