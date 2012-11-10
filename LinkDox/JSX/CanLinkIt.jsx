/*********************************************
Copyright 2011 Aaron Powers
All Rights Reserved

CanLinkIt.jsx
*/
#target photoshop

// This set of includepaths is needed if CanLinkIt is not flattened before installation in the Photoshop directory. These are no longer necessary as we're flattening this file before delivery, however, in the case that we do something different or don't flatten it, we're leaving this code here for reference.
/*On Windows, the script home is from the Photoshop Folder on CS4, CS5, and CS5.1*/
//#includepath "Plug-ins/Panels/CanLinkIt/"
/*On Mac, the script home seems to be in different places for different versions of Photoshop.*/
/*This one is for Adobe Photoshop CS4 on a Mac:
	I found that Folder.current was relative to the Photoshop directory, Folder.current="Applications/Adobe Photoshop CS4/Adobe Photoshop CS4.app/Contents/MacOS/"
	So the following line makes it work on Adobe Photoshop CS4 on a Mac:
	*/
//#includepath "../../../Plug-ins/Panels/CanLinkIt/"
/*For Adobe Photoshop CS 5.0 (untested, but assumed to be the same as 5.1):*/
//#includepath "/Applications/Adobe Photoshop CS5.0/Plug-ins/Panels/CanLinkIt/"
/*For Adobe Photoshop CS 5.1:
	During my tests with Adobe Photoshop, I found that Folder.current="/" -- which is pretty much useless in getting a path. We'll need to flatten the files since we have no idea where CS5.1 is guaranteed to be installed.
	However, this will work temporarily:
	*/
//#includepath "/Applications/Adobe Photoshop CS5.1/Plug-ins/Panels/CanLinkIt/"

#include "Logging.jsxinc"
#include "XMPLib.jsxinc"
#include "XMLLib.jsxinc"
#include "PsdLib.jsxinc"
#include "PrefsLib.jsxinc"

// Helpers that are extensions of CanLinkIt.jsx functionality, e.g. these are co-dependent.
#include "EditedSOHelper.jsxinc"
#include "Action_UpdateAllFiles.jsxinc"
#include "Action_LinkTo.jsxinc"
#include "Action_LinkToLayerComp.jsxinc"
#include "LoadLinkedFiles.jsxinc"
#include "LinksXMP.jsxinc"
//#include "LinkedLayers.jsxinc"

/************************************************************************************************************
Variable Declarations
    **/

// Namespaces for XMP
ErrStrs = {};
ErrStrs.XMPLIB = "Technical error: Photoshop can't load XMP Script Library. This action cannot be performed."
ErrStrs.NO_FILE_OPEN="First you must open a file."
ErrStrs.CANT_UPDATE_NON_SMART_OBJECT="You cannot update a layer that's not a smart object.";

/************************************************************************************************************
Helper objects (global variables so they can be referenced by other files with persistent information within them)
    **/

var loadLinkedFiles=new LoadLinkedFiles();
var linksXMP=new LinksXMP();
var action_LinkTo = new Action_LinkTo();

/************************************************************************************************************
First unique code for this file below this point    
    **/


function CanLinkIt() {
	// Need to use the same namespace as the prior Links panel in order to be able to be backwards compatible with that panel.
	this.AdobeLinksNameSpace= 'http://www.smartobjectlinks.com/1.0/';
	this.xmpHelper = new XMPHelper(this.AdobeLinksNameSpace);
	this.prefs = new LDPrefs();	
	
	this.editedSOHelper=new EditedSOHelper(this);
	//this.linkedLayers = new LinkedLayers();
}

CanLinkIt.prototype.init = function(){
    //Called when the panel is initialized.
    // Set up listeners to get notifications on certain events
    app.notifiersEnabled = true
    /*var eventFile = new File(app.path +
    "/Plug-ins/Panels/CanLinkIt/NotificationRecieverTranslate.jsx")
    app.notifiers.add("Trnf", eventFile)*/
    // For Open File Notification:
    //app.notifiers.add("Opn ", eventFile)
	
	// On a place event:
    var eventFile = new File(app.path +  "/Plug-ins/Panels/CanLinkIt/NotificationReceiverPlace.jsx");
    app.notifiers.add("Plc ", eventFile);
	
	this.checkIfLinksInstalled();
}

CanLinkIt.prototype.checkIfLinksInstalled = function(){
	// check if the links panel is installed
	if(typeof reset == 'function' && typeof replaceSOLayerLink == 'function' && typeof getStatus =='function')
		alert("Warning:\n"+
		"The Links panel is installed in Photoshop. You should not use CanLinkIt at the same time as the Links panel -- please keep only one installed.\n"+
		"You will have strange and unusual bugs with both. Please uninstall one or the other.");
}


