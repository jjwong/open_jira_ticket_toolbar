# Changelog
* 3.3.0
	* Add work hours feature
	* Add options scrollbar arrow
	* Fix readme
	* Reduce build size
* 3.2.1
	* Add options link display
	* Add project button customization
* 3.2.0
	* Add underscore support for projects
	* Revamp options styling
* 3.1.3
	* Fix a few undefined states, cleanup
* 3.1.2
	* Prevent bad toggle state
* 3.1.1
	* Minor fix for undefined button click
* 3.1.0
	* Add in secondary jira projects feature
	* Add in less strict filtering for projects with numbers like R2D2
	* We still don't support projects with underscore
	* Move UTC to a better spot
* 3.0.9
	* Remove tabs permission again.
	* Update timezone locations. Remove Arizona and London, replace with Sydney Australia and Los Angeles
* 3.0.8
    * Fix default project to support numbers in options
    * Add Enable History Display preference to show/hide
* 3.0.7
    * Update world clock for the inevitable DST. Use timezones instead of arbitrary offsets
* 3.0.6
	* Add Q to display
    * Add fun feature with ranks on usage
    * Add missing i18n translations
    * Minor options cleanup
* 3.0.5
	* Add simple show me what quarter of the year I'm in option
* 3.0.4
	* Refactor back to deduped code. Need an open request for fixing the pipeline
	* Minor modifications to clock. Disable persistent seconds update (was too slow imo)
	* Remove seconds indicator
* 3.0.3
	* Hotfix permission back. Need it to open toolbar with shortcut
* 3.0.2
	* Remove unnecessary tabs permission
	* Add World Clock option
	* Fix testing, minor refactor
* 3.0.1
	* Refactor and add back in omnibox support using new keyword - 'ojira', short for openjira and avoid conflict with simple search of jira in toolbar
	* Disable tests due to import/export issue, avoid duping code
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