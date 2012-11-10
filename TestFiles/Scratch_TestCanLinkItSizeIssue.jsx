#target photoshop
#include "UnitTestLib.jsxinc"



// Include the folder we keep all JSX files in:
#includepath "../LinkDox/JSX"
#include "CanLinkIt.jsx"
#include "UnitTestLib.jsxinc"
#include "TestFiles.jsxinc"

/*Because of the following line, it's no longer necessary to do change a dropdown in extenscript, by going to just above the top of this script, change the dropdown from 
	"ExtendScript Toolkit CS5" to one of the "Adobe Photoshop" selections*/
#target photoshop


function testSizeIssue() {
//	try {
		app.open(testResizedFile);
		var layerName="LoremIpsum";
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

//testSizeIssue();
canLinkIt.updateSelected();
//checkForLayerIsUpToDate("LoremIpsum");
