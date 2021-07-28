////////////// GLOBAL VARIABLES
let modalDisplay = false;
let changeUsernameDisplay = false;
let newTaskWindowDisplay = false;
let firstLoad = false;
let currentSelectedTask;

////////////// COUNTER UPDATE
if (localStorage.tasksArray) updateCounter();

////////////// DOM ELEMENTS
let labelChangeLanguage = document.getElementById("changeLanguage");
let labelFinishAllTasks = document.getElementById("finish-all-tasks");
let labelDeleteAllTasks = document.getElementById("delete-all-tasks");
let labelChangeUsername = document.getElementById("change-username");
let labelChangeTheme = document.getElementById("change-theme");
let labelAbout = document.getElementById("about");
let labelAboutModal = document.getElementById("about-modal");
let labelOverlay = document.getElementById("overlay");
let labelAboutText = document.getElementById("about-text");
let labelWelcomeText = document.getElementById("welcome-text");
let labelUsernameModal = document.getElementById("change-name-modal");
let labelNewTaskWindow = document.getElementById("new-task-window");
let labelNewTaskText = document.getElementById("new-task-menu-text");
let labelNoDeadline = document.getElementById("dont-specify-deadline");
let labelRoot = document.documentElement;
let inputDeadline = document.getElementById("input-deadline");
const deadlineCheckbox = document.getElementById("deadline-checkbox");
const btnAddNewTask = document.getElementById("btn-add-task");
const btnCloseModal = document.getElementById("close-modal");
const btnConfirmUsername = document.getElementById("confirm-username");
const btnCancelUsername = document.getElementById("close-username-modal");
const btnConfirmAddTask = document.getElementById("confirm-add-task");
const btnCancelNewTask = document.getElementById("cancel-add-task");
const btnConfirmEditTask = document.getElementById("confirm-edit-task");
const btnCancelEditTask = document.getElementById("cancel-edit-task");

////////////// EVENT HANDLERS
labelFinishAllTasks.addEventListener("click", finishAllTasks);
labelDeleteAllTasks.addEventListener("click", deleteAllTasks);
labelChangeLanguage.addEventListener("click", changeLanguage);
labelChangeTheme.addEventListener("click", changeTheme);
labelAbout.addEventListener("click", toggleAboutModal);
btnCloseModal.addEventListener("click", toggleAboutModal);
deadlineCheckbox.addEventListener("click", DeadlineCheckbox);
labelChangeUsername.addEventListener("click", toggleUsernameModal);
btnConfirmUsername.addEventListener("click", changeUsername);
btnCancelUsername.addEventListener("click", toggleUsernameModal);
btnAddNewTask.addEventListener("click", toggleNewTaskWindow);
btnCancelNewTask.addEventListener("click", closeNewTaskWindow);
btnConfirmAddTask.addEventListener("click", addNewTask);
btnConfirmEditTask.addEventListener("click", confirmEditTask);
btnCancelEditTask.addEventListener("click", cancelEditTask);

////////////// FUNCTIONS
function openMobileMenu() {
  const navOptions = document.getElementById("navOptions");
  if (navOptions.style.display === "block") navOptions.style.display = "none";
  else navOptions.style.display = "block";
}

function notification(portuguese, english) {
  let notif = document.getElementById("notification");
  notif.style.opacity = "100";
  if (localStorage.pageLanguage === "portuguese")
    notif.textContent = portuguese;
  else notif.textContent = english;
  setTimeout(function () {
    notif.style.opacity = "0";
  }, 2000);
}

function getDate(format) {
  let date = new Date();
  let day = date.getDate();
  let month = date.getMonth();
  month++;
  let year = date.getFullYear();
  if (format === "iso")
    return month > 9 ? `${year}-${month}-${day}` : `${year}-0${month}-${day}`;
  else
    return month > 9 ? `${day}.${month}.${year}` : `${day}.0${month}.${year}`;
}

function getDeadline(deadlineInput) {
  let tempStr = deadlineInput.split("-");
  let str = `${tempStr[2]}.${tempStr[1]}.${tempStr[0]}`;
  return str;
}

