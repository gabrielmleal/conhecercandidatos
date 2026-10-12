---
name: provar
description: Aplica as caixas 1 a 6, só com código, e guarda uma cópia de cada fonte no Internet Archive.
---

`python3 -I scripts/provar.py` passa por todos os `rascunhos/*.json` (ou só os caminhos que receber) e escreve em cada um `caixas`, `copias`, `hash` e `provado_em`.

| caixa | confere |
|---|---|
| 1 | toda fonte está em `dados/fontes.json` e não está em `fora` |
| 2 | a âncora é oficial ou checagem, ou há dois veículos de imprensa diferentes |
| 3 | o trecho está, palavra por palavra, na cópia guardada ou na página |
| 4 | todo número da frase está em algum trecho |
| 5 | não repete um fato já publicado ou já visto nesta rodada |
| 6 | nenhuma palavra de `dados/palavras-carregadas.txt` |

Não conserte um rascunho para ele passar: a caixa que falha leva o fato para a quarentena, e é lá que ele tem nova chance.
