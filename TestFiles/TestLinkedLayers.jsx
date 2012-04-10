#includepath "../LinkDox/JSX"
#include "CanLinkIt.jsx"
#include "UnitTestLib.jsxinc"
#include "TestFiles.jsxinc"
#include "XMLLib.jsxinc"
#include "Logging.jsxinc"

#include "PsdLib.jsxinc"

// After this gets included in CanLinkIt.jsx, we won't need this line anymore
#include "LinkedLayers.jsxinc"


function testOneFile() {
	app.open(testAssembledFile1);
	var search = new LinkedLayers();
	
	var count=0;
	while (search.continueFindingLinkedLayers())
		count++;
		
	/*$.writeln("count="+count);
	$.writeln(search);*/

	assertEquals(null, search.currentDocumentToSearch, "TestLinkedLayers.jsx/testOneFile(): 10: After finishing searching, the current document should be null.");
	assertEquals(1, search.documentInfos.length, "TestLinkedLayers.jsx/testOneFile(): 20: After finishing searching, we should have searched 1 document.");
	assertEquals(app.documents[0], search.documentInfos[0].document,  "TestLinkedLayers.jsx/testOneFile(): 30: After finishing searching, we should have searched 1 document, which is the open document.");
	assertEquals(0, search.documentInfos[0].layerGroupsToSearch.length,  "TestLinkedLayers.jsx/testOneFile(): 40: After finishing searching, we should have searched 1 document, and it should have nothing left to search.");
	
	assertEquals(1, search.documentInfos[0].linkedLayers.length,  "TestLinkedLayers.jsx/testOneFile(): 50: After finishing searching, we should have searched 1 document, and it should have one linked layer.");

	checkForLayerNeedToBeUpdated(search.documentInfos[0].linkedLayers[0].name);

	app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}

function testMultipleOpenFiles() {
	var documents = new Array(testAssembledFile1,testAssembledFile2,testAssembledFile3,testEmptyFile,testMovedDestinationFile,testFileWithLotsOfLayers,testFileWithLotsOfLayersAndLinks);
	var expectedNumberOfLinks = new Array(1,
		5,
		1,
		0,
		1,/*testMovedDestinationFile*/
		0,
		7/*button style*/+6/*baby and people*/+4/*lorem ipsum*/+3/*border image*/);
	for (var i=0; i<documents.length; i++)
		app.open(documents[i]);

	var search = new LinkedLayers();
	
	var count=0;
	while (search.continueFindingLinkedLayers())
		count++;
		
	/*$.writeln("count="+count);
	$.writeln(search);*/
	
	assertEquals(null, search.currentDocumentToSearch, "TestLinkedLayers.jsx/testMultipleOpenFiles(): 10: After finishing searching, the current document should be null.");
	assertEquals(documents.length, search.documentInfos.length, "TestLinkedLayers.jsx/testMultipleOpenFiles(): 20: After finishing searching, we should have searched "+documents.length+" documents.");
	for (var i=0; i<documents.length; i++) {	
		assertEquals(app.documents[i], search.documentInfos[i].document,  "TestLinkedLayers.jsx/testMultipleOpenFiles(): 30: Each document should match itself in the list.");
		assertEquals(0, search.documentInfos[i].layerGroupsToSearch.length,  "TestLinkedLayers.jsx/testMultipleOpenFiles(): 40: Each document should have nothing remaining to search.");
		assertEquals(expectedNumberOfLinks[i], search.documentInfos[i].linkedLayers.length,  "TestLinkedLayers.jsx/testMultipleOpenFiles(): 50: The "+i+"th document, named "+documents[i]+
			" should have "+expectedNumberOfLinks[i]+" linked layer(s).");
		
	}
	
	for (var i=0; i<documents.length; i++)
		app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}



closeAllDocuments();
testOneFile();
testMultipleOpenFiles();

$.writeln("\n\n\n"+errorMessages+"\n"+
"TestSearchForLinkedLayer.jsx tests are complete. total of errors: "+errorCount);