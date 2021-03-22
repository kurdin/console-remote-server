/* globals $, Element, consoleRe, navigator, io, confirm, hljs */
// localStorage.debug='*'; enable debug

var log_number = 0,
	$sessionid,
	_timerResize,
	newLines = 0,
	connected = false,
	first_data = false,
	$body = $('body'),
	$clogs = $('#clogs'),
	console_user_config = {},
	hidded_view = [],
	entityMap = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;',
		'/': '&#x2F;',
	},
	default_config = {
		show_tips: true,
		browser_view: consoleRe.minUI ? 0 : 4,
		location_view: consoleRe.minUI ? 0 : 3,
		fontsize: 100,
		fontface: 1,
		autoClear: consoleRe.minUI ? false : true,
		reverse_output: consoleRe.reverseOutput ? true : false,
		time_view: consoleRe.minUI ? 1 : 4,
		display_view: consoleRe.minUI ? 0 : 2,
		auto_objects: consoleRe.minUI ? 15 : 5,
		auto_arrays: consoleRe.minUI ? 15 : 5,
	};
Element.prototype.prependChild = function (child) {
	this.insertBefore(child, this.firstChild);
};
var consoleServer = '{{consoleServer}}';
var storage = $.localStorage,
	channel = consoleRe.channel,
	has_touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0 ? true : false;
if (channel === 'new' || !channel) {
	window.location.href = '/' + generateUUID();
} else {
	window.document.title = '[' + channel + '] - Console.Re';
}
if (storage.isSet('console_user_config')) {
	console_user_config = storage.get('console_user_config');
}
var console_config = $.extend(true, {}, default_config, console_user_config),
	chead = document.getElementById('cheader'),
	clogs = document.getElementById('clogs');
chead.innerHTML =
	"<span class='cname'>Console.Re</span><span class='cinfo'>" +
	(consoleRe.minUI ? '' : 'channel ') +
	"[<b class='hints hint--right changechannel' data-hints='Channel Settings'>" +
	channel +
	"</b>]<span class='icons small connect'><a href='#' class='server hints hint--right' data-hints='Connecting to server'>&#0108;</a><a href='#dialog-connect' class='client hints hint--right popup-zoom' data-hints='Waiting for log data'>&#0036;</a></span><span id='newLines'></span></span>";
resetUIConfig(console_config);
if (has_touch) {
	console_config.show_tips = false;
	$('html').removeClass('no_touch');
}
$('.autoMark').on('click', function (e) {
	e.preventDefault();
	if ($(this).is('.active')) {
		$(this).removeClass('active').text('[A]');
		setConfig('autoMark', false);
	} else {
		$(this).addClass('active').text('[AUTO]');
		setConfig('autoMark', true);
	}
	return false;
});
$('.autoClear').on('click', function (e) {
	e.preventDefault();
	if ($(this).is('.active')) {
		setConfig('autoClear', false);
		$(this).removeClass('active').text('[A]');
	} else {
		$(this).addClass('active').text('[AUTO]');
		setConfig('autoClear', true);
	}
	return false;
});
$('.helpbox').on('mouseenter mouseleave click', function (e) {
	if (has_touch && e.type !== 'click') return false;
	if (e.type === 'mouseleave') {
		$('.langdropwrap').stop().hide(200);
		$(this).removeClass('active');
		return false;
	}
	if ($(this).is('.active')) {
		$('.langdropwrap').stop().hide(200);
		$(this).removeClass('active');
	} else {
		$('.langdropwrap').stop().show(200);
		$(this).addClass('active');
	}
	return false;
});
$clogs
	.on('click', '.timeagowrap, .timewrap', function () {
		swapSettings('time_view', 1, 4, false, true);
	})
	.on('click', '.levels', function (e) {
		if (!has_touch) return false;
		e.stopPropagation();
		$('.levels.active').removeClass('active');
		$(this).addClass('active');
		return false;
	})
	.on('click', '.reconnect', function (e) {
		e.preventDefault();
		if (connected) {
			clearAndTest();
		} else {
			socket.socket.connect();
		}
	})
	.on('mouseenter mouseleave click', '.inlineobj, .preclose', function (e) {
		var id = $(this).attr('data-oid');
		if (e.type === 'click') {
			$('pre', '#' + id).slideToggle();
		} else if (e.type === 'mouseenter') {
			$('#' + id)
				.find('pre')
				.transitStop()
				.transition({
					outline: '1px solid #999',
				});
			$(this).transitStop().transition({
				opacity: '1',
			});
		} else {
			$('#' + id)
				.find('pre')
				.css({
					outline: '1px solid #2E2E2E',
				});
			$(this).css('opacity', '0.5');
		}
	})
	.on('mouseenter mouseleave', '.prewrap', function (e) {
		var id = $(this).attr('id');
		if (e.type === 'mouseenter') {
			$('pre', this).transitStop().transition({
				outline: '1px solid #999',
			});
			$('span[data-oid="' + id + '"]')
				.transitStop()
				.transition({
					opacity: '1',
				});
		} else {
			$('pre', this).css({
				outline: '1px solid #2E2E2E',
			});
			$('span[data-oid="' + id + '"]').css('opacity', '0.5');
		}
	})
	.on('click', '.oclose', function () {
		$(this).parent().slideUp();
	})
	.on('click', '.browser', function () {
		swapSettings('browser_view', 1, 4, false, true);
	})
	.on('click', '.caller', function () {
		swapSettings('location_view', 1, 3, false, true);
	})
	.on('click', '.level', function () {
		swapSettings('display_view', 1, 2, false, true);
		$('.tlshrt', this).removeAttr('data-hint');
	})
	.hoverIntent(
		function () {
			if (!console_config.show_tips) return;
			var t = $(this),
				d = t.next().text();
			if (t.is('.timeago')) {
				d =
					'[' +
					t.prev().find('.logline').text() +
					'] ' +
					t.prev().find('.day').text() +
					' ' +
					t.prev().find('.time').text();
			}
			t.attr('data-hint', d);
		},
		function () {
			if (!console_config.show_tips) return;
			$(this).removeAttr('data-hint');
		},
		'.timeorg, .timeago'
	);
