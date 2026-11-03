/**
 * Owns one slice of state and announces every change.
 * @template T
 */
export class Store extends EventTarget {
  /** @type {T} */
  #state;

  /** @param {T} initial */
  constructor(initial) {
    super();
    this.#state = Object.freeze(initial);
  }

  get state() {
    return this.#state;
  }

  /** @param {T} next */
  commit(next) {
    this.#state = Object.freeze(next);
    this.dispatchEvent(new Event('change'));
  }
}