function toggleNewTaskWindow(e) {
  e.preventDefault();
  if (localStorage["no-deadline"]) localStorage.removeItem("no-deadline");
  document.querySelector(".task-log-msg").innerHTML = ``;
  let taskDescription = document.getElementById("new-task-desc");
  taskDescription.value = "";
  if (!newTaskWindowDisplay) {
    labelNewTaskWindow.classList.remove("hidden");
    labelOverlay.classList.remove("hidden");
    let today = getDate("iso");
    inputDeadline.setAttribute("value", `${today}`);
    inputDeadline.setAttribute("min", `${today}`);
    document.getElementById("new-task-desc").focus();
    newTaskWindowDisplay = true;
  }
}

function closeNewTaskWindow(e) {
  e.preventDefault();
  labelNewTaskWindow.classList.add("hidden");
  labelOverlay.classList.add("hidden");
  newTaskWindowDisplay = false;
}

function DeadlineCheckbox() {
  if (this.checked) {
    localStorage.setItem("no-deadline", "true");
    inputDeadline.disabled = true;
  } else {
    localStorage.removeItem("no-deadline");
    inputDeadline.disabled = false;
  }
}

function addNewTask(e) {
  e.preventDefault();
  let taskDescription = document.getElementById("new-task-desc");
  taskDescription = taskDescription.value.trim();
  if (taskDescription.length >= 5) {
    let deadlineInput = document.getElementById("input-deadline");
    deadlineInput = deadlineInput.value;
    let deadline = getDeadline(deadlineInput);
    let task = new TaskConstructor(taskDescription, deadline);
    let tasksArray = JSON.parse(localStorage.getItem("tasksArray"));
    tasksArray.push(task);
    localStorage.setItem("tasksArray", JSON.stringify(tasksArray));
    let container = document.getElementById("tasklist-container");
    container.innerHTML = ``;
    updateTasks();
    updateCounter();
    closeNewTaskWindow(e);
    sortTasks();
  } else {
    if (localStorage.pageLanguage === "portuguese") {
      document.querySelector(
        ".task-log-msg"
      ).innerHTML = `<i class="fas fa-exclamation-circle"></i> A descrição da tarefa precisa ter ao menos 5 (cinco) caracteres.`;
    } else {
      document.querySelector(
        ".task-log-msg"
      ).innerHTML = `<i class="fas fa-exclamation-circle"></i> The task description must be at least 5 (five) letters long.`;
    }
  }
}

function TaskConstructor(input, deadline) {
  (this.index = document.querySelector(
    ".tasklist-container"
  ).childElementCount),
    (this.task = input),
    (this.status = "unfinished"),
    (this.date = getDate()),
    (this.deadline = localStorage["no-deadline"] ? false : deadline);
}

function updateTasks() {
  let tasksArray = JSON.parse(localStorage.getItem("tasksArray"));
  tasksArray.forEach((task) => {
    let container = document.getElementById("tasklist-container");
    let div = document.createElement("div");
    div.classList.add("task-container");
    if (task.status === "finished") {
      div.classList.add("task-confirmed");
    } else {
      div.classList.remove("task-confirmed");
    }
    div.innerHTML = `<div class="task-desc flex-col">
    <h5 class="task-text">${task.task}</h5>    
        <span  class="task-deadline">
        <i class="far fa-clock"></i> ${task.date} ${
      task.deadline === false
        ? ""
        : '<i class="fas fa-flag-checkered"></i> ' + task.deadline
    }       
        </span>    
    </div>


</div>

<div class="task-controls">
    <div>      
      <button class="btn btn-success btn-finish-task">
        <i class="fas fa-check"></i>
      </button>
      <button class="btn btn-primary btn-edit-task">
        <i class="fas fa-pen"></i>
      </button>
      <button class="btn btn-danger btn-delete-task">
        <i class="far fa-trash-alt"></i>
      </button>
    </div>        
</div>
</div>`;

    container.appendChild(div);
    const btnFinishTask = document.querySelectorAll(".btn-finish-task");
    for (let i = 0; i < btnFinishTask.length; i++) {
      btnFinishTask[i].addEventListener("click", finishTask);
    }
    const btnEditTask = document.querySelectorAll(".btn-edit-task");
    for (let i = 0; i < btnFinishTask.length; i++) {
      btnEditTask[i].addEventListener("click", editTask);
    }
    const btnDeleteTask = document.querySelectorAll(".btn-delete-task");
    for (let i = 0; i < btnFinishTask.length; i++) {
      btnDeleteTask[i].addEventListener("click", deleteTask);
    }
  });
}

