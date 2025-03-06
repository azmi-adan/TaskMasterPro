document.addEventListener("DOMContentLoaded", () => {
    const taskTitle = document.getElementById("taskTitle");
    const taskDescription = document.getElementById("taskDescription");
    const taskDeadline = document.getElementById("taskDeadline");
    const taskPriority = document.getElementById("taskPriority");
    const addTaskButton = document.getElementById("addTask");
    const taskList = document.getElementById("taskList");
    const clearAllButton = document.getElementById("clearAll");
    const progressCircle = document.getElementById("progress-circle");
    const calendar = document.getElementById("calendar");
  
    let storedTasks = localStorage.getItem("tasks");
    let tasks = [];
  
    if (storedTasks) {
        try {
            tasks = JSON.parse(storedTasks);
            if (!Array.isArray(tasks)) {
                tasks = []; // Ensure it's an array
            }
        } catch (error) {
            console.error("Error parsing tasks from localStorage:", error);
            tasks = []; // Reset to empty array if JSON is invalid
        }
    }
  
    loadTasks();
    renderCalendar();
  
    function updateProgress() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const percentage = totalTasks ? (completedTasks / totalTasks) * 100 : 0;
        progressCircle.style.strokeDasharray = `${(percentage / 100) * 157} 157`;
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
                    <strong>${task.title}</strong> - ${task.description}
                    <br>
                    <small>Due: ${task.deadline} | Priority: <span class="priority ${task.priority.toLowerCase()}">${task.priority}</span></small>
                </div>
                <div class="task-buttons">
                    <button class="complete-btn">✔</button>
                    <button class="edit-btn">✏️</button>
                    <button class="delete-btn">❌</button>
                </div>
            `;
  
            // Add event listeners for buttons
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
                updateProgress();
            });
  
            taskList.appendChild(taskElement);
        });
        updateProgress();
    }
  
    function renderCalendar() {
        calendar.innerHTML = "<h3>Task Deadlines</h3>";
        tasks.forEach(task => {
            const deadline = new Date(task.deadline).toLocaleDateString();
            const taskItem = document.createElement("div");
            taskItem.classList.add("calendar-task");
            taskItem.innerHTML = `<strong>${task.title}</strong> - ${deadline}`;
            calendar.appendChild(taskItem);
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
  
        // Clear input fields
        taskTitle.value = "";
        taskDescription.value = "";
        taskDeadline.value = "";
        taskPriority.value = "Medium"; // Default priority
    });
  
    clearAllButton.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear all tasks?")) {
            tasks = [];
            saveTasks();
            loadTasks();
            renderCalendar();
        }
    });
  
    function editTask(index) {
        const task = tasks[index];
  
        // Populate input fields with existing task details
        taskTitle.value = task.title;
        taskDescription.value = task.description;
        taskDeadline.value = task.deadline;
        taskPriority.value = task.priority;
  
        // Change the button action to update the task instead of adding a new one
        addTaskButton.textContent = "Update Task";
        addTaskButton.onclick = function () {
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
  
            // Reset button to original state
            addTaskButton.textContent = "Add Task";
            addTaskButton.onclick = addTaskButton.click; // Restore default behavior
  
            // Clear input fields
            taskTitle.value = "";
            taskDescription.value = "";
            taskDeadline.value = "";
            taskPriority.value = "Medium";
        };

    }
    function triggerConfetti() {
        const confettiSettings = { target: 'confetti-canvas' };
        const confetti = new ConfettiGenerator(confettiSettings);
        confetti.render();
        setTimeout(() => confetti.clear(), 3000); // Clear confetti after 3 seconds
    }
    
    // Add this line inside the complete button event listener
    taskElement.querySelector(".complete-btn").addEventListener("click", () => {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        loadTasks();
        updateProgress();
        if (tasks[index].completed) triggerConfetti();
    });
  });