#!/bin/sh
set -e
cd "$(dirname "$0")/.."
python3 -I -c 'import datetime as d, sys; z = d.timezone(d.timedelta(hours=-3)); a = d.datetime.now(z); sys.exit(d.datetime(2026, 10, 22, 17, tzinfo=z) <= a < d.datetime(2026, 10, 26, 17, tzinfo=z) and "silêncio do TSE: só retirada de fato com erro, à mão")'
test ! -f estado/pausa || { cat estado/pausa; echo "pausado: leia estado/pausa e apague o arquivo para seguir"; exit 1; }
python3 -I scripts/links.py fatos
python3 -I scripts/montar.py
python3 -I scripts/conferir.py
ramo="rodada-$(date +%Y%m%d-%H%M)"
git switch -c "$ramo"
git add dados fatos quarentena registros site estado
git commit -m "Rodada $ramo"
git push -u origin "$ramo"
gh pr create --base main --title "Rodada $ramo" --body "$(python3 -I scripts/conferir.py | tail -2)"
gh pr merge --squash --delete-branch
git switch main
git pull --ff-only
