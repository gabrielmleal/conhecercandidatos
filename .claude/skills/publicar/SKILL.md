---
name: publicar
description: Monta o site a partir de fatos/, roda o portão e faz o merge na main, que a Cloudflare publica sozinha.
---

`sh scripts/publicar.sh`.

1. Recusa entre 22/out 17h e 26/out 17h (silêncio do TSE). Retirar um fato com erro vale a qualquer hora, à mão.
2. Recusa se `estado/pausa` existe.
3. `scripts/montar.py` gera `site/dados.js`, uma página por fato, "O que mudou" e `status.json`.
4. `scripts/conferir.py` precisa imprimir `fatos que contam na nota sem âncora oficial ou dupla: 0`.
5. Abre o pedido de mudança, faz o merge e volta para `main`. A Cloudflare publica em cerca de 30 segundos.
