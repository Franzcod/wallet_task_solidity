const taskform = document.querySelector("#taskform");

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});

taskform.addEventListener("submit", (e) => {
  e.preventDefault();

  App.createTask(taskform["title"].value, taskform["description"].value);
});
