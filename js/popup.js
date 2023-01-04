import { openNewTicket, sanitizeTicket, formTicketURL } from "./main.js"

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
    let display = document.getElementById("displayDefaultTicket");
    if (display === null) {
      console.log("ERROR: Unable to find display ticket.");
      displayError(ERROR_MISSING);
    } else {
      if (
        items.useDefaultProject === undefined ||
        items.useDefaultProject === null
      ) {
        document.getElementById("ticket").setAttribute("disabled", true);
        displayError(ERROR_NO_DEFAULT_SET);
      } else {
        display.innerText = items.useDefaultProject;
        let inputBox = document.getElementById("ticket");
        inputBox.placeholder = chrome.i18n.getMessage("enterTicketID");
      }
    }
  }); //end sync
} //end displayDefaultTicket

async function retrieveHistory() {
  // Set default useHistory if undefined
  chrome.storage.sync.get(
    { userHistory: [], useURL: "default", favoritesList: [] },
    function (items) {
      let historyStorage = items.userHistory;
      let userHostURL = items.useURL;

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

window.addEventListener("load", function () {
  window.addEventListener("submit", handleFormSubmit);
  displayDefaultTicket();
  retrieveHistory();
  getWorldClock();
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
      offset: item.getAttribute("data-offset"),
    };
    // Not running this in an interval loads the toolbar instantly. Cleaner display.
    item.querySelector("span").innerHTML = calcTime(timezone);
  });
}

// get local time (browser based)
function calcTime(timezone) {
  const d = new Date(),
    utc = d.getTime() + d.getTimezoneOffset() * 60000,
    nd = new Date(utc + 3600000 * timezone.offset);

  return nd.toLocaleTimeString("en-US", {hour: '2-digit', minute:'2-digit'});
}

function getWorldClock() {
  chrome.storage.sync.get(function (items) {
    const WORLD_CLOCK = items.useWorldClock;

    if (WORLD_CLOCK) {
      searchClocks();
      document.getElementById("clock-container").hidden = false;
    }
  }); //end get sync
} //end getWorldClock
