import { html } from '//unpkg.com/htm/preact/standalone.mjs';

export const SplashView = ({ initApp }) => {
  const getApp = async (type, { target } = {}) => {
    let value = null;
    if (target) {
      value = target.value;
      target.value = '';
    }
    initApp(type, value);
  };

  return html`
    <div class="todoapp" id="splash">
      <h1 id="appName">TODOs App</h1>
      <button class="new-list" onClick="${getApp.bind(this, 'new')}">
        New List
      </button>
      <h2>Already have one?</h2>
      <input
        class="new-todo"
        onChange=${getApp.bind(this, 'existing')}
        placeholder="Paste keys here"
      />
    </div>
  `;
};
