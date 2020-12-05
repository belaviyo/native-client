@echo off

pushd "%~dp0"
CD app

IF "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
  FOR /f %%i in ('..\node\x64\node.exe -e "process.stdout.write(require('./config.js').id)"') do SET id=%%i
) ELSE (
  FOR /f %%i in ('..\node\x86\node.exe -e "process.stdout.write(require('./config.js').id)"') do SET id=%%i
)

echo sss%id%

echo .. Deleting Chrome Registry
REG DELETE "HKCU\Software\Google\Chrome\NativeMessagingHosts\%id%" /f

echo .. Deleting Chromium Registry
REG DELETE "HKEY_CURRENT_USER\Software\Chromium\NativeMessagingHosts\%id%" /f

echo .. Deleting Microsoft Edge Registry
REG DELETE "HKEY_CURRENT_USER\Software\Microsoft\Edge\NativeMessagingHosts\%id%" /f

echo .. Deleting Firefox Registry
REG DELETE "HKCU\SOFTWARE\Mozilla\NativeMessagingHosts\%id%" /f

echo .. Deleting Waterfox Registry
REG DELETE "HKCU\SOFTWARE\Waterfox\NativeMessagingHosts\%id%" /f

echo .. Deleting Thunderbird Registry
REG DELETE "HKCU\SOFTWARE\Thunderbird\NativeMessagingHosts\%id%" /f

echo .. Deleting %id%
RMDIR /Q /S "%LocalAPPData%\%id%"

echo.
echo ^>^>^> Native Client is removed ^<^<^<
echo.
pause
