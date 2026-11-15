const { test } = require("node:test");
const assert = require("node:assert/strict");
const { mkdtempSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const path = require("node:path");
const { createApp } = require("./server.cjs");

test("persistent API isolates sessions, validates input and detects conflicting writes", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "clutch-api-"));
  const database = path.join(dir, "state.sqlite");
  let app = createApp({ database });
  await new Promise((resolve) => app.listen(0, "127.0.0.1", resolve));
  let base = `http://127.0.0.1:${app.address().port}`;
  const request = async (
    route,
    { token, method = "GET", body, origin } = {},
  ) => {
    const response = await fetch(base + route, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(origin ? { Origin: origin } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, data: await response.json() };
  };
  try {
    assert.equal((await request("/api/health")).data.storage, "sqlite");
    assert.equal((await request("/api/state")).status, 401);
    assert.equal(
      (
        await request("/api/session", {
          method: "POST",
          origin: "https://evil.example",
        })
      ).status,
      403,
    );
    const a = (await request("/api/session", { method: "POST" })).data.token;
    const b = (await request("/api/session", { method: "POST" })).data.token;
    const message = {
      id: "test-1",
      type: "text",
      text: "See you at the trail",
      userId: 1,
    };
    assert.equal(
      (
        await request("/api/state/messages", {
          token: a,
          method: "PUT",
          body: { revision: 0, value: [message] },
        })
      ).status,
      200,
    );
    assert.deepEqual(
      (await request("/api/state", { token: b })).data.documents,
      {},
    );
    assert.equal(
      (
        await request("/api/state/messages", {
          token: a,
          method: "PUT",
          body: { revision: 0, value: [] },
        })
      ).status,
      409,
    );
    assert.equal(
      (
        await request("/api/state/messages", {
          token: a,
          method: "PUT",
          body: { revision: 1, value: [message, message] },
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await request("/api/state/preferences", {
          token: a,
          method: "PUT",
          body: { revision: 0, value: { group: "bad" } },
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await request("/api/state/game", {
          token: a,
          method: "PUT",
          body: { revision: 0, value: { sent: 4 } },
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await request("/api/state/runs", {
          token: a,
          method: "PUT",
          body: {
            revision: 0,
            value: [{ id: "run", seconds: -1, routeId: "r1" }],
          },
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await request("/api/state/html", {
          token: a,
          method: "PUT",
          body: { revision: 0, value: { group: "g1", messages: [] } },
        })
      ).status,
      200,
    );
    assert.equal(
      (await request("/api/score", { token: a, method: "POST", body: {} }))
        .status,
      400,
    );
    const score = await request("/api/score", {
      token: a,
      method: "POST",
      body: { hrv: {}, rhr: {}, sleep: {}, steps: {} },
    });
    assert.equal(score.status, 200);
    assert.equal(score.data.verified, false);
    await new Promise((resolve) => app.close(resolve));
    app = createApp({ database });
    await new Promise((resolve) => app.listen(0, "127.0.0.1", resolve));
    base = `http://127.0.0.1:${app.address().port}`;
    const restored = (await request("/api/state", { token: a })).data.documents;
    assert.equal(restored.messages.value[0].text, message.text);
    assert.equal(restored.messages.revision, 1);
    assert.equal(restored.html.value.group, "g1");
  } finally {
    await new Promise((resolve) => app.close(resolve));
    rmSync(dir, { recursive: true, force: true });
  }
});
