@echo off
setlocal

cd /d "%~dp0"
set "PORT=8765"
set "URL=http://localhost:%PORT%/index.html?demo^&seed"

where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  set "PYTHON=py -3"
) else (
  where python >nul 2>nul
  if %ERRORLEVEL% EQU 0 (
    set "PYTHON=python"
  ) else (
    echo Python 3 is required to serve the local app.
    pause
    exit /b 1
  )
)

powershell -NoProfile -Command "try { $r = Invoke-WebRequest -UseBasicParsing 'http://localhost:%PORT%/index.html' -TimeoutSec 1; if ($r.Content -match 'Fantasy Portfolio') { exit 0 } else { exit 2 } } catch { exit 1 }"
if %ERRORLEVEL% EQU 1 (
  start "Fantasy Portfolio local server" /min %PYTHON% -m http.server %PORT% --bind 127.0.0.1 --directory "%CD%"
  timeout /t 1 /nobreak >nul
) else if %ERRORLEVEL% EQU 2 (
  echo Port %PORT% is already serving something else.
  echo Stop that server first, then double-click this file again.
  pause
  exit /b 1
)

start "" "%URL%"
endlocal
