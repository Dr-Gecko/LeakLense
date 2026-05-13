function update_profile_picture() {
    const element = document.getElementById("setting_pfp");
    const storage_pfp = localStorage.getItem("user_avatar");
    if (element) { if (storage_pfp) { element.style.backgroundImage = `url('${storage_pfp}')`; } else { element.style.backgroundImage = "url('/dist/img/default.png')"; } }
}

document.addEventListener("DOMContentLoaded", () => {
    update_profile_picture();
    // const button = document.getElementById('change_avatar');
    // button.addEventListener('click', (event) => {
    //     console.log('Button was pressed!');
    //     // Access the specific button element via event.target
    //     console.log('Button ID:', event.target.id);
    // });
});
