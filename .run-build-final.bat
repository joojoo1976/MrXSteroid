@echo off
cd /d E:\MrXSteroid-main
npm run build > .build-111-final.log 2>&1
echo %ERRORLEVEL% > .build-111-final.exit
