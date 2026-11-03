import '#components/todo-item/todo-item.js';
import { TodoList } from './TodoList.js';

if (!customElements.get('todo-list')) customElements.define('todo-list', TodoList);
