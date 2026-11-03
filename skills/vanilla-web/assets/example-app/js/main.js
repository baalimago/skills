import { lazyDefine } from '#lib/lazy-define.js';

lazyDefine('todo-list', () => import('#components/todo-list/todo-list.js'));
lazyDefine('user-card', () => import('#components/user-card/user-card.js'));