/*//////////////////////////////////////////////////////////////////////////////
// Function: getLayerInfo
// Description: Used to send data to Flex
// 
// Usage: Flex getLayerInfo()
// Input: Document (that the layer is in), Layer (to get info about)
// Return: XML
// Assumptions: The layer passed in is part of the app.activeDocument
//////////////////////////////////////////////////////////////////////////////*/
CanLinkIt.prototype.getLayerInfo = function(document,  layer) {
	logIt("CanLinkIt.getLayerInfo: starting");
	this.editedSOHelper.lastSelectedLayer=layer;
	
	// First, before anything else, we have to check whether this file has been saved or not -- if the file hasn't been saved yet, we can't create links in it (certainly not relative links).
	try {
		var f = document.path;
	} catch (e) {
		// its' an error because the document has not yet been saved.
		logIt("CanLinkIt.getLayerInfo: saying we don't have a document because it needs to be saved");
		return linksXMP.getXMLForBrokenLink(false, false, false,true);
	}

	if (layer.kind != LayerKind.SMARTOBJECT) {
		logIt("CanLinkIt.getLayerInfo: marking data invalid because it's not a smart object");
		return linksXMP.getXMLForBrokenLink(true, false, false);
	}

	// From here on it's a valid smart object layer so we're going to start having to build custom XML about this layer:	
	var xml = "<object>";
	xml += convertToXML( false, "multipleLayersSelected" );
	xml += convertToXML( layer.name, "layerName" );
	xml += convertToXML( true, XMPObjectTags.HAS_DOC );
	xml += convertToXML( true, "isSO" );

	try { // try getting metadata
		var xmp=null;
		try {
			xmp = new XMPMeta( layer.xmpMetadata.rawData );
		} catch (e) {
			logIt ("CanLinkIt.getLayerInfo: marking data invalid because there's no xmp data to load");
			return linksXMP.getXMLForBrokenLink (true, true, false);
		}
		var metaURI = xmp.getProperty(this.AdobeLinksNameSpace,XMPObjectTags.URI).toString();
		xml += convertToXML( metaURI, XMPObjectTags.URI );
		var relativeURIObj = xmp.getProperty(this.AdobeLinksNameSpace,XMPObjectTags.RelativeURI);
		var relativeURI = null;
		var file=null;
		if (metaURI!=null && metaURI.length>0)
			file = new File(metaURI);
		if (relativeURIObj!=null) {
			relativeURI=relativeURIObj.toString();
			xml += convertToXML( relativeURI, XMPObjectTags.RelativeURI );
		} else
			xml += convertToXML( "", XMPObjectTags.RelativeURI );
		// I think that metaDocName is the file name, trimmed down to just the file name itself (e.g. "Folder/File.psd" gets trimmed down to "File.psd"
		var metaDocName = decodeURI( file.name).match(/(.*)(\.[^\.]+)/)[0];
		var soFileName = getSmartlayerFilename();
		//logIt("CanLinkIt.getLayerInfo: smart layer's embedded filename="+soFileName);
		//logIt("CanLinkIt.getLayerInfo: our xmp filename="+metaURI);
		//logIt("CanLinkIt.getLayerInfo: our relative filename="+relativeURI);
		if (!file.exists && relativeURI.length>0) {
			// let's search for it.
			file = new File (document.path+"/"+relativeURI);
			// FUTURE if it's still missing we could probably help the user search here... Try some alternative locations, etc.
		}

		xml += convertToXML( xmp.getProperty(this.AdobeLinksNameSpace,"fileDateLinked").toString(), "fileDateLinked");
		var layerCompName= xmp.getProperty(this.AdobeLinksNameSpace,XMPObjectTags.LINK_LAYER_COMP_NAME);
		if (layerCompName!=null)
			xml += convertToXML(layerCompName.toString(), XMPObjectTags.LINK_LAYER_COMP_NAME);
         xml += convertToXML( true, "hasLink" );
		xml += convertToXML( xmp.getProperty(this.AdobeLinksNameSpace,"linkDate").toString(), "linkDate");
		if( file.exists ) {
			// TODO in the future we could use canEdit to show if the source file is editable
			//xml += convertToXML( true , "canEdit");
			xml += convertToXML( true , "isValid");// 'linked icon'
			xml += convertToXML( this.xmpHelper.getDateFileModified( file ).toString(), "fileDate");
			xml += convertToXML(linksXMP.isLayerUpToDate(xmp, file), "isCurrent");
		} else {// file does not exist
			// TODO in the future we could use "canEdit" to show whether the source file is editable...
			//xml += convertToXML( false , "canEdit");
			xml += convertToXML( " " , "fileDate");
			xml += convertToXML( false , "isValid");//  'missing' icon
			xml += convertToXML( false , "isCurrent");
			logIt("CanLinkIt.getLayerInfo(): marking invalid because file cannot be found");
		}
	} catch(e) {// if failed there is a problem with metadata so break link}
		logIt("CanLinkIt.getLayerInfo(): marking data invalid because of exception: "+e.toString());
		if (typeof BREAK_ON_UNEXPECTED!= "undefined") $.bp();
		return linksXMP.getXMLForBrokenLink (true, true, false);
	}
    
    xml += "</object>";
	logIt("CanLinkIt.getLayerInfo: finished getting info for layer that was linked to: "+file.name);

    return xml;
}

