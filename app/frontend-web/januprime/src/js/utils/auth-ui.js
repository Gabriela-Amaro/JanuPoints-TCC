import { authService } from "../services/auth.js";

export function updateUIBasedOnAuth() {
  const navbar = document.getElementById("mainNavbar");

  if (authService.isAuthenticated) {
    navbar?.style.setProperty("display", "block");
    const userData = authService.getUserData();
    if (userData?.nome) {
      document.title = `JanuPoints | ${userData.nome}`;
    }
  } else {
    navbar?.style.setProperty("display", "none");
  }
}

export function onLoginSuccess() {
  updateUIBasedOnAuth();
}

export function onLogoutSuccess() {
  updateUIBasedOnAuth();
}

window.updateUIBasedOnAuth = updateUIBasedOnAuth;
window.onLoginSuccess = onLoginSuccess;
window.onLogoutSuccess = onLogoutSuccess;
