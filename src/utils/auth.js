export const logout = (message = null) => {
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("userRole");
  localStorage.removeItem("tokenExpiry");

  const redirectUrl = message
    ? `/login?expired=true`
    : "/login";

  window.location.assign(redirectUrl);
};

export const isLoggedIn = () => {
  return !!localStorage.getItem("jwtToken");
};

export const checkTokenAndRedirect = () => {
  const token = localStorage.getItem("jwtToken");
  const expiry = localStorage.getItem("tokenExpiry");

  if (!token || !expiry || Date.now() > parseInt(expiry)) {
    logout("Your session has expired. Please log in again.");
  }
};
