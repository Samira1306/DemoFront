/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";

// -----------------------------------------------------------------------------
// DOM mínimo necesario para que app.js no falle al cargarse
// -----------------------------------------------------------------------------
beforeEach(() => {
  document.body.innerHTML = `
    <div id="loading" class="hidden"></div>
    <div id="toast-container"></div>

    <!-- elementos usados por renderTasks -->
    <ul id="pending-list"></ul>
    <ul id="completed-list"></ul>
    <div id="pending-empty" class="hidden"></div>
    <div id="completed-empty" class="hidden"></div>
    <span id="pending-count"></span>
    <span id="completed-count"></span>
    <span id="total-count"></span>

    <!-- modal -->
    <div id="modal" class="hidden"></div>
    <span id="modal-title"></span>
    <input id="modal-title-input" />
    <input id="modal-desc-input" />
    <input id="modal-due-input" />
    <select id="modal-priority-input"></select>
    <select id="modal-status-input"></select>

    <button id="modal-cancel"></button>
    <form id="modal-form"></form>

    <!-- botones -->
    <button id="open-create"></button>

    <!-- search -->
    <input id="search" />
  `;

  // mocks globales
  global.fetch = jest.fn();
  global.showToast = jest.fn();
  global.load = jest.fn();
});

// IMPORTAMOS TU CÓDIGO DESPUÉS de crear el DOM
import {
    createTask,
    deleteTask,
    fetchTasks,
    isCompleted,
    makeTaskElement,
    toggleComplete
} from "../../src/ui/frontend/app.js";


// -----------------------------------------------------------------------------
// isCompleted()
// -----------------------------------------------------------------------------
describe("isCompleted()", () => {

  test("devuelve true si status = 1", () => {
    expect(isCompleted({ status: 1 })).toBe(true);
  });

  test("devuelve false si status = 0", () => {
    expect(isCompleted({ status: 0 })).toBe(false);
  });

  test("usa 'completed' si no hay status", () => {
    expect(isCompleted({ completed: true })).toBe(true);
  });

});

// -----------------------------------------------------------------------------
// fetchTasks()
// -----------------------------------------------------------------------------
describe("fetchTasks()", () => {

  test("devuelve tareas si fetch es correcto", async () => {
    const data = [{ title: "Test" }];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(data)
    });

    const tasks = await fetchTasks();
    expect(tasks).toEqual(data);
  });
  });

describe("createTask()", () => {

  test("POST correcto devuelve json", async () => {
    const mockData = { title: "Nueva tarea" };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData)
    });

    const result = await createTask({ title: "Nueva tarea" });

    expect(result).toEqual(mockData);

    expect(fetch).toHaveBeenCalledWith(
      "/tasks",
      expect.objectContaining({
        method: "POST"
      })
    );
  });

});

// -----------------------------------------------------------------------------
// deleteTask()
// -----------------------------------------------------------------------------
describe("deleteTask()", () => {

  test("DELETE correcto devuelve true", async () => {
    fetch.mockResolvedValueOnce({ ok: true });

    const res = await deleteTask("123");

    expect(res).toBe(true);

    expect(fetch).toHaveBeenCalledWith(
      "/tasks/123",
      expect.objectContaining({ method: "DELETE" })
    );
  });

});

// -----------------------------------------------------------------------------
// toggleComplete()
// -----------------------------------------------------------------------------
describe("toggleComplete()", () => {

  test("cambia estado y hace PUT", async () => {
    const task = { _id: "abc", status: 0 };
    const updated = { ...task, status: 1 };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(updated)
    });

    const result = await toggleComplete(task);

    expect(result.status).toBe(1);

    expect(fetch).toHaveBeenCalledWith(
      "/tasks/abc",
      expect.objectContaining({ method: "PUT" })
    );
  });

});

// -----------------------------------------------------------------------------
// makeTaskElement()
// -----------------------------------------------------------------------------
describe("makeTaskElement()", () => {

  test("crea el elemento con título y clases correctas", () => {
    const task = { title: "Mi tarea", status: 0, priority: 2 };

    const el = makeTaskElement(task);

    expect(el).toBeInstanceOf(HTMLElement);

    expect(el.querySelector(".task-card-title"))
      .toHaveTextContent("Mi tarea");

    expect(el.querySelector(".task-card-meta"))
      .toHaveTextContent("Pendiente");
  });

});
