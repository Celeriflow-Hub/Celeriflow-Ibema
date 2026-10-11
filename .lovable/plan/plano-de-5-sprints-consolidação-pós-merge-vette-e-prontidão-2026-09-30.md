# Plano de 5 sprints — Consolidação pós-merge Vette e prontidão para a POC (PE 00014/2026)

## Validação prévia do relatório da Vette
Conferido no código após o merge:
- Presentes: Gestão de Frota ampliada, portais (motorista, posto, oficina), consulta pública, histórico/certificação/reconciliação SAGRES Frota (`src/lib/integrations/sagres/frota-*`, `captura-frota-*`), migrações `frota_oficina_autorizada`, `frota_portal_rate_limit`, `frota_sagres_historico`, `frota_orders_financial`, workflow GitHub Actions.
- Sem marcadores de conflito de merge no código.
- Riscos: duas implementações paralelas de Portal da Frota (`/portal/frota` nossa e `/app-domain/portal-frota` da Vette) e dois fluxos SAGRES Frota (nossa geração em `/prestacao-contas` e o histórico certificado da Vette). Precisam ser unificados.
- Pendências admitidas pela Vette: concorrência motorista x administrativo, homologação SAGRES, política de transparência histórica, migrações em homologação, Cloudflare publicando a partir de branch errada.

## Sprint 1 — Estabilização pós-merge
- Build completo (`build:check`), typecheck, todos os testes (nossos + Vette) e correção das falhas.
- Aplicar todas as migrações (`migrations` + `migrations-cacimba`) em banco limpo de homologação; corrigir ordem/duplicidades.
- Unificar Portal da Frota: um único fluxo por perfil; o outro vira redirecionamento.
- Unificar SAGRES Frota: geração em `/prestacao-contas` passa a ler o histórico certificado.
- Proteger `scripts/build.mjs` (migração só com banco configurado); ajustar Cloudflare/Vercel para publicar só a `main`.
- Link de Prestação de Contas no menu; atualizar `HISTORICO_SPRINTS.md`.

## Sprint 2 — Validação funcional ponta a ponta
- Seed de demonstração de Cacimba de Dentro nos 7 módulos (servidores, folha, veículos, motoristas, postos, medicamentos, contribuintes, débitos).
- Testes automatizados com login (usuário de teste) para os fluxos da POC: folha → contracheque → portal; abastecimento → posto → SAGRES; dispensação → estoque → SAGRES Farmácia; débito → 2ª via Pix → certidão.
- Cobrir cenários de concorrência pendentes (motorista x administrativo).
- Relatório de conformidade item a item do edital (atende / parcial / falta).

## Sprint 3 — Lacunas do edital
- Formulário do servidor com regime, banco, admissão, PIS.
- Login próprio para postos e oficinas.
- EFD-Reinf R-4010 (substitui DIRF) e tabela S-1010 eSocial.
- Envio de guia por e-mail e parcelamento online no Portal do Contribuinte.
- Aviso por e-mail de novo contracheque e de novo chamado.
- Calendário de feriados municipais nos prazos do suporte.
- Gerador único de relatórios em PDF com brasão e rodapé municipal.
- Itens que surgirem da matriz da Sprint 2.

## Sprint 4 — Padronização visual e otimização
- Padrão único de telas: cabeçalho, tabelas, filtros, formulários, estados vazios/erro, cores e brasão; revisão dos módulos da Vette para o mesmo padrão.
- Revisão mobile dos portais (motorista, servidor, contribuinte) e PWA.
- Acessibilidade básica (contraste, rótulos, teclado).
- Desempenho: consultas lentas, índices, paginação, tamanho do bundle; medir tempos de telas-chave.
- Campos configuráveis por cadastro (extra de valor agregado).

## Sprint 5 — Homologação e ensaio da POC
- Substituir leiautes provisórios SAGRES pelos oficiais (depende do TCE-PB); validar arquivos no validador oficial.
- Parâmetros oficiais: INSS/IRRF/RPPS 2026, patronal, margem consignável, CTM, validade da certidão, chave Pix, parâmetros de frota e Portaria 344.
- Ambiente de produção: banco, backups testados, variáveis, domínio; desativar login de teste.
- Ensaio completo do `ROTEIRO_POC.md` cronometrado, com usuário avaliador.
- Documentação final: manual rápido por módulo e checklist de entrega.

## Dependências externas (bloqueiam 100%)
Leiautes oficiais SAGRES, tabelas/leis municipais, convênio bancário/Pix, certificado ICP-Brasil, credenciamento BNAFAR, troca das senhas expostas.

## Detalhes técnicos
- Cada sprint termina com `build:check`, suíte de testes e registro em `HISTORICO_SPRINTS.md`/`roadmap.md`.
- Unificação preserva rotas antigas via redirect; nenhuma alteração em massa por regex.
- Identidade municipal somente via `src/lib/platform/municipality.ts`.
