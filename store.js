// store.js
// Basic Data Models and LocalStorage Management

const DEFAULT_USERS = {
    keaton: {
        id: 'keaton',
        name: 'Keaton',
        goals: {
            calories: 1900,
            protein: 190,
            carbs: 160,
            fat: 50,
            steps: 10000
        },
        split: [
            { day: 1, name: "Push" }, // Mon
            { day: 2, name: "Pull" }, // Tue
            { day: 3, name: "Rest" }, // Wed
            { day: 4, name: "Legs" }, // Thu
            { day: 5, name: "Rest" }, // Fri
            { day: 6, name: "Upper Hypertrophy" }, // Sat
            { day: 0, name: "Rest" }  // Sun
        ]
    },
    emily: {
        id: 'emily',
        name: 'Emily',
        goals: {
            calories: 1700,
            protein: 130,
            carbs: 150,
            fat: 55,
            steps: 8000
        },
        split: [
            { day: 1, name: "Lower Strength" }, // Mon
            { day: 2, name: "Cardio" }, // Tue
            { day: 3, name: "Upper Strength" }, // Wed
            { day: 4, name: "Rest" }, // Thu
            { day: 5, name: "Full Body Circuit" }, // Fri
            { day: 6, name: "Rest" }, // Sat
            { day: 0, name: "Rest" }  // Sun
        ]
    }
};

const DEFAULT_WORKOUTS = {
    "Push": [
        { name: "Bench Press", sets: 3, reps: "8-10" },
        { name: "Incline DB Press", sets: 3, reps: "10-12" },
        { name: "Overhead Press", sets: 3, reps: "8-10" },
        { name: "Lateral Raises", sets: 4, reps: "15-20" },
        { name: "Tricep Extensions", sets: 3, reps: "12-15" }
    ],
    "Pull": [
        { name: "Pull-Ups", sets: 3, reps: "To Failure" },
        { name: "Barbell Rows", sets: 3, reps: "8-10" },
        { name: "Lat Pulldowns", sets: 3, reps: "10-12" },
        { name: "Face Pulls", sets: 3, reps: "15-20" },
        { name: "Bicep Curls", sets: 3, reps: "10-12" }
    ],
    "Legs": [
        { name: "Squats", sets: 4, reps: "6-8" },
        { name: "Romanian Deadlifts", sets: 3, reps: "8-10" },
        { name: "Leg Press", sets: 3, reps: "10-12" },
        { name: "Leg Curls", sets: 3, reps: "12-15" },
        { name: "Calf Raises", sets: 4, reps: "15-20" }
    ],
    "Upper Hypertrophy": [
        { name: "Spoto Press", sets: 3, reps: "10-12" },
        { name: "Pec Deck", sets: 3, reps: "15" },
        { name: "Cable Rows", sets: 3, reps: "12-15" },
        { name: "DB Shoulder Press", sets: 3, reps: "10-12" },
        { name: "Hammer Curls", sets: 3, reps: "12-15" }
    ],
    "Lower Strength": [
        { name: "Deadlifts", sets: 3, reps: "5" },
        { name: "Front Squats", sets: 3, reps: "6-8" },
        { name: "Bulgarian Split Squats", sets: 3, reps: "8-10" },
        { name: "Glute Bridges", sets: 3, reps: "10-12" },
        { name: "Planks", sets: 3, reps: "60s" }
    ],
    "Cardio": [
        { name: "Treadmill Intervals", sets: 1, reps: "30 mins" },
        { name: "Rowing Machine", sets: 1, reps: "15 mins" }
    ],
    "Upper Strength": [
        { name: "Strict Press", sets: 4, reps: "5" },
        { name: "Weighted Pull-Ups", sets: 4, reps: "5" },
        { name: "DB Bench Press", sets: 3, reps: "8-10" },
        { name: "Chest Supported Rows", sets: 3, reps: "8-10" }
    ],
    "Full Body Circuit": [
        { name: "Kettlebell Swings", sets: 4, reps: "15" },
        { name: "Box Jumps", sets: 4, reps: "10" },
        { name: "Push-Ups", sets: 4, reps: "15" },
        { name: "Goblet Squats", sets: 4, reps: "15" }
    ]
};

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyBRlL7bKsuY3dm_QEyW75eMAUALymFYwFI",
  authDomain: "fitcoach-fitness.firebaseapp.com",
  projectId: "fitcoach-fitness",
  storageBucket: "fitcoach-fitness.firebasestorage.app",
  messagingSenderId: "950886789848",
  appId: "1:950886789848:web:8896952763340daef3ddad",
  measurementId: "G-H5H7YKWLBZ"
};

let db = null;
try {
    if (window.firebase) {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        db.enablePersistence({ synchronizeTabs: true })
            .catch(function(err) {
                console.error("Firebase persistence error:", err.code);
            });
    }
} catch (e) {
    console.error("Firebase init bypass:", e);
}

class AppStore {
    constructor() {
        this.usersConfig = this.loadData('usersConfig') || DEFAULT_USERS;
        this.workoutsConfig = this.loadData('workoutsConfig') || DEFAULT_WORKOUTS;
        
        this.currentUser = this.loadData('currentUser') || 'keaton';
        this.userData = this.loadData('appData') || {
            keaton: this.getInitialUserData(),
            emily: this.getInitialUserData()
        };
        
        const storedDateStr = this.loadData('activeDateStr');
        if (storedDateStr) {
            const parts = storedDateStr.split('-');
            this.activeDate = new Date(parts[0], parts[1]-1, parts[2]);
        } else {
            this.activeDate = new Date();
        }
        
        this.listeners = [];
    }
    
