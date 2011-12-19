
# DebateTab2

A reboot of the DebateTab project

This project contains the client and server code. It's based on express ejs boilerplate

## Conceptual Integrity
Goals for this implementation:

* Modularize everything in order to minimize the amount of code in each file. This is a rule of thumb, but it makes editing much simpler.

## Tabulation

Big front end project that can operate without connectivity. Uses backbone as a framework.

### Build System
A build script combines all the javascript and css files, then minifies them. Note that the routes in server.js are different for development and production. In development, each file is included in the view one-by-one. In production, only the minified files are included.

* Edit CSS in tab.css. Don't mess with other files. They are all compiled into tab-min.css.
* Edit HTML in tab.ejs. It is currently not touched by the build script.
* Edit javascript in tab_main.js or other tab_* files. These are compiled into tab-min.js.
* When developing there is no need to run the build script. You only need to run it if you want to create code for production.


## Registration

This is coming later.

