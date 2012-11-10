/******************************
	* TestFileLib.jsxinc
	* Tests the file & folder operations
	*
	*
	*/

// Include the folder we keep all JSX files in:
#includepath "../LinkDox/JSX"
#include "XMLLib.jsxinc"
#include "FileLib.jsx"
#include "UnitTestLib.jsxinc"
#include "TestFiles.jsxinc"

function testCopyAndRemove() {
	if (testFilesFolderCopy.exists) {
		// delete it so we can create a fresh copy.
		FileLib.deleteFolder(testFilesFolderCopy);
		assertFalse(testFilesFolderCopy.exists,"TestFileLib.jsx: Folder should have been already deleted, but it was not (#1)");
		/*assertEquals(0,FileLib.countFilesIn(testFilesFolderCopy),"Files should have been deleted");
		assertEquals(0,FileLib.countFoldersIn(testFilesFolderCopy),"Folders should have been deleted");*/
	}

	FileLib.copyFolder(testFilesFolder,testFilesFolderCopy);
	assertTrue(testFilesFolderCopy.exists,"TestFileLib.jsx: Folder should exist after a copy.");
	assertEquals(FileLib.countFoldersIn(testFilesFolder),FileLib.countFoldersIn(testFilesFolderCopy),"TestFileLib.jsx: Folder count should be equal after a copy");
	assertEquals(FileLib.countFilesIn(testFilesFolder),FileLib.countFilesIn(testFilesFolderCopy),"TestFileLib.jsx: File count should be equal after a copy");

	// Update the following occasionally if there are more files & folders in here.
	/*$.writeln("Folders in original:" +FileLib.countFoldersIn(testFilesFolder));
	$.writeln("Files in original:" +FileLib.countFilesIn(testFilesFolder));*/
	assertTrue(FileLib.countFoldersIn(testFilesFolder)>=5,"TestFileLib.jsx: On 5/18/2012 there were 5 folders. There should be at least that many in the future assuming we don't delete test folders");
	assertTrue(FileLib.countFilesIn(testFilesFolder)>=16,"TestFileLib.jsx: On 5/18/2012 there were 16 files here. There should be at least that many in the future assuming we don't delete test files.");
		
	FileLib.deleteFolder(testFilesFolderCopy);
	assertFalse(testFilesFolderCopy.exists,"TestFileLib.jsx: Folder should have been already deleted, but it was not (#2)");
	
	

}

testCopyAndRemove();

$.writeln(errorMessages+"\n"+
"FileLib.jsxinc tests are complete. Total errors: "+errorCount);
