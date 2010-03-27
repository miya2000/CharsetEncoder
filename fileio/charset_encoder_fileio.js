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
 * FileIOCharsetEncoder
 * implements with File I/O API.
 * 
 * @see http://dev.opera.com/libraries/fileio/
 */
if (!this.CharsetEncoder) throw 'CharsetEncoder has not been loaded.';

(function() {
    
    // This implementation depends on File I/O API.
    if (typeof File !== 'function') return;
    
    function encode(str, buffer, charset, workfile) {
        var s = null, result = null;
        try {
            s = workfile.open(null, 'w+');
            //s.write(str, charset);   // always utf-8
            s.writeLine(str, charset); // but writeLine is OK.
            var b_len = s.position;
            s.position = 0;
            result = s.readBytes(b_len);
            s.close();
            result.length -= s.newLine.length; // for writeLine.
        }
        catch(e) {
            try { if (s) s.close(); } catch(ee) {}
            throw e;
        }
        if (!buffer) {
            return result;
        }
        else {
            var b_len = buffer.length;
            for (var i = 0, len = result.length; i < len; i++) {
                buffer[b_len++] = result[i];
            }
            return buffer;
        }
    }
    function decode(bytes, charset, workfile) {
        if (bytes instanceof ByteArray) {
            // OK.
        }
        else if (bytes instanceof Array) {
            var b = new ByteArray(0);
            Array.prototype.push.apply(b, bytes);
            bytes = b;
        }
        else if (typeof(bytes.valueOf()) === 'string') {
            var len = bytes.length;
            var b = new ByteArray(len);
            for (var i = 0; i < len; i++) {
                b[i] = bytes.charCodeAt(i);
            }
            bytes = b;
        }
        var s = null, result = null;
        try {
            s = workfile.open(null, 'w+');
            s.writeBytes(bytes);
            s.writeBytes(new ByteArray(1)); // null terminator.
            s.position = 0;
            result = s.read(bytes.length, charset);
            s.close();
        }
        catch(e) {
            try { if (s) s.close(); } catch(ee) {}
            throw e;
        }
        return result;
    }
    function FileIOCharsetEncoder(workfile, charset) {
        if (charset == null) {
            charset = 'UTF-8';
        }
        this.encode = function(str, buffer) {
            deleteWorkFileLater();
            return encode(str, buffer, charset, workfile);
        };
        this.decode = function(bytes) {
            deleteWorkFileLater();
            return decode(bytes, charset, workfile);
        };
        var deleteTid = null;
        function deleteWorkFileLater() {
            deleteTid || (deleteTid = setTimeout(deleteWorkFile, 100));
        }
        function deleteWorkFile() {
            deleteTid = null;
            if (workfile.exists) workfile.deleteFile(workfile);
        }
    }

    var workfile = null;
    var cache = {}, cacheTid;
    function deleteCacheLater() {
        cacheTid || (cacheTid = setTimeout(deleteCache, 100));
    }
    function deleteCache() {
        if (cacheTid) clearTimeout(cacheTid);
        cacheTid = null; cache = {};
    }
    CharsetEncoder.registerFactory(
        'FileIO',
        {
            get workfile() {
                return workfile;
            },
            set workfile(value) {
                workfile = value;
                deleteCache();
            },
            create : function(charset) {
                var cached = cache[charset];
                if (cached) return cached;
                deleteCacheLater();
                return cache[charset] = new FileIOCharsetEncoder(this.workfile, charset);
            },
            available : function(charset) {
                return this.workfile != null;
            }
        },
        1001
    );
    CharsetEncoder.impl.FileIOCharsetEncoder = FileIOCharsetEncoder;
    
    // set default workfile at Opera Unite.
    (function() {
        var workfileName = '.charsetencoder.tmp';
        var workfile = opera.io.filesystem.mountSystemDirectory('storage').resolve(workfileName);
        CharsetEncoder.getFactory('FileIO').workfile = workfile;
    })();
})()
