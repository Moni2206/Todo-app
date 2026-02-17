const select = document.getElementById("lan-select");

function SetTheme(theme) {
  if (!theme) return;
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

console.log("hvilken theme er det? ", localStorage.getItem("theme"));

// Initialize theme from localStorage (run on load)
(function initTheme() {
  const themeFraLs = localStorage.getItem("theme");
  if (themeFraLs) {
    SetTheme(themeFraLs);
    if (select) select.value = themeFraLs;
  } else {
    SetTheme("dark");
    if (select) select.value = "dark";
  }
})();

// Update when user changes select
if (select) {
  select.addEventListener("change", function () {
    SetTheme(this.value);
  });
}
