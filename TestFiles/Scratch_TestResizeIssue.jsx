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

/*function resizeLayer(Pixel){
var doc = activeDocument;
var res= doc.resolution;
var LB = activeDocument.activeLayer.bounds;
var Height = LB[3].value - LB[1].value;
var onePix = 100/Height;
var newSize = onePix * Pixel; 
doc.activeLayer.resize( newSize , newSize, AnchorPosition.MIDDLECENTER); 
}	*/
		
		/**Restore the size
					This iterative method, thought commented below like it works, doesn't work either.
			
			For some reason, Photoshop's resize method doesn't actually work off the percentage you'd expect. I'm not quite sure what's going wrong with this...
			However, there is this awkward workaround.
			So I had to do two things to make this work:
			(1) When resizing, we don't rescale exactly to the % you'd expect to scale to.
			(2) I use iterations -- so if it's off by a pixel due to a rounding error, it will rescale again until it's perfect or we give up after 9 tries.
			
			I've managed to get it down to work in 1 iteration on most of my tests.
			However, in at least one test left, SmallSizeLinkedToLoremIpsum.psd it still takes 8 iterations. So this is still necessary.
			In those iterations, the first scall down doesn't scale down far enough (by 1 pixel), the next scales down too far, and the rest scale up not enough. Yuck.
			*/


		for (var i=0; i<9; i++) {
			logIt("\tCanLinkIt.loadFileIntoSmartObjectLayer: count="+i+":");
			var newX=layerRef.bounds[0].as("pixels");
			var newY=layerRef.bounds[1].as("pixels");
			logIt("\t\tLine 10");
			var newWidth=layerRef.bounds[2].as("pixels");
			var newHeight=layerRef.bounds[3].as("pixels");
			if (newWidth==0||newHeight==0) {
				alert("CanLinkIt failed to update this link, because it had trouble resizing it to the original size.");
				return actionDescriptor;
			}
			logIt("\t\tLine 20");
			if (originalWidth==newWidth && originalHeight==newHeight) {
				// don't do any resizing.
				logIt("\t\tdone resizing. width="+newWidth+", height="+newHeight);
				//alert("count="+i+": done resizing.");
				break;
			} else {
				var rescaleWidth=(originalWidth/newWidth)*100;
				var rescaleHeight=(originalHeight/newHeight)*100;
				logIt("\t\tLine 30");
		
				// When we do nothing in the next block, it would suceed at count=8. But we can do better.
				// When I set it to divide by 1.66666666666 below if it's greater, then it works in only one iteration.
				if (originalWidth<newWidth)
					rescaleWidth=rescaleWidth/1.66666666666;
				if (originalHeight<newHeight)
					rescaleHeight=rescaleHeight/1.66666666666;
				if (originalWidth==newWidth)
					rescaleWidth=100;
				/*else if (originalWidth>newWidth)
					rescaleWidth=rescaleWidth/5;
				else if (originalWidth<newWidth)
					rescaleWidth=rescaleWidth/1.333333333;// TODO*/
					
				if (originalHeight==newHeight)
					rescaleHeight=100;
				/*else if (originalHeight>newHeight)
					rescaleHeight=rescaleHeight/5;
				else if (originalHeight<newHeight)
					rescaleHeight=rescaleHeight/1.333333333;//TODO*/
					
				logIt("\t\twidth="+newWidth+" (target="+originalWidth+")\n"+
					"\t\t\theight="+newHeight+" (target="+originalHeight+")\n"+
					"\t\t\t... so.... \n"+
					"\t\t\trescaleWidth="+rescaleWidth+"\n"+
					"\t\t\trescaleHeight="+rescaleHeight);
				logIt("\t\tLine 99");
				layerRef.resize(rescaleWidth, rescaleHeight, AnchorPosition.MIDDLECENTER);
				logIt("\t\tLine 100");
			}
		}


/*Pixel=100;
var startRulerUnits = app.preferences.rulerUnits;
app.preferences.rulerUnits = Units.PIXELS;
var LB = activeDocument.activeLayer.bounds;
var Height = LB[3].value - LB[1].value;
var onePix = 100/Height;
var newSize = onePix * Pixel;
$.writeln("onePix="+onePix);
$.writeln("newSize="+newSize);
activeDocument.activeLayer.resize(newSize, newSize, AnchorPosition.MIDDLECENTER);

app.preferences.rulerUnits = startRulerUnits;*/


/*function resizeLayer(Width , Height, Constrain){//pixels
	if(!documents.length) return;
	if(activeDocument.activeLayer.isBackgroundLayer) return;
	var startRulerUnits = preferences.rulerUnits;
	preferences.rulerUnits = Units.PIXELS;
	var LB = activeDocument.activeLayer.bounds;
	var lWidth = 100/(LB[2].value - LB[0].value);
	var lHeight =100/(LB[3].value - LB[1].value);
	var NewWidth = lWidth * Width;
	var NewHeight = lHeight * Height;
	if(Constrain) NewHeight = NewWidth;
	activeDocument.activeLayer.resize(Number(NewWidth),Number(NewHeight),AnchorPosition.MIDDLECENTER); 
	app.preferences.rulerUnits = startRulerUnits;
}
resizeLayer(100,100);*/

//activeDocument.activeLayer.bounds[0]=100;


// Save info we'll need
var originalDocName = app.activeDocument.name;


// =======================================================
// Duplicate layer to new document
var idMk = charIDToTypeID( "Mk  " );
    var desc203 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref102 = new ActionReference();
        var idDcmn = charIDToTypeID( "Dcmn" );
        ref102.putClass( idDcmn );
    desc203.putReference( idnull, ref102 );
    var idUsng = charIDToTypeID( "Usng" );
        var ref103 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref103.putEnumerated( idLyr, idOrdn, idTrgt );
    desc203.putReference( idUsng, ref103 );
    var idVrsn = charIDToTypeID( "Vrsn" );
    desc203.putInteger( idVrsn, 5 );
executeAction( idMk, desc203, DialogModes.NO );

app.activeDocument.resizeImage(100,100);


// =======================================================
// Copy it back: notice the layer and file names below.
var idDplc = charIDToTypeID( "Dplc" );
    var desc208 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var ref108 = new ActionReference();
        var idLyr = charIDToTypeID( "Lyr " );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );
        ref108.putEnumerated( idLyr, idOrdn, idTrgt );
    desc208.putReference( idnull, ref108 );
    var idT = charIDToTypeID( "T   " );
        var ref109 = new ActionReference();
        var idDcmn = charIDToTypeID( "Dcmn" );
        ref109.putName( idDcmn, originalDocName );
    desc208.putReference( idT, ref109 );
    var idNm = charIDToTypeID( "Nm  " );
    desc208.putString( idNm, app.activeDocument.activeLayer.name );
    var idVrsn = charIDToTypeID( "Vrsn" );
    desc208.putInteger( idVrsn, 5 );
executeAction( idDplc, desc208, DialogModes.NO );


// Close duplicated document:
app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);