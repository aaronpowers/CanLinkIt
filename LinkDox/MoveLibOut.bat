@echo off
echo Before running this script, you should quit Adobe Flash Builder.
echo As a result of this script, it should re-run Adobe Flash Builder ready to use the Design view.


move libs\CSXSLibrary-2.0-sdk-3.4.swc .
"C:\Program Files (x86)\Adobe\Adobe Flash Builder 4.6\FlashBuilder.exe"
