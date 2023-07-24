const save = () => {
  if (document.getElementById("mem_count").innerText > 56) {
    alert("group can not be greater then 56");
    return;
  }
  const data = {
    date: document.getElementById("rlr-banner-input-group-dates").value,
    traveller: document.getElementById("rlr-booking-travellers-input").value,
    addon: document.getElementById("rlr-booking-selection-input").value,
    tour: document.getElementById("tr_title").innerText,
    member: document.getElementById("mem_count").innerText,
  };
  sessionStorage.setItem("data", JSON.stringify(data));
  window.location.replace(
    `/tours/details/${data.tour.split(" ").join("-")}/inquiry`
  );
};
document.getElementById("pcd_bkng").addEventListener("click", save);
