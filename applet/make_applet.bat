@echo off
setlocal

set JDK_BIN="C:\Program Files (x86)\Java\jdk1.6.0_18\bin"
set PATH=%PATH%;%JDK_BIN%

javac -g:none A.java
jar -cf a.jar A.class

endlocal
