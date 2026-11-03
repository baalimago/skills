import { UserCard } from './UserCard.js';

if (!customElements.get('user-card')) customElements.define('user-card', UserCard);
