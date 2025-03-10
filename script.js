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

    // Add a notification button
    const notificationButton = document.createElement("button");
    notificationButton.textContent = "Notification";
    notificationButton.style.margin = "10px";
    notificationButton.style.padding = "10px";
    notificationButton.style.backgroundColor = "#2196F3";
    notificationButton.style.color = "white";
    notificationButton.style.border = "none";
    notificationButton.style.borderRadius = "5px";
    notificationButton.style.cursor = "pointer";
    document.body.insertBefore(notificationButton, document.body.firstChild);

    // Add search input
    const searchInput = document.createElement("input");
    searchInput.setAttribute("type", "text");
    searchInput.setAttribute("placeholder", "Search tasks...");
    searchInput.style.margin = "10px";
    searchInput.style.padding = "10px";
    searchInput.style.width = "100%";
    searchInput.style.maxWidth = "400px";
    searchInput.style.borderRadius = "8px";
    searchInput.style.border = "none";
    searchInput.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
    searchInput.style.color = "white";
    searchInput.style.outline = "none";
    searchInput.style.transition = "all 0.3s ease-in-out";
    document.body.insertBefore(searchInput, document.body.firstChild);

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    // Pre-populate a demo task (for demo purposes)
    const demoTask = {
        title: "Complete Project Demo",
        description: "Prepare and present the Task Manager project.",
        deadline: new Date(Date.now() + 5 * 60 * 1000).toISOString().split("T")[0], // 5 minutes from now
        priority: "High",
        completed: false
    };

    // Add the demo task if no tasks exist
    if (tasks.length === 0) {
        tasks.push(demoTask);
        saveTasks();
        loadTasks();
        renderCalendar();
        renderDeadlines();
    }

    // Request notification permission when the app loads
    requestNotificationPermission();

    loadTasks();
    renderCalendar();
    renderDeadlines();

    // Check for upcoming deadlines every minute (for demo purposes)
    setInterval(checkUpcomingDeadlines, 60 * 1000); // 60 seconds * 1000 milliseconds

    navbarToggler.addEventListener("click", () => {
        navbarNav.classList.toggle("active");
    });

    // Notification Button Click Event
    notificationButton.addEventListener("click", () => {
        const upcomingTasks = getUpcomingTasks(10); // Get top 10 upcoming tasks
        if (upcomingTasks.length > 0) {
            const notificationMessage = upcomingTasks
                .map((task, index) => `${index + 1}. ${task.title} (Due: ${task.deadline})`)
                .join("\n");
            showNotification("Upcoming Tasks", notificationMessage);
        } else {
            alert("No upcoming tasks found!");
        }
    });

    // Search Functionality
    searchInput.addEventListener("input", () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        filterTasks(searchTerm);
    });

    function filterTasks(searchTerm) {
        const filteredTasks = tasks.filter(task => {
            const titleMatch = task.title.toLowerCase().includes(searchTerm);
            const descriptionMatch = task.description.toLowerCase().includes(searchTerm);
            return titleMatch || descriptionMatch;
        });

        renderFilteredTasks(filteredTasks);
    }

    function renderFilteredTasks(filteredTasks) {
        taskList.innerHTML = "";
        filteredTasks.forEach((task, index) => {
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
    }

    function getUpcomingTasks(limit) {
        const now = new Date();
        // Filter tasks that are not completed and have a future deadline
        const upcomingTasks = tasks
            .filter(task => !task.completed && new Date(task.deadline) > now)
            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline)) // Sort by deadline
            .slice(0, limit); // Limit to top 10 tasks
        return upcomingTasks;
    }

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
        checkUpcomingDeadlines(); // Check deadlines after adding a new task
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

    // Notification Functions
    function requestNotificationPermission() {
        if (Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    console.log("Notification permission granted!");
                } else {
                    console.log("Notification permission denied.");
                }
            });
        }
    }

    function showNotification(title, message) {
        if (Notification.permission === "granted") {
            new Notification(title, {
                body: message,
                icon: "https://cdn-icons-png.flaticon.com/512/1827/1827504.png"
            });
        } else {
            console.log("Notification permission not granted.");
            alert("Notifications are blocked. Please enable them in your browser settings.");
        }
    }

    function checkUpcomingDeadlines() {
        const now = new Date();
        tasks.forEach(task => {
            const deadline = new Date(task.deadline);
            const timeDiff = deadline - now;
            const minutesDiff = timeDiff / (1000 * 60); // Convert milliseconds to minutes

            // Show notification if the deadline is within 5 minutes and the task is not completed
            if (minutesDiff <= 5 && minutesDiff > 0 && !task.completed) {
                console.log(`Task "${task.title}" is due within 5 minutes.`);
                showNotification(`Task Due: ${task.title}`, `Deadline: ${task.deadline}`);
            }
        });
    }
});