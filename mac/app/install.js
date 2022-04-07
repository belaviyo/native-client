'use strict';

const fs = require('fs');
const path = require('path');

let share = process.argv.filter(a => a.startsWith('--custom-dir=')).map(a => a.split('=')[1])[0] ||
  path.resolve(process.env.HOME, '.config');
if (share[0] === '~') {
  share = path.join(process.env.HOME, share.slice(1));
}
share = path.resolve(share);
console.log(' -> Root directory is', share);

function exists(directory, callback) {
  let root = '/';
  const dirs = directory.split('/');
  function one() {
    root = path.join(root, dirs.shift());
    fs.stat(root, e => {
      if (!e && dirs.length) {
        one();
      }
      else if (e && e.code === 'ENOENT') {
        fs.mkdir(root, e => {
          if (e) {
            callback(e);
          }
          else if (dirs.length) {
            one();
          }
          else {
            callback();
          }
        });
      }
      else {
        callback(e);
      }
    });
  }
  one();
}

const {id, ids} = require('./config.js');
const dir = path.join(share, id);
const name = id;

function manifest(root, type, callback) {
  console.log(' -> Creating a directory at', root);
  exists(root, e => {
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
    fs.writeFile(path.join(root, name + '.json'), `{
  "name": "${name}",
  "description": "Node Host for Native Messaging",
  "path": "${path.join(dir, 'run.sh')}",
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
  console.log(' -> Creating a directory at', dir);
  exists(dir, e => {
    if (e) {
      console.log('\x1b[31m', `-> You dont have permission to use "${share}" directory.`, '\x1b[0m');
      console.log('\x1b[31m', '-> Use custom directory instead. Example:', '\x1b[0m');
      console.log('\x1b[31m', '-> ./install.sh --custom-dir=~/', '\x1b[0m');

      throw e;
    }

    const isNode = process.argv.filter(a => a === '--add_node').length === 0;
    const run = `#!/usr/bin/env bash\n${isNode ? process.argv[0] : './node'} host.js`;

    fs.writeFile(path.join(dir, 'run.sh'), run, e => {
      if (e) {
        throw e;
      }
      fs.chmodSync(path.join(dir, 'run.sh'), '0755');
      fs.createReadStream('host.js').pipe(fs.createWriteStream(path.join(dir, 'host.js')));
      fs.createReadStream('config.js').pipe(fs.createWriteStream(path.join(dir, 'config.js')));
      fs.createReadStream('messaging.js').pipe(fs.createWriteStream(path.join(dir, 'messaging.js')));
      if (!isNode) {
        fs.createReadStream(process.argv[0]).pipe(fs.createWriteStream(path.join(dir, 'node')));
        fs.chmodSync(path.join(dir, 'node'), '0755');
      }

      callback();
    });
  });
}

async function chrome() {
  const run = p => new Promise(resolve => {
    if (ids.chrome.length) {
      const loc = path.join(process.env.HOME, p);
      manifest(loc, 'chrome', resolve);
    }
    else {
      resolve();
    }
  });

  await run('Library/Application Support/Google/Chrome/NativeMessagingHosts');
  console.error(' -> Chrome Browser is supported');
  await run('Library/Application Support/Google/Chrome Dev/NativeMessagingHosts');
  console.error(' -> Chrome Dev Browser is supported');
  await run('Library/Application Support/Chromium/NativeMessagingHosts');
  console.error(' -> Chromium Browser is supported');
  await run('Library/Application Support/Vivaldi/NativeMessagingHosts');
  console.error(' -> Vivaldi Browser is supported');
  await run('Library/Application Support/BraveSoftware/Brave-Browser/NativeMessagingHosts');
  console.error(' -> Brave Browser is supported');
  await run('Library/Application Support/Microsoft Edge/NativeMessagingHosts');
  console.error(' -> Microsoft Edge Browser is supported');
}

async function firefox() {
  const run = p => new Promise(resolve => {
    if (ids.firefox.length) {
      const loc = path.join(process.env.HOME, p);
      manifest(loc, 'firefox', resolve);
    }
    else {
      resolve();
    }
  });

  await run('Library/Application Support/Mozilla/NativeMessagingHosts');
  console.error(' -> Firefox Browser is supported');
  await run('Library/Application Support/Waterfox/NativeMessagingHosts');
  console.error(' -> Waterfox Browser is supported');
  await run('Library/Application Support/TorBrowser-Data/Browser/Mozilla/NativeMessagingHosts');
  console.error(' -> Tor Browser is supported');
  await run('Library/Application Support/Thunderbird/NativeMessagingHosts');
  console.error(' -> Thunderbird Email Client is supported');
}

(async () => {
  await chrome();
  await firefox();
  application(() => {
    console.error(' -> Native Host is installed in', dir);
    console.error('\n\n>>> Application is ready to use <<<\n\n');
  });
})();