$('.cheaderwrap').on('click', function (e) {
	e.stopPropagation();
	if ($(e.target).is('#clear-log, #clear-log b')) {
		clearLogs();
	} else if ($(e.target).is('#mark-log, #mark-log b')) {
		Mark();
		scrollLogsTop();
	} else if ($(e.target).is('#fonts')) {
		fontFace();
	} else if ($(e.target).is('.server')) {
		e.preventDefault();
		if (connected) {
			clearAndTest();
		} else {
			socket.socket.connect();
		}
	} else if ($(e.target).is('#test-connection,#test-connection b')) {
		clearAndTest(false, true);
		scrollLogsTop();
	} else if ($(e.target).is('.changechannel')) {
		$.magnificPopup.open({
			items: {
				src: $('#dialog-channel'),
			},
			type: 'inline',
			callbacks: {
				beforeOpen: function () {
					openChannelName();
				},
			},
			fixedContentPos: false,
			fixedBgPos: true,
			overflowY: 'auto',
			closeBtnInside: true,
			preloader: false,
			midClick: true,
			removalDelay: 300,
			mainClass: 'my-mfp-zoom-in',
		});
	} else {
		scrollLogsTop();
	}
});
$body
	.hoverIntent(
		function () {
			if (!console_config.show_tips) return;
			var t = $(this),
				d = t.attr('data-hints');
			if ($.trim(d)) t.attr('data-hint', d).removeClass('hint--hide');
		},
		function () {
			if (!console_config.show_tips) return;
			$(this).removeAttr('data-hint');
		},
		'.hints'
	)
	.on('click', function (e) {
		if (has_touch) $('.levels.active').removeClass('active');
	});
$('.cmdbuttons').transition(
	{
		opacity: 1,
	},
	300
);

var socket = io(consoleServer, {
	withCredentials: false,
	extraHeaders: {
		'x-consolere': 'true',
	},
	reconnectionDelay: 500,
	reconnectionDelayMax: 'Infinity',
});

socket.on('connect', function () {
	socket.emit('channel', channel);
	$sessionid = socket.io.engine.id;
	onConnect();
});
socket.on('disconnect', function () {
	setTimeout(onDisconnect, 500);
});
socket.on('toConsoleRe', function (data) {
	if (data.command === 'automark') {
		if (console_config.autoMark) Mark('AUTO ');
		return;
	} else if (data.command === 'autoclear') {
		if (console_config.autoClear) clearLogs('cmd');
		return;
	} else if (data.command === 'clear') {
		clearLogs('cmd');
		return;
	} else if (data.command === 'mark') {
		var marker = data.args && data.args[0] ? data.args[0] : '';
		Mark(marker);
		return;
	}
	Logger(data);
});

function scrollLogsTop() {
	if (console_config.reverse_output) {
		$('html, body')
			.stop(true)
			.animate(
				{
					scrollTop: $('#cend').offset().top,
				},
				500,
				'easeInOutQuint'
			);
	} else {
		$('html, body').stop(true).animate(
			{
				scrollTop: 0,
			},
			500,
			'easeInOutQuint'
		);
	}
	newLinesInfo(true);
}

function isObjArr(data) {
	return $.type(data) === 'object' || $.type(data) === 'array';
}

