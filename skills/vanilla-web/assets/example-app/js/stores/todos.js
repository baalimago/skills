import { Store } from '#lib/store.js';

/** @typedef {{ id: string, title: string, done: boolean }} Todo */

const KEY = 'acme:todos';

/** @returns {Todo[]} */
function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** @extends {Store<Todo[]>} */
class TodoStore extends Store {
  constructor() {
    super(read());
    window.addEventListener('storage', (event) => {
      if (event.key === KEY) super.commit(read());
    });
  }

  get items() {
    return this.state;
  }

  /** @param {Todo[]} next */
  commit(next) {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Storage full or blocked: keep the state in memory for this tab.
    }
    super.commit(next);
  }

  /** @param {string} title */
  add(title) {
    this.commit([...this.items, { id: crypto.randomUUID(), title, done: false }]);
  }

  /**
   * @param {string} id
   * @param {boolean} done
   */
  setDone(id, done) {
    this.commit(this.items.map((todo) => (todo.id === id ? { ...todo, done } : todo)));
  }

  /** @param {string} id */
  remove(id) {
    this.commit(this.items.filter((todo) => todo.id !== id));
  }
}

export const todos = new TodoStore();
