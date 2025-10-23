const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }

    return data;
  }

  // Auth endpoints
  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    this.setToken(data.token);
    return data;
  }

  async login(credentials) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(data.token);
    return data;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Board endpoints
  async getBoards() {
    return this.request('/boards');
  }

  async getBoard(boardId) {
    return this.request(`/boards/${boardId}`);
  }

  async createBoard(title) {
    return this.request('/boards', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  }

  async deleteBoard(boardId) {
    return this.request(`/boards/${boardId}`, {
      method: 'DELETE',
    });
  }

  // Column endpoints
  async createColumn(boardId, title) {
    return this.request('/columns', {
      method: 'POST',
      body: JSON.stringify({ boardId, title }),
    });
  }

  async updateColumn(columnId, title) {
    return this.request(`/columns/${columnId}`, {
      method: 'PUT',
      body: JSON.stringify({ title }),
    });
  }

  async deleteColumn(columnId) {
    return this.request(`/columns/${columnId}`, {
      method: 'DELETE',
    });
  }

  // Card endpoints
  async createCard(boardId, columnId, title, description) {
    return this.request('/cards', {
      method: 'POST',
      body: JSON.stringify({ boardId, columnId, title, description }),
    });
  }

  async updateCard(cardId, title, description) {
    return this.request(`/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify({ title, description }),
    });
  }

  async deleteCard(cardId) {
    return this.request(`/cards/${cardId}`, {
      method: 'DELETE',
    });
  }

  async reorderCard(boardId, cardId, sourceColumnId, destColumnId, sourceIndex, destIndex) {
    return this.request('/cards/reorder', {
      method: 'POST',
      body: JSON.stringify({ boardId, cardId, sourceColumnId, destColumnId, sourceIndex, destIndex }),
    });
  }

  // List endpoints
  async getLists() {
    return this.request('/lists');
  }

  async createList(name) {
    return this.request('/lists', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async updateList(listId, name) {
    return this.request(`/lists/${listId}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  async deleteList(listId) {
    return this.request(`/lists/${listId}`, {
      method: 'DELETE',
    });
  }

  logout() {
    this.setToken(null);
  }
}

export default new ApiService();