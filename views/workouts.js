// workouts.js

window.WorkoutsView = {
    render() {
        const config = Store.getUserConfig();
        const todayDay = new Date().getDay();
        const splitDay = config.split.find(s => s.day === todayDay) || {name: "Rest"};
        
        return `
            <div class="view-section active" id="workouts-view">
                <style>
                    .workout-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
                    .workout-tag { background: var(--accent-dim); color: var(--accent-color); padding: 6px 12px; border-radius: 20px; font-weight: 700; font-size: 0.85rem; }
                    .exercise-card { background: var(--bg-surface-elevated); border-radius: 12px; padding: 16px; margin-bottom: 16px; }
                    .exercise-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 12px; display: flex; justify-content: space-between; }
                    .exercise-target { color: var(--text-secondary); font-size: 0.85rem; font-weight: normal; }
                    .set-row { display: grid; grid-template-columns: 40px 1fr 1fr 40px; gap: 8px; align-items: center; margin-bottom: 8px; }
                    .set-num { color: var(--text-secondary); font-size: 0.9rem; font-weight: 600; text-align: center; }
                    .set-input { background: var(--bg-surface); border: 1px solid var(--border-color); color: var(--text-primary); padding: 8px; border-radius: 8px; text-align: center; font-size: 0.95rem; width: 100%; outline: none; }
                    .set-input:focus { border-color: var(--accent-color); }
                    .check-btn { background: var(--bg-surface); border: 1px solid var(--border-color); color: var(--text-secondary); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
                    .check-btn.completed { background: var(--accent-color); color: #000; border-color: var(--accent-color); }
                    .notes-input { width: 100%; background: var(--bg-surface); border: 1px solid var(--border-color); color: var(--text-primary); padding: 10px; border-radius: 8px; font-size: 0.9rem; margin-top: 8px; resize: none; outline: none;}
                    .notes-input:focus { border-color: var(--accent-color); }
                    .history-btn { font-size: 0.8rem; color: var(--accent-color); cursor: pointer; text-decoration: underline; background: none; border: none; padding: 0; }
                    .finish-btn { width: 100%; margin-top: 20px; font-size: 1.1rem; padding: 16px; }
                </style>
                
                <div class="workout-header">
                    <h2 class="section-title" style="margin:0;">Today's Plan</h2>
                    <div class="workout-tag">${splitDay.name}</div>
                </div>

                <div id="exercises-container" style="padding-bottom: 20px;">
                    ${this.renderExercises(splitDay.name)}
                </div>
                
                ${splitDay.name !== "Rest" ? `<button class="btn btn-primary finish-btn" id="finish-workout-btn">Complete Workout</button>` : ''}
            </div>
        `;
    },
    
    renderExercises(splitName) {
        if (splitName === "Rest") {
            return `
                <div class="card" style="text-align: center; padding: 40px 20px;">
                    <i data-lucide="coffee" style="width: 48px; height: 48px; color: var(--text-secondary); margin-bottom: 16px;"></i>
                    <h3 style="margin-bottom: 8px;">Rest Day</h3>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">Take it easy and recover today. Track your macros and steps!</p>
                </div>
            `;
        }
        
        const exercises = Store.getWorkoutsConfig()[splitName] || [];
        return exercises.map((ex, exIndex) => `
            <div class="exercise-card" data-exercise="${ex.name}">
                <div class="exercise-title">
                    <span>${ex.name}</span>
                    <div style="display: flex; flex-direction: column; align-items: flex-end;">
                        <span class="exercise-target">${ex.sets} Sets × ${ex.reps}</span>
                        <button class="history-btn" onclick="WorkoutsView.showHistory('${ex.name}')">History</button>
                    </div>
                </div>
                
                <div class="sets-container">
                    <div style="display: grid; grid-template-columns: 40px 1fr 1fr 40px; gap: 8px; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid var(--border-color); color: var(--text-secondary); font-size: 0.8rem; text-align: center;">
                        <span>Set</span>
                        <span>lbs</span>
                        <span>Reps</span>
                        <span><i data-lucide="check" style="width:14px;height:14px;"></i></span>
                    </div>
                    ${Array.from({length: ex.sets}).map((_, i) => `
                        <div class="set-row">
                            <div class="set-num">${i + 1}</div>
                            <input type="number" class="set-input set-weight" placeholder="0" />
                            <input type="text" class="set-input set-reps" placeholder="${ex.reps}" />
                            <button class="check-btn" onclick="this.classList.toggle('completed')">
                                <i data-lucide="check" style="width: 16px; height: 16px;"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
                <textarea class="notes-input" placeholder="Notes for ${ex.name}..."></textarea>
            </div>
        `).join('');
    },

    showHistory(exerciseName) {
        const data = Store.getUserData();
        const history = data.workoutHistory[exerciseName] || [];
        if (history.length === 0) {
            alert(`No history found for ${exerciseName}.`);
            return;
        }
        
        let histStr = history.map(h => `${h.date}: ${h.summary}`).join('\\n');
        alert(`History for ${exerciseName}:\\n\\n${histStr}`);
    },

    mount(container) {
        const btn = container.querySelector('#finish-workout-btn');
        if (btn) {
            // Check if already completed today
            if (Store.getTodayLog().workoutCompleted) {
                btn.textContent = "Workout Completed!";
                btn.style.backgroundColor = "var(--bg-surface-elevated)";
                btn.style.color = "var(--accent-color)";
            }

            btn.addEventListener('click', () => {
                if (Store.getTodayLog().workoutCompleted) return;
                
                // Harvest Data
                const data = Store.getUserData();
                const todayStr = Store.getTodayStr();
                
                container.querySelectorAll('.exercise-card').forEach(card => {
                    const exName = card.dataset.exercise;
                    if (!data.workoutHistory[exName]) data.workoutHistory[exName] = [];
                    
                    const weights = Array.from(card.querySelectorAll('.set-weight')).map(i => i.value || '0');
                    const reps = Array.from(card.querySelectorAll('.set-reps')).map(i => i.value || '0');
                    const notes = card.querySelector('.notes-input').value;
                    
                    const maxWeight = Math.max(...weights.map(w => Number(w)));
                    
                    data.workoutHistory[exName].push({
                        date: todayStr,
                        summary: `${maxWeight}lbs max, ${weights.length} sets`,
                        notes: notes,
                        details: weights.map((w, idx) => ({ weight: w, reps: reps[idx] }))
                    });
                });
                
                Store.updateTodayLog({ workoutCompleted: true });
                Store.saveData(); // Save history
                
                btn.textContent = "Workout Completed!";
                btn.style.backgroundColor = "var(--bg-surface-elevated)";
                btn.style.color = "var(--accent-color)";
            });
        }
    }
};
