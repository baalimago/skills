import { TodoItem } from './TodoItem.js';

if (!customElements.get('todo-item')) customElements.define('todo-item', TodoItem);
