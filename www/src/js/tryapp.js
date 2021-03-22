/*global $, Babel, CodeMirror, location, console, localStorage, consoleHost */

function generateUUID() {
	var d = new Date().getTime();
	var uuid = 'xxxx-xxxx-xxxx'.replace(/[xy]/g, function (c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c === 'x' ? r : (r & 0x7) | 0x8).toString(16);
	});
	return uuid;
}

var cl,
	f = document.createElement('iframe'),
	rchannel = 'try-' + generateUUID();

var consolere = {
	channel: rchannel,
	api: consoleHost + '/connector.js?v={{consoleVersion}}',
	// options: 'enable2_redirect_default_console_methods_to_remote',
	ready: function (c) {
		var d = document,
			s = d.createElement('script'),
			l;
		s.src = this.api;
		s.id = 'consolerescript';
		s.setAttribute('data-channel', this.channel);
		if (this.options) s.setAttribute('data-options', this.options);
		s.onreadystatechange = s.onload = function () {
			if (!l) {
				c();
			}
			l = true;
		};
		d.getElementsByTagName('head')[0].appendChild(s);
	},
};

f.src = consoleHost + '/' + rchannel + '?v=' + Date.now();
f.setAttribute('channel', rchannel);
f.id = 'consoleframe';

$('#framewrap').html(f);
consolere.ready(function () {
	var init = window.location.search.substring(1);
	cl = new SM(document.getElementById('consolere'), unescape(init));
	var hash = location.hash;

	if (hash) {
		$('a[href^="' + hash + '"]').trigger('click');
	}
});

$().ready(function () {
	$(window).resize(function () {
		frameH();
	});

	var frameH = function () {
		var wh = $(window).height(),
			fh = wh - 305;
		$('#consoleframe').height(fh);
	};

	frameH();

	$('.open-new').attr('href', f.src);

	$('.rawcode').each(function () {
		var $this = $(this),
			$code = $this.val(),
			$place = $this.parent(),
			mode = 'javascript';

		if ($this.is('.html')) mode = 'application/xml';

		CodeMirror.runMode($code, mode, $place[0]);
	});

	$('.toogleLines').on('click', function (e) {
		e.preventDefault();
		var ed = cl.bottomBlock.editor;
		var lines = ed.getOption('lineNumbers');
		ed.setOption('lineNumbers', !lines);
		localStorage.setItem('es6-editor-lines', !lines);
	});

	$('.tryit a').on('click', function () {
		// ev.preventDefault();
		var c = $(this).parent().parent().find('pre').text(),
			t = $('#framewrap').offset(),
			e = cl.bottomBlock.editor;
		e.setValue('');
		$('html, body')
			.stop(true)
			.animate(
				{
					scrollTop: t.top,
				},
				1000,
				'easeOutQuart',
				function () {
					e.setValue(c);
					e.refresh();
					e.focus();
					e.setCursor(e.lineCount());
					$('.CodeMirror, #buttons, .CodeMirror-gutters').animate(
						{
							backgroundColor: '#FFFC74',
						},
						60,
						function () {
							$(this).animate(
								{
									backgroundColor: '#F1F5ED',
								},
								230
							);
						}
					);
				}
			);
	});

	$('.api-examples').on('click', function (ev) {
		ev.preventDefault();
		var t = $(this).offset();
		$('html, body').stop(true).animate(
			{
				scrollTop: t.top,
			},
			1000,
			'easeOutQuart'
		);
	});

	$('.brun').on('click', function (ev) {
		ev.preventDefault();
		cl.bottomBlock.run();
	});

	$('.history-up').on('click', function (ev) {
		ev.preventDefault();
		cl.bottomBlock.clickprev();
	});

	$('.history-down').on('click', function (ev) {
		ev.preventDefault();
		cl.bottomBlock.clicknext();
	});
});