function finishTask() {
  setTimeout(() => {
    if (localStorage.taskOrder) sortTasks();
  }, 400);

  const tmp = this.parentNode.parentNode.parentNode.firstChild.textContent
    .trim()
    .split("  ");
  const taskToConfirm = tmp[0];
  const tempTasksArray = JSON.parse(localStorage.getItem("tasksArray"));
  tempTasksArray.forEach((obj) => {
    if (obj.task === taskToConfirm) {
      if (obj.status === "unfinished") {
        obj.status = "finished";
        this.parentNode.parentNode.parentNode.classList.add("task-confirmed");
      } else {
        obj.status = "unfinished";
        this.parentNode.parentNode.parentNode.classList.remove(
          "task-confirmed"
        );
      }
    }
  });
  localStorage.setItem("tasksArray", JSON.stringify(tempTasksArray));
  updateCounter();
}

function finishAllTasks() {
  const tempTasksArray = JSON.parse(localStorage.getItem("tasksArray"));
  tempTasksArray.forEach((task) => {
    if (task.status === "unfinished") task.status = "finished";
  });
  localStorage.setItem("tasksArray", JSON.stringify(tempTasksArray));
  document.getElementById("tasklist-container").innerHTML = ``;
  updateTasks();
  updateCounter();
  openMobileMenu();
  notification(
    "Todas as tarefas foram marcadas como concluídas.",
    "All tasks marked as finished."
  );
}

function editTask() {
  const tmp = this.parentNode.parentNode.parentNode.firstChild.textContent
    .trim()
    .split("  ");
  const taskToEdit = tmp[0];
  const tempTasksArray = JSON.parse(localStorage.getItem("tasksArray"));
  tempTasksArray.forEach((obj) => {
    if (obj.task === taskToEdit) {
      currentSelectedTask = obj.task;
      toggleEditTaskWindow(currentSelectedTask);
    }
  });
}

function toggleEditTaskWindow(currentSelectedTask) {
  document.querySelector(".edit-log-msg").innerHTML = ``;
  const editTaskWindow = document.getElementById("edit-task-window");
  if (editTaskWindow.classList.contains("hidden")) {
    window.setTimeout(function () {
      document.getElementById("edit-task-desc").focus();
      document.getElementById("edit-task-desc").value = ``;
    }, 0);
    editTaskWindow.classList.remove("hidden");
    labelOverlay.classList.remove("hidden");
    document.getElementById("edit-task-text").textContent =
      localStorage.pageLanguage === "portuguese"
        ? "Editar tarefa"
        : "Edit task";
    document.getElementById(
      "previous-task-desc"
    ).textContent = `${currentSelectedTask}`;
  } else {
    editTaskWindow.classList.add("hidden");
    labelOverlay.classList.add("hidden");
  }
}

