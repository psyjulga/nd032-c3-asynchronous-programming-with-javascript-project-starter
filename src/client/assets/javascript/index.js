// start BACKEND: ORIGIN_ALLOWED=http://localhost:3000 ./bin/server.exe
// start FRONTEND: npm start

// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
var store = {
  track_id: undefined, // updated onclick track card
  player_id: undefined, // updated onclick racer card
  race_id: undefined,
};

// We need our javascript to wait until the DOM is loaded
// gets only loaded when button "start my race" is clicked
// it links to race.html
// THIS script is NOT linked to home.html
document.addEventListener("DOMContentLoaded", function () {
  onPageLoad();
  setupClickHandlers();
});

async function onPageLoad() {
  // on "DOMContentLoaded"
  try {
    getTracks().then((tracks) => {
      // getTracks makes API call
      console.log("hello from onPageLoad getTracks");
      // onclick button "start my race"
      console.log(tracks); // array of track objects
      const html = renderTrackCards(tracks); // function that returns html
      renderAt("#tracks", html); // where we render that html
    });

    //function renderAt(element, html) {
    // const node = document.querySelector(element);
    // node.innerHTML = html;}

    getRacers().then((racers) => {
      // getRacers makes API call
      console.log("hello from onPageLoad getRacers");
      // onclick button "start my race"
      console.log(racers); // array of racer objects
      const html = renderRacerCars(racers);
      renderAt("#racers", html);
    });
  } catch (error) {
    console.log("Problem getting tracks and racers ::", error.message);
    console.error(error);
  }
}

function setupClickHandlers() {
  // on "DOMContentLoaded"
  document.addEventListener(
    "click",
    function (event) {
      let { target } = event;

      // Race track form field
      // click on track card
      if (
        target.matches(".card.track") ||
        target.parentNode.matches(".card.track")
      ) {
        if (target.parentNode.matches(".card.track")) {
          target = target.parentNode;
        }
        console.log("hello from clicked track card");
        handleSelectTrack(target);
      }
      // Podracer form field
      // click on racer card
      if (
        target.matches(".card.podracer") ||
        target.parentNode.matches(".card.podracer")
      ) {
        if (target.parentNode.matches(".card.podracer")) {
          target = target.parentNode;
        }
        console.log("hello from clicked racer card");
        handleSelectPodRacer(target);
      }

      // Submit create race form
      // click button "start race"
      if (target.matches("#submit-create-race")) {
        event.preventDefault();
        console.log(
          "hello from clicked start race button - handleCreateRace is now triggered"
        );
        // start race
        handleCreateRace();
      }

      // ------ SEEMS TO WORK SO FAR -----

      // Handle acceleration click
      // onclick "click me to win" button
      if (target.matches("#gas-peddle")) {
        handleAccelerate();
      }
    },
    false
  );
}

