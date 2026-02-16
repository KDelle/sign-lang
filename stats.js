const DB_NAME = 'GesturixDB';
const DB_VERSION = 1;
const STORE_NAME = 'userStats';

let db = null;

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('IndexedDB error:', request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            db = request.result;
            console.log('IndexedDB initialized successfully');
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            db = event.target.result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'userId' });

                objectStore.createIndex('userName', 'userName', { unique: false });
                objectStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
                console.log('Object store created');
            }
        };
    });
}

function saveStatsToIndexedDB(userId, userName, stats) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }

        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);

        const userData = {
            userId: userId,
            userName: userName,
            stats: stats,
            lastUpdated: new Date().toISOString()
        };

        const request = objectStore.put(userData);

        request.onsuccess = () => {
            console.log('Stats saved to IndexedDB for user:', userName);
            resolve(userData);
        };

        request.onerror = () => {
            console.error('Error saving stats:', request.error);
            reject(request.error);
        };
    });
}

function loadStatsFromIndexedDB(userId) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }

        const transaction = db.transaction([STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(STORE_NAME);

        const request = objectStore.get(userId);

        request.onsuccess = () => {
            if (request.result) {
                console.log('Stats loaded from IndexedDB for userId:', userId);
                resolve(request.result.stats);
            } else {
                console.log('No stats found for userId:', userId);
                resolve(null);
            }
        };

        request.onerror = () => {
            console.error('Error loading stats:', request.error);
            reject(request.error);
        };
    });
}

function deleteStatsFromIndexedDB(userId) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }

        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);

        const request = objectStore.delete(userId);

        request.onsuccess = () => {
            console.log('Stats deleted from IndexedDB for userId:', userId);
            resolve();
        };

        request.onerror = () => {
            console.error('Error deleting stats:', request.error);
            reject(request.error);
        };
    });
}

function getAllStatsFromIndexedDB() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }

        const transaction = db.transaction([STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(STORE_NAME);

        const request = objectStore.getAll();

        request.onsuccess = () => {
            console.log('All stats loaded from IndexedDB');
            resolve(request.result);
        };

        request.onerror = () => {
            console.error('Error loading all stats:', request.error);
            reject(request.error);
        };
    });
}

function generateUserId(userData) {

    if (userData.userId) {
        return userData.userId;
    }

    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    return `user_${userData.name.toLowerCase().replace(/\s+/g, '_')}_${timestamp}_${randomSuffix}`;
}

function getDefaultStats() {
    return {
        asl: {
            learned: { 
                alphabet: [], 
                numbers: [], 
                greetings: [], 
                common: [] 
            },
            totalScore: 0,
            quizzesTaken: 0,
            achievements: [],
            rhythmGameStats: {
                totalGamesPlayed: 0,
                highScore: 0,
                totalScore: 0
            }
        },
        fsl: {
            learned: { 
                alphabet: [], 
                numbers: [], 
                greetings: [], 
                common: [] 
            },
            totalScore: 0,
            quizzesTaken: 0,
            achievements: [],
            rhythmGameStats: {
                totalGamesPlayed: 0,
                highScore: 0,
                totalScore: 0
            }
        },
        selectedLanguage: 'asl',
        lastLogin: new Date().toISOString()
    };
}

function mergeStats(existingStats, newStats) {
    if (!existingStats) return newStats;

    const merged = JSON.parse(JSON.stringify(existingStats));

    if (newStats.asl) {
        merged.asl = merged.asl || getDefaultStats().asl;
        merged.asl.learned = newStats.asl.learned || merged.asl.learned;
        merged.asl.totalScore = Math.max(merged.asl.totalScore || 0, newStats.asl.totalScore || 0);
        merged.asl.quizzesTaken = Math.max(merged.asl.quizzesTaken || 0, newStats.asl.quizzesTaken || 0);
        merged.asl.achievements = [...new Set([...(merged.asl.achievements || []), ...(newStats.asl.achievements || [])])];
        merged.asl.rhythmGameStats = newStats.asl.rhythmGameStats || merged.asl.rhythmGameStats;
    }

    if (newStats.fsl) {
        merged.fsl = merged.fsl || getDefaultStats().fsl;
        merged.fsl.learned = newStats.fsl.learned || merged.fsl.learned;
        merged.fsl.totalScore = Math.max(merged.fsl.totalScore || 0, newStats.fsl.totalScore || 0);
        merged.fsl.quizzesTaken = Math.max(merged.fsl.quizzesTaken || 0, newStats.fsl.quizzesTaken || 0);
        merged.fsl.achievements = [...new Set([...(merged.fsl.achievements || []), ...(newStats.fsl.achievements || [])])];
        merged.fsl.rhythmGameStats = newStats.fsl.rhythmGameStats || merged.fsl.rhythmGameStats;
    }

    merged.selectedLanguage = newStats.selectedLanguage || merged.selectedLanguage;
    merged.lastLogin = new Date().toISOString();

    return merged;
}

