# Open JIRA Ticket Extension
[![Code Climate](https://codeclimate.com/github/jjwong/open_jira_ticket_toolbar/badges/gpa.svg)](https://codeclimate.com/github/jjwong/open_jira_ticket_toolbar)
[![Issue Count](https://codeclimate.com/github/jjwong/open_jira_ticket_toolbar/badges/issue_count.svg)](https://codeclimate.com/github/jjwong/open_jira_ticket_toolbar)

# Download Extension
[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Open%20JIRA%20Ticket-blue?logo=google-chrome&logoColor=white)](https://chrome.google.com/webstore/detail/open-jira-ticket/blblhnpjhhjdbgbcgmmldohpalmbedci?hl=en-US)

[![Open Jira Ticket @Edge Store](https://get.microsoft.com/images/en-us%20dark.svg "Open Jira Ticket @Edge Store")](https://microsoftedge.microsoft.com/addons/detail/open-jira-ticket/mcgalgcbedknfbohhhnngnbofngoifkm)

# Description
Simple Chrome extension that will allow a user to search for JIRA tickets via the provided toolbar. Toggle between JIRA instances and review your previously searched tickets.

## Bonus Features
* Supports 2 JIRA projects or instances
* Enable World Map display in toolbar
* Enable Fiscal Quarter Calendar display in toolbar

# Testing
This repository uses the standalone Jasmine installation to load up specs. You can re-run them manually to see results when viewing `/js/jasmine/SpecRunner.html`

* Issue with exporting files, so you'll need to comment export out and remove module type to run locally.

You can view the coverage summary in the command line when you run `npm run coverage`.
For more information, you can view the the full report under the `coverage/Chrome Headless (version **)/loc-report` directory and search for `index.html`.

All pushes to the master branch will sync the coverage data to code climate.

# Changelog
See [CHANGELOG.md](CHANGELOG.md)

# Donate
[![Buy Me a Coffee at ko-fi.com](https://storage.ko-fi.com/cdn/kofi1.png?v=3 "Buy Me a Coffee at ko-fi.com")](https://ko-fi.com/A0A3H3GR7)