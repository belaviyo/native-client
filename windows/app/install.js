'use strict';

const fs = require('fs');
const path = require('path');

function exists(directory, callback) {
  fs.stat(directory, e => {

    if (e && e.code === 'ENOENT') {
      fs.mkdir(directory, callback);
    }
    else {
      callback(e);
    }
  });
}

const {id, ids} = require('./config.js');
const dir = path.join(process.argv[2], id);
const name = id;

const {exec} = require('child_process');

console.log('.. Writing to Chrome Registry');
console.log(`.. Key: HKCU\\Software\\Google\\Chrome\\NativeMessagingHosts\\${id}`);
exec(`REG ADD "HKCU\\Software\\Google\\Chrome\\NativeMessagingHosts\\${id}" /ve /t REG_SZ /d "%LocalAPPData%\\${id}\\manifest-chrome.json" /f`);

console.log('.. Writing to Chromium Registry');
console.log(`.. Key: HKEY_CURRENT_USER\\Software\\Chromium\\NativeMessagingHosts\\${id}`);
exec(`REG ADD "HKEY_CURRENT_USER\\Software\\Chromium\\NativeMessagingHosts\\${id}" /ve /t REG_SZ /d "%LocalAPPData%\\${id}\\manifest-chrome.json" /f`);

console.log('.. Writing to Edge Registry');
console.log(`.. Key: HKEY_CURRENT_USER\\Software\\Microsoft\\Edge\\NativeMessagingHosts\\${id}`);
exec(`REG ADD "HKEY_CURRENT_USER\\Software\\Microsoft\\Edge\\NativeMessagingHosts\\${id}" /ve /t REG_SZ /d "%LocalAPPData%\\${id}\\manifest-chrome.json" /f`);

console.log(`.. Writing to Firefox Registry`);
console.log(`.. Key: HKCU\\SOFTWARE\\Mozilla\\NativeMessagingHosts\\${id}`);
exec(`REG ADD "HKCU\\SOFTWARE\\Mozilla\\NativeMessagingHosts\\${id}" /ve /t REG_SZ /d "%LocalAPPData%\\${id}\\manifest-firefox.json" /f`);

console.log(`.. Writing to Waterfox Registry`);
console.log(`.. Key: HKCU\\SOFTWARE\\Waterfox\\NativeMessagingHosts\\${id}`);
exec(`REG ADD "HKCU\\SOFTWARE\\Waterfox\\NativeMessagingHosts\\${id}" /ve /t REG_SZ /d "%LocalAPPData%\\${id}\\manifest-firefox.json" /f`);

console.log(`.. Writing to Thunderbird Registry`);
console.log(`.. Key: HKCU\\SOFTWARE\\Thunderbird\\NativeMessagingHosts\\${id}`);
exec(`REG ADD "HKCU\\SOFTWARE\\Thunderbird\\NativeMessagingHosts\\${id}" /ve /t REG_SZ /d "%LocalAPPData%\\${id}\\manifest-firefox.json" /f`);

function manifest(type, callback) {
  exists(dir, e => {
    if (e) {
      throw e;
    }
    let origins;
    if (type === 'chrome') {
      origins = '"allowed_origins": ' + JSON.stringify(ids.chrome.map(id => 'chrome-extension://' + id + '/'));
    }
    else {
      origins = '"allowed_extensions": ' + JSON.stringify(ids.firefox);
    }
    fs.writeFile(path.join(dir, 'manifest-' + type + '.json'), `{
  "name": "${name}",
  "description": "Node Host for Native Messaging",
  "path": "run.bat",
  "type": "stdio",
  ${origins}
}`, e => {
      if (e) {
        throw e;
      }
      callback();
    });
  });
}
function application(callback) {
  fs.writeFile(path.join(dir, 'run.bat'), `@echo off\n\n"%~dp0node.exe" "%~dp0host.js"`, e => {
    if (e) {
      throw e;
    }
    fs.createReadStream('host.js').pipe(fs.createWriteStream(path.join(dir, 'host.js')));
    fs.createReadStream('config.js').pipe(fs.createWriteStream(path.join(dir, 'config.js')));
    fs.createReadStream('messaging.js').pipe(fs.createWriteStream(path.join(dir, 'messaging.js')));
    try {
      fs.createReadStream(process.argv[0]).pipe(fs.createWriteStream(path.join(dir, 'node.exe')));
    }
    catch (e) {}
    callback();
  });
}

function chrome(callback) {
  if (ids.chrome.length) {
    manifest('chrome', callback);
    console.error('.. Chrome Browser is supported');
  }
  else {
    callback();
  }
}
function firefox(callback) {
  if (ids.firefox.length) {
    manifest('firefox', callback);
    console.error('.. Firefox Browser is supported');
  }
  else {
    callback();
  }
}
chrome(() => firefox(() => {
  application(() => {
    console.error('.. Native Host is installed in', dir);
    console.error('\n\n>>> Application is ready to use <<<\n\n');
  });
}));
