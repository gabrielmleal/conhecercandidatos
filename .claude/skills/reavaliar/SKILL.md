---
name: reavaliar
description: Devolve para a esteira os fatos publicados há 7 dias ou mais e os que receberam aviso de erro.
---

1. `python3 -I scripts/regua.py voltar` traz de volta da quarentena o que entrou há menos de 24 horas e descarta o que está lá há 7 dias ou mais; só a contagem dos descartados fica pública.
2. Leia os avisos de erro recebidos em contato@ e anote o `id` de cada fato citado.
3. `python3 -I scripts/vencidos.py <id> <id> ...` copia para `rascunhos/` os vencidos e os citados, marcados com `reavaliando`. Junte aos citados até 20 fatos publicados que ainda não têm o campo `para_quem`: `grep -L '"para_quem"' fatos/*.json | head -20 | xargs -n1 basename | sed 's/\.json$//'`.

Aviso de erro nunca retira um fato sozinho: ele só força a reconferência. O fato sai do site apenas se falhar numa das 10 caixas, e a saída fica registrada em "O que mudou".
