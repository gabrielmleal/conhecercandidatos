import gzip
import pathlib
import sys

SITE = pathlib.Path(__file__).resolve().parent.parent / "site"
arquivos = ["index.html", "estilo.css", "dados.js", "app.js", "fontes/atkinson-400.woff2", "fontes/atkinson-700.woff2"]
total = sum(len(gzip.compress((SITE / a).read_bytes())) for a in arquivos)
print(f"página inicial: {total / 1024:.0f} KB comprimidos, teto 200 KB")
sys.exit(total >= 200 * 1024)
