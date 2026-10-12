import datetime
import html
import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from links import onde_ler, registro

RAIZ = pathlib.Path(__file__).resolve().parent.parent
SITE = RAIZ / "site"
CURTO = {"renda": "Emprego", "contas": "Contas", "social": "Proteção", "educacao": "Educação", "saude": "Saúde", "seguranca": "Segurança", "ambiente": "Ambiente", "producao": "Produção", "obras": "Obras", "democracia": "Democracia", "mundo": "Mundo", "aliados": "Aliados", "candidato": "Quem é"}
QUEM = {"flavio": "F", "lula": "L", "brasil": "BR"}
TIPO = {"positivo": "pos", "problema": "neg", "polemico": "pol", "contexto": "ctx", "promessa": "pro"}
EXPLICA = {"positivo": "algo que melhorou, mostrado por um número", "problema": "algo que piorou, uma condenação ou uma investigação aberta", "polemico": "o efeito ou a prova ainda estão em disputa", "contexto": "informação sem lado bom ou ruim", "promessa": "o que ainda não aconteceu"}
BRT = datetime.timezone(datetime.timedelta(hours=-3))
LIDOS = registro()


def ler(pasta):
    return [json.loads(p.read_text(encoding="utf-8")) for p in sorted((RAIZ / pasta).glob("*.json"))]


def marcar(frase, formas):
    usados = []
    for forma in sorted(formas, key=len, reverse=True):
        achado = re.search(r"(?<![\w-])" + re.escape(forma) + r"(?![\w-])", frase, re.I)
        if achado and formas[forma] not in [c for _, _, c in usados] and not any(a < achado.end() and achado.start() < b for a, b, _ in usados):
            usados.append((achado.start(), achado.end(), formas[forma]))
    for a, b, chave in sorted(usados, reverse=True):
        frase = frase[:a] + f"[[{chave}|{frase[a:b]}]]" + frase[b:]
    return frase


def peso(fato):
    return {"positivo": fato["peso"], "problema": -fato["peso"]}.get(fato["tipo"], 0)


def data_br(iso):
    return datetime.date.fromisoformat(iso[:10]).strftime("%d/%m/%Y")


def data_fato(d):
    return {4: d, 7: f"{d[5:7]}/{d[:4]}"}.get(len(d)) or data_br(d)


def fonte(fato):
    return onde_ler(fato["ancora"]["link"], fato["ancora"]["trecho"], LIDOS) or fato["ancora"]["link"]


def outras(fato):
    achadas = [(f["veiculo"], link) for f in fato.get("fontes", []) if (link := onde_ler(f["link"], f.get("trecho", ""), LIDOS))]
    nomes = [v for v, _ in achadas]
    return [(f"{v} ({nomes[:i + 1].count(v)})" if nomes.count(v) > 1 else v, link) for i, (v, link) in enumerate(achadas)]


def para_site(fato, formas):
    return {
        "id": fato["id"], "c": QUEM[fato["candidato"]], "t": fato.get("tema"), "s": fato.get("subtema"), "d": fato["data"],
        "mk": 2 if fato["candidato"] == "brasil" and fato.get("marco") else 1 if fato.get("marco") else 0,
        "tipo": TIPO[fato["tipo"]], "w": peso(fato), "tit": fato["titulo"], "txt": marcar(fato["frase"], formas),
        "orgao": fato["ancora"]["orgao"], "doc": fato["ancora"].get("documento", ""), "link": fonte(fato), "arq": int("web.archive.org" in fonte(fato)),
        "fontes": outras(fato), "conf": data_br(fato["conferido_em"]), "g": fato.get("para_quem", []),
    }


def pagina(titulo, corpo, descricao, raiz=""):
    return f"""<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(titulo)} | Conhecer Candidatos</title>
<meta name="description" content="{html.escape(descricao)}">
<meta property="og:title" content="{html.escape(titulo)}">
<meta property="og:description" content="{html.escape(descricao)}">
<meta property="og:site_name" content="Conhecer Candidatos">
<link rel="stylesheet" href="{raiz}estilo.css">
</head>
<body>
<main class="pagina">
<div class="topo"><a class="voltar" href="{raiz}index.html">← Conhecer Candidatos</a><button class="partilha" data-share="1">Compartilhar</button></div>
<p class="meta">Feito com IA, pode conter erros. <a href="{raiz}como-funciona.html">Como funciona</a></p>
{corpo}
</main>
<script src="{raiz}partilha.js"></script>
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{{"token": "6ed43d34957a49fcb90ec8e43f7db523"}}'></script>
</body>
</html>
"""