function confirmEditTask(e) {
  e.preventDefault();
  let input = document.getElementById("edit-task-desc").value;
  if (input.length >= 5) {
    const tempTasksArray = JSON.parse(localStorage.getItem("tasksArray"));

    tempTasksArray.forEach((obj) => {
      if (obj.task === currentSelectedTask) {
        notification(
          `Tarefa '${obj.task}' modificada para '${input}'`,
          `Task '${obj.task}' changed to '${input}'`
        );
        obj.task = `${input}`;
      }
    });
    localStorage.setItem("tasksArray", JSON.stringify(tempTasksArray));
    let container = document.getElementById("tasklist-container");
    container.innerHTML = ``;
    updateTasks();
    updateCounter();
    toggleEditTaskWindow();
  } else {
    e.preventDefault();
    if (localStorage.pageLanguage === "portuguese") {
      document.querySelector(
        ".edit-log-msg"
      ).innerHTML = `<i class="fas fa-exclamation-circle"></i> A nova descrição da tarefa precisa ter ao menos 5 (cinco) caracteres.`;
    } else {
      document.querySelector(
        ".edit-log-msg"
      ).innerHTML = `<i class="fas fa-exclamation-circle"></i> The new task description must be at least 5 (five) letters long.`;
    }
  }
}

function cancelEditTask(e) {
  e.preventDefault();
  document.getElementById("edit-task-window").classList.add("hidden");
  labelOverlay.classList.add("hidden");
  document.querySelector(".edit-log-msg").innerHTML = "";
}

function deleteTask() {
  const tmp = this.parentNode.parentNode.parentNode.firstChild.textContent
    .trim()
    .split("  ");
  const taskToDelete = tmp[0];
  const tasksAfterRemoval = JSON.parse(
    localStorage.getItem("tasksArray")
  ).filter((obj) => {
    return obj.task !== taskToDelete;
  });
  localStorage.setItem("tasksArray", JSON.stringify(tasksAfterRemoval));
  let container = document.getElementById("tasklist-container");
  container.innerHTML = ``;
  updateTasks();
  updateCounter();
  notification(
    `Tarefa "${taskToDelete}" deletada.`,
    `Task "${taskToDelete}" deleted.`
  );
}

function deleteAllTasks() {
  let tmp = JSON.parse(localStorage.getItem("tasksArray"));
  tmp = [];
  localStorage.setItem("tasksArray", JSON.stringify(tmp));
  document.getElementById("tasklist-container").innerHTML = ``;
  updateTasks();
  updateCounter();
  openMobileMenu();
  notification(
    "Todas as tarefas foram deletadas.",
    "All tasks have been deleted."
  );
}

function updateCounter() {
  const tasksArray = JSON.parse(localStorage.getItem("tasksArray"));
  const pendingTasks = tasksArray.filter((task) => {
    return task.status === "unfinished";
  }).length;
  const finishedTasks = tasksArray.filter((task) => {
    return task.status === "finished";
  }).length;
  const allTasks = tasksArray.length;
  document.getElementById("pending-tasks-number").textContent = pendingTasks;
  document.getElementById("finished-tasks-number").textContent = finishedTasks;
  document.getElementById("all-tasks-number").textContent = allTasks;
}

function changeLanguage() {
  if (localStorage.pageLanguage === "portuguese") changeToEnglish();
  else changeToPortuguese();
  updateUsername();
}

function changeToDay() {
  localStorage.pageTheme = "day";
  labelRoot.style.setProperty("--primary", "#29b6f6");
  labelRoot.style.setProperty("--secondary", "#0086c3");
  labelRoot.style.setProperty("--text", "#ffffff");
  document.body.style.backgroundColor = `#ffffff`;
  document.body.style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg stroke='%23CCC' stroke-width='0' %3E%3Crect fill='%23F5F5F5' x='-60' y='-60' width='110' height='240'/%3E%3C/g%3E%3C/svg%3E")`;
  labelWelcomeText.style.color = "#161616";
  document.getElementById("pending-tasks-number").style.color = "#161616";
  document.getElementById("finished-tasks-number").style.color = "#161616";
  document.getElementById("all-tasks-number").style.color = "#161616";
  document.getElementById("pending-tasks-text").style.color = "#161616";
  document.getElementById("finished-tasks-text").style.color = "#161616";
  document.getElementById("all-tasks-text").style.color = "#161616";
  btnAddNewTask.style.color = `#ffffff`;
  document.getElementById("filter").style.backgroundColor = "#ffffff";
  document.getElementById("filter").style.color = "#161616";
}