var SM = (function () {
	function Block(previous, cnsole, txt) {
		this.cnsole = cnsole;
		this.errorLine = null;
		this.previous = previous;
		this.next = null;
		this.element = document.createElement('div');
		this.result = document.createElement('div');
		this.result.className = 'output';
		var editorDiv = document.createElement('div'),
			pointer = this,
			savedText = '';

		this.prevHistory = function () {
			if (pointer === this) {
				savedText = this.editor.getValue();
			}
			if (pointer.previous != null) {
				pointer = pointer.previous;
				if (pointer === this) {
					this.editor.setValue(savedText);
				} else {
					this.editor.setValue(pointer.editor.getValue());
				}
				this.editor.setCursor(this.editor.posFromIndex(Number.MAX_VALUE));
			}
		};

		this.nextHistory = function () {
			if (pointer === this) {
				savedText = this.editor.getValue();
			}
			if (pointer.next !== null) {
				pointer = pointer.next;
				if (pointer === this) {
					this.editor.setValue(savedText);
				} else {
					try {
						this.editor.setValue(pointer.editor.getValue());
					} catch (e) {
						console.error(e);
					}
				}
				this.editor.setCursor(this.editor.posFromIndex(Number.MAX_VALUE));
			}
		};

		this.editor = new CodeMirror(editorDiv, {
			value: txt,
			mode: 'javascript',
			lineNumbers: localStorage.getItem('es6-editor-lines') === 'true' || false,
			viewportMargin: Infinity,
			extraKeys: {
				'Ctrl-Enter': this.run.bind(this),
				'Ctrl-Up': this.prevHistory.bind(this),
				'Ctrl-Down': this.nextHistory.bind(this),
				// "Ctrl-Space": "autocomplete"
			},
		});
		this.element.appendChild(editorDiv);
	}

	Block.prototype.getElement = function () {
		return this.element;
	};

	Block.prototype.onAdded = function () {
		this.editor.refresh();
		this.editor.focus();
		this.editor.setCursor(this.editor.posFromIndex(Number.MAX_VALUE));
	};

	Block.prototype.output = function (element) {
		this.result.appendChild(element);
	};

	Block.prototype.clicknext = function () {
		this.nextHistory();
	};

	Block.prototype.clickprev = function () {
		this.prevHistory();
	};

	Block.prototype.clear = function () {
		this.result.innerHTML = '';
	};

	Block.prototype.run = function () {
		var js = this.editor.getValue().replace(/[\u200B-\u200D\uFEFF]/g, '');
		if (this.errorLine) {
			this.editor.removeLineClass(this.errorLine, 'background', 'line-error');
			this.errorLine = null;
		}
		var out;
		try {
			out = Babel.transform(js, {
				presets: ['es2015', 'stage-2'],
			}).code;
			eval(out);
			$('.CodeMirror, #buttons, .CodeMirror-gutters').animate(
				{
					backgroundColor: '#89ED55',
				},
				60,
				function () {
					$(this).animate(
						{
							backgroundColor: '#F1F5ED',
						},
						230
					);
				}
			);
			this.cnsole.onExec(out);
		} catch (e) {
			$('.CodeMirror, #buttons, .CodeMirror-gutters').animate(
				{
					backgroundColor: '#FBC2C4',
				},
				30,
				function () {
					$(this).animate(
						{
							backgroundColor: '#F1F5ED',
						},
						230
					);
				}
			);
			var err = e
				.toString()
				.replace(/unknown:?/gi, '')
				.split(/\r?\n/);
			if (e.loc && e.loc.line) {
				this.editor.addLineClass(e.loc.line - 1, 'background', 'line-error');
				this.errorLine = this.editor.getLineHandle(e.loc.line - 1);
			}
			console.re.error('[i][red]' + err[0] + '[/red][/i]');
		}
	};

	function smcode(container, txt) {
		var previousFake = null;
		// load from localstorage
		var previousHistory = localStorage.getItem('console-history');
		if (previousHistory) {
			previousHistory = JSON.parse(previousHistory);
			if (previousHistory.length > 0) {
				previousFake = makeFake(previousHistory[0]);
				for (var i = 1; i < previousHistory.length; ++i) {
					var nxtFake = makeFake(previousHistory[i], previousFake);
					previousFake.next = nxtFake;
					previousFake = nxtFake;
				}
			}
		}

		this.bottomBlock = null;
		this.outputBlock = null;
		this.container = container || document.body;
		this.log = this.log.bind(this);
		var initialCode = txt || "/* Click [RUN] or press Control+Enter to execute */\nconsole.re.log('test remote log');";
		this.addBlock(previousFake, initialCode);

		function makeFake(str, previous) {
			return {
				editor: {
					getValue: function () {
						return str;
					},
				},
				next: null,
				previous: previous,
			};
		}
	}

	smcode.prototype.renderError = function (e) {
		var stack = e.stack;
		var element = document.createElement('pre');
		element.className = 'error';
		element.textContent = stack;
		return element;
	};

	smcode.prototype.renderObject = function (obj) {
		function renderObjectPart(key, objPart) {
			var element = document.createElement('li');
			if (objPart == null || typeof objPart != 'object') {
				element.innerText = (key !== null ? key + ' : ' : '') + objPart;
				if (objPart == null) {
					element.style.color = '#999';
				}
			} else if (typeof objPart == 'object') {
				var children = null;
				var json = JSON.stringify(objPart);
				var display = json.substring(0, 30);
				if (display !== json) display = display + '...';
				element.innerText = (key !== null ? key + ' : ' : '') + display;
				element.onclick = function (evt) {
					evt.stopPropagation();
					if (children == null) {
						children = document.createElement('ul');
						for (var key in objPart) {
							children.appendChild(renderObjectPart(key, objPart[key]));
						}
						element.appendChild(children);
					} else {
						element.removeChild(children);
						children = null;
					}
				};
			}
			return element;
		}
		var el = document.createElement('ul');
		el.className = 'objectbrowser';
		el.appendChild(renderObjectPart(null, obj));
		return el;
	};

	smcode.prototype.render = function (obj) {
		var element;
		if (obj instanceof Error) {
			return this.renderError(obj);
		} else if (obj instanceof HTMLElement) {
			element = document.createElement('div');
			element.style.margin = '4px';
			element.style.display = 'inline-block';
			element.style.color = '#909';
			var txt = '<' + obj.tagName.toLowerCase();
			if (obj.id) txt += " id='" + obj.id + "'";
			if (obj.className) txt += " class='" + obj.className + '"';
			element.textContent = txt + ' >';
			var children = document.createElement('div');
			children.style.fontSize = 'small';
			children.style.paddingLeft = '20px';
			element.appendChild(children);
			var visible = false;
			children.style.display = 'none';
			children.innerText = obj.innerHTML;
			element.onclick = function () {
				visible = !visible;
				children.style.display = visible ? 'block' : 'none';
			};
			return element;
		} else if (obj == null || typeof obj != 'object') {
			element = document.createElement('div');
			element.style.margin = '4px';
			element.style.display = 'inline-block';
			element.textContent = '' + obj;
			if (obj == null) {
				element.style.color = '#999';
			}
			return element;
		} else {
			return this.renderObject(obj);
		}
	};

	smcode.prototype.log = function () {
		var line = document.createElement('div');
		line.style.position = 'relative';
		for (var i = 0; i < arguments.length; ++i) {
			line.appendChild(this.render(arguments[i]));
		}
		this.outputBlock.output(line);
	};

	smcode.prototype.setOutputBlock = function (block) {
		// this.outputBlock = block;
	};

	smcode.prototype.addBlock = function (previous, txt) {
		var block = new Block(previous, this, txt);
		if (previous != null) previous.next = block;
		this.setOutputBlock(block);
		this.bottomBlock = block;
		this.container.appendChild(block.getElement());
		block.onAdded();
		return block;
	};

	smcode.prototype.onExec = function () {
		// save everything to localstorage
		var current = this.bottomBlock;
		var previousHistory = localStorage.getItem('console-history');
		if (previousHistory) {
			previousHistory = JSON.parse(previousHistory);
		} else {
			previousHistory = [];
		}
		var val = current.editor.getValue();

		if (val !== null && val.length > 0 && previousHistory[0] !== val) {
			previousHistory.unshift(val);
			if (previousHistory.length > 20) previousHistory.pop();
			localStorage.setItem('console-history', JSON.stringify(previousHistory));
		}
	};
	return smcode;
})();

