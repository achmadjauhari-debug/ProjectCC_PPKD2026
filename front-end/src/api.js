const BASE = import.meta.env.VITE_API_URL || "https://stunning-pancake-xrv9v44x6g493v6pj-4000.app.github.dev/api/v1";

export class ApiError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors || {};
  }
}

export const getToken = () => localStorage.getItem("ccp_token");

export const setSession = (token, user) => {
  if (token) {
    localStorage.setItem("ccp_token", token);
    localStorage.setItem("ccp_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("ccp_token");
    localStorage.removeItem("ccp_user");
  }
};

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

async function request(path, { method = "GET", body, params } = {}) {
  const qs = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params).filter(([, v]) => v),
      ).toString()
    : "";
  let res;
  try {

    // 🌟 PERBAIKAN: Menghapus garis miring berlebih agar URL tergabung dengan rapi
    const cleanBase = BASE.endsWith("/") ? BASE.slice(0, -1) : BASE;
    const cleanPath = path.startsWith("/") ? path : "/" + path;

    res = await fetch(cleanBase + cleanPath + qs, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      0,
      "Tidak bisa terhubung ke server. Pastikan backend berjalan.",
    );
  }
  if (res.status === 204) return null;
  
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && getToken()) {
      setSession(null);
      onUnauthorized();
    }
    throw new ApiError(
      res.status,
      data.message || "Terjadi kesalahan.",
      data.errors,
    );
  }
  return data;
}

export const api = {
  register: (b) => request("/auth/register", { method: "POST", body: b }),
  login: (b) => request("/auth/login", { method: "POST", body: b }),
  channels: () => request("/channels"),
  addChannel: (b) => request("/channels", { method: "POST", body: b }),
  contents: (params) => request("/contents", { params }),
  content: (id) => request(`/contents/${id}`),
  createContent: (b) => request("/contents", { method: "POST", body: b }),
  updateContent: (id, b) =>
    request(`/contents/${id}`, { method: "PATCH", body: b }),
  deleteContent: (id) => request(`/contents/${id}`, { method: "DELETE" }),
  addChecklist: (id, b) =>
    request(`/contents/${id}/checklists`, { method: "POST", body: b }),
  toggleChecklist: (id) =>
    request(`/checklists/${id}/toggle`, { method: "PATCH" }),
  deleteChecklist: (id) => request(`/checklists/${id}`, { method: "DELETE" }),
  addMetric: (id, b) =>
    request(`/contents/${id}/metrics`, { method: "POST", body: b }),
};
