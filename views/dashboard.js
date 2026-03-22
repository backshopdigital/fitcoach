// dashboard.js

window.DashboardView = {
    render() {
        return `
            <div class="view-section active" id="dashboard-view">
                <style>
                    .date-nav { display:flex; align-items:center; gap:24px; margin-top:16px; justify-content:center; }
                    .date-nav-btn { background:var(--bg-surface-elevated); border:1px solid var(--border-color); color:var(--text-secondary); cursor:pointer; padding: 8px; border-radius: 8px; display:flex; align-items:center; justify-content:center; transition: all 0.2s; }
                    .date-nav-btn:hover { background:var(--accent-color); color:#000; border-color:var(--accent-color); }
                </style>
                <div class="streak-header">
                    <div class="streak-badge">
                        <i data-lucide="flame"></i>
                        <span id="streak-count">0 Day Streak</span>
                    </div>
                    <div class="date-nav">
                        <button class="date-nav-btn" id="dash-prev-day"><i data-lucide="chevron-left"></i></button>
                        <div class="date-display" id="current-date" style="margin-top:0; min-width: 140px; text-align:center;">...</div>
                        <button class="date-nav-btn" id="dash-next-day"><i data-lucide="chevron-right"></i></button>
                    </div>
                </div>

                <div class="card summary-card">
                    <h2 class="section-title">Today's Macros</h2>
                    <div class="macro-overview">
                        <div class="macro-main primary">
                            <span class="macro-label">Protein</span>
                            <span class="macro-val"><span id="dash-protein">0</span> / <span id="goal-protein">0</span>g</span>
                            <div class="progress-bar"><div class="progress-fill" id="prog-protein" style="width: 0%"></div></div>
                        </div>
                    </div>
                    
                    <div class="macro-grid">
                        <div class="macro-item">
                            <span class="macro-label">Calories</span>
                            <span class="macro-val"><span id="dash-cals">0</span> / <span id="goal-cals">0</span></span>
                            <div class="progress-bar"><div class="progress-fill" id="prog-cals" style="width: 0%"></div></div>
                        </div>
                        <div class="macro-item">
                            <span class="macro-label">Carbs</span>
                            <span class="macro-val"><span id="dash-carbs">0</span> / <span id="goal-carbs">0</span>g</span>
                            <div class="progress-bar"><div class="progress-fill" id="prog-carbs" style="width: 0%"></div></div>
                        </div>
                        <div class="macro-item">
                            <span class="macro-label">Fat</span>
                            <span class="macro-val"><span id="dash-fat">0</span> / <span id="goal-fat">0</span>g</span>
                            <div class="progress-bar"><div class="progress-fill" id="prog-fat" style="width: 0%"></div></div>
                        </div>
                    </div>
                </div>

                <div class="card" style="margin-bottom: 16px;">
                    <h3 class="section-title" style="font-size: 1rem; margin-bottom: 12px; margin-top: 0;">Log Macros</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <label style="display:block; font-size: 0.8rem; margin-bottom: 4px; color:var(--text-secondary);">Protein (g)</label>
                            <input type="number" id="inp-macro-protein" class="input-field" style="margin-bottom:0;" placeholder="0">
                        </div>
                        <div>
                            <label style="display:block; font-size: 0.8rem; margin-bottom: 4px; color:var(--text-secondary);">Calories</label>
                            <input type="number" id="inp-macro-cals" class="input-field" style="margin-bottom:0;" placeholder="0">
                        </div>
                        <div>
                            <label style="display:block; font-size: 0.8rem; margin-bottom: 4px; color:var(--text-secondary);">Carbs (g)</label>
                            <input type="number" id="inp-macro-carbs" class="input-field" style="margin-bottom:0;" placeholder="0">
                        </div>
                        <div>
                            <label style="display:block; font-size: 0.8rem; margin-bottom: 4px; color:var(--text-secondary);">Fat (g)</label>
                            <input type="number" id="inp-macro-fat" class="input-field" style="margin-bottom:0;" placeholder="0">
                        </div>
                    </div>
                    <button class="btn btn-primary" id="save-macros-btn" style="width: 100%; margin-top: 16px;">Save Macros</button>
                </div>

                <div class="stats-row">
                    <div class="card stat-card" onclick="document.querySelector('[data-route=steps]').click()">
                        <div class="stat-icon"><i data-lucide="footprints"></i></div>
                        <div class="stat-info">
                            <span class="stat-title">Steps</span>
                            <span class="stat-value"><span id="dash-steps">0</span> / <span id="goal-steps">0</span></span>
                        </div>
                    </div>
                    <div class="card stat-card" onclick="document.querySelector('[data-route=workouts]').click()">
                        <div class="stat-icon"><i data-lucide="dumbbell"></i></div>
                        <div class="stat-info">
                            <span class="stat-title">Workout</span>
                            <span class="stat-value" id="dash-workout-status">Pending</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    mount(container) {
        container.querySelector('#dash-prev-day').addEventListener('click', () => {
            Store.changeActiveDateBy(-1);
            if (window.App) App.renderView();
        });
        container.querySelector('#dash-next-day').addEventListener('click', () => {
            Store.changeActiveDateBy(1);
            if (window.App) App.renderView();
        });

        container.querySelector('#save-macros-btn').addEventListener('click', (e) => {
            e.preventDefault();
            const p = parseInt(document.getElementById('inp-macro-protein').value) || 0;
            const c = parseInt(document.getElementById('inp-macro-cals').value) || 0;
            const cb = parseInt(document.getElementById('inp-macro-carbs').value) || 0;
            const f = parseInt(document.getElementById('inp-macro-fat').value) || 0;
            
            Store.updateActiveLog({ protein: p, calories: c, carbs: cb, fat: f });
            
            const btn = document.getElementById('save-macros-btn');
            if (btn) {
                btn.textContent = "Saved!";
                btn.style.backgroundColor = "var(--bg-surface-elevated)";
                btn.style.color = "var(--accent-color)";
                
                setTimeout(() => {
                    const activeBtn = document.getElementById('save-macros-btn');
                    if (activeBtn) {
                        activeBtn.textContent = "Save Macros";
                        activeBtn.style.backgroundColor = "var(--accent-color)";
                        activeBtn.style.color = "#000";
                    }
                }, 1000);
            }
        });

        // Compute and update values
        this.updateData();
    },

    updateData() {
        const config = Store.getUserConfig();
        const logs = Store.getActiveLog();
        
        const dateEl = document.getElementById('current-date');
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        let displayStr = Store.getActiveDate().toLocaleDateString('en-US', options);
        
        if (displayStr === new Date().toLocaleDateString('en-US', options)) {
            displayStr = "Today";
        }
        dateEl.textContent = displayStr;
        
        // Goals
        document.getElementById('goal-protein').textContent = config.goals.protein;
        document.getElementById('goal-cals').textContent = config.goals.calories;
        document.getElementById('goal-carbs').textContent = config.goals.carbs;
        document.getElementById('goal-fat').textContent = config.goals.fat;
        document.getElementById('goal-steps').textContent = config.goals.steps;
        
        // Populate inputs
        document.getElementById('inp-macro-protein').value = logs.protein || '';
        document.getElementById('inp-macro-cals').value = logs.calories || '';
        document.getElementById('inp-macro-carbs').value = logs.carbs || '';
        document.getElementById('inp-macro-fat').value = logs.fat || '';

        const updateVal = (id, val, goalId, progId, isPrimary) => {
            document.getElementById(id).textContent = val || 0;
            const goal = config.goals[goalId];
            const pct = Math.min(100, ((val || 0) / goal) * 100);
            const fill = document.getElementById(progId);
            fill.style.width = pct + '%';
            if (pct >= 100) {
                fill.style.backgroundColor = 'var(--accent-color)';
            }
        };

        updateVal('dash-protein', logs.protein, 'protein', 'prog-protein', true);
        updateVal('dash-cals', logs.calories, 'calories', 'prog-cals');
        updateVal('dash-carbs', logs.carbs, 'carbs', 'prog-carbs');
        updateVal('dash-fat', logs.fat, 'fat', 'prog-fat');
        updateVal('dash-steps', logs.steps, 'steps', 'prog-steps');
        
        const woStatus = document.getElementById('dash-workout-status');
        if (logs.workoutCompleted) {
            woStatus.textContent = "Completed";
            woStatus.style.color = "var(--accent-color)";
        } else {
            woStatus.textContent = "Pending";
            woStatus.style.color = "var(--text-secondary)";
        }
        
        // Calculate Streak
        this.calculateStreak();
    },
    
    calculateStreak() {
        const data = Store.getUserData();
        const dates = Object.keys(data.dailyLogs).sort().reverse();
        let streak = 0;
        let today = new Date();
        today.setHours(0,0,0,0);
        
        for (let idx = 0; idx < dates.length; idx++) {
            const dateStr = dates[idx];
            const logDate = new Date(dateStr + "T00:00:00");
            
            // Check if date is consecutive from today backwards
            const diffDays = Math.floor((today - logDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === streak || (diffDays === streak + 1)) {
                // If it's a valid day, and they checked into anything (workout or macros or anything)
                // Let's define streak as "logged anything today".
                streak++;
                today = logDate; // shift reference day
            } else if (diffDays > streak + 1) {
                break; // streak brokeb
            }
        }
        
        document.getElementById('streak-count').textContent = streak + " Day Streak";
    }
};