// UItoTop.jQuery
// jQuery easing extended
$.easing['jswing'] = $.easing['swing'];
$.extend($.easing, {
	def: 'easeOutQuad',
	swing: function (a, b, c, d, e) {
		return $.easing[$.easing.def](a, b, c, d, e);
	},
	easeInQuad: function (a, b, c, d, e) {
		return d * (b /= e) * b + c;
	},
	easeOutQuad: function (a, b, c, d, e) {
		return -d * (b /= e) * (b - 2) + c;
	},
	easeInOutQuad: function (a, b, c, d, e) {
		if ((b /= e / 2) < 1) return (d / 2) * b * b + c;
		return (-d / 2) * (--b * (b - 2) - 1) + c;
	},
	easeInCubic: function (a, b, c, d, e) {
		return d * (b /= e) * b * b + c;
	},
	easeOutCubic: function (a, b, c, d, e) {
		return d * ((b = b / e - 1) * b * b + 1) + c;
	},
	easeInOutCubic: function (a, b, c, d, e) {
		if ((b /= e / 2) < 1) return (d / 2) * b * b * b + c;
		return (d / 2) * ((b -= 2) * b * b + 2) + c;
	},
	easeInQuart: function (a, b, c, d, e) {
		return d * (b /= e) * b * b * b + c;
	},
	easeOutQuart: function (a, b, c, d, e) {
		return -d * ((b = b / e - 1) * b * b * b - 1) + c;
	},
	easeInOutQuart: function (a, b, c, d, e) {
		if ((b /= e / 2) < 1) return (d / 2) * b * b * b * b + c;
		return (-d / 2) * ((b -= 2) * b * b * b - 2) + c;
	},
	easeInQuint: function (a, b, c, d, e) {
		return d * (b /= e) * b * b * b * b + c;
	},
	easeOutQuint: function (a, b, c, d, e) {
		return d * ((b = b / e - 1) * b * b * b * b + 1) + c;
	},
	easeInOutQuint: function (a, b, c, d, e) {
		if ((b /= e / 2) < 1) return (d / 2) * b * b * b * b * b + c;
		return (d / 2) * ((b -= 2) * b * b * b * b + 2) + c;
	},
	easeInSine: function (a, b, c, d, e) {
		return -d * Math.cos((b / e) * (Math.PI / 2)) + d + c;
	},
});

