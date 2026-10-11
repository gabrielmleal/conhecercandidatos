---
name: oticas
description: Roda as três revisões vendadas, o verificador de texto e o espelho sobre os rascunhos que passaram nas caixas 1 a 6, em lotes de até 10.
---

1. `python3 -I scripts/oticas.py vendar` imprime a rodada (ex.: `20261011-1530`) e grava `registros/lotes/<rodada>/lote-NN.json` e `espelho-NN.json`.
2. Para cada `lote-NN.json`, abra quatro subagentes novos (modelo `sonnet`), um por arquivo de `referencias/`: `favor`, `contra`, `neutra` e `verificador`. Cada um lê só a própria instrução e o lote, e grava `lote-NN-<nome>.json`.
3. Para cada `espelho-NN.json`, um subagente novo com `referencias/espelho.md` grava `espelho-NN-espelho.json`.
4. `python3 -I scripts/oticas.py juntar <rodada>` escreve a `revisao` e as caixas 7, 8 e 9 em cada rascunho.
5. Se houve desacordo: `python3 -I scripts/oticas.py desacordo <rodada>`, repita 2 e 3 em `registros/lotes/<rodada>/opus/` com modelo `opus`, e `juntar <rodada> opus`.

Nunca mostre a um subagente o arquivo de outro, a chave em `estado/vendas/` nem o rascunho original: a venda é o que garante que os dois candidatos recebem a mesma régua.
