import { html } from '//unpkg.com/htm/preact/standalone.mjs';
import { useState } from '//unpkg.com/htm/preact/standalone.mjs';

const TodoItem = ({ todo, removeTodo, changeStatus, updateTodo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { text, lastUpdated, nodeID, status } = todo;

  let classes = status === 'completed' ? status : '';
  classes += isEditing ? 'editing' : '';

  return html` <li class=${classes} key=${nodeID}>
    <div class="view">
      <input
        class="toggle"
        type="checkbox"
        checked="${status === 'completed'}"
        onChange="${changeStatus.bind(this, todo)}"
      />
      <label onClick=${() => setIsEditing(true)}>
        ${text} <small>[Updated At: ${lastUpdated}]</small>
      </label>
      <button class="destroy" onClick="${removeTodo.bind(this, todo)}" />
    </div>
    <input
      class="edit"
      value=${text}
      onBlur=${() => {
        updateTodo({ ...todo, text });
        setIsEditing(false);
      }}
    />
  </li>`;
};

export const TodoList = ({
  todos = [],
  removeTodo,
  changeStatus,
  updateTodo,
}) => {
  return html`
    <ul id="todo-list" class="todo-list">
      ${todos.map(
        (todo) =>
          html`<${TodoItem}
            todo=${todo}
            removeTodo=${removeTodo}
            changeStatus=${changeStatus}
            updateTodo=${updateTodo}
          />`,
      )}
    </ul>
  `;
};