(function (e) {
	e.fn.UItoTop = function (t) {
		var n = {
				text: 'To Top',
				min: 800,
				inDelay: 600,
				outDelay: 400,
				containerID: 'toTop',
				containerHoverID: 'toTopHover',
				scrollSpeed: 1200,
				easingType: 'linear',
			},
			r = e.extend(n, t),
			i = '#' + r.containerID,
			t = e('#framewrap').offset();
		s = '#' + r.containerHoverID;
		e('body').append('<a href="#" id="' + r.containerID + '">' + r.text + '</a>');
		e(i)
			.hide()
			.on('click.UItoTop', function () {
				e('html, body').stop(true).animate(
					{
						scrollTop: t.top,
					},
					1000,
					'easeInOutQuint'
				);
				e('#' + r.containerHoverID, this)
					.stop()
					.animate(
						{
							opacity: 0,
						},
						r.inDelay,
						r.easingType
					);
				return false;
			})
			.prepend('<span id="' + r.containerHoverID + '"></span>')
			.hover(
				function () {
					e(s, this).stop().animate(
						{
							opacity: 1,
						},
						600,
						'linear'
					);
				},
				function () {
					e(s, this).stop().animate(
						{
							opacity: 0,
						},
						700,
						'linear'
					);
				}
			);
		e(window).scroll(function () {
			var t = e(window).scrollTop(),
				n = e(window).height();
			if (t > r.min) e(i).fadeIn(r.inDelay);
			else e(i).fadeOut(r.Outdelay);
		});
	};
})($);

function ln(err) {
	var e = new Error(err);
	if (!e.stack)
		try {
			// IE requires the Error to actually be throw or else the Error's 'stack'
			// property is undefined.
			throw e;
		} catch (e) {
			if (!e.stack) {
				return 0; // IE < 10, likely
			}
		}
	var stack = e.stack.toString().split(/\r\n|\n/);
	// We want our caller's frame. It's index into |stack| depends on the
	// browser and browser version, so we need to search for the second frame:
	var frameRE = /:(\d+):(?:\d+)[^\d]*$/;
	do {
		var frame = stack.shift();
	} while (!frameRE.exec(frame) && stack.length);
	return frameRE.exec(stack.shift())[1];
}

$().UItoTop();
/*jQuery Pulse Animation Plugin*/

