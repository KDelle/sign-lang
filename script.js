/* ===================================
   UPDATED displayUserInfo FUNCTION
   Replace the existing displayUserInfo function in your script.js
   =================================== */

// Display user info in header with logout button
function displayUserInfo(userData) {
    const userInfoDiv = document.getElementById('userInfo');
    userInfoDiv.innerHTML = `
        <div class="user-info-text">
            <p><strong>Welcome, ${userData.name}!</strong></p>
            <p>${userData.course} - ${userData.year}</p>
        </div>
        <button class="logout-btn" onclick="logout()">🚪 Logout</button>
    `;
}
