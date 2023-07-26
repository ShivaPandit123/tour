function isOTPValid(userInput) {
  // Check if the input is a number
  if (!/^\d+$/.test(userInput)) {
    return false;
  }

  // Check if the length is exactly 6 digits
  if (userInput.length !== 6) {
    return false;
  }

  return true;
}
const otp = document.getElementById("otp");
const verify = async () => {
  let code = otp.value;
  if (!isOTPValid(code)) {
    return alert("Please enter a valid otp");
  }
  const response = await fetch("/api/email/validate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
    }),
  });
  const data = await response.json();
  alert(data.message);
  if (data.result) {
    window.location.replace("/");
  }
};

document.getElementById("submit_otp").addEventListener("click", verify);

const resend = async () => {
  const response = await fetch("/api/resend/email/verification", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  alert(data.message);
  document.getElementById(
    "alert"
  ).innerHTML = `<div class="alert alert-success" style="text-align: center;"  >
  ${data.message}
</div>`;
  let sec = 59;
  let cont = document.getElementById("rsnd_cont");
  let timer = setInterval(() => {
    if (sec === 0) {
      clearInterval(timer);
      cont.innerHTML = `<p><a href="#" id="resend_otp">Resend OTP ?</a></p>`;
    } else {
      cont.innerHTML = `<p><a href="#">Resend OTP in ${sec} sec ?</a></p>`;
      sec -= 1;
    }
    if (sec === 50) {
      document.getElementById("alert").innerHTML = "";
    }
  }, 1000);
};
let sec = 59;
let cont = document.getElementById("rsnd_cont");
let timer = setInterval(() => {
  if (sec === 0) {
    clearInterval(timer);
    cont.innerHTML = `<p><a href="#" id="resend_otp">Resend OTP ?</a></p>`;
    document.getElementById("resend_otp").addEventListener("click", resend);
  } else {
    cont.innerHTML = `<p><a href="#">Resend OTP in ${sec} sec ?</a></p>`;
    sec -= 1;
  }
  if (sec === 50) {
    document.getElementById("alert").innerHTML = "";
  }
}, 1000);
