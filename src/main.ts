import "./styles/profilePage.css";
import { renderProfilePage } from "./pages/ProfilePage";

document.addEventListener("DOMContentLoaded", () => {
  const appRoot = document.getElementById("profile-page");
    if (appRoot) {
        renderProfilePage(appRoot);
    } else {
        console.error("App root element not found");
    }
});