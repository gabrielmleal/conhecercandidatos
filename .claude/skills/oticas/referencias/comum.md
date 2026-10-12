# Régua comum

Cada item do lote é um fato ou uma definição de dicionário. Nomes de pessoas, partidos, programas e anos foram trocados por rótulos (`Pessoa K`, `Partido B`, `ano C`). Não tente descobrir quem é: julgue só o que está escrito.

## Tipo de um fato

| tipo | quando |
|---|---|
| positivo | já aconteceu e melhorou, com número |
| problema | já aconteceu e piorou, com número; condenação; investigação formal aberta |
| polemico | efeito não medido, prova em disputa, acusação sem investigação aberta, caso arquivado ou anulado |
| contexto | informação sem lado bom ou ruim |
| promessa | ainda não aconteceu |

Peso 2: dado oficial, lei ou ato oficial com efeito direto, orçamento oficial, decisão de tribunal. Peso 1: balanço do próprio governo ou partido, pesquisa privada, investigação formal sem julgamento. Polêmico, contexto e promessa têm peso 0.

## O que conferir em todo fato

- A `frase` e o `titulo` dizem só o que os `trechos` dizem. Nenhum número, data ou causa a mais.
- O `documento` é o nome da fonte. Ele apoia o nome do programa, da série, da comissão ou do plano citado na frase. Número, data e causa só valem se estiverem nos `trechos`.
- Nenhum adjetivo de juízo. Acusação sem julgamento termina com "Investigação não é condenação."

Tipo e peso não entram no `confere`. O `tipo_proposto` e o `peso_proposto` são só a sugestão de quem escreveu. Dê o tipo e o peso que a tabela manda nos seus campos `tipo` e `peso`: o site usa os seus.

## Definição de dicionário

Confere quando explica o termo em palavra comum, em até 40 palavras, sem tomar lado. Use `"tipo": "definicao"` e `"peso": 0`.

## Saída

Grave um arquivo JSON com uma lista, um objeto por item, na ordem do lote:

```json
[{"rotulo": "F4821", "confere": true, "certeza": 0.95, "tipo": "problema", "peso": 2, "motivo": "até 25 palavras"}]
```

`confere` é `true` só quando você publicaria o título e a frase exatamente como estão. `certeza` vai de 0 a 1: use 0,9 ou mais quando não vê problema concreto, e abaixo disso só quando consegue apontar o problema no `motivo`. `tipo` e `peso` são os que VOCÊ daria, mesmo quando discorda do proposto.
