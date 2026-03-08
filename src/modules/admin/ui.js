export function setButtonLoading(buttonEl, isLoading, loadingLabel = "Loading...") {
  if (!buttonEl) {
    return;
  }

  if (isLoading) {
    if (!buttonEl.dataset.defaultLabel) {
      buttonEl.dataset.defaultLabel = buttonEl.textContent ?? "";
    }
    if (!buttonEl.dataset.defaultMinWidth) {
      buttonEl.dataset.defaultMinWidth = buttonEl.style.minWidth || "";
    }
    buttonEl.style.minWidth = `${Math.ceil(buttonEl.getBoundingClientRect().width)}px`;
    buttonEl.textContent = loadingLabel;
    buttonEl.disabled = true;
    buttonEl.setAttribute("aria-busy", "true");
    buttonEl.classList.add("is-loading");
    return;
  }

  buttonEl.textContent = buttonEl.dataset.defaultLabel || buttonEl.textContent;
  buttonEl.disabled = false;
  buttonEl.setAttribute("aria-busy", "false");
  buttonEl.style.minWidth = buttonEl.dataset.defaultMinWidth || "";
  buttonEl.classList.remove("is-loading");
}

export async function runWithButtonLoading({
  buttonEl,
  task,
  loadingLabel = "Loading...",
  minDurationMs = 500,
}) {
  const start = Date.now();
  setButtonLoading(buttonEl, true, loadingLabel);

  try {
    return await task();
  } finally {
    const elapsed = Date.now() - start;
    const remaining = Math.max(0, minDurationMs - elapsed);
    if (remaining > 0) {
      await new Promise((resolve) => window.setTimeout(resolve, remaining));
    }
    setButtonLoading(buttonEl, false);
  }
}

export function getPageSlice(items, currentPage, pageSize) {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  return {
    pageItems: items.slice(startIndex, endIndex),
    totalItems,
    totalPages,
    currentPage: safePage,
    startIndex: totalItems ? startIndex + 1 : 0,
    endIndex,
  };
}

export function renderPagination({
  container,
  totalItems,
  totalPages,
  currentPage,
  label = "items",
  onPageChange,
}) {
  if (!container) {
    return;
  }

  if (!totalItems) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <div class="pagination-info">
      Showing page ${currentPage} of ${totalPages} (${totalItems} ${label})
    </div>
    <div class="pagination-actions">
      <button
        type="button"
        class="btn-secondary small-btn pagination-btn"
        data-page-action="prev"
        ${currentPage <= 1 ? "disabled" : ""}
      >
        Prev
      </button>
      <button
        type="button"
        class="btn-secondary small-btn pagination-btn"
        data-page-action="next"
        ${currentPage >= totalPages ? "disabled" : ""}
      >
        Next
      </button>
    </div>
  `;

  container.querySelector('[data-page-action="prev"]')?.addEventListener("click", () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  });

  container.querySelector('[data-page-action="next"]')?.addEventListener("click", () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  });
}
