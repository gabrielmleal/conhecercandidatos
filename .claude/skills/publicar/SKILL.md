---
name: publicar
description: Monta o site a partir de fatos/, roda o portão e a revisão jurídica e abre o pedido de mudança. Quem faz o merge é sempre o Gabriel.
---

`sh scripts/publicar.sh`.

1. Recusa entre 22/out 17h e 26/out 17h (silêncio do TSE). Retirar um fato com erro vale a qualquer hora, à mão.
2. Recusa se `estado/pausa` existe.
3. `scripts/montar.py` gera `site/dados.js`, uma página por fato, "O que mudou" e `status.json`.
4. `scripts/conferir.py` precisa imprimir `fatos que contam na nota sem âncora oficial ou dupla: 0`.
5. `scripts/juridico.py` precisa imprimir `fatos sem revisão jurídica válida: 0`.
6. Abre o pedido de mudança e para. Nunca faça merge nem envie nada direto para `main`: o site só muda quando o Gabriel aprova o pedido, e a Cloudflare publica em cerca de 30 segundos depois disso.
