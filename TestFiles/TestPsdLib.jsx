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

closeAllDocuments();

testMultiLayer();
testDocStillOpen();


// The next line will show up in the JavaScript Console in ExtendScript Toolkit, so it works to check on errors:
// The next line will show up in the JavaScript Console in ExtendScript Toolkit, so it works to check on errors:
$.writeln(errorMessages+"\n"+
"PsdLib.jsx tests are complete. Total errors: "+errorCount);
