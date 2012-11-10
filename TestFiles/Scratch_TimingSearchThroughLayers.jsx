
#target photoshop

#includepath "../LinkDox/JSX"
/*#include "CanLinkIt.jsx"*/
#include "TestFiles.jsxinc"
#include "PsdLib.jsxinc"
#include "XMLLib.jsxinc"
#include "Logging.jsxinc"
#include "UnitTestLib.jsxinc"

#include "../../Resources/xtools-1_7_5/xtools/xlib/stdlib.js"


/***************************
	Some sample results:
	
app.open(testFileWithLotsOfLayersAndLinks);	
	
	---------------------
Number of layers to search through: 46
Time: 0.008
Found Layers 1: 21
Time1: 2.257
Found layers 2: 34
Time2: 4.037
Found Layers 3: 21
Time3: 2.006
Method 4 (Stdlib): 21
Time4: 1.362
Method 5: Found 13 smart layers.
Time5: 0.158
Result: undefined

-----------------------------------------------------------
on FileWithTonsOfLayers.psd
---------------------
Number of layers to search through: 56
Time: 0.007
Found Layers 1: 31
Time1: 15.811
Found layers 2: 44
Time2: 7.306
Found Layers 3: 31
Time3: 14.406
Method 4 (Stdlib): 31
Time4: 10.14

	
	
	
	*********************************/


///////////////////////////////////////////////////////////////////////////////
// Object: Timer
// Usage: Time how long things take or delay script execution
// Input: <none>
// Return: Timer object
// Example:
//
//   var a = new Timer();
//   for (var i = 0; i < 2; i++)
//      a.pause(3.33333);
//   a.getElapsed();
//  jeff tranberry
///////////////////////////////////////////////////////////////////////////////
function Timer2() {
   // member properties
   this.startTime = new Date();
   this.endTime = new Date();
   
   // member methods
   
   // reset the start time to now
   this.start = function () { this.startTime = new Date(); }
   
   // reset the end time to now
   this.stop = function () { this.endTime = new Date(); }
   
   // get the difference in milliseconds between start and stop
   this.getTime = function () { return (this.endTime.getTime() - this.startTime.getTime()) / 1000; }
   
   // get the current elapsed time from start to now, this sets the endTime
   this.getElapsed = function () { this.endTime = new Date(); return this.getTime(); }
   
   // pause for this many seconds
   this.pause = function ( inSeconds ) { 
      var t = 0;
      var s = new Date();
      while( t < inSeconds ) {
         t = (new Date().getTime() - s.getTime()) / 1000;
      }
   }
}


/***********************************
* Search technique 1
*/
function getLayersFromLayers(layersToSearch) {
	var layers = new Array();
	
	for (var i=0; i<layersToSearch.length; i++) {
		var className=getClassName(layersToSearch[i]);
		if (className=="ArtLayer")
			layers.push(layersToSearch[i]);
		else if (className=="LayerSet")
			layers = layers.concat(getLayersFromLayers(layersToSearch[i].layers));
		else {
			logIt("getLayersFromLayerSet: We got a layer type that was unrecognized. We need to handle it: "+className);
			if (typeof BREAK_ON_UNEXPECTED!= "undefined") $.bp();
		}
	}
	return layers;
}



function findLayers1() {
	var layers = getLayersFromLayers(activeDocument.layers);
		
	$.writeln("Found Layers 1: "+layers.length);
	return layers;
}

/***********************************
* Search technique 2
* Make each one active in sequence.
*/
function findLayers2() {
	var layers = new Array();
	var numberOfLayers = PsdLib.prototype.getNumberOfLayers();
	//var result = "";
		
	for(var i = 0; i <= numberOfLayers; i++) {
		if (!PsdLib.prototype.isValidActiveLayer(i)) {
			//logIt("CanLinkIt.updateAnyThisDocLinkedTo: layer "+i+" is not a valid active layer");
			continue;
		}
		PsdLib.prototype.makeActiveByIndex(i, false );
		layers.push(activeDocument.activeLayer);
		//result+=activeDocument.activeLayer+"\n";
		
	}
	$.writeln("Found layers 2: "+layers.length);
	return layers;
}


