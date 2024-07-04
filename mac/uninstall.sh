#!/usr/bin/env bash

cd ./app

MACHINE_TYPE=`uname -m`

which node 2>/dev/null
isNode=$?
echo NodeJS status = $isNode

if [ ${isNode} -eq 0 ]; then
  echo "Using system NodeJS"
  id=`node -e "process.stdout.write(require('./config.js').id)"`
elif [ ${MACHINE_TYPE} == 'x86_64' ]; then
  echo "Using ../node/x64/node"
  id=`../node/x64/node -e "process.stdout.write(require('./config.js').id)"`
else
  echo "Using ../node/x86/node"
  id=`../node/x86/node -e "process.stdout.write(require('./config.js').id)"`
fi

echo "Native Client id is \"${id}\""
echo

echo " -> Removing manifest file for Google Chrome"
rm -f ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/${id}.json
echo " -> Removing manifest file for Google Chrome Dev"
rm -f ~/Library/Application\ Support/Google/Chrome\ Dev/NativeMessagingHosts/${id}.json
echo " -> Removing manifest file for Chromium"
rm -f ~/Library/Application\ Support/Chromium/NativeMessagingHosts/${id}.json
echo " -> Removing manifest file for Vivaldi"
rm -f ~/Library/Application Support/Vivaldi/NativeMessagingHosts/${id}.json
echo " -> Removing manifest file for Brave"
rm -f ~/Library/Application Support/BraveSoftware/Brave-Browser/NativeMessagingHosts/${id}.json
echo " -> Removing manifest file for Microsoft Edge"
rm -f ~/Library/Application Support/Microsoft Edge/NativeMessagingHosts/${id}.json
echo " -> Removing manifest file for Mozilla Firefox"
rm -f ~/Library/Application\ Support/Mozilla/NativeMessagingHosts/${id}.json
echo " -> Removing manifest file for Waterfox"
rm -f ~/Library/Application\ Support/Waterfox/NativeMessagingHosts/${id}.json
echo " -> Removing manifest file for Tor"
rm -f ~/Library/Application Support/TorBrowser-Data/Browser/Mozilla/NativeMessagingHosts/${id}.json
echo " -> Removing manifest file for Thunderbird"
rm -f ~/Library/Application\ Support/Thunderbird/NativeMessagingHosts/${id}.json
echo " -> Removing executables"
[ -n "$id" ] && rm -f -r ~/.config/${id}

echo
echo ">>> Native Client is removed <<<".
