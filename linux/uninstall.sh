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
rm -f ~/.config/google-chrome/NativeMessagingHosts/${id}.json
echo " -> Removing manifest file for Chromium"
rm -f ~/.config/chromium/NativeMessagingHosts/${id}.json
echo " -> Removing manifest file for Vivaldi"
rm -f ~/.config/vivaldi/NativeMessagingHosts/${id}.json
echo " -> Removing manifest file for Brave"
rm -f ~/.config/BraveSoftware/Brave-Browser/NativeMessagingHosts/${id}.json
echo " -> Removing manifest file for Microsoft Edge"
rm -f ~/.config/microsoftedge/NativeMessagingHosts/${id}.json
echo " -> Removing manifest file for Mozilla Firefox"
rm -f ~/.mozilla/native-messaging-hosts/${id}.json
echo " -> Removing manifest file for Waterfox"
rm -f ~/.waterfox/native-messaging-hosts/${id}.json
echo " -> Removing manifest file for Tor"
rm -f ~/.tor-browser/app/Browser/TorBrowser/Data/Browser/.mozilla/native-messaging-hosts/${id}.json
echo " -> Removing manifest file for Thunderbird"
rm -f ~/.thunderbird/native-messaging-hosts/${id}.json
echo " -> Removing executable"
[ -n "$id" ] && rm -f -r ~/.config/${id}

echo
echo ">>> Native Client is removed <<<".
