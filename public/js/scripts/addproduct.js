const photo = document.getElementById("rlr_input_splide_photouploader");
const getdata = () => {
  const data = {
    title: document.getElementById("rlr-product-form-product-title").value,
    description: document.getElementById("rlr-product-form-product-overview")
      .value,
    meta: {
      heading: document.getElementById("rlr-product-form-product-heading")
        .value,
      description: document.getElementById(
        "rlr-product-form-product-description"
      ).value,
      keyword: document.getElementById("rlr-product-form-product-keyword")
        .value,
    },
    type: document.getElementById("rlr-product-form-product-theme").value,
    startp: document.getElementById("rlr-product-form-start-point").value,
    duration: document.getElementById("rlr-product-form-tour-select").value,
    image: [],
    itinerary: [],
    addon: [],
    inclusion: [],
    exclusion: [],
    faq: [],
  };

  const ip = document.getElementById("image-preview").childNodes;
  ip.forEach((element, i) => {
    data.image[i] = element.firstChild.src;
  });
  const dayitm = document.getElementById("dayitn").childNodes;
  dayitm.forEach((element) => {
    if (element.nodeName === "DIV") {
      const obj = {};
      obj.title = element.childNodes[1].childNodes[3].value;
      obj.description = element.childNodes[3].childNodes[3].value;
      data.itinerary[data.itinerary.length] = obj;
    } else {
    }
  });
  const adon = document.getElementById("adon").childNodes;
  adon.forEach((element) => {
    if (element.nodeName === "DIV") {
      const obj = {
        product: element.childNodes[1].childNodes[1].value,
      };
      data.addon[data.addon.length] = obj;
    }
  });
  const inex = document.getElementById("inex").childNodes;
  inex.forEach((element) => {
    if (element.nodeName === "DIV") {
      const ele = element.childNodes[1].childNodes[2];
      if (ele.placeholder.includes("inclusion")) {
        data.inclusion[data.inclusion.length] = { description: ele.value };
      } else {
        data.exclusion[data.exclusion.length] = { description: ele.value };
      }
    }
  });
  const faqcon = document.getElementById("faqcon").childNodes;
  faqcon.forEach((element) => {
    if (element.nodeName === "DIV") {
      const obj = {
        title: element.childNodes[1].childNodes[3].value,
        description: element.childNodes[3].childNodes[3].value,
      };
      data.faq[data.faq.length] = obj;
    }
  });
  return data;
};
const apd = async () => {
  let data = getdata();
  if (!data.title) {
    return alert("Please enter the title of tour");
  } else if (!data.description) {
    return alert("please enter the description of tour");
  } else if (
    !data.meta.heading ||
    !data.meta.description ||
    !data.meta.keyword
  ) {
    return alert("please enter meta data");
  } else if (!data.type) {
    return alert("Please enter type of tour");
  } else if (!data.duration) {
    return alert("Please enter the duration of the tour");
  } else if (!data.startp) {
    return alert("Please enter the strat point");
  } else if (data.image.length < 5) {
    return alert("Please select atleast 5 images");
  } else if (data.itinerary.length != data.duration) {
    return alert("Please select itinerary for selected duration");
  } else if (data.faq.length < 1) {
    return alert("Please add some FAQ");
  }
  const response = await fetch("/api/addproduct", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const dat = await response.json();
  alert(dat.message);
  window.location.replace("/tours");
};
const ap = document.getElementById("ap");
ap.addEventListener("click", apd);
