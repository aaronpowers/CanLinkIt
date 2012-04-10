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
#include "UnitTestLib.jsxinc"
#include "TestFiles.jsxinc"

/*Because of the following line, it's no longer necessary to edit extenscript by going to just above the top of this script, change the dropdown from 
	"ExtendScript Toolkit CS5" to one of the "Adobe Photoshop" selections -- whichever one you want to test */
#target photoshop

// TEST TODO
// test multipleLayersSelected







function testNoDocumentsOpen() {
	try {
		// Test with no documents open
		var xml = canLinkIt.getActiveLayerInfo("1");
		checkForXMLBasics(xml);
		assertEquals(true, xml.indexOf("<property id=\""+XMPObjectTags.HAS_DOC+"\"><false/></property>")>-1,
			"testNoDocumentsOpen: The XML should include a property, "+XMPObjectTags.HAS_DOC+"=false, but it doesn't.\nxml="+xml);
		assertEquals(true, xml.indexOf("<property id=\"isSO\"><false/></property>")>-1,"testNoDocumentsOpen: The XML should include a property, isSO=false, but it doesn't.\nxml="+xml);
		assertEquals(true, xml.indexOf("<property id=\"hasLink\"><false/></property>")>-1, "testNoDocumentsOpen: The XML should include a property, hasLink=false, but it' doesn't.\nxml="+xml);
		assertEquals(true, xml.indexOf("<property id=\"isValid\"><false/></property>")>-1, "testNoDocumentsOpen: The XML should include a property, isValid=false, but it' doesn't.\nxml="+xml);
		assertEquals(true, xml.indexOf("<property id=\"layerName\"><string></string></property>")>-1, "testNoDocumentsOpen: The XML should include a property, layerName=\"\", but it' doesn't.\nxml="+xml);
		assertEquals(true, xml.indexOf("<property id=\"isCurrent\"><false/></property>")>-1, "testNoDocumentsOpen: The XML should include a property, isCurrent=false, but it' doesn't.\nxml="+xml);
	} catch (e) {
		alert("Uncaught Error Message in TestcanLinkIt.jsx/testNoDocumentsOpen(): "+e);
	}	
}

function testExistingDocument() {
//	try {
		app.open(testAssembledFile1);
		var layerName="LinkedSmartObject";
		var layerRef = makeLayerNamedActive(layerName);
		
		// Note that selection doesn't always work, I'm not sure why (perhaps there's a delay?), so we're just going to pass it in.
		var xml = canLinkIt.getActiveLayerInfo("1");
		// Check to make sure it's linked, but is out of date.
		checkForLayerNeedToBeUpdated(layerName);
		assertXMLHasProperty("isCurrent", false, xml, "testExistingDocument: The XML should include a property, isCurrent=false, but it' doesn't.");
		assertXMLHasProperty("uri", originalRootPath+endOfPath+"Files/Folder2/LinkToThese/BorderImageExample.psd",xml,
			"testExistingDocument: The XML should include a property with the uri being the path to the file, but it' doesn't.");
		assertEquals(true, xml.indexOf("<property id=\"relativeURI\"><string>../../Folder2/LinkToThese/BorderImageExample.psd</string></property>")>-1,
			"testExistingDocument: The XML should include a property with the relativeURI being the relative path to the file, but it' doesn't.\nxml="+xml);	
		
		// Update it and make sure it was updated.
		canLinkIt.updateSelected();
		xml = canLinkIt.getActiveLayerInfo("1");
		checkForLayerIsUpToDate(layerName);
		// note: we don't check for the full URI, just for the basic end of the path in case the other developer has this in a different folder -- the full path would have been updated to include their path:
		
		assertXMLHasProperty("uri", rootPath+endOfPath+"Files/Folder2/LinkToThese/BorderImageExample.psd",xml,
			"testExistingDocument: The XML should include a property with the uri being the path to the file, but it' doesn't.");
		/*assertEquals(true, xml.indexOf("FlashBuilderProject/TestFiles/Files/Folder2/LinkToThese/BorderImageExample.psd</string></property>")>-1,
			"testExistingDocument: The XML should include a property with the uri being the path to the file, but it' doesn't.\nxml="+xml);*/
		assertEquals(true, xml.indexOf("<property id=\"relativeURI\"><string>../../Folder2/LinkToThese/BorderImageExample.psd</string></property>")>-1,
			"testExistingDocument: The XML should include a property with the relativeURI being the relative path to the file, but it' doesn't.\nxml="+xml);
		
		//logIt(xml);
		
		layerName="SmartObjectNotLinked";
		layerRef = makeLayerNamedActive(layerName);
		xml = canLinkIt.getActiveLayerInfo("1");//canLinkIt.getLayerInfo(layerRef);
		checkForXMLBasics(xml);
		assertEquals(true, xml.indexOf("<property id=\"layerName\"><string>"+layerName+"</string></property>")>-1, "testExistingDocument: The XML should include a property, layerName="+layerName+", but it' doesn't.\nxml="+xml);
		assertEquals(true, xml.indexOf("<property id=\"isSO\"><true/></property>")>-1,"testExistingDocument: The XML should include a property, isSO=true, but it doesn't.\nxml="+xml);
		assertEquals(true, xml.indexOf("<property id=\"hasLink\"><false/></property>")>-1, "testExistingDocument: The XML should include a property, hasLink=false, but it' doesn't.\nxml="+xml);
		assertEquals(true, xml.indexOf("<property id=\"isValid\"><false/></property>")>-1, "testExistingDocument: The XML should include a property, isValid=false, but it' doesn't.\nxml="+xml);
		assertEquals(true, xml.indexOf("<property id=\"isCurrent\"><false/></property>")>-1, "testExistingDocument: The XML should include a property, isCurrent=false, but it' doesn't.\nxml="+xml);
							
		//canLinkIt.updateAll();
		app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
/*	} catch (e) {
		alert("Uncaught Error Message in TestCanLinkIt.jsx/testExistingDocument(): "+e);
	}*/	

}