function changeToNight() {
  localStorage.pageTheme = "night";
  labelRoot.style.setProperty("--primary", "#2B2B2B");
  labelRoot.style.setProperty("--secondary", "#161616");
  labelRoot.style.setProperty("--text", "#EFEFEF");
  document.body.style.backgroundColor = `#020218`;
  document.body.style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg stroke='%23CCC' stroke-width='0' %3E%3Crect fill='%23050b1d' x='-60' y='-60' width='110' height='240'/%3E%3C/g%3E%3C/svg%3E")`;
  labelWelcomeText.style.color = "#EFEFEF";
  document.getElementById("pending-tasks-number").style.color = "#EFEFEF";
  document.getElementById("finished-tasks-number").style.color = "#EFEFEF";
  document.getElementById("all-tasks-number").style.color = "#EFEFEF";
  document.getElementById("pending-tasks-text").style.color = "#EFEFEF";
  document.getElementById("finished-tasks-text").style.color = "#EFEFEF";
  document.getElementById("all-tasks-text").style.color = "#EFEFEF";
  document.getElementById("filter").style.backgroundColor = "var(--secondary)";
  document.getElementById("filter").style.color = "#EFEFEF";
}

function changeTheme() {
  if (localStorage.pageTheme === "day") changeToNight();
  else changeToDay();
}

function toggleAboutModal() {
  openMobileMenu();
  if (!modalDisplay) {
    labelAboutModal.classList.remove("hidden");
    labelOverlay.classList.remove("hidden");
    modalDisplay = true;
  } else {
    labelAboutModal.classList.add("hidden");
    labelOverlay.classList.add("hidden");
    modalDisplay = false;
  }
}

function toggleUsernameModal(config) {
  document.getElementById("navOptions").style.display = "none";
  if (config === "firstTime") {
    if (localStorage.pageLanguage === "portuguese") {
      document.getElementById(
        "change-username-msg"
      ).textContent = `Olá! Parece que essa é a sua primeira vez usando o Organizzer. Como você se chama?`;
    } else {
      document.getElementById(
        "change-username-msg"
      ).textContent = `Hello! It seems this is the first time you are using Organizzer. What is your name?`;
    }
  } else {
    if (localStorage.pageLanguage === "portuguese") {
      document.getElementById(
        "change-username-msg"
      ).textContent = `Por favor, defina um novo nome de usuário.`;
    } else {
      document.getElementById(
        "change-username-msg"
      ).textContent = `Please set a new username.`;
    }
  }

  let errorMsg = document.querySelector(".error-msg");
  errorMsg.classList.add("hidden");
  if (!changeUsernameDisplay) {
    labelUsernameModal.classList.remove("hidden");
    labelOverlay.classList.remove("hidden");
    changeUsernameDisplay = true;
  } else {
    labelUsernameModal.classList.add("hidden");
    labelOverlay.classList.add("hidden");
    changeUsernameDisplay = false;
  }
}

function changeUsername() {
  let usernameInput = document.getElementById("username-input");
  let username = usernameInput.value;
  if (username.length === 0 || !username.replace(/\s/g, "").length) {
    let errorMsg = document.querySelector(".error-msg");
    if (localStorage.pageLanguage === "portuguese")
      errorMsg.innerHTML = `<i class="fas fa-exclamation-circle"></i> Nome inválido.`;
    else
      errorMsg.innerHTML = `<i class="fas fa-exclamation-circle"></i> Invalid name.`;
    errorMsg.classList.remove("hidden");
  } else {
    username = username.trim().toLowerCase().split("");
    username[0] = username[0].toUpperCase();
    username = username.join("");
    localStorage.setItem("pageUsername", `${username}`);
    labelUsernameModal.classList.add("hidden");
    labelOverlay.classList.add("hidden");
    changeUsernameDisplay = false;
    updateUsername();
    notification(
      `Nome de usuário modificado para ${username}.`,
      `Username changed to ${username}.`
    );
  }
}

