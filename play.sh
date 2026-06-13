#!/bin/sh
# Play Fantasy Portfolio locally.
#   ./play.sh         → live backend (real sign-in, real picks)
#   ./play.sh demo    → offline demo with a pre-filled board (no real data touched)
#   ./play.sh fresh   → offline demo, blank slate
cd "$(dirname "$0")" || exit 1
lsof -ti:8765 >/dev/null 2>&1 || { python3 -m http.server 8765 >/dev/null 2>&1 & sleep 1; }
case "$1" in
  demo)  open "http://localhost:8765/index.html?demo&seed" ;;
  fresh) open "http://localhost:8765/index.html?demo&reset" ;;
  *)     open "http://localhost:8765/index.html" ;;
esac
