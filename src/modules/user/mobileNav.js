export function initStudentMobileNav() {
  const sidebar = document.getElementById("studentSidebar");
  const toggleBtn = document.getElementById("mobileNavToggle");
  const backdrop = document.getElementById("mobileNavBackdrop");
  const navLinks = sidebar?.querySelectorAll(".sidebar-nav a") ?? [];

  if (!sidebar || !toggleBtn) {
    return;
  }

  function setOpenState(isOpen) {
    sidebar.classList.toggle("open", isOpen);
    toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  toggleBtn.addEventListener("click", () => {
    const isOpen = sidebar.classList.contains("open");
    setOpenState(!isOpen);
  });

  backdrop?.addEventListener("click", () => {
    setOpenState(false);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setOpenState(false);
    });
  });
}
