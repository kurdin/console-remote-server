(function (e, a, g, h, f, c, b, d) {
		if(typeof window.consoleReLoaded  != 'undefined') return;
		if (!(f = e.jQuery) || g > f.fn.jquery || h(f)) {
				var head = a.head || a.getElementsByTagName("head");
				c = a.createElement("script");
				c.type = "text/javascript";
				// c.src = "http://"+consolerehost+":"+consolereport+"/static-files/console.re.libs.js";
				c.onload = c.onreadystatechange = function () {
						if (!b && (!(d = this.readyState) || d == "loaded" || d == "complete")) {
								h((f = e.jQuery).noConflict(1), b = 1);
								f(c).remove();
						}
				};
				if (window.attachEvent && !window.addEventListener) {
				// ie8 and lower
				// c.src = "http://"+consolerehost+":"+consolereport+"/static-files/console.re.libsIE8.js";
				head[0].insertBefore(c, head[0].firstChild);
				// trim and others support for IE8
				if(typeof String.prototype.trim !== 'function') {
				String.prototype.trim = function() {
						return this.replace(/^\s+|\s+$/g, ''); 
					}
				}
				if (!('indexOf' in Array.prototype)) {
						Array.prototype.indexOf= function(find, i ) {
								if (i===undefined) i= 0;
								if (i<0) i+= this.length;
								if (i<0) i= 0;
								for (var n= this.length; i<n; i++)
										if (i in this && this[i]===find)
												return i;
								return -1;
						};
				}
				if (!('lastIndexOf' in Array.prototype)) {
						Array.prototype.lastIndexOf= function(find, i ) {
								if (i===undefined) i= this.length-1;
								if (i<0) i+= this.length;
								if (i>this.length-1) i= this.length-1;
								for (i++; i-->0;) 
										if (i in this && this[i]===find)
												return i;
								return -1;
						};
				}
				if (!('forEach' in Array.prototype)) {
						Array.prototype.forEach= function(action, that) {
								for (var i= 0, n= this.length; i<n; i++)
										if (i in this)
												action.call(that, this[i], i, this);
						};
				}
				} else {
				head.insertBefore(c, head.firstChild);
				}
		}
})(window, document, "2.0.3", function ($, L) {

	
(function (a) {

	var headers = { "Etag": 1, "Last-Modified": 1, "Content-Length": 1, "Content-Type": 1 },
			resources = {},
			pendingRequests = {},
			currentLinkElements = {},
			oldLinkElements = {},
			interval = 1000,
			loaded = false,
			active = { "html": 1, "css": 1, "js": 1 };

	a.support.cors = true;        

	var Live = {

		// performs a cycle per interval
		heartbeat: function () {
			if (document.body) {        
				// make sure all resources are loaded on first activation
				if (!loaded) Live.loadresources();
				Live.checkForChanges();
			}
			setTimeout(Live.heartbeat, interval);
		},

		// loads all local css and js resources upon first activation
		loadresources: function () {

			// helper method to assert if a given url is local
			function isLocal(url) {
				var loc = document.location,
						reg = new RegExp("^\\.|^\/(?!\/)|^[\\w]((?!://).)*$|" + loc.protocol + "//" + loc.hostname);
				return url.match(reg);
			}

			// gather all resources
			var scripts = document.getElementsByTagName("script"),
					links = document.getElementsByTagName("link"),
					uris = [];

			// track local js urls
			for (var i = 0; i < scripts.length; i++) {
				var script = scripts[i], src = script.getAttribute("src");
				if (src && isLocal(src))
					uris.push(src);
				if (src && src.match(/\bconsole.re.js#/)) {
					for (var type in active)
						active[type] = src.match("[#,|]" + type) != null
				}
			}
			if (!active.js) uris = [];
			if (active.html) uris.push(document.location.href);

			// track local css urls
			for (var i = 0; i < links.length && active.css; i++) {
				var link = links[i], rel = link.getAttribute("rel"), href = link.getAttribute("href", 2);
				if (href && rel && rel.match(new RegExp("stylesheet", "i")) && isLocal(href)) {
					uris.push(href);
					currentLinkElements[href] = link;
				}
			}

			// initialize the resources info
			for (var i = 0; i < uris.length; i++) {
				var url = uris[i];
				Live.getHead(url, function (url, info) {
					resources[url] = info;
				});
			}

			// add rule for morphing between old and new css files
			var head = document.getElementsByTagName("head")[0],
					style = document.createElement("style"),
					rule = "transition: all .3s ease-out;"
			css = [".livejs-loading * { ", rule, " -webkit-", rule, "-moz-", rule, "-o-", rule, "}"].join('');
			style.setAttribute("type", "text/css");
			head.appendChild(style);
			style.styleSheet ? style.styleSheet.cssText = css : style.appendChild(document.createTextNode(css));

			// yep
			loaded = true;
		},

		// check all tracking resources for changes
		checkForChanges: function () {

			for (var url in resources) {
				if (pendingRequests[url])
					continue;

				Live.getHead(url, function (url, newInfo) {
					var oldInfo = resources[url],
					hasChanged = false;
					resources[url] = newInfo;
					for (var header in oldInfo) {
						// do verification based on the header type
						var oldValue = oldInfo[header],
								newValue = newInfo[header],
								contentType = newInfo["Content-Type"];
						switch (header.toLowerCase()) {
							case "etag":
								if (!newValue) break;
								// fall through to default
							default:
								hasChanged = oldValue != newValue;
								break;
						}
						// if changed, act
						if (hasChanged) {
							Live.refreshResource(url, contentType);
							break;
						}
					}
				});
			}
		},

		// act upon a changed url of certain content type
		refreshResource: function (url, type) {
			if (type === null) return;
			switch (type.toLowerCase()) {
				// css files can be reloaded dynamically by replacing the link element                               
				case "text/css":
					var link = currentLinkElements[url],
							html = document.body.parentNode,
							head = link.parentNode,
							next = link.nextSibling,
							newLink = document.createElement("link");

					html.className = html.className.replace(/\s*livejs\-loading/gi, '') + ' livejs-loading';
					newLink.setAttribute("type", "text/css");
					newLink.setAttribute("rel", "stylesheet");
					newLink.setAttribute("href", url + "?now=" + new Date() * 1);
					next ? head.insertBefore(newLink, next) : head.appendChild(newLink);
					currentLinkElements[url] = newLink;
					oldLinkElements[url] = link;

					// schedule removal of the old link
					Live.removeoldLinkElements();
					break;

				// check if an html resource is our current url, then reload                               
				case "text/html":
					if (url != document.location.href)
						return;

					// local javascript changes cause a reload as well
				case "text/javascript":
				case "application/javascript":
				case "application/x-javascript":
				document.location.reload();
			}
		},

		// removes the old stylesheet rules only once the new one has finished loading
		removeoldLinkElements: function () {
			var pending = 0;
			for (var url in oldLinkElements) {
			$(currentLinkElements[url]).on('load', function () {
						$(oldLinkElements[url]).remove();
						delete oldLinkElements[url];
						setTimeout(function () {
							$('html').removeClass('livejs-loading');
						}, 100);
			});

			}

		},

		// performs a HEAD request and passes the header info to the given callback
		getHead: function (url, callback) {
		pendingRequests[url] = true;
		a.ajax({
				type: "HEAD",
				cache: false,
				async: true,
				url: url,
				error: function() {
					delete pendingRequests[url];
					// var info = {'Etag': null, 'Last-Modified': null, 'Content-Length': null, 'Content-Type': null};
					// callback(url,info);
				},
				success: function(message,text,xhr){
					delete pendingRequests[url];
					if (xhr.readyState == 4 && xhr.status != 304) {
					xhr.getAllResponseHeaders();
					var info = {};
					for (var h in headers) {
						var value = xhr.getResponseHeader(h);
						// adjust the simple Etag variant to match on its significant part
						if (h.toLowerCase() == "etag" && value) value = value.replace(/^W\//, '');
						if (h.toLowerCase() == "content-type" && value) value = value.replace(/^(.*?);.*?$/i, "$1");
						info[h] = value;
					}
					callback(url, info);
				}
			 }
				
		});
		}
	};

	// start listening
	if (document.location.protocol != "file:") {
		if (!window.liveJsLoaded)
			Live.heartbeat();

		window.liveJsLoaded = true;
	}
	else if (window.console)
		console.log("Live Reload doesn't support the file protocol. It needs http.");    
})($);
});