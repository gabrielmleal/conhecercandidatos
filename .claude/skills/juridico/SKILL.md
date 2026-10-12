---
name: juridico
description: Revisão jurídica de todo pedido de mudança (caixa 10). Confere cada fato novo ou mudado e os textos fixos do site contra a lista de checagem da lei, antes de o Gabriel aprovar.
---

Vale para todo pedido de mudança, da rotina ou feito à mão. O portão (`python3 -I scripts/juridico.py`) reprova o pedido se faltar a revisão.

## Fatos

1. `python3 -I scripts/juridico.py lotes` grava `registros/lotes/juridico-<rodada>/lote-NN.json` com os rascunhos que passaram nas caixas 1 a 9. `lotes fatos` faz o mesmo com os fatos publicados sem carimbo válido, como os que alguém mudou à mão.
2. Para cada lote, abra um subagente novo (modelo `opus`) que lê só `referencias/checklist.md` e o lote, e grava `lote-NN-juridico.json` na mesma pasta.
3. `python3 -I scripts/juridico.py juntar <rodada>` grava em cada fato o carimbo `juridica` (ok, motivo, hash do texto, data) e, nos rascunhos, a caixa 10. Fato publicado que a revisão recusa sai do site na hora, e "O que mudou" mostra o número do item da lista. Se uma correção dele já está em `rascunhos/`, ele fica até a correção passar pela régua.

## Textos fixos do site

Se o pedido muda `site/index.html`, `site/como-funciona.html`, `site/404.html`, `site/app.js`, `site/partilha.js` ou `scripts/montar.py`, abra um subagente novo (modelo `opus`) com `referencias/checklist.md` e o `git diff origin/main` desses arquivos. Ele responde `ok` ou `nao` e o motivo; grave com `python3 -I scripts/juridico.py paginas <ok|nao> "<motivo>"`.

## Regras

- Nunca conserte um texto para ele passar. Rascunho recusado vai para a quarentena pela régua. Fato publicado recusado é corrigido à mão, num pedido de mudança próprio, e passa de novo pelas 10 caixas.
- Nunca escreva o carimbo sem o subagente ter lido: o motivo dele fica gravado no fato e aparece no pedido de mudança.
- Os dois candidatos recebem a mesma lista, com o mesmo rigor.