CanLinkIt.prototype.getActiveLayerInfo = function( descID ) {
	try {
		logIt("CanLinkIt.getActiveLayerInfo("+descID+"): starting");
		if( descID != undefined && descID != '1' ){// not called by icon buttons
			logIt("CanLinkIt.getActiveLayerInfo: 5");
			var desc = new ActionDescriptor;
			// Interesting: ActionDescriptor.fromID is not documented anywhere.
			desc.fromID( Number( descID ) );// sent as String by Flex so convert to Number
			logIt("CanLinkIt.getActiveLayerInfo: 6");
			
			try {
				logIt("CanLinkIt.getActiveLayerInfo: 7: desc="+desc);

				// Often Photoshop will throw an exception on this line. I'm really not sure why.
				logIt("CanLinkIt.getActiveLayerInfo: 8: desc.count="+desc.count);
				
				// There's very little information in the ActionDescriptor, unfortunately, but we can print it out below.
				for (var i=0; i<desc.count; i++)
				logIt("CanLinkIt.getActiveLayerInfo(): desc["+i+"]:"+
						"\n\tkey="+desc.getKey(i)+
						"\n\tstring id="+typeIDToStringID(desc.getKey(i))+
						"\n\tchar id="+typeIDToCharID(desc.getKey(i))+
						"\n\ttype="+desc.getType(desc.getKey(i))					
						);
						
				if (desc.count>0 && desc.getKey(0)==1853189228 && $.os.indexOf("Macintosh")>-1) {
					/* We get this message anytime the user switches between windows.
					 However, on a mac right after the user (a) opens two files in tabs and then (b) moves the second tabbed file into a new window, then
					 that results in a Photoshop crash on the call to "app.documents.length" below -- that's crazy that that line would crash photoshop, but it does.
					 So let's skip doing this on this time, only if it's a mac.
					 BTW, stringid and charid of the number above print out as null, so we have to use the original integer.*/
					// TODO it would be better if we could return something that would display, in the panel, something saying to wait one moment, loading information...
					logIt("CanLinkIt.getActiveLayerInfo: Activating Mac-only workaround for app.documents.length on detabbing bug. os="+$.os);
					// cue to try again soon. no info passed so this looks like an error state.
					return;// this.getXMLToTryAgainSoon();
					//return linksXMP.getXMLForBrokenLink(false,false, false);					
				}
			} catch (e) {
				// Sometimes this happens. I'm not sure why. If it does, we can't do anything here.
				logIt("CanLinkIt.getActiveLayerInfo: as often does, Photoshop threw an error on desc.count. There's nothing we can do here. Error="+e);
			}
			/*if (desc.count>0)
				logIt("CanLinkIt.getActiveLayerInfo(): " typeIDToCharID(desc.getKey(0))+':'+desc.count );*/
			// desc.getClass() doesn't seem to work
			// so I check the first key - "Mk  " only has one key
			/*if ( desc.count > 0 && desc.getKey(0) == charIDToTypeID( 'Nw  ' ) ) { 
				logIt("CanLinkIt.getActiveLayerInfo: 7");
				app.refresh();
			}*/
		
		}/* else {
			logIt("CanLinkIt.getActiveLayerInfo() descID is not useful.");
		}*/
		logIt("CanLinkIt.getActiveLayerInfo: 10");
		// document status vars
		if (app.documents.length==0) {
			// No documents are open.
			logIt("CanLinkIt.getActiveLayerInfo: no documents are open, so we're returning false.");
			return linksXMP.getXMLForBrokenLink(false,false, false);
		}
		logIt("CanLinkIt.getActiveLayerInfo: 20");
		var selectedLayerCount = getSelectedLayersCount();
		if( selectedLayerCount > 1 ) {
			// Multiple layers are selected
			// TODO find out if any are smart layers and have reference info... Because we could show that status and allow updates to these selected layers.		
			return linksXMP.getXMLForBrokenLink(true,false, true);
		}
		logIt("CanLinkIt.getActiveLayerInfo: 30");
		var supportsLayers = ( activeDocument.mode != DocumentMode.BITMAP ) && ( activeDocument.mode != DocumentMode.INDEXEDCOLOR );
		if( supportsLayers == false ) {
			// This document can't have objects.
			// TODO send back a better error message.
			return linksXMP.getXMLForBrokenLink(false,false,false);
		}
		logIt("CanLinkIt.getActiveLayerInfo: 40");
		return this.getLayerInfo(activeDocument, activeDocument.activeLayer);
	} catch (e) {
		logIt("CanLinkIt.getActiveLayerInfo(): marking data invalid because of exception: "+e.toString());
		if (typeof BREAK_ON_UNEXPECTED!= "undefined") $.bp();
		return linksXMP.getXMLForBrokenLink (true, true, false);
	}
}

