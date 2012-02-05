#!/bin/bash
echo "Building project..."
#combine javascript
#same order as inclusion in server.js
cat public/javascripts/jquery.tmpl.js \
	public/javascripts/jquery-ui-1.8.17.custom.min.js \
	public/javascripts/bootstrap.js \
	public/javascripts/socket.io.js \
	public/javascripts/underscore.js \
	public/javascripts/backbone.js \
	public/javascripts/plugins.js \
	public/javascripts/tab_main.js \
	public/javascripts/tab_collections.js \
	public/javascripts/tab_pairing.js \
	public/javascripts/tab_views.js \
	public/javascripts/tab_ui.js \
	public/javascripts/tab_forms.js \
	> build/combined.js

#minify javscript
java -jar node_modules/node-minify/lib/google_closure_compiler.jar \
	--js build/combined.js --js_output_file public/javascripts/tab-min.js

#combine css
cat public/stylesheets/bptop.css \
	public/stylesheets/tab.css \
	public/stylesheets/bpbottom.css \
	public/stylesheets/bootstrap.css \
	public/jquery-ui-1.8.17.custom.css \
	> build/combined.css
#minify css
java -jar node_modules/node-minify/lib/yuicompressor-2.4.6.jar \
	--type css build/combined.css -o public/stylesheets/tab-min.css

echo "Build complete."