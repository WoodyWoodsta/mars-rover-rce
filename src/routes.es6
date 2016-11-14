/* routes.es6 */
/**
 * @author Sean Wood (WoodyWoodsta)
 */

import debug from 'debug';
import Router from 'koa-router';

const log = debug('rce:router');
const router = new Router();

// === Routes ===
router.post('/test', ctx => {
  ctx.body = 'Hello world';
  ctx.status = 200;
  log('Received test POST');
});

/**
 * Return the configured router middleware instance
 */
export default function () {
  return router.middleware();
}
