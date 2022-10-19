"use strict";
window.chrome = {
  _store: { limit: 200, _initialized: true },
  _store_man: { limit: 200 },
  _store_updated: { limit: 0 },
  _listeners: [],
  runtime: {
    onMessage: {
      addListener: function () {},
    },
    onConnect: {
      addListener: function () {},
    },
  },
  action: {
    onClicked: {
      addListener: function () {},
    },
  },
  omnibox: {
    onInputEntered: {
      addListener: function () {},
    },
  },
  storage: {
    local: {
      get: (a, callback) => callback(chrome._store),
      set: (a) => {
        console.log("save" + JSON.stringify(a));
        for (let el in a) {
          if (a.hasOwnProperty(el)) {
            chrome._store[el] = a[el];
          }
        }
      },
    },
    sync: {
      get: (a) => function () {},
      set: (a) => {
        console.log("save" + JSON.stringify(a));
        for (let el in a) {
          if (a.hasOwnProperty(el)) {
            chrome._store[el] = a[el];
          }
        }
      },
    },
    managed: {
      get: (a, callback) => callback(chrome._store_man),
    },
    onChanged: {
      addListener: (listener) => chrome._listeners.push(listener),
    },
  },
  _triggerChange(
    changeSet = { limit: { newValue: 0, oldValue: 160 } },
    area = "managed"
  ) {
    chrome._listeners.forEach((listener) => {
      listener(changeSet, area);
    });
  },
};
