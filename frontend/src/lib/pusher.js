import Pusher from 'pusher-js';
import axios from 'axios';

/**
 * Creates a Pusher instance configured for private-channel auth
 * via the Laravel /broadcasting/auth endpoint.
 *
 * Using a custom authorizer so that the current bearer token
 * is always sent to the backend broadcast auth route.
 */
function createPusher() {
  const authURL = '/broadcasting/auth';

  return new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'ap1',
    forceTLS: true,
    authorizer: (channel) => ({
      authorize: (socketId, callback) => {
        axios
          .post(authURL, {
            socket_id: socketId,
            channel_name: channel.name,
          }, {
            headers: {
              Accept: 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
              ...(localStorage.getItem('auth_token')
                ? { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
                : {}),
            },
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
