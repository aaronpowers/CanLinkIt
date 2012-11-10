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

/*if (typeof canLinkIt=="undefined")
	$.writeln("canLinkIt is undefined");
else
	$.writeln("canLinkIt is defined");*/

// Include the folder we keep all JSX files in:
#includepath "../LinkDox/JSX"
#include "CanLinkIt.jsx"
#include "UnitTestLib.jsxinc"
#include "TestFiles.jsxinc"

/*if (typeof canLinkIt=="undefined")
	$.writeln("canLinkIt is undefined");
else
	$.writeln("canLinkIt is defined");*/
/*Because of the following line, it's no longer necessary to do change a dropdown in extenscript, by going to just above the top of this script, change the dropdown from 
	"ExtendScript Toolkit CS5" to one of the "Adobe Photoshop" selections*/
#target photoshop


//canLinkIt.updateSelected();
canLinkIt.editedSOHelper.userRequestsEditSO();
/*function doTest() {
	var outsideBounds=PsdLib.getLayerBounds();
	var internalBounds=PsdLib.getSmartObjectInternalBounds();

	$.writeln("hi");
}*/

//doTest();


//activeDocument.mergeVisibleLayers();
//activeDocument.activeLayer.rasterize(RasterizeType.ENTIRELAYER);