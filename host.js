'use strict';

const config = require('./config.js');

// closing node when parent process is killed
process.stdin.resume();
process.stdin.on('end', () => process.exit());

function observe(request, push, done) {
  let close;
  const exception = e => {
    push({
      code: -1,
      type: 'exception',
      error: e.stack
    });
    close();
  };
  close = () => {
    process.removeListener('uncaughtException', exception);
    done();
    close = () => {};
  };
  process.addListener('uncaughtException', exception);

  if (request.method === 'spec') {
    push({
      version: config.version,
      env: process.env,
      release: process.release,
      platform: process.platform,
      arch: process.arch,
      versions: process.versions,
      separator: require('path').sep,
      tmpdir: require('os').tmpdir()
    });
    close();
  }
  else if ('script' in request) {
    const vm = require('vm');
    const sandbox = {
      version: config.version,
      env: process.env,
      push,
      close,
      setTimeout,
      args: request.args,
      // only allow internal modules that extension already requested permission for
      require: name => (request.permissions || []).indexOf(name) === -1 ? null : require(name)
    };
    const script = new vm.Script(request.script);
    const context = new vm.createContext(sandbox);
    script.runInContext(context);
  }
  else {
    push({
      type: 'context',
      error: 'cannot find "script" key in your request. Closing connection...'
    });
    close();
  }
}
/* message passing */
const nativeMessage = require('./messaging');
process.stdin
  .pipe(new nativeMessage.Input())
  .pipe(new nativeMessage.Transform(observe))
  .pipe(new nativeMessage.Output())
  .pipe(process.stdout);
