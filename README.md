# Conhecer Candidatos

Código do site [conhecercandidatos.com.br](https://conhecercandidatos.com.br): fatos sobre os dois candidatos a presidente no 2º turno de 2026, cada um com a fonte oficial e a mesma régua para os dois.

O site não diz em quem votar e não aceita dinheiro de ninguém.

Responsável: Gabriel Martins Leal · contato@conhecercandidatos.com.br

## Como o site vai ao ar

`public/` é servido pela Cloudflare Workers com arquivos estáticos (`wrangler.jsonc`). Cada envio para `main` publica o site.
