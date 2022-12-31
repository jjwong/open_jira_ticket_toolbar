# Open JIRA Ticket Extension
[![Code Climate](https://codeclimate.com/github/jjwong/open_jira_ticket_toolbar/badges/gpa.svg)](https://codeclimate.com/github/jjwong/open_jira_ticket_toolbar)
[![Issue Count](https://codeclimate.com/github/jjwong/open_jira_ticket_toolbar/badges/issue_count.svg)](https://codeclimate.com/github/jjwong/open_jira_ticket_toolbar)

# Download Extension
[![Open Jira Ticket @Chrome Web Store](https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/mPGKYBIR2uCP0ApchDXE.png "Open Jira Ticket @Chrome Web Store")](https://chrome.google.com/webstore/detail/open-jira-ticket/blblhnpjhhjdbgbcgmmldohpalmbedci?hl=en-US)

# Description
Simple Chrome extension that will allow a user to search for JIRA tickets via the provided toolbar.

# Testing
This repository uses the standalone Jasmine installation to load up specs. You can re-run them manually to see results when viewing `/js/jasmine/SpecRunner.html`

You can view the coverage summary in the command line when you run `npm run coverage`.
For more information, you can view the the full report under the `coverage/Chrome Headless (version **)/loc-report` directory and search for `index.html`.

All pushes to the master branch will sync the coverage data to code climate.

# Changelog
* 3.0.1
	* Refactor and add back in omnibox support using new keyword - 'ojira', short for openjira and avoid conflict with simple search of jira in toolbar
* 3.0.0
	* Upgrade to manifest v3
	* Remove travis and codecov
	* Move from qunit to jasmine and update unit tests
	* Remove jquery implementation of i18n
	* Remove favorites feature
	* Disable omnibox support (unable to get it to work in v3 yet)
	* Add keyboard support for history navigation
	* Add chrome i18n
	* Add Japanese, Korean and Chinese language support (all google translated, apologies if errors. Feel free to submit a PR for bad language translations)
	* Simplify, update and remove cruft
* 2.0
	* Add top 5 favorites feature
* 1.1
	* Add localization for English, Spanish, French, German and Russian
* 1.0
	* Full release of Chrome Extension.
		* Default Project
		* Selectable History
		* Omnibox support
		* Keyboard shortcut support
		* Cleaner look
* 0.2
	* Beta release
		* Core functionality testing

# Donate
[![Buy Me a Coffee at ko-fi.com](https://storage.ko-fi.com/cdn/kofi1.png?v=3 "Buy Me a Coffee at ko-fi.com")](https://ko-fi.com/A0A3H3GR7)