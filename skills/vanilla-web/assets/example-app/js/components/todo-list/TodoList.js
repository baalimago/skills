import { find } from '#lib/dom.js';
import { todos } from '#stores/todos.js';
import { TodoItem } from '#components/todo-item/TodoItem.js';

export class TodoList extends HTMLElement {
  /** @type {AbortController | undefined} */
  #connected;

  connectedCallback() {
    this.#connected = new AbortController();
    const { signal } = this.#connected;
    const form = find(this, 'form', HTMLFormElement);

    form.addEventListener(
      'submit',
      (event) => {
        event.preventDefault();
        const title = String(new FormData(form).get('title')).trim();
        todos.add(title);
        form.reset();
        this.#announce(`Added ${title}.`);
      },
      { signal },
    );
    this.addEventListener(
      'todo-item:toggle',
      ({ detail }) => todos.setDone(detail.id, detail.done),
      { signal },
    );
    this.addEventListener('todo-item:remove', ({ detail }) => this.#remove(detail.id), {
      signal,
    });
    todos.addEventListener('change', () => this.#render(), { signal });
    this.#adoptEarlySubmit();
    this.#render();
  }

  disconnectedCallback() {
    this.#connected?.abort();
  }

  // A submit before upgrade navigated natively; finish it instead of losing the input.
  #adoptEarlySubmit() {
    const url = new URL(location.href);
    const title = url.searchParams.get('title')?.trim();
    if (!title) return;
    url.searchParams.delete('title');
    history.replaceState(history.state, '', url);
    todos.add(title);
    this.#announce(`Added ${title}.`);
  }

  /** @param {string} id */
  #remove(id) {
    const index = todos.items.findIndex((todo) => todo.id === id);
    const title = todos.items[index]?.title ?? '';
    todos.remove(id);
    const boxes = this.querySelectorAll('[name=done]');
    const next = boxes[Math.min(index, boxes.length - 1)];
    const fallback = find(this, '[name=title]', HTMLInputElement);
    (next instanceof HTMLInputElement ? next : fallback).focus();
    this.#announce(`Removed ${title}.`);
  }

  #render() {
    const list = find(this, '[data-items]', HTMLUListElement);
    const ids = new Set(todos.items.map((todo) => todo.id));
    for (const item of list.querySelectorAll('todo-item')) {
      if (!ids.has(item.dataset.id ?? '')) item.closest('li')?.remove();
    }
    for (const todo of todos.items) {
      const existing = list.querySelector(`todo-item[data-id="${CSS.escape(todo.id)}"]`);
      const item = existing instanceof TodoItem ? existing : this.#stamp(list, todo);
      find(item, '[name=done]', HTMLInputElement).checked = todo.done;
    }
  }

  /**
   * @param {HTMLUListElement} list
   * @param {import('#stores/todos.js').Todo} todo
   */
  #stamp(list, todo) {
    const template = find(this, 'template[data-item]', HTMLTemplateElement);
    const fragment = document.importNode(template.content, true);
    const item = find(fragment, 'todo-item', TodoItem);
    item.dataset.id = todo.id;
    for (const title of item.querySelectorAll('[data-title]')) title.textContent = todo.title;
    list.append(fragment);
    return item;
  }

  /** @param {string} message */
  #announce(message) {
    find(this, '[data-status]', HTMLElement).textContent = message;
  }
}
