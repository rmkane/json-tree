const activeTheme = "unikitty-dark";

// Constants
const initialView = "preview";
const allViews = ["preview", "source"];
const viewStates = {
  preview: "Show Source",
  source: "Hide Source",
};

let rawData, tree;

document.addEventListener("DOMContentLoaded", init);

function getPreviewElement() {
  return document.querySelector(".jsontree_view[data-view='preview']");
}

function init() {
  const data = parseJSON();
  if (!data) {
    return;
  }
  render(data);

  tree.findAndHandle(
    (node) => node.type === "string",
    (node) => {
      node.mark();
      node.expandParent("isRecursive");
    }
  );
}

function render(data, target = document.body) {
  emptyChildren(target);
  target.classList.add("jsontree_bg");
  target.setAttribute("data-theme", activeTheme);

  createEl("div", {
    class: "jsontree_wrapper",
    children: [createMenu(), createViewport()],
    parent: target,
  });

  tree = jsonTree.create(data, getPreviewElement());
}

function createMenu() {
  const menu = createEl("div", {
    class: "jsontree_menu",
    children: [
      createEl("button", {
        class: "jsontree_menu_btn",
        data: { action: "expand" },
        text: "Expand All",
        handlers: { click: () => tree.expand() },
      }),
      createEl("button", {
        class: "jsontree_menu_btn",
        data: { action: "collapse" },
        text: "Collapse All",
        handlers: { click: () => tree.collapse() },
      }),
      createEl("button", {
        class: "jsontree_menu_btn",
        data: { action: "toggle" },
        text: "Show Source",
        handlers: { click: toggleView },
      }),
    ],
  });

  return menu;
}

function createViewport() {
  return createEl("div", {
    class: "jsontree_viewport",
    children: [
      createEl("div", {
        class: "jsontree_view jsontree_view-active",
        data: { view: "preview" },
      }),
      createEl("div", {
        class: "jsontree_view",
        data: { view: "source", loaded: false },
      }),
    ],
  });
}

function toggleView(e) {
  const activeView = document.querySelector(".jsontree_view-active");
  const views = document.querySelectorAll(".jsontree_view");
  const toggleViewBtn = e.target;

  const currentView = activeView?.dataset.view ?? initialView;
  const nextView = getNextItem(currentView, allViews);

  if (nextView === "source") {
    lazyLoadSource();
  }

  toggleViewBtn.textContent = viewStates[nextView];

  for (let view of views) {
    view.classList.remove("jsontree_view-active");

    if (view.dataset.view === nextView) {
      view.classList.add("jsontree_view-active");
    }
  }
}

function lazyLoadSource() {
  const source = document.querySelector(".jsontree_view[data-view='source']");
  if (source.dataset.loaded === "true") {
    return;
  }

  createEl("pre", { text: rawData, parent: source });

  source.dataset.loaded = true;
}

function parseJSON() {
  rawData = document.querySelector("body > pre").textContent;
  try {
    return JSON.parse(rawData);
  } catch (e) {
    console.log("Content is not JSON");
  }
  return null;
}

// Utility functions

function createEl(
  tagName,
  { children, class: className, data, handlers, parent, text }
) {
  const element = document.createElement(tagName);
  if (className) {
    element.classList.add(...className.split(/\s+/));
  }
  if (data) {
    for (let key in data) {
      element.dataset[key] = data[key];
      element.setAttribute("data-" + key, data[key]);
    }
  }
  if (text) {
    element.textContent = text;
  }
  if (handlers) {
    for (let eventName in handlers) {
      element.addEventListener(eventName, handlers[eventName]);
    }
  }
  if (children) {
    for (let child of children) {
      element.appendChild(child);
    }
  }
  if (parent) {
    parent.appendChild(element);
  }
  return element;
}

function emptyChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function getNextItem(item, items) {
  const index = items.indexOf(item);
  const nextIndex = (index + 1) % items.length;
  return items[nextIndex];
}
