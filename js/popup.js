/*eslint-env es6*/
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

  // Trim and uppercase user input
  let cleanUserInput = userInput.toUpperCase().trim();

  const fullTicketRegex = new RegExp("([A-Z]{1,}-\\d+)", "i");
  const semiTicketRegex = new RegExp("([A-Z]{1,}\\d+)", "i");

  const spaceTicketRegex = new RegExp("([A-Z]{1,}(\\s+)\\d+)", "i");

  const numbersOnlyRegex = new RegExp("(\\d+)", "i");

  const fullTicketText = cleanUserInput.match(fullTicketRegex);

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

function openNewTicket(ticket, sourceType) {
  const SANITIZED_TICKET = sanitizeTicket(ticket);

  // Error display should only show up at the toolbar level
  if (SANITIZED_TICKET === "invalid ticket" && sourceType === "toolbar") {
    displayError(ERROR_INVALID);
  }

  chrome.storage.sync.get(function (items) {
    const USER_HOST_URL = items.useURL;
    const DEFAULT_PROJECT = items.useDefaultProject;

    const fullTicketID = getFullJiraID(DEFAULT_PROJECT, SANITIZED_TICKET);

    let formURL = formTicketURL(USER_HOST_URL, fullTicketID);

    saveHistory(fullTicketID);
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
  let r = 1

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

function reddenPage() {
  document.body.style.backgroundColor = "white";
}

window.addEventListener("load", function () {
  window.addEventListener("submit", handleFormSubmit);
  displayDefaultTicket();
  retrieveHistory();
}); //load eventlistener end

// Add keyboard arrow support
var ul = document.getElementById('historyList');
var liSelected;
var index = -1;
var next;

document.addEventListener('keydown', function(event) {
  var len = ul.getElementsByTagName('li').length - 1;

  //down key
  if (event.which === 40) {
    index++;

    if (liSelected) {
      removeClass(liSelected, 'selected');
      next = ul.getElementsByTagName('li')[index];

      if (typeof next !== undefined && index <= len) {
        liSelected = next;
      } else {
        index = 0;
        liSelected = ul.getElementsByTagName('li')[0];
      }
      addClass(liSelected, 'selected');
    } else {
      index = 0;

      liSelected = ul.getElementsByTagName('li')[0];
      addClass(liSelected, 'selected');
    }
  //up key
  } else if (event.which === 38) {
    if (liSelected) {
      removeClass(liSelected, 'selected');
      index--;
      next = ul.getElementsByTagName('li')[index];
      if (typeof next !== undefined && index >= 0) {
        liSelected = next;
      } else {
        index = len;
        liSelected = ul.getElementsByTagName('li')[len];
      }
      addClass(liSelected, 'selected');
    } else {
      index = 0;
      liSelected = ul.getElementsByTagName('li')[len];
      addClass(liSelected, 'selected');
    }
    // tabbing doubles the focus, removing selected since tab works natively okay.
  } else if (event.keyCode == 9 || (event.shiftKey && event.keyCode == 9)) {
    if(document.querySelector('.selected') !== null) {
      removeClass(liSelected, 'selected');
      index = 0;
    }
  }
}, false);

function removeClass(el, className) {
  if (el.classList) {
    el.classList.remove(className);
  } else {
    el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  }
};

function addClass(el, className) {
  if (el.classList) {
    el.classList.add(className);
  } else {
    el.className += ' ' + className;
  }
  document.querySelector('.selected > a').focus();
};

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
