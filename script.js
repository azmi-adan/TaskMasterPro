document.addEventListener("DOMContentLoaded", () => {
    const taskTitle = document.getElementById("taskTitle");
    const taskDescription = document.getElementById("taskDescription");
    const taskDeadline = document.getElementById("taskDeadline");
    const taskPriority = document.getElementById("taskPriority");
    const addTaskButton = document.getElementById("addTask");
    const taskList = document.getElementById("taskList");
    const clearAllButton = document.getElementById("clearAll");
    const progressCircle = document.getElementById("progress-circle");
    const progressText = document.getElementById("progress-text");
    const calendarEl = document.getElementById("calendar");
    const deadlineList = document.getElementById("deadlineList");
    const navbarToggler = document.getElementById("navbarToggler");
    const navbarNav = document.getElementById("navbarNav");

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    loadTasks();
    renderCalendar();
    renderDeadlines();

    navbarToggler.addEventListener("click", () => {
        navbarNav.classList.toggle("active");
    });

    function updateProgress() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const percentage = totalTasks ? (completedTasks / totalTasks) * 100 : 0;
        progressCircle.style.strokeDasharray = `${(percentage / 100) * 157} 157`;
        progressText.textContent = `${Math.round(percentage)}%`;
    }

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function loadTasks() {
        taskList.innerHTML = "";
        tasks.forEach((task, index) => {
            const taskElement = document.createElement("div");
            taskElement.classList.add("task");
            if (task.completed) taskElement.classList.add("completed");
            
            taskElement.innerHTML = `
                <div>
                    <strong>${task.title}</strong>
                    <p>${task.description}</p>
                    <small>Due: ${task.deadline}</small>
                    <div class="priority ${task.priority.toLowerCase()}">${task.priority}</div>
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
            });

            taskElement.querySelector(".edit-btn").addEventListener("click", () => {
                editTask(index);
            });

            taskElement.querySelector(".delete-btn").addEventListener("click", () => {
                tasks.splice(index, 1);
                saveTasks();
                loadTasks();
                renderCalendar();
                renderDeadlines();
                updateProgress();
            });

            taskList.appendChild(taskElement);
        });
        updateProgress();
    }

    function renderCalendar() {
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            events: tasks.map(task => ({
                title: task.title,
                start: task.deadline,
                color: task.priority === 'High' ? '#ff4444' : task.priority === 'Medium' ? '#ffbb33' : '#00C851'
            }))
        });
        calendar.render();
    }

    function renderDeadlines() {
        deadlineList.innerHTML = "";
        tasks.forEach(task => {
            const deadlineItem = document.createElement("div");
            deadlineItem.classList.add("deadline-item");
            deadlineItem.innerHTML = `<strong>${task.title}</strong> - ${task.deadline}`;
            deadlineList.appendChild(deadlineItem);
        });
    }

    addTaskButton.addEventListener("click", () => {
        if (!taskTitle.value.trim()) {
            alert("Task title is required!");
            return;
        }

        const newTask = {
            title: taskTitle.value.trim(),
            description: taskDescription.value.trim(),
            deadline: taskDeadline.value || "No deadline",
            priority: taskPriority.value,
            completed: false
        };

        tasks.push(newTask);
        saveTasks();
        loadTasks();
        renderCalendar();
        renderDeadlines();

        resetForm();
    });

    clearAllButton.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear all tasks?")) {
            tasks = [];
            saveTasks();
            loadTasks();
            renderCalendar();
            renderDeadlines();
        }
    });

    function editTask(index) {
        const task = tasks[index];
        
        taskTitle.value = task.title;
        taskDescription.value = task.description;
        taskDeadline.value = task.deadline;
        taskPriority.value = task.priority;
        addTaskButton.textContent = "Update Task";

        // Remove existing event listeners
        const newAddTaskButton = addTaskButton.cloneNode(true);
        addTaskButton.parentNode.replaceChild(newAddTaskButton, addTaskButton);
        
        newAddTaskButton.addEventListener("click", function updateTask() {
            tasks[index] = {
                title: taskTitle.value.trim(),
                description: taskDescription.value.trim(),
                deadline: taskDeadline.value || "No deadline",
                priority: taskPriority.value,
                completed: task.completed
            };

            saveTasks();
            loadTasks();
            renderCalendar();
            renderDeadlines();

            resetForm();
        });
    }

    function resetForm() {
        taskTitle.value = "";
        taskDescription.value = "";
        taskDeadline.value = "";
        taskPriority.value = "Medium";
        addTaskButton.textContent = "Add Task";
    }

    // Splash screen handling
    const splashScreen = document.getElementById("splash-screen");
    setTimeout(() => {
        splashScreen.classList.add("fade-out");
        setTimeout(() => {
            splashScreen.remove();
        }, 1000);
    }, 4000);
});
