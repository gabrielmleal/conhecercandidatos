---
name: oticas
description: Roda as três revisões vendadas, o verificador de texto e o espelho sobre os rascunhos que passaram nas caixas 1 a 6, um subagente por visão.
---

Rode numa sessão nova: a sessão que conduz relê todo o próprio contexto a cada turno.

1. `python3 -I scripts/oticas.py vendar` (ou `vendar fatos`, `vendar termos`) imprime a rodada (ex.: `20261011-1530`) e grava em `registros/lotes/<rodada>/` os lotes e um `pacote-NN-<visão>.md` por visão (`favor`, `contra`, `neutra`, `verificador` e `espelho`), cada um com a instrução e até 50 itens.
2. Numa única mensagem, abra um subagente novo (modelo `sonnet`) para cada pacote. Cada um lê só o próprio pacote e grava `resposta-NN-<visão>.json` ao lado dele, numa escrita só.
3. `python3 -I scripts/oticas.py juntar <rodada>` escreve a `revisao` e as caixas 7, 8 e 9 em cada rascunho.
4. Se houve desacordo: `python3 -I scripts/oticas.py desacordo <rodada>` grava os pacotes em `registros/lotes/<rodada>/opus/`. Repita o passo 2 lá com modelo `opus` e rode `juntar <rodada> opus`.

Nunca mostre a um subagente o arquivo de outro, a chave em `estado/vendas/` nem o rascunho original: a venda é o que garante que os dois candidatos recebem a mesma régua.
