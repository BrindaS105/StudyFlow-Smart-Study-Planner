const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");

let tasks = JSON.parse(localStorage.getItem("studyflowTasks")) || [];

function saveTasks() {
    localStorage.setItem("studyflowTasks", JSON.stringify(tasks));
}

function updateDashboard() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const percentage = total ? Math.round((completed / total) * 100) : 0;

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("pendingTasks").textContent = pending;
    document.getElementById("progressBar").style.width = percentage + "%";
    document.getElementById("progressText").textContent =
        percentage + "% completed";
}

function updateSubjectFilter() {
    const subjectFilter = document.getElementById("subjectFilter");
    const selected = subjectFilter.value;

    const subjects = [...new Set(
        tasks.map(task => task.subject)
    )].sort();

    subjectFilter.innerHTML = '<option value="All">All Subjects</option>';

    subjects.forEach(subject => {
        const option = document.createElement("option");
        option.value = subject;
        option.textContent = subject;
        subjectFilter.appendChild(option);
    });

    subjectFilter.value = subjects.includes(selected) ? selected : "All";
}

function renderTasks() {
    taskList.innerHTML = "";

    const search = document.getElementById("searchInput")
        .value.toLowerCase();

    const status = document.getElementById("statusFilter").value;
    const subject = document.getElementById("subjectFilter").value;

    const filteredTasks = tasks.filter(task => {
        const matchesSearch =
            task.title.toLowerCase().includes(search) ||
            task.subject.toLowerCase().includes(search);

        const matchesStatus =
            status === "All" ||
            (status === "Completed" && task.completed) ||
            (status === "Pending" && !task.completed);

        const matchesSubject =
            subject === "All" || task.subject === subject;

        return matchesSearch && matchesStatus && matchesSubject;
    });

    emptyMessage.style.display =
        filteredTasks.length ? "none" : "block";

    filteredTasks.forEach(task => {
        const card = document.createElement("div");
        card.className = "task-card" +
            (task.completed ? " completed" : "");

        const title = document.createElement("h3");
        title.textContent = task.title;

        const subjectText = document.createElement("p");
        subjectText.textContent = "Subject: " + task.subject;

        const dateText = document.createElement("p");
        dateText.textContent = "Due date: " + task.dueDate;

        const priorityText = document.createElement("p");
        priorityText.textContent = "Priority: " + task.priority;

        const statusText = document.createElement("p");
        statusText.textContent =
            task.completed ? "Status: Completed" : "Status: Pending";

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const completeButton = document.createElement("button");
        completeButton.className = "complete-btn";
        completeButton.textContent =
            task.completed ? "Mark Pending" : "Complete";

        completeButton.addEventListener("click", () => {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            tasks = tasks.filter(item => item.id !== task.id);
            saveTasks();
            renderTasks();
        });

        actions.append(completeButton, deleteButton);
        card.append(title, subjectText, dateText,
            priorityText, statusText, actions);

        taskList.appendChild(card);
    });

    updateSubjectFilter();
    updateDashboard();
}

taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const title = document.getElementById("taskTitle").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const dueDate = document.getElementById("dueDate").value;
    const priority = document.getElementById("priority").value;

    if (!title || !subject || !dueDate) return;

    tasks.push({
        id: Date.now(),
        title,
        subject,
        dueDate,
        priority,
        completed: false
    });

    saveTasks();
    taskForm.reset();
    renderTasks();
});

document.getElementById("searchInput")
    .addEventListener("input", renderTasks);

document.getElementById("statusFilter")
    .addEventListener("change", renderTasks);

document.getElementById("subjectFilter")
    .addEventListener("change", renderTasks);

renderTasks();