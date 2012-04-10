
#target photoshop

#includepath "../LinkDox/JSX"
/*#include "CanLinkIt.jsx"
#include "UnitTestLib.jsxinc"
#include "TestFiles.jsxinc"*/
#include "PsdLib.jsxinc"
#include "XMLLib.jsxinc"
#include "Logging.jsxinc"
#include "UnitTestLib.jsxinc"

#include "../../Resources/xtools-1_7_5/xtools/xlib/stdlib.js"



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
	
	//for (var i=0; i<layerSet.layerSet.length; i++) {
		/*var className=getClassName(layerSet[i]);
		if (className=="ArtLayer")
			layers.push(layerSet[i]);
		else if (className=="LayerSet")*/
	//		layers = layers.concat(getLayersFromLayerSet(layerSet.layerSet[i]));
		/*else {
			logIt("getLayersFromLayerSet: We got a layer type that was unrecognized. We need to handle it: "+className);
			if (typeof BREAK_ON_UNEXPECTED!= "undefined") $.bp();
		}*/
	//}
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
	
	/*layers = layers.concat(getLayersFromArtLayersArray(activeDocument.artLayers));
	layers = layers.concat(getLayersFromLayerSets(activeDocument.layerSets));*/
	/*var result="";
	for (var i=0; i<activeDocument.artLayers.length; i++) {
		result+=activeDocument.artLayers[i]+"\n";
		layers.push(activeDocument.artLayers[i]);
	}*/
	
	//$.writeln("Found Layers 1: "+layers.join("\n"));
	$.writeln("Found Layers 1: "+layers.length);
	return layers;
}

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
$.writeln("Method 4: "+list.length);
$.writeln("Time4: "+myTimer.getElapsed());

