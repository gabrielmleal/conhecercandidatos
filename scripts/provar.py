import datetime
import difflib
import hashlib
import json
import pathlib
import re
import sys
import time
import urllib.parse

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from texto import baixar, contem, copia, normalizar, pegar, texto_de

RAIZ = pathlib.Path(__file__).resolve().parent.parent
FONTES = json.loads((RAIZ / "dados/fontes.json").read_text(encoding="utf-8"))
CARREGADAS = [p for p in (RAIZ / "dados/palavras-carregadas.txt").read_text(encoding="utf-8").split("\n") if p]


def nivel(link):
    partes = urllib.parse.urlsplit(link)
    host = (partes.hostname or "").removeprefix("www.")
    caminho = host + partes.path

    def casa(dominio):
        return caminho.startswith(dominio) if "/" in dominio else host == dominio or host.endswith("." + dominio)

    if any(casa(d) for d in FONTES["fora"]["dominios"]):
        return "fora"
    if any(host.endswith(s) for s in FONTES["A"]["sufixos"]) or any(casa(d) for d in FONTES["A"]["dominios"]):
        return "A"
    for n in "BCD":
        if any(casa(d) for d in FONTES[n]["dominios"]):
            return n
    return None


def numeros(texto):
    achados = set()
    for n in re.findall(r"\d+(?:[.,]\d+)*", texto):
        n = re.sub(r"\.(?=\d{3}(?:\D|$))", "", n)
        if not re.fullmatch(r"(19|20)\d\d", n):
            achados.add(n)
    return achados


def guardar(link):
    try:
        pegar("https://web.archive.org/save/" + link, 120)
        time.sleep(5)
    except Exception:
        pass
    try:
        resposta = json.loads(pegar("https://archive.org/wayback/available?url=" + urllib.parse.quote(link, safe=""), 60)[0])
        return resposta["archived_snapshots"]["closest"]["url"]
    except Exception:
        return None


def ler_pagina(link):
    try:
        return texto_de(*baixar(link))
    except Exception:
        return ""


def trecho_existe(link, trecho, guardada):
    if guardada:
        try:
            if contem(texto_de(*pegar(guardada.replace("/http", "id_/http", 1), 90)), trecho):
                return True
        except Exception:
            pass
    return contem(ler_pagina(link), trecho)


def parecidos(a, b):
    return difflib.SequenceMatcher(None, normalizar(a), normalizar(b)).ratio() >= 0.85


def provar(caminho, outros):
    rascunho = json.loads(caminho.read_text(encoding="utf-8"))
    ancora, fontes = rascunho["ancora"], rascunho.get("fontes", [])
    links = [ancora["link"]] + [f["link"] for f in fontes]
    copias = {link: guardar(link) for link in links}
    trechos = [ancora["trecho"]] + [f["trecho"] for f in fontes if f.get("trecho")]
    texto = rascunho["titulo"] + " " + rascunho["frase"]
    caixas = {
        "1": all(nivel(link) in ("A", "B", "C", "D") for link in links),
        "2": nivel(ancora["link"]) in ("A", "B") or len({f["veiculo"] for f in fontes if nivel(f["link"]) == "C"}) >= 2,
        "3": all(trecho_existe(link, t, copias.get(link)) for link, t in [(ancora["link"], ancora["trecho"])] + [(f["link"], f["trecho"]) for f in fontes if f.get("trecho")]),
        "4": numeros(texto) <= numeros(" ".join(trechos)),
        "5": not any(o["candidato"] == rascunho["candidato"] and (parecidos(o["frase"], rascunho["frase"]) or (o["ancora"]["link"] == ancora["link"] and numeros(o["frase"]) == numeros(rascunho["frase"]))) for o in outros if o["id"] != rascunho["id"]),
        "6": not any(re.search(r"(?<!\w)" + re.escape(normalizar(p)) + r"(?!\w)", normalizar(texto)) for p in CARREGADAS),
    }
    rascunho.update({"caixas": caixas, "copias": copias, "hash": hashlib.sha256(normalizar(ancora["trecho"]).encode()).hexdigest(), "provado_em": datetime.date.today().isoformat()})
    caminho.write_text(json.dumps(rascunho, ensure_ascii=False, indent=1), encoding="utf-8")
    return rascunho


if __name__ == "__main__":
    caminhos = [pathlib.Path(c) for c in sys.argv[1:]] or sorted((RAIZ / "rascunhos").glob("*.json"))
    outros = [json.loads(p.read_text(encoding="utf-8")) for p in sorted((RAIZ / "fatos").glob("*.json"))]
    vistos = []
    for caminho in caminhos:
        r = provar(caminho, outros + vistos)
        vistos.append(r)
        falhas = [k for k, v in r["caixas"].items() if not v]
        print(f"{r['id']}: {'ok' if not falhas else 'falhou ' + ','.join(falhas)}")
