import Pusher from 'pusher-js';
import api from './axios';

/**
 * Creates a Pusher instance configured for private-channel auth
 * via the Laravel /broadcasting/auth endpoint.
 *
 * Using a custom authorizer so that the current auth token from
 * axios (which handles token refresh) is always used.
 */
function createPusher() {
  return new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'ap1',
    forceTLS: true,
    authorizer: (channel) => ({
      authorize: (socketId, callback) => {
        api
          .post('/broadcasting/auth', {
            socket_id: socketId,
            channel_name: channel.name,
          })
          .then(({ data }) => callback(null, data))
          .catch((err) => callback(err, null));
      },
    }),
  });
}

// Singleton — reused across the app lifetime
let instance = null;

export function getPusher() {
  if (!instance) {
    instance = createPusher();
  }
  return instance;
}

/**
 * Reset the singleton (call on logout so the next login gets a fresh connection).
 */
export function disconnectPusher() {
  if (instance) {
    instance.disconnect();
    instance = null;
  }
}

export default getPusher;
