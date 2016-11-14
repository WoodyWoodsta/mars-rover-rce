/* server.es6 */
/**
 * @author Sean Wood (WoodyWoodsta)
 */

import debug from 'debug';
import Koa from 'koa';
import koaBody from 'koa-bodyparser';
import koaLogger from 'koa-logger';

import router from './routes';
import * as socket from './servers/socket';
import { config } from './config';

const log = debug('rce:main');

export let rceIO;

/**
 * Initialise the HTTP server
 */
export default function init() {
  log('Starting HTTP server...');

  const app = new Koa();

  // === Middleware ===
  app.use(koaLogger());
  app.use(koaBody());
  app.use(router());

  // RCE IO
  rceIO = socket.init();
  rceIO.attach(app);
  socket.addListeners(rceIO);

  // === Connect ===
  app.listen(config.server.port);
  log(`RCE server listening on port ${config.server.port}`);
}