function testExistingImageLink() {
	try {
		app.open(testAssembledFile3);
		var layerName="ImageFile";
		var layerRef = makeLayerNamedActive(layerName);
		
		// Note that selection doesn't always work, I'm not sure why (perhaps there's a delay?), so we're just going to pass it in.
		var xml = canLinkIt.getActiveLayerInfo("1");
		// Check to make sure it's linked, but is out of date.
		checkForLayerNeedToBeUpdated(layerName);
		assertEquals(true, xml.indexOf("<property id=\"isCurrent\"><false/></property>")>-1, "testExistingImageLink: The XML should include a property, isCurrent=false, but it' doesn't.\nxml="+xml);
		assertXMLHasProperty("uri", originalRootPath+endOfPath+"Files/Folder2/LinkToThese/ImageFile.png", xml,
			"testExistingImageLink: The XML should include a property with the uri being the path to the file, but it' doesn't.");
		assertEquals(true, xml.indexOf("<property id=\"relativeURI\"><string>../../Folder2/LinkToThese/ImageFile.png</string></property>")>-1,
			"testExistingImageLink: The XML should include a property with the relativeURI being the relative path to the file, but it' doesn't.\nxml="+xml);	
		
		// Update it and make sure it was updated.
		canLinkIt.updateSelected();
		xml = canLinkIt.getActiveLayerInfo("1");
		checkForLayerIsUpToDate(layerName);
		assertXMLHasProperty("uri", rootPath+endOfPath+"Files/Folder2/LinkToThese/ImageFile.png",xml,
			"testExistingImageLink: The XML should include a property with the uri being the path to the file, but it' doesn't.\nxml="+xml);
		assertEquals(true, xml.indexOf("<property id=\"relativeURI\"><string>../../Folder2/LinkToThese/ImageFile.png</string></property>")>-1,
			"testExistingImageLink: The XML should include a property with the relativeURI being the relative path to the file, but it' doesn't.\nxml="+xml);	
			
		//canLinkIt.updateAll();
		app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
	} catch (e) {
		alert("Uncaught Error Message in TestCanLinkIt.jsx/testExistingImageLink(): "+e);
	}	

}





function testMovedDocument() {
	try {
		app.open(testMovedDestinationFile);
		
		var layerName="MovedFile";
		var layerRef = makeLayerNamedActive(layerName);
		
		var xml = canLinkIt.getActiveLayerInfo("1");
		// Check to make sure it's linked, but is out of date.
		checkForLayerNeedToBeUpdated(layerName);
		assertXMLHasProperty("uri",originalRootPath+endOfPath+"Files/Folder2/LinkToThese/MovedFile.psd",xml,
			"testMovedDocument: The XML should include a property with the uri being the path to the file, but it' doesn't.\nxml="+xml);
		assertXMLHasProperty("relativeURI", "MovedFile.psd",xml,
			"testMovedDocument: The XML should include a property with the relativeURI being the relative path to the file, but it' doesn't.\nxml="+xml);

		
		// Update it and make sure it was updated.
		canLinkIt.updateSelected();
		xml = canLinkIt.getActiveLayerInfo("1");
		checkForLayerIsUpToDate(layerName);
		// note: we don't check for the full URI, just for the basic end of the path in case the other developer has this in a different folder -- the full path would have been updated to include their path:	
		assertEquals(true, xml.indexOf("FlashBuilderProject/TestFiles/FilesMoved/MovedFile.psd</string></property>")>-1,
			"testMovedDocument: The XML should include a property with the uri being the path to the file, but it' doesn't.\nxml="+xml);
		assertXMLHasProperty("relativeURI","MovedFile.psd",xml,
			"testMovedDocument: The XML should include a property with the relativeURI being the relative path to the file, but it' doesn't.\nxml="+xml);

		//logIt(xml);
		
		app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
	} catch (e) {
		alert("Uncaught Error Message in TestCanLinkIt.jsx/testMovedDocument(): "+e);
	}	

}


