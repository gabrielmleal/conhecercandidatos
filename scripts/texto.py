import gzip
import hashlib
import html
import pathlib
import re
import subprocess
import sys
import tempfile
import threading
import time
import unicodedata
import urllib.error
import urllib.request

AGENTE = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"


VEZ = threading.Lock()
COPIAS = pathlib.Path(__file__).resolve().parent.parent / "estado/copias"


def pegar(link, espera):
    if (guardada := COPIAS / (hashlib.sha1(link.encode()).hexdigest()[:16] + ".pdf")).exists():
        return guardada.read_bytes(), "application/pdf"
    pedido = urllib.request.Request(link, headers={"User-Agent": AGENTE, "Accept-Language": "pt-BR,pt;q=0.9"})
    arquivo = "archive.org" in link
    for pausa in [30, 90, 180, None] if arquivo else [None]:
        if arquivo:
            with VEZ:
                time.sleep(4)
        try:
            with urllib.request.urlopen(pedido, timeout=espera) as resposta:
                conteudo = resposta.read()
                return gzip.decompress(conteudo) if conteudo[:2] == b"\x1f\x8b" else conteudo, resposta.headers.get("Content-Type", "")
        except (urllib.error.URLError, TimeoutError) as erro:
            if pausa is None or getattr(erro, "code", 429) not in (429, 500, 502, 503, 504):
                raise
            time.sleep(pausa)


def copia(link):
    return "https://web.archive.org/web/2id_/" + link


def baixar(link):
    try:
        return pegar(link, 30)
    except Exception:
        return pegar(copia(link), 90)


def texto_de(conteudo, tipo):
    if conteudo[:4] == b"%PDF" or "pdf" in tipo:
        with tempfile.NamedTemporaryFile(suffix=".pdf") as arquivo:
            arquivo.write(conteudo)
            arquivo.flush()
            return subprocess.run(["pdftotext", "-layout", arquivo.name, "-"], capture_output=True, text=True).stdout
    try:
        pagina = conteudo.decode("utf-8")
    except UnicodeDecodeError:
        pagina = conteudo.decode("cp1252", errors="replace")
    pagina = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", pagina)
    pagina = re.sub(r"(?s)<[^>]+>", " ", pagina)
    return html.unescape(pagina)


def normalizar(texto):
    texto = unicodedata.normalize("NFKC", texto).replace("­", "")
    texto = re.sub(r"[“”«»]", '"', texto)
    texto = re.sub(r"[‘’]", "'", texto)
    texto = re.sub(r"[‐-‒–—]", "-", texto)
    return re.sub(r"\s+", " ", texto).strip().lower()


def contem(texto, trecho):
    return normalizar(trecho) in normalizar(texto)


if __name__ == "__main__":
    conteudo, tipo = baixar(sys.argv[1])
    texto = texto_de(conteudo, tipo)
    if len(sys.argv) > 2:
        print("ACHOU" if contem(texto, sys.argv[2]) else "NAO ACHOU")
    else:
        print(re.sub(r"\s+", " ", texto).strip())
