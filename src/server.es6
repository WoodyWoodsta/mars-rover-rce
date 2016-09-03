/* server.es6 */

import debug from 'debug';
import Koa from 'koa';
import koaBody from 'koa-bodyparser';
import koaLogger from 'koa-logger';

import router from './routes';
import * as socket from './servers/socket';
import { config } from './config';

const log = debug('rce:main');

export default function init() {
  log('Starting HTTP server...');

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