function Logger(data) {
	var p = createPElement(),
		now = getDateNow(),
		autoOpenArray = console_config.auto_arrays,
		autoOpenObjects = console_config.auto_objects,
		time_long = getDateLong(),
		time = 'moment ago',
		argt = data.args.length,
		data_out = [],
		has_html = false,
		pclose,
		pfx_close,
		log_short,
		log_location;
	log_number++;

	if (data.caller.col > 0) data.caller.col = ':' + data.caller.col;
	if (data.caller.line > 0) {
		log_location = ['L', data.caller.line, data.caller.col].join('');
		log_short = 'L' + data.caller.line;
	} else {
		log_short = log_location = '-';
	}
	if (!data.command) {
		if (!first_data) {
			gotClientData(true);
			first_data = true;
		}
		for (var i = 0; i < argt; i++) {
			var next = '',
				obid,
				submatch = [],
				nexobj,
				otype,
				ntype,
				len = 0,
				ohide = true;
			otype = getType(data.args[i]);
			obid = generateElementUID();
			if (
				data.args[i] === true ||
				data.args[i] === false ||
				data.args[i] === 'null' ||
				data.args[i] === '___undefined___' ||
				data.args[i] === 0
			) {
				data_out.push(getTypeWrap(otype, data.args[i]));
				continue;
			}
			try {
				data.args[i] = JSON.parse(data.args[i]);
				if (isObjArr(data.args[i])) {
					len = Object.keys(data.args[i]).length;
					if ($.type(data.args[i]) === 'object') {
						if (len <= autoOpenObjects) ohide = false;
					} else if (len <= autoOpenArray) ohide = false;
				}
			} catch (e) {
				void 0;
			}
			if (typeof data.args[i] === 'object') {
				try {
					if (data.args[i].element) {
						pfx_close = '&lt<b>-</b>&gt';
						pclose =
							'&lt;<span class="preclose" data-oid="' + obid + '">' + data.args[i].element + ' Element</span>&gt';
						if (data.args[i].html) {
							data.args[i] = htmlEntities(style_html(data.args[i].html));
							data_out.push(pclose + htmlStringSyntaxHighlight(data.args[i], pfx_close, obid, ohide));
							has_html = true;
						} else {
							data.args[i] = JSON.stringify(data.args[i], undefined, 4);
							data_out.push(pclose + jsonStringSyntaxHighlight(data.args[i], pfx_close, obid, ohide));
						}
						continue;
					}
				} catch (e) {
					void 0;
				}
				if ($.isArray(data.args[i])) {
					len = data.args[i].length;
					pfx_close = '[<b>-</b>]';
					pclose =
						'<span class="preclose" data-oid="' + obid + '">Array</span><span class="aolen">[' + len + ']</span>';
					try {
						if (data.args[i][0].element) {
							pclose =
								'<span class="preclose" data-oid="' +
								obid +
								'">Array Elements</span><span class="aolen">[' +
								len +
								']</span>';
							for (var ei = 0, strg; ei < data.args[i].length; ei++) {
								strg = data.args[i][ei].html;
								data.args[i][ei].html = strg
									.replace(/\"|\\'/g, "'")
									.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '')
									.replace(/\s+/g, ' ');
							}
						}
					} catch (e) {
						void 0;
					}
				} else {
					len = Object.keys(data.args[i]).length;
					pfx_close = '{<b>-</b>}';
					pclose =
						'<span class="preclose" data-oid="' + obid + '">Object</span><span class="aolen">{' + len + '}</span>';
				}
				data.args[i] = JSON.stringify(data.args[i], undefined, 4);
				// FIX ME: temp solution move it configuration var
				if (data.level === 'media') ohide = false;
				data_out.push(pclose + jsonStringSyntaxHighlight(data.args[i], pfx_close, obid, ohide));
			} else if (data.args[i]) {
				data.args[i] = htmlEntities(data.args[i]);
				submatch = data.args[i].match(/%[s|d]/gi);
				if (submatch) {
					for (var s = 1; s < submatch.length + 1; s++) {
						if (i + s > argt) break;
						try {
							nexobj = JSON.parse(data.args[i + s]);
							if (isObjArr(nexobj)) {
								len = Object.keys(nexobj).length;
								if ($.type(nexobj) === 'object') {
									if (len <= autoOpenObjects) ohide = false;
								} else if (len <= autoOpenArray) ohide = false;
							}
						} catch (e) {
							nexobj = '';
						}
						if (typeof nexobj === 'object') {
							obid = generateElementUID();
							if ($.isArray(nexobj)) {
								len = nexobj.length;
								pfx_close = '[<b>-</b>]';
								next =
									'<span class="inlineobj" data-oid="' +
									obid +
									'">Array</span><span class="aolen">[' +
									len +
									']</span>';
								try {
									if (nexobj[0].element) {
										for (var ei2 = 0, strg2; ei2 < nexobj.length; ei2++) {
											strg2 = nexobj[ei2].html;
											nexobj[ei2].html = strg2
												.replace(/\"|\\'/g, "'")
												.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '')
												.replace(/\s+/g, ' ');
											next =
												'<span class="inlineobj" data-oid="' +
												obid +
												'">Array Elements</span><span class="aolen">[' +
												len +
												']</span>';
										}
									}
								} catch (e) {
									void 0;
								}
							} else {
								len = Object.keys(nexobj).length;
								pfx_close = '{<b>-</b>}';
								next =
									'<span class="inlineobj" data-oid="' +
									obid +
									'">Object</span><span class="aolen">{' +
									len +
									'}</span>';
							}
							var nexobjEl = nexobj;
							nexobj = JSON.stringify(nexobj, undefined, 4);
							next = next + jsonStringSyntaxHighlight(nexobj, pfx_close, obid, ohide);
							try {
								if (nexobjEl.element) {
									pfx_close = '&lt<b>-</b>&gt';
									next =
										'&lt;<span class="preclose" data-oid="' + obid + '">' + nexobjEl.element + ' Element</span>&gt';
									nexobj = htmlEntities(style_html(nexobjEl.html));
									next = next + htmlStringSyntaxHighlight(nexobj, pfx_close, obid, true);
									has_html = true;
								}
							} catch (e) {}
						} else {
							ntype = getType(data.args[i + s]);
							if (/%d/i.test(submatch[s - 1]) && ntype !== 'number') {
								next = getTypeWrap('error', '[NaN]');
							} else {
								next = getTypeWrap(getType(data.args[i + s]), data.args[i + s]);
							}
						}
						data.args[i + s] = '';
						data.args[i] = data.args[i].replace(submatch[s - 1], next);
					}
					data_out.push(data.args[i]);
				} else {
					data_out.push(getTypeWrap(otype, data.args[i]));
				}
			}
		}
	} else {
		//special command like ping
		if (data.command === 'ping') {
			var tping = '';
			if (data.sid === $sessionid) {
				var ptimenow = new Date().getTime();
				tping = ' - ping ' + (ptimenow - data.stime) + 'ms';
			}
			data_out.push('Connected' + tping);
		} else if (data.command === 'disconnected') {
			data_out.push(
				'<span class="error">Disconnected from server <a href="#" class="icons small reconnect hints hint--bottom" data-hints="Reconnect">&#172;</a></span>'
			);
		}
	}
	p.innerHTML =
		'<span class="levels level-' +
		data.level +
		'">' +
		'<span class="timewrap"><i class="tclosure">[</i><span class="timeorg hint--bottom--right">' +
		time_long +
		'<span class="logline">' +
		log_number +
		'</span></span><span class="timeago hint--bottom--right" data-livestamp="' +
		now +
		'">' +
		time +
		'</span><i class="tclosure">]</i></span>' +
		'<span class="browser hints hint--bottom--right" data-hints="' +
		data.browser.browser.f +
		' ' +
		data.browser.version +
		' (' +
		data.browser.OS +
		')"><span class="brnamesrt">' +
		data.browser.browser.s +
		'</span><span class="brname">' +
		data.browser.browser.f +
		'</span><span class="brver">' +
		data.browser.version +
		'</span><span class="bros">(' +
		data.browser.OS +
		')</span></span>' +
		'<span class="caller"><span class="lsrt hints hint--bottom--right" data-hints="' +
		escapeHtml(data.caller.file) +
		' ' +
		log_location +
		'">' +
		log_short +
		'</span><span class="file">' +
		escapeHtml(data.caller.file) +
		'</span>' +
		'<span class="line">' +
		log_location +
		'</span></span>' +
		'<span class="level">[<span class="tlshrt hints hint--bottom--right" data-hints="[' +
		data.level.toUpperCase() +
		']">' +
		data.level.charAt(0).toUpperCase() +
		'</span><span class="tlevel">' +
		data.level.toUpperCase() +
		'</span>]</span>' +
		'<span class="args">' +
		data_out.join('<span class="varjoin">,</span>') +
		'<span class="last"></span></span></span>';
	if (has_html) {
		$('pre.html', p).each(function (i, e) {
			hljs.highlightBlock(e);
		});
	}
	var cmd = data.command === 'ping' ? 'cmd' : null;
	fadeInLog(p, 1, cmd);
}

