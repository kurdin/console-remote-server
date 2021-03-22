window.matchMedia||(window.matchMedia=function(){"use strict";var e=window.styleMedia||window.media;if(!e){var t=document.createElement("style"),n=document.getElementsByTagName("script")[0],r=null;t.type="text/css";t.id="matchmediajs-test";n.parentNode.insertBefore(t,n);r="getComputedStyle"in window&&window.getComputedStyle(t,null)||t.currentStyle;e={matchMedium:function(e){var n="@media "+e+"{ #matchmediajs-test { width: 1px; } }";if(t.styleSheet){t.styleSheet.cssText=n}else{t.textContent=n}return r.width==="1px"}}}return function(t){return{matches:e.matchMedium(t||"all"),media:t||"all"}}}());

var VISIBILITY=function(){function e(r,i,s,o,u,a,f){var l=r.parentNode,c=2;if(!n(r)){return false}if(9===l.nodeType){return true}if("0"===t(r,"opacity")||"none"===t(r,"display")||"hidden"===t(r,"visibility")){return false}if("undefined"===typeof i||"undefined"===typeof s||"undefined"===typeof o||"undefined"===typeof u||"undefined"===typeof a||"undefined"===typeof f){i=r.offsetTop;u=r.offsetLeft;o=i+r.offsetHeight;s=u+r.offsetWidth;a=r.offsetWidth;f=r.offsetHeight}if(l){if("hidden"===t(l,"overflow")||"scroll"===t(l,"overflow")){if(u+c>l.offsetWidth+l.scrollLeft||u+a-c<l.scrollLeft||i+c>l.offsetHeight+l.scrollTop||i+f-c<l.scrollTop){return false}}if(r.offsetParent===l){u+=l.offsetLeft;i+=l.offsetTop}return e(l,i,s,o,u,a,f)}return true}function t(e,t){if(window.getComputedStyle){return document.defaultView.getComputedStyle(e,null)[t]}if(e.currentStyle){return e.currentStyle[t]}}function n(e){while(e=e.parentNode){if(e==document){return true}}return false}return{getStyle:t,isVisible:e}}();

