// app.js
// Main application logic, routing, and generic setup

const App = {
    currentRoute: 'dashboard',
    
    init() {
        this.setupProfileSwitcher();
        this.setupNavigation();
        this.setupAdminBtn();
        this.renderView();
        
        // Initialize Lucide icons
        lucide.createIcons();
        
        // Subscribe to store updates to trigger re-renders
        Store.subscribe(() => {
            this.updateHeader();
            this.renderView(); // Re-render current view with new data
        });
        
        this.updateHeader();
    },
    
    setupAdminBtn() {
        document.getElementById('admin-nav-btn').addEventListener('click', () => {
            // Un-highlight bottom nav when on admin view
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            this.currentRoute = 'admin';
            this.renderView();
        });
    },
    
    setupProfileSwitcher() {
        const switcher = document.getElementById('profile-switcher');
        const dropdown = document.getElementById('profile-dropdown');
        
        switcher.addEventListener('click', (e) => {
            if (!e.target.classList.contains('profile-option')) {
                dropdown.classList.toggle('show');
            }
        });
        
        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!switcher.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
        
        // Switch user
        document.querySelectorAll('.profile-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = btn.dataset.userid;
                Store.switchUser(userId);
                dropdown.classList.remove('show');
            });
        });
    },
    
    updateHeader() {
        const nameEl = document.getElementById('current-user-name');
        nameEl.textContent = Store.getUserConfig().name;
    },
    
    setupNavigation() {
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                navBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Route
                this.currentRoute = btn.dataset.route;
                this.renderView();
            });
        });
    },
    
    renderView() {
        const main = document.getElementById('main-content');
        
        // Map routes to view instances
        const views = {
            'dashboard': window.DashboardView,
            'workouts': window.WorkoutsView,
            'weight': window.WeightView,
            'steps': window.StepsView,
            'checkin': window.CheckInView,
            'admin': window.AdminView
        };
        
        const view = views[this.currentRoute];
        if (view) {
            main.innerHTML = view.render();
            // Need to recreate icons in newly injected HTML
            lucide.createIcons();
            // Call post-render mounting/event binding logic if any
            if (typeof view.mount === 'function') {
                view.mount(main);
            }
        }
    }
};

// Initialize App only after DOM content is mapped
document.addEventListener('DOMContentLoaded', () => {
    // Provide some dummy objects for views if they haven't been loaded yet,
    // although they should be mapped before app.js using script tags.
    App.init();
});
