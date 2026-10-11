import concurrent.futures
import datetime
import hashlib
import json
import pathlib
import sys
import urllib.parse

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from texto import contem, pegar, texto_de

RAIZ = pathlib.Path(__file__).resolve().parent.parent
REGISTRO = RAIZ / "estado/links.json"
ABRE = ("mostra o trecho", "abre", "navegador mostra o trecho")


def chave(link, trecho):
    return link + "#" + hashlib.sha1(trecho.encode()).hexdigest()[:8]


def pagina(texto, trecho):
    paginas = texto.split("\f")
    for juntas in (1, 2):
        for i in range(len(paginas)):
            if contem(" ".join(paginas[i:i + juntas]), trecho):
                return i + 1


def ler(link, trecho):
    conteudo, tipo = pegar(link, 90 if "archive.org" in link else 30)
    texto = texto_de(conteudo, tipo)
    pdf = conteudo[:4] == b"%PDF" or "pdf" in tipo
    if not trecho:
        return {"estado": "abre", "pdf": pdf}
    if not contem(texto, trecho):
        return {"estado": "sem o trecho", "pdf": pdf}
    return {"estado": "mostra o trecho", "pdf": pdf, **({"pagina": pagina(texto, trecho)} if pdf else {})}


def conferir(item):
    link, trecho, copia = item
    try:
        resultado = ler(link, trecho)
    except Exception as erro:
        resultado = {"estado": "nao abre", "erro": str(getattr(erro, "code", "") or erro)[:80]}
    if resultado["estado"] not in ABRE and copia:
        try:
            achado = ler(copia.replace("/http", "id_/http", 1), trecho)
            resultado.update({"copia": copia.replace("http://", "https://", 1), "copia_estado": achado["estado"], "pdf": achado["pdf"], **({"pagina": achado["pagina"]} if "pagina" in achado else {})})
        except Exception:
            resultado.update({"copia": copia, "copia_estado": "nao abre"})
    return item, resultado


def destaque(trecho):
    palavras = trecho.split()
    while palavras and not any(c.isalnum() for c in palavras[-1]):
        palavras.pop()
    pedaco = lambda p: urllib.parse.quote(" ".join(p), safe="").replace("-", "%2D")
    return ":~:text=" + (pedaco(palavras) if len(palavras) <= 8 else pedaco(palavras[:4]) + "," + pedaco(palavras[-4:]))


def onde_ler(link, trecho, registro):
    visto = registro.get(chave(link, trecho), {})
    base = link if visto.get("estado") in ABRE else visto.get("copia") if visto.get("copia_estado") in ABRE else None
    if not base or not trecho:
        return base
    if visto.get("pdf"):
        return base + (f"#page={visto['pagina']}" if visto.get("pagina") else "")
    return base + ("" if "#" in base else "#") + destaque(trecho)


def registro():
    return json.loads(REGISTRO.read_text(encoding="utf-8")) if REGISTRO.exists() else {}


def itens(r):
    copias = r.get("copias") or {}
    yield r["ancora"]["link"], r["ancora"]["trecho"], copias.get(r["ancora"]["link"])
    for f in r.get("fontes", []):
        yield f["link"], f.get("trecho", ""), copias.get(f["link"])


if __name__ == "__main__":
    pastas = sys.argv[1:] or ["fatos"]
    visto = registro()
    todos = {item for pasta in pastas for p in sorted((RAIZ / pasta).glob("*.json")) for item in itens(json.loads(p.read_text(encoding="utf-8")))}
    novos = [item for item in todos if visto.get(chave(*item[:2]), {}).get("estado") not in ABRE or "pdf" not in visto[chave(*item[:2])]]
    hoje = datetime.date.today().isoformat()
    with concurrent.futures.ThreadPoolExecutor(8) as grupo:
        for item, resultado in grupo.map(conferir, novos):
            antes = visto.get(chave(*item[:2]), {})
            manual = {"estado": antes["estado"]} if antes.get("estado") == "navegador mostra o trecho" else {}
            visto[chave(*item[:2])] = {**resultado, **manual, "link": item[0], "conferido_em": hoje}
    REGISTRO.write_text(json.dumps(visto, ensure_ascii=False, indent=1), encoding="utf-8")
    contagem = {}
    for item in todos:
        estado = "sem link para mostrar" if onde_ler(*item[:2], visto) is None else "cópia" if visto[chave(*item[:2])].get("estado") not in ABRE else "direto"
        contagem[estado] = contagem.get(estado, 0) + 1
    print(contagem)
