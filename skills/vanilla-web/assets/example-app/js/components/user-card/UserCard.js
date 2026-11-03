import { find } from '#lib/dom.js';
import { fetchJSON } from '#lib/fetch.js';

/**
 * @typedef {object} Profile
 * @property {string} name
 * @property {string} bio
 * @property {{ date: string, text: string }[]} activity
 */

export class UserCard extends HTMLElement {
  static observedAttributes = ['src'];

  #internals = this.attachInternals();
  /** @type {AbortController | undefined} */
  #connected;
  /** @type {AbortController | undefined} */
  #request;

  get src() {
    return this.getAttribute('src') ?? '';
  }

  set src(value) {
    this.setAttribute('src', value);
  }

  connectedCallback() {
    const early = Object.getOwnPropertyDescriptor(this, 'src');
    if (early) {
      Reflect.deleteProperty(this, 'src');
      this.src = early.value;
    }
    this.#connected = new AbortController();
    this.#refresh();
  }

  disconnectedCallback() {
    this.#connected?.abort();
  }

  attributeChangedCallback() {
    if (this.#connected && !this.#connected.signal.aborted) this.#refresh();
  }

  async #refresh() {
    if (!this.src || !this.#connected) return;
    this.#request?.abort();
    this.#request = new AbortController();
    const signal = AbortSignal.any([this.#connected.signal, this.#request.signal]);
    try {
      const profile = /** @type {Profile} */ (await fetchJSON(this.src, { signal }));
      this.#render(profile);
      this.#internals.states?.delete('stale');
    } catch (error) {
      if (signal.aborted) return;
      this.#internals.states?.add('stale');
      console.warn('user-card: keeping the last known profile', error);
    }
  }

  /** @param {Profile} profile */
  #render(profile) {
    find(this, '[slot=name]', HTMLElement).textContent = profile.name;
    find(this, '[slot=bio]', HTMLElement).textContent = profile.bio;
    const format = new Intl.DateTimeFormat(document.documentElement.lang, {
      dateStyle: 'long',
      timeZone: 'UTC',
    });
    const items = profile.activity.map(({ date, text }) => {
      const time = document.createElement('time');
      time.dateTime = date;
      time.textContent = format.format(new Date(date));
      const item = document.createElement('li');
      item.append(time, ` ${text}`);
      return item;
    });
    find(this, '[data-activity]', HTMLUListElement).replaceChildren(...items);
  }
}
