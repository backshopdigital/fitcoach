// steps.js

window.StepsView = {
    render() {
        const config = Store.getUserConfig();
        const todayLog = Store.getTodayLog() || {};
        const stepsGoal = config.goals.steps;
        const currentSteps = todayLog.steps || 0;
        
        const isGoalMet = currentSteps >= stepsGoal;
        const pct = Math.min(100, (currentSteps / stepsGoal) * 100);
        const color = isGoalMet ? "var(--accent-color)" : "var(--error-color)";
        
        return `
            <div class="view-section active" id="steps-view">
                <style>
                    .circle-progress-container { display: flex; justify-content: center; margin: 30px 0; position: relative; }
                    .circle-progress { width: 200px; height: 200px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: conic-gradient(${color} ${pct}%, var(--bg-surface-elevated) 0); position: relative; }
                    .circle-inner { width: 180px; height: 180px; background: var(--bg-main); border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; position: absolute; top: 10px; left: 10px; z-index: 2; box-shadow: inset 0 4px 10px rgba(0,0,0,0.5); }
                    .steps-val { font-size: 2.5rem; font-weight: 800; font-family: var(--font-heading); background: linear-gradient(180deg, #fff, #aaa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1; }
                    .steps-goal { font-size: 0.9rem; color: var(--text-secondary); margin-top: 8px; font-weight: 600; }
                    .status-message { text-align: center; margin-bottom: 24px; font-size: 1.1rem; font-weight: 600; color: ${color}; }
                </style>
                
                <h2 class="section-title">Today's Steps</h2>
                
                <div class="circle-progress-container">
                    <div class="circle-progress">
                        <div class="circle-inner">
                            <i data-lucide="footprints" style="color: ${color}; opacity: 0.6; margin-bottom: 8px;"></i>
                            <div class="steps-val">${currentSteps.toLocaleString()}</div>
                            <div class="steps-goal">/ ${stepsGoal.toLocaleString()} goal</div>
                        </div>
                    </div>
                </div>

                <div class="status-message">
                    ${isGoalMet ? "Goal Met! Great job!" : `${(stepsGoal - currentSteps).toLocaleString()} more to go!`}
                </div>
                
                <div class="card">
                    <h3 class="section-title" style="font-size: 1rem;">Log Steps manually</h3>
                    <div style="display: flex; gap: 12px;">
                        <input type="number" id="manual-steps-input" class="input-field" placeholder="Enter step count..." style="margin-bottom:0;" value="${currentSteps > 0 ? currentSteps : ''}">
                        <button class="btn btn-primary" id="save-steps-btn">Save</button>
                    </div>
                </div>
            </div>
        `;
    },
    
    mount(container) {
        container.querySelector('#save-steps-btn').addEventListener('click', () => {
            const val = parseInt(container.querySelector('#manual-steps-input').value, 10);
            if (!isNaN(val)) {
                Store.updateTodayLog({ steps: val });
                App.renderView(); // Re-render to update the circle and status
            }
        });
    }
};
