
const searchForm = document.getElementById("searchForm");
const wordInput = document.getElementById("wordInput");
const results = document.getElementById("results");
const message = document.getElementById("message");
const favoritesList = document.getElementById("favoritesList");
const themeButton = document.getElementById("themeButton");


let favorites = [];

try {
  favorites = JSON.parse(
    localStorage.getItem("wordlyFavorites") || "[]"
  );

  if (!Array.isArray(favorites)) {
    favorites = [];
  }
} catch {
  favorites = [];
}

// Search for a word when the form is submitted.
searchForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const word = wordInput.value.trim();

  if (word) {
    searchWord(word);
  }
});


async function searchWord(word) {
  message.textContent = "Searching...";
  results.innerHTML = "<h2>Dictionary Results</h2>";

  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Word not found. Check your spelling.");
      }

      throw new Error("The dictionary service is unavailable.");
    }

    const data = await response.json();

    message.textContent = "";
    displayWord(data);

  } catch (error) {
    message.textContent =
      error.message === "Failed to fetch"
        ? "Network error. Check your internet connection and try again."
        : error.message;

    results.innerHTML = "<h2>Dictionary Results</h2>";
  }
}

function displayWord(data) {
  results.innerHTML = "";

  const entry = data[0];
  const heading = document.createElement("h2");

  heading.className = "word-heading";
  heading.textContent = entry.word;
  results.appendChild(heading);

  const phonetic = document.createElement("p");
  phonetic.textContent =
    "Pronunciation: " +
    (entry.phonetic || "Not available");

  results.appendChild(phonetic);


  const audioInfo = entry.phonetics.find(
    item => item.audio
  );

  if (audioInfo) {
    const audio = document.createElement("audio");
    audio.src = audioInfo.audio;
    audio.controls = true;
    audio.className = "audio-button";
    audio.setAttribute(
      "aria-label",
      "Pronunciation of " + entry.word
    );

    results.appendChild(audio);
  }

  const favoriteButton = document.createElement("button");

  favoriteButton.textContent = favorites.some(
    word => word.toLowerCase() === entry.word.toLowerCase()
  )
    ? "Remove Favorite"
    : "Save Favorite";

  favoriteButton.addEventListener("click", function () {
    toggleFavorite(entry.word);
    displayWord(data);
  });

  results.appendChild(favoriteButton);

  entry.meanings.forEach(function (meaning) {
    const part = document.createElement("h3");
    part.textContent = meaning.partOfSpeech;
    results.appendChild(part);

    meaning.definitions.forEach(function (item, index) {
      const card = document.createElement("div");
      card.className = "definition-card";

      const definition = document.createElement("p");
      definition.textContent =
        (index + 1) + ". " + item.definition;

      card.appendChild(definition);

      if (item.example) {
        const example = document.createElement("p");
        example.textContent = "Example: " + item.example;
        card.appendChild(example);
      }

      if (item.synonyms && item.synonyms.length > 0) {
        const synonyms = document.createElement("p");
        synonyms.textContent =
          "Synonyms: " + item.synonyms.join(", ");

        card.appendChild(synonyms);
      }

      results.appendChild(card);
    });
  });

  if (entry.sourceUrls && entry.sourceUrls.length > 0) {
    const source = document.createElement("p");
    source.textContent = "Source: ";

    const link = document.createElement("a");
    link.href = entry.sourceUrls[0];
    link.textContent = "View dictionary source";
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    source.appendChild(link);
    results.appendChild(source);
  }
}

function toggleFavorite(word) {
  const exists = favorites.some(
    item => item.toLowerCase() === word.toLowerCase()
  );

  if (exists) {
    favorites = favorites.filter(
      item => item.toLowerCase() !== word.toLowerCase()
    );
  } else {
    favorites.push(word);
  }

  try {
    localStorage.setItem(
      "wordlyFavorites",
      JSON.stringify(favorites)
    );
  } catch {
    message.textContent =
      "Favorites could not be saved in this browser.";
  }

  displayFavorites();
}

function displayFavorites() {
  favoritesList.innerHTML = "";

  favorites.forEach(function (word) {
    const item = document.createElement("li");
    item.className = "saved-word";

    const searchButton = document.createElement("button");
    searchButton.textContent = word;

    searchButton.addEventListener("click", function () {
      wordInput.value = word;
      searchWord(word);
    });

    item.appendChild(searchButton);
    favoritesList.appendChild(item);
  });
}

themeButton.addEventListener("click", function () {
  document.body.classList.toggle("dark");
});


displayFavorites();
