# Lista de checagem da lei

Leitura feita pelo Claude em 11/10/2026, antes de o site abrir. Não é parecer de advogado. Cada item traz o artigo, o que o site faz e como conferir.

| # | Regra | Artigo | O que o site faz | Como conferir | Passou |
|---|---|---|---|---|---|
| 1 | Manifestação espontânea de pessoa natural não é propaganda eleitoral | Res. TSE 23.610/2019, art. 28, §6º | Site de uma pessoa, Gabriel Martins Leal, sem dinheiro de ninguém, sem anúncio e sem ligação com candidato ou partido | `whois -h whois.registro.br conhecercandidatos.com.br` mostra titular pessoa física | sim |
| 2 | Pessoa natural pode manter site sem comunicar à Justiça Eleitoral, desde que não pague impulsionamento | Lei 9.504/1997, art. 57-B, IV, b, e §1º | Nenhum impulsionamento pago | Conta da Cloudflare e do GitHub sem cobrança | sim |
| 3 | Propaganda paga na internet é proibida | Lei 9.504/1997, art. 57-C | Não aceita dinheiro, não tem anúncio | "Como funciona", seção "O que este site não faz" | sim |
| 4 | Anonimato é proibido na campanha | Lei 9.504/1997, art. 57-D | Responsável e contato@ no "Como funciona"; contato@ também em "Apontar erro", em todo fato | `grep -c "Gabriel Martins Leal" site/como-funciona.html` | sim |
| 5 | Conteúdo feito com IA precisa de aviso | Res. TSE 23.755/2026, art. 9º-B | "Feito com IA, pode conter erros" no topo de toda página | `scripts/conferir.py`, linha "páginas sem o aviso de IA: 0" | sim |
| 6 | IA aberta ao público não pode recomendar voto | Res. TSE 23.755/2026, art. 28, §1º-C | O site não tem conversa com IA; nenhum texto pede voto | `scripts/conferir.py`, linha "textos que pedem voto: 0" | sim |
| 7 | Conteúdo sintético com imagem ou voz de candidato é proibido de 72 horas antes a 24 horas depois da votação | Res. TSE 23.755/2026, art. 9º-B, §3º-A | Não usa imagem nem voz de candidato; por escolha própria, não publica nada novo de 22/10 17h a 26/10 17h | `scripts/publicar.sh` recusa nessa janela | sim |
| 8 | Pesquisa eleitoral só pode ser divulgada com registro | Lei 9.504/1997, art. 33 | Nenhuma pesquisa eleitoral entra | `scripts/conferir.py`, linha "fatos com pesquisa eleitoral: 0" | sim |
| 9 | Direito de resposta | Lei 9.504/1997, art. 57-D e art. 58 | "Apontar erro" em todo fato e contato@ no "Como funciona"; o fato é reconferido na rodada seguinte e a correção aparece em "O que mudou" | `site/o-que-mudou.html` | sim |
| 10 | Fato ofensivo sem prova expõe quem mantém o site | Constituição, art. 5º, IV e V | Todo fato que conta na nota chega a um documento oficial ou a dois veículos; investigação sem julgamento termina com "Investigação não é condenação." | `scripts/conferir.py`, linha "sem âncora oficial ou dupla: 0"; óticas, `referencias/comum.md` | sim |

Fontes: texto da Lei 9.504/1997 em planalto.gov.br/ccivil_03/leis/l9504.htm, lido em 11/10/2026; resoluções do TSE conferidas no plano do projeto em 11/10/2026.
