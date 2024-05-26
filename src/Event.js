import { v4 as uuid } from "uuid";

const subscriptions = {};
const messages = new Map();

const subscribe = (type, callback) => {
  const id = uuid();
  console.debug("react-event", "subscribe", type, id);

  if (!subscriptions[type]) {
    subscriptions[type] = {};
  }

  const registry = {
    id,
    type,
    callback,
    unsubscribe: () => {
      console.debug("react-event", "unsubscribe", type, id);
      delete subscriptions[type][id];

      if (Object.keys(subscriptions[type]).length === 0) {
        delete subscriptions[type];
      }
    },
  };

  subscriptions[type][id] = registry;

  let last = messages.get(type);

  if (last) {
    callback(last, registry);
  }

  return registry;
};

const publish = (type, payload) => {
  console.log("react-event", "publish", type, payload);
  messages.set(type, payload);

  Object.keys(subscriptions[type] || {}).forEach((key) => {
    const registry = subscriptions[type][key];

    setTimeout(() => {
      registry.callback(payload, registry);
    }, 0);
  });
};

function last(type, init) {
  if (messages.has(type)) {
    return messages.get(type);
  } else {
    return init;
  }
}

export { subscribe, publish, messages, last };
