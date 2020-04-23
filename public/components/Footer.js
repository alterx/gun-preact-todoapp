import { html } from '//unpkg.com/htm/preact/standalone.mjs';

export const Footer = ({
  activeTodoCount = 0,
  nowShowing = 'all',
  setNowShowing,
}) => {
  return html`<footer class="footer">
    <span class="todo-count">
      <strong>${activeTodoCount}</strong> item(s) left
    </span>
    <ul class="filters">
      <li onClick=${setNowShowing.bind(this, 'all')}>
        <a href="#/" class=${nowShowing === 'all' ? 'selected' : ''}>
          All
        </a>
      </li>
      ${' '}
      <li onClick=${setNowShowing.bind(this, 'active')}>
        <a href="#/active" class=${nowShowing === 'active' ? 'selected' : ''}>
          Active
        </a>
      </li>
      ${' '}
      <li onClick=${setNowShowing.bind(this, 'completed')}>
        <a
          href="#/completed"
          class=${nowShowing === 'completed' ? 'selected' : ''}
        >
          Completed
        </a>
      </li>
    </ul>
  </footer>`;
};
