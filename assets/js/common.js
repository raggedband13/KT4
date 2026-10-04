document.addEventListener("DOMContentLoaded", () => {
  const current = document.body.dataset.page;

  document.querySelectorAll(".nav_link").forEach((link) => {
    if (link.dataset.page === current) link.classList.add("active");
  });

  const year = document.querySelector("[data_year]");
  if (year) year.textContent = new Date().getFullYear();
});
