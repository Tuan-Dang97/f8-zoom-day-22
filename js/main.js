const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document)

const addBtn = $(".add-btn");
const addTaskModal = $("#addTaskModal");
const modalClose = $(".modal-close");
const btnCancel = $(".btn-cancel");
const autoFocus = $("#taskTitle");
const todoForm = $(".todo-app-form");
const todoList = $("#todoList");
const editBtns = $$(".edit-btn");
const formAdd = $("#addTaskModal");
const searchInput =$(".search-input");
const activeTab = $("#active-tab");
const completedTab = $("#completed-tab")


let currentFilter = "";
let searchKeyword = "";

function filterAll() {
    currentFilter = "";
    searchKeyword = "";
    activeTab.classList.remove("active");
    completedTab.classList.remove("active");
    renderTasks();
}

activeTab.onclick = () => {
    activeTab.classList.add("active");
    completedTab.classList.remove("active");
    currentFilter = "active";
    renderTasks();
}

completedTab.onclick = () => {
    activeTab.classList.remove("active");
    completedTab.classList.add("active")
    currentFilter = "completed"
    renderTasks();
}

searchInput.oninput = function (event) {
    searchKeyword = event.target.value;
    activeTab.classList.remove("active");
    completedTab.classList.remove("active");
    renderTasks();
}

function escapeHTML (html) {
    const div = document.createElement("div");
    div.textContent = html;
    return div.innerHTML;
}

let editIndex = null;

function openFormModal () {
    addTaskModal.classList.add("show");
    setTimeout(() => autoFocus.focus(), 100);
};

function closeForm () {
    addTaskModal.classList.remove("show");

    
    const formTitle = formAdd.querySelector(".modal-title");
    if (formTitle) {
        formTitle.textContent = formTitle.dataset.original || formTitle.textContent;
        delete formTitle.dataset.original;
    }

    const submitBtn = formAdd.querySelector(".btn-submit");
    if (submitBtn) {
        submitBtn.textContent = submitBtn.dataset.original || submitBtn.textContent;
        delete submitBtn.dataset.original;
    }

    //Scroll lên đầu
    setTimeout(() => {
        formAdd.querySelector(".modal").scrollTop = 0;
    }, 300);

    //Reset form về mặc định
    todoForm.reset()

    // Xóa editIndex ( biết đã đóng form sửa )
    editIndex = null;
};

addBtn.onclick = openFormModal;
modalClose.onclick = closeForm;
btnCancel.onclick = closeForm;


const todoTasks = JSON.parse(localStorage.getItem("todoTasks")) ?? [];

function isDuplicateTask(task, editIndex = null) {
    return todoTasks.some((todoTask, index)=> todoTask.title === task.title && index !== editIndex)
}

todoForm.onsubmit = (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(todoForm));

    if(isDuplicateTask(formData, editIndex)) {
        alert("Tiêu đề đã tồn tại");
        return;
    }
    
    // Nếu có eit index tức đang mở modal sửa
    // Thực hiện logic sửa
    if (editIndex) {
        todoTasks[editIndex] = formData;
    } else {
        formData.isCompleted = false;

        //Thêm tasks
        todoTasks.unshift(formData)
    }

    // Lưu Localstorage
    saveTasks()

    closeForm()
    renderTasks()
}

function saveTasks () {
    localStorage.setItem("todoTasks",JSON.stringify(todoTasks))

}

todoList.onclick = function(event) {
    const editBtn = event.target.closest(".edit-btn");
    const deleteBtn = event.target.closest(".delete-btn");
    const completeBtn = event.target.closest(".complete-btn");


    if (editBtn) {
        const taskIndex = editBtn.dataset.index;
        const task = todoTasks[taskIndex];

        editIndex = taskIndex;

        for(const key in task) {
            const value = task[key]
            const input = $(`[name="${key}"]`)
            if(input) {
                input.value = value;
            }
        }

        const formTitle = formAdd.querySelector(".modal-title");
        if (formTitle) {
            formTitle.dataset.original = formTitle.textContent;
            formTitle.textContent = "Edit Task"
        }

        const submitBtn = formAdd.querySelector(".btn-submit");
        if (submitBtn) {
            submitBtn.dataset.original = submitBtn.textContent;
            submitBtn.textContent = "Save Task"
        }
        openFormModal()
    }

    if (deleteBtn) {
        const taskIndex = deleteBtn.dataset.index;
        const task = todoTasks[taskIndex];
        if (confirm(` Bạn chắc chắn muốn xóa công việc ${task.title} chứ ?`)) {
            todoTasks.splice(taskIndex, 1);
            saveTasks()
            renderTasks()
        }
    }

    if (completeBtn) {
        const taskIndex = completeBtn.dataset.index;
        const task = todoTasks[taskIndex];
        task.isCompleted = !task.isCompleted;
        saveTasks()
        renderTasks()
    }
}

function renderTasks () {
    if(!todoTasks.length) {
        todoList.innerHTML = `
            <p>Không có công việc nào</p>
        `;
        return;
    }

    let filteredTasks = todoTasks;
    
    // Lọc theo filter
    if (currentFilter === "active") {
       filteredTasks = filteredTasks.filter(task => !task.isCompleted)
    } else if (currentFilter === "completed") {
        filteredTasks = filteredTasks.filter(task => task.isCompleted)
    }

    if(searchKeyword.trim()) {
        filteredTasks = filteredTasks.filter(todoTask => todoTask.title.toLowerCase().includes(searchKeyword.toLowerCase()) || 
        todoTask.description.toLowerCase().includes(searchKeyword.toLowerCase()))
    }

    if(filteredTasks.length === 0) {
        todoList.innerHTML = `
        <p>Không tìm thấy kết quả nào</p>
        `;
        return
    }

    const html = filteredTasks.map((task,index) => {
        return `
        <div class="task-card ${task.color} ${task.isCompleted ? "completed" : ""}">
                <div class="task-header">
                    <h3 class="task-title">${escapeHTML(task.title)}</h3>
                    <button class="task-menu">
                        <i class="fa-solid fa-ellipsis fa-icon"></i>
                        <div class="dropdown-menu">
                            <div class="dropdown-item edit-btn" data-index="${index}">
                                <i class="fa-solid fa-pen-to-square fa-icon"></i>
                                Edit
                            </div>
                            <div class="dropdown-item complete-btn" data-index="${index}">
                                <i class="fa-solid fa-check fa-icon"></i>
                                ${task.isCompleted ? "Mark as Active" : "Mark as Completed"}
                            </div>
                            <div class="dropdown-item delete delete-btn" data-index="${index}">
                                <i class="fa-solid fa-trash fa-icon"></i>
                                Delete
                            </div>
                        </div>
                    </button>
                </div>
                <p class="task-description">${escapeHTML(task.description)}</p>
                <div class="task-time">${escapeHTML(task.startTime)} - ${escapeHTML(task.endTime)}</div>
        </div>
        `
    }).join("")

    todoList.innerHTML = html;
}

renderTasks()