def pagina_fato(fato, temas):
    nome = {"flavio": "Flávio Bolsonaro", "lula": "Lula", "brasil": "Brasil"}[fato["candidato"]]
    onde = f"{temas[fato['tema']]['nome']} › {temas[fato['tema']]['subtemas'][fato['subtema']]}" if fato.get("tema") else "Linha do tempo"
    fontes = "".join(f'<li><a href="{html.escape(link)}" rel="noopener">{html.escape(veiculo)}</a></li>' for veiculo, link in outras(fato))
    erro = f"mailto:contato@conhecercandidatos.com.br?subject=Apontar%20erro%3A%20{fato['id']}"
    corpo = f"""<script>location.replace("../#f={fato['id']}")</script>
<p class="meta">{html.escape(nome)} · {html.escape(onde)} · {data_fato(fato['data'])}</p>
<h1>{html.escape(fato['titulo'])}</h1>
<p>{html.escape(fato['frase'])}</p>
<p><b>{html.escape(fato['tipo'].replace('polemico', 'polêmico').capitalize())}</b>: {EXPLICA[fato['tipo']]}</p>
<h2>Fonte oficial</h2>
<p><a href="{html.escape(fonte(fato))}" rel="noopener">{html.escape(fato['ancora']['orgao'])}{', ' + html.escape(fato['ancora'].get('documento', '')) if fato['ancora'].get('documento') else ''}{' (cópia arquivada)' if 'web.archive.org' in fonte(fato) else ''}</a></p>
<blockquote>{html.escape(fato['ancora']['trecho'])}</blockquote>
{'<h2>Outras fontes</h2><ul>' + fontes + '</ul>' if fontes else ''}
<p class="meta">Conferido em {data_br(fato['conferido_em'])}. Próxima conferência até {data_br(fato['reavaliar_em'])}. Versão {fato['versao']}.</p>
<p><a class="ir" href="../#f={fato['id']}">Ver mais fatos</a></p>
<p><a href="{erro}">Apontar erro neste fato</a></p>"""
    return pagina(fato["titulo"], corpo, fato["frase"] + " Feito com IA, pode conter erros.", "../")


def o_que_mudou(mudancas, descartados):
    linhas = "".join(f"<li><b>{data_br(m['data'])}</b>: {html.escape(m['titulo'])}. {html.escape(m['o_que'])} Motivo: {html.escape(m['motivo'])}</li>" for m in mudancas) or "<li>Nada mudou desde a abertura do site.</li>"
    fora = "".join(f"<li>{html.escape(d['titulo'])}: {html.escape(d['motivo'])}</li>" for d in descartados) or "<li>Nenhum fato descartado até agora.</li>"
    corpo = f"<h1>O que mudou</h1><p>Fatos corrigidos ou retirados, com data e motivo.</p><h2>Correções e retiradas</h2><ul>{linhas}</ul><h2>Fatos recusados depois de 7 dias em quarentena</h2><ul>{fora}</ul>"
    return pagina("O que mudou", corpo, "Fatos corrigidos, retirados e recusados, com data e motivo.")


def montar():
    temas = json.loads((RAIZ / "dados/temas.json").read_text(encoding="utf-8"))
    dicionario = json.loads((RAIZ / "dados/dicionario.json").read_text(encoding="utf-8"))
    termos = {k: v for k, v in dicionario.items() if v.get("aprovado")}
    formas = {f: k for k, v in termos.items() for f in [k] + v.get("formas", [])}
    fatos = ler("fatos")
    status = json.loads((RAIZ / "estado/status.json").read_text(encoding="utf-8")) if (RAIZ / "estado/status.json").exists() else {}
    agora = datetime.datetime.now(BRT).isoformat(timespec="minutes")
    conferido = status.get("procurou_em", agora)
    dados = {
        "conferido": conferido,
        "temas": {k: {"nome": v["nome"], "curto": CURTO[k], "governo": v["governo"], "subtemas": v["subtemas"]} for k, v in temas.items()},
        "grupos": json.loads((RAIZ / "dados/grupos.json").read_text(encoding="utf-8")),
        "fatos": [para_site(f, formas) for f in fatos],
        "termos": {k: [v["nome"], marcar(v["definicao"], {f: t for f, t in formas.items() if t != k})] for k, v in termos.items()},
    }
    (SITE / "dados.js").write_text("window.DADOS=" + json.dumps(dados, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    (SITE / "fato").mkdir(exist_ok=True)
    for velho in (SITE / "fato").glob("*.html"):
        velho.unlink()
    for fato in fatos:
        (SITE / "fato" / f"{fato['id']}.html").write_text(pagina_fato(fato, temas), encoding="utf-8")
    mudancas = json.loads((RAIZ / "registros/mudancas.json").read_text(encoding="utf-8")) if (RAIZ / "registros/mudancas.json").exists() else []
    descartados = json.loads((RAIZ / "registros/descartados.json").read_text(encoding="utf-8")) if (RAIZ / "registros/descartados.json").exists() else []
    (SITE / "o-que-mudou.html").write_text(o_que_mudou(mudancas, descartados), encoding="utf-8")
    (SITE / "status.json").write_text(json.dumps({**status, "procurou_em": conferido, "fatos": len(fatos)}, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{len(fatos)} fatos, {len(termos)} termos")


if __name__ == "__main__":
    montar()
