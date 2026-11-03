/**
 * Import a tag's registration module when an instance nears the viewport
 * or the user reaches for it, whichever comes first.
 * @param {string} tag
 * @param {() => Promise<unknown>} load
 */
export function lazyDefine(tag, load) {
  const instances = document.querySelectorAll(`${tag}:not(:defined)`);
  if (instances.length === 0) return;
  const start = () => {
    observer.disconnect();
    load().catch((error) => console.error(`lazyDefine(${tag})`, error));
  };
  const observer = new IntersectionObserver(
    (entries) => entries.some((entry) => entry.isIntersecting) && start(),
    { rootMargin: '200px' },
  );
  for (const instance of instances) {
    observer.observe(instance);
    for (const type of ['pointerover', 'focusin']) {
      instance.addEventListener(type, start, { once: true });
    }
  }
}
