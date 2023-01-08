# Changelog
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