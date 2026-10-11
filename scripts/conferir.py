import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from provar import dois_veiculos, nivel

RAIZ = pathlib.Path(__file__).resolve().parent.parent
PESQUISA = re.compile(r"datafolha|quaest|poderdata|real time big data|ipec|atlasintel|paraná pesquisas|inten[çc][ãa]o de voto|pesquisa eleitoral", re.I)
VOTO = re.compile(r"\bvote (em|no|na)\b|\bn[ãa]o vote\b|\bvotem\b", re.I)


def sem_ancora(fato):
    return nivel(fato["ancora"]["link"]) not in ("A", "B") and not dois_veiculos(fato["ancora"], fato.get("fontes", []))


fatos = [json.loads(p.read_text(encoding="utf-8")) for p in sorted((RAIZ / "fatos").glob("*.json"))]
contam = [f for f in fatos if f["tipo"] in ("positivo", "problema")]
ruins = [f["id"] for f in contam if sem_ancora(f) or not all(f.get("caixas", {}).get(str(n)) for n in range(1, 10))]
paginas = [p for p in [*(RAIZ / "site").glob("*.html"), *(RAIZ / "site/fato").glob("*.html")] if p.name != "404.html"]
lei = {
    "fatos com pesquisa eleitoral (Lei 9.504/1997, art. 33)": [f["id"] for f in fatos if PESQUISA.search(f["titulo"] + " " + f["frase"])],
    "páginas sem o aviso de IA (Res. TSE 23.755/2026, art. 9º-B)": [p.name for p in paginas if not re.search(r"Feito com IA|feito por intelig[êe]ncia artificial", p.read_text(encoding="utf-8"))],
    "textos que pedem voto (Res. TSE 23.755/2026, art. 28, §1º-C)": [p.name for p in [*paginas, RAIZ / "site/dados.js"] if VOTO.search(p.read_text(encoding="utf-8"))],
}
for i in ruins:
    print("  sem prova:", i)
for regra, achados in lei.items():
    print(f"{regra}: {len(achados)}", *achados)
print(f"fatos publicados: {len(fatos)}, que contam na nota: {len(contam)}")
print(f"fatos que contam na nota sem âncora oficial ou dupla: {len(ruins)}")
sys.exit(1 if ruins or any(lei.values()) else 0)
