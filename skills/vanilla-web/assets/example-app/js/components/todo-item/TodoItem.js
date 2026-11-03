import { find } from '#lib/dom.js';

export class TodoItem extends HTMLElement {
  /** @type {AbortController | undefined} */
  #connected;

  connectedCallback() {
    this.#connected = new AbortController();
    const { signal } = this.#connected;
    const done = find(this, '[name=done]', HTMLInputElement);
    const remove = find(this, '[data-remove]', HTMLButtonElement);
    done.addEventListener('change', () => this.#emit('toggle', { done: done.checked }), { signal });
    remove.addEventListener('click', () => this.#emit('remove'), { signal });
  }

  disconnectedCallback() {
    this.#connected?.abort();
  }

  /**
   * @param {'toggle' | 'remove'} verb
   * @param {{ done?: boolean }} [detail]
   */
  #emit(verb, detail = {}) {
    const id = this.dataset.id ?? '';
    this.dispatchEvent(
      new CustomEvent(`todo-item:${verb}`, { bubbles: true, detail: { id, ...detail } }),
    );
  }
}
