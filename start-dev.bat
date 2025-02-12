@echo off
start cmd /k "cd server && npm run dev"
timeout /t 2
start cmd /k "npm run dev" 