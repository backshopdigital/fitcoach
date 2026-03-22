// admin.js

window.AdminView = {
    currentWorkoutTarget: "Push",

    render() {
        const keaton = Store.getUserConfig('keaton').goals;
        const emily = Store.getUserConfig('emily').goals;
        const workouts = Store.getWorkoutsConfig();
        const splitNames = Object.keys(workouts);
        
        return `
            <div class="view-section active" id="admin-view">
                <style>
                    .admin-tab-group { display: flex; background: var(--bg-surface-elevated); padding: 4px; border-radius: 12px; margin-bottom: 20px;}
                    .admin-tab-btn { flex: 1; text-align: center; padding: 10px; border-radius: 8px; cursor: pointer; color: var(--text-secondary); font-size: 0.95rem; font-weight: 600; border: none; background: transparent; transition: all 0.2s; }
                    .admin-tab-btn.active { background: var(--bg-surface); color: var(--text-primary); box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
                    .admin-tab-content { display: none; }
                    .admin-tab-content.active { display: block; animation: fadeIn 0.3s; }
                    
                    .admin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
                    .admin-label { font-size: 0.8rem; color: var(--text-secondary); font-weight: 600; margin-bottom: 4px; display: block; }
                    .admin-input { width: 100%; background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-primary); padding: 10px; border-radius: 8px; outline: none; transition: border-color 0.2s; }
                    .admin-input:focus { border-color: var(--accent-color); }
                    
                    .ex-row { display: grid; grid-template-columns: 2fr 1fr 1fr 40px; gap: 8px; align-items: center; margin-bottom: 12px; background: var(--bg-main); padding: 8px; border-radius: 8px; border: 1px solid var(--border-color);}
                    .ex-del-btn { background: var(--error-dim); color: var(--error-color); border: none; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
                </style>
                
                <h2 class="section-title">Settings & Data</h2>
                
                <div class="admin-tab-group">
                    <button class="admin-tab-btn active" data-tab="macros">User Macros</button>
                    <button class="admin-tab-btn" data-tab="workouts">Workout Plans</button>
                </div>
                
                <!-- Macros Editor -->
                <div class="admin-tab-content active" id="tab-macros">
                    <div class="card">
                        <h3 class="section-title" style="color: var(--accent-color);">Keaton's Targets</h3>
                        <div class="admin-grid">
                            <div><label class="admin-label">Calories</label><input type="number" id="k-cals" class="admin-input" value="${keaton.calories}"></div>
                            <div><label class="admin-label">Protein (g)</label><input type="number" id="k-pro" class="admin-input" value="${keaton.protein}"></div>
                            <div><label class="admin-label">Carbs (g)</label><input type="number" id="k-carbs" class="admin-input" value="${keaton.carbs}"></div>
                            <div><label class="admin-label">Fat (g)</label><input type="number" id="k-fat" class="admin-input" value="${keaton.fat}"></div>
                        </div>
                        <div><label class="admin-label">Daily Steps</label><input type="number" id="k-steps" class="admin-input" value="${keaton.steps}"></div>
                        <button class="btn btn-primary" id="save-k-btn" style="width:100%; margin-top:16px;">Save Keaton</button>
                    </div>

                    <div class="card">
                        <h3 class="section-title" style="color: var(--accent-color);">Emily's Targets</h3>
                        <div class="admin-grid">
                            <div><label class="admin-label">Calories</label><input type="number" id="e-cals" class="admin-input" value="${emily.calories}"></div>
                            <div><label class="admin-label">Protein (g)</label><input type="number" id="e-pro" class="admin-input" value="${emily.protein}"></div>
                            <div><label class="admin-label">Carbs (g)</label><input type="number" id="e-carbs" class="admin-input" value="${emily.carbs}"></div>
                            <div><label class="admin-label">Fat (g)</label><input type="number" id="e-fat" class="admin-input" value="${emily.fat}"></div>
                        </div>
                        <div><label class="admin-label">Daily Steps</label><input type="number" id="e-steps" class="admin-input" value="${emily.steps}"></div>
                        <button class="btn btn-primary" id="save-e-btn" style="width:100%; margin-top:16px;">Save Emily</button>
                    </div>
                </div>
                
                <!-- Workouts Editor -->
                <div class="admin-tab-content" id="tab-workouts">
                    <div class="card">
                        <h3 class="section-title">Edit Workout Split</h3>
                        <select id="split-selector" class="admin-input" style="margin-bottom: 16px;">
                            ${splitNames.map(name => `<option value="${name}" ${this.currentWorkoutTarget === name ? 'selected' : ''}>${name}</option>`).join('')}
                        </select>
                        
                        <div id="exercises-editor-container">
                            <!-- Injected by mount -->
                        </div>
                        
                        <button class="btn" id="add-ex-btn" style="width:100%; margin-bottom: 16px; border-style: dashed;">+ Add Exercise</button>
                        <button class="btn btn-primary" id="save-w-btn" style="width:100%;">Save Split</button>
                    </div>
                </div>
                
                <div style="height: 40px;"></div>
            </div>
        `;
    },
    
    renderExercisesEditor(splitName) {
        const workouts = Store.getWorkoutsConfig();
        const exercises = workouts[splitName] || [];
        
        return exercises.map((ex, idx) => `
            <div class="ex-row" data-idx="${idx}">
                <input type="text" class="admin-input ex-name" value="${ex.name}" placeholder="Name">
                <input type="number" class="admin-input ex-sets" value="${ex.sets}" placeholder="Sets">
                <input type="text" class="admin-input ex-reps" value="${ex.reps}" placeholder="Reps">
                <button class="ex-del-btn"><i data-lucide="trash-2" style="width:16px;height:16px;"></i></button>
            </div>
        `).join('');
    },
    
    mount(container) {
        // Tab switching
        const tabs = container.querySelectorAll('.admin-tab-btn');
        tabs.forEach(btn => {
            btn.addEventListener('click', () => {
                tabs.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                container.querySelectorAll('.admin-tab-content').forEach(tc => tc.classList.remove('active'));
                container.querySelector(`#tab-${btn.dataset.tab}`).classList.add('active');
            });
        });
        
        // Save Macros (Keaton)
        container.querySelector('#save-k-btn').addEventListener('click', (e) => {
            const goals = {
                calories: parseInt(container.querySelector('#k-cals').value),
                protein: parseInt(container.querySelector('#k-pro').value),
                carbs: parseInt(container.querySelector('#k-carbs').value),
                fat: parseInt(container.querySelector('#k-fat').value),
                steps: parseInt(container.querySelector('#k-steps').value)
            };
            Store.updateUserConfig('keaton', { goals });
            e.target.textContent = "Saved ✓";
            setTimeout(() => e.target.textContent = "Save Keaton", 2000);
        });

        // Save Macros (Emily)
        container.querySelector('#save-e-btn').addEventListener('click', (e) => {
            const goals = {
                calories: parseInt(container.querySelector('#e-cals').value),
                protein: parseInt(container.querySelector('#e-pro').value),
                carbs: parseInt(container.querySelector('#e-carbs').value),
                fat: parseInt(container.querySelector('#e-fat').value),
                steps: parseInt(container.querySelector('#e-steps').value)
            };
            Store.updateUserConfig('emily', { goals });
            e.target.textContent = "Saved ✓";
            setTimeout(() => e.target.textContent = "Save Emily", 2000);
        });
        
        // Workouts
        const edContainer = container.querySelector('#exercises-editor-container');
        const selector = container.querySelector('#split-selector');
        
        const refreshEditor = () => {
            this.currentWorkoutTarget = selector.value;
            edContainer.innerHTML = this.renderExercisesEditor(this.currentWorkoutTarget);
            lucide.createIcons();
            
            // Re-bind delete buttons
            edContainer.querySelectorAll('.ex-del-btn').forEach(delBtn => {
                delBtn.addEventListener('click', (e) => {
                    e.currentTarget.closest('.ex-row').remove();
                });
            });
        };
        
        selector.addEventListener('change', refreshEditor);
        refreshEditor(); // Initial render
        
        // Add Exercise
        container.querySelector('#add-ex-btn').addEventListener('click', () => {
            const idx = edContainer.children.length;
            const newRow = document.createElement('div');
            newRow.className = "ex-row";
            newRow.dataset.idx = idx;
            newRow.innerHTML = `
                <input type="text" class="admin-input ex-name" value="" placeholder="New Exercise">
                <input type="number" class="admin-input ex-sets" value="3" placeholder="Sets">
                <input type="text" class="admin-input ex-reps" value="10" placeholder="Reps">
                <button class="ex-del-btn"><i data-lucide="trash-2" style="width:16px;height:16px;"></i></button>
            `;
            edContainer.appendChild(newRow);
            lucide.createIcons();
            newRow.querySelector('.ex-del-btn').addEventListener('click', (e) => {
                e.currentTarget.closest('.ex-row').remove();
            });
        });
        
        // Save Workout Split
        container.querySelector('#save-w-btn').addEventListener('click', (e) => {
            const newExercises = Array.from(edContainer.querySelectorAll('.ex-row')).map(row => ({
                name: row.querySelector('.ex-name').value,
                sets: parseInt(row.querySelector('.ex-sets').value) || 0,
                reps: row.querySelector('.ex-reps').value
            })).filter(ex => ex.name.trim() !== "");
            
            Store.updateWorkoutsConfig(this.currentWorkoutTarget, newExercises);
            e.target.textContent = "Saved Split ✓";
            setTimeout(() => e.target.textContent = "Save Split", 2000);
        });
    }
};
