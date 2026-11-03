/**
 * Find a required descendant; throw when markup and code have drifted.
 * @template {Element} T
 * @param {ParentNode} root
 * @param {string} selector
 * @param {{ new (): T, prototype: T }} type
 * @returns {T}
 */
export function find(root, selector, type) {
  const element = root.querySelector(selector);
  if (!(element instanceof type)) {
    throw new TypeError(`Expected ${type.name} at "${selector}"`);
  }
  return element;
}
