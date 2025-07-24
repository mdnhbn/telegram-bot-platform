// frontend/assets/js/tasks.js

const tasks = {
    tgUser: null,
    currentTask: null,
    timerInterval: null,
    isTabActive: true,

    init: function() {
        if (window.Telegram && Telegram.WebApp) {
            Telegram.WebApp.ready();
            this.tgUser = Telegram.WebApp.initDataUnsafe.user;
        } else {
            console.warn("Not in Telegram. Using mock user.");
            this.tgUser = { id: '12345' };
        }
        
        this.fetchTasks();
        this.addEventListeners();
        this.handleVisibilityChange();
    },

    addEventListeners: function() {
        document.getElementById('modalCloseButton').addEventListener('click', () => this.closeModal());
    },
    
    handleVisibilityChange: function() {
        document.addEventListener('visibilitychange', () => {
            this.isTabActive = document.visibilityState === 'visible';
            if(this.timerInterval && !this.isTabActive) {
                console.log("Tab is not active, timer paused.");
            }
        });
    },

    fetchTasks: function() {
        const taskList = document.getElementById('taskList');
        api.post('/tasks/available', { userId: this.tgUser.id })
            .then(response => {
                document.getElementById('loader').style.display = 'none';
                if (response.data.tasks.length === 0) {
                    taskList.innerHTML = '<p style="text-align:center;">No new tasks available. Please check back later.</p>';
                } else {
                    this.renderTasks(response.data.tasks);
                }
                if(response.data.limitMessage) {
                    const limitMsgEl = document.getElementById('dailyLimitMessage');
                    limitMsgEl.textContent = response.data.limitMessage;
                    limitMsgEl.style.display = 'block';
                }
            })
            .catch(error => {
                console.error("Failed to fetch tasks:", error);
                document.getElementById('loader').style.display = 'none';
                taskList.innerHTML = '<p style="text-align:center;color:var(--error-color);">Could not load tasks. Please try again.</p>';
            });
    },

    renderTasks: function(tasks) {
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '';
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-card ${task.type}`; // e.g., video, website, dynamic
            li.dataset.taskId = task.id;
            li.dataset.taskType = task.type;

            let iconHtml = '<i class="fas fa-tasks"></i>';
            if (task.type === 'video') iconHtml = '<i class="fab fa-youtube"></i>';
            if (task.type === 'website') iconHtml = '<i class="fas fa-globe"></i>';
            if (task.type === 'dynamic') iconHtml = `<i class="fas fa-${task.icon || 'star'}"></i>`; // Dynamic icon from backend

            li.innerHTML = `
                <div class="task-icon" style="color:${task.color || 'var(--primary-color)'}">${iconHtml}</div>
                <div class="task-details">
                    <h3>${task.title}</h3>
                    <p>${task.description}</p>
                </div>
                <div class="task-reward">
                    <div class="points">+${task.points} Pts</div>
                    <div class="xp">+${task.xp} XP</div>
                </div>
            `;
            li.addEventListener('click', () => this.startTask(task));
            taskList.appendChild(li);
        });
    },

    startTask: function(task) {
        this.currentTask = task;
        const modalTitle = document.getElementById('modalTaskTitle');
        const modalBody = document.getElementById('modalBody');

        modalTitle.textContent = task.title;
        let bodyHtml = `<p>${task.instruction}</p>`;

        // Render based on task type
        if (task.type === 'video' || task.type === 'website') {
            bodyHtml += `<iframe id="task-iframe" src="${task.url}" sandbox="allow-scripts allow-same-origin allow-presentation"></iframe>`;
            bodyHtml += `<div class="task-timer" id="timer">${task.duration}s</div>`;
        }
        
        // For dynamic tasks that need input
        if (task.submissionType) {
             bodyHtml += `
                <div id="submission-area">
                    <label>${task.submissionLabel}</label>`;
            if (task.submissionType === 'text') {
                bodyHtml += `<input type="text" id="submissionInput" placeholder="Enter your text here">`;
            } else if (task.submissionType === 'textarea') {
                bodyHtml += `<textarea id="submissionInput" rows="3" placeholder="Enter details here"></textarea>`;
            } else if (task.submissionType === 'file') {
                bodyHtml += `<input type="file" id="submissionInput" accept="image/*">`;
            }
            bodyHtml += `</div>`;
        }

        bodyHtml += `<button class="action-button claim-button" id="claimButton" disabled>Claim Reward</button>`;
        modalBody.innerHTML = bodyHtml;

        this.openModal();
        if (task.duration) {
            this.runTimer(task.duration);
        } else {
             document.getElementById('claimButton').disabled = false;
        }

        document.getElementById('claimButton').addEventListener('click', () => this.submitTask());
    },
    
    runTimer: function(duration) {
        const timerEl = document.getElementById('timer');
        const claimButton = document.getElementById('claimButton');
        let timeLeft = duration;

        this.timerInterval = setInterval(() => {
            if (this.isTabActive && timeLeft > 0) {
                timeLeft--;
                timerEl.textContent = `${timeLeft}s`;
            }
            if (timeLeft <= 0) {
                clearInterval(this.timerInterval);
                timerEl.textContent = "Time's up!";
                claimButton.disabled = false;
                claimButton.textContent = 'Claim Reward';
                Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            }
        }, 1000);
    },

    submitTask: function() {
        const claimButton = document.getElementById('claimButton');
        claimButton.disabled = true;
        claimButton.textContent = "Submitting...";
        
        let submissionData = {
            userId: this.tgUser.id,
            taskId: this.currentTask.id
        };
        
        if (this.currentTask.submissionType) {
            const input = document.getElementById('submissionInput');
            if(this.currentTask.submissionType === 'file'){
                // File upload needs FormData and different handling
                const formData = new FormData();
                formData.append('userId', this.tgUser.id);
                formData.append('taskId', this.currentTask.id);
                formData.append('submissionFile', input.files[0]);
                // Use formData for API call
                this.callSubmitApi(formData, true);
                return;
            } else {
                submissionData.submissionValue = input.value;
            }
        }
        
        this.callSubmitApi(submissionData, false);
    },

    callSubmitApi: function(data, isFormData = false){
        const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
        api.post('/tasks/submit', data, config)
            .then(response => {
                alert(response.data.message);
                this.closeModal();
                this.fetchTasks(); // Refresh task list
            })
            .catch(error => {
                alert(error.response.data.message || "An error occurred.");
                document.getElementById('claimButton').disabled = false;
                document.getElementById('claimButton').textContent = 'Claim Reward';
            });
    },

    openModal: function() {
        document.getElementById('taskModal').classList.add('active');
    },

    closeModal: function() {
        if(this.timerInterval) clearInterval(this.timerInterval);
        document.getElementById('taskModal').classList.remove('active');
        this.currentTask = null;
    }
};
