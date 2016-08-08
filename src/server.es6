/* server.es6 */
// Will require a socket server as well as a koa server.
// Some way of streaming the video as well
import debug from 'debug';
import Koa from 'koa';
import koaBody from 'koa-bodyparser';
import koaLogger from 'koa-logger';
import { readFileSync } from 'fs';
import router from './routes';
import * as socket from './servers/socket';

const log = debug('rce:main');

export default function init() {
  log('Starting HTTP server...');

  const config = JSON.parse(readFileSync('./config.json'));

  const app = new Koa();

  // === Middleware ===
  app.use(koaLogger());
  app.use(koaBody());
  app.use(router());

  // RCE IO
  const rceIo = socket.init();
  rceIo.attach(app);
  socket.addListeners(rceIo);

  // === Connect ===
  app.listen(config.server.port);
  log(`RCE server listening on port ${config.server.port}`);
}
