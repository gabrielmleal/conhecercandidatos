# Regra da âncora

Um fato só entra se chega a um registro oficial. Vale uma destas três:

1. Documento de domínio oficial (nível A em `dados/fontes.json`): IBGE, Banco Central, Diário Oficial, Planalto, Câmara, Senado, TSE, STF, STJ, TCU, CGU, Tesouro, Inpe, Inep, ministérios, ONU e FAO.
2. Checagem publicada por agência de nível B.
3. Dois veículos de nível C independentes que digam de onde tiraram o dado.

Nunca é fonte: Wikipedia, sites de resumo escolar, perfis em rede social, vídeos sem origem, texto feito por IA. Pesquisa eleitoral nunca entra.

Site de partido ou de candidato (nível D) só serve para a lente `prometeu` ou `disse`, e mesmo assim a âncora é o registro oficial (o plano de governo no TSE, a nota taquigráfica, o Diário Oficial).

## O trecho

`trecho` é uma cópia literal da página da âncora: as mesmas palavras, na mesma ordem, de 1 a 3 frases. Todo número da `frase` tem que aparecer no `trecho` da âncora ou no de uma fonte. Se o número da página for diferente do que você lembra, vale o da página.

## Tipo e peso

| tipo | quando |
|---|---|
| positivo | já aconteceu e melhorou, com número |
| problema | já aconteceu e piorou, com número; condenação; investigação formal aberta |
| polemico | efeito não medido, prova em disputa, acusação sem investigação aberta, caso arquivado ou anulado |
| contexto | informação sem lado bom ou ruim |
| promessa | ainda não aconteceu |

Peso 2: dado oficial, lei ou ato oficial com efeito direto, orçamento oficial, decisão de tribunal. Peso 1: balanço do próprio governo ou partido, pesquisa privada, investigação formal sem julgamento.

## Temas sensíveis

Acusação, investigação ou fato de familiar só entra com documento de órgão de Justiça ou de investigação, e a `frase` termina com "Investigação não é condenação." quando não houve julgamento final, ou com "Não há condenação válida." quando a condenação foi anulada ou a acusação inteira foi arquivada. Parente sem cargo público só entra quando um documento oficial o cita diretamente.

## Quem responde por quê

Flávio responde pelo governo Jair Bolsonaro (2019–2022), pela própria conduta, pela família e pelos aliados. Lula responde pelos governos 2003–2010 e 2023–2026, pela própria conduta, pela família e pelos aliados. Dilma e Temer (2011–2018) não entram.

## A frase

Até 30 palavras, sem adjetivo de juízo, sem palavra de `dados/palavras-carregadas.txt`. Diz quem, o quê, quando e qual número. O mesmo jeito de escrever vale para os dois candidatos.
