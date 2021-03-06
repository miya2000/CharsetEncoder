/*
The MIT License

Copyright (c) 2010 miya2000 (http://www.hatena.ne.jp/miya2000/)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
/**
 * JavaAppletCharsetEncoder
 * implements with Java Applet.
 */
if (!this.CharsetEncoder) throw 'CharsetEncoder has not been loaded.';

(function() {
    
    // This implementation works web only.
    if (typeof(window) == 'undefined' || typeof(document) == 'undefined') return;
    // If this environment supports the Live Connect, use Live Connect version.
    if (CharsetEncoder.getFactory('LiveConnect') != null) return;
    
    /** class JavaAppletCharsetEncoder */
    function JavaAppletCharsetEncoder(applet, charset) {
        this.applet = applet;
        this.charset = charset || 'UTF-8';
    }
    JavaAppletCharsetEncoder.prototype.encode = function(str, buffer) {
        // encode
        var result = this.applet.b(str, this.charset);
        // convert Java byte array to JavaScript Array.
        var buf = buffer || [], b_len = buf.length || 0;
        for (var i = 0, len = result.length; i < len; i++) {
            buf[b_len++] = result[i] & 0xFF;
        }
        if (buf.length != b_len) buf.length = b_len;
        result = null; // fear for memory leak.
        return buf;
    };
    JavaAppletCharsetEncoder.prototype.decode = function(bytes) {
        var result = this.applet.s(bytes, this.charset); // It will be error at Opera 10.10 lower.
        return String(result);
    };
    
    // register factory.
    var cache = {}, cacheTid;
    function deleteCacheLater() {
        cacheTid || (cacheTid = setTimeout(deleteCache, 100));
    }
    function deleteCache() {
        if (cacheTid) clearTimeout(cacheTid);
        cacheTid = null; cache = {};
    }
    var applet = null;
    CharsetEncoder.registerFactory(
        'JavaApplet',
        {
            get applet() {
                return applet;
            },
            set applet(value) {
                if (applet && applet.parentNode) { applet.parentNode.removeChild(applet); }
                applet = value;
                deleteCache();
            },
            create : function(charset) {
                var cached = cache[charset];
                if (cached) return cached;
                deleteCacheLater();
                return cache[charset] = new JavaAppletCharsetEncoder(applet, charset);
            },
            available : function(charset) {
                return !!(applet && applet.b);
            }
        },
        1011
    );
    CharsetEncoder.impl.JavaAppletCharsetEncoder = JavaAppletCharsetEncoder;
    
    // set default applet.
    (function() {
        var jarName = 'a.jar'; var className = 'A';
        var currentScript = (function f(e) { if (e.nodeName.toLowerCase() == 'script') return e; return f(e.lastChild) })(document); // get last appended script element.
        var url = currentScript.src.replace(/[^/]*$/, '') + jarName;
        var ap = document.createElement('applet');
        ap.archive = url; ap.code = className;
        ap.style.cssText = 'width: 0; height: 0; position: absolute; visibility: hidden;';
        (document.body || document.documentElement).appendChild(ap);
        // set timeout for Google Chrome.
        setTimeout(function() {
            if (ap.b) {
                CharsetEncoder.getFactory('JavaApplet').applet = ap;
            }
            else {
                ap.parentNode.removeChild(ap);
            }
        }, 0);
    })();
})()