(function(e,t){e.printStackTrace=t()})(this,function(){function e(t){t=t||{guess:true};var n=t.e||null,r=!!t.guess;var i=new e.implementation,s=i.run(n);return r?i.guessAnonymousFunctions(s):s}e.implementation=function(){};e.implementation.prototype={run:function(e,t){e=e||this.createException();t=t||this.mode(e);if(t==="other"){return this.other(arguments.callee)}else{return this[t](e)}},createException:function(){try{this.undef()}catch(e){return e}},mode:function(e){if(e["arguments"]&&e.stack){return"chrome"}else if(e.stack&&e.sourceURL){return"safari"}else if(e.stack&&e.number){return"ie"}else if(e.stack&&e.fileName){return"firefox"}else if(e.message&&e["opera#sourceloc"]){if(!e.stacktrace){return"opera9"}if(e.message.indexOf("\n")>-1&&e.message.split("\n").length>e.stacktrace.split("\n").length){return"opera9"}return"opera10a"}else if(e.message&&e.stack&&e.stacktrace){if(e.stacktrace.indexOf("called from line")<0){return"opera10b"}return"opera11"}else if(e.stack&&!e.fileName){return"chrome"}return"other"},instrumentFunction:function(t,n,r){t=t||window;var i=t[n];t[n]=function(){r.call(this,e().slice(4));return t[n]._instrumented.apply(this,arguments)};t[n]._instrumented=i},deinstrumentFunction:function(e,t){if(e[t].constructor===Function&&e[t]._instrumented&&e[t]._instrumented.constructor===Function){e[t]=e[t]._instrumented}},chrome:function(e){return(e.stack+"\n").replace(/^\s+(at eval )?at\s+/gm,"").replace(/^([^\(]+?)([\n$])/gm,"{anonymous}() ($1)$2").replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm,"{anonymous}() ($1)").replace(/^(.+) \((.+)\)$/gm,"$1@$2").split("\n").slice(1,-1)},safari:function(e){return e.stack.replace(/\[native code\]\n/m,"").replace(/^(?=\w+Error\:).*$\n/m,"").replace(/^@/gm,"{anonymous}()@").split("\n")},ie:function(e){return e.stack.replace(/^\s*at\s+(.*)$/gm,"$1").replace(/^Anonymous function\s+/gm,"{anonymous}() ").replace(/^(.+)\s+\((.+)\)$/gm,"$1@$2").split("\n").slice(1)},firefox:function(e){return e.stack.replace(/(?:\n@:0)?\s+$/m,"").replace(/^(?:\((\S*)\))?@/gm,"{anonymous}($1)@").split("\n")},opera11:function(e){var t="{anonymous}",n=/^.*line (\d+), column (\d+)(?: in (.+))? in (\S+):$/;var r=e.stacktrace.split("\n"),i=[];for(var s=0,o=r.length;s<o;s+=2){var u=n.exec(r[s]);if(u){var a=u[4]+":"+u[1]+":"+u[2];var f=u[3]||"global code";f=f.replace(/<anonymous function: (\S+)>/,"$1").replace(/<anonymous function>/,t);i.push(f+"@"+a+" -- "+r[s+1].replace(/^\s+/,""))}}return i},opera10b:function(e){var t=/^(.*)@(.+):(\d+)$/;var n=e.stacktrace.split("\n"),r=[];for(var i=0,s=n.length;i<s;i++){var o=t.exec(n[i]);if(o){var u=o[1]?o[1]+"()":"global code";r.push(u+"@"+o[2]+":"+o[3])}}return r},opera10a:function(e){var t="{anonymous}",n=/Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;var r=e.stacktrace.split("\n"),i=[];for(var s=0,o=r.length;s<o;s+=2){var u=n.exec(r[s]);if(u){var a=u[3]||t;i.push(a+"()@"+u[2]+":"+u[1]+" -- "+r[s+1].replace(/^\s+/,""))}}return i},opera9:function(e){var t="{anonymous}",n=/Line (\d+).*script (?:in )?(\S+)/i;var r=e.message.split("\n"),i=[];for(var s=2,o=r.length;s<o;s+=2){var u=n.exec(r[s]);if(u){i.push(t+"()@"+u[2]+":"+u[1]+" -- "+r[s+1].replace(/^\s+/,""))}}return i},other:function(e){var t="{anonymous}",n=/function\s*([\w\-$]+)?\s*\(/i,r=[],i,s,o=10;try{while(e&&e["arguments"]&&r.length<o){i=n.test(e.toString())?RegExp.$1||t:t;s=Array.prototype.slice.call(e["arguments"]||[]);r[r.length]=i+"("+this.stringifyArguments(s)+")";e=e.caller}return r}catch(e){return""}},stringifyArguments:function(e){var t=[];var n=Array.prototype.slice;for(var r=0;r<e.length;++r){var i=e[r];if(i===undefined){t[r]="undefined"}else if(i===null){t[r]="null"}else if(i.constructor){if(i.constructor===Array){if(i.length<3){t[r]="["+this.stringifyArguments(i)+"]"}else{t[r]="["+this.stringifyArguments(n.call(i,0,1))+"..."+this.stringifyArguments(n.call(i,-1))+"]"}}else if(i.constructor===Object){t[r]="#object"}else if(i.constructor===Function){t[r]="#function"}else if(i.constructor===String){t[r]='"'+i+'"'}else if(i.constructor===Number){t[r]=i}}}return t.join(",")},sourceCache:{},ajax:function(e){return""; var t=this.createXMLHTTPObject();if(t){try{t.open("GET",e,false);t.send(null);return t.responseText}catch(n){}}return""},createXMLHTTPObject:function(){var e,t=[function(){return new XMLHttpRequest},function(){return new ActiveXObject("Msxml2.XMLHTTP")},function(){return new ActiveXObject("Msxml3.XMLHTTP")},function(){return new ActiveXObject("Microsoft.XMLHTTP")}];for(var n=0;n<t.length;n++){try{e=t[n]();this.createXMLHTTPObject=t[n];return e}catch(r){}}},isSameDomain:function(e){return typeof location!=="undefined"&&e.indexOf(location.hostname)!==-1},getSource:function(e){if(!(e in this.sourceCache)){this.sourceCache[e]=this.ajax(e).split("\n")}return this.sourceCache[e]},guessAnonymousFunctions:function(e){for(var t=0;t<e.length;++t){var n=/\{anonymous\}\(.*\)@(.*)/,r=/^(.*?)(?::(\d+))(?::(\d+))?(?: -- .+)?$/,i=e[t],s=n.exec(i);if(s){var o=r.exec(s[1]);if(o){var u=o[1],a=o[2],f=o[3]||0;if(u&&this.isSameDomain(u)&&a){var l=this.guessAnonymousFunction(u,a,f);e[t]=i.replace("{anonymous}",l)}}}}return e},guessAnonymousFunction:function(e,t,n){var r;try{r=this.findFunctionName(this.getSource(e),t)}catch(i){r="getSource failed with url: "+e+", exception: "+i.toString()}return r},findFunctionName:function(e,t){var n=/function\s+([^(]*?)\s*\(([^)]*)\)/;var r=/['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*function\b/;var i=/['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*(?:eval|new Function)\b/;var s="",o,u=Math.min(t,20),a,f;for(var l=0;l<u;++l){o=e[t-l-1];f=o.indexOf("//");if(f>=0){o=o.substr(0,f)}if(o){s=o+s;a=r.exec(s);if(a&&a[1]){return a[1]}a=n.exec(s);if(a&&a[1]){return a[1]}a=i.exec(s);if(a&&a[1]){return a[1]}}}return"(?)"}};return e});

var XBBCODE = function() {
    function h(e, t, n, r, o, a, f) {
        f = f || [];
        n++;
        var l = new RegExp("(<bbcl=" + n + " )(" + s.join("|") + ")([ =>])", "gi"),
            c = new RegExp("(<bbcl=" + n + " )(" + s.join("|") + ")([ =>])", "i"),
            p = a.match(l) || [],
            d, v, m, g, y = i[e] || {};
        l.lastIndex = 0;
        if (!p) {
            a = ""
        }
        for (m = 0; m < p.length; m++) {
            c.lastIndex = 0;
            g = p[m].match(c)[2].toLowerCase();
            if (y.restrictChildrenTo.length > 0) {
                if (!y.validChildLookup[g]) {
                    v = 'The tag "' + g + '" is not allowed as a child of the tag "' + e + '".';
                    f.push(v)
                }
            }
            d = i[g] || {};
            if (d.restrictParentsTo.length > 0) {
                if (!d.validParentLookup[e]) {
                    v = 'The tag "' + e + '" is not allowed as a parent of the tag "' + g + '".';
                    f.push(v)
                }
            }
        }
        a = a.replace(u, function(e, t, n, r, i) {
            f = h(n, e, t, n, r, i, f);
            return e
        });
        return f
    }

    function p(e) {
        e = e.replace(/\<([^\>][^\>]*?)\>/gi, function(e, t) {
            var n = t.match(/^bbcl=([0-9]+) /);
            if (n === null) {
                return "<bbcl=0 " + t + ">"
            } else {
                return "<" + t.replace(/^(bbcl=)([0-9]+)/, function(e, t, n) {
                    return t + (parseInt(n, 10) + 1)
                }) + ">"
            }
        });
        return e
    }

    function d(e) {
        return e.replace(/<bbcl=[0-9]+ \/\*>/gi, "").replace(/<bbcl=[0-9]+ /gi, "&#91;").replace(/>/gi, "&#93;")
    }

    function m(e) {
        var t = e.text;
        t = t.replace(u, v);
        return t
    }

    function g(e) {
        e = e.replace(/\[(?!\*[ =\]]|list([ =][^\]]*)?\]|\/list[\]])/ig, "<");
        e = e.replace(/\[(?=list([ =][^\]]*)?\]|\/list[\]])/ig, ">");
        while (e !== (e = e.replace(/>list([ =][^\]]*)?\]([^>]*?)(>\/list])/gi, function(e, t, n) {
                var r = e;
                while (r !== (r = r.replace(/\[\*\]([^\[]*?)(\[\*\]|>\/list])/i, function(e, t, n) {
                        if (n === ">/list]") {
                            n = "</*]</list]"
                        } else {
                            n = "</*][*]"
                        }
                        var r = "<*]" + t + n;
                        return r
                    })));
                r = r.replace(/>/g, "<");
                return r
            })));
        e = e.replace(/</g, "[");
        return e
    }

    function y(e) {
        while (e !== (e = e.replace(a, function(e, t, n, r) {
                e = e.replace(/\[/g, "<");
                e = e.replace(/\]/g, ">");
                return p(e)
            })));
        return e
    }
    var e = {},
        t = /^(?:https?|file|c):(?:\/{1,3}|\\{1})[-a-zA-Z0-9:@#%&()~_?\+=\/\\\.]*$/,
        n = /^(?:red|green|blue|orange|yellow|black|white|brown|gray|silver|purple|maroon|fushsia|lime|olive|navy|teal|aqua)$/,
        r = /^#?[a-fA-F0-9]{6}$/,
        i, s, o = [],
        u, a, f, l, c;
    i = {
        b: {
            openTag: function(e, t) {
                return ''
            },
            closeTag: function(e, t) {
                return ''
            }
        },
        string: {
            openTag: function(e, t) {
                return ''
            },
            closeTag: function(e, t) {
                return ''
            }
        },
        attr: {
            openTag: function(e, t) {
                return ''
            },
            closeTag: function(e, t) {
                return ''
            }
        },
        booltrue: {
            openTag: function(e, t) {
                return ''
            },
            closeTag: function(e, t) {
                return ''
            }
        },
        boolfalse: {
            openTag: function(e, t) {
                return ''
            },
            closeTag: function(e, t) {
                return ''
            }
        },
        bbcode: {
            openTag: function(e, t) {
                return ''
            },
            closeTag: function(e, t) {
                return ''
            }
        },
        color: {
            openTag: function (e, t) {
                var i = e.substr(1) || "#FFF";
                r.lastIndex = 0;
                if (!n.test(i)) {
                    if (!r.test(i)) {
                        i = "black"
                    } else {
                        if (i.substr(0, 1) !== "#") {
                            i = "#" + i
                        }
                    }
                }
                return ''
            },
            closeTag: function(e, t) {
                return ''
            }
        },
        noparse: {
            openTag: function(e, t) {
                return ''
            },
            closeTag: function(e, t) {
                return ''
            },
            noParse: true
        },
        i: {
            openTag: function(e, t) {
                return ''
            },
            closeTag: function(e, t) {
                return ''
            }
        },
        tag: {
            openTag: function(e, t) {
                return ''
            },
            closeTag: function(e, t) {
                return ''
            }
        },
        number: {
            openTag: function(e, t) {
                return ''
            },
            closeTag: function(e, t) {
                return ''
            }
        },
        img: {
            openTag: function(e, n) {
                var r = n;
                t.lastIndex = 0;
                if (!t.test(r)) {
                    r = ""
                }
                return ''
            },
            closeTag: function(e, t) {
                return ''
            },
            displayContent: false
        },
        s: {
            openTag: function(e, t) {
                return ''
            },
            closeTag: function(e, t) {
                return ''
            }
        },
        size: {
            openTag: function(e, t) {
                var n = parseInt(e.substr(1), 10) || 0;
                if (n < 1 || n > 20) {
                    n = 1
                }
                return ''
            },
            closeTag: function(e, t) {
                return ''
            }
        },
        u: {
            openTag: function(e, t) {
                return ''
            },
            closeTag: function(e, t) {
                return ''
            }
        },
        url: {
            openTag: function(e, n) {
                var r;
                if (!e) {
                    r = n.replace(/<.*?>/g, "")
                } else {
                    r = e.substr(1)
                }
                t.lastIndex = 0;
                if (!t.test(r)) {
                    r = "#"
                }
                return ''
            },
            closeTag: function(e, t) {
                return ''
            }
        },
        red: {
            openTag: function(e, t) {
                return ''
            },
            closeTag: function(e, t) {
                return ''
            }
        },
        blue: {
            openTag: function(e, t) {
                return ''
            },
            closeTag: function(e, t) {
                return ''
            }
        },
        green: {
            openTag: function(e, t) {
                return ''
            },
            closeTag: function(e, t) {
                return ''
            }
        },
        yellow: {
            openTag: function(e, t) {
                return ''
            },
            closeTag: function(e, t) {
                return ''
            }
        },
        orange: {
            openTag: function(e, t) {
                return ''
            },
            closeTag: function(e, t) {
                return ''
            }
        },
        white: {
            openTag: function(e, t) {
                return ''
            },
            closeTag: function(e, t) {
                return ''
            }
        },
        black: {
            openTag: function(e, t) {
                return ''
            },
            closeTag: function(e, t) {
                return ''
            }
        },
        "*": {
            openTag: function(e, t) {
                return ''
            },
            closeTag: function(e, t) {
                return ''
            }
        }
    };
    s = [];
    (function() {
        var e, t, n;
        for (e in i) {
            if (i.hasOwnProperty(e)) {
                if (e === "*") {
                    s.push("\\" + e)
                } else {
                    s.push(e);
                    if (i[e].noParse) {
                        o.push(e)
                    }
                }
                i[e].validChildLookup = {};
                i[e].validParentLookup = {};
                i[e].restrictParentsTo = i[e].restrictParentsTo || [];
                i[e].restrictChildrenTo = i[e].restrictChildrenTo || [];
                n = i[e].restrictChildrenTo.length;
                for (t = 0; t < n; t++) {
                    i[e].validChildLookup[i[e].restrictChildrenTo[t]] = true
                }
                n = i[e].restrictParentsTo.length;
                for (t = 0; t < n; t++) {
                    i[e].validParentLookup[i[e].restrictParentsTo[t]] = true
                }
            }
        }
    })();
    u = new RegExp("<bbcl=([0-9]+) (" + s.join("|") + ")([ =][^>]*?)?>((?:.|[\\r\\n])*?)<bbcl=\\1 /\\2>", "gi");
    a = new RegExp("\\[(" + s.join("|") + ")([ =][^\\]]*?)?\\]([^\\[]*?)\\[/\\1\\]", "gi");
    f = new RegExp("\\[(" + o.join("|") + ")([ =][^\\]]*?)?\\]([\\s\\S]*?)\\[/\\1\\]", "gi");
    (function() {
        var e = [];
        for (var t = 0; t < s.length; t++) {
            if (s[t] !== "\\*") {
                e.push("/" + s[t])
            }
        }
        l = new RegExp("(\\[)((?:" + s.join("|") + ")(?:[ =][^\\]]*?)?)(\\])", "gi");
        c = new RegExp("(\\[)(" + e.join("|") + ")(\\])", "gi")
    })();
    var v = function(e, t, n, r, s) {
        n = n.toLowerCase();
        var o = i[n].noParse ? d(s) : s.replace(u, v),
            a = i[n].openTag(r, o),
            f = i[n].closeTag(r, o);
        if (i[n].displayContent === false) {
            o = ""
        }
        return a + o + f
    };
    e.process = function(e) {
        var t = {
                html: "",
                error: false
            },
            n = [];
        e.text = e.text.replace(/</g, "<");
        e.text = e.text.replace(/>/g, ">");
        e.text = e.text.replace(l, function(e, t, n, r) {
            return "<" + n + ">"
        });
        e.text = e.text.replace(c, function(e, t, n, r) {
            return "<" + n + ">"
        });
        e.text = e.text.replace(/\[/g, "&#91;");
        e.text = e.text.replace(/\]/g, "&#93;");
        e.text = e.text.replace(/</g, "[");
        e.text = e.text.replace(/>/g, "]");
        while (e.text !== (e.text = e.text.replace(f, function(e, t, n, r) {
                r = r.replace(/\[/g, "&#91;");
                r = r.replace(/\]/g, "&#93;");
                n = n || "";
                r = r || "";
                return "[" + t + n + "]" + r + "[/" + t + "]"
            })));
        e.text = g(e.text);
        e.text = y(e.text);
        n = h("bbcode", e.text, -1, "", "", e.text);
        t.html = m(e);
        if (t.html.indexOf("[") !== -1 || t.html.indexOf("]") !== -1) {
            n.push("Some tags appear to be misaligned.")
        }
        if (e.removeMisalignedTags) {
            t.html = t.html.replace(/\[.*?\]/g, "")
        }
        if (e.addInLineBreaks) {
            t.html = t.html.replace(/\r\n/g, "\n");
            t.html = t.html.replace(/(\r|\n)/g, "$1<br/>")
        }
        t.html = t.html.replace("&#91;", "[");
        t.html = t.html.replace("&#93;", "]");
        t.error = n.length === 0 ? false : true;
        t.errorQueue = n;
        return t
    };
    return e
}();