function updateUsername() {
  if (localStorage.pageLanguage === "portuguese")
    labelWelcomeText.innerHTML = `Olá, ${localStorage.pageUsername}! Bem vindo ao Organizzer.`;
  else
    labelWelcomeText.innerHTML = `Hello, ${localStorage.pageUsername}! Welcome to Organizzer.`;
}

function changeToEnglish() {
  localStorage.pageLanguage = "english";
  labelNoDeadline.textContent = "No deadline for this task";
  labelChangeLanguage.textContent = "Change language to Português";
  labelChangeTheme.textContent = "Switch theme (day/night)";
  labelFinishAllTasks.textContent = "Finish all tasks";
  labelDeleteAllTasks.textContent = "Delete all tasks";
  labelChangeUsername.textContent = "Change username";
  labelAbout.textContent = "About the app";
  labelNewTaskText.innerHTML = "Add new task";
  btnAddNewTask.innerHTML = '<i class="fas fa-plus"></i> Add New Task';
  labelAboutText.innerHTML = `Hello! My name is Athos Franco and i'm a beginner web developer. <br> I created this app with a goal to implement a fully functional CRUD (Create, Read, Update & Delete), using everything i learned about JavaScript until now. <br> With this app you can create, edit and delete tasks, also being able to switch between two languages (english and portuguese) and two color themes (Day theme/Night theme). All this configuration is saved on your browser's Local Storage.<br>
    You can see my other projects on my GitHub page.`;
  document.getElementById(
    "input-deadline-label"
  ).innerHTML = `<i class="fas fa-flag-checkered"></i> Deadline`;
  document.getElementById(
    "input-task-desc-label"
  ).innerHTML = `<i class="fas fa-pencil-alt"></i> Task Description`;
  document.getElementById("pending-tasks-text").textContent = `Tasks Left`;
  document.getElementById("finished-tasks-text").textContent = `Finished Tasks`;
  document.getElementById("all-tasks-text").textContent = `All Tasks`;
  document.getElementById(
    "oldestFirst-text"
  ).textContent = `Show oldest tasks first`;
  document.getElementById(
    "newestFirst-text"
  ).textContent = `Show most recent tasks first`;
  document.getElementById(
    "pendingFirst-text"
  ).textContent = `Show unfinished tasks first`;
  document.getElementById(
    "finishedFirst-text"
  ).textContent = `Show finished tasks first`;
}

function changeToPortuguese() {
  localStorage.pageLanguage = "portuguese";
  labelNoDeadline.textContent = "Sem prazo específico";
  labelChangeLanguage.textContent = "Mudar idioma para English";
  labelChangeTheme.textContent = "Mudar tema (noturno/diurno)";
  labelFinishAllTasks.textContent = "Concluir todas as tarefas";
  labelDeleteAllTasks.textContent = "Deletar todas as tarefas";
  labelChangeUsername.textContent = "Mudar nome de usuário";
  labelAbout.textContent = "Sobre o aplicativo";
  labelNewTaskText.innerHTML = "Adicionar nova tarefa";
  btnAddNewTask.innerHTML = '<i class="fas fa-plus"></i> Nova Tarefa';
  labelAboutText.innerHTML = `Olá! Meu nome é Athos Franco e eu sou um programador iniciante auto-didata. <br> Desenvolvi esse aplicativo
    web de
    controle de
    tarefas com o objetivo de implementar um CRUD (Create, Read, Update & Delete), colocando em prática o que já
    aprendi em JavaScript até agora. <br> Além de ser possível criar tarefas, editá-las e deletá-las, o app
    também
    permite que você alterne entre dois idiomas (Português/Inglês) e dois esquemas de cores (Diurno/Noturno).
    Essas configurações são armazenadas no Local Storage do navegador, juntamente com as tarefas.<br>
    Você pode ver outros projetos que desenvolvi entrando no meu GitHub.`;
  document.getElementById(
    "input-deadline-label"
  ).innerHTML = `<i class="fas fa-flag-checkered"></i> Prazo`;
  document.getElementById(
    "input-task-desc-label"
  ).innerHTML = `<i class="fas fa-pencil-alt"></i> Descrição da Tarefa`;
  document.getElementById(
    "pending-tasks-text"
  ).textContent = `Tarefas Restantes`;
  document.getElementById(
    "finished-tasks-text"
  ).textContent = `Tarefas Concluídas`;
  document.getElementById("all-tasks-text").textContent = `Todas as Tarefas`;
  document.getElementById(
    "oldestFirst-text"
  ).textContent = `Tarefas mais antigas primeiro`;
  document.getElementById(
    "newestFirst-text"
  ).textContent = `Tarefas mais recentes primeiro`;
  document.getElementById(
    "pendingFirst-text"
  ).textContent = `Tarefas não concluídas primeiro`;
  document.getElementById(
    "finishedFirst-text"
  ).textContent = `Tarefas concluídas primeiro`;
}

