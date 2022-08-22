# Demo app with electronJs, how to implement

1.	Insert CSP - Content Security Policy meta tag into index.html.
	* **why?** - electronJs needs it for the securty, avoiding xss attacking.
	e.g:
	```Html 
	<meta http-equiv="Content-Security-Policy"
        content="default-src 'self';
              script-src 'self' ;
              style-src 'self' 'unsafe-inline';"/>
	
	<meta http-equiv="X-Content-Security-Policy"
        content="default-src 'self'; script-src 'self'; style-src 'self';"/>
	```
	
2.	Install electronJs via 'npm', add it into devDependecies.
	 * `npm install --save-dev electron@latest`
	 
3. 	Creating a window by the electronJs.
	* create a new file: src/electronJs/app.js (path is up to you)
	* copy the window example code from here:
	[in electron app.js]
	
	* set up 'startedPage' current path in the code!
		* It has to be the path of the index.html, which is located under the built version!
		* You can find the prod built version in dist folder or check it at 
			'option/outputPath' folder in the _'angular.json'_
		* at line 15: 
			`const startedPage = './dist/angularProject/index.html';`
			
4. 	Modify the script running in the package.json.
	* **Firstly**, we need production built version of the angular app, because it shorted version of your app, electronJs is enough to display it like as the browser.
		* Set up the _'base-href'_ attribute for the build. Deafult path will be the root: ./
		* The base href attribute: is used to set the base URL that will be used for the relative links in the document.
		
	* **Secondly**, adjust the path of the started app.js for the electron where to start building your app.
		* command: `electron app.js`
		* default started name is 'main': `electron .` if there is _'main.js'_ file.
		
	* **Thirdly**, adjust start script: 
		* running built version of your angular app
		* running electron script with _app.js_ (which created it in "third step")
		
		```json 
		"scripts": {
			"ng": "ng",
			// && sign run more command script
			"start": "npm run build && electron ./src/electronJs/app.js", 
			// creation a prod build from the angular app. 
			"build": "ng build --base-href ./", 
			...
		},
		```
		
5.	Running the 'start' script.
	* command: `npm run start`
	
	* If you get this error: **"Not allowed to load local resource: [file path]"**
		* attaching the path of the /dist/project/index.html is **wrong**.
		
	* If you use "angular-material" library
		* in the _'index.html'_ - the built version under dist folder - the inlinse style attached: `<style>` tag.
			* **The CSP rules in the electronJs does NOT allow it!**
		* **Solution:** in angular.json
			* Go to "configuration"/"prodcution"
			* Put this optimization setting:
			```json
			"optimization": {
                "scripts": true,
                "styles": {
                  "minify": true,
                  "inlineCritical": false
                }
            }
			```
		* **Result:** The inline style wont be attached anymore in index.html!
		
	