#!/bin/sh
# Play Fantasy Portfolio locally.
#
#   ./play.sh         -> offline demo with a pre-filled board
#   ./play.sh demo    -> offline demo with a pre-filled board
#   ./play.sh fresh   -> offline demo from a blank slate
#   ./play.sh live    -> live backend: real magic-link sign-in and real picks
#
# Optional:
#   PORT=8766 ./play.sh demo

set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PORT=${PORT:-8765}
MODE=${1:-demo}
LOG_FILE="$ROOT/.local-server.log"
PID_FILE="$ROOT/.local-server.pid"

case "$MODE" in
  demo)  URL="http://localhost:$PORT/index.html?demo&seed" ;;
  fresh) URL="http://localhost:$PORT/index.html?demo&reset" ;;
  live)  URL="http://localhost:$PORT/index.html" ;;
  -h|--help|help)
    cat <<'EOF'
Play Fantasy Portfolio locally.

  ./play.sh         -> offline demo with a pre-filled board
  ./play.sh demo    -> offline demo with a pre-filled board
  ./play.sh fresh   -> offline demo from a blank slate
  ./play.sh live    -> live backend: real magic-link sign-in and real picks

Optional:
  PORT=8766 ./play.sh demo
EOF
    exit 0
    ;;
  *)
    echo "Unknown mode: $MODE"
    echo "Use: ./play.sh [demo|fresh|live]"
    exit 1
    ;;
esac

have_server() {
  curl -fsS "http://localhost:$PORT/index.html" >/dev/null 2>&1
}

server_is_this_app() {
  curl -fsS "http://localhost:$PORT/index.html" 2>/dev/null | grep -q 'Fantasy Portfolio'
}

start_server() {
  if ! command -v python3 >/dev/null 2>&1; then
    echo "python3 is required to serve the local app."
    exit 1
  fi

  python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$ROOT" >"$LOG_FILE" 2>&1 &
  echo "$!" > "$PID_FILE"

  i=0
  while [ "$i" -lt 30 ]; do
    if have_server; then return 0; fi
    i=$((i + 1))
    sleep 0.2
  done

  echo "Local server did not start. See $LOG_FILE"
  exit 1
}

open_url() {
  if command -v open >/dev/null 2>&1; then
    open "$URL"
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$URL" >/dev/null 2>&1 &
  elif command -v cmd.exe >/dev/null 2>&1; then
    cmd.exe /c start "" "$URL" >/dev/null 2>&1
  else
    echo "Open this URL in your browser:"
    echo "$URL"
  fi
}

if have_server; then
  if ! server_is_this_app; then
    echo "Port $PORT is already serving something else."
    echo "Stop that server, or run with another port, for example:"
    echo "  PORT=8766 ./play.sh demo"
    exit 1
  fi
else
  start_server
fi

echo "Opening $URL"
open_url
