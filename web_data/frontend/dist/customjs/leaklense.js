const DEBUG=true

function loadUserData() {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value || "null";
    };
    const setAvatar = (id, url) => {
        const el = document.getElementById(id);
        if (el) el.style.backgroundImage = `url('${url || "/dist/img/default.png"}')`;
    };
    setAvatar("avatar", userData.avatar);
    setText("username", userData.username);
    setText("user_role", userData.user_role);
}


document.addEventListener("DOMContentLoaded", () => {
    if (!DEBUG){
        if(!localStorage.getItem("logged_in")){
            window.location.href = "/sign-in";
        }
    }
    loadUserData();
});