/***************************************************
 * CanLinkIt: updateSingleLayer(layerRef)
 * The goal was that this should be able to handle any layer, whether it's a linked one or not, e.g. we could use it as a vetting mechanism to update all layers in a document.
 * Warning: Due to the way we're doing LoadLinkedFiles.loadFileIntoSmartObjectLayer(), this requires that this layer be the activeLayer. It probably can't be done when another layer is selected.
 * Warning: This requires that the document with this layer be currently selected as the app.activeDocument.
 */
CanLinkIt.prototype.updateSingleLayer = function(layerRef) {
	logIt("CanLinkIt.updateSingleLayer(): Starting update...");
	if (layerRef.kind != LayerKind.SMARTOBJECT) {
		//logIt("CanLinkIt.updateSingleLayer: Can't update because it's not a smart object");
		//throw ErrStrs.CANT_UPDATE_NON_SMART_OBJECT;
		return false;
	}
		
	var xmp = this.xmpHelper.getXMPFrom(layerRef);
	
	var linkedFile = linksXMP.getFileFromXMP(xmp, true, layerRef);
	if (linkedFile==null) {
		logIt("\tCanLinkIt.updateSingleLayer(): No linked file to update.");
		return false;
	}
	
	if (linksXMP.isLayerUpToDate(xmp, linkedFile)) {
		// No update is needed -- we're already up to date. Skip it.
		logIt("\tCanLinkIt.updateSingleLayer(): No update needed for this layer.");
		return false;
	}
	
	loadLinkedFiles.loadIntoSmartObjectLayer(linkedFile,layerRef, linksXMP.getLayerCompFromXMP(xmp));
	logIt("\tCanLinkIt.updateSingleLayer(): Completed update.");
	return linksXMP.saveLinkInfoFor(linkedFile, activeDocument.activeLayer, linksXMP.getLayerCompFromXMP(xmp));
}

CanLinkIt.prototype.updateSelected = function(){

	if (app.documents.length==0)
		throw ErrStrs.NO_FILE_OPEN;
		
	var selectedLayerCount = getSelectedLayersCount();
	if (selectedLayerCount==1) {
		return this.updateSingleLayer(activeDocument.activeLayer);
	}
	// Multiple layers are selected
	// TODO find out if any are smart layers and have reference info... Because we could allow updates to these selected layers.
	var selectedIndexes = PsdLib.prototype.getSelectedLayersIndex();
	var updatedAny = false;
	for (var i=0; i<selectedIndexes.length; i++) {
		PsdLib.prototype.makeActiveByIndex(selectedIndexes[i],false);
		if (this.updateSingleLayer(activeDocument.activeLayer)) {
			updatedAny=true;
		}
	}
	return updatedAny;
}

