/*********************************************
Copyright 2011 Aaron Powers
All Rights Reserved
*/
/******************
 * 
 * To run this test:
 * (1) Launch this file in ExtendScript Toolkit
 * (2) If your files are stored somewhere besides in our standard path, you may have to edit the file "DeveloperVariables.jsx".
 * (3) Press F5
 * (3) Look at ExtendScript's "Javascript Console" for a summary -- if all went well, it should say "Number of errors: 0" at the bottom.
 */

// Include the folder we keep all JSX files in:
#includepath "../LinkDox/JSX"
#include "CanLinkIt.jsx"
#include "XMLLib.jsxinc"
#include "Action_UpdateAllFiles.jsxinc"

#include "UnitTestLib.jsxinc"
#include "TestFiles.jsxinc"

/*Because of the following line, it's no longer necessary to do change a dropdown in extenscript, by going to just above the top of this script, change the dropdown from 
	"ExtendScript Toolkit CS5" to one of the "Adobe Photoshop" selections*/
#target photoshop


function testUpdateAllFiles() {
	if (testFilesFolderCopy.exists) {
		// delete it so we can create a fresh copy.
		FileLib.deleteFolder(testFilesFolderCopy);
		if (testFilesFolderCopy.exists) {
			// Note: it will fail anytime there are files in the folder. We need to do a recursive delete.
			assertFailed("Trying to remove the folder failed. Folder="+testFilesFolderCopy);
		}
	}
	FileLib.copyFolder(testFilesFolder,testFilesFolderCopy);

	Action_UpdateAllFiles.updateAllFilesIn(testFilesFolderCopy);
	
	FileLib.deleteFolder(testFilesFolderCopy);
	
	var lastFolder = canLinkIt.prefs.get(LAST_FOLDER_FOR_UPDATE_ALL_FILES_PREF);
	$.writeln("Last folder pref was set to: "+lastFolder);
	assertEquals(testFilesFolderCopy.fullName, lastFolder, "The prefs should have been set to the last folder location.");

}

closeAllDocuments();
testUpdateAllFiles();

$.writeln(errorMessages+"\n"+
"Action_UpdateAllFiles.jsxinc tests are complete. Total errors: "+errorCount);
