#includepath "../LinkDox/JSX"
#include "UnitTestLib.jsxinc"
#include "XMLLib.jsxinc"
#include "Logging.jsxinc"

#include "PsdLib.jsxinc"
#include "TestFiles.jsxinc"


/*Because of the following line, it's no longer necessary to edit extenscript by going to just above the top of this script, change the dropdown from 
	"ExtendScript Toolkit CS5" to one of the "Adobe Photoshop" selections -- whichever one you want to test */
#target photoshop



function testMultiLayer() {
	var fileName = "File.aiai";
	assertEquals(true, PsdLib.isMultiLayer("File.ai"), "Detect multilayer file");
	assertEquals(true, PsdLib.isMultiLayer("File.AI"), "Detect multilayer file");
	assertEquals(null, PsdLib.isMultiLayer("File.aiai"), "Detect multilayer file");
	assertEquals(null, PsdLib.isMultiLayer("File.blahpsd"), "Detect multilayer file");
	assertEquals(true, PsdLib.isMultiLayer("File.psd"), "Detect multilayer file");
	assertEquals(false, PsdLib.isMultiLayer("File.png"), "Detect multilayer file");
	assertEquals(false, PsdLib.isMultiLayer("File.jpeg"), "Detect multilayer file");
	assertEquals(true, PsdLib.isMultiLayer("File.psb"), "Detect multilayer file");
}

function testDocStillOpen() {
	
	var docRef = app.documents.add( 200, 200 )

	assertEquals(true, PsdLib.isDocumentStillOpen(docRef), "doc should still be open");
	app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
	assertEquals(false, PsdLib.isDocumentStillOpen(docRef), "doc should now be closed");
}

function testGetLayerSizes() {
	// Note: Running this test will trigger any plugin asking the user whether they want to edit the original...
	// If this triggers this file's included canLinkIt tool asking about opening it, we could do the following. But it's the plugin in Photoshop asking during this stage, usually.
	//debug_EditedSOHelper_autoAnswerOpenSO=false;

	
	var file=new File(rootPath+endOfPath+"Files/SizingIssue/TestGettingBoundsOnThis.psd");
	app.open(file);

	var allBounds=PsdLib.getBoundsOfAllLayers();
	assertEquals(16,allBounds.left,"Expected left");
	assertEquals(216,allBounds.right,"Expected right");
	assertEquals(16,allBounds.top,"Expected top");
	assertEquals(216,allBounds.bottom,"Expected bottom");
	assertEquals(200,allBounds.width,"Expected width");
	assertEquals(200,allBounds.height,"Expected height");
	
	allBounds=PsdLib.getLayerBounds();
	assertEquals(16,allBounds.left,"Expected left");
	assertEquals(216,allBounds.right,"Expected right");
	assertEquals(16,allBounds.top,"Expected top");
	assertEquals(216,allBounds.bottom,"Expected bottom");
	assertEquals(200,allBounds.width,"Expected width");
	assertEquals(200,allBounds.height,"Expected height");
	
	var internalBounds=PsdLib.getSmartObjectInternalBounds();
	assertEquals(100,internalBounds.left,"Expected left");
	assertEquals(300,internalBounds.right,"Expected right");
	assertEquals(100,internalBounds.top,"Expected top");
	assertEquals(300,internalBounds.bottom,"Expected bottom");
	assertEquals(200,internalBounds.width,"Expected width");
	assertEquals(200,internalBounds.height,"Expected height");
	
	
	app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}


closeAllDocuments();

testMultiLayer();
testDocStillOpen();
testGetLayerSizes();

// The next line will show up in the JavaScript Console in ExtendScript Toolkit, so it works to check on errors:
$.writeln(errorMessages+"\n"+
"PsdLib.jsxinc tests are complete. Total errors: "+errorCount);
