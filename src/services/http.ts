type RequestOptions = RequestInit & {
  auth?: boolean;
};

const getApiBaseUrl = () => {
  const configured = import.meta.env.VITE_API_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  if (typeof window === "undefined") {
    return "";
  }

  const { protocol, hostname, port } = window.location;
  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

  if (protocol === "file:" || (isLocalHost && port && port !== "5000")) {
    return "http://localhost:5000";
  }

  return "";
};

const resolveUrl = (url: string) => {
  if (!url.startsWith("/api")) {
    return url;
  }

  const base = getApiBaseUrl();
  return base ? `${base}${url}` : url;
};

const getToken = () => {
  const raw = localStorage.getItem("taskify-session");
  if (!raw) return "";

  try {
    const parsed = JSON.parse(raw) as { token?: string };
    return parsed.token || "";
  } catch {
    return "";
  }
};

export const request = async <T>(url: string, options: RequestOptions = {}): Promise<T> => {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (options.auth !== false) {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  let response: Response;
  try {
    response = await fetch(resolveUrl(url), {
      ...options,
      headers,
    });
  } catch {
    throw new Error("Unable to reach the Taskify API. Make sure the backend is running.");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || "Something went wrong.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
};
