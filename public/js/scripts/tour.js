const next = document.getElementById("next_pg");
const doc = document.getElementsByClassName("cnnt");
next.addEventListener("click", () => {
  const ur = window.location.href.split("/");
  if (!ur[4]) {
    if (doc.length >= 12) {
      window.location.replace("/tours/page2");
    }
  } else {
    if (doc.length >= 12) {
      const pageRegex = /^page(\d+)$/; // Regular expression to match "page" followed by one or more digits
      const matches = ur[4].match(pageRegex);
      console.log(matches);
      if (matches) {
        const pageNumber = matches[1];
        window.location.replace(`tours/page${pageNumber * 1 + 1}`);
      }
    }
  }
});

const prev = document.getElementById("prev_pg");
prev.addEventListener("click", () => {
  const ur = window.location.href.split("/");
  if (!ur[4]) {
  } else {
    const pageRegex = /^page(\d+)$/; // Regular expression to match "page" followed by one or more digits
    const matches = ur[4].match(pageRegex);
    const pageNumber = matches[1];
    if (matches) {
      if (pageNumber > 1) {
        window.location.replace(`tours/page${pageNumber * 1 - 1}`);
      }
    }
  }
});