/**Update any layers in this file that are linked to another specific file. This is used whenever we know that files have been edited (e.g. EditedSOHelper).*/
CanLinkIt.prototype.updateAnyLayersLinkedTo = function(file) {
	var updatedSomething=false;

	try {
		// Search through layers
		var numberOfLayers = PsdLib.prototype.getNumberOfLayers();
		
		// We want to preserve the user's original layer selection as best as possible:
		var originalActiveLayer = activeDocument.activeLayer;
		
		// Update Each Layer:
		for(var i = 0; i <= numberOfLayers; i++) {
			if (!PsdLib.prototype.isValidActiveLayer(i)) {
				logIt("CanLinkIt.updateAnyThisDocLinkedTo: layer "+i+" is not a valid active layer");
				continue;
			}
			logIt("CanLinkIt.updateAnyThisDocLinkedTo: layer "+i+": attempting to update");
			PsdLib.prototype.makeActiveByIndex(i, false );
			// Check if we want to update it
			if (activeDocument.activeLayer.kind != LayerKind.SMARTOBJECT)
				// skip it
				continue;
		
			var xmp = this.xmpHelper.getXMPFrom(activeDocument.activeLayer);
		
			var linkedFile = linksXMP.getFileFromXMP(xmp, true, activeDocument.activeLayer);
			if (linkedFile==null)
				continue;
			if (linkedFile.toString()!=file.toString())
				// skip all except this file
				continue;
			
			if (this.updateSingleLayer(activeDocument.activeLayer))
				updatedSomething=true;
		}

		// Reset to the user's original layer selection:
		activeDocument.activeLayer=originalActiveLayer;
	} catch (e) {
		logIt(e);
		if (typeof BREAK_ON_UNEXPECTED!= "undefined") $.bp();
	}
	return updatedSomething;


}

CanLinkIt.prototype.updateAll = function() {
	var numberOfLayers = PsdLib.prototype.getNumberOfLayers();
	
	// We want to preserve the user's original layer selection as best as possible:
	var originalActiveLayer = activeDocument.activeLayer;
	var countOfUpdatedLayers = 0;
	// Update Each Layer:
	for(var i = 0; i <= numberOfLayers; i++) {
		logIt("CanLinkIt.updateAll: about to test layer "+i+":");
		if (!PsdLib.prototype.isValidActiveLayer(i)) {
			logIt("CanLinkIt.updateAll: layer "+i+" is not a valid active layer");
			continue;
		}
		logIt("CanLinkIt.updateAll: layer "+i+": attempting to update");
		PsdLib.prototype.makeActiveByIndex(i, false );
		var getThisAsNewOriginalActiveLayer=false;
		if (activeDocument.activeLayer==originalActiveLayer)
			getThisAsNewOriginalActiveLayer=true;
			
		
		if (this.updateSelected()) {
			countOfUpdatedLayers++;
			// because the actual current layer may have been replaced as part of the updating:
			originalActiveLayer = activeDocument.activeLayer;
		}
    }

	// Reset to the user's original layer selection:
	//try {
		activeDocument.activeLayer=originalActiveLayer;
	/*} catch {
		// We don't really care if it fails.
	}*/
	return countOfUpdatedLayers;
}



CanLinkIt.prototype.isIsTimeToCheckForNewVersion = function() {
	var result = false;
	//TODO get the pref for the last time we checked for a new version.
	return "<object>"+convertToXML(result,"check")+"</object>";
}

CanLinkIt.prototype.loaded = function() {
	logIt("CanLinkIt.load(): CanLinkIt.jsx file has been loaded.");
	// Start the log file with some information:
	logIt("Starting a new log file.\n"+
	"ExtendScript build: "+$.build+"\n"+
	"ExtendScript build date: "+$.buildDate+"\n"+
	"JavaScript Engine: "+$.engineName+"\n"+
	"Current Script: "+$.fileName+"\n"+
	"Locale: "+$.locale+"\n"+
	"memCache: "+$.memCache+"\n"+
	"OS: "+$.os+"\n"+
	"Screens: "+$.screens+"\n"+
	"Version: "+$.version+"\n"+
	"Stack: "+$.stack+"\n"+
	"Free Memory: "+app.freeMemory+"\n"+
	"App Name: "+app.name+"\n"+
	"App Path: "+app.path+"\n"+
	"Scripting Build Date: "+app.scriptingBuildDate+"\n"+
	"Scripting Version: "+app.scriptingVersion+"\n"+
	"App version: "+app.version
	);
}

/****
	* alert is a helper method for the alert function, to be accessible via mxml.
	* This is better than the mxml alert because it appears on top of the screen, which means that it doesn't matter what size our panel is (that can be an issue)
	*/
CanLinkIt.prototype.alert = function(message) {
//TODO to make this usable, we're going to have to find some way of getting stuff in and replacing it with \n because \n can't be passed without errors.
	alert(message);
}


// notify that the javascript file was loaded
var canLinkIt= new CanLinkIt();
canLinkIt.loaded();
// We're shifting to use canLinkIt instead of linkDox, however, some places still use the old variables.
var linkDox=canLinkIt;