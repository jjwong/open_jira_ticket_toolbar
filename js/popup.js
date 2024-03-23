import { openNewTicket, sanitizeTicket, formTicketURL } from "./main.js";

/*eslint-env es6*/
const form = document.getElementById("ticket-form");
const inputTicket = document.getElementById("ticket");
const statusMessage = document.getElementById("status");
const ERROR_INVALID = "INVALID";
const ERROR_NO_DEFAULT_SET = "NO_DEFAULT";
const ERROR_MISSING = "MISSING";

async function handleFormSubmit(event) {
  event.preventDefault();

  const SANITIZED_TICKET = sanitizeTicket(inputTicket.value);
  // Error display should only show up at the toolbar level
  if (SANITIZED_TICKET === "invalid ticket") {
    displayError(ERROR_INVALID);
  }

  openNewTicket(SANITIZED_TICKET);
}

function displayError(error_type) {
  if (error_type === ERROR_INVALID) {
    showStatusMessage(chrome.i18n.getMessage("errorInvalid"));
  } else if (error_type === ERROR_MISSING) {
    showStatusMessage(chrome.i18n.getMessage("errorMissingTicket"));
  } else if (error_type === ERROR_NO_DEFAULT_SET) {
    showStatusMessage(chrome.i18n.getMessage("errorMissingDefault"));
  } else {
    showStatusMessage(chrome.i18n.getMessage("errorUnknown"));
  }

  // Prevent from searching invalid tickets
  throw "invalid";
}

function displayDefaultTicket() {
  chrome.storage.sync.get(function (items) {
    let display = document.getElementById("toggleProject");

    // disable button look if there is no secondary
    if (isEmpty(items.useSecondaryURL) || isEmpty(items.useSecondaryProject)) {
      display.disabled = true;
    }

    if (display === null) {
      console.log("ERROR: Unable to find display ticket.");
      displayError(ERROR_MISSING);
    } else {
      if (
        isEmpty(items.useDefaultProject) ||
        isEmpty(items.useDefaultProject)
      ) {
        displayError(ERROR_NO_DEFAULT_SET);
      } else {
        display.innerText = items.useDefaultProject;
        let inputBox = document.getElementById("ticket");
        inputBox.placeholder = chrome.i18n.getMessage("enterTicketID");
      }
    }
  }); //end sync
} //end displayDefaultTicket

// derived from displayDefaultTicket
function displaySecondaryTicket() {
  chrome.storage.sync.get(function (items) {
    let display = document.getElementById("toggleProject");
    if (display === null) {
      console.log("ERROR: Unable to find display ticket.");
      displayError(ERROR_MISSING);
    } else {
      if (
        isEmpty(items.useSecondaryProject) ||
        isEmpty(items.useSecondaryProject)
      ) {
        displayError(ERROR_NO_DEFAULT_SET);
      } else {
        display.innerText = items.useSecondaryProject;
        let inputBox = document.getElementById("ticket");
        inputBox.placeholder = chrome.i18n.getMessage("enterTicketID");
      }
    }
  }); //end sync
} //end displaySecondaryTicket

async function retrieveHistory() {
  // Set default useHistory if undefined
  chrome.storage.sync.get(
    {
      userHistory: [],
      useURL: "default",
      useSecondaryURL: "",
      favoritesList: [],
      useProjectTracker: 1,
    },
    function (items) {
      let historyStorage = items.userHistory;
      let userHostURL = items.useURL;

      if (items.useProjectTracker == 2) {
        userHostURL = items.useSecondaryURL;
      }

      buildHistoryList(userHostURL, ...historyStorage);
    }
  ); //end get sync
} //end retrieveHistory

function showStatusMessage(str) {
  setStatusMessage(str);
  setTimeout(function () {
    clearStatusMessage();
  }, 5000);
}

function setStatusMessage(str) {
  statusMessage.textContent = str;
  statusMessage.hidden = false;
}

function clearStatusMessage() {
  statusMessage.hidden = true;
  statusMessage.textContent = "";
}

function buildHistoryList(userHostURL, ...tickets) {
  let historyList = document.getElementById("historyList");
  let r = 1;

  let rows = tickets.map((ticketID) => {
    let ticketURL = formTicketURL(userHostURL, ticketID);
    let li = document.createElement("li");
    let a = document.createElement("a");
    a.setAttribute("href", ticketURL);
    a.target = "_blank";
    a.textContent = ticketID;
    li.appendChild(a);
    li.setAttribute("tabindex", r);
    r++;
    return li;
  });

  historyList.append(...rows);
}

function clearHistory() {
  let historyList = document.getElementById("historyList");

  while (historyList.firstChild) {
    historyList.removeChild(historyList.lastChild);
  }
}

window.addEventListener("load", function () {
  window.addEventListener("submit", handleFormSubmit);
  initDisplayProject();
  toggleProject();
  retrieveHistory();
  checkWorldClock();
  checkFiscalQuarter();
  checkHistoryPreference();
}); //load eventlistener end

// Add keyboard arrow support
var ul = document.getElementById("historyList");
var liSelected;
var index = -1;
var next;

