import type { TodoItem } from './js/components/todo-item/TodoItem.js';
import type { TodoList } from './js/components/todo-list/TodoList.js';
import type { UserCard } from './js/components/user-card/UserCard.js';

declare global {
  interface HTMLElementTagNameMap {
    'todo-item': TodoItem;
    'todo-list': TodoList;
    'user-card': UserCard;
  }

  interface HTMLElementEventMap {
    'todo-item:toggle': CustomEvent<{ id: string; done: boolean }>;
    'todo-item:remove': CustomEvent<{ id: string }>;
  }
}

export {};
