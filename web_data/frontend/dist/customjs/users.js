const users = [
  {
    name: "Paweł Kuna",
    title: "UI Designer",
    role: "Owner",
    badge: "bg-purple-lt",
    avatar: "./static/avatars/000m.jpg",
    email: "#",
    phone: "#"
  },
  {
    name: "Jeffie Lewzey",
    title: "Chemical Engineer",
    role: "Admin",
    badge: "bg-green-lt",
    initials: "JL",
    email: "#",
    phone: "#"
  },
  {
    name: "Mallory Hulme",
    title: "Geologist IV",
    role: "Admin",
    badge: "bg-green-lt",
    avatar: "./static/avatars/002m.jpg",
    email: "#",
    phone: "#"
  },
  {
    name: "Mallory Hulme",
    title: "Geologist IV",
    role: "Admin",
    badge: "bg-green-lt",
    avatar: "./static/avatars/002m.jpg",
    email: "#",
    phone: "#"
  },
  {
    name: "Mallory Hulme",
    title: "Geologist IV",
    role: "Admin",
    badge: "bg-green-lt",
    avatar: "./static/avatars/002m.jpg",
    email: "#",
    phone: "#"
  },
  {
    name: "Mallory Hulme",
    title: "Geologist IV",
    role: "Admin",
    badge: "bg-green-lt",
    avatar: "./static/avatars/002m.jpg",
    email: "#",
    phone: "#"
  },
  {
    name: "Mallory Hulme",
    title: "Geologist IV",
    role: "User",
    badge: "bg-grey-lt",
    avatar: "./static/avatars/002m.jpg",
    email: "#",
    phone: "#"
  }
];

function getInitials(name) {
  return name
    .split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase();
}

function createUserCard(user) {
  const avatar = user.avatar
    ? `<span class="avatar avatar-xl mb-3 rounded" style="background-image: url('${user.avatar}')"></span>`
    : `<span class="avatar avatar-xl mb-3 rounded">${user.initials || getInitials(user.name)}</span>`;

  const badge = user.role
    ? `<span class="badge ${user.badge || "bg-secondary-lt"}">${user.role}</span>`
    : "";

  return `
    <div class="col-md-6 col-lg-3">
      <div class="card">
        <div class="card-body p-4 text-center">
          ${avatar}
          <h3 class="m-0 mb-1"><a href="#">${user.name}</a></h3>
          <div class="text-secondary">${user.title || ""}</div>
          <div class="mt-3">${badge}</div>
        </div>

        <div class="d-flex">
          <a href="mailto:${user.email || "#"}" class="card-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="icon me-2 text-muted icon-3">
              <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" />
              <path d="M3 7l9 6l9 -6" />
            </svg>
            Email
          </a>

          <a href="tel:${user.phone || "#"}" class="card-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="icon me-2 text-muted icon-3">
              <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
            </svg>
            Call
          </a>
        </div>
      </div>
    </div>
  `;
}

function loadUsers() {
  const usersContainer = document.getElementById("users");
  if (!usersContainer) return;

  usersContainer.innerHTML = users.map(createUserCard).join("");
}

document.addEventListener("DOMContentLoaded", loadUsers);