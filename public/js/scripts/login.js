const bt = document.getElementById("submit");
const login = async () => {
  bt.removeEventListener("click", login);
  const { email, password } = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
  };
  if (!validator.isEmail(email)) {
    bt.addEventListener("click", login);
    return alert("Please enter a valid email");
  } else if (!validator.isStrongPassword(password)) {
    bt.addEventListener("click", login);
    return alert("Please enter a strong password");
  }
  const response = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
  const data = await response.json();
  alert(data.message);
  if (data.result) {
    window.location.replace("/");
  }
  bt.addEventListener("click", login);
};
bt.addEventListener("click", login);
document.getElementById("ggl_lng").addEventListener("click", () => {
  window.location.replace("/oauth/google");
});
