let todos = [];
let nextId = 1;

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default {
  async fetch(request) {
    const { pathname } = new URL(request.url);
    const method = request.method;

    if (method === "GET" && pathname === "/") {
      return new Response("OK");
    }

    if (method === "GET" && pathname === "/todos") {
      return jsonResponse({ todos });
    }

    if (method === "POST" && pathname === "/todos") {
      let body;
      try {
        body = await request.json();
      } catch {
        return jsonResponse({ error: "invalid JSON body" }, 400);
      }

      const title = body && body.title;
      if (typeof title !== "string" || title.trim().length === 0) {
        return jsonResponse({ error: "title is required" }, 400);
      }

      const todo = {
        id: nextId++,
        title: title.trim(),
        done: false,
        createdAt: new Date().toISOString(),
      };
      todos.push(todo);
      return jsonResponse(todo, 201);
    }

    const doneMatch = pathname.match(/^\/todos\/(\d+)\/done$/);
    if (method === "POST" && doneMatch) {
      const id = Number(doneMatch[1]);
      const todo = todos.find((t) => t.id === id);
      if (!todo) {
        return jsonResponse({ error: "todo not found" }, 404);
      }
      todo.done = true;
      return jsonResponse(todo);
    }

    return jsonResponse({ error: "not found" }, 404);
  },
};
