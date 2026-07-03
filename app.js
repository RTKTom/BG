const { SUPABASE_URL, SUPABASE_KEY, YEAR } = window.APP_CONFIG;
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const MONTHS = [
  { index: 6, name: "July" },
  { index: 7, name: "August" },
  { index: 8, name: "September" }
];

const form = document.querySelector("#guess-form");
const nameInput = document.querySelector("#name");
const dateInput = document.querySelector("#guess-date");
const submitButton = document.querySelector("#submit-button");
const message = document.querySelector("#form-message");
const calendar = document.querySelector("#calendar");
const loading = document.querySelector("#loading");
const potTotal = document.querySelector("#pot-total");
const guessCount = document.querySelector("#guess-count");

dateInput.min = `${YEAR}-07-01`;
dateInput.max = `${YEAR}-09-30`;

let guesses = [];

function normaliseName(value) {
  return value.trim().replace(/\s+/g, " ");
}

function formatLocalISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[character]));
}

function showMessage(text, type = "") {
  message.textContent = text;
  message.className = `form-message ${type}`;
}

function makeMonth(month) {
  const monthElement = document.createElement("article");
  monthElement.className = "month";

  const title = document.createElement("h3");
  title.textContent = `${month.name} ${YEAR}`;
  monthElement.appendChild(title);

  const weekdays = document.createElement("div");
  weekdays.className = "weekdays";
  ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach(day => {
    const label = document.createElement("span");
    label.textContent = day;
    weekdays.appendChild(label);
  });
  monthElement.appendChild(weekdays);

  const days = document.createElement("div");
  days.className = "days";

  const firstDay = new Date(YEAR, month.index, 1);
  const mondayFirstOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(YEAR, month.index + 1, 0).getDate();

  for (let i = 0; i < mondayFirstOffset; i += 1) {
    const blank = document.createElement("div");
    blank.className = "day empty";
    days.appendChild(blank);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(YEAR, month.index, day);
    const isoDate = formatLocalISODate(date);
    const guess = guesses.find(item => item.guess_date === isoDate);

    const dayElement = document.createElement("div");
    dayElement.className = `day ${guess ? "taken" : "available"}`;
    dayElement.title = guess
      ? `${guess.name} guessed ${day} ${month.name}`
      : `${day} ${month.name} is available`;

    dayElement.innerHTML = `
      <span class="day-number">${day}</span>
      ${guess ? `<span class="guesser">${escapeHtml(guess.name)}</span>` : ""}
    `;

    days.appendChild(dayElement);
  }

  monthElement.appendChild(days);
  return monthElement;
}

function renderCalendar() {
  calendar.innerHTML = "";

  MONTHS.forEach(month => {
    calendar.appendChild(makeMonth(month));
  });

  const totalGuesses = guesses.length;
  const totalPot = totalGuesses * 2;

  guessCount.textContent = totalGuesses;
  potTotal.textContent = `£${totalPot}`;

  loading.hidden = true;
}

async function loadGuesses() {
  const { data, error } = await supabaseClient
    .from("guesses")
    .select("name, guess_date")
    .order("guess_date", { ascending: true });

  if (error) {
    loading.textContent = "Could not load guesses. Check the Supabase details in config.js.";
    console.error(error);
    return;
  }

  guesses = data ?? [];
  renderCalendar();
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  showMessage("");

  const name = normaliseName(nameInput.value);
  const guessDate = dateInput.value;

  if (name.length < 2) {
    showMessage("Please enter a name of at least 2 characters.", "error");
    return;
  }

  if (!guessDate || guessDate < `${YEAR}-07-01` || guessDate > `${YEAR}-09-30`) {
    showMessage(`Please choose a date from July to September ${YEAR}.`, "error");
    return;
  }

  if (guesses.some(guess => guess.guess_date === guessDate)) {
    showMessage("That date has already been taken. Please choose another.", "error");
    return;
  }

  if (guesses.some(guess => guess.name.toLowerCase() === name.toLowerCase())) {
    showMessage("That name already has a guess. Only one guess per person.", "error");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Adding your guess…";

  const { error } = await supabaseClient
    .from("guesses")
    .insert({ name, guess_date: guessDate });

  submitButton.disabled = false;
  submitButton.textContent = "Enter my guess — £2";

  if (error) {
    if (error.code === "23505") {
      showMessage("That name or date has just been taken. Please refresh and try another.", "error");
    } else {
      showMessage("Sorry, your guess could not be added. Please try again.", "error");
    }
    console.error(error);
    return;
  }

  form.reset();
  showMessage("Your guess is in! Please remember to pay the organiser £2. ♡", "success");
  await loadGuesses();
});

supabaseClient
  .channel("guess-updates")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "guesses" },
    () => loadGuesses()
  )
  .subscribe();

loadGuesses();
