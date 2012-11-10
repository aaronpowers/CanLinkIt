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
#include "UnitTestLib.jsxinc"
#include "TestFiles.jsxinc"

/*Because of the following line, it's no longer necessary to do change a dropdown in extenscript, by going to just above the top of this script, change the dropdown from 
	"ExtendScript Toolkit CS5" to one of the "Adobe Photoshop" selections*/
#target photoshop

app.open(new File(rootPath+endOfPath+"Files/ForPlaceEventTest/HasUnlinkedSmartObject.psd"));



var arguments=[];
arguments[0]=new Object();
arguments[0].getPath = function(unused) {
	return testLinkToFile;
};
arguments[1]=charIDToTypeID('Plc ');

#include "NotificationReceiverPlace.jsx"
// TODO, now see if it worked.
#include "CanLinkIt.jsx"


var layerName="HasASlice";
var layerRef = makeLayerNamedActive(layerName);
		
// Note that selection doesn't always work, I'm not sure why (perhaps there's a delay?), so we're just going to pass it in.
var xml = canLinkIt.getActiveLayerInfo("1");
checkForLayerIsUpToDate(layerName);	
assertXMLHasProperty("uri", testLinkToFile.fullName, xml,
	"testExistingImageLink: The XML should include a property with the uri being the path to the file, but it' doesn't.");
assertXMLHasProperty("relativeURI", linksXMP.getRelativeFilePath(testLinkToFile), xml,
	"testExistingImageLink: The XML should include a property with the relativeURI being the relative path to the file, but it' doesn't.");
	
	
			
app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);

$.writeln(errorMessages+"\n"+
"Test_NotificationReceiverPlace.jsx tests are complete. Total errors: "+errorCount);