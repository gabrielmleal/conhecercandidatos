---
name: ciclo
description: Uma rodada completa do robô, na ordem reavaliar, radar, investigar, provar, oticas, juridico, decidir e publicar.
---

Rode a partir da raiz do repositório, numa branch nova a partir de `main` atualizada.

1. Se `estado/pausa` existe, pare e conte ao Gabriel o que está escrito nele.
2. `reavaliar`: fatos vencidos e avisos de erro voltam para `rascunhos/`. Vem primeiro para nunca ficar sem cota.
3. `radar`: monta a fila de lacunas em `fila/lacunas.json`.
4. `investigar`: transforma itens da fila em rascunhos, sempre do lado e do tema com menos fatos primeiro.
5. `provar`: caixas 1 a 6.
6. `oticas`: caixas 7 a 9, um subagente por visão.
7. `juridico`: caixa 10, a revisão jurídica.
8. `decidir`: publica, polêmico ou quarentena.
9. `publicar`: monta o site, confere e abre o pedido de mudança. O merge é sempre do Gabriel.
10. Grave em `estado/status.json` a hora da rodada (`procurou_em`, horário de Brasília) e quantos fatos entraram, ficaram presos e saíram.

A rotina `trig_01P3oxRRGb3eEvdcoyJ3CpMT` do Claude Code roda esta skill a cada 2 horas, no minuto 12 (cron `12 */2 * * *`, UTC), e não faz nada a partir de 22/10/2026 às 17h, horário de Brasília.

A cota do Claude Code é o único teto: quando ela acabar no meio, pare depois do passo que estiver rodando e publique o que já passou.