function sortTasks(config) {
  let tempTaskArray = JSON.parse(localStorage.getItem("tasksArray"));
  let sortBy;
  if (config === "updateOrder") sortBy = localStorage.taskOrder;
  else {
    sortBy = document.getElementById("filter").value;
    localStorage.setItem("taskOrder", sortBy);
  }

  switch (sortBy) {
    case "oldestFirst":
      tempTaskArray.sort((a, b) => {
        let taskA = a.index;
        let taskB = b.index;
        if (taskA < taskB) return -1;
        else if (taskB > taskA) return 1;
      });
      break;

    case "newestFirst":
      tempTaskArray.sort((a, b) => {
        let taskA = a.index;
        let taskB = b.index;
        if (taskA > taskB) return -1;
        else if (taskB < taskA) return 1;
      });
      break;

    case "pendingFirst":
      tempTaskArray.sort((a, b) => {
        let taskA = a.status;
        let taskB = b.status;
        if (taskA > taskB) return -1;
        else if (taskB < taskA) return 1;
      });
      break;

    case "finishedFirst":
      tempTaskArray.sort((a, b) => {
        let taskA = a.status;
        let taskB = b.status;
        if (taskA < taskB) return -1;
        else if (taskB > taskA) return 1;
      });
      break;

    default:
      break;
  }
  document.getElementById("tasklist-container").innerHTML = ``;
  localStorage.setItem("tasksArray", JSON.stringify(tempTaskArray));
  updateTasks();
}

//Fecha o menu navegador caso o usuário clique fora
window.addEventListener("click", () => {
  if (navOptions.style.display === "block") openMobileMenu();
});

document.querySelector(".topnav").addEventListener("click", (e) => {
  e.stopPropagation();
});

////////////// IIFE FUNCTIONS

//Verificar se há uma array de tarefas no localStorage; Se não houver, criá-la.

(function checkArrayOfTasks() {
  if (!localStorage.tasksArray) {
    let tasksArray = [];
    localStorage.setItem("tasksArray", JSON.stringify(tasksArray));
  } else {
    if (!firstLoad) {
      updateTasks();
      firstLoad = true;
    } else console.log("already LOADED");
  }
})();

//Verificar se há configuração pré-definida no localStorage;
(function checkPageConfig() {
  if (localStorage.length === 0) {
    window.setTimeout(function () {
      localStorage.setItem("pageUsername", "Athos");
    }, 0);
    localStorage.setItem("pageTheme", "day");
    localStorage.setItem("pageLanguage", "portuguese");
    console.log(
      "Como não havia config definida no localStorage, a config default foi setada."
    );
  } else {
    loadPageConfig();
  }
})();

//Carregar configurações do localStorage;
function loadPageConfig() {
  if (localStorage.pageLanguage === "portuguese") changeToPortuguese();
  else changeToEnglish();
  if (localStorage.pageTheme === "day") changeToDay();
  else changeToNight();
  if (localStorage.taskOrder) {
    sortTasks("updateOrder");
    document.getElementById("filter").value = localStorage.taskOrder;
  }
  updateUsername();
}

(function checkIfUsernameExists() {
  if (!localStorage.pageUsername) {
    toggleUsernameModal("firstTime");
  }
})();
