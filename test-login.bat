@echo off
echo Testing login via reverse-proxy on port 8888...
echo.

curl -X POST http://localhost:8888/api/auths/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@a\",\"password\":\"az\"}" ^
  -i

echo.
echo.
echo Test complete!
pause
