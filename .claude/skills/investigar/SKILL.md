---
name: investigar
description: Transforma itens da fila (notícias ou pontos do mapa) em rascunhos de fato com âncora oficial e trecho literal, gravados em rascunhos/.
---

Leia `referencias/regra-ancora.md`, `dados/temas.json` e `dados/fontes.json` antes de começar.

Para cada item da fila que receber:

1. Separe afirmações curtas: quem, o quê, quando e qual número. Um item pode virar zero, uma ou várias afirmações.
2. Procure a âncora oficial na web. Leia a página com `python3 -I scripts/texto.py <link>` e copie dali o `trecho` literal; confira com `python3 -I scripts/texto.py <link> "<trecho>"`, que precisa responder `ACHOU`. Nunca escreva um trecho de memória.
3. Se achar, grave `rascunhos/<id>.json`. Se não achar em 3 buscas, grave `rascunhos/sem-ancora/<id>.json` com `motivo`.
4. Trate os dois candidatos com o mesmo esforço e o mesmo jeito de escrever.
5. Acusação, investigação, prisão ou condenação: escreva no título ou na frase quem acusa e o desfecho conhecido até hoje (em andamento, arquivada, anulada, absolvição, pena cumprida), e ponha a fonte do desfecho em `fontes`, com trecho. Condenação anulada nunca aparece só como condenação. Acusação sem julgamento final termina com "Investigação não é condenação."

Formato do rascunho:

```json
{
  "id": "flavio-renda-precos-01",
  "origem": "mapa:flavio-eco-2",
  "candidato": "flavio",
  "tema": "renda",
  "subtema": "precos",
  "lente": "fez",
  "data": "2022-01-11",
  "titulo": "Inflação de 2021 fecha em 10,06%",
  "frase": "A inflação oficial de 2021, medida pelo IPCA, foi de 10,06%, segundo o IBGE.",
  "tipo": "problema",
  "peso": 2,
  "marco": false,
  "para_quem": [],
  "ancora": {"orgao": "IBGE", "documento": "IPCA de dezembro de 2021", "link": "https://...", "trecho": "..."},
  "fontes": [{"veiculo": "Folha de S.Paulo", "nivel": "C", "link": "https://...", "trecho": "..."}]
}
```

`lente`: `fez`, `prometeu`, `disse` ou `votou`. `data`: `AAAA-MM-DD` ou `AAAA-MM`, do resultado medido ou do ato oficial. `para_quem`: chaves de `dados/grupos.json` que o trecho nomeia ou descreve como atingidos, para o bem ou para o mal; lista vazia quando não diz. `marco`: posse, eleição, crise nacional oficial, lei ou emenda nacional, decisão de tribunal superior sobre candidato, família ou aliado, ou recorde em série oficial.

Você escreve rascunhos e nunca os aprova: quem julga são as óticas, em sessões separadas.
