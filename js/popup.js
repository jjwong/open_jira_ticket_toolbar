const form = document.getElementById("ticket-form");
const inputTicket = document.getElementById("ticket");
const statusMessage = document.getElementById("status");
const ERROR_INVALID = "INVALID";
const ERROR_NO_DEFAULT_SET = "NO_DEFAULT";
const ERROR_MISSING = "MISSING";

async function handleFormSubmit(event) {
  event.preventDefault();

  openNewTicket(inputTicket.value, "toolbar");
}

function isDefaultProject(string) {
  // If there are only numbers at the beginning, we can assume this is a default project
  // There is a chance someone could type in 123BAD, but it will default to STACK-123
  // I think this is okay, since 123BAD is considered invalid.
  // We can add more error handling if needed
  var regex = new RegExp("(^\\d+)", "i");
  var isDefault = string.match(regex);

  if (isDefault) {
    return true;
  } else {
    return false;
  }
}

function sanitizeTicket(userInput) {
  /* JIRA tickets only takes [a-z], -, _, d+
   We currently only - configurations
   JIRA can support a few different prefix styles such as R2D2 and R2_D2_D3 prefixes.
   TODO: Add support for variants outside of standard a-z ticket prefixes
   Potential solution - [a-z]([a-z0-9_]{0,})-\d+ , but this will break core23-23 or semiTicket only
    detection.
    Supporting documentation - https://confluence.atlassian.com/adminjiraserver071/changing-the-project-key-format-802592378.html
   */

  // User input should be trimmed before it gets to this stage. We trim it again anyways.
  let cleanUserInput = userInput.toUpperCase().trim();

  var fullTicketRegex = new RegExp("([A-Z]{1,}-\\d+)", "i");
  var semiTicketRegex = new RegExp("([A-Z]{1,}\\d+)", "i");

  var spaceTicketRegex = new RegExp("([A-Z]{1,}(\\s+)\\d+)", "i");

  var numbersOnlyRegex = new RegExp("(\\d+)", "i");

  var fullTicketText = cleanUserInput.match(fullTicketRegex);

  if (fullTicketText) {
    return fullTicketText[0];
  } else if (cleanUserInput.match(semiTicketRegex)) {
    var semiTicket = cleanUserInput.match(semiTicketRegex)[0];
    var jprojectRegex = new RegExp("([A-Z]{1,})", "i");
    var jprojectText = semiTicket.match(jprojectRegex);
    var jprojectNumber = semiTicket.match(numbersOnlyRegex);
    //Form ticket
    var ticketID = jprojectText[0].concat("-", jprojectNumber[0]);
    return ticketID;
  } else if (cleanUserInput.match(spaceTicketRegex)) {
    return cleanUserInput.replace(/\s+/g, "-");
  } else if (cleanUserInput.match(numbersOnlyRegex)) {
    var defaultTicket = cleanUserInput.match(numbersOnlyRegex);
    return defaultTicket[0];
  } else {
    return "invalid ticket";
  }
}

function displayError(error_type) {
  if (error_type === ERROR_INVALID) {
    showStatusMessage("Invalid ticket entered.");
  } else if (error_type === ERROR_MISSING) {
    showStatusMessage("Unable to find display ticket.");
  } else if (error_type === ERROR_NO_DEFAULT_SET) {
    showStatusMessage("No default project set in options.");
  } else {
    showStatusMessage("Unhelpful error.");
  }

  // Prevent from searching invalid tickets
  throw "invalid";
}