    getInitialUserData() {
        return {
            dailyLogs: {},    // { "YYYY-MM-DD": { calories, protein, carbs, fat, steps, workoutCompleted, weight } }
            checkins: [],     // [ { date, answers... } ]
            workoutHistory: {}// { "Exercise Name": [ { date, weight, reps, sets } ] }
        };
    }

    loadData(key) {
        try {
            const data = localStorage.getItem(`fitcoach_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error("Local storage error:", e);
            return null;
        }
    }
    
    initCloudSync() {
        if (!db || !window.firebase || !firebase.auth().currentUser) return;
        // Listen to remote changes
        db.collection('fitcoach').doc('globalStore').onSnapshot(doc => {
            if (doc.exists) {
                const cloudData = doc.data();
                this.userData = cloudData.userData || this.userData;
                this.usersConfig = cloudData.usersConfig || this.usersConfig;
                this.workoutsConfig = cloudData.workoutsConfig || this.workoutsConfig;
                
                // Mirror back to local cache instantly
                localStorage.setItem('fitcoach_appData', JSON.stringify(this.userData));
                localStorage.setItem('fitcoach_usersConfig', JSON.stringify(this.usersConfig));
                localStorage.setItem('fitcoach_workoutsConfig', JSON.stringify(this.workoutsConfig));
                
                this.notify();
            } else {
                // If cloud is totally empty, seed it with our local data
                this.syncToCloud();
            }
        }, err => {
            console.error("Firestore real-time sync error:", err);
            alert("Database Read Blocked! Cannot load cloud data. Check Firebase Security Rules.\\n\\nError: " + err.message);
        });
    }
    
    syncToCloud() {
        if (!db || !window.firebase || !firebase.auth().currentUser) return;
        db.collection('fitcoach').doc('globalStore').set({
            userData: JSON.parse(JSON.stringify(this.userData)),
            usersConfig: JSON.parse(JSON.stringify(this.usersConfig)),
            workoutsConfig: JSON.parse(JSON.stringify(this.workoutsConfig))
        }, { merge: true }).catch(err => {
            console.error("Cloud Error:", err);
            alert("Database Write Blocked! Your data is not saving to the cloud. Check Firebase Security Rules.\\n\\nError: " + err.message);
        });
    }

    saveData() {
        localStorage.setItem('fitcoach_currentUser', JSON.stringify(this.currentUser));
        localStorage.setItem('fitcoach_appData', JSON.stringify(this.userData));
        localStorage.setItem('fitcoach_usersConfig', JSON.stringify(this.usersConfig));
        localStorage.setItem('fitcoach_workoutsConfig', JSON.stringify(this.workoutsConfig));
        this.notify();
        this.syncToCloud();
    }

    switchUser(userId) {
        if (this.usersConfig[userId]) {
            this.currentUser = userId;
            this.saveData();
        }
    }

    getUserConfig(userId = null) {
        return this.usersConfig[userId || this.currentUser];
    }
    
    getWorkoutsConfig() {
        return this.workoutsConfig;
    }
    
    updateUserConfig(userId, newConfig) {
        if (this.usersConfig[userId]) {
            this.usersConfig[userId] = { ...this.usersConfig[userId], ...newConfig };
            this.saveData();
        }
    }
    
    updateWorkoutsConfig(presetName, newExercises) {
        this.workoutsConfig[presetName] = newExercises;
        this.saveData();
    }

    getUserData() {
        return this.userData[this.currentUser];
    }
    
    getActiveDate() {
        return this.activeDate;
    }
    
    changeActiveDateBy(days) {
        this.activeDate.setDate(this.activeDate.getDate() + days);
        localStorage.setItem('fitcoach_activeDateStr', JSON.stringify(this.getActiveDateStr()));
        this.notify();
    }

    getActiveDateStr() {
        const offset = this.activeDate.getTimezoneOffset() * 60000;
        return (new Date(this.activeDate.getTime() - offset)).toISOString().split('T')[0];
    }
    
    getActiveLog() {
        const dateStr = this.getActiveDateStr();
        const data = this.getUserData();
        if (!data.dailyLogs[dateStr]) {
            data.dailyLogs[dateStr] = {
                calories: 0, protein: 0, carbs: 0, fat: 0,
                steps: 0, workoutCompleted: false, weight: null
            };
            // Save state silently without triggering re-render
            localStorage.setItem('fitcoach_appData', JSON.stringify(this.userData));
            this.syncToCloud();
        }
        return data.dailyLogs[dateStr];
    }

    updateActiveLog(updates) {
        const dateStr = this.getActiveDateStr();
        const data = this.getUserData();
        data.dailyLogs[dateStr] = { ...this.getActiveLog(), ...updates };
        this.saveData();
    }
    
    subscribe(callback) {
        this.listeners.push(callback);
    }
    
    notify() {
        this.listeners.forEach(cb => cb());
    }
}

const Store = new AppStore();
