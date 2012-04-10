/************************
	* TestEditedSOHelper.jsx
	*
	*
	*/

#includepath "../LinkDox/JSX"
#include "CanLinkIt.jsx"
#include "UnitTestLib.jsxinc"
#include "TestFiles.jsxinc"


// Not actually necessary because it's got to be included from CanLinkIt
//#include "EditedSOHelper.jsxinc"

function basicEditedSOTest1() {
	app.open(testAssembledFile1);
	// Since we're running this as a raw test, we have to set this ourselves. Normally this would be set via a call to CanLinkIt.getLayerInfo() from the Flash MXML, but we're skipping that to make this a unit test.
	canLinkIt.editedSOHelper.lastSelectedLayer=activeDocument.activeLayer;
	
	assertEquals(false, canLinkIt.editedSOHelper.userEditedSO(), "TestEditedSOHelper.jsx/basicEditedSOTest1(): 1: We opened a file where the activeLayer is not a link, so we should get false here.");
	app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);

}
function basicEditedSOTest2() {
	app.open(testAssembledFile2);
	// Since we're running this as a raw test, we have to set this ourselves. Normally this would be set via a call to CanLinkIt.getLayerInfo() from the Flash MXML, but we're skipping that to make this a unit test.
	canLinkIt.editedSOHelper.lastSelectedLayer=activeDocument.activeLayer;
	
	// Make sure this layer needs to be updated, so that the tests later will be valid. (this isn't strictly necessary for this activity, just for the test itself that we're running).
	checkForLayerNeedToBeUpdated(activeDocument.activeLayer.name);
	
	canLinkIt.editedSOHelper.debug_autoAnswerConfirm=false;

	assertEquals(false, canLinkIt.editedSOHelper.userEditedSO(), "TestEditedSOHelper.jsx/basicEditedSOTest2(): 1: We're faking the user's answer to be false, so we should get false here.");
	assertXMLHasProperty("boolean", false, canLinkIt.editedSOHelper.userEditedSOXML(), "TestEditedSOHelper.jsx/basicEditedSOTest2(): 2: We're faking the user's answer to be false, so we should get false here.");

	canLinkIt.editedSOHelper.debug_autoAnswerConfirm=true;
	assertEquals(true, canLinkIt.editedSOHelper.userEditedSO(), "TestEditedSOHelper.jsx/basicEditedSOTest2(): 3: We're faking the user's answer to be true, so we should get true here after successful execution of the user's command.");
	assertEquals(app.documents.length, canLinkIt.editedSOHelper.numDocsBeforeEditSO, "TestEditedSOHelper.jsx/basicEditedSOTest2(): 4: Number of docs open should match here.");

	// Test to make sure it returns false if we haven't opened a new file yet (in case it takes photoshop extra time to do so):
	assertXMLHasProperty("boolean", false, canLinkIt.editedSOHelper.userEditedSOPartB(), "TestEditedSOHelper.jsx/basicEditedSOTest2(): 5: If it takes longer to open a new file, userEditedSOPartB() should return false.");

	// We can pretend this is the opened document -- it really doesn't need to be anything at all, just needs to be there for the test.
	var docRef = app.documents.add( 200, 200 );
	assertXMLHasProperty("boolean", true, canLinkIt.editedSOHelper.userEditedSOPartB(), "TestEditedSOHelper.jsx/basicEditedSOTest2(): 6: If it takes longer to open a new file, userEditedSOPartB() should return false.");
	assertEquals(canLinkIt.editedSOHelper.numDocsBeforeEditSO+1, app.documents.length, "TestEditedSOHelper.jsx/basicEditedSOTest2(): 7: Number of docs open should match here.");
	// Make sure it's the right document. Use the strings since the file won't be the exact same "File" object, but it will have the same path.
	assertEquals(app.activeDocument.fullName.toString(), canLinkIt.editedSOHelper.editDocumentToOpen.toString(), "TestEditedSOHelper.jsx/basicEditedSOTest2(): 8: It should be the right document open here.");
	
	assertEquals(1, canLinkIt.editedSOHelper.edited.length,
		"TestEditedSOHelper.jsx/basicEditedSOTest2(): 9: The editedSOInfo should have one item.");
	
	assertEquals(1, canLinkIt.editedSOHelper.getEditItemsLinkedTo(activeDocument).length,
		"TestEditedSOHelper.jsx/basicEditedSOTest2(): 10: The getEditItemsLinkedTo should return one item.");
	assertEquals(canLinkIt.editedSOHelper.edited[0], canLinkIt.editedSOHelper.getEditItemsLinkedTo(activeDocument)[0],
		"TestEditedSOHelper.jsx/basicEditedSOTest2(): 10: The getEditItemsLinkedTo should return the appropriate information.");

	// Simulate a save to get it to update.
	assertEquals(true, canLinkIt.editedSOHelper.notifySaved(), "TestEditedSOHelper.jsx/basicEditedSOTest2(): 20: If we claim it's been saved, it should successfully update.");
	
	
	app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
	assertEquals(app.documents.length, canLinkIt.editedSOHelper.numDocsBeforeEditSO, "TestEditedSOHelper.jsx/basicEditedSOTest2(): 30: Number of docs open should match here.");
	
	// Now the original document is the only one open. Let's make sure it got updated.
	// Make sure this layer needs to be updated, so that the tests later will be valid. (this isn't strictly necessary for this activity, just for the test itself that we're running).
	checkForLayerIsUpToDate(activeDocument.activeLayer.name);
	
	app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}

function testEditedSOEquals() {
	var edit1 = new EditedSO();
	var edit2 = new EditedSO();
	assertEquals(edit1, edit2, "testEditedSOEquals(): they're both blank, they should be equal");
	
	app.open(testAssembledFile2);
	edit1.destinationDocument=activeDocument;
	assertNotEquals(edit1, edit2, "testEditedSOEquals(): one has a document");
	
	edit2.destinationDocument=activeDocument;
	assertEquals(edit1, edit2, "testEditedSOEquals(): they both have the same document");
	
	app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);


}

closeAllDocuments();
testEditedSOEquals();
basicEditedSOTest1();
basicEditedSOTest2();

$.writeln("\n\n\n"+errorMessages+"\n"+
"TestEditedSOHelper.jsx tests are complete. total of errors: "+errorCount);