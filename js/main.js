const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document)

const addBtn = $(".add-btn");
const addTaskModal = $("#addTaskModal");
const modalClose = $(".modal-close");
const btnCancel = $(".btn-cancel");
const autoFocus = $("#taskTitle");
const todoForm = $(".todo-app-form")
const todoList = $("#todoList")

function openForm () {
    addTaskModal.className = "modal-overlay show"
    setTimeout(() => autoFocus.focus(), 100);
};

function closeForm () {
    addTaskModal.className = "modal-overlay"
    todoForm.reset()
};

addBtn.onclick = openForm;
modalClose.onclick = closeForm;
btnCancel.onclick = closeForm;

const todoTasks = [];

todoForm.onsubmit = (event) => {
    event.preventDefault();
    const newTask = Object.fromEntries(new FormData(todoForm));
    newTask.isCompleted = false;

    todoTasks.unshift(newTask)

    closeForm()
    renderTasks(todoTasks)
}

function renderTasks (tasks) {
    if(!tasks.length) {
        todoList.innerHTML = `
            <p>Không có công việc nào</p>
        `;
        return;
    }

    const html = tasks.map((task) => {
        return `
        <div class="task-card ${task.color} ${task.isCompleted ? "complete" : ""}">
                <div class="task-header">
                    <h3 class="task-title">${task.title}</h3>
                    <button class="task-menu">
                        <i class="fa-solid fa-ellipsis fa-icon"></i>
                        <div class="dropdown-menu">
                            <div class="dropdown-item">
                                <i class="fa-solid fa-pen-to-square fa-icon"></i>
                                Edit
                            </div>
                            <div class="dropdown-item complete">
                                <i class="fa-solid fa-check fa-icon"></i>
                                ${task.isCompleted ? "Mark as Active" : "Mark as Completed"}
                            </div>
                            <div class="dropdown-item delete">
                                <i class="fa-solid fa-trash fa-icon"></i>
                                Delete
                            </div>
                        </div>
                    </button>
                </div>
                <p class="task-description">${task.description}</p>
                <div class="task-time">${task.startTime} - ${task.endTime}</div>
        </div>
        `
    }).join("")

    todoList.innerHTML = html;
}

renderTasks(todoTasks)
