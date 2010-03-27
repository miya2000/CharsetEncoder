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
 * LiveConnectCharsetEncoder
 * implements with Java Live Connect.
 */
if (!this.CharsetEncoder) throw 'CharsetEncoder has not been loaded.';

(function() {
    
    // This implementation depends on Java Live Connect.
    if (this.java && java.lang && typeof(java.lang.String) !== 'undefined'); else return;
    
    /** class LiveConnectCharsetEncoder */
    function LiveConnectCharsetEncoder(charset) {
        this.charset = charset || 'UTF-8';
    }
    LiveConnectCharsetEncoder.prototype.encode = function(str, buffer) {
        // encode
        var result = new java.lang.String(str).getBytes(this.charset);
        // convert Java byte array to JavaScript Array.
        if (!buffer) buffer = [];
        var b_len = buffer.length;
        for (var i = 0, len = result.length; i < len; i++) {
            buffer[b_len++] = result[i] & 0xFF;
        }
        result = null; // fear for memory leak.
        return buffer;
    };
    LiveConnectCharsetEncoder.prototype.decode = function(bytes) {
        // convert JavaScript Array to Java byte array.
        var bos = new java.io.ByteArrayOutputStream(bytes.length);
        for(var i = 0, len = bytes.length; i < len; i++) {
            bos.write(bytes[i]);
        }
        bytes = bos.toByteArray();
        bos.close(); bos = null; // fear for memory leak.
        // decode
        var result = new java.lang.String(bytes, this.charset);
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
    CharsetEncoder.registerFactory(
        'LiveConnect',
        {
            create : function(charset) {
                var cached = cache[charset];
                if (cached) return cached;
                deleteCacheLater();
                return cache[charset] = new LiveConnectCharsetEncoder(charset);
            },
            available : function(charset) {
                if (cache[charset]) return true;
                try {
                    new java.lang.String("").getBytes(charset);
                    return true;
                }
                catch(e) {}
                return false;
            }
        },
        1010
    );
    CharsetEncoder.impl.LiveConnectCharsetEncoder = LiveConnectCharsetEncoder;
})()
