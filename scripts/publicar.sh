#!/bin/sh
set -e
cd "$(dirname "$0")/.."
python3 -I scripts/silencio.py
test ! -f estado/pausa || { cat estado/pausa; echo "pausado: leia estado/pausa e apague o arquivo para seguir"; exit 1; }
python3 -I scripts/links.py fatos
python3 -I scripts/montar.py
python3 -I scripts/conferir.py
python3 -I scripts/juridico.py
ramo="rodada-$(date +%Y%m%d-%H%M)"
git switch -c "$ramo"
git add dados fatos registros site estado
git commit -m "Rodada $ramo"
git push -u origin "$ramo"
gh pr create --base main --title "Rodada $ramo" --body "$(python3 -I scripts/conferir.py | tail -2; python3 -I scripts/juridico.py)"