/***********************************
* Search technique 3
* Go through the tree of ArtLayers.
*/
function getLayersFromArtLayersArray(artLayersArray) {
	var layers = new Array();
	for (var i=0; i<artLayersArray.length; i++) {
		layers.push(artLayersArray[i]);
	}
	return layers;

}

function getLayersFromLayerSet(layerSet) {
	var layers = new Array();
	layers = layers.concat(getLayersFromArtLayersArray(layerSet.artLayers));
	layers = layers.concat(getLayersFromLayerSets(layerSet.layerSets));
	
	return layers;
}

function getLayersFromLayerSets(layerSets) {
	var layers = new Array();
	for (var i=0; i<layerSets.length; i++) {
		layers = layers.concat(getLayersFromLayerSet(layerSets[i]));
	}
	return layers;
}

function findLayers3() {
	var layers = new Array();
	
	layers = layers.concat(getLayersFromArtLayersArray(activeDocument.artLayers));
	layers = layers.concat(getLayersFromLayerSets(activeDocument.layerSets));
	
	//$.writeln("Found Layers 3: "+layers.join("\n"));
	$.writeln("Found Layers 3: "+layers.length);

	return layers;
}

/***********************************
* Search technique 5: just finding one type of layer, based on selecting them all and working through them.
* This function currently assumes that we have testFileWithLotsOfLayersAndLinks open.
*/
function findLayers5() {
	// Step 1: First, find a layer of the type we want.
	var smartObjectLayer = null;
	if (activeDocument.activeLayer.kind == LayerKind.SMARTOBJECT) {
		smartObjectLayer = activeDocument.activeLayer;
	} else {
		// TODO!
	}
	
	// Step 2: Select all layers of the same type
	
	// =======================================================
	var idselectSimilarLayers = stringIDToTypeID( "selectSimilarLayers" );
	var desc38 = new ActionDescriptor();
	var idnull = charIDToTypeID( "null" );
	var ref6 = new ActionReference();
	var idLyr = charIDToTypeID( "Lyr " );
	ref6.putName( idLyr, "ButtonStyle copy 5"/*activeDocument.activeLayer.name*/);
	desc38.putReference( idnull, ref6 );
	executeAction( idselectSimilarLayers, desc38, DialogModes.NO );

	// Step 3: Get the indexes for the selected layers
	var selectedLayers = PsdLib.prototype.getSelectedLayersIndex();
	for (var i=0; i<selectedLayers.length; i++) {
		//$.writeln("#"+i+": index="+selectedLayers[i]);
	}
	$.writeln("Method 5: Found "+selectedLayers.length+" smart layers.");

	// Step 4: Use the selected layers.

}

// Let's open a file to start with.
//app.open(testFileWithLotsOfLayersAndLinks);

$.writeln("\n\n---------------------");
var myTimer =null;
myTimer = new Timer2();
$.writeln("Number of layers to search through: "+PsdLib.prototype.getNumberOfLayers());
$.writeln("Time: "+myTimer.getElapsed());

// Timing this section
myTimer = new Timer2();
findLayers1();
$.writeln("Time1: "+myTimer.getElapsed());

myTimer = new Timer2();
// Timing this section
findLayers2();
$.writeln("Time2: "+myTimer.getElapsed());

myTimer = new Timer2();
// Timing this section
findLayers3();
$.writeln("Time3: "+myTimer.getElapsed());

myTimer = new Timer2();
// Timing this section
var list = Stdlib.getLayersList(activeDocument);
$.writeln("Method 4 (Stdlib): "+list.length);
$.writeln("Time4: "+myTimer.getElapsed());

myTimer = new Timer2();
// Timing this section
findLayers5();
$.writeln("Time5: "+myTimer.getElapsed());


//$.writeln("------------------------------");
