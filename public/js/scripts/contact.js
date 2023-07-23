var form = document.getElementById("myform");
function handleForm(event) {
  event.preventDefault();
}

form.addEventListener("submit", handleForm);

const consubmit = document.getElementById("consubmit");
const contactfn = async () => {
  consubmit.removeEventListener("click", contactfn);
  const { name, email, phone, message } = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    message: document.getElementById("message").value,
  };
  if (!validator.isEmail(email)) {
    consubmit.addEventListener("click", contactfn);
    return alert("Please enter a valid email");
  } else if (!validator.isMobilePhone(phone, "en-IN")) {
    consubmit.addEventListener("click", contactfn);
    return alert("please enter a valid phone number");
  } else if (name.length > 100) {
    consubmit.addEventListener("click", contactfn);
    return alert("name can't be greater then 100 character");
  } else if (message.length > 1000) {
    consubmit.addEventListener("click", contactfn);
    return alert("name can't be greater then 100 character");
  }
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      name,
      phone,
      message,
      typ: "cnt",
    }),
  });
  const data = await response.json();
  alert(data.message);
  if (response.status == 200 || data.result) {
    window.location.replace("/");
  }
  consubmit.addEventListener("click", contactfn);
};
if (consubmit) {
  consubmit.addEventListener("click", contactfn);
}

const consubmit1 = document.getElementById("consubmit1");
const contactfn1 = async () => {
  consubmit1.removeEventListener("click", contactfn1);
  const { name, email, phone, message } = {
    email: document.getElementById("email2").value,
  };
  if (!validator.isEmail(email)) {
    consubmit1.addEventListener("click", contactfn1);
    return alert("Please enter a valid email");
  }
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      typ: "lts",
    }),
  });
  const data = await response.json();
  alert(data.message);
  consubmit1.addEventListener("click", contactfn1);
};
consubmit1.addEventListener("click", contactfn1);
