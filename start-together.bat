@echo off
echo Starting Together App...

REM Navigate to the server directory and start the server
cd server
start cmd /k "node index.js"

REM Navigate to the client directory and start the client
cd ..\client
start cmd /k "npm start"

echo Both server and client are starting...