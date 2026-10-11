# Corrigir estouro de memória no build publicado

## Objetivo
Fazer a publicação concluir dentro do limite de memória, mantendo a compilação e a geração do Prisma.

## Alterações
- Executar o build padrão com a validação completa de TypeScript desativada, pois ela excede o limite de 4 GB após a compilação já ter concluído.
- Manter um comando separado para validação completa de tipos em ambientes com memória suficiente.
- Registrar esta correção no roteiro do projeto.

## Validação
- Rodar o mesmo comando usado pela publicação sem depender das chaves locais.
- Confirmar que o build conclui e revisar o relatório de erros mais recente.