async function saveUserStatsDB() {
    try {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) return;

        const userData = JSON.parse(currentUser);

        const userId = generateUserId(userData);

        if (!userData.userId) {
            userData.userId = userId;
            localStorage.setItem('currentUser', JSON.stringify(userData));
        }

        const progressStr = localStorage.getItem('signLanguageProgress');
        const progress = progressStr ? JSON.parse(progressStr) : getDefaultStats();

        const selectedLanguage = localStorage.getItem('selectedLanguage') || 'asl';

        const stats = {
            ...progress,
            selectedLanguage: selectedLanguage,
            lastLogin: new Date().toISOString()
        };

        await saveStatsToIndexedDB(userId, userData.name, stats);

    } catch (error) {
        console.error('Error saving user stats to IndexedDB:', error);
    }
}

async function loadUserStatsDB() {
    try {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) return;

        const userData = JSON.parse(currentUser);

        const userId = generateUserId(userData);

        if (!userData.userId) {
            userData.userId = userId;
            localStorage.setItem('currentUser', JSON.stringify(userData));
        }

        const stats = await loadStatsFromIndexedDB(userId);

        if (stats) {

            localStorage.setItem('signLanguageProgress', JSON.stringify(stats));

            if (stats.selectedLanguage) {
                localStorage.setItem('selectedLanguage', stats.selectedLanguage);
            }

            console.log('User stats loaded successfully');
            return stats;
        } else {

            const defaultStats = getDefaultStats();
            localStorage.setItem('signLanguageProgress', JSON.stringify(defaultStats));

            await saveStatsToIndexedDB(userId, userData.name, defaultStats);

            return defaultStats;
        }

    } catch (error) {
        console.error('Error loading user stats from IndexedDB:', error);
        return getDefaultStats();
    }
}

async function resetUserStatsDB() {
    try {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) return;

        const userData = JSON.parse(currentUser);
        const userId = userData.userId || generateUserId(userData);

        await deleteStatsFromIndexedDB(userId);

        localStorage.removeItem('signLanguageProgress');
        localStorage.removeItem('selectedLanguage');

        await loadUserStatsDB();

        console.log('User stats reset successfully');

    } catch (error) {
        console.error('Error resetting user stats:', error);
    }
}

let autoSaveInterval = null;

function startAutoSave(intervalMs = 30000) {

    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
    }

    autoSaveInterval = setInterval(() => {
        saveUserStatsDB();
    }, intervalMs);

    console.log('Auto-save started');
}

function stopAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
        console.log('Auto-save stopped');
    }
}

async function updateRhythmGameStatsDB(score, maxCombo) {
    try {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) return;

        const progressStr = localStorage.getItem('signLanguageProgress');
        const progress = progressStr ? JSON.parse(progressStr) : getDefaultStats();

        const selectedLanguage = localStorage.getItem('selectedLanguage') || 'asl';
        const langProgress = progress[selectedLanguage];

        if (!langProgress.rhythmGameStats) {
            langProgress.rhythmGameStats = {
                totalGamesPlayed: 0,
                highScore: 0,
                totalScore: 0
            };
        }

        langProgress.rhythmGameStats.totalGamesPlayed += 1;
        langProgress.rhythmGameStats.highScore = Math.max(langProgress.rhythmGameStats.highScore || 0, score);
        langProgress.rhythmGameStats.totalScore += score;

        localStorage.setItem('signLanguageProgress', JSON.stringify(progress));

        await saveUserStatsDB();

        console.log('Rhythm game stats updated successfully');

    } catch (error) {
        console.error('Error updating rhythm game stats:', error);
    }
}

window.StatsDB = {
    init: initDB,
    save: saveUserStatsDB,
    load: loadUserStatsDB,
    reset: resetUserStatsDB,
    updateRhythmStats: updateRhythmGameStatsDB,
    startAutoSave: startAutoSave,
    stopAutoSave: stopAutoSave,
    getAll: getAllStatsFromIndexedDB
};

