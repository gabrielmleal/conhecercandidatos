import datetime
import hashlib
import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from regua import registrar, sem_titulo

RAIZ = pathlib.Path(__file__).resolve().parent.parent
LOTES = RAIZ / "registros/lotes"
PAGINAS = ["site/index.html", "site/como-funciona.html", "site/404.html", "site/app.js", "site/partilha.js", "scripts/montar.py"]
CARIMBO = RAIZ / "registros/juridico-paginas.json"
ACUSACAO = re.compile(r"\b(investiga\w*|inqu[ée]rito\w*|den[úu]nci\w*|acus\w*|r[ée]us?|indicia\w*|suspeit\w*|CPM?I|dela[çc]\w*)\b", re.I)
DESFECHO = re.compile(r"não é condenação|anula\w*|arquiva\w*|absolv\w*|rejeit\w*|tranca\w*|prescri\w*|encerr\w*", re.I)


def ler(p):
    return json.loads(p.read_text(encoding="utf-8"))


def gravar(p, dado):
    p.write_text(json.dumps(dado, ensure_ascii=False, indent=1), encoding="utf-8")


def marca(f):
    return hashlib.sha256(json.dumps([f["titulo"], f["frase"], f.get("classificacao", f["tipo"]), f["ancora"]["trecho"]], ensure_ascii=False).encode()).hexdigest()


def valida(f):
    j = f.get("juridica", {})
    return j.get("ok") is True and j.get("hash") == marca(f)


def pronto(caixas):
    return all(caixas.get(str(n)) for n in range(1, 10)) and "10" not in caixas


def item(f, caminho):
    return {"id": f["id"], "arquivo": str(caminho.relative_to(RAIZ)), "candidato": f["candidato"], "data": f["data"], "tipo": f.get("classificacao", f["tipo"]),
            "titulo": f["titulo"], "frase": f["frase"], "ancora": f["ancora"], "fontes": [{k: x.get(k) for k in ("veiculo", "link", "trecho")} for x in f.get("fontes", [])]}


def lotes(onde):
    if onde == "fatos":
        alvos = [p for p in sorted((RAIZ / "fatos").glob("*.json")) if not valida(ler(p))]
    else:
        alvos = [p for p in sorted((RAIZ / "rascunhos").glob("*.json")) if pronto(ler(p).get("caixas", {}))]
    rodada = "juridico-" + datetime.datetime.now().strftime("%Y%m%d-%H%M")
    pasta = LOTES / rodada
    pasta.mkdir(parents=True)
    itens = [item(ler(p), p) for p in alvos]
    for n in range(0, len(itens), 10):
        gravar(pasta / f"lote-{n // 10 + 1:02d}.json", itens[n:n + 10])
    print(rodada, len(itens), "itens em", (len(itens) + 9) // 10, "lotes")


def juntar(rodada):
    pasta = LOTES / rodada
    arquivos = {i["id"]: i["arquivo"] for p in sorted(pasta.glob("lote-??.json")) for i in ler(p)}
    respostas = {r["id"]: r for p in sorted(pasta.glob("lote-??-juridico.json")) for r in ler(p)}
    recusados = []
    for id_, arquivo in arquivos.items():
        if id_ not in respostas:
            continue
        caminho = RAIZ / arquivo
        f = ler(caminho)
        ok = respostas[id_]["ok"] is True
        f["juridica"] = {"ok": ok, "motivo": respostas[id_]["motivo"], "hash": marca(f), "em": datetime.date.today().isoformat()}
        if "caixas" in f and arquivo.startswith("rascunhos/"):
            f["caixas"]["10"] = ok
        gravar(caminho, f)
        if not ok:
            recusados.append(f"{id_}: {respostas[id_]['motivo']}")
        if not ok and arquivo.startswith("fatos/") and not (RAIZ / "rascunhos" / caminho.name).exists():
            caminho.unlink()
            registrar("mudancas.json", {"data": datetime.date.today().isoformat(), "id": id_, "titulo": sem_titulo(f), "o_que": "Retirado do site.", "motivo": "Na revisão jurídica, falhou no " + ", ".join(dict.fromkeys(m.lower() for m in re.findall(r"item \d+", respostas[id_]["motivo"], re.I)) or ["item 1"]) + " da lista de checagem da lei."})
    print(f"{len(respostas)} de {len(arquivos)} revisados, {len(recusados)} recusados")
    for r in recusados:
        print("  ", r)


def marca_paginas():
    return hashlib.sha256(b"".join((RAIZ / p).read_bytes() for p in PAGINAS)).hexdigest()


def carimbar(veredito, motivo):
    gravar(CARIMBO, {"ok": veredito == "ok", "motivo": motivo, "hash": marca_paginas(), "em": datetime.date.today().isoformat()})


def portao():
    fatos = [ler(p) for p in sorted((RAIZ / "fatos").glob("*.json"))]
    sem = [f["id"] for f in fatos if not valida(f)]
    nuas = [f["id"] for f in fatos if ACUSACAO.search(t := f["titulo"] + " " + f["frase"]) and not DESFECHO.search(t)]
    carimbo = ler(CARIMBO) if CARIMBO.exists() else {}
    paginas = carimbo.get("ok") is True and carimbo.get("hash") == marca_paginas()
    print(f"textos fixos do site com revisão jurídica válida: {'sim' if paginas else 'não'}")
    print(f"fatos sem revisão jurídica válida: {len(sem)}", *sem)
    print(f"acusações sem desfecho nem \"Investigação não é condenação.\": {len(nuas)}", *nuas)
    sys.exit(1 if sem or nuas or not paginas else 0)


if __name__ == "__main__":
    {"lotes": lambda: lotes(sys.argv[2] if len(sys.argv) > 2 else "rascunhos"), "juntar": lambda: juntar(sys.argv[2]), "paginas": lambda: carimbar(sys.argv[2], sys.argv[3])}.get(sys.argv[1] if len(sys.argv) > 1 else "", portao)()
