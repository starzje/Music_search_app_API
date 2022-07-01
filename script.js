const button = document.getElementById("button");
const input = document.getElementById("input");
const results = document.getElementById("results");
const spinner = document.getElementById("spinner");

button.addEventListener("click", searchSong);

// debounce funkcija za ograničavanje poziva servera
const debounce = (fn, delay) => {
  let timeout = null;
  return (...args) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

// na bilo kakav input pozivamo glavni search app uz debounce funkciju za ograničavanje poziva servera na 1.5sec
input.addEventListener("input", debounce(searchSong, 750));

// funkcija za search app koja poziva itunes api
async function searchSong(e) {
  e.preventDefault();
  // ako je input prazan, ne poziva se server
  const value = input.value;
  if (value === "") {
    results.innerHTML = "";
  } else {
    // nakon pretrage se prikazuje spinner koji se pojavljuje dok se server poziva
    spinner.classList.remove("deactivated");
    spinner.classList.add("active");
    let data = await fetch(`https://itunes.apple.com/search?term=${value}`);
    data = await data.json();
    // nakon što se server pozove, spinner se ugašava i poziva se funkcija printResults koja prima dohvacene podatke
    spinner.classList.remove("active");
    spinner.classList.add("deactivated");
    printResults(data);
  }
}

// funkcija koja ispisuje dohvacene podatke
function printResults(data) {
  let rezultat = `<div>`;
  // ako nema rezultata
  if (data.resultCount === 0) {
    results.innerHTML = `<h2 class="nothing-found">There is no artist or track with the name <i>\" ${input.value}\  "</i></h2>`;
  } else {
    data.results.forEach((element) => {
      // ako je element pjesma koja postoji na itunesu, URL daje lokaciju pjesme, u suprotnom link salje na informaicije o autoru
      let songTrack = element.trackViewUrl
        ? element.trackViewUrl
        : element.artistViewUrl;

      // ako je element pjesma, ispisuje se naziv pjesme, u suprotnom ispisuje se naziv kolekcije --> uglavnom za audiobook
      let trackName = element.trackName
        ? element.trackName
        : element.collectionName;
      // varijabla rezultat se puni sa svim informacijama pomocu template literala
      rezultat += `<div class="card"><a class="link" href="${songTrack}" target="_blank"><div class="image-overlay">
            <img
              src="${element.artworkUrl100}"
              class="img"
              alt="..."
            />
            
  <p class="artist-name">${element.artistName}</p>
  <p class="track-name"><span class="special-track-name">${element.wrapperType}:</span> ${trackName}</p>
  <p class="moreInfo"><i class="fa-brands fa-apple"></i><i class="fa-solid fa-music"></i><i class="fa-solid fa-play"></i></p>
</div></a>
</div>
  `;
      // zatvaramo rezultate i dodajemo u html
      rezultat += "</div>";
      results.innerHTML = rezultat;
    });
  }
}