async function delay(ms) {
  // called in runCountdown
  // => await delay(1000);
  try {
    return await new Promise((resolve) => setTimeout(resolve, ms));
  } catch (error) {
    console.log("an error shouldn't be possible here");
    console.log(error);
  }
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race,
// add the logic and error handling
// onclick button "start race"

async function handleCreateRace() {
  // DONE: Get player_id and track_id from the store
  const playerID = store.player_id;
  const trackID = store.track_id;
  // DONE: invoke the API call to create the race, then save the result
  const race = await createRace(playerID, trackID);
  console.log("fromHandleCreateRace => const race=", race);
  // siehe Screenshot

  // render starting UI
  renderAt("#race", renderRaceStartView(race.Track));

  // DONE: update the store with the race id
  store.race_id = race.ID - 1; // !!!!!!!!
  console.log("from handleCreateRace => store =", store);
  // For the API to work properly, the race id should be race id - 1

  // The race has been created, now start the countdown
  // DONE: call the async function runCountdown
  await runCountdown();
  // TODO - call the async function startRace ????
  await startRace(store.race_id);
  // TODO - call the async function runRace ????
  await runRace(store.race_id);
  // returns a promise !!
}

function runRace(raceID) {
  // called in async function handleCreateRace()
  return new Promise((resolve) => {
    // TODO - use Javascript's built in setInterval method
    // to get race info every 500ms
    const raceInterval = setInterval(
      async function () {
        const res = await getRace(raceID);
        console.log("from runRace raceInterval => const res=", res);
        // siehe Screenshot
        // TODO - if the race info status property is "in-progress",
        // update the leaderboard by calling:
        if (res.status === "in-progress") {
          renderAt("#leaderBoard", raceProgress(res.positions));
        }
        if (res.status === "finished") {
          // TODO - if the race info status property is "finished", run the following:
          clearInterval(raceInterval); // to stop the interval from repeating
          renderAt("#race", resultsView(res.positions)); // to render the results view
          resolve(res); // resolve the promise
        }
      },
      5000 // 500
    );
  });
  // remember to add error handling for the Promise
}

async function runCountdown() {
  try {
    // wait for the DOM to load
    await delay(1000);
    let timer = 3;

    return new Promise((resolve) => {
      // DONE: use Javascript's built in setInterval method
      // to count down once per second
      const countDown = setInterval(function () {
        // run this DOM manipulation to decrement the countdown for the user
        document.getElementById("big-numbers").innerHTML = --timer;

        if (timer === 0) {
          clearInterval(countDown);
          resolve();
          return;
        }
      }, 1000);
      // DONE: if the countdown is done, clear the interval,
      // resolve the promise, and return ???
    });
  } catch (error) {
    console.log("error in countdown", error);
  }
}

function handleSelectPodRacer(target) {
  console.log("selected a pod with ID: ", target.id);
  // remove class selected from all racer options
  const selected = document.querySelector("#racers .selected");
  if (selected) {
    selected.classList.remove("selected");
  }

  // add class selected to current target
  target.classList.add("selected");

  // DONE: save the selected racer to the store
  store.player_id = target.id;
  console.log("in handleSelectPodRacer", store);
}

function handleSelectTrack(target) {
  console.log("selected a track with ID: ", target.id);

  // remove class selected from all track options
  const selected = document.querySelector("#tracks .selected");
  if (selected) {
    selected.classList.remove("selected");
  }

  // add class selected to current target
  target.classList.add("selected");

  // DONE: save the selected track id to the store
  store.track_id = target.id;
  console.log("in handleSelectTrack", store);
}

function handleAccelerate() {
  console.log("accelerate button clicked");
  // TODO - Invoke the API call to accelerate
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
  if (!racers.length) {
    return `
			<h4>Loading Racers...</4>
		`;
  }

  const results = racers.map(renderRacerCard).join("");

  return `
		<ul id="racers">
			${results}
		</ul>
	`;
}

function renderRacerCard(racer) {
  const { id, driver_name, top_speed, acceleration, handling } = racer;

  return `
		<li class="card podracer" id="${id}">
			<h3>${driver_name}</h3>
			<p>${top_speed}</p>
			<p>${acceleration}</p>
			<p>${handling}</p>
		</li>
	`;
}

function renderTrackCards(tracks) {
  if (!tracks.length) {
    return `
			<h4>Loading Tracks...</4>
		`;
  }

  const results = tracks.map(renderTrackCard).join("");

  return `
		<ul id="tracks">
			${results}
		</ul>
	`;
}

function renderTrackCard(track) {
  const { id, name } = track;

  return `
		<li id="${id}" class="card track">
			<h3>${name}</h3>
		</li>
	`;
}

function renderCountdown(count) {
  return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`;
}

function renderRaceStartView(track, racers) {
  return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`;
}

function resultsView(positions) {
  positions.sort((a, b) => (a.final_position > b.final_position ? 1 : -1));

  return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`;
}

function raceProgress(positions) {
  console.log("from raceProgress => positions: ", positions);
  let userPlayer = positions.find((e) => e.id === store.player_id);
  userPlayer.driver_name += " (you)";

  positions = positions.sort((a, b) => (a.segment > b.segment ? -1 : 1));
  let count = 1;

  const results = positions.map((p) => {
    return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`;
  });

  return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${results}
			</section>
		</main>
	`;
}

function renderAt(element, html) {
  const node = document.querySelector(element);

  node.innerHTML = html;
}

// ^ Provided code ^ do not remove

// API CALLS ------------------------------------------------

const SERVER = "http://localhost:8000";

function defaultFetchOpts() {
  return {
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": SERVER,
    },
  };
}

// DONE: Make a fetch call (with error handling!) to each of the following API endpoints
// fetch => asynchronous http call -- GET = default
// fetch returns a promise

// will be called in async function onPageLoad
function getTracks() {
  // GET request to `${SERVER}/api/tracks`
  console.log("hello from getTracks API call"); // onclick button "start my race"
  return fetch(`${SERVER}/api/tracks`) // list of all tracks
    .then((response) => response.json())
    .catch((e) => console.log("error in API call getTracks: ", e));
}

// will be called in async function onPageLoad
function getRacers() {
  // GET request to `${SERVER}/api/cars`
  console.log("hello from getRacers API call"); // onclick button "start my race"
  return fetch(`${SERVER}/api/cars`) // list of all cars
    .then((response) => response.json())
    .catch((e) => console.log("error in API call getRacers: ", e));
}

function createRace(player_id, track_id) {
  player_id = parseInt(player_id);
  track_id = parseInt(track_id);
  const body = { player_id, track_id };

  return fetch(`${SERVER}/api/races`, {
    method: "POST",
    ...defaultFetchOpts(),
    dataType: "jsonp",
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .catch((err) => console.log("Problem with createRace request::", err));
}

function getRace(id) {
  // WHERE is this function called?
  // inside function runRace(raceID)
  // GET request to `${SERVER}/api/races/${id}`
  return fetch(`${SERVER}/api/races/${id}`) // info about a single race
    .then((response) => response.json())
    .catch((e) => console.log("error in API call getRace: ", e));
}

function startRace(id) {
  return (
    fetch(`${SERVER}/api/races/${id}/start`, {
      // begin a race
      method: "POST",
      ...defaultFetchOpts(),
    })
      //.then((res) => res.json())
      // startRace returns nothing!
      // so deserializing with json would result in an error
      .catch((err) => console.log("Problem with startRace request::", err))
  );
}

function accelerate(id) {
  return fetch(`${SERVER}/api/races/${id}/accelerate`, {
    method: "POST",
    ...defaultFetchOpts(),
  })
    .then((res) => res.json())
    .catch((err) => console.log("Problem with accelerate request::", err));
  // POST request to `${SERVER}/api/races/${id}/accelerate`
  // options parameter provided as defaultFetchOpts
  // no body or datatype needed for this request
}
