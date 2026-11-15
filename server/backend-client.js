/* Original HTML demo persistence. Same SQLite API as the native app. */
window.ClutchStore = {
  async open(key) {
    const storageKey = "@clutch/backend-session";
    let token = localStorage.getItem(storageKey) || "";
    const call = async (path, options = {}) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      try {
        const r = await fetch(path, {
          ...options,
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await r.json();
        if (!r.ok) throw new Error(result.error || "Save failed");
        return result;
      } finally {
        clearTimeout(timer);
      }
    };
    if (!token) {
      const session = await call("/api/session", { method: "POST" });
      token = session.token;
      localStorage.setItem(storageKey, token);
    }
    const { documents } = await call("/api/state");
    let revision = documents[key]?.revision || 0;
    return {
      value: documents[key]?.value,
      async save(value) {
        const result = await call("/api/state/" + key, {
          method: "PUT",
          body: JSON.stringify({ revision, value }),
        });
        revision = result.revision;
      },
    };
  },
};
