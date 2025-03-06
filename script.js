document.addEventListener("DOMContentLoaded", () => {
    const taskTitle = document.getElementById("taskTitle");
    const taskDescription = document.getElementById("taskDescription");
    const taskDeadline = document.getElementById("taskDeadline");
    const taskPriority = document.getElementById("taskPriority");
    const addTaskButton = document.getElementById("addTask");
    const taskList = document.getElementById("taskList");
    const clearAllButton = document.getElementById("clearAll");
    const searchTask = document.getElementById("searchTask");
    const filterPriority = document.getElementById("filterPriority");
    const filterStatus = document.getElementById("filterStatus");
    const progressCircle = document.getElementById("progress-circle");
    const progressText = document.getElementById("progress-text");
    const calendar = document.getElementById("calendar");
    const notificationContainer = document.createElement("div");
    
    notificationContainer.id = "notification-container";
    document.body.appendChild(notificationContainer);

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let isEditing = false, editIndex = null;

    function showNotification(message, type = "success") {
        const notification = document.createElement("div");
        notification.classList.add("notification", type);
        notification.textContent = message;
        
        notificationContainer.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function loadTasks() {
        taskList.innerHTML = "";
        let filteredTasks = tasks.filter(task =>
            task.title.toLowerCase().includes(searchTask.value.toLowerCase()) &&
            (filterPriority.value === "all" || task.priority === filterPriority.value) &&
            (filterStatus.value === "all" || (filterStatus.value === "completed" ? task.completed : !task.completed))
        );

        filteredTasks.forEach((task, index) => {
            const taskElement = document.createElement("div");
            taskElement.classList.add("task");
            if (task.completed) taskElement.classList.add("completed");

            taskElement.innerHTML = `
                <div>
                    <strong>${task.title}</strong> - ${task.description}
                    <br>
                    <small>Due: ${task.deadline || "No deadline"} | Priority: <span class="priority ${task.priority.toLowerCase()}">${task.priority}</span></small>
                </div>
                <div class="task-buttons">
                    <button class="complete-btn">✔</button>
                    <button class="edit-btn">✏️</button>
                    <button class="delete-btn">❌</button>
                </div>
            `;

            taskElement.querySelector(".complete-btn").addEventListener("click", () => {
                tasks[index].completed = !tasks[index].completed;
                saveTasks();
                loadTasks();
                updateProgress();
                showNotification(`Task marked as ${tasks[index].completed ? "completed" : "incomplete"}`, "info");
            });

            taskElement.querySelector(".edit-btn").addEventListener("click", () => {
                editTask(index);
            });

            taskElement.querySelector(".delete-btn").addEventListener("click", () => {
                tasks.splice(index, 1);
                saveTasks();
                loadTasks();
                renderCalendar();
                updateProgress();
                showNotification("Task deleted", "error");
            });

            taskList.appendChild(taskElement);
        });

        updateProgress();
    }

    function updateProgress() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const percentage = totalTasks ? (completedTasks / totalTasks) * 100 : 0;
        progressCircle.style.strokeDasharray = `${(percentage / 100) * 157} 157`;
        progressText.textContent = `${Math.round(percentage)}%`;
    }

    function renderCalendar() {
        calendar.innerHTML = "<h3>Task Deadlines</h3>";
        tasks.forEach(task => {
            if (task.deadline) {
                const deadline = new Date(task.deadline).toLocaleDateString();
                const taskItem = document.createElement("div");
                taskItem.classList.add("calendar-task");
                taskItem.innerHTML = `<strong>${task.title}</strong> - ${deadline}`;
                calendar.appendChild(taskItem);
            }
        });
    }

    addTaskButton.addEventListener("click", () => {
        if (!taskTitle.value.trim()) {
            showNotification("Task title is required!", "error");
            return;
        }

        const newTask = {
            title: taskTitle.value.trim(),
            description: taskDescription.value.trim(),
            deadline: taskDeadline.value || "No deadline",
            priority: taskPriority.value,
            completed: false
        };

        if (isEditing) {
            tasks[editIndex] = newTask;
            isEditing = false;
            editIndex = null;
            addTaskButton.textContent = "Add Task";
            showNotification("Task updated successfully!", "info");
        } else {
            tasks.push(newTask);
            showNotification("Task added successfully!", "success");
        }

        saveTasks();
        loadTasks();
        renderCalendar();
        resetInputFields();
    });

    clearAllButton.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear all tasks?")) {
            tasks = [];
            saveTasks();
            loadTasks();
            renderCalendar();
            showNotification("All tasks cleared!", "error");
        }
    });

    function editTask(index) {
        const task = tasks[index];

        taskTitle.value = task.title;
        taskDescription.value = task.description;
        taskDeadline.value = task.deadline;
        taskPriority.value = task.priority;

        addTaskButton.textContent = "Update Task";
        isEditing = true;
        editIndex = index;
    }

    function resetInputFields() {
        taskTitle.value = "";
        taskDescription.value = "";
        taskDeadline.value = "";
        taskPriority.value = "Medium";
    }

    // Event listeners for filters and search
    searchTask.addEventListener("input", loadTasks);
    filterPriority.addEventListener("change", loadTasks);
    filterStatus.addEventListener("change", loadTasks);

    loadTasks();
    renderCalendar();
});
