@echo off
rem Serves the portfolio locally and opens it in your browser. Close this window to stop.
cd /d "%~dp0"
start "" http://localhost:5173/
python -m http.server 5173 --directory afterimage
