// src/engine/createChainController.ts

import { Chain, ChainControllerOptions } from '../types/types';

export function createChainController(source: string, options: ChainControllerOptions): Chain {
  const { enableAdvancedControl, trigger } = options;

  const chain: Chain = {
    source,
    path: [source],
    isStopped: false,
    // isSkipped: false,
    stop() {
      this.isStopped = true;
    },
    // skip() {
    //   this.isSkipped = true;
    // },
    // redirect(target: string) {
    //   this.redirectTarget = target;
    //   this.path.push(target);
    //   this.isStopped = true;
    //   trigger(target, this, new Set(this.path));
    // },
  };

  if (enableAdvancedControl) {
    chain.stopPropagation = () => chain.stop?.();
    // chain.skipEffect = () => chain.skip?.();
    // chain.redirectTo = (field: string) => chain.redirect?.(field);
  }

  return chain;
}
