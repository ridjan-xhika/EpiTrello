// Get API URL from environment variable or use default
// In production builds, process.env is replaced at build time
// eslint-disable-next-line no-undef
const API_URL = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) 
  ? process.env.REACT_APP_API_URL 
  : 'http://localhost:5000/api';

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

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { error: text || 'Server error' };
      }

      if (!response.ok) {
        // If unauthorized, clear token
        if (response.status === 401) {
          this.setToken(null);
        }
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      // Network error or fetch failed
      if (error instanceof TypeError) {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
      throw error;
    }
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

  async createBoard(data) {
    // Support both string (legacy) and object formats
    const payload = typeof data === 'string' ? { title: data } : data;
    return this.request('/boards', {
      method: 'POST',
      body: JSON.stringify(payload),
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

  async updateCard(cardId, data) {
    // Support both old format (title, description) and new format (data object)
    const payload = typeof data === 'string' 
      ? { title: data, description: arguments[2] } 
      : data;
    
    return this.request(`/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
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

  // Card details
  async getCard(cardId) {
    return this.request(`/cards/${cardId}`);
  }

  // Card labels
  async addCardLabel(cardId, name, color) {
    return this.request(`/cards/${cardId}/labels`, {
      method: 'POST',
      body: JSON.stringify({ name, color }),
    });
  }

  async removeCardLabel(cardId, labelId) {
    return this.request(`/cards/${cardId}/labels/${labelId}`, {
      method: 'DELETE',
    });
  }

  // Card members
  async addCardMember(cardId, userId) {
    return this.request(`/cards/${cardId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async removeCardMember(cardId, userId) {
    return this.request(`/cards/${cardId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  // Card checklists
  async addChecklist(cardId, title) {
    return this.request(`/cards/${cardId}/checklists`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  }

  async deleteChecklist(cardId, checklistId) {
    return this.request(`/cards/${cardId}/checklists/${checklistId}`, {
      method: 'DELETE',
    });
  }

  async addChecklistItem(cardId, checklistId, text, assigned_to = null, due_date = null) {
    return this.request(`/cards/${cardId}/checklists/${checklistId}/items`, {
      method: 'POST',
      body: JSON.stringify({ text, assigned_to, due_date }),
    });
  }

  async updateChecklistItem(cardId, checklistId, itemId, data) {
    return this.request(`/cards/${cardId}/checklists/${checklistId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteChecklistItem(cardId, checklistId, itemId) {
    return this.request(`/cards/${cardId}/checklists/${checklistId}/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Card comments
  async getCardComments(cardId) {
    return this.request(`/cards/${cardId}/comments`);
  }

  async addCardComment(cardId, comment) {
    return this.request(`/cards/${cardId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  }

  async deleteCardComment(cardId, commentId) {
    return this.request(`/cards/${cardId}/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  // Card activity
  async getCardActivity(cardId) {
    return this.request(`/cards/${cardId}/activity`);
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

  // Profile endpoints
  async getProfile() {
    return this.request('/profile/me');
  }

  async getUserProfile(userId) {
    return this.request(`/profile/${userId}`);
  }

  async updateProfile(profileData) {
    return this.request('/profile/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async updatePassword(passwordData) {
    return this.request('/profile/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  // Sharing endpoints
  async getBoardMembers(boardId) {
    return this.request(`/sharing/${boardId}/members`);
  }

  async inviteToBoard(boardId, email, role) {
    return this.request(`/sharing/${boardId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  }

  async getPendingInvitations() {
    return this.request('/sharing/invitations');
  }

  async acceptInvitation(token) {
    return this.request(`/sharing/invitations/${token}/accept`, {
      method: 'POST',
    });
  }

  async declineInvitation(token) {
    return this.request(`/sharing/invitations/${token}/decline`, {
      method: 'POST',
    });
  }

  async updateMemberRole(boardId, userId, role) {
    return this.request(`/sharing/${boardId}/members/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async removeMember(boardId, userId) {
    return this.request(`/sharing/${boardId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  async getBoardRole(boardId) {
    return this.request(`/sharing/${boardId}/role`);
  }

  // Organizations
  async getOrganizations() {
    return this.request('/organizations');
  }

  async getOrganization(id) {
    return this.request(`/organizations/${id}`);
  }

  async createOrganization(data) {
    return this.request('/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrganization(id, data) {
    return this.request(`/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOrganization(id) {
    return this.request(`/organizations/${id}`, {
      method: 'DELETE',
    });
  }

  async getOrganizationMembers(id) {
    return this.request(`/organizations/${id}/members`);
  }

  async inviteToOrganization(id, email, role) {
    return this.request(`/organizations/${id}/invite`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  }

  async getOrganizationInvitations(id) {
    return this.request(`/organizations/${id}/invitations`);
  }

  async acceptOrganizationInvitation(token) {
    return this.request(`/organizations/invitations/${token}/accept`, {
      method: 'POST',
    });
  }

  async updateOrganizationMemberRole(orgId, userId, role) {
    return this.request(`/organizations/${orgId}/members/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async removeOrganizationMember(orgId, userId) {
    return this.request(`/organizations/${orgId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  async getOrganizationBoards(id) {
    return this.request(`/organizations/${id}/boards`);
  }

  logout() {
    this.setToken(null);
  }
}

export default new ApiService();