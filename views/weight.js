// weight.js

window.WeightView = {
    chartInstance: null,
    currentTrend: 30, // 30 or 90
    
    render() {
        const todayLog = Store.getActiveLog() || {};
        
        return `
            <div class="view-section active" id="weight-view">
                <style>
                    .weight-input-group { display: flex; gap: 12px; margin-bottom: 24px; }
                    .weight-input { flex: 1; text-align: center; font-size: 1.5rem; font-weight: 700; padding: 12px; background: var(--bg-surface-elevated); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 12px; outline: none;}
                    .weight-input:focus { border-color: var(--accent-color); }
                    .chart-container { position: relative; height: 250px; width: 100%; margin-bottom: 20px; }
                    .trend-toggles { display: flex; background: var(--bg-surface-elevated); border-radius: 12px; padding: 4px; margin-bottom: 16px; }
                    .trend-btn { flex: 1; text-align: center; padding: 8px; border-radius: 8px; cursor: pointer; color: var(--text-secondary); font-size: 0.9rem; font-weight: 600; border: none; background: transparent; }
                    .trend-btn.active { background: var(--bg-surface); color: var(--text-primary); box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
                    .stats-row-small { display: flex; justify-content: space-between; gap: 12px; margin-top: 20px;}
                    .stat-box { background: var(--bg-surface-elevated); padding: 12px; border-radius: 12px; flex: 1; text-align: center; }
                    .stat-box-label { font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 4px; }
                    .stat-box-val { font-size: 1.1rem; font-weight: 700; }
                </style>
                
                <h2 class="section-title">Log Today's Weight</h2>
                <div class="weight-input-group">
                    <input type="number" step="0.1" class="weight-input" id="weight-input-val" placeholder="0.0" value="${todayLog.weight || ''}">
                    <button class="btn btn-primary" id="save-weight-btn" style="width: 100px;">Save view</button>
                    <!-- Wait, just Save is better -->
                </div>
                
                <div class="card">
                    <div class="trend-toggles">
                        <button class="trend-btn active" data-days="30">30 Days</button>
                        <button class="trend-btn" data-days="90">90 Days</button>
                    </div>
                    
                    <div class="chart-container">
                        <canvas id="weightChart"></canvas>
                    </div>
                    
                    <div class="stats-row-small">
                        <div class="stat-box">
                            <div class="stat-box-label">7-Day Avg</div>
                            <div class="stat-box-val" id="wk-avg-val">-- lbs</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-box-label">30-Day Change</div>
                            <div class="stat-box-val" id="mo-change-val">-- lbs</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    mount(container) {
        // Fix the save button text
        container.querySelector('#save-weight-btn').textContent = "Save";

        container.querySelector('#save-weight-btn').addEventListener('click', () => {
            const val = parseFloat(container.querySelector('#weight-input-val').value);
            if (!isNaN(val)) {
                Store.updateActiveLog({ weight: val });
                this.updateChart();
                this.updateAverages();
                const btn = container.querySelector('#save-weight-btn');
                btn.textContent = "Saved";
                btn.classList.remove('btn-primary');
                setTimeout(() => {
                    btn.textContent = "Save";
                    btn.classList.add('btn-primary');
                }, 2000);
            }
        });
        
        container.querySelectorAll('.trend-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                container.querySelectorAll('.trend-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTrend = parseInt(e.target.dataset.days);
                this.updateChart();
            });
        });
        
        this.updateChart();
        this.updateAverages();
    },
    
    getChartData(days) {
        const data = Store.getUserData();
        const logs = data.dailyLogs;
        const today = Store.getActiveDate();
        const dates = [];
        const weights = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            dates.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            
            // If weight is null, fallback to previous weight in the window, or just pass null to Chart.js
            weights.push(logs[dateStr]?.weight || null);
        }
        
        return { dates, weights };
    },
    
    updateChart() {
        const ctx = document.getElementById('weightChart');
        if (!ctx) return;
        
        const { dates, weights } = this.getChartData(this.currentTrend);
        
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }
        
        this.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Weight (lbs)',
                    data: weights,
                    borderColor: '#2edba6',
                    backgroundColor: 'rgba(46, 219, 166, 0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: '#2edba6',
                    pointRadius: 3,
                    fill: true,
                    tension: 0.3,
                    spanGaps: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { ticks: { color: '#909296', maxTicksLimit: 7 }, grid: { display: false } },
                    y: { ticks: { color: '#909296' }, grid: { color: '#2a2b2f' } }
                }
            }
        });
    },
    
    updateAverages() {
        const data = Store.getUserData();
        const logs = data.dailyLogs;
        
        // 7 day avg
        let weekSum = 0; let weekCount = 0;
        const today = Store.getActiveDate();
        for(let i=0; i<7; i++){
            const d = new Date(today); d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            if (logs[dateStr] && logs[dateStr].weight) {
                weekSum += logs[dateStr].weight;
                weekCount++;
            }
        }
        
        if (weekCount > 0) {
            document.getElementById('wk-avg-val').textContent = (weekSum / weekCount).toFixed(1) + ' lbs';
        }
        
        // 30 day change
        const d30 = new Date(today); d30.setDate(today.getDate() - 30);
        let pastWeight = logs[d30.toISOString().split('T')[0]]?.weight;
        
        // If exact day 30 doesn't have it, look for nearest past weight
        if (!pastWeight) {
            for(let i=31; i<40; i++) {
                const pd = new Date(today); pd.setDate(today.getDate() - i);
                if (logs[pd.toISOString().split('T')[0]]?.weight) {
                    pastWeight = logs[pd.toISOString().split('T')[0]].weight;
                    break;
                }
            }
        }
        
        const currentWeight = document.getElementById('weight-input-val').value || (weekCount ? weekSum/weekCount : null);
        
        if (pastWeight && currentWeight) {
            const diff = (currentWeight - pastWeight).toFixed(1);
            const sign = diff > 0 ? '+' : '';
            const el = document.getElementById('mo-change-val');
            el.textContent = sign + diff + ' lbs';
            el.style.color = diff > 0 ? 'var(--text-secondary)' : 'var(--accent-color)'; // Green if lost weight
        }
    }
};
