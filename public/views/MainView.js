import {
  html,
  useEffect,
  useState,
} from "//unpkg.com/htm/preact/standalone.mjs";
import { useGunState, useGunCollectionState } from "../utils/hooks.js";
import { TodoList } from "../components/TodoList.js";
import { Footer } from "../components/Footer.js";

export const MainView = ({ appKeys, user, SEA }) => {
  const [{ name }, { get, put, unsubscribe: uName }] = useGunState(
    "todoapp",
    ["name"],
    user,
    appKeys,
    SEA
  );
  const [
    { todos = {} },
    { getSet, addToSet, updateInSet, removeFromSet, unsubscribe: uTodos },
  ] = useGunCollectionState("todoapp", ["todos"], user, appKeys, SEA);
  const [nowShowing, setNowShowing] = useState(() => "all");

  useEffect(() => {
    getSet("todos");
    get("name");

    return () => {
      // this function will be executed (by (P)react) when it's time to clean up
      uTodos();
      uName();
    };
  }, []);

  const changeStatus = async (todo) => {
    const { status, text, nodeID } = todo;
    let newStatus = status === "completed" ? "active" : "completed";
    var data = {
      text,
      status: newStatus,
      lastUpdated: new Date().toISOString(),
    };
    updateInSet("todos", nodeID, data);
  };

  const updateTodo = async (todo) => {
    const { status, text, nodeID } = todo;
    var data = {
      status,
      text,
      lastUpdated: new Date().toISOString(),
    };
    updateInSet("todos", nodeID, data);
  };

  const addTodo = async ({ target }) => {
    let data = {
      text: target.value,
      lastUpdated: new Date().toISOString(),
      status: "active",
    };
    target.value = "";
    addToSet("todos", data);
  };

  const removeTodo = ({ nodeID }) => {
    removeFromSet("todos", nodeID);
  };

  let todoList = Object.keys(todos).map((k) => todos[k]);
  let activeTodoListCount = todoList.filter(({ status }) => status === "active")
    .length;

  if (nowShowing !== "all") {
    todoList = todoList.filter(({ status }) => status === nowShowing);
  }

  return html`
    <div class="todoapp" id="app">
      <h1
        id="appName"
        contenteditable="true"
        onBlur=${(e) => {
          put("name", e.target.innerText);
          e.target.innerText = "";
        }}
      >
        ${name || "[Add new name]"}
      </h1>
      <input
        class="new-todo"
        onChange="${addTodo}"
        type="text"
        placeholder="What needs to be done?"
      />
      <section class="main">
        <${TodoList}
          todos=${todoList}
          removeTodo=${removeTodo}
          changeStatus=${changeStatus}
          addTodo=${addTodo}
          updateTodo=${updateTodo}
        />
      </section>
      <${Footer}
        activeTodoCount=${activeTodoListCount}
        nowShowing=${nowShowing}
        setNowShowing=${setNowShowing}
      />
    </div>
  `;
};
