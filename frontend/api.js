// Backend is mounted in-process on the same port as this frontend (see
// server.js), so by default we just call ourselves.
const API_URL = process.env.API_URL || `http://localhost:${process.env.PORT || 3000}`;

const IMAGE_FALLBACK =
  "https://images.pexels.com/photos/38944866/pexels-photo-38944866.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
const HERO_IMAGE = "/img/hero.jpg";

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const api = {
  login: (body) =>
    fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(handle),

  listApproved: () => fetch(`${API_URL}/api/tractors`).then(handle),

  getTractor: (id) => fetch(`${API_URL}/api/tractors/${id}`).then(handle),

  submitTractor: (formData) =>
    fetch(`${API_URL}/api/tractors`, {
      method: "POST",
      body: formData,
    }).then(handle),

  allListings: (token) =>
    fetch(`${API_URL}/api/tractors/admin/all`, { headers: authHeaders(token) }).then(handle),

  setStatus: (token, id, body) =>
    fetch(`${API_URL}/api/tractors/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify(body),
    }).then(handle),

  imageUrl: (path) => (path ? `${API_URL}${path}` : IMAGE_FALLBACK),

  listServices: () => fetch(`${API_URL}/api/services`).then(handle),

  createService: (token, body) =>
    fetch(`${API_URL}/api/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify(body),
    }).then(handle),

  updateService: (token, id, body) =>
    fetch(`${API_URL}/api/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify(body),
    }).then(handle),

  deleteService: (token, id) =>
    fetch(`${API_URL}/api/services/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    }).then(handle),

  submitContact: (body) =>
    fetch(`${API_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(handle),

  allMessages: (token) => fetch(`${API_URL}/api/contact/admin/all`, { headers: authHeaders(token) }).then(handle),

  setMessageStatus: (token, id, body) =>
    fetch(`${API_URL}/api/contact/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify(body),
    }).then(handle),
};

module.exports = { api, API_URL, IMAGE_FALLBACK, HERO_IMAGE };
