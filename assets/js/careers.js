document.querySelectorAll(".career_card .button").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".career_card");
    card.classList.toggle("is_open");
    button.textContent = card.classList.contains("is_open") ? "Скрыть" : "Подробнее";
  });
});