function testNewDocument() {
	try {
		logIt("testNewDocument():");

		var docRef = app.documents.add( 200, 200 )
		
		// background layer is selected, and it can't be linked because it's an unsaved document.
		var xml = canLinkIt.getActiveLayerInfo("1");
		logIt(xml);
		// Check to make sure it's not a link, nor even a smart object (since it's a background layer):
		checkForXMLBasics(xml);
		assertEquals(true, xml.indexOf("<property id=\""+XMPObjectTags.HAS_DOC+"\"><false/></property>")>-1,
			"testNewDocument: The XML should include a property, "+XMPObjectTags.HAS_DOC+"=false, but it doesn't.\nxml="+xml);
		assertEquals(true, xml.indexOf("<property id=\"unsaved\"><true/></property>")>-1,
			"testNewDocument: The XML should include a property, unsaved=true, but it doesn't.\nxml="+xml);
		assertXMLHasProperty("isSO",false,xml,"testNewDocument: The XML should include a property, isSO=false, but it doesn't.\nxml="+xml);
		assertXMLHasProperty("hasLink",false,xml, "testNewDocument: The XML should include a property, hasLink=false, but it' doesn't.\nxml="+xml);
		assertXMLHasProperty("isValid",false,xml, "testNewDocument: The XML should include a property, isValid=false, but it' doesn't.\nxml="+xml);
		assertXMLHasProperty("layerName","",xml, 
			"testNewDocument: The XML should include a property, layerName=\"\", but it' doesn't.\nxml="+xml);
		assertXMLHasProperty("isCurrent",false,xml, "testNewDocument: The XML should include a property, isCurrent=false, but it' doesn't.\nxml="+xml);
		
		app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
	} catch (e) {
		alert("Uncaught Error Message in TestCanLinkIt.jsx/testNewDocument(): "+e);
	}
}



function testUpdateAllLinks() {
	try {
		logIt("testUpdateAllLinks():");
		app.open(testAssembledFile2);
		// note that due to a limit in how we're searching and checking for names, each layer has to have a unique name to perform this test. So we'll edit  the file so it's got uniquely named layers.
		var layerNames = ["LinkedSmartObject", "BorderImageExample", "BorderImageExample2","BorderImageExample-b","BorderImageExample2-b"];
		
		for (var i=0; i<layerNames.length; i++) {
			var layerRef = makeLayerNamedActive(layerNames[i]);
			checkForLayerNeedToBeUpdated(layerNames[i]);
		}

		canLinkIt.updateAll();

		for (var i=0; i<layerNames.length; i++) {
			var layerRef = makeLayerNamedActive(layerNames[i]);
			checkForLayerIsUpToDate(layerNames[i]);
		}

		app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
	} catch (e) {
		alert("Uncaught Error Message in TestCanLinkIt.jsx/testUpdateAllLinks(): "+e);
	}
}

/******************************
	* testNewLink
	* test the newLinkTo function
	*/
function testNewLink() {
	try {
		// I've seen a bug where I create a new link and it doesn't get linked. I don't know why.	
		app.open(testEmptyFile);

		canLinkIt.newLinkTo(testLinkToFile);

		var layerName="BorderImageExample2";
		var xml = canLinkIt.getActiveLayerInfo("1");
		xml = canLinkIt.getActiveLayerInfo("1");
		checkForLayerIsUpToDate(layerName);	
		
		assertEquals(true, xml.indexOf("<property id=\"isCurrent\"><true/></property>")>-1, "testNewLink: The XML should include a property, isCurrent=true, but it' doesn't.\nxml="+xml);
		assertEquals(true, xml.indexOf("FlashBuilderProject/TestFiles/Files/Folder2/LinkToThese/BorderImageExample2.psd</string></property>")>-1,
			"testNewLink: The XML should include a property with the uri being the path to the file, but it' doesn't.\nxml="+xml);
		assertEquals(true, xml.indexOf("<property id=\"relativeURI\"><string>../Folder2/LinkToThese/BorderImageExample2.psd</string></property>")>-1,
			"testNewLink: The XML should include a property with the relativeURI being the relative path to the file, but it' doesn't.\nxml="+xml);	
		
		app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
	} catch (e) {
		alert("Uncaught Error Message in TestCanLinkIt.jsx/testNewLink(): "+e);
	}
}

