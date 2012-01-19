This is a very simple widget to demonstrate how MVC works with localization.
This widget is a copy of MVCsample widget that is extended to support Localization
Please refere to readme file in MVCsample for further information about the widget regarding MVC.

Translation issues:
----------------------
- The static strings in index.html and the strings that will be appended into DOM later on MUST be all in English
- the language is read from config file
- if language is set on English, nothing actually happens
- if language is set on something other than English the translated strings are fetched via an XHR to the client
- the translated strings must be in a lang.[language_code] file in JSON format under folder "locale" (see locale/lang.de)
- in View.init() the static strings that already exist in DOM are translated.
- in further proccessing in View where ever a string must be appended to DOM the translation must be taken instead (use private function __() in View).
- in index.html the static strings must be wrapped in a <span> with an attribute "lang" set to "en":
e.g. <span lang="en">My String</span>


In comparison with MVCsample widget:
- The View is modified as functions are needed in View for translations of strings in DOM
- The Controller is modified to fetch language strings from language file on the server
- The MVC.Helper.ServerAPI is modified to make the retrieve of language strings possible
- Translations are saved in View and not in Model because of performance issues (this is the only exception):
- Translation data is needed very often in View (actually for each string).

In config.xml you can change the default_value for lang to test the localization.
You can easily extend the localization to other languages too:
- create another language file under folder "locale" with the corresponding extension (e.g. lang.fr for French)
- translate the strings in the language file
- add the preference option in the config file for the new language
- That's it! :-) 