function openNewTicket(ticket, sourceType) {
  const TICKET_UPPERCASE = ticket.toUpperCase().trim();
  const SANITIZED_TICKET = sanitizeTicket(TICKET_UPPERCASE);

  // Error display should only show up at the toolbar level
  if (SANITIZED_TICKET === "invalid ticket" && sourceType === "toolbar") {
    displayError(ERROR_INVALID);
  }

  chrome.storage.sync.get(function (items) {
    const USER_HOST_URL = items.useURL;
    const DEFAULT_PROJECT = items.useDefaultProject;

    let fullTicketID = getFullJiraID(DEFAULT_PROJECT, TICKET_UPPERCASE);

    let formURL = formTicketURL(USER_HOST_URL, fullTicketID);

    saveHistory(SANITIZED_TICKET);
    chrome.tabs.create({ url: formURL });
  }); //end get sync
} //end openNewTicket

function removeElement(element_id) {
  document.getElementById(element_id).remove();
} //end hideElement

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
        display.placeholder = items.useDefaultProject;
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

function compareTicketValues(a, b) {
  tmpA = Number(a.match(/\d+/g)[0]);
  tmpB = Number(b.match(/\d+/g)[0]);

  if (tmpA < tmpB) {
    return -1;
  } else if (tmpA > tmpB) {
    return 1;
  } else {
    return 0;
  }
} //end compareTicketValues

function saveHistory(userStringInput) {
  chrome.storage.sync.get(
    { userHistory: [], useDefaultProject: "PL" },
    function (result) {
      let userHistory = result.userHistory;
      let defaultProject = result.useDefaultProject;
      let jiraTicketID;

      jiraTicketID = getFullJiraID(defaultProject, userStringInput);

      let checkTicketIndex = userHistory.indexOf(jiraTicketID);
      // Check if string is in index, if so. Remove it first, then add it back in later.
      if (checkTicketIndex > -1) {
        // Remove only 1 instance in the array
        userHistory.splice(checkTicketIndex, 1);
      }

      //Add ticket to the top of the list.
      userHistory.unshift(jiraTicketID);

      // Pop the last item in the list
      while (userHistory.length > 10) {
        userHistory.pop();
      }

      chrome.storage.sync.set({ userHistory: userHistory }, function () {});
    }
  ); //end get sync
} //end saveHistory

function getFullJiraID(defaultProject, ticket) {
  let sanitizedTicket = sanitizeTicket(ticket);

  if (ticket === "invalid ticket") {
    displayError(ERROR_INVALID);
  } else {
    // Add default project to history
    if (isDefaultProject(sanitizedTicket)) {
      let defaultTicket = defaultProject + "-" + sanitizedTicket;
      return defaultTicket;
    } else {
      return sanitizedTicket;
    }
  }
}

// document.addEventListener("keydown", function (key) {
//   // Keycode 13 is Enter - Reference: https://css-tricks.com/snippets/javascript/javascript-keycodes/
//   if (key.keyCode === 13) {
//     var userInput = document.getElementById("ticket").value;
//     openNewTicket(userInput.trim(), "toolbar");
//   }
// });

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

function formTicketURL(url, ticket) {
  //TODO - verify ticket is valid
  return url + "/browse/" + ticket;
}

function buildHistoryList(userHostURL, ...tickets) {
  let historyList = document.getElementById("historyList");

  let rows = tickets.map((ticketID) => {
    let ticketURL = formTicketURL(userHostURL, ticketID);
    let li = document.createElement("li");
    let a = document.createElement("a");
    a.setAttribute("href", ticketURL);
    a.target = "_blank";
    a.textContent = ticketID;
    li.appendChild(a);
    return li;
  });

  historyList.append(...rows);
}

function reddenPage() {
  document.body.style.backgroundColor = "white";
}

window.addEventListener("load", function () {
  window.addEventListener("submit", handleFormSubmit);
  displayDefaultTicket();
  retrieveHistory();
}); //load eventlistener end

// chrome.runtime.onConnect.addListener(() => {
//   displayDefaultTicket();
//   retrieveHistory();
// });

// chrome.action.onClicked.addListener((tab) => {
//   chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     function: reddenPage,
//   });
// });

// chrome.omnibox.onInputEntered.addListener(function (userInput) {
//   openNewTicket(userInput.trim(), "omnibox");
// }); //end listener
