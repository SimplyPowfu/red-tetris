// plugins/logger.ts
import type { PiniaPluginContext } from 'pinia'

export function myPiniaLogger({ store }: PiniaPluginContext) {
  // Listen to every action called in the app
  store.$onAction(({ name, args, after, onError }) => {
    console.log(`🍍 Starting "${name}" with params:`, args);

    // This hook runs after the action finishes
    after((result) => {
      console.log(`✅ Finished "${name}" with result:`, result);
    });

    // This hook runs if the action throws an error
    onError((error) => {
      console.warn(`❌ Failed "${name}" with error:`, error);
    });
  });
}