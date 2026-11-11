import { lazyDefine } from '#lib/lazy-define.js';

lazyDefine('todo-list', () => import('#components/todo-list/todo-list.js'));
lazyDefine('user-card', () => import('#components/user-card/user-card.js'));

// Fallback for engines without invoker commands: rung 4 of the ladder in
// ../../../references/interaction.md.
if (!('commandForElement' in HTMLButtonElement.prototype)) {
  /** @type {Record<string, (el: HTMLElement) => void>} */
  const commands = {
    'show-modal': (el) => /** @type {HTMLDialogElement} */ (el).showModal(),
    close: (el) => /** @type {HTMLDialogElement} */ (el).close(),
    'toggle-popover': (el) => el.togglePopover(),
    'show-popover': (el) => el.showPopover(),
    'hide-popover': (el) => el.hidePopover(),
  };
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest('[commandfor]');
    const command = button?.getAttribute('command') ?? '';
    const element = document.getElementById(button?.getAttribute('commandfor') ?? '');
    if (element) commands[command]?.(element);
  });
}
