function isDefaultProject(string) {
  // If there are only numbers at the beginning, we can assume this is a default project
  // There is a chance someone could type in 123BAD, but it will default to STACK-123
  // I think this is okay, since 123BAD is considered invalid. 
  // We can add more error handling if needed
  var regex = new RegExp('(^\\d+)', 'i');
  var isDefault = string.match(regex);  

  if (isDefault) {
      return true;
  } else {
      return false;
  }

}

function sanitizeTicket(userInput) {
  /* JIRA tickets only takes [a-z], -, d+
   JIRA can support a few different prefix styles such as R2D2 and R2_D2_D3 prefixes.
   TODO: Add support for variants outside of standard a-z ticket prefixes
   Potential solution - [a-z]([a-z0-9_]{0,})-\d+ , but this will break core23-23 or semiTicket only
    detection. 
    Supporting documentation - https://confluence.atlassian.com/adminjiraserver071/changing-the-project-key-format-802592378.html
   */
  var fullTicketRegex = new RegExp('([a-z]{1,}-\\d+)', 'i');
  var semiTicketRegex = new RegExp('([a-z]{1,}\\d+)', 'i');
  var numbersOnlyRegex = new RegExp('(\\d+)', 'i');
  
  var fullTicketText = userInput.match(fullTicketRegex);

  if (fullTicketText) {
      return fullTicketText[0];
  } else if (userInput.match(semiTicketRegex)) {
      var jprojectRegex = new RegExp('([a-z]{1,})', 'i');
      var jprojectText = userInput.match(jprojectRegex);
      var jprojectNumber = userInput.match(numbersOnlyRegex);
      //Form ticket 
      var ticketID = jprojectText[0].concat("-", jprojectNumber[0]);
      return ticketID;
  } else if (userInput.match(numbersOnlyRegex)) {
      var defaultTicket = userInput.match(numbersOnlyRegex);
      return defaultTicket[0];
  } else {
      return "invalid ticket"
  }

}

function showInvalidTicketError() {
  removeError();

  var status = document.getElementById('status');

  newContent = document.createElement("div");
  var newDiv = status.appendChild(newContent);
  newDiv.setAttribute("data-localize", "toolbar_error");
  newDiv.setAttribute("id", "error");
  loadLocalization();
  throw "invalid";
}

function openNewTicket(ticket, sourceType) {
  var ticket_uppercase = ticket.toUpperCase();

  var sanitizedTicket = sanitizeTicket(ticket_uppercase);
  // Error display should only show up at the toolbar level
  if (sanitizedTicket === "invalid ticket" && sourceType === "toolbar") {
    showInvalidTicketError();
  }

  addHistory(ticket_uppercase);

	chrome.storage.sync.get(function(items) {
		var url = items.useURL;
		var defaultProject = items.useDefaultProject;
    var sanitizedTicket = sanitizeTicket(ticket_uppercase);

    if(isDefaultProject(ticket_uppercase)) {
      var formURL = url + "/browse/" + defaultProject + "-" + sanitizedTicket;
      var formHref = "<a href='" + formURL + "'>" + defaultProject + "-" + sanitizedTicket + "</a>"
      window.open(formURL, "_blank", "", false);
    } else {
      window.open(url + "/browse/" + sanitizedTicket, "_blank", "", false);
    }

	}); //end get sync
} //end openNewTicket

function removeElement(element_id) {
  document.getElementById(element_id).remove();
} //end hideElement

function displayDefaultTicket() {
  chrome.storage.sync.get(function(items) {
    var display = document.getElementById('displayDefaultTicket');
    if (display === null) {
      console.log("ERROR: Unable to find display ticket.");
    } else {
      // Remove unused elements and display error message
      if (items.useDefaultProject === undefined || items.useDefaultProject === null) {
        // Localize error message - Default will be English (unlikely to be used outside of en).
        display.setAttribute("data-localize", "toolbar_req_project_msg");
        display.style.color = "red";
        display.style.fontSize = "18px";
        document.getElementById("ticket").setAttribute("disabled", true);
        removeElement("default_project_text");
        removeElement("colon");
        removeElement("history_title");
        loadLocalization();
      } else {
        display.innerText = items.useDefaultProject;
      }
    }

  });
} //end displayDefaultTicket

function retrieveHistory() {
  // Set default useHistory if undefined
  chrome.storage.sync.get({"useHistory": [], "useURL": "default"}, function(items) {
    var historyStorage = items.useHistory;
    var historyList = document.getElementById("historyList");
    // Build history list
    historyStorage.forEach(function (item) {
      var li = document.createElement("li");
      var a = document.createElement("a");

      if (item.includes("Invalid ticket:")) {
        // Limit the length for invalid tickets
        if (item.length > 25) {
          a.textContent = item.substr(0, 25) + "...'";
          a.setAttribute("title", item);
          a.setAttribute("class", "invalid");
          li.appendChild(a);  
        } else {
          li.setAttribute("class", "invalid");
          li.textContent = item;
        }

      } else {
        // Only add href to valid tickets
        var formURL = items.useURL + "/browse/" + item;
        a.textContent = item;
        a.setAttribute("href", formURL);
        a.setAttribute("class", "valid");
        a.target = "_blank";
        li.appendChild(a);
      }

      if (historyList === null) {
        console.log("Missing history list. Unable to append history.");
      } else {
        historyList.appendChild(li);
      }

    }); //end foreach
  }); //end get sync
} //end retrieveHistory

function addHistory(searchString) {
    chrome.storage.sync.get({"useHistory": [], "useDefaultProject": "PL" }, function (result) {
        var useHistory = result.useHistory;

        while (useHistory.length >= 10) {
          useHistory.pop();
          chrome.storage.sync.set({useHistory: useHistory}, function () { });
        }
        // Add 1 to the top of the list
        var sanitizedTicket = sanitizeTicket(searchString);
        if (sanitizedTicket === "invalid ticket") {
          var invalidMsg = "Invalid ticket: '" + searchString + "'";
          useHistory.unshift(invalidMsg);
        } else {
          // Add default project to history
          if (isDefaultProject(sanitizedTicket)) {
            var fullProjectText = result.useDefaultProject + "-" + sanitizedTicket;
            useHistory.unshift(fullProjectText);    
          } else {
            useHistory.unshift(sanitizedTicket);    
          }

        }

        chrome.storage.sync.set({useHistory: useHistory}, function () {});      
    }); //end get sync
} //end addHistory

document.addEventListener('keydown', function(key) {
  // Keycode 13 is Enter - Reference: https://css-tricks.com/snippets/javascript/javascript-keycodes/
  if (key.keyCode === 13) {
    var userInput = document.getElementById("ticket").value;
    openNewTicket(userInput.trim(), "toolbar");
  }
});

window.addEventListener('load', function() {
  displayDefaultTicket();
  retrieveHistory();
  try {
    loadLocalization();
  } catch (e) {
    console.log("Unable to load localization. Value null");
  }
});

chrome.omnibox.onInputEntered.addListener(function (userInput) {
  openNewTicket(userInput.trim(), "omnibox");
});
