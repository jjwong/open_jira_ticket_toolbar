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
  // JIRA tickets only takes [a-z], -, d+
  var fullTicketRegex = new RegExp('([a-z]{1,}-\\d+)', 'i');
  var semiTicketRegex = new RegExp('([a-z]{1,}\\d+)', 'i');
  var numbersOnlyRegex = new RegExp('(\\d+)', 'i');
  
  var fullTicketText = userInput.match(fullTicketRegex);

  if (fullTicketText) {
      return fullTicketText[0];
  } else if (userInput.match(semiTicketRegex)) {
    // TODO: cleanup this mess
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

function showErrorText(string) {
  document.getElementById('status').innerText = string;
  throw "invalid";
}

function openNewTicket(ticket, sourceType) {
  var ticket_uppercase = ticket.toUpperCase();

  var sanitizedTicket = sanitizeTicket(ticket_uppercase);
  // Error display should only show up at the toolbar level
  if (sanitizedTicket == "invalid ticket" && sourceType == "toolbar") {
    showErrorText("Please enter a valid ticket!");
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

function displayDefaultTicket() {
  chrome.storage.sync.get(function(items) {
    var display = document.getElementById('displayDefaultTicket');
    if (items.useDefaultProject == undefined) {
      display.innerText = "Please set your default project in Options!";
      display.style.color = "red";
      display.style.fontSize = "18px";
      document.getElementById("ticket").setAttribute("disabled", true);
    } else {
      display.innerText = "Default Project: " + items.useDefaultProject;
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

      historyList.appendChild(li);

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
        if (sanitizedTicket == "invalid ticket") {
          var invalidMsg = "Invalid ticket: " + "'" + searchString + "'";
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
}; //end addHistory

document.addEventListener('keydown', function(key) {
  // Keycode 13 is Enter - Reference: https://css-tricks.com/snippets/javascript/javascript-keycodes/
  if (key.keyCode == 13) {
    var userInput = document.getElementById("ticket").value;
    openNewTicket(userInput.trim(), "toolbar");
  }
});

window.addEventListener('load', function() {
  displayDefaultTicket();
  retrieveHistory();
});

chrome.omnibox.onInputEntered.addListener(function (userInput) {
  openNewTicket(userInput.trim(), "omnibox");
});