---
name: radar
description: Encontra onde faltam fatos e monta a fila de pesquisa, do buraco maior para o menor.
---

1. `python3 -I scripts/radar.py` grava `fila/lacunas.json`: cada célula candidato × tema × subtema × mandato com quantos fatos tem.
2. Comece pelas células com zero fato, alternando os dois candidatos para nenhum lado ficar com muito mais informação.
3. Para cada célula, procure na ordem: calendários de divulgação oficiais (IBGE, Banco Central, Tesouro), APIs da Câmara, do Senado, do TSE e do Diário Oficial, checagens das últimas 24 horas e, por último, busca na web (no máximo 10 buscas por rodada).
4. Grave cada achado em `fila/radar-<data>.json`, uma lista neste formato:

```json
[{"candidato": "flavio", "tema": "renda", "subtema": "precos", "titulo": "Inflação de 2021", "pistas": [{"veiculo": "IBGE", "data": "jan/2022", "titulo": "IPCA de dezembro", "link": "https://..."}]}]
```

`fila/` fica fora do repositório público: o que está nela ainda não foi provado.

Pesquisa eleitoral e Wikipedia nunca entram na fila.
