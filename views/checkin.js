// checkin.js

window.CheckInView = {
    render() {
        const data = Store.getUserData();
        const pastCheckins = data.checkins || [];
        
        return `
            <div class="view-section active" id="checkin-view">
                <style>
                    .tab-group { display: flex; background: var(--bg-surface-elevated); padding: 4px; border-radius: 12px; margin-bottom: 20px;}
                    .tab-btn { flex: 1; text-align: center; padding: 10px; border-radius: 8px; cursor: pointer; color: var(--text-secondary); font-size: 0.95rem; font-weight: 600; border: none; background: transparent; transition: all 0.2s; }
                    .tab-btn.active { background: var(--bg-surface); color: var(--text-primary); box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
                    .tab-content { display: none; }
                    .tab-content.active { display: block; animation: fadeIn 0.3s; }
                    
                    .form-group { margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid var(--border-color); }
                    .form-group:last-child { border-bottom: none; }
                    .form-label { display: block; font-weight: 600; margin-bottom: 12px; font-size: 1.05rem; }
                    .sub-label { display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px; }
                    
                    .scale-group { display: flex; justify-content: space-between; gap: 8px; }
                    .scale-btn { flex: 1; padding: 12px 0; background: var(--bg-surface-elevated); border: 1px solid var(--border-color); border-radius: 10px; color: var(--text-primary); cursor: pointer; transition: all 0.2s; font-weight: 600; font-size: 1.1rem; }
                    .scale-btn.selected { background: var(--accent-color); color: #000; border-color: var(--accent-color); transform: scale(1.05); }
                    
                    .history-card { background: var(--bg-surface-elevated); border-radius: 12px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--border-color); }
                    .history-date { font-weight: 700; font-size: 1.1rem; margin-bottom: 12px; color: var(--accent-color); }
                    .history-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
                    .history-stat { display: flex; flex-direction: column; }
                    .h-label { font-size: 0.8rem; color: var(--text-secondary); }
                    .h-val { font-weight: 600; }
                    .h-text { font-size: 0.9rem; margin-top: 8px; font-style: italic; color: var(--text-secondary); }
                </style>
                
                <div class="tab-group">
                    <button class="tab-btn active" data-tab="form">New Check-In</button>
                    <button class="tab-btn" data-tab="history">Past Check-Ins</button>
                </div>
                
                <div class="tab-content active" id="tab-form">
                    <div class="card">
                        <h2 class="section-title">Weekly Check-In</h2>
                        
                        <!-- 1. Overall Energy -->
                        <div class="form-group">
                            <label class="form-label">1. Overall Energy (1-5)</label>
                            <div class="scale-group" id="scale-energy">
                                ${[1,2,3,4,5].map(n => `<button class="scale-btn" data-val="${n}">${n}</button>`).join('')}
                            </div>
                        </div>

                        <!-- 2. Steps Consistency -->
                        <div class="form-group">
                            <label class="form-label">2. Steps Consistency (1-5)</label>
                            <div class="scale-group" id="scale-steps">
                                ${[1,2,3,4,5].map(n => `<button class="scale-btn" data-val="${n}">${n}</button>`).join('')}
                            </div>
                        </div>

                        <!-- 3. Sleep Quality -->
                        <div class="form-group">
                            <label class="form-label">3. Sleep Quality (1-5)</label>
                            <div class="scale-group" id="scale-sleep">
                                ${[1,2,3,4,5].map(n => `<button class="scale-btn" data-val="${n}">${n}</button>`).join('')}
                            </div>
                        </div>

                        <!-- 4. Protein Hit (Days) -->
                        <div class="form-group">
                            <label class="form-label">4. Protein Goals Hit</label>
                            <span class="sub-label">How many days did you hit your protein goal?</span>
                            <input type="number" id="inp-protein" class="input-field" placeholder="0-7 days" min="0" max="7">
                        </div>

                        <!-- 5. Workouts Done -->
                        <div class="form-group">
                            <label class="form-label">5. Workouts Completed</label>
                            <input type="number" id="inp-workouts" class="input-field" placeholder="Number of workouts">
                        </div>

                        <!-- 6. Weight Change -->
                        <div class="form-group">
                            <label class="form-label">6. Weight Change</label>
                            <span class="sub-label">Did you lose or gain? (e.g. -1.5, +0.5)</span>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <input type="number" step="0.1" id="inp-weight" class="input-field" placeholder="0.0" style="margin-bottom:0;">
                                <span style="font-weight: 600; color: var(--text-secondary);">lbs</span>
                            </div>
                        </div>

                        <!-- 7. Biggest Struggle -->
                        <div class="form-group">
                            <label class="form-label">7. Biggest Struggle</label>
                            <textarea id="inp-struggle" class="input-field" style="resize:vertical; min-height:80px;" placeholder="What was hardest this week?"></textarea>
                        </div>

                        <!-- 8. Next Week Focus -->
                        <div class="form-group">
                            <label class="form-label">8. Focus for Next Week</label>
                            <textarea id="inp-focus" class="input-field" style="resize:vertical; min-height:80px;" placeholder="What will you improve?"></textarea>
                        </div>

                        <button class="btn btn-primary" id="submit-checkin" style="width: 100%; font-size: 1.1rem; padding: 16px;">Submit Check-In</button>
                    </div>
                </div>
                
                <div class="tab-content" id="tab-history">
                    <h2 class="section-title">Past Check-Ins</h2>
                    ${pastCheckins.length === 0 ? '<p style="color:var(--text-secondary);text-align:center;padding:40px 0;">No past check-ins found.</p>' : currentHistoryHtml(pastCheckins)}
                </div>
            </div>
        `;
        
        function currentHistoryHtml(checkins) {
            return checkins.slice().reverse().map(c => `
                <div class="history-card">
                    <div class="history-date">${new Date(c.date).toLocaleDateString()}</div>
                    <div class="history-grid">
                        <div class="history-stat"><span class="h-label">Energy</span><span class="h-val">${c.energy}/5</span></div>
                        <div class="history-stat"><span class="h-label">Steps Cons.</span><span class="h-val">${c.steps}/5</span></div>
                        <div class="history-stat"><span class="h-label">Sleep Qual.</span><span class="h-val">${c.sleep}/5</span></div>
                        <div class="history-stat"><span class="h-label">Protein Hit</span><span class="h-val">${c.protein} days</span></div>
                        <div class="history-stat"><span class="h-label">Workouts</span><span class="h-val">${c.workouts}</span></div>
                        <div class="history-stat"><span class="h-label">Wt Change</span><span class="h-val">${c.weight > 0 ? '+'+c.weight : c.weight} lbs</span></div>
                    </div>
                    <div class="h-text"><strong>Struggle:</strong> ${c.struggle || 'None'}</div>
                    <div class="h-text"><strong>Focus:</strong> ${c.focus || 'None'}</div>
                </div>
            `).join('');
        }
    },
    
    mount(container) {
        // Tab routing
        const tabs = container.querySelectorAll('.tab-btn');
        tabs.forEach(btn => {
            btn.addEventListener('click', (e) => {
                tabs.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                container.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
                container.querySelector(`#tab-${btn.dataset.tab}`).classList.add('active');
            });
        });

        // Scales selection
        const setupScale = (id) => {
            const btns = container.querySelectorAll(`#${id} .scale-btn`);
            btns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    btns.forEach(b => b.classList.remove('selected'));
                    e.target.classList.add('selected');
                });
            });
        };
        ['scale-energy', 'scale-steps', 'scale-sleep'].forEach(setupScale);

        // Submitting
        container.querySelector('#submit-checkin').addEventListener('click', () => {
            const getScaleVal = (id) => {
                const sel = container.querySelector(`#${id} .scale-btn.selected`);
                return sel ? parseInt(sel.dataset.val) : 0;
            };

            const checkin = {
                date: Store.getActiveDate().toISOString(),
                energy: getScaleVal('scale-energy'),
                steps: getScaleVal('scale-steps'),
                sleep: getScaleVal('scale-sleep'),
                protein: container.querySelector('#inp-protein').value || 0,
                workouts: container.querySelector('#inp-workouts').value || 0,
                weight: container.querySelector('#inp-weight').value || 0,
                struggle: container.querySelector('#inp-struggle').value,
                focus: container.querySelector('#inp-focus').value
            };

            // Validate
            if (!checkin.energy || !checkin.steps || !checkin.sleep) {
                alert("Please select a value for the 1-5 scales.");
                return;
            }

            const data = Store.getUserData();
            if (!data.checkins) data.checkins = [];
            data.checkins.push(checkin);
            Store.saveData();
            
            alert("Check-in submitted successfully!");
            App.renderView(); // Re-render to show new history
            
            // Auto switch to history tab
            setTimeout(() => {
                container.querySelector('.tab-btn[data-tab="history"]').click();
            }, 100);
        });
    }
};
