---
name: ciclo
description: Uma rodada completa do robô, na ordem reavaliar, radar, investigar, provar, oticas, decidir e publicar.
---

Rode a partir da raiz do repositório, numa branch nova a partir de `main` atualizada.

1. Se `estado/pausa` existe, pare e conte ao Gabriel o que está escrito nele.
2. `reavaliar`: fatos vencidos e avisos de erro voltam para `rascunhos/`. Vem primeiro para nunca ficar sem cota.
3. `radar`: monta a fila de lacunas em `fila/lacunas.json`.
4. `investigar`: transforma itens da fila em rascunhos, sempre do lado e do tema com menos fatos primeiro.
5. `provar`: caixas 1 a 6.
6. `oticas`: caixas 7 a 9, em lotes de até 10.
7. `decidir`: publica, polêmico ou quarentena.
8. `publicar`: monta o site, confere e faz o merge.
9. Grave em `estado/status.json` a hora da rodada (`procurou_em`, horário de Brasília) e quantos fatos entraram, ficaram presos e saíram.

A cota do Claude Code é o único teto: quando ela acabar no meio, pare depois do passo que estiver rodando e publique o que já passou.
