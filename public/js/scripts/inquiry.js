const data = JSON.parse(sessionStorage.getItem("data"));
document.getElementById("arriving").innerText = data.date;
let addon = data.addon.split(",");
let html = `<ul class="cart-item-card">
<li class="cart-item-card__item">
  <div class="cart-item-card__iconcontainer">
    <span>
      <i class="rlr-icon-font flaticon-carbon-user"></i>
    </span>
  </div>
  <div class="cart-item-card__item-title">
    <p>
      <b> ${data.member > 1 ? "Members" : "Member"} </b>
    </p>
  </div>
  <p class="cart-item-card__item-number">
    <span class="times"> x </span>
  </p>
  <p class="cart-item-card__item-price">${data.member}</p>
</li>
${
  addon.some((itm) => itm)
    ? `<li class="cart-item-card__footer">
      <p>Addon</p>
    </li>`
    : ""
}
${addon.map((itm) => {
  return itm
    ? `<li class="cart-item-card__item">
  <div class="cart-item-card__iconcontainer">
    <span>
      <i class="rlr-icon-font flaticon-carbon-user"></i>
    </span>
  </div>
  <div class="cart-item-card__item-title">
    <p>
      <b> ${itm} </b>
    </p>
  </div>
  </li>`
    : "";
})}
</ul>`;

var form = document.getElementById("inqu_form");
function handleForm(event) {
  event.preventDefault();
}

form.addEventListener("submit", handleForm);

function isValidGSTNumber(gstNumber) {
  const gstRegex =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;

  return gstRegex.test(gstNumber);
}
function isValidDateRange(dateRange) {
  const dateRangeRegex = /^\d{4}-\d{2}-\d{2}\s+to\s+\d{4}-\d{2}-\d{2}$/;
  if (!dateRangeRegex.test(dateRange)) {
    return false; // Format doesn't match "YYYY-MM-DD to YYYY-MM-DD"
  }

  const [startDateStr, endDateStr] = dateRange.split(" to ");
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (isNaN(startDate) || isNaN(endDate)) {
    return false; // Invalid date format
  }

  if (startDate >= endDate) {
    return false; // Start date should be before end date
  }

  return true;
}
function isValidMemberInput(memberCount, memberConfig) {
  // Validate memberCount is a positive integer
  const countRegex = /^\d+$/;
  if (!countRegex.test(memberCount)) {
    return false;
  }

  // Parse memberCount to an integer
  const parsedCount = parseInt(memberCount, 10);

  // Validate memberCount is greater than zero and less than equal to 56
  if (parsedCount <= 0 || parsedCount > 56) {
    return false;
  }

  // Validate memberConfig format
  const configRegex = /^(\d+\s[A-Za-z]+\s*,\s*)*\d+\s[A-Za-z]+$/;
  if (!configRegex.test(memberConfig)) {
    return false;
  }

  // Validate memberConfig matches the memberCount
  const members = memberConfig
    .split(",")
    .map((member) => member.trim().split(" "));
  const totalMembers = members.reduce(
    (total, [count]) => total + parseInt(count, 10),
    0
  );

  return parsedCount === totalMembers;
}
function isString(input) {
  return typeof input === "string";
}
function getPackageNameFromURL() {
  const currentURL = window.location.href;
  const urlParts = currentURL.split("/");
  const packageNameWithDash = urlParts[urlParts.length - 2];
  const packageName = packageNameWithDash.split("-").join(" ");
  return packageName;
}
document.getElementById("append_dta").innerHTML =
  document.getElementById("append_dta").innerHTML + html;
const inquiry = async () => {
  const {
    name,
    phone,
    email,
    gst,
    note,
    addon,
    date,
    member,
    tour,
    traveller,
  } = {
    name: document.getElementById("billing_first_name").value,
    phone: document.getElementById("billing_phone").value,
    email: document.getElementById("billing_email").value,
    gst: document.getElementById("billing_gst").value,
    note: document.getElementById("order_comments").value,
    ...data,
  };
  const urlPackageName = getPackageNameFromURL();
  if (!validator.isEmail(email)) {
    return alert("Please enter a valid email");
  } else if (!validator.isMobilePhone(phone, "en-IN")) {
    return alert("please enter a valid phone number");
  } else if (name.length > 100) {
    return alert("name can't be greater then 100 character");
  } else if (gst) {
    if (!isValidGSTNumber(gst)) {
      return alert("please enter a valid gst number");
    }
  } else if (!isValidDateRange(date)) {
    return alert("invalid date range selected");
  } else if (!isValidMemberInput(member, traveller)) {
    return alert("invalid member input");
  } else if (tour.toLowerCase() !== urlPackageName.toLowerCase()) {
    return alert("Package name in the URL does not match.");
  } else if (note) {
    if (!isString(note)) {
      return alert("invalid note");
    }
  } else if (addon) {
    if (!isString(addon)) {
      return alert("Invalid addon");
    }
  }
  const currentURL = window.location.href;
  const urlParts = currentURL.split("/");
  const packageNameWithDash = urlParts[urlParts.length - 2];
  const response = await fetch(`/api/tours/${packageNameWithDash}/inquiry`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      phone,
      email,
      gst,
      note,
      addon,
      date,
      member,
      tour,
      traveller,
    }),
  });
  const dat = await response.json();
  alert(dat.message);
  if (dat.result) {
    window.location.replace("/");
  }
};
document.getElementById("place_order").addEventListener("click", inquiry);
