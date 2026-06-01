export function loadFromStorage(name, storage = localStorage) {
  try {
    let obj = storage.getItem(name);
    obj = JSON.parse(obj);
    return obj || null;
  } catch(e) {
    if (e instanceof SyntaxError) {
      return null;
    }
    throw e;
  }
}

export function saveToStorage(name, obj, storage = localStorage) {
  storage.setItem(name, JSON.stringify(obj));
}

export function bcChannelPost(channelName, message) {
  if (window.BroadcastChannel) {
    const channel = new BroadcastChannel(channelName);
    channel.postMessage(message);
    channel.close();
    return true;
  } else {
    return false;
  }
}

export function bcChannelListen(channelName, handler) {
  if (window.BroadcastChannel) {
    const channel = new BroadcastChannel(channelName);
    if (handler) {
      channel.addEventListener("message", handler);
    }
    return channel;
  }
}

export function b64UrlToB64(str) {
  str = str.replace(/[-_]/g, (c) => ( {"-": "+", "_": "/"}[c] ));
  if (str.length % 4 !== 0) {
    str += "=".repeat(4 - str.length % 4);
  }
  return str;
}
