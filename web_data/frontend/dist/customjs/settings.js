async function update_profile_picture() {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const path = userData.user_avatar_path;
    const bg = path ? `url('${path}')` : "url('/dist/img/default.png')";
    for (const id of ["setting_pfp", "avatar"]) {
        const el = document.getElementById(id);
        if (el) el.style.backgroundImage = bg;
    }
}

function throw_alert(reason,type){Swal.fire({position: "top-end",title: reason,showConfirmButton: false,background: "#182433",color: "#eeeeee",icon: type,timer: 1000})}


async function updateUserAvatar() {
    const button = document.getElementById("submitAvatar");
    const fileInput = document.getElementById("avatarFile");
    button.addEventListener("click", async (event) => {
        if (!fileInput.files.length) {
            throw_alert("Please make file selection","error")
            return;
        }
        const formData = new FormData();
        formData.append("file", fileInput.files[0]);
        try {
            const response = await fetch("/api/utils/avatar", {
                method: "POST",
                body: formData,
                headers: {
                    "API-KEY": Cookies.get("auth")
                }
            });
            const data = await response.json();
            if (response.ok) {
                const userData = JSON.parse(localStorage.getItem("user") || "{}");
                userData.user_avatar_path = data.data.avatar_path;
                localStorage.setItem("user", JSON.stringify(userData));
                await update_profile_picture();
                throw_alert("New avatar successfully uploaded","success")
            } else if (response.status = 400) {
                throw_alert("Invalid API Key","error")
                window.location.href = "/sign-in"
            } else {
                throw_alert("Upload Error","error")
            }
        } catch (error) {
            throw_alert("Upload Error","error")
        }
    });
}
document.addEventListener("DOMContentLoaded", () => {
    updateUserAvatar();
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUsername = userData.username;
    const usernameInput = document.getElementById("username_input");
    if (usernameInput && currentUsername) {
        usernameInput.placeholder = currentUsername;
    }
});