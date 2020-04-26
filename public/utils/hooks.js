import { useState } from "//unpkg.com/htm/preact/standalone.mjs";

const encryptData = async (data, encrypted, keys, SEA) => {
  return encrypted ? SEA.encrypt(data, keys) : Promise.resolve(data);
};

const decryptData = async (data, encrypted, keys, SEA) => {
  return encrypted ? SEA.decrypt(data, keys) : Promise.resolve(data);
};

const debouncedUpdates = (dispatcher, timeout = 100) => {
  let actions = [];
  let handler;
  return (action) => {
    actions.push(action);
    if (!handler) {
      handler = setTimeout(() => {
        let newStateSlice = actions.reduce((previousState, { id, data }) => {
          previousState[id] = data;
          return previousState;
        }, {});
        dispatcher(newStateSlice);
        actions = [];
        handler = null;
      }, timeout);
    }
  };
};

export const useGun = (Gun, peerList) => {
  const [sea] = useState(Gun.SEA);
  const [gun] = useState(
    Gun({
      peers: peerList,
    })
  );

  return [gun, sea];
};

export const useGunNamespace = (gun) => {
  const [namespace, setNamespace] = useState(null);
  setNamespace(gun.user());
  return [namespace];
};

export const useGunKeyAuth = (gun, keys, triggerAuth) => {
  // Will attempt to perform a login (when triggerAuth is set to true),
  // or, if false, returns a namespaced gun node
  const [namespacedGraph] = useGunNamespace(gun);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (namespacedGraph && !namespacedGraph.is && keys && triggerAuth) {
    namespacedGraph.auth(keys);
    setIsLoggedIn(true);
  }

  return [namespacedGraph, isLoggedIn];
};

export const useGunKeys = (sea, retrieveFn = () => null) => {
  const [keys, setKeys] = useState(retrieveFn);

  async function getKeySet() {
    const pair = await sea.pair();
    setKeys(pair);
  }

  if (!keys) {
    getKeySet();
  }

  return [keys, setKeys];
};

export const useGunState = (
  namespace,
  rootFieldsList,
  user,
  appKeys,
  SEA,
  interval = 100,
  encrypted = true
) => {
  const [gunAppGraph] = useState(user.get(namespace));
  const [listenerSet, setListenerSet] = useState({});
  const [rootFields, setRootFields] = useState(() => {
    let initialFields = {};
    rootFieldsList.forEach((f) => (initialFields[f] = null));
    return initialFields;
  });

  // Working with root node fields

  const get = (name) => {
    if (listenerSet[name]) return;

    const updater = debouncedUpdates((data) => {
      setRootFields({ ...rootFields, ...data });
    }, interval);

    gunAppGraph.get(name).on(async (encryptedField) => {
      let decryptedField = await decryptData(
        encryptedField,
        encrypted,
        appKeys,
        SEA
      );
      updater({ id: name, data: decryptedField });
    });

    setListenerSet({ [name]: true });
  };

  const put = async (name, data) => {
    let encryptedData = await encryptData(data, encrypted, appKeys, SEA);
    gunAppGraph.get(name).put(encryptedData);
    rootFields[name] = data;
    setRootFields({ ...rootFields });
  };

  const remove = (name) => {
    gunAppGraph.get(name).put(null);
  };

  const unsubscribe = () => gunAppGraph.off();

  return [
    rootFields,
    { get, put, remove, unsubscribe },
    gunAppGraph, // the actual graph is sent in case something advanced needs to be done
  ];
};

export const useGunCollectionState = (
  namespace,
  setList,
  user,
  appKeys,
  SEA,
  interval = 100,
  encrypted = true
) => {
  const [gunAppGraph] = useState(user.get(namespace));
  const [listenerSet, setListenerSet] = useState({});
  const [collections, setCollections] = useState(() => {
    let initialSets = {};
    setList.forEach((s) => (initialSets[s] = {}));
    return initialSets;
  });

  // Working with Sets

  const getSet = (name) => {
    if (listenerSet[name]) return;

    const updater = debouncedUpdates((data) => {
      setCollections({ ...collections, [name]: data });
    }, interval);

    gunAppGraph
      .get(name)
      .map()
      .on(async (encryptedNode, nodeID) => {
        let item = await decryptData(encryptedNode, encrypted, appKeys, SEA);
        if (item) {
          updater({ id: nodeID, data: { ...item, nodeID } });
        }
      });

    setListenerSet({ [name]: true });
  };

  const updateInSet = async (name, nodeID, data) => {
    let encryptedData = await encryptData(data, encrypted, appKeys, SEA);
    gunAppGraph.get(name).get(nodeID).put(encryptedData);
    collections[name][nodeID] = data;
    setCollections({ ...collections });
  };

  const addToSet = async (name, data) => {
    let encryptedData = await encryptData(data, encrypted, appKeys, SEA);
    gunAppGraph
      .get(name)
      .set(encryptedData)
      .once(async (_, nodeID) => {
        collections[name][nodeID] = { ...data, nodeID };
        setCollections({ ...collections });
      });
  };

  const removeFromSet = (name, nodeID) => {
    gunAppGraph.get(name).get(nodeID).put(null);
    delete collections[name][nodeID];
    setCollections({ ...collections });
  };

  const unsubscribe = () => gunAppGraph.off();

  return [
    collections,
    { getSet, addToSet, updateInSet, removeFromSet, unsubscribe },
    gunAppGraph, // the actual graph is sent in case something advanced needs to be done
  ];
};