document.addEventListener(
  "keydown",
  function (event) {
    var len = ul.getElementsByTagName("li").length - 1;

    //down key
    if (event.which === 40) {
      index++;

      if (liSelected) {
        removeClass(liSelected, "selected");
        next = ul.getElementsByTagName("li")[index];

        if (typeof next !== undefined && index <= len) {
          liSelected = next;
        } else {
          index = 0;
          liSelected = ul.getElementsByTagName("li")[0];
        }
        addClass(liSelected, "selected");
      } else {
        index = 0;

        liSelected = ul.getElementsByTagName("li")[0];
        addClass(liSelected, "selected");
      }
      //up key
    } else if (event.which === 38) {
      if (liSelected) {
        removeClass(liSelected, "selected");
        index--;
        next = ul.getElementsByTagName("li")[index];
        if (typeof next !== undefined && index >= 0) {
          liSelected = next;
        } else {
          index = len;
          liSelected = ul.getElementsByTagName("li")[len];
        }
        addClass(liSelected, "selected");
      } else {
        index = 0;
        liSelected = ul.getElementsByTagName("li")[len];
        addClass(liSelected, "selected");
      }
      // tabbing doubles the focus, removing selected since tab works natively okay.
    } else if (event.keyCode == 9 || (event.shiftKey && event.keyCode == 9)) {
      if (document.querySelector(".selected") !== null) {
        removeClass(liSelected, "selected");
        index = 0;
      }
    }
  },
  false
);

function removeClass(el, className) {
  if (el.classList) {
    el.classList.remove(className);
  } else {
    el.className = el.className.replace(
      new RegExp("(^|\\b)" + className.split(" ").join("|") + "(\\b|$)", "gi"),
      " "
    );
  }
}

function addClass(el, className) {
  if (el.classList) {
    el.classList.add(className);
  } else {
    el.className += " " + className;
  }
  document.querySelector(".selected > a").focus();
}

function searchClocks() {
  document.querySelectorAll(".clock").forEach((item) => {
    const timezone = {
      locale: item.getAttribute("data-timezone"),
    };

    item.querySelector("span").innerHTML = calculateTime(timezone.locale);
  });
}

function checkWorldClock() {
  chrome.storage.sync.get(function (items) {
    const WORLD_CLOCK = items.useWorldClock;

    if (WORLD_CLOCK) {
      searchClocks();
      document.getElementById("clock-container").hidden = false;
    }

    // showTimezonesInConsole();
  }); //end get sync
} //end checkWorldClock

function getSupportedTimezones() {
  return Intl.supportedValuesOf("timeZone");
}

// get timing based on supported timezones
function calculateTime(timezone) {
  let date = new Date();
  let localizedTime = date.toLocaleString("en-US", {
    timeZone: `${timezone}`,
    hour: "2-digit",
    minute: "2-digit",
  });
  // console.log(localizedTime);
  return localizedTime;
}

// Reference function to get all support time zones
function showTimezonesInConsole() {
  const timezonesArray = getSupportedTimezones();

  let date = new Date();
  timezonesArray.forEach((timeZone) => {
    let strTime = date.toLocaleString("en-US", { timeZone: `${timeZone}` });
    console.log(timeZone, strTime);
  });
}

function getCurrentQuarter(date) {
  let month = date.getMonth() + 1;
  return Math.ceil(month / 3);
}

function setFiscalQuarter() {
  const currentQuarter = getCurrentQuarter(new Date());
  const quarterSelector = ".q" + currentQuarter.toString();

  document.querySelectorAll(quarterSelector).forEach((item) => {
    item.id = "activeQuarter";
  });
}

function checkFiscalQuarter() {
  chrome.storage.sync.get(function (items) {
    const FISCAL_QUARTER = items.useFiscalQuarter;

    if (FISCAL_QUARTER) {
      setFiscalQuarter();
      document.getElementById("quarter-container").hidden = false;
    }
  }); //end get sync
} //end checkFiscalQuarter

function checkHistoryPreference() {
  chrome.storage.sync.get(function (items) {
    const HISTORY_PREFERENCE = items.useHistoryPreference;
    // console.log(HISTORY_PREFERENCE);

    // For existing users, history will be undefined, and we want it to show up by default.
    // This will go away once they save options. This shouldn't occur for new users.
    if (HISTORY_PREFERENCE == true || HISTORY_PREFERENCE == undefined) {
      document.getElementById("previousSearches").hidden = false;
    } else {
      document.getElementById("previousSearches").hidden = true;
    }
  }); //end get sync
} //end checkHistoryPreference

// support multi projects
function toggleProject() {
  document
    .getElementById("toggleProject")
    .addEventListener("click", handleProject);
}

function handleProject() {
  chrome.storage.sync.get(
    {
      useProjectTracker: 1,
      useURL: "",
      useSecondaryURL: "",
      useSecondaryProject: "",
    },
    function (result) {
      let useProjectTracker = result.useProjectTracker;
      let useURL = result.useURL;
      let useSecondaryURL = result.useSecondaryURL;
      let useSecondaryProject = result.useSecondaryProject;

      if (isEmpty(useSecondaryURL) || isEmpty(useSecondaryProject)) {
        // should never reach here, but if there is an odd state, refresh the display
        displayDefaultTicket();
        clearHistory();
        retrieveHistory();
        // if there is a bad state, let us know to debug.
        console.log("No secondary project set, go to options to set.");
      } else {
        // intention is to swap useProjectTracker id so you can toggle when calling this
        if (useProjectTracker == 1) {
          chrome.storage.sync.set({ useProjectTracker: 2 }, function () {});
          displaySecondaryTicket();
        } else {
          chrome.storage.sync.set({ useProjectTracker: 1 }, function () {});
          displayDefaultTicket();
        }

        // reset the history view if the URLs are different after toggling
        if (useURL != useSecondaryURL) {
          clearHistory();
          retrieveHistory();
        }
      }
    }
  ); //end get sync
}

function initDisplayProject() {
  chrome.storage.sync.get({ useProjectTracker: 1 }, function (result) {
    let useProjectTracker = result.useProjectTracker;

    if (useProjectTracker == 1) {
      displayDefaultTicket();
    } else {
      displaySecondaryTicket();
    }
  }); //end get sync
}

function isEmpty(value) {
  return (
    value == null || (typeof value === "string" && value.trim().length === 0)
  );
}
