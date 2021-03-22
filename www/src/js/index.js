/*global $*/

/**
 * Main JS file for Casper behaviours
 */

var $first = $('.post.first'),
	$last = $('.post.last'),
	$fnav = $('.fixed-nav'),
	$postholder = $('.post-holder'),
	$postafter = $('.post-after'),
	$sitehead = $('#site-head');

/*globals jQuery, document */
(function ($) {
	'use strict';

	function srcTo(el) {
		var t = el.offset().top;
		if ($(window).width() < 600) t = t - 30;
		$('html, body').stop(true).animate(
			{
				scrollTop: t,
			},
			1000,
			'easeOutQuart'
		);
	}

	$(document).ready(function () {
		$('input.channel')
			.val('')
			.bind('autotyped', function () {
				$('.go, .random').addClass('okey');
			})
			.autotype('your-project-name', {
				delay: 125,
			})
			.on('focus', function () {
				$(this).select();
			})
			.mouseup(function (e) {
				e.preventDefault();
			})
			.on('keypress', function (e) {
				if (e.keyCode === 13) channelNameChange();
			});

		$('a.random').on('click', function (e) {
			e.preventDefault();
			channelNameChange('random');
		});

		$('button.go').on('click', function () {
			channelNameChange();
		});

		$postholder.each(function (e) {
			if (e % 2 !== 0)
				$(this).css({
					background: '#1C2629',
					color: '#C9C8C8',
				});
		});

		$postafter.each(function (e) {
			var bg = $(this).parent().css('background-color');
			$(this).css('color', bg);

			if (e % 2 === 0) $(this).css('left', '3em');
		});

		$('a.goto').click(function () {
			var id = $(this).attr('href'),
				s = $(id);
			srcTo(s);
		});

		$('.btn.last').click(function () {
			srcTo($last);
		});
		$('#header-arrow, .ipad-bottom').click(function () {
			srcTo($first);
		});

		$('.post-title').each(function () {
			var t = $(this).text().trim().replace(/\s/g, '-').replace(/\'/g, '').toLowerCase();
			var h = $(this).html();
			$fnav.append("<a class='fn-item' item='" + t + "'>" + h + '</a>');

			$('.fn-item').click(function () {
				var i = $(this).attr('item');
				var s = $(".post[item='" + i + "']");

				var scrollTo = s.length ? s : $(".post-title[item='" + i + "']");

				if (scrollTo.length) {
					srcTo(scrollTo);
				}
			});
		});

		$last.next('.post-after').hide();
		$(window).scroll(function () {
			var w = $(window).scrollTop(),
				g = $sitehead.offset().top,
				h = $sitehead.offset().top + $(this).height() - 100;

			if ((w >= g && w <= h) || w < 100) {
				$('.fixed-nav').fadeOut('fast');
			} else {
				if ($(window).width() > 500) $('.fixed-nav').fadeIn('fast');
			}

			if (w + $(window).height() > $(document).height() - 100) {
				var f = $('.fn-item', '.fixed-nav');
				f.removeClass('active');
				f.last().addClass('active');
				$('.post-after.prelast').fadeOut();
			} else {
				var $postSections = $('.post, [item]');
				$postSections.each(function () {
					var f = $(this).offset().top - 50;
					var b = $(this).offset().top + $(this).height();
					var t = $(this)
						.find('.post-title')
						.first()
						.text()
						.trim()
						.replace(/\s/g, '-')
						.replace(/\'/g, '')
						.toLowerCase();

					if (!t) {
						t = $(this).attr('item');
					}

					var i = $(".fn-item[item='" + t + "']");
					var a = $(this).parent('.post-holder').prev('.post-holder').find('.post-after');

					if (!$(this).attr('item')) {
						$(this).attr('item', t);
					}

					if (w >= f && w <= b) {
						i.addClass('active');
						a.fadeOut('slow');
					} else {
						i.removeClass('active');
						a.fadeIn('slow');
					}
				});
			}
		});
		// $('li').before('<span class="bult icon-asterisk"></span>')
		// $('blockquote p').prepend('<span class="quo icon-quote-left"></span>')
		//     .append('<span class="quo icon-quote-right"></span>')
	});

	function generateUUID() {
		var d = new Date().getTime();
		var uuid = 'xxxx-xxxx-xxxx'.replace(/[xy]/g, function (c) {
			var r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			return (c === 'x' ? r : (r & 0x7) | 0x8).toString(16);
		});
		return uuid;
	}

	function channelNameChange(r) {
		if (r) {
			$('input.channel').val(generateUUID());
		} else {
			var c = decodeChannelName('input.channel');
			if (c && c !== 'your-project-name') {
				$('.chprefix').slideUp('slow', function () {
					$('#site-head-content').fadeOut('fast');
				});
				$('.chpmessage')
					.find('b')
					.text(c)
					.end()
					.slideDown('slow', function () {
						$('.bsupport, .social-wrap').fadeOut();
						$('.ipad-bottom, #site-head-content').addClass('remove');
						setTimeout(function () {
							window.location.href = '/' + c;
						}, 400);
					});
			} else {
				$('.chperror').slideDown('slow');
				$('input.channel').focus();
			}
		}
	}

	function decodeChannelName(el) {
		return decodeURIComponent(
			$(el)
				.val()
				.replace(/^\/|\/$/g, '')
		).replace(/\b +\b/g, '-');
	}

	function openChannelName() {
		var $p = $('.chprefix > span', '#dialog-channel');
		if (!$p.is('.open')) {
			$('input.channel', '#dialog-channel')
				.val(consoleRe.channel)
				.on('keypress', function (e) {
					if (e.keyCode == 13) channelNameChange();
				})
				.on('change paste keyup', function () {
					var c = decodeChannelName(this),
						$b = $('button.go');
					if (c && c !== consoleRe.channel) {
						$b.addClass('okey');
					} else {
						$b.removeClass('okey');
					}
				});
			$p.addClass('open').text(consoleRe.prot + '//' + consoleRe.host + '/');
		} else {
			if (decodeChannelName('input.channel') !== consoleRe.channel)
				$('input.channel', '#dialog-channel').val(consoleRe.channel);
		}
	}

	$('.zoom-d').on('click', '.footer-tabs a', function (e) {
		e.preventDefault();
		var p = $(this).parent(),
			c = p.next('.tab-content'),
			h = $(this).data('href'),
			that = this;
		$('.active', p).removeClass('active');
		$(this).addClass('active');
		if ($('.' + h, c).is(':visible')) return;
		$('[class^=tab]', c).each(function () {
			if ($(this).is(':visible') && !$(this).hasClass(h)) {
				$(this).slideToggle();
			}
		});
		$('.' + h, c).slideToggle('slow', function () {
			if (!$('.' + h, c).is(':visible')) {
				$(that).removeClass('active');
			}
		});
	});

	$('#contactbugs, #contactserver, #contactfeedback').submit(function () {
		var f = $(this),
			url = f.attr('action'),
			data = f.serialize(),
			b = f.find('button');

		if (b.hasClass('disabled')) return false;
		b.addClass('disabled');
		$('.returntarget', f).slideUp(300, function () {
			send();
		});

		function displayMessage(data) {
			$('.error', f).removeClass('error');
			$('.returntarget', f).html(data).slideDown();
			b.removeClass('disabled');
		}

		function send() {
			$.ajax({
				type: 'POST',
				url: url,
				data: data, // serializes the form's elements.
				success: function (data) {
					displayMessage(data);
				},
				error: function () {
					displayMessage('<p>Connection Error, please try again</p>');
				},
			});
		}

		return false;
	});

	$('.rawcode').each(function () {
		var $this = $(this),
			$code = $this.val(),
			$place = $this.parent(),
			mode = 'javascript';

		if ($this.is('.html')) mode = 'application/xml';

		CodeMirror.runMode($code, mode, $place[0]);
	});

	$('.example-switch a').on('click', function (e) {
		e.preventDefault();
		$(this).parent().next().slideToggle();
	});

	// $('#screenshots a').iLightBox({
	//     skin: 'smooth'
	// });

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
					min: 1200,
					inDelay: 600,
					outDelay: 400,
					containerID: 'toTop',
					containerHoverID: 'toTopHover',
					scrollSpeed: 1200,
					easingType: 'linear',
				},
				r = e.extend(n, t),
				i = '#' + r.containerID,
				s = '#' + r.containerHoverID;
			e('body').append('<a href="#" id="' + r.containerID + '">' + r.text + '</a>');
			e(i)
				.hide()
				.on('click.UItoTop', function () {
					e('html, body').stop(true).animate(
						{
							scrollTop: 0,
						},
						500,
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

	$().UItoTop();

	/*jQuery Pulse Animation Plugin*/
})(jQuery);

/**
 * jQuery.autotype - Simple, accurate, typing simulation for jQuery
 *
 * version 0.5.0
 *
 * http://michaelmonteleone.net/projects/autotype
 * http://github.com/mmonteleone/jquery.autotype
 *
 * Copyright (c) 2009 Michael Monteleone
 * Licensed under terms of the MIT License (README.markdown)
 */
(function ($) {
	// code type constants
	var CHARACTER = 1,
		NON_CHARACTER = 2,
		MODIFIER_BEGIN = 3,
		MODIFIER_END = 4,
		isNullOrEmpty = function (val) {
			return val === null || val.length === 0;
		},
		isUpper = function (char) {
			return char.toUpperCase() === char;
		},
		isLower = function (char) {
			return char.toLowerCase() === char;
		},
		areDifferentlyCased = function (char1, char2) {
			return (isUpper(char1) && isLower(char2)) || (isLower(char1) && isUpper(char2));
		},
		convertCase = function (char) {
			return isUpper(char) ? char.toLowerCase() : char.toUpperCase();
		},
		parseCodes = function (value, codeMap) {
			// buffer to hold a collection of key/char code pairs corresponding to input string value
			var codes = [],
				// buffer to hold the name of a control key as it's being parsed
				definingControlKey = false,
				// hold a collection of currently pushed modifier keys
				activeModifiers = {
					alt: false,
					meta: false,
					shift: false,
					ctrl: false,
				},
				explicitModifiers = $.extend({}, activeModifiers),
				// buffer to hold construction of current control key
				currentControlKey = '',
				previousChar = '',
				pushCode = function (opts) {
					codes.push($.extend({}, opts, activeModifiers));
				},
				pushModifierBeginCode = function (modifierName) {
					activeModifiers[modifierName] = true;
					pushCode({
						keyCode: codeMap[modifierName],
						charCode: 0,
						char: '',
						type: MODIFIER_BEGIN,
					});
				},
				pushModifierEndCode = function (modifierName) {
					activeModifiers[modifierName] = false;
					pushCode({
						keyCode: codeMap[modifierName],
						charCode: 0,
						char: '',
						type: MODIFIER_END,
					});
				};

			for (var i = 0; i < value.length; i++) {
				// if the character is about to define a control key
				if (!definingControlKey && i <= value.length - 5 && value.charAt(i) === '{' && value.charAt(i + 1) === '{') {
					// skip the next "{"
					i++;

					definingControlKey = true;
				}
				// if the character is about to end definition of control key
				else if (
					definingControlKey &&
					i <= value.length - 2 &&
					value.charAt(i) === '}' &&
					value.charAt(i + 1) === '}'
				) {
					// skip the next "}"
					i++;

					// check if this key is a modifier-opener (is a ctrl,alt,del,shift)
					if (activeModifiers[currentControlKey] !== undefined) {
						explicitModifiers[currentControlKey] = true;
						pushModifierBeginCode(currentControlKey);
					}
					// check if this key is a modifier-closer (is a /ctrl,/alt,/del,.shift)
					else if (activeModifiers[currentControlKey.substring(1)] !== undefined) {
						explicitModifiers[currentControlKey] = false;
						pushModifierEndCode(currentControlKey.substring(1));
					}
					// otherwise is some other kind of non-modifier control key
					else {
						pushCode({
							keyCode: codeMap[currentControlKey],
							charCode: 0,
							char: '',
							type: NON_CHARACTER,
							controlKeyName: currentControlKey,
						});
					}

					definingControlKey = false;
					currentControlKey = '';
				}
				// currently defining control key
				else if (definingControlKey) {
					currentControlKey += value.charAt(i);
				}
				// otherwise is just a text character
				else {
					var character = value.charAt(i);

					// check for any implicitly changing of cases, and register presses/releases
					// of the shift key in accord with them.
					if (
						(!isNullOrEmpty(previousChar) && areDifferentlyCased(previousChar, character)) ||
						(isNullOrEmpty(previousChar) && isUpper(character))
					) {
						if (isUpper(character) && !activeModifiers.shift) {
							pushModifierBeginCode('shift');
						} else if (isLower(character) && activeModifiers.shift && !explicitModifiers.shift) {
							pushModifierEndCode('shift');
						}
					}

					// modify the current character if there are active modifiers
					if ((activeModifiers.shift && isLower(character)) || (!activeModifiers.shift && isUpper(character))) {
						// shift converts case
						character = convertCase(character);
					}

					var code = {
						// if can't identify a keycode, just fudge with the char code.
						// nope, this isn't ideal by any means.
						keyCode: codeMap[character] || character.charCodeAt(0),
						charCode: character.charCodeAt(0),
						char: character,
						type: CHARACTER,
					};

					// modify the current character if there are active modifiers
					if (activeModifiers.alt || activeModifiers.ctrl || activeModifiers.meta) {
						// alt, ctrl, meta make it so nothing is typed
						code.char = '';
					}
					pushCode(code);
					if (code.char !== '') {
						previousChar = code.char;
					}
				}
			}
			return codes;
		},
		triggerCodeOnField = function (code, field) {
			// build up base content that every event should contain
			// with information about whether certain chord keys are
			// simulated as being pressed
			var evnt = {
				altKey: code.alt,
				metaKey: code.meta,
				shiftKey: code.shift,
				ctrlKey: code.ctrl,
			};

			// build out 3 event instances for all the steps of a key entry
			var keyDownEvent = $.extend($.Event(), evnt, {
				type: 'keydown',
				keyCode: code.keyCode,
				charCode: 0,
				which: code.keyCode,
			});
			var keyPressEvent = $.extend($.Event(), evnt, {
				type: 'keypress',
				keyCode: 0,
				charCode: code.charCode,
				which: code.charCode || code.keyCode,
			});
			var keyUpEvent = $.extend($.Event(), evnt, {
				type: 'keyup',
				keyCode: code.keyCode,
				charCode: 0,
				which: code.keyCode,
			});

			// go ahead and trigger the first 2 (down and press)
			// a keyup of a modifier shouldn't also re-trigger a keydown
			if (code.type !== MODIFIER_END) {
				field.trigger(keyDownEvent);
			}

			// modifier keys don't have a keypress event, only down or up
			if (code.type !== MODIFIER_BEGIN && code.type !== MODIFIER_END) {
				field.trigger(keyPressEvent);
			}

			// only actually add the new character to the input if the keydown or keypress events
			// weren't cancelled by any consuming event handlers
			if (!keyDownEvent.isPropagationStopped() && !keyPressEvent.isPropagationStopped()) {
				if (code.type === NON_CHARACTER) {
					switch (code.controlKeyName) {
						case 'enter':
							field.val(field.val() + '\n');
							break;
						case 'back':
							field.val(field.val().substring(0, field.val().length - 1));
							break;
					}
				} else {
					field.val(field.val() + code.char);
				}
			}

			// then also trigger the 3rd event (up)
			// a keydown of a modifier shouldn't also trigger a keyup until coded
			if (code.type !== MODIFIER_BEGIN) {
				field.trigger(keyUpEvent);
			}
		},
		triggerCodesOnField = function (codes, field, delay, global) {
			if (delay > 0) {
				codes = codes.reverse();
				var keyInterval = global.setInterval(function () {
					var code = codes.pop();
					triggerCodeOnField(code, field);
					if (codes.length === 0) {
						global.clearInterval(keyInterval);
						field.trigger('autotyped');
					}
				}, delay);
			} else {
				$.each(codes, function () {
					triggerCodeOnField(this, field);
				});
				field.trigger('autotyped');
			}
		};

	$.fn.autotype = function (value, options) {
		if (value === undefined || value === null) {
			throw 'Value is required by jQuery.autotype plugin';
		}
		var settings = $.extend({}, $.fn.autotype.defaults, options);

		// 1st Pass
		// step through the input string and convert it into
		// a logical sequence of steps, key, and charcodes to apply to the inputs
		var codes = parseCodes(value, settings.keyCodes[settings.keyBoard]);

		// 2nd Pass
		// Run the translated codes against each input through a realistic
		// and cancelable series of key down/press/up events
		return this.each(function () {
			triggerCodesOnField(codes, $(this), settings.delay, settings.global);
		});
	};

	$.fn.autotype.defaults = {
		version: '0.5.0',
		keyBoard: 'enUs',
		delay: 0,
		global: window,
		keyCodes: {
			enUs: {
				back: 8,
				ins: 45,
				del: 46,
				enter: 13,
				shift: 16,
				ctrl: 17,
				meta: 224,
				alt: 18,
				pause: 19,
				caps: 20,
				esc: 27,
				pgup: 33,
				pgdn: 34,
				end: 35,
				home: 36,
				left: 37,
				up: 38,
				right: 39,
				down: 40,
				printscr: 44,
				num0: 96,
				num1: 97,
				num2: 98,
				num3: 99,
				num4: 100,
				num5: 101,
				num6: 102,
				num7: 103,
				num8: 104,
				num9: 105,
				multiply: 106,
				add: 107,
				subtract: 109,
				decimal: 110,
				divide: 111,
				f1: 112,
				f2: 113,
				f3: 114,
				f4: 115,
				f5: 116,
				f6: 117,
				f7: 118,
				f8: 119,
				f9: 120,
				f10: 121,
				f11: 122,
				f12: 123,
				numlock: 144,
				scrolllock: 145,
				'   ': 9,
				' ': 32,
				tab: 9,
				space: 32,
				'0': 48,
				'1': 49,
				'2': 50,
				'3': 51,
				'4': 52,
				'5': 53,
				'6': 54,
				'7': 55,
				'8': 56,
				'9': 57,
				')': 48,
				'!': 49,
				'@': 50,
				'#': 51,
				$: 52,
				'%': 53,
				'^': 54,
				'&': 55,
				'*': 56,
				'(': 57,
				';': 186,
				'=': 187,
				',': 188,
				'-': 189,
				'.': 190,
				'/': 191,
				'[': 219,
				'\\': 220,
				']': 221,
				"'": 222,
				':': 186,
				'+': 187,
				'<': 188,
				_: 189,
				'>': 190,
				'?': 191,
				'{': 219,
				'|': 220,
				'}': 221,
				'"': 222,
				a: 65,
				b: 66,
				c: 67,
				d: 68,
				e: 69,
				f: 70,
				g: 71,
				h: 72,
				i: 73,
				j: 74,
				k: 75,
				l: 76,
				m: 77,
				n: 78,
				o: 79,
				p: 80,
				q: 81,
				r: 82,
				s: 83,
				t: 84,
				u: 85,
				v: 86,
				w: 87,
				x: 88,
				y: 89,
				z: 90,
				A: 65,
				B: 66,
				C: 67,
				D: 68,
				E: 69,
				F: 70,
				G: 71,
				H: 72,
				I: 73,
				J: 74,
				K: 75,
				L: 76,
				M: 77,
				N: 78,
				O: 79,
				P: 80,
				Q: 81,
				R: 82,
				S: 83,
				T: 84,
				U: 85,
				V: 86,
				W: 87,
				X: 88,
				Y: 89,
				Z: 90,
			},
		},
	};
})(jQuery);