/*
 Color animation 1.6.0
 http://www.bitstorm.org/jquery/color-animation/
 Copyright 2011, 2013 Edwin Martin <edwin@bitstorm.org>
 Released under the MIT and GPL licenses.
*/
('use strict');
(function (d) {
	function h(a, b, e) {
		var c =
			'rgb' +
			(d.support.rgba ? 'a' : '') +
			'(' +
			parseInt(a[0] + e * (b[0] - a[0]), 10) +
			',' +
			parseInt(a[1] + e * (b[1] - a[1]), 10) +
			',' +
			parseInt(a[2] + e * (b[2] - a[2]), 10);
		d.support.rgba && (c += ',' + (a && b ? parseFloat(a[3] + e * (b[3] - a[3])) : 1));
		return c + ')';
	}

	function f(a) {
		var b;
		return (b = /#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/.exec(a))
			? [parseInt(b[1], 16), parseInt(b[2], 16), parseInt(b[3], 16), 1]
			: (b = /#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])/.exec(a))
			? [17 * parseInt(b[1], 16), 17 * parseInt(b[2], 16), 17 * parseInt(b[3], 16), 1]
			: (b = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(a))
			? [parseInt(b[1]), parseInt(b[2]), parseInt(b[3]), 1]
			: (b = /rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9\.]*)\s*\)/.exec(a))
			? [parseInt(b[1], 10), parseInt(b[2], 10), parseInt(b[3], 10), parseFloat(b[4])]
			: l[a];
	}
	d.extend(!0, d, {
		support: {
			rgba: (function () {
				var a = d('script:first'),
					b = a.css('color'),
					e = !1;
				if (/^rgba/.test(b)) e = !0;
				else
					try {
						(e = b != a.css('color', 'rgba(0, 0, 0, 0.5)').css('color')), a.css('color', b);
					} catch (c) {}
				return e;
			})(),
		},
	});
	var k = 'color backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor outlineColor'.split(
		' '
	);
	d.each(k, function (a, b) {
		d.Tween.propHooks[b] = {
			get: function (a) {
				return d(a.elem).css(b);
			},
			set: function (a) {
				var c = a.elem.style,
					g = f(d(a.elem).css(b)),
					m = f(a.end);
				a.run = function (a) {
					c[b] = h(g, m, a);
				};
			},
		};
	});
	d.Tween.propHooks.borderColor = {
		set: function (a) {
			var b = a.elem.style,
				e = [],
				c = k.slice(2, 6);
			d.each(c, function (b, c) {
				e[c] = f(d(a.elem).css(c));
			});
			var g = f(a.end);
			a.run = function (a) {
				d.each(c, function (d, c) {
					b[c] = h(e[c], g, a);
				});
			};
		},
	};
	var l = {
		aqua: [0, 255, 255, 1],
		azure: [240, 255, 255, 1],
		beige: [245, 245, 220, 1],
		black: [0, 0, 0, 1],
		blue: [0, 0, 255, 1],
		brown: [165, 42, 42, 1],
		cyan: [0, 255, 255, 1],
		darkblue: [0, 0, 139, 1],
		darkcyan: [0, 139, 139, 1],
		darkgrey: [169, 169, 169, 1],
		darkgreen: [0, 100, 0, 1],
		darkkhaki: [189, 183, 107, 1],
		darkmagenta: [139, 0, 139, 1],
		darkolivegreen: [85, 107, 47, 1],
		darkorange: [255, 140, 0, 1],
		darkorchid: [153, 50, 204, 1],
		darkred: [139, 0, 0, 1],
		darksalmon: [233, 150, 122, 1],
		darkviolet: [148, 0, 211, 1],
		fuchsia: [255, 0, 255, 1],
		gold: [255, 215, 0, 1],
		green: [0, 128, 0, 1],
		indigo: [75, 0, 130, 1],
		khaki: [240, 230, 140, 1],
		lightblue: [173, 216, 230, 1],
		lightcyan: [224, 255, 255, 1],
		lightgreen: [144, 238, 144, 1],
		lightgrey: [211, 211, 211, 1],
		lightpink: [255, 182, 193, 1],
		lightyellow: [255, 255, 224, 1],
		lime: [0, 255, 0, 1],
		magenta: [255, 0, 255, 1],
		maroon: [128, 0, 0, 1],
		navy: [0, 0, 128, 1],
		olive: [128, 128, 0, 1],
		orange: [255, 165, 0, 1],
		pink: [255, 192, 203, 1],
		purple: [128, 0, 128, 1],
		violet: [128, 0, 128, 1],
		red: [255, 0, 0, 1],
		silver: [192, 192, 192, 1],
		white: [255, 255, 255, 1],
		yellow: [255, 255, 0, 1],
		transparent: [255, 255, 255, 0],
	};
})($);