function gotClientData(f) {
	$('.server').hide();
	$('.client').show();
	if (f) {
		$('.client')
			.pulse('destroy')
			.transition({
				color: '#B7B7B7',
			})
			.attr('data-hints', 'Receiving log data');
		$body.addClass('received');
	}
}

function onConnect() {
	connected = true;
	$('.server')
		.transition({
			color: '',
		})
		.pulse(
			{
				opacity: 1,
			},
			{
				duration: 1000,
				pulses: 1,
			},
			function () {
				$body.addClass('connected');
				$(this)
					.pulse('destroy')
					.fadeOut(300, function () {
						gotClientData();
						if (!first_data) {
							$('.client')
								.css({
									opacity: 0,
								})
								.pulse(
									{
										opacity: 1,
									},
									{
										returnDelay: 3000,
										duration: 1000,
										pulses: -1,
									}
								);
						}
					});
			}
		);
	clearAndTest();
}

function onDisconnect() {
	$('.client')
		.pulse('destroy')
		.css({
			color: '',
		})
		.attr('data-hints', 'Waiting for log data')
		.hide();
	first_data = connected = false;
	Logger({
		command: 'disconnected',
		sid: $sessionid,
		stime: new Date().getTime(),
		level: 'info',
		browser: browser,
		args: [''],
		caller: {
			file: 'Console.Re Logger',
			line: 0,
			col: 0,
		},
	});
	$('.server')
		.show()
		.pulse(
			{
				opacity: 0,
			},
			{
				duration: 1000,
				pulses: -1,
			}
		)
		.transition({
			color: '#CE2828',
		});
}

function generateElementUID() {
	return Math.floor(Math.random() * 999) + '' + new Date().getTime();
}

