const bt = document.getElementById("submit");
const signup = async () => {
  bt.removeEventListener("click", signup);
  const { email, password, cpassword, phone, name } = {
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    name: document.getElementById("name").value,
    password: document.getElementById("password").value,
    cpassword: document.getElementById("cpassword").value,
  };
  if (!validator.isEmail(email)) {
    bt.addEventListener("click", signup);
    return alert("Please enter a valid email");
  } else if (password !== cpassword) {
    bt.addEventListener("click", signup);
    return alert("Both password must be identical");
  } else if (!validator.isStrongPassword(password)) {
    bt.addEventListener("click", signup);
    return alert("Please enter a strong password");
  } else if (!validator.isMobilePhone(phone, "en-IN")) {
    bt.addEventListener("click", signup);
    return alert("please enter a valid phone number");
  } else if (name.length > 100) {
    bt.addEventListener("click", signup);
    return alert("name can't be greater then 100 character");
  }
  const response = await fetch("/api/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      cpassword,
      name,
      phone,
    }),
  });
  const data = await response.json();
  alert(data.message);
  if (data.result) {
    window.location.replace("/login");
  }
  bt.addEventListener("click", signup);
};
bt.addEventListener("click", signup);
document.getElementById("ggl_sgp").addEventListener("click", () => {
  window.location.replace("/oauth/google");
});
