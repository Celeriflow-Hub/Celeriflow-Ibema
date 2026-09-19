# Plano de implementação — Portal Institucional e Transparência

## Base de análise

Em 19/09/2026, a pasta `docs/POC` contém planos de Frotas, Almoxarifado e Patrimônio, Processos e Protocolos e RH/Folha. Não há um MD específico de Portal Institucional ou de Portal da Transparência. Este plano registra somente:

- o pedido para disponibilizar o portal público em `divinosaolourenco.celeriflow.com.br/portal`;
- a navegação já existente do Portal da Transparência em `/portal-transparencia`;
- as restrições públicas documentadas para Processos e Protocolos e RH/Folha.

Não se deve apresentar os requisitos PED-001 a PED-134 como homologados somente por haver telas. O plano de Processos os mantém como `A_VERIFICAR`.

## Referências de estrutura visual

Foram analisados portais públicos de prefeituras de Curitiba, Londrina, Quatro Barras, Itamarandiba e Niterói. Os pontos aplicados são: faixa institucional compacta, identificação municipal clara, navegação direta, contraste sóbrio azul/branco, destaque de transparência, cartões de acessos públicos e rodapé com aviso de privacidade. O verde CeleriFlow fica reservado a chamadas e estados de ação.

## Escopo implementado

| Área | Entrega pública |
| --- | --- |
| Rota | `/portal` é pública no domínio municipal e não passa pelo rewrite do sistema interno. |
| Identidade | Página municipal simulada, com marca institucional, cabeçalho, navegação, conteúdo central e rodapé próprios. |
| Transparência | Banner permanente e acesso principal para `/portal-transparencia`. A rota de transparência também fica pública no domínio municipal. |
| Notícias | Lista paginada e detalhe de notícias com status `Publicado` e data de publicação vencida. |
| Páginas institucionais | Lista e detalhe de páginas com status `Publicado`, usando o cadastro `PortalPage` já existente. |
| Dados institucionais | Leitura limitada de `Institution`: nome, endereço, cidade, UF, telefone, e-mail e site. |
| Processos | Link somente para avisos públicos redigidos em `/portal-protocolos`; não há abertura, acompanhamento individual ou envio de anexos. |
| Privacidade | Nenhum formulário público é inserido. O conteúdo é renderizado como texto, sem HTML administrativo e sem dados pessoais de RH. |

## Fonte de dados e publicação

O portal usa o cliente Prisma/Neon já empregado pelas rotas públicas existentes. As consultas selecionam apenas colunas necessárias e não carregam autor, servidor, CPF, documentos ou anexos.

- `PortalNews`: somente `status = "Publicado"` e `publishedAt <= agora`.
- `PortalPage`: somente `status = "Publicado"`.
- `Institution`: contato institucional mínimo.

Caso uma tabela pública ainda não esteja provisionada no Neon, a leitura trata somente os erros de tabela/coluna ausente como conteúdo vazio; falhas de conexão e demais erros continuam visíveis para correção. Essa proteção não substitui a sincronização do schema.

## Restrições preservadas

- O portal de Processos permanece de leitura de avisos publicados. O plano de Processos informa que a abertura externa está bloqueada até definição de identidade, LGPD, retenção, comunicação e responsáveis.
- Avisos de processos não são chamados de Diário Oficial nem recebem efeito jurídico.
- O Portal da Transparência não recebe cadastro funcional, dados bancários, saúde, afastamentos ou demonstrativos individuais de RH. A regra de RH/Folha limita a publicação a projeções agregadas, autorizadas e anonimizadas.
- Não foram acrescentados e-mail transacional, Turnstile, Gov.br, ICP-Brasil, OCR, URA ou outras integrações externas.

## Administração e operação

O cadastro interno de páginas institucionais continua em `Controle e Transparência > Páginas institucionais`. As URLs públicas seguem `/portal/{slug}`. O slug `noticias` fica reservado à rota pública de notícias, e a publicação ou exclusão revalida a home e a página afetada.

O formulário administrativo passa a declarar que o conteúdo é texto. A renderização pública não executa HTML salvo no cadastro.

## Verificação prevista

1. Confirmar que `/portal`, `/portal/noticias`, `/portal/noticias/{slug}` e `/portal/{slug}` respondem sem sessão no domínio municipal.
2. Confirmar a navegação para `/portal-transparencia` e `/portal-protocolos`.
3. Confirmar que rascunhos, notícias futuras e dados de autores não aparecem publicamente.
4. Executar `npm run build` antes do envio ao GitHub.
