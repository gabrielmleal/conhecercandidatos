import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from provar import nivel

RAIZ = pathlib.Path(__file__).resolve().parent.parent


def sem_ancora(fato):
    imprensa = {f["veiculo"] for f in fato.get("fontes", []) if nivel(f["link"]) == "C"}
    return nivel(fato["ancora"]["link"]) not in ("A", "B") and len(imprensa) < 2


fatos = [json.loads(p.read_text(encoding="utf-8")) for p in sorted((RAIZ / "fatos").glob("*.json"))]
contam = [f for f in fatos if f["tipo"] in ("positivo", "problema")]
ruins = [f["id"] for f in contam if sem_ancora(f) or not all(f.get("caixas", {}).get(str(n)) for n in range(1, 10))]
for i in ruins:
    print("  sem prova:", i)
print(f"fatos publicados: {len(fatos)}, que contam na nota: {len(contam)}")
print(f"fatos que contam na nota sem âncora oficial ou dupla: {len(ruins)}")
sys.exit(1 if ruins else 0)
