import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cc_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("cc_token");
      localStorage.removeItem("cc_user");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login:    (data) => api.post("/auth/login", data),
  getMe:    ()     => api.get("/auth/me"),
};

export const moodAPI = {
  log:      (data) => api.post("/mood", data),
  getAll:   ()     => api.get("/mood"),
  getStats: ()     => api.get("/mood/stats"),
};

export const bookingAPI = {
  create: (data) => api.post("/bookings", data),
  getAll: ()     => api.get("/bookings"),
  cancel: (id)   => api.patch(`/bookings/${id}/cancel`),
};

export const forumAPI = {
  getPosts:   (params) => api.get("/forum", { params }),
  createPost: (data)   => api.post("/forum", data),
  like:       (id)     => api.post(`/forum/${id}/like`),
  reply:      (id, content) => api.post(`/forum/${id}/reply`, { content }),
};

export const chatbotAPI = {
  send: (messages) => api.post("/chatbot", { messages }),
};

export const counsellorAPI = {
  getAll: ()         => api.get("/counsellors"),
  create: (data)     => api.post("/counsellors", data),
  update: (id, data) => api.patch(`/counsellors/${id}`, data),
  remove: (id)       => api.delete(`/counsellors/${id}`),
};

export const noticeAPI = {
  getAll:    ()     => api.get("/notices"),
  create:    (data) => api.post("/notices", data),
  remove:    (id)   => api.delete(`/notices/${id}`),
  togglePin: (id)   => api.patch(`/notices/${id}/pin`),
};

export const alertAPI = {
  getActive:  ()     => api.get("/alerts"),
  getAll:     ()     => api.get("/alerts/all"),
  getCount:   ()     => api.get("/alerts/count"),
  resolve:    (id, notes) => api.patch(`/alerts/${id}/resolve`, { notes }),
};

export const adminAPI = {
  getStats:           ()           => api.get("/admin/stats"),
  getAllPosts:         ()           => api.get("/admin/posts"),
  removePost:         (id)         => api.patch(`/admin/posts/${id}/remove`),
  updateBookingStatus:(id, status) => api.patch(`/admin/bookings/${id}/status`, { status }),
};

export default api;