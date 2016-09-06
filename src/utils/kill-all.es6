/* kill-all.es6 */
/**
 * Kill all processes spawned in a parent child process, and the child process itself
 */

import psTree from 'ps-tree';

export function killAll(pid, signal = 'SIGKILL', callback = () => {}) {
  const killTree = true;

  if (killTree) {
    psTree(pid, (err, children) => {
      [pid].concat(
        children.map((p) => {
          return p.PID;
        })
      ).forEach((tpid) => {
        try {
          process.kill(tpid, signal);
        } catch (ex) {}
      });
      callback();
    });
  } else {
    try {
      process.kill(pid, signal);
    } catch (ex) {}
    callback();
  }
}
