import html
import re
import subprocess
import sys
import tempfile
import unicodedata
import urllib.request

AGENTE = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"


def pegar(link, espera):
    pedido = urllib.request.Request(link, headers={"User-Agent": AGENTE, "Accept-Language": "pt-BR,pt;q=0.9"})
    with urllib.request.urlopen(pedido, timeout=espera) as resposta:
        return resposta.read(), resposta.headers.get("Content-Type", "")


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
