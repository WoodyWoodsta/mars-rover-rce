/* server.es6 */
import debug from 'debug';
import Koa from 'koa';
import koaBody from 'koa-bodyparser';
import koaLogger from 'koa-logger';
import { readFileSync } from 'fs';
import router from './routes';

const log = debug('rce:main');

// Will require a socket server as well as a koa server.
// Some way of streaming the video as well
