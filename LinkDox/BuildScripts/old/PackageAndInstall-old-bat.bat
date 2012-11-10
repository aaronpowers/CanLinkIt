@echo off
echo Starting packaging and installation...
echo **********************************

REM SET THESE TO YOUR COMPUTER's PATH TO THE FOLLOWING ITEMS

set PHOTOSHOP_DIR=C:\Program Files\Adobe\Adobe Photoshop CS5 (64 Bit)
set PHOTOSHOP=%PHOTOSHOP_DIR%\Photoshop.exe
REM change this to your photoshop version name in this format: CS5 64  (e.g. change 64 to 32 if needed, and change CS5 to another if needed)
set PS_VER=CS5 64
set EXT_MGR="C:\Program Files (x86)\Adobe\Adobe Extension Manager CS5\Adobe Extension Manager CS5.exe"

set PROJ_DIR=C:\Dropbox\AllDocuments\EntrepreneurshipAndIdeas\LinkDox\FlashBuilderProject\LinkDox
set BUILDFILES_DIR=%PROJ_DIR%\BuildScripts\CanLinkIt

REM *****************************************
REM Delete the old files so that it won't get installed by accident if the build fails. We'd rather know that it failed.

del /Q /F CanLinkIt.mxp
del /Q /F %BUILDFILES_DIR%\*

REM ###################################################################
REM above this line we've converted the scripts into the IncompletePackageAndInstallScript.jsx

REM *****************************************
REM Flatten the script
REM Before we can run photoshop, we have to launch it -- if we run it without launching it in a thread, the thread will hang waiting until Photoshop is closed, which will mean we'll never get to the line to quit photoshop (note that we can't seem to do that in JSX)
StartPhotoshop.vbs



"%PHOTOSHOP%" "%PROJ_DIR%\BuildScripts\FlattenModifiedByAaron.jsx"

REM copy other files into our build folder
copy ..\JSX\Notification*.jsx %BUILDFILES_DIR%


REM Quit photoshop (it will be open here, plus we need to restart before the extension will work) photoshop.
QuitPhotoshop.vbs

REM ****************************************
REM BUILD THE EXTENSION

%EXT_MGR% -suppress -remove product="Photoshop %PS_VER%" extension="CanLinkIt"
echo Exit Code from trying to remove the extension (0 and 103 are good): %errorlevel%

cd ..
%EXT_MGR% -suppress -package mxi="CanLinkIt.mxi" mxp="BuildScripts\CanLinkIt.mxp"
echo Exit Code from trying to package the extension (0 is good): %errorlevel%
cd BuildScripts

dir CanLinkIt.mxp

%EXT_MGR% -suppress -install mxp="CanLinkIt.mxp"
echo Exit Code from trying to install the extension (0 is good): %errorlevel%

REM copy it into the download folder...
copy /Y CanLinkIt.mxp "..\..\..\EclipseProject\CanLinkIt\war"


REM check if it's in the right place
cd "%PHOTOSHOP_DIR%\Plug-ins\Panels\CanLinkIt"
dir


echo **********************************
echo You can now run photoshop.
REM don't try running photoshop from this script. Every time I try in VBS or on the command line it doesn't work. I don't know why.
echo If no panel appears in Photoshop:
echo Check the output above. Make sure that you see two directory results with files in them.
echo If either is missing, it failed to build. Debug your code to see why it didn't build correctly.
echo **********************************


pause