/**************************
	* testNewLinksPieces -- test the individual pieces that go into creating a new link, without using the actual function itself.
	*
	*/
function testNewLinksPieces() {
	// I've seen a bug where I create a new link and it doesn't get linked. I don't know why.	
	app.open(testEmptyFile);
	
	// we have 16 smart object layers that we can fake with layer information to see if the layer info is saved properly.
	for (var i=0; i<16; i++) {
		// TODO: figure out how to place files programmatically
		
		canLinkIt.saveLinkInfoFor(testLinkToFile);
		var layerRef = makeLayerNamedActive(app.activeDocument.activeLayer.name);
		checkForLayerIsUpToDate(app.activeDocument.activeLayer.name);
		canLinkIt.updateSelected();
		checkForLayerIsUpToDate(app.activeDocument.activeLayer.name);
		layerRef.remove();
	}
		
	app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}

function testUpdateThisImageCheckSize() {
	var layerRef = app.activeDocument.activeLayer;
	// The place command changes the size of the object to the original size... We don't want that, we want the current size the user has set on the object. So...
	// Save the original size
	var originalX=layerRef.bounds[0].as("pixels");
	var originalY=layerRef.bounds[1].as("pixels");
	var originalWidth=layerRef.bounds[2].as("pixels");
	var originalHeight=layerRef.bounds[3].as("pixels");

	// do the actual place
	checkForLayerNeedToBeUpdated(app.activeDocument.activeLayer.name);
	canLinkIt.updateSelected();
	checkForLayerIsUpToDate(app.activeDocument.activeLayer.name);

	// Check if it's the right size
	assertEquals(originalX,layerRef.bounds[0].as("pixels"),"x value");
	assertEquals(originalY,layerRef.bounds[1].as("pixels"),"y value");
	assertEquals(originalWidth,layerRef.bounds[2].as("pixels"),"width");
	assertEquals(originalHeight,layerRef.bounds[3].as("pixels"),"height");
}

function testSizeOfUpdatedImage() {
	// I saw a bug that if the placed layer is rescaled for any reason, when the user updates it goes to the original size.
	app.open(testResizedFile3);
	testUpdateThisImageCheckSize();
	app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
	
	app.open(testResizedFile2);
	testUpdateThisImageCheckSize();
	app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
	
	app.open(testResizedFile);
	testUpdateThisImageCheckSize();
	app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}

function testCollapsingDotDotSlashes() {
	
	assertEquals("test/lasa", canLinkIt.removeExtraDotDotSlashesFromFilename("test/lasa"),"No slashes to resolve, so it should stay the same.");
	assertEquals("test/MyFile.psd", canLinkIt.removeExtraDotDotSlashesFromFilename("test/lasa/../MyFile.psd"),"No slashes to resolve, so it should stay the same.");
	assertEquals("../File.psd", canLinkIt.removeExtraDotDotSlashesFromFilename("../File.psd"),"No path at start to remove, so it will stay the same.");
	assertEquals("/MyFile.psd", canLinkIt.removeExtraDotDotSlashesFromFilename("removeme/../MyFile.psd"),"No path at start to remove, so it will stay the same.");
	assertEquals("lar/MyFile.psd", canLinkIt.removeExtraDotDotSlashesFromFilename("lar/removeme/../MyFile.psd"),"No path at start to remove, so it will stay the same.");
	assertEquals("lar/MyFile.psd", canLinkIt.removeExtraDotDotSlashesFromFilename("lar/removeme/andme/../../MyFile.psd"),"No path at start to remove, so it will stay the same.");


}

/**************************************
	* Run the unit tests below
	*/
// The next line will show up in the JavaScript Console in ExtendScript Toolkit, so it works to check on errors:
closeAllDocuments();

testNoDocumentsOpen();
testNewDocument();
testExistingDocument();
testExistingImageLink();
testMovedDocument();
testUpdateAllLinks();
testNewLinksPieces();
testNewLink();
testSizeOfUpdatedImage();
testCollapsingDotDotSlashes();

// The next line will show up in the JavaScript Console in ExtendScript Toolkit, so it works to check on errors:
$.writeln(errorMessages+"\n"+
"TestCanLinkIt.jsx tests are complete. Total errors: "+errorCount);