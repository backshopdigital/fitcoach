// login.js

window.LoginView = {
    render() {
        return `
            <div class="view-section active" style="display:flex; flex-direction:column; justify-content:center; min-height:80vh; padding: 20px;">
                <div style="text-align:center; margin-bottom: 40px;">
                    <h1 class="logo" style="font-size: 3rem;">Fit<span class="accent">Coach</span></h1>
                    <p style="color: var(--text-secondary); margin-top: 8px;">Sign in to securely access your data.</p>
                </div>
                
                <div class="card" style="max-width: 400px; margin: 0 auto; width: 100%;">
                    <div id="login-error" style="color: var(--error-color); margin-bottom: 16px; font-size: 0.9rem; text-align:center;"></div>
                    
                    <div style="margin-bottom: 16px;">
                        <label class="form-label">Email</label>
                        <input type="email" id="login-email" class="input-field" placeholder="keaton@example.com">
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <label class="form-label">Password</label>
                        <input type="password" id="login-password" class="input-field" placeholder="••••••••">
                    </div>
                    
                    <button id="login-btn" class="btn btn-primary" style="width: 100%; padding: 14px; font-size: 1.1rem;">Sign In</button>
                    <p style="text-align: center; font-size: 0.8rem; color: var(--text-secondary); margin-top: 16px;">Registration is restricted to the master account via the Firebase Console.</p>
                </div>
            </div>
        `;
    },
    
    mount(container) {
        document.getElementById('app-header').style.display = 'none';
        document.getElementById('bottom-nav').style.display = 'none';

        const errEl = container.querySelector('#login-error');
        container.querySelector('#login-btn').addEventListener('click', (e) => {
            const email = container.querySelector('#login-email').value;
            const pass = container.querySelector('#login-password').value;
            
            if (!email || !pass) {
                errEl.textContent = "Please enter both email and password.";
                return;
            }
            
            e.target.textContent = "Authenticating...";
            e.target.disabled = true;
            
            if (window.firebase) {
                firebase.auth().signInWithEmailAndPassword(email, pass)
                    .catch(err => {
                        errEl.textContent = err.message;
                        e.target.textContent = "Sign In";
                        e.target.disabled = false;
                    });
            } else {
                errEl.textContent = "Firebase is not initialized.";
                e.target.textContent = "Sign In";
                e.target.disabled = false;
            }
        });
    }
};
