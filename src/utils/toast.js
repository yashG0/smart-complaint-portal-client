const TOAST_STACK_ID = "globalToastStack";
const DEFAULT_TOAST_DURATION_MS = 2000;

function getStack() {
  let stack = document.getElementById(TOAST_STACK_ID);
  if (!stack) {
    stack = document.createElement("div");
    stack.id = TOAST_STACK_ID;
    stack.className = "global-toast-stack";
    document.body.append(stack);
  }
  return stack;
}

export function showToast(message, variant = "info", durationMs = DEFAULT_TOAST_DURATION_MS) {
  if (!message) {
    return;
  }

  const stack = getStack();
  const toast = document.createElement("div");
  toast.className = `global-toast global-toast--${variant}`;
  toast.textContent = message;
  stack.append(toast);

  let removed = false;
  const removeToast = () => {
    if (removed) {
      return;
    }
    removed = true;
    toast.remove();
    if (!stack.children.length) {
      stack.remove();
    }
  };

  const timeoutId = window.setTimeout(removeToast, durationMs);
  toast.addEventListener("click", () => {
    window.clearTimeout(timeoutId);
    removeToast();
  });
}
