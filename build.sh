#!/bin/bash
echo "Building project..."
#combine javascript
cat public/javascripts/tab_main.js public/javascripts/plugins.js > build/combined.js
#minify javscript
java -jar node_modules/node-minify/lib/google_closure_compiler.jar \
	--js build/combined.js --js_output_file public/javascripts/tab-min.js

#combine css
cat public/stylesheets/bptop.css public/stylesheets/1140.css public/stylesheets/tab.css public/stylesheets/bpbottom.css   > \
	build/combined.css
#minify css
java -jar node_modules/node-minify/lib/yuicompressor-2.4.6.jar \
	--type css build/combined.css -o public/stylesheets/tab-min.css

echo "Build complete."