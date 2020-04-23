import {
  html,
  useState,
  useEffect,
} from '//unpkg.com/htm/preact/standalone.mjs';
import { MainView } from './views/MainView.js';
import { SplashView } from './views/SplashView.js';
import { useGun } from './utils/hooks.js';

export const App = () => {
  const [user, setUser] = useState(null);
  const [appKeys, setAppKeys] = useState(
    () => JSON.parse(localStorage.getItem('todoKeys')) || {},
  );
  const [appReady, setAppReady] = useState(() => false);
  const [gun, sea] = useGun(Gun, ['http://localhost:8765/gun']);

  const initApp = async (type, value) => {
    let newAppKeys;
    try {
      if (type === 'new') {
        newAppKeys = await sea.pair();
      } else {
        if (typeof value === 'string') {
          newAppKeys = JSON.parse(value);
        } else {
          newAppKeys = value;
        }
      }
      let newApp = gun.user();
      newApp.auth(newAppKeys);
      setUser(newApp);
      setAppKeys(newAppKeys);
      setAppReady(true);
    } catch (e) {
      alert('Invalid keypair.');
    }
  };

  useEffect(() => {
    if (user && user.is && Object.keys(appKeys).length === 4 && appReady) {
      console.log(`App keys: ${JSON.stringify(appKeys)}`);
      localStorage.setItem('todoKeys', JSON.stringify(appKeys));
    }
    if (Object.keys(appKeys).length === 4 && !appReady) {
      initApp('existing', appKeys);
    }
  }, [user, appKeys, appReady, initApp]);

  let path;
  let ActiveView;
  if (appReady) {
    ActiveView = MainView;
    path = '/app';
  }
  if (!Object.keys(appKeys).length) {
    ActiveView = SplashView;
    path = '/start';
  }
  history.replaceState({}, '', path);

  return html`<section>
    <${ActiveView}
      user=${user}
      SEA=${sea}
      appKeys=${appKeys}
      initApp=${initApp}
      appReady=${appReady}
    />
  </section>`;
};
