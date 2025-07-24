// frontend/assets/js/main.js

const main = {
    tgUser: null,
    
    initDashboard: function() {
        if (window.Telegram && Telegram.WebApp) {
            Telegram.WebApp.ready();
            this.tgUser = Telegram.WebApp.initDataUnsafe.user;

            if (!this.tgUser) {
                alert("Cannot get user data. Please access via Telegram.");
                return;
            }
            this.fetchDashboardData();
        } else {
             // For testing in a normal browser
            console.log("Not in Telegram, using mock data for testing.");
            this.tgUser = { id: '12345', first_name: 'Test', username: 'testuser' };
            this.fetchDashboardData();
        }
    },

    fetchDashboardData: function() {
        const loader = document.getElementById('loader');
        const dashboardContent = document.getElementById('dashboardContent');
        
        api.post('/user/dashboard', { userId: this.tgUser.id })
            .then(response => {
                this.renderDashboard(response.data);
                loader.style.display = 'none';
                dashboardContent.style.display = 'block';
            })
            .catch(error => {
                console.error('Failed to load dashboard data:', error);
                loader.innerHTML = '<p style="text-align:center;color:var(--error-color);">Failed to load data. Please refresh.</p>';
            });
    },

    renderDashboard: function(data) {
        // User Header
        document.getElementById('username').textContent = data.user.firstName;
        const avatarDiv = document.getElementById('avatar');
        if (data.user.photoUrl) {
            avatarDiv.innerHTML = `<img src="${data.user.photoUrl}" alt="A">`;
        } else {
            avatarDiv.textContent = data.user.firstName.charAt(0).toUpperCase();
        }

        // Level and Balance
        document.getElementById('levelBadge').textContent = `Level: ${data.level.name}`;
        document.getElementById('balance').textContent = Math.floor(data.user.balance);

        // XP Bar
        const currentXp = data.user.xp;
        const requiredXp = data.level.xpRequired;
        const previousLevelXp = data.previousLevelXp; // This should come from backend

        const xpForThisLevel = currentXp - previousLevelXp;
        const xpNeededForNextLevel = requiredXp - previousLevelXp;
        
        const xpPercentage = (xpForThisLevel / xpNeededForNextLevel) * 100;
        
        document.getElementById('currentXp').textContent = `${currentXp} XP`;
        document.getElementById('nextLevelXp').textContent = `${requiredXp} XP`;
        document.getElementById('xpProgress').style.width = `${Math.min(xpPercentage, 100)}%`;
    }
};

// Global navigation handler
document.querySelectorAll('.footer-nav .nav-button').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default link behavior
        window.location.href = button.getAttribute('href');
    });
});
