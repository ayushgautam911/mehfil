const BASE_URL = (import.meta as any).env?.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api/v1' 
    : '/api/v1');

export const getToken = () => localStorage.getItem('hive_token');
export const setToken = (token: string) => localStorage.setItem('hive_token', token);

export const getStoredCollective = () => {
  const raw = localStorage.getItem('hive_collective');
  return raw ? JSON.parse(raw) : null;
};
export const setStoredCollective = (collective: any) => {
  localStorage.setItem('hive_collective', JSON.stringify(collective));
};

export const getStoredUser = () => {
  const raw = localStorage.getItem('hive_user');
  return raw ? JSON.parse(raw) : null;
};
export const setStoredUser = (user: any) => {
  localStorage.setItem('hive_user', JSON.stringify(user));
};

export const logout = () => {
  localStorage.removeItem('hive_token');
  localStorage.removeItem('hive_collective');
  localStorage.removeItem('hive_user');
};

async function apiRequest(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const parsed = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(parsed.error?.message || `API error: ${res.status}`);
  }

  return parsed;
}

// Multipart upload — no JSON Content-Type (the browser sets the multipart
// boundary itself), otherwise same auth/error handling as apiRequest.
async function apiUpload(path: string, file: File) {
  const token = getToken();
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });

  const parsed = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(parsed.error?.message || `API error: ${res.status}`);
  }
  return parsed;
}

export const api = {
  uploads: {
    // Returns the public URL of the stored image.
    eventImage: async (file: File): Promise<string> => {
      const res = await apiUpload('/uploads/event-image', file);
      return res.data.url;
    },
  },
  auth: {
    signup: async (payload: any) => {
      const res = await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.data?.token) {
        setToken(res.data.token);
        setStoredCollective(res.data.collective);
        setStoredUser(res.data.user);
      }
      return res.data;
    },
    login: async (payload: any) => {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.data?.token) {
        setToken(res.data.token);
        setStoredCollective(res.data.collective);
        setStoredUser(res.data.user);
      }
      return res.data;
    },
  },
  collectives: {
    getMine: async () => {
      const res = await apiRequest('/collectives/mine');
      if (res.data) {
        setStoredCollective(res.data);
      }
      return res.data;
    },
    getMembers: async (collectiveId: string) => {
      const res = await apiRequest(`/collectives/${collectiveId}/members`);
      return res.data;
    },
    addMember: async (collectiveId: string, payload: { displayName: string; email: string; phone?: string }) => {
      const res = await apiRequest(`/collectives/${collectiveId}/members`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.data;
    },
    updateMemberStatus: async (collectiveId: string, userId: string, status: 'active' | 'blocked') => {
      const res = await apiRequest(`/collectives/${collectiveId}/members/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      return res.data;
    },
  },
  events: {
    list: async (collectiveId: string) => {
      const res = await apiRequest(`/collectives/${collectiveId}/events`);
      return res.data;
    },
    create: async (collectiveId: string, payload: { name: string; date: string; time: string; endTime?: string; venue: string; venueAddress?: string; status: 'published' | 'draft'; capacity: number; description?: string; imageUrl?: string; addressRevealAt?: string; lineup?: string[]; genres?: string[] }) => {
      const res = await apiRequest(`/collectives/${collectiveId}/events`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.data;
    },
    update: async (collectiveId: string, eventId: string, payload: { name: string; date: string; time: string; endTime?: string; venue: string; venueAddress?: string; status?: 'published' | 'draft'; capacity: number; description?: string; imageUrl?: string; addressRevealAt?: string; lineup?: string[]; genres?: string[] }) => {
      const res = await apiRequest(`/collectives/${collectiveId}/events/${eventId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      return res.data;
    },
  },
  passes: {
    send: async (eventId: string, memberId: string) => {
      const res = await apiRequest(`/events/${eventId}/passes/send`, {
        method: 'POST',
        body: JSON.stringify({ memberId }),
      });
      return res.data;
    },
    scan: async (qrPayload: string) => {
      const res = await apiRequest('/passes/scan', {
        method: 'POST',
        body: JSON.stringify({ qrPayload }),
      });
      return res.data;
    },
  },
  templates: {
    list: async (collectiveId: string) => {
      const res = await apiRequest(`/collectives/${collectiveId}/templates`);
      return res.data;
    },
    create: async (collectiveId: string, payload: { name: string; subject: string; body: string }) => {
      const res = await apiRequest(`/collectives/${collectiveId}/templates`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.data;
    },
    update: async (collectiveId: string, templateId: string, payload: { name?: string; subject?: string; body?: string }) => {
      const res = await apiRequest(`/collectives/${collectiveId}/templates/${templateId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      return res.data;
    },
    delete: async (collectiveId: string, templateId: string) => {
      const res = await apiRequest(`/collectives/${collectiveId}/templates/${templateId}`, {
        method: 'DELETE',
      });
      return res.data;
    },
  },
  email: {
    send: async (collectiveId: string, payload: { subject: string; bodyHtml: string; recipientGroup: string; eventId: string }) => {
      const res = await apiRequest(`/collectives/${collectiveId}/email/send`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.data;
    },
  },
};

