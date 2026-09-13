@echo off
cd /d "%~dp0"
if not exist node_modules (
  call npm.cmd ci
  if errorlevel 1 exit /b 1
)
echo Atlas will be available at http://127.0.0.1:3000
if not exist .next\BUILD_ID (
  call npm.cmd run build
  if errorlevel 1 exit /b 1
)
call npm.cmd start