function escapeHtml(string) {
	string = string.split(/[?#]/)[0];
	return String(string).replace(/[&<>"'\/]/g, function (s) {
		return entityMap[s];
	});
}

function getType(t) {
	var type = typeof t;
	if (type === 'boolean' && t !== true) {
		type = 'boolean false';
	}
	return type;
}

function getTypeWrap(t, s) {
	if (s === 'null') return '<span class="null">' + s + '</span>';
	if (s === '___undefined___') return '<span class="null">' + 'undefined' + '</span>';
	if (t !== 'string' && t !== 'number' && t.indexOf('boolean') !== 0 && t !== 'error') {
		t = 'unknown';
	}
	return '<span class="' + t + '">' + s + '</span>';
}

function createPElement() {
	var p = document.createElement('p');
	if (console_config.reverse_output) {
		clogs.appendChild(p);
	} else {
		clogs.prependChild(p);
	}
	return p;
}

function fadeInLog(p, op, cmd) {
	var o = op || 1;
	var scrollTop = $(window).scrollTop();
	$(p).transition(
		{
			opacity: o,
			delay: 100,
		},
		400,
		'',
		function () {}
	);

	if (console_config.reverse_output) {
		// fix this please
		// console.log('$(document).height()', $(window).scrollTop() + $(window).height() > $(document).height() - 100);

		// console.log($(window).scrollTop() + $(window).innerHeight());
		// console.log($('#clogs')[0].scrollHeight);
		// console.log($('#clogs')[0].scrollHeight - $('#clogs').scrollTop() === $('#clogs').outerHeight());

		// if($('#clogs')[0].scrollHeight - $('#clogs').scrollTop() != $('#clogs').outerHeight()) {
		// // if($(window).scrollTop() + $(window).height() > $(document).height() - 200) {
		// 	if (cmd !== 'cmd') newLinesInfo();
		// 	return;
		// }

		// newLinesInfo(true);

		$('html, body')
			.stop(true)
			.animate({
				scrollTop: $('#cend').offset().top,
			});
	} else {
		if (scrollTop > 60) {
			if (cmd !== 'cmd') newLinesInfo();
			return;
		}
		newLinesInfo(true);
		$('html, body').stop(true).animate({
			scrollTop: 0,
		});
	}
}

function newLinesInfo(clear) {
	if (clear === true) {
		newLines = 0;
		$('#newLines').text('');
		return;
	}
	newLines++;
	$('.ripple').addClass('ractive');
	setTimeout(function () {
		$('.ripple').removeClass('ractive');
		$('#newLines').html('<b>' + newLines + '</b> new logs');
	}, 10);
}

function clearLogs(cmd) {
	log_number = 0;
	if (cmd === 'cmd') {
		$('#clogs > p').remove();
	} else {
		$('#clogs > p').fadeOut('300', function () {
			$(this).remove();
		});
	}
}

function getDateLong() {
	var d = new Date(),
		s = (d.getSeconds() < 10 ? '0' : '') + d.getSeconds(),
		m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
	return (
		'<span class="day">' +
		d.getDate() +
		'/' +
		d.getMonth() +
		'</span><span class="time">' +
		d.getHours() +
		':' +
		m +
		':' +
		s +
		'</span>'
	);
}

function getDateNow() {
	var dn = +new Date();
	return Math.floor(dn / 1000);
}

function changeSetting(s, op) {
	if (op === 'increase') {
		if (s === 'fontsize') {
			fontsSize();
		} else if (s === 'fontface') {
			fontFace();
		} else if (s === 'time_view' || s === 'browser_view') {
			swapSettings(s, 0, 4, true);
		} else if (s === 'location_view') {
			swapSettings(s, 0, 3, true);
		} else if (s === 'display_view') {
			swapSettings(s, 0, 2, true);
		}
		if (s === 'auto_objects' || s === 'auto_arrays') {
			swapSettings(s, 0, 99, true);
		}
	} else if (op === 'decrease') {
		if (s === 'fontsize') fontsSize(console_config.fontsize - 10);
		if (s === 'fontface') fontFace(console_config.fontface - 1);
		if (s === 'time_view' || s === 'browser_view') {
			swapSettings(s, 0, 4);
		} else if (s === 'location_view') {
			swapSettings(s, 0, 3);
		} else if (s === 'display_view') {
			swapSettings(s, 0, 2);
		} else if (s === 'auto_objects' || s === 'auto_arrays') {
			swapSettings(s, 0, 99);
		}
	} else if (op === 'reset') {
		if (s === 'fontsize') setConfig('fontsize', 100);
		if (s === 'fontface') setConfig('fontface', 1);
	} else if (op === 'hide') {
		var v = console_config[s];
		if (v > 0) {
			setConfig(s, 0);
			hidded_view[s] = v;
		} else {
			if (hidded_view[s]) {
				setConfig(s, hidded_view[s]);
			} else {
				setConfig(s, default_config[s]);
			}
		}
	}
}

function fontsSize(s) {
	var max = 170,
		min = 60,
		ns;
	if (s < min) {
		ns = min;
	} else if (s >= min && s <= max) {
		ns = s;
	} else {
		s = console_config.fontsize || 100;
		if (s >= max) s = max - 10;
		ns = s + 10;
	}
	setConfig('fontsize', ns);
}

function fontFace(f) {
	var max = 5,
		nf;
	if (f >= 0) {
		if (f === 0) {
			nf = 1;
		} else {
			nf = f;
		}
	} else {
		f = console_config.fontface || 0;
		if (f >= max) {
			nf = max;
		} else {
			nf = f + 1;
		}
	}
	console_config.fontface = nf;
	setConfig('fontface', nf);
}

function swapSettings(key, min, max, plus, loop) {
	var b = console_config[key],
		nb;
	if (plus) {
		nb = b + 1;
	} else {
		nb = b - 1;
	}
	if (nb < min) {
		if (loop) {
			nb = max;
		} else {
			nb = min;
		}
	} else if (nb > max) {
		if (loop) {
			nb = min;
		} else {
			nb = max;
		}
	}
	setConfig(key, nb);
}

function setConfig(setting, value) {
	if (typeof value === 'object') {
		if (!console_config[setting]) console_config[setting] = value;
		$.extend(console_config[setting], value);
	} else {
		console_config[setting] = value;
	}
	try {
		storage.set('console_user_config', console_config);
	} catch (e) {
		alert("Can't save Console.Re user settings to browser local storage. " + e);
	}
	changeUIConfig(setting);
}

function clearUserConfig() {
	storage.remove('console_user_config');
	console_config = $.extend(true, {}, default_config);
	resetUIConfig(console_config);
}

function rendrUIChanges(t, r, a, c) {
	$clogs.removeClass(r).addClass(a);
	setUIText(t, c);
}

function setUIText(text, wrapper) {
	$('.val', wrapper).text(text);
	if (text === 0) {
		$(wrapper).addClass('hide');
	} else {
		$(wrapper).removeClass('hide');
	}
}

function changeUIConfig(s) {
	if (!s) return;
	var b, t, r, a;
	if (s === 'fontface') {
		$body
			.removeClass(function (i, css) {
				return (css.match(/\bfontface\S+/g) || []).join(' ');
			})
			.addClass('fontface' + console_config.fontface);
		$('.val', '.fface').text(console_config.fontface);
	} else if (s === 'fontsize') {
		$clogs.transitStop().transition({
			'font-size': console_config.fontsize + '%',
		});
		$('.val', '.fsize').text(console_config.fontsize + '%');
	} else if (s === 'time_view') {
		t = console_config.time_view;
		if (t === 4) {
			$clogs.addClass('dtimeago').removeClass('dtimeorg');
		} else {
			$clogs.addClass('dtimeorg').removeClass('dtimeago');
		}
		if (t === 3) {
			r = 'dtimeline';
			a = 'dtimeday dtimemin';
		} else if (t === 2) {
			r = 'dtimeline dtimeday';
			a = 'dtimemin';
		} else if (t === 1) {
			r = 'dtimeday dtimemin';
			a = 'dtimeline';
		}
		if (t === 0) {
			r = 'dtimeline dtimeday dtimemin';
			a = 'htimewrap';
			hidded_view[s] = 1;
		} else {
			r = r + ' htimewrap';
		}
		rendrUIChanges(t, r, a, '.fformatn');
	} else if (s === 'browser_view') {
		b = console_config.browser_view;
		if (b === 4) {
			r = 'dbrnamesrt';
			a = 'dbros dbrver dbrname';
		} else if (b === 3) {
			r = 'dbrnamesrt dbros';
			a = 'dbrver dbrname';
		} else if (b === 2) {
			r = 'dbrnamesrt dbros dbrver';
			a = 'dbrname';
		} else if (b === 1) {
			r = 'dbrname dbros dbrver';
			a = 'dbrnamesrt';
		}
		if (b === 0) {
			r = 'dbros dbrver dbrname dbrnamesrt';
			a = 'hbrowser';
			hidded_view[s] = 1;
		} else {
			r = r + ' hbrowser';
		}
		rendrUIChanges(b, r, a, '.fformatbr');
	} else if (s === 'location_view') {
		b = console_config.location_view;
		if (b === 3) {
			r = 'dlsrt';
			a = 'dfile dline';
		} else if (b === 2) {
			r = 'dlsrt dline';
			a = 'dfile';
		} else if (b === 1) {
			r = 'dfile dline';
			a = 'dlsrt';
		}
		if (b === 0) {
			r = 'dfile dline dlsrt';
			a = 'hlocation';
			hidded_view[s] = 1;
		} else {
			r = r + ' hlocation';
		}
		rendrUIChanges(b, r, a, '.fformatcl');
	} else if (s === 'auto_objects') {
		b = console_config[s];
		setUIText(b, '.fformatao');
	} else if (s === 'auto_arrays') {
		b = console_config[s];
		setUIText(b, '.fformataa');
	} else if (s === 'display_view') {
		b = console_config.display_view;
		if (b === 2) {
			r = 'hlevel';
			a = '';
		} else if (b === 1) {
			r = '';
			a = 'hlevel';
		}
		if (b === 0) {
			r = 'hlevel';
			a = 'halevel';
			hidded_view[s] = 1;
		} else {
			r = r + ' halevel';
		}
		rendrUIChanges(b, r, a, '.fformatlb');
	} else if (s === 'autoClear' && console_config.autoClear) {
		$('.autoClear').text('[AUTO]').addClass('active');
	} else if (s === 'autoMark' && console_config.autoMark) {
		$('.autoMark').text('[AUTO]').addClass('active');
	} else if (s === 'reverse_output') {
		if (console_config.reverse_output) {
			$('html').addClass('reverse');
			$('html, body')
				.stop(true)
				.animate(
					{
						scrollTop: $('#cend').offset().top,
					},
					500
				);
		} else {
			$('html').removeClass('reverse');
			$('html, body').stop(true).animate(
				{
					scrollTop: 0,
				},
				500
			);
		}
		marginBody();
	}
}

function resetUIConfig(config) {
	$.each(config, function (key) {
		changeUIConfig(key);
	});
}

function Mark(marker) {
	var m = typeof marker == 'string' && marker !== '' ? marker + ' ' : '';
	var marked = false,
		child = 'first-child';
	if (console_config.reverse_output) child = 'last-child';
	if ($clogs.find('p:' + child).is('.marked')) marked = true;
	var p = createPElement(),
		now = getDateNow(),
		time_long = getDateLong(),
		time = 'moment ago';
	p.className = 'marked';
	if (!marked) {
		log_number++;
		p.innerHTML =
			'<span class="levels level-mark">' +
			'<span class="mlines"><span class="hide320">-------------------------</span>-----</span> [' +
			m +
			'MARKED <span class="timewrap"><span class="timeorg hint--top"><span class="logline">on ' +
			log_number +
			'</span>' +
			time_long +
			'</span><span class="timeago hint--top" data-livestamp="' +
			now +
			'">' +
			time +
			'</span>]</span><span class="mlines"> ----<span class="hide320">---------------------------</span></span></span>';
	} else {
		p.innerHTML = '<span class="levels level-mark">&zwnj;</span>';
	}
	fadeInLog(p, 0.5, 'cmd');
}

function clearAndTest(clear, ping) {
	var sid = '';
	if (clear) clogs.innerHTML = '';
	if (ping) sid = $sessionid;
	if (socket) {
		socket.emit('toServerRe', {
			command: 'ping',
			sid: sid,
			stime: new Date().getTime(),
			channel: channel,
			loopback: true,
			level: 'info',
			browser: browser,
			args: ['Connected'],
			caller: {
				file: 'Console.Re Logger',
				line: 0,
				col: 0,
			},
		});
	}
}

function htmlEntities(str) {
	var s = String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
		p = XBBCODE.process({
			text: s,
		});
	if (!p.error) return p.html;
	return s;
}

function htmlStringSyntaxHighlight(html, pfx_close, oid, ohide) {
	var oidcode = 'id = "' + oid + '"',
		hide = '';
	if (ohide) {
		hide = 'hideit';
	}
	return (
		'<span class="prewrap" ' +
		oidcode +
		'><pre class="html ' +
		hide +
		'"><span class="oclose">' +
		pfx_close +
		'</span>' +
		html +
		'</pre></span>'
	);
}

function jsonStringSyntaxHighlight(json, pfx_close, oid, ohide) {
	var oidcode = 'id = "' + oid + '"',
		hide = '';
	if (ohide) {
		hide = 'class="hideit"';
	}
	// FIX ME: set it as an option
	// hide = 'class="hideit"';
	json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	return (
		'<span class="prewrap" ' +
		oidcode +
		'><pre ' +
		hide +
		'><span class="oclose">' +
		pfx_close +
		'</span>' +
		json.replace(
			/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null|___undefined___)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
			function (match) {
				var p = XBBCODE.process({
					text: match,
				});
				if (!p.error) match = p.html;
				var cls = 'number';

				if (/"___undefined___"/.test(match)) {
					cls = 'null';
					match = 'undefined';
				} else if (/^"/.test(match)) {
					if (/:$/.test(match)) {
						cls = 'key';
					} else {
						cls = 'string';
					}
				} else if (/true|false/.test(match)) {
					cls = 'boolean';
				} else if (/null/.test(match)) {
					cls = 'null';
				}
				return '<span class="' + cls + '">' + match + '</span>';
			}
		) +
		'</pre></span>'
	);
}

function marginBody() {
	/* firefox android position fixed workaround */
	if (/Android/i.test(navigator.userAgent) && /Firefox/i.test(navigator.userAgent)) {
		$body.css('min-height', $(window).height());
	}
	/* \ firefox android position fixed workaround */
	clearTimeout(_timerResize);
	_timerResize = setTimeout(function () {
		var hh = $('.cheaderwrap').height(),
			m = hh + 'px 10px 15px 10px';
		if (console_config.reverse_output) m = '15px 10px ' + hh + 'px 10px';
		$body.css('margin', m);
	}, 100);
}

function shorten(url, callback) {
	var api_login = 'o_2a8nj8hjf8';
	$.getJSON('/api/shortener?fullurl=' + encodeURIComponent(url) + '&api_login=' + api_login, callback);
}

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
		$('button.go').addClass('okey');
	} else {
		var c = decodeChannelName('input.channel');
		if (c && c !== consoleRe.channel) {
			$('.chprefix').slideUp('slow');
			$('.chpmessage')
				.find('b')
				.text(c)
				.end()
				.slideDown('slow', function () {
					window.location.href = '/' + c;
				});
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

var BrowserDetect = {
	searchString: function (data) {
		for (var i = 0; i < data.length; i++) {
			var data_string = data[i].str;
			var data_prop = data[i].prop;
			this.versionSearchString = data[i].vsearch || data[i].name;
			if (data_string) {
				if (data_string.indexOf(data[i].substr) != -1) return data[i].name;
			} else if (data_prop) return data[i].name;
		}
	},
	searchVersion: function (dString) {
		var i = dString.indexOf(this.versionSearchString);
		if (i == -1) return;
		return parseFloat(dString.substr(i + this.versionSearchString.length + 1));
	},
	dataBrowser: [
		{
			str: navigator.userAgent,
			substr: 'OPR',
			vsearch: 'OPR',
			name: {
				f: 'Opera',
				s: 'OP',
			},
		},
		{
			str: navigator.userAgent,
			substr: 'Chrome',
			vsearch: 'Chrome',
			name: {
				f: 'Chrome',
				s: 'CR',
			},
		},
		{
			str: navigator.userAgent,
			substr: 'OmniWeb',
			vsearch: 'OmniWeb',
			name: {
				f: 'OmniWeb',
				s: 'OW',
			},
		},
		{
			str: navigator.vendor,
			substr: 'Apple',
			name: {
				f: 'Safari',
				s: 'SF',
			},
			vsearch: 'Version',
		},
		{
			prop: window.opera,
			name: {
				f: 'Opera',
				s: 'OP',
			},
			vsearch: 'Version',
		},
		{
			str: navigator.vendor,
			substr: 'iCab',
			name: {
				f: 'iCab',
				s: 'iC',
			},
		},
		{
			str: navigator.vendor,
			substr: 'KDE',
			name: {
				f: 'Konqueror',
				s: 'KDE',
			},
		},
		{
			str: navigator.userAgent,
			substr: 'Firefox',
			name: {
				f: 'Firefox',
				s: 'FF',
			},
			vsearch: 'Firefox',
		},
		{
			str: navigator.vendor,
			substr: 'Camino',
			name: {
				f: 'Camino',
				s: 'CM',
			},
		},
		{
			str: navigator.userAgent,
			substr: 'Netscape',
			name: {
				f: 'Netscape',
				s: 'NS',
			},
		},
		{
			str: navigator.userAgent,
			substr: 'MSIE',
			name: {
				f: 'Explorer',
				s: 'IE',
			},
			vsearch: 'MSIE',
		},
		{
			str: navigator.userAgent,
			substr: 'Trident',
			name: {
				f: 'Explorer',
				s: 'IE',
			},
			vsearch: 'rv',
		},
		{
			str: navigator.userAgent,
			substr: 'Mozilla',
			name: {
				f: 'Netscape',
				s: 'NS',
			},
			vsearch: 'Mozilla',
		},
	],
	dataOS: [
		{
			str: navigator.platform,
			substr: 'Win',
			name: 'Win',
		},
		{
			str: navigator.platform,
			substr: 'Mac',
			name: 'Mac',
		},
		{
			str: navigator.userAgent,
			substr: 'iPhone',
			name: 'iOS',
		},
		{
			str: navigator.userAgent,
			substr: 'iPad',
			name: 'iOS',
		},
		{
			str: navigator.userAgent,
			substr: 'Android',
			name: 'Android',
		},
		{
			str: navigator.platform,
			substr: 'Linux',
			name: 'Linux',
		},
	],
	init: function () {
		return {
			browser: this.searchString(this.dataBrowser) || 'An unknown browser',
			version: this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || '',
			OS: this.searchString(this.dataOS) || 'an unknown OS',
		};
	},
};
var browser = BrowserDetect.init();

$(function () {
	$('.popup-zoom').magnificPopup({
		callbacks: {
			afterChange: function () {
				if (this.currItem.el.is('.changechannel')) {
					openChannelName();
				} else if (this.currItem.el.is('.pserver')) {
					$('.footer-tabs a:nth-child(3)', '#dialog-feedback').click();
				}
			},
			open: function () {
				if (this.currItem.el.is('.changechannel')) openChannelName();
			},
		},
		type: 'inline',
		fixedContentPos: false,
		fixedBgPos: true,
		overflowY: 'auto',
		closeBtnInside: true,
		preloader: false,
		midClick: true,
		removalDelay: 300,
		mainClass: 'my-mfp-zoom-in',
	});

	$('.switcher-handle')
		.click(function () {
			var p = 15,
				o = 1,
				$t = $(this),
				t = 'Close Settings';
			if ($t.parent().is('.open')) {
				t = 'Open Settings';
				p = -335;
				o = 0.5;
			}
			$t.removeAttr('data-hint').removeAttr('data-hints').toggleClass('open');
			$('#style-switcher')
				.transitStop()
				.transition(
					{
						right: p,
						opacity: o,
					},
					300,
					'',
					function () {
						$(this).toggleClass('open');
						$t.attr('data-hints', t);
					}
				);
		})
		.hover(
			function () {
				$('#style-switcher').transition(
					{
						opacity: 1,
					},
					300
				);
			},
			function () {
				if (!$(this).is('.open'))
					$('#style-switcher').transition(
						{
							opacity: 0.5,
						},
						300
					);
			}
		);

	$('#style-switcher').on('click', function (e) {
		e.stopPropagation();
		e.preventDefault();
		var t = $(e.target),
			p = t.parent().data('setting');
		if (t.is('.cup')) {
			setConfig('reverse_output', false);
		} else if (t.is('.cdown')) {
			setConfig('reverse_output', true);
		} else if (t.is('.cswap')) {
			setConfig('reverse_output', !console_config.reverse_output);
		} else if (t.is('.mfp-close')) {
			$('.switcher-handle').click();
		} else if (t.is('.increase')) {
			changeSetting(p, 'increase');
		} else if (t.is('.decrease')) {
			changeSetting(p, 'decrease');
		} else if (t.is('.reset')) {
			changeSetting(p, 'reset');
		} else if (t.is('.shide')) {
			changeSetting(p, 'hide');
		} else if (t.is('.resetall')) {
			if (confirm('Do you want to restore default settings?')) clearUserConfig();
		}
	});

	$('.zoom-d')
		.on('click', '.footer-tabs a', function (e) {
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
			$('.' + h, c).slideToggle('slow', 'easeOutQuart', function () {
				if (!$('.' + h, c).is(':visible')) {
					$(that).removeClass('active');
				}
				if ($(that).is('.shorturl')) {
					if (!$('.urlcode-place').is('.generated')) {
						$d = $('#dialog-channel');
						shorten(window.location, function (r) {
							var input = $('<input>')
									.val(r.url)
									.attr('readonly', 'readonly')
									.attr('id', 'shorturlinput')
									.on('click', function () {
										$(this).select();
									}),
								qrcode = new QRCode('qrcode', {
									text: r.url,
									width: 250,
									height: 250,
								});
							$('.incode', $d)
								.html(input)
								.append(
									'<div class="tooltip-copy"><button class="btn gray" onclick="copyClipboard()" onmouseout="copyClipboardOut()"><span class="tooltiptext" id="copyTooltip">Copy to clipboard</span>Copy</button></div>'
								);
							$('.urlcode-place').slideToggle(300, 'easeOutQuart').addClass('generated');
						});
					}
				}
			});
		})
		.on('click', '#qrcode img', function (e) {
			var goto = $(this).parent().attr('title');
			window.open(goto, '_blank');
		})
		.on('click', '.usage', function (e) {
			e.preventDefault();
			$(this).parent().next('.examples').slideToggle('slow', 'easeOutQuart');
		})
		.on('click', '.level-info .level', function (e) {
			e.preventDefault();
			$('.footer-tabs a:nth-child(2)', '#dialog-use').click();
		})
		.on('click', '.level-log .level', function (e) {
			e.preventDefault();
			$('.footer-tabs a:nth-child(1)', '#dialog-use').click();
		})
		.on('click', '.go', function (e) {
			channelNameChange();
		})
		.on('click', '.chprand a', function (e) {
			e.preventDefault();
			channelNameChange('random');
		});

	$('.server').pulse(
		{
			opacity: 0,
		},
		{
			duration: 1000,
			pulses: -1,
		}
	);

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
});

if (window.addEventListener) {
	window.addEventListener('resize', marginBody, false);
}

function copyClipboard() {
	var copyText = document.getElementById('shorturlinput');
	copyText.select();
	copyText.setSelectionRange(0, 99999);
	document.execCommand('copy');

	var tooltip = document.getElementById('copyTooltip');
	tooltip.innerHTML = 'Copied!';
}

function copyClipboardOut() {
	var tooltip = document.getElementById('copyTooltip');
	tooltip.innerHTML = 'Copy to clipboard';
}

window.$ = $;
