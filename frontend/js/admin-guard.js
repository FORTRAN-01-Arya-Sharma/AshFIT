// This script protects admin pages from non-admin users.
function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

const token = localStorage.getItem('authToken');
if (!token) {
    window.location.href = 'login.html'; // Not logged in
} else {
    const userData = parseJwt(token);
    if (userData.user.role !== 'admin') {
        alert('Access Denied. You are not an admin.');
        window.location.href = 'index.html'; // Not an admin
    }
}