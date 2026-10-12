---
name: decidir
description: Aplica a régua às 10 caixas e move cada rascunho para fatos/ ou quarentena/.
---

`python3 -I scripts/regua.py decidir`.

- 10 de 10 caixas e as três revisões com o mesmo tipo: publica com esse tipo.
- 10 de 10 com tipos diferentes: publica como polêmico, valendo zero.
- Qualquer caixa falhando: quarentena, com nova chance nas próximas 24 horas. Depois de 7 dias é descartado e só a contagem aparece em "O que mudou".

`quarentena/` fica fora do repositório público: fato que falhou nunca aparece em lugar nenhum.

Se mais de 30% dos fatos da rodada falharem, o script cria `estado/pausa` e a publicação para até o Gabriel ler o motivo.
