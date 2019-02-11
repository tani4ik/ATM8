:: Beginning of hub batch file
set SERVER_VERSION=3.4.0
set HUB_PORT=5558
set REGISTER_IP=localhost:4444
set GECKO_DRIVER=.\webdriver\geckodriver.exe
java -jar -Dwebdriver.gecko.driver=%GECKO_DRIVER% selenium-server-standalone-%SERVER_VERSION%.jar -role node -hub http://%REGISTER_IP%/grid/register -browser browserName=firefox,platform=WINDOWS -port %HUB_PORT%
:: End of hub batch file
pause