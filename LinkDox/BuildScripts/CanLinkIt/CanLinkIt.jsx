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

/*********************************************
Copyright 2011 Aaron Powers
All Rights Reserved
*/
/**
 * Logging library. Include this to use it.
 */

var loggingOn=true;
/*If you want to keep the log file small, set this to true. If you want to keep the file around forever with all past logs, set it to false.*/
var deleteLogEachLaunch=true;


/*//////////////////////////////////////////////////////////////////////////////
// Object: Logger
// Usage: Log information to a text file
// Input: String to full path of file to create or append, if no file is given
//        then output file Logger.log is created on the users desktop
// Return: Logger object
// Example:
//
//   var a = new Logger();
//   a.print( 'hello' );
//   a.print( 'hello2\n\n\nHi\n' ) ;
//   a.remove();
//   a.log( Date() );
//   a.print( Date() );
//   a.display();
//
//////////////////////////////////////////////////////////////////////////////*/

var DefaultLogFile = new File(/* Folder.desktop*/Folder.temp + "/CanLinkIt.log" );

Logger = function ( inFile ) {
	// member properties
	// the file we are currently logging to
	if ( inFile == undefined) {
		this.file = DefaultLogFile;
	} else {
		this.file = new File( inFile );
	}
	//alert("Log file: "+this.file.fsName);
	if (deleteLogEachLaunch && this.file.exists)
		this.file.remove();
		
	
	// member methods
	// output to the ESTK console
	// note that it behaves a bit differently 
	// when using the BridgeTalk section
	this.print = function( inMessage ) { 
		if ( app.name == "ExtendScript Toolkit" ) {
			print (inMessage);
		} else {
			var btMessage = new BridgeTalk();
			btMessage.target = "estoolkit";
			btMessage.body = "print(" + inMessage.toSource() + ")";
			btMessage.send ();
		}
	}
	// write out a message to the log file
	this.log = function( inMessage ) {
		if ( this.file.exists ) {
			this.file.open( 'e' );
			this.file.seek( 0, 2 ); // end of file
		} else {
			this.file.open( 'w' );
		}
		this.file.write( inMessage );
		this.file.close();
	}
	// show the contents with the execute method
	this.display = function() {
		this.file.execute();
	}
	// remove the file
	this.remove = function() {
		this.file.remove();
	}

}

var logger = null;

function logIt( inMessage ) {
	if (!loggingOn)
		return; // allows us to turn off the log for our end users
	try {
		if (logger==null)
			logger = new Logger();
		var b = decodeURIComponent( inMessage );
		logger.log(new Date()+"\t");
		logger.log( b +"\n");
	}
	catch(e) {
		alert(e + ":" + e.line);
	}
}

function deleteLogFile() {
	if (DefaultLogFile.exists)
		DefaultLogFile.remove();
}

 
/*********************************************
Copyright 2011 Aaron Powers
All Rights Reserved
*/
/*
 * XMP & XML utilities
 * use #include to include this file
 */
/************************************************************************************************************
General XMP Functions
    **/

function XMPHelper(namespace) {
	this.namespace=namespace;
	// load the library. This is a one-time thing.
	if (ExternalObject.AdobeXMPScript == undefined) {
		ExternalObject.AdobeXMPScript = new
		ExternalObject("lib:AdobeXMPScript");
	}

	// We need to simulate the same namespace as the links panel did before. So
	var namespaceObj = new Namespace ('link', this.namespace);
	XMPMeta.registerNamespace(namespaceObj, 'SOlink');
}



/***************************
	* XMPHelper.getXMPFor
	*
	* Gets the XMP metadata for the passed in layer
	*
	*/
XMPHelper.prototype.getXMPFrom = function(layer) {
	try{
		return new XMPMeta(layer.xmpMetadata.rawData);
	} catch(e) {
		// The exception means the xmp does not exist. So we need to create it.
		logIt("XMPHelper.getXMPFrom: Error: "+e);
		return new XMPMeta();
	}
}

/***************************
	* XMPHelper.getXMPFor
	*
	* Gets the XMP metadata for the passed in layer
	*
	*/
XMPHelper.prototype.saveXMP = function(layer, xmp) {
	layer.xmpMetadata.rawData = xmp.serialize();
}

/*******************
	* getDateFileModified
	*
	* Inputs: file -- the file to check
	* Output: A string, in XMPDateTime format, from when the file was last modified
	*
	*/
function getDateFileModified(file) {
	// Note: The original links panel used a date from the XMP metadata using XMPFile. Not sure why, because it only works for files that support XMP data, not regular files like images.
	// Would there be some benefit to using that information when it's available?
	var date = file.modified;
	if (date==null) // unlikely, perhaps impossible, but why not have a fall back here?
		date = file.created;
	// This is a good text date format for us to use.
	date = new XMPDateTime(date);
	return date.toString();
}

/*********************************************
Copyright 2011 Aaron Powers
All Rights Reserved
*/
/*
 * XML utilities
 * use #include to include this file
 */
/************************************************************************************************************
General XML Functions
    **/

function getXMLObject(property, value) {
	var xml = "<object>";
	xml += convertToXML(value, property);
	xml += "</object>"
	return xml;
}


function getClassName (object) { 
   var funcNameRegex = /function (.{1,})\(/;
   var results = (funcNameRegex).exec((object).constructor.toString());
   return (results && results.length > 1) ? results[1] : "";
};


function convertObjectToXML(property, identifier) {
	var className=getClassName(property);
	
	var xml = '<property id="' + identifier + '">';
	switch(className){
		case "Date":
			xml += "<date>";
			xml += property.toString();
			xml += "</date>";
			break;
		default:
			alert("XMLLib.jsxinc: convertObjectToXML: Object class " + className + " is unknown.");
			return "";
	}
	xml += '</property>';
	return xml;
}

/**
	John Huan Vu
	In order to communicate to the SWF file, it must be written as an XML
		containing the property and identifier. This utility is very helpful for
		a two-way communication between the JSX and SWF.
	@param {String} property The property or value for the identifier
	@param {String} identifier The unique identifier for the property
	@returns An xml containing the property and identifier
	@type String
*/
function convertToXML(property, identifier){
	var type = typeof property;
	var xml = '<property id="' + identifier + '">';
	
	switch(type){
		case "number":
			xml += "<number>";
			xml += property.toString();
			xml += "</number>";
			break;
		case "boolean":
			xml += "<" + property.toString() + "/>";
			break;
		case "string":
			xml += "<string>";
			xml += property.toString();
			xml += "</string>";
			break;
		case "object":
			return convertObjectToXML(property, identifier);
		case "undefined":
			xml += "<string>undefined</string>";
			break;
		default:
			alert("Type " + type + " is unknown.");
			return "";
	}
	xml += '</property>';
	return xml;
}
/*********************************************

Copyright 2012 Aaron Powers
All Rights Reserved
*/

#target photoshop

/************************************************************************************************************
General Photoshop Helper Functions
    **/

function PsdLib() {
}

/*//////////////////////////////////////////////////////////////////////////////
// Function: getSmartlayerFilename
// Description: Checks the activeLayer for placed fileName 
//                   
// Input: 
// Return: String- "-1" if name not found
//////////////////////////////////////////////////////////////////////////////*/
function getSmartlayerFilename(){
	try {// cleaned up scriptlistner output
		var ref = new ActionReference(); 
		ref.putEnumerated( 1283027488, 1332896878, 1416783732 ); 
		var smartDesc = executeActionGet
		(ref).getObjectValue(stringIDToTypeID( "smartObject" )) 
		return smartDesc.getString( 1181314130 );
	} catch (e) { return "-1"; }   
}


/*///////////////////////////////////////////////////////////////////////////////////////////
// Function: getSelectedLayersCount
// Description: gets the number of selected layers  
// Usage: 
// Input:
// Return: Number
// Dependencies:
// Notes: retruns 1 if no layer selected DOM bug?			 
//////////////////////////////////////////////////////////////////////////////*/
function getSelectedLayersCount(){
	var res = new Number();
	var ref = new ActionReference();
	ref.putEnumerated( charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );
	var desc = executeActionGet(ref);
	if( desc.hasKey( stringIDToTypeID( 'targetLayers' ) ) ){
		desc = desc.getList( stringIDToTypeID( 'targetLayers' ));
		res = desc.count 
	}else{
		try{
			// how to tell if no layer is selected?
			// this returns the top layer if no layer selected
			 app.activeDocument.activeLayer.name;
			res = 1;
		}catch(e){
			res = 0;
		}	
	}
	return res;
}

/**********************************
	* PsdLib.isMultiLayer(fileName)
	* Pass in a file name and it will return:
	*   true: if the file format supports multiple layers, e.g. PSD
	*   false: if the file format supports only one layer, it's already flattened: e.g. png
	*   null: if we don't know what format it is.
	*/
PsdLib.isMultiLayer = function(fileName) {
	// Regexp is case sensitive, so to make this easier, we lowercase it.
	fileName= fileName.toLowerCase();

	// Note: A bunch of these file formats I'm not really sure whethery they have layers in them or not.
	// FUTURE TODO: I should go through these and verify they belong where they are
	if (fileName.match(/.+\.ai$/) 
		|| fileName.match(/.+\.psd$/) 
		|| fileName.match(/.+\.psb$/) 
		|| fileName.match(/.+\.pdd$/) 
		|| fileName.match(/.+\.eps$/) 
		|| fileName.match(/.+\.ai3$/) 
		|| fileName.match(/.+\.ai4$/) 
		|| fileName.match(/.+\.ai5$/) 
		|| fileName.match(/.+\.ai6$/) 
		|| fileName.match(/.+\.ai7$/) 
		|| fileName.match(/.+\.ai8$/) 
		// The following I'm not really sure as to whether they open as single layer or multi layer:
		|| fileName.match(/.+\.ps$/) 
		|| fileName.match(/.+\.epsf$/) 
		|| fileName.match(/.+\.epsp$/) 
		|| fileName.match(/.+\.pdf$/) 
		|| fileName.match(/.+\.pdp$/)
		) {
		return true;
	}

	if (fileName.match(/.+\.png$/) 
		|| fileName.match(/.+\.jpg$/) 
		|| fileName.match(/.+\.jpeg$/)
		|| fileName.match(/.+\.jpe$/) 
		|| fileName.match(/.+\.jpf$/) 
		|| fileName.match(/.+\.jpx$/) 
		|| fileName.match(/.+\.jp2$/) 
		|| fileName.match(/.+\.j2c$/) 
		|| fileName.match(/.+\.j2k$/) 
		|| fileName.match(/.+\.jpc$/) 
		|| fileName.match(/.+\.gif$/) 
		|| fileName.match(/.+\.bmp$/) 
		|| fileName.match(/.+\.rle$/) 
		|| fileName.match(/.+\.dib$/) 
		|| fileName.match(/.+\.tif$/) 
		|| fileName.match(/.+\.tiff$/) 
		|| fileName.match(/.+\.pct$/) 
		|| fileName.match(/.+\.pict$/) 
		|| fileName.match(/.+\.pbm$/) 
		|| fileName.match(/.+\.pgm$/) 
		|| fileName.match(/.+\.ppm$/) 
		|| fileName.match(/.+\.pnm$/) 
		|| fileName.match(/.+\.pfm$/) 
		|| fileName.match(/.+\.pam$/) 
		// The following I'm not really sure as to whether they open as single layer or multi layer:
		|| fileName.match(/.+\.crw$/) 
		|| fileName.match(/.+\.nef$/) 
		|| fileName.match(/.+\.raf$/) 
		|| fileName.match(/.+\.orf$/) 
		|| fileName.match(/.+\.mrw$/) 
		|| fileName.match(/.+\.dcr$/) 
		|| fileName.match(/.+\.mos$/) 
		|| fileName.match(/.+\.raw$/) 
		|| fileName.match(/.+\.pef$/) 
		|| fileName.match(/.+\.srf$/) 
		|| fileName.match(/.+\.dng$/) 
		|| fileName.match(/.+\.dng$/) 
		|| fileName.match(/.+\.x3f$/) 
		|| fileName.match(/.+\.cr2$/) 
		|| fileName.match(/.+\.erf$/) 
		|| fileName.match(/.+\.sr2$/) 
		|| fileName.match(/.+\.kdc$/) 
		|| fileName.match(/.+\.mfw$/) 
		|| fileName.match(/.+\.mef$/) 
		|| fileName.match(/.+\.arw$/) 
		|| fileName.match(/.+\.nwr$/) 
		|| fileName.match(/.+\.rw2$/) 
		|| fileName.match(/.+\.rwl$/) 
		|| fileName.match(/.+\.iiq$/) 
		|| fileName.match(/.+\.3fr$/) 
		|| fileName.match(/.+\.cin$/) 
		|| fileName.match(/.+\.sdpx$/) 
		|| fileName.match(/.+\.dpx$/) 
		|| fileName.match(/.+\.fido$/) 
		|| fileName.match(/.+\.iff$/) 
		|| fileName.match(/.+\.tdi$/) 
		|| fileName.match(/.+\.exr$/) 
		|| fileName.match(/.+\.pcx$/) 
		|| fileName.match(/.+\.pxr$/) 
		|| fileName.match(/.+\.hdr$/) 
		|| fileName.match(/.+\.rgbe$/) 
		|| fileName.match(/.+\.xyze$/) 
		|| fileName.match(/.+\.sct$/) 
		|| fileName.match(/.+\.tga$/) 
		|| fileName.match(/.+\.vda$/) 
		|| fileName.match(/.+\.icb$/) 
		|| fileName.match(/.+\.vst$/) 
		|| fileName.match(/.+\.wbm$/) 
		|| fileName.match(/.+\.wbmp$/) 
		) {
		return false;
	}
	return null;
}

/**************************************
	* findPhotoshopEventIDs
	* Description: gets runtime integers for stringIDs for use in Flex  eventhandlers  
	* Returns: XML
	*/
function findPhotoshopEventIDs(){
	var xml = "<object>";
	xml += convertToXML( stringIDToTypeID( "newPlacedLayer" ).toString(), "newPlacedLayer" );// convert	
	xml += convertToXML( stringIDToTypeID( "placedLayerEditContents" ).toString(), "placedLayerEditContents" ); // user has edited a placed layer
	xml += convertToXML( stringIDToTypeID( "placedLayerReplaceContents" ).toString() , "placedLayerReplaceContents" );
	xml += convertToXML( stringIDToTypeID( "placedLayerMakeCopy" ).toString(), "placedLayerMakeCopy" );// new via copy
	xml += "</object>";
	return xml;
}

function getVersion() {
	var xml = "<object>";
	xml += convertToXML(app.version, "version");
	xml += "</object>"
	return xml;
}

PsdLib.prototype.makeActiveByIndex = function(index, forceVisible) {
	try {
		var desc = new ActionDescriptor();
		var ref = new ActionReference();
		ref.putIndex(charIDToTypeID( "Lyr " ), index)
		desc.putReference( charIDToTypeID( "null" ), ref );
		desc.putBoolean( charIDToTypeID( "MkVs" ), forceVisible );
		executeAction( charIDToTypeID( "slct" ), desc, DialogModes.NO );
	} catch(e) {
		logIt("PsdLib.makeActiveByIndex: index="+index+", could not make active due to Error:"+e.toString());
		return -1;
	}
};

PsdLib.prototype.getNumberOfLayers = function() {
	// Ask photoshop how many layers there are in the document:
	var ref = new ActionReference(); 
	ref.putEnumerated( charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") ); 
	var desc = executeActionGet(ref);
	return desc.getInteger(charIDToTypeID("NmbL")); 
}

PsdLib.prototype.isValidActiveLayer = function(index) {
	var propName = stringIDToTypeID( 'layerSection' );// can't replace
	var ref = new ActionReference(); 
	ref.putProperty( 1349677170 , propName);// TypeID for "Prpr"
	// 'Lyr ", index
	ref.putIndex( 1283027488, index );
	var desc =  executeActionGet( ref );
	var type = desc.getEnumerationValue( propName );
	var res = typeIDToStringID( type ); 
	return res == 'layerSectionEnd' ? false:true;
};


PsdLib.isDocumentStillOpen = function(docRef) {
	try {
		docRef.layers;
		return true;
	} catch (e) {
		// If it's closed, it would through a "ReferenceError: Object is invalid" at the above line. If you want to see it in the JavaScript console, uncomment the following line.
		//$.writeln("e="+e);
		return false;
	}
}
/**
To avoid redundant and slow loading, we assume that your local file has these includes in it (when you include this file):
#include "XMLLib.jsxinc"
#include "Logging.jsxinc"
**/
#target photoshop

function LDPrefs(file) {
	if (file==undefined)
		this.prefsFile = new File(app.preferencesFolder+"/CanLinkIt.prefs");
	else
		this.prefsFile=file;
	logIt("Prefs file is at: "+this.prefsFile.fsName);
	this.loadPrefs();
}

LDPrefs.prototype.getPrefsFileText = function() {
	if (!this.prefsFile.exists) {
		// nothing to read.
		return null;
	}
	this.prefsFile.open("r");
	var text = this.prefsFile.read();
	this.prefsFile.close();
	return text;
}

LDPrefs.prototype.loadPrefs = function() {
	this.names=new Array();
	this.hash = {};
	var contents = this.getPrefsFileText();
	if (contents==null)
		return; // nothing to load
	if (contents.indexOf("<object>")!=0) {
		logIt("LDPrefs.loadPrefs(): This prefs file is malformed, it does not start with <object> so there's nothing we can load.");
		return;
	}	
	
	var xml = new XML(contents);
	//logIt("xml="+xml);
	//logIt("xml.property="+xml.property);
	//logIt("xml.property.length="+xml.property.length());
	for (var i=0; xml.property.length(); i++) {
		var prop = xml.property[i];
		if (prop==null)
			return prop;
		var id = prop.@id.toString();
		var value = null;
		// Parse it:
		if (prop.string!=undefined) {
			//logIt("prop="+prop+", String (value)="+prop.string+", name="+prop.@id);
			value = prop.string.toString();
		} else if (prop.date!=undefined) {
			value = prop.date.toString();
			if (value!=null && value.length>0)
				value = new Date(value);
				value.setMilliseconds(0);
		}
		// TODO right now we only support string and date values here. We should support more!
		
		// Save it:
		this.names[this.names.length]=id;
		this.hash[id]=value;

		
	}
	
}

LDPrefs.prototype.savePrefs = function() {
	//logIt("savePrefs 1");
	var xml = "<object>";
	for (var i=0; i<this.names.length; i++) {
		//logIt("savePrefs i="+i);
		//logIt("\tname="+this.names[i]+", value="+this.hash[this.names[i]]);
		
		xml+=convertToXML(this.hash[this.names[i]],this.names[i]);
		
	}
	xml+="</object>";
	//logIt("Saving: "+xml);
	this.prefsFile.open("w");
	this.prefsFile.write(xml);
	this.prefsFile.close();
}

LDPrefs.prototype.get = function(name) {
	return this.hash[name];
}

LDPrefs.prototype.getAsXML = function(name) {
	//logIt("getAsXML("+name+") start");
	var value = this.hash[name];
	var xml = null;
	if (value==undefined) {
		xml = getXMLObject(name, "");
		logIt("LDPrefs.getAsXML("+name+"): xml="+xml);
		return xml;
	}
	xml = getXMLObject(name, this.hash[name]);
	logIt("LDPrefs.getAsXML("+name+"): xml="+xml);
	return xml;
}

/**************
	* setToNow
	* This is most useful from Flash, because it's very difficult to pass a date from flash to JSX (it fails whenever I tried it). This means we can quickly set a date.
	* BTW, dates do come back from this XML just fine, it's the setting part that's hard.
	*/
LDPrefs.prototype.setToNow = function(name) {
	this.set(name, new Date());
}

LDPrefs.prototype.set = function(name, value) {
	//logIt("set("+name+","+value+"): type is "+typeof value);
	if (this.hash[name]==undefined) {
		//logIt("set("+name+","+value+"): new preference. prev length of prefs="+this.names.length);
		this.names[this.names.length]=name;
		//logIt("set("+name+","+value+"): after length of prefs="+this.names.length);
	} else {
		//logIt("set("+name+","+value+"): writing over an old preference");
	}
	this.hash[name]=value;
	
	//logIt("set("+name+","+value+"): going to save:");
	
	this.savePrefs();	
	//logIt("set("+name+","+value+"): done (saved)");
}

LDPrefs.prototype.printPrefs = function() {
	logIt("printing preferences items of length "+this.names.length);

	for (var i=0; i<this.names.length; i++) {
		logIt(this.names[i]+"="+this.hash[this.names[i]]);
	}
	logIt("done printing preferences");
}



// Helpers that are extensions of CanLinkIt.jsx functionality, e.g. these are co-dependent.
/***************************************************
	* EditedSOHelper.jsxinc
	* This file contains a helper class to help out with the action of a user editing a Smart Object. It's complex enough it justifies a class of its own.
	*
	* This must be included from CanLinkIt.jsx. It depends on CanLinkIt... Create it by calling:
	*	new EditedSOHelper(canLinkIt);
	*/
#target photoshop




/*********
	* EditedSOHelper is our main class in this file, it's the helper that can do this action.
	*/

function EditedSOHelper(canLinkIt) {
	this.canLinkIt=canLinkIt;
}

/*Simple class EditedSO to track what SOs have been edited*/
function EditedSO() {
	this.destinationDocument=null;
	this.destinationLayer=null;
	this.sourceFile=null;
}

EditedSO.prototype.toString = function() {
	return "[Object type EditedSO\n"+
	"destinationDocument="+this.destinationDocument+"\n"+
	"destinationLayer="+this.destinationLayer+"\n"+
	"sourceFile="+this.sourceFile+
	"]";
}

function objectsAreCertainlyUnequal(first, second) {
	if (first==second)
		return false; // certainly equal!
	if (first==null || second==null)
		return true; // one is non-null, they're certainly unequal
	return null; // unknown.
}

EditedSO.prototype.equals = function(another) {
	if (another==undefined || another==null)
		return false; // because this one is defined.
	// Check the class name
	if (getClassName(this)!=getClassName(another))
		return false;
	/*if (another.destinationDocument==undefined ||
		another.destinationDocument.fullName==undefined ||
		another.destinationDocument.fullName.toString==undefined ||		
		another.destinationLayer==undefined ||
		another.soureFile==undefined ||
		another.soureFile.toString==undefined
		)
		return false; // because they have to be defined, they're defined in the constructor. The type probably isn't our type.*/
	/*var certainlyUnequal = objectsAreCertainlyUnequal(this.destinationDocument, another.destinationDocument);
	if (certainlyUnequal)
		return false;
	if (!certainlyUnequal) {
		// they're certainly equal
	} else {
		// test the inner information
		certainlyUnequal = objectsAreCertainlyUnequal(this.destinationDocument.fullName, another.destinationDocument.fullName);
		if (certainlyUnequal)
			return false;
		if (!certainlyUnequal) {
			// they're certainly equal
		} else {
			// test the information
			if (objectsAreCertainlyUnequal(this.destinationDocument.fullName, another.destinationDocument.fullName))
			return false;
		else if (this.destinationDocument.fullName.toString()!=another.destinationDocument.fullName.toString())
			return false;
	}
	if (this.destinationLayer!=another.destinationLayer) {
		// really, it should be an exact match...
		return false;
	}*/
	if (this.destinationDocument!=another.destinationDocument)
		return false;
	if (this.destinationLayer!=another.destinationLayer)
		return false;
	if (this.sourceFile==another.sourceFile) {
		// good, they could both be null
	} else if (objectsAreCertainlyUnequal(this.sourceFile, another.sourceFile))
		return false;
	else if (this.sourceFile.toString()!=another.sourceFile.toString())
		return false;
	// it looks like the same one!
	return true;
}

// Class variables
EditedSOHelper.prototype.numDocsBeforeEditSO=0;
EditedSOHelper.prototype.editDocumentToOpen=null;
EditedSOHelper.prototype.lastSelectedLayer=null;
EditedSOHelper.prototype.edited=new Array();/*of EditedSO*/

// For debugging purposes, we allow automated answering of the "confirm" prompt to the user. By default it's null which means no automatic answer. Set it to a boolean value to not ask the user and act with the return value you set.
EditedSOHelper.prototype.debug_autoAnswerConfirm=null;


EditedSOHelper.prototype.getEditItem = function(destinationDocument) {
	for (var i=0; i<this.edited.length; i++) {
		if (this.edited[i].destinationDocument==undefined) {
				// remove this element.
				this.edited.splice(i,1);
				i--;
		} else if (this.edited[i].destinationDocument==destinationDocument)
			return this.edited[i];
	}
	return null;
}

/**********
	* getEditItemsLinkedTo(sourceDocument)
	* Arguments: Pass in the source document, e.g. the document that you think something might be linked to.
	* Returns: an Array containing a list of EditedSO describing any links that are pointing to this document.
	*
	*/
EditedSOHelper.prototype.getEditItemsLinkedTo = function(sourceDocument/*type Document*/) {
	var editItems = new Array();/*of EditedSO*/
	for (var i=0; i<this.edited.length; i++) {
		if (this.edited[i].sourceFile.toString()==sourceDocument.fullName.toString()) {
			// If the document is undefined, then it was closed at some point and we should remove it from our list.
			if (this.edited[i].destinationDocument==undefined) {
				// remove this element.
				this.edited.splice(i,1);
				i--;
			} else 
				editItems.push(this.edited[i]);
		}
	}
	return editItems;
}

/***************
	* userEditedSO
	*
	* Call this when we get notice that the user just started to edit a smart layer, such as double-clicking it or right-click "Edit Contents".
	* Let's warn them that this isn't a good one to edit, because they should be editing the source, and help them do just that.
	*
	* Assumptions: The last selected layer is the smart layer that was edited. This always seems to be true but it's not necessarily so (if Photoshop code changes, this order could change or it might not be required to select before opening. Hopefully that will never be the case).
	* 
	* Input: None
	* Output: Boolean: True means we need to call userJustEditedAPlacedSmartObjectLayerPart2 in 1 second, and false means we don't. (This is because we haven't found any way to do a Timer or setTimeout() or the like in ExtendScript.)
	*/
EditedSOHelper.prototype.userEditedSO = function() {
	//logIt("EditedSOHelper.userJustEditedAPlacedSmartObjectLayer(): Starting...");
	// Thanks to getLayerInfo, the last selected layer is going to be stored in lastSelectedLayer.
	// Note that due to photoshop, at the time of this method call, we're still getting information from the old layer... But we don't want to rely on that.
	// Note that right now, we're relying on that.
	// So far the last selected layer has always been accurate
	//lastSelectedLayer
	if (this.lastSelectedLayer==null) {
		logIt("EditedSOHelper.userJustEditedAPlacedSmartObjectLayer(): Error! There should be some last selected layer at this point, but there is none.");
		return false;
	}
	var xml = canLinkIt.getLayerInfo(activeDocument, this.lastSelectedLayer);
	if (xml==null)
		// TODO This is a bug.
		return getXMLObject("boolean",false);
	if (xml.indexOf("<property id=\"hasLink\"><true/>")==-1) {
		logIt("EditedSOHelper.userJustEditedAPlacedSmartObjectLayer(): original layer doesn't have a link.");
		return false;
	}
	// The age old question... What should we do if it has a link but it's invalid? I think we ask anyways and hope to get an updated version.
	/*if (xml.indexOf("<property id=\"isValid\"><true/>") {
	}*/
	var xmp = canLinkIt.xmpHelper.getXMPFrom(this.lastSelectedLayer);
	
	var linkedFile = canLinkIt.getFileFromXMP(xmp, true);
	if (linkedFile==null) {
		logIt("EditedSOHelper.userJustEditedAPlacedSmartObjectLayer(): Error! There was no linked file even though the original layer has a link...");
		return false;
	}

	var editTheOriginal;
	if (this.debug_autoAnswerConfirm==null)
		editTheOriginal= confirm("This smart object has a linked file attached.\n"+
		"Do you want to edit the original file?\n"+
		"\n"+
		"Original File: "+linkedFile.toString());
	else
		// Don't ask the user if we're debugging and want to skip the prompt:
		editTheOriginal=this.debug_autoAnswerConfirm;
	if (!editTheOriginal)
		return false;
	//alert("TODO Close this new one and edit the original here. The current document's name is: "+app.activeDocument.name);
	// Note that at this time the current document is still our original... Somehow we're going to have to close the new one in a few moments. Perhaps we set a timer to wait, close it, and then open the original?
	this.numDocsBeforeEditSO=app.documents.length;
	//logIt("EditedSOHelper.userJustEditedAPlacedSmartObjectLayer: a: "+this.numDocsBeforeEditSO);
	this.editDocumentToOpen=linkedFile;
	//var xml = getXMLObject("boolean",true);
	logIt("EditedSOHelper.userJustEditedAPlacedSmartObjectLayer(): Found the link and the user's planning to edit it");

	// Track it, in case the user edits it again:
	/*this.editedSODocument.push(activeDocument);
	this.editedSOLayer.push(activeDocument.activeLayer);
	this.editedSOSourceDocument.push(this.editDocumentToOpen); // this will be replaced, but we do this to avoid any chance of synchronization errors that would unsync the array.*/
	var editInfo = new EditedSO();
	editInfo.destinationDocument=activeDocument;
	editInfo.destinationLayer=activeDocument.activeLayer; // yes, this can change before we get the chance to update it, so we have to store it separately.
	editInfo.sourceFile=linkedFile; // we don't know the actual document yet, so we'll just save the file name.
	this.edited.push(editInfo); // save it for later.

	return true;
}

EditedSOHelper.prototype.userEditedSOXML = function() {
	return getXMLObject("boolean",this.userEditedSO());
}

EditedSOHelper.prototype.userEditedSOPartB = function() {
	try {
		//logIt("EditedSOHelper.userJustEditedAPlacedSmartObjectLayerPart2: Starting");
		//logIt("EditedSOHelper.userJustEditedAPlacedSmartObjectLayerPart2: b: "+this.numDocsBeforeEditSO);
		if (app.documents.length==this.numDocsBeforeEditSO) {
			// We didn't wait long enough. We need to wait longer.
			logIt("EditedSOHelper.userJustEditedAPlacedSmartObjectLayerPart2: the new file hasn't been opened yet... continuing to wait...");
			return getXMLObject("boolean",false);
		}
		//logIt("EditedSOHelper.userJustEditedAPlacedSmartObjectLayerPart2: 1");
		app.documents[this.numDocsBeforeEditSO].close();
		//logIt("EditedSOHelper.userJustEditedAPlacedSmartObjectLayerPart2: 2");
		// open the file
		app.open(this.editDocumentToOpen);
		// TODO maybe we want to listen around for a save of this file... so that we can update the original automatically?
		//logIt("EditedSOHelper.userJustEditedAPlacedSmartObjectLayerPart2: successful!");
		return getXMLObject("boolean",true);
	} catch (e) {
		logIt("EditedSOHelper.userJustEditedAPlacedSmartObjectLayerPart2: Error: "+e.toString());
	}
}

/*************************************
	* EditedSOHelper.notifySaved()
	* Call this after a document has been saved.
	* This will check to see if anything is open that needs to be updated based on this save.
	* Arguments: None
	* Returns: true if something was updated, false if nothing was updated.
	*
	*/
EditedSOHelper.prototype.notifySaved = function() {
	try {
		logIt("EditedSOHelper.notifySaved: 1");
		// Step 1: Check if the saved document (the current document) was one of our source documents.
		// Note that there is no "Save All" command in Photoshop, so the activeDocument is the one that was saved -- that makes things easier.
		var items = this.getEditItemsLinkedTo(activeDocument);
		var sourceFile = activeDocument.fullName;
		logIt("EditedSOHelper.notifySaved: 2");

		if (items==null || items.length==0)
			return false;
			
		var updatedSomething = false;
		// Step 2: Yes, it was one or more of our source documents for some open file. Let's save the activeDocument so we can reselect it later easily.
		var lastSelectedDocument = activeDocument;
		logIt("EditedSOHelper.notifySaved: 3");

		for (var i=0; i<items.length; i++) {
			logIt("EditedSOHelper.notifySaved: 4 item "+i);
			// Step 3: Select the destination document and layer
			activeDocument = items[i].destinationDocument;
			logIt("EditedSOHelper.notifySaved: 4.1");

			// We want to preserve the user's original layer selection as best as possible:
			//var originalActiveLayer = activeDocument.activeLayer;
			logIt("EditedSOHelper.notifySaved: 4.2");
			// The next line fails on the second try... perhaps the original one no longer exists?
			//activeDocument.activeLayer=items[i].destinationLayer;
			logIt("EditedSOHelper.notifySaved: 4.3");
		
			// Step 4: Update the target layers. We're being aggressive here -- updating all layers that might have been linked.
			//There was a bug with updating just the one, so we might as well update all and be more aggressive anyways (one user had suggested generally more aggressive updating).
			//It seems unlikely that a user would want to update one instance of a link in a file but not update others...
			if (this.canLinkIt.updateAnyLayersLinkedTo(sourceFile)) {
				updatedSomething=true;
			}
			/*if (this.canLinkIt.updateSelected()) {
				updatedSomething=true;
				// If it got updated, the original layer no longer really exists. We're going to have to update our link in case the user does it all over again we have to find the newly updated layer.
				//items[i].destinationLayer=activeDocument.activeLayer;
			}*/
			// Step 5: Re-select the original selected layer
			logIt("EditedSOHelper.notifySaved: 4.4");
			//activeDocument.activeLayer=originalActiveLayer;
		}
		logIt("EditedSOHelper.notifySaved: 5");

		// Step 6: Re-select the source document that was saved.
		activeDocument=lastSelectedDocument;
		// And we're done!
		logIt("EditedSOHelper.notifySaved: done: "+updatedSomething);
		return updatedSomething;
	} catch (e) {
		logIt(e);
		if (typeof BREAK_ON_UNEXPECTED!= "undefined") $.bp();
		return false;
	}

}

EditedSOHelper.prototype.toString = function() {
	var value = "Class EditedSOHelper: \n"+
	// Class variables
	"numDocsBeforEditSO="+this.numDocsBeforeEditSO+"\n"+
	"editDocumentToOpen="+this.editDocumentToOpen+"\n"+
	"lastSelectedLayer="+this.lastSelectedLayer+"\n"+
	"edited.length="+this.edited.length+"\n";
	return value;	
}
//#include "LinkedLayers.jsxinc"

/**********************************************************************************************************************
Start of CanLinkIt.jsx Content
*/


/************************************************************************************************************
Program Specific Helper Functions
    **/



/************************************************************************************************************
Variable Declarations
    **/

// Namespaces for XMP
ErrStrs = {};
ErrStrs.XMPLIB = "Technical error: Photoshop can't load XMP Script Library. This action cannot be performed."
ErrStrs.NO_FILE_OPEN="First you must open a file."
ErrStrs.CANT_UPDATE_NON_SMART_OBJECT="You cannot update a layer that's not a smart object.";

XMPObjectTags = {};
XMPObjectTags.HAS_DOC="hasDoc";
XMPObjectTags.URI="uri";
XMPObjectTags.RelativeURI="relativeURI";
XMPObjectTags.LINKDOCNAME="linkDocName";


/************************************************************************************************************
First unique code for this file below this point    
    **/


function CanLinkIt() {
	// Need to use the same namespace as the prior Links panel in order to be able to be backwards compatible with that panel.
	this.AdobeLinksNameSpace= 'http://www.smartobjectlinks.com/1.0/';
	this.xmpHelper = new XMPHelper(this.AdobeLinksNameSpace);
	this.prefs = new LDPrefs();
	
	// We use a temp file so that we don't need to write over the clipboard, trying to preserve the user's clipboard...
	this.tempImgFile = new File(/* Folder.desktop*/Folder.temp + "/CanLinkItTempImage.png" );
	// What was the file we last linked from? If it's the same and hasn't been updated, don't copy it yet again, that's really slow.
	this.tempImgFileLastLinkFrom = null;
	this.tempImgFileLastLinkFromDate = null;
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
    var eventFile = new File(app.path +  "/Plug-ins/Panels/CanLinkIt/NotificationReceiverPlace.jsx")
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

/*
 * unsavedDocument -- if true, there's a document, but it hasn't been saved yet.
 */
CanLinkIt.prototype.getXMLForBrokenLink = function(hasDoc, isSO, multipleLayersSelected, unsavedDocument) {
	var xml = "<object>";
	xml += convertToXML(hasDoc, XMPObjectTags.HAS_DOC );
	if (unsavedDocument==undefined)
		unsavedDocument=false;
	xml += convertToXML( unsavedDocument, "unsaved" );

	xml += convertToXML( multipleLayersSelected, "multipleLayersSelected" );
	
	if (!hasDoc)
		xml += convertToXML( "", "layerName" );
	else
		xml += convertToXML( activeDocument.activeLayer.name, "layerName" );
	xml += convertToXML( isSO, "isSO" );
	xml += convertToXML( false, "hasLink" );
	xml += convertToXML( false, "isValid" );
	xml += convertToXML( false, "isCurrent" );
	// TODO in the future we could use canEdit to show whether the source file is editable
	//xml += convertToXML( false , "canEdit");
	xml += convertToXML( " ", XMPObjectTags.URI );
	xml += convertToXML( " ", XMPObjectTags.LINKDOCNAME );
	xml += convertToXML( " ", "fileDate" );
	xml += convertToXML( " ", "LinkDate" );
	xml += convertToXML( " ", "fileDateLinked" );
	xml += "</object>";
	return xml;
}



/**********************
	* CanLinkIt.loadFileIntoTempFile
	* 
	* This is used before placing a flattened file into a new location: get the linked file and save it as a temporary file that we'll use to import shortly afterwards.
	*
	* Input: The file that was linked to
	* Output: None
	*/
CanLinkIt.prototype.loadFileIntoTempFile = function(file) {
	
	if (this.tempImgFileLastLinkFrom!=null && file.fsName==this.tempImgFileLastLinkFrom.fsName) {
		// It's the same file as we just did. The file should still exist.
		if (this.tempImgFileLastLinkFrom.exists) {
			// Good, it still exists.
			if (this.tempImgFileLastLinkFrom.modified<this.tempImgFileLastLinkFromDate) {
				// it's even up to date! The referenced file hasn't changed since we saved it. So this should be really quick. We're done already.
				return true;
			}
		}
	}

	// check if the referenced file is open
	var fileWasOpen=false;
	var referencedDocument=null;
	for (var i=0; i<app.documents.length; i++) {
		if (app.documents[i].fullName==file.toString()) {
			fileWasOpen=true;
			referencedDocument=app.documents[i];
			break; // no need to search any more, we found it.
		}
	}

	// Only open the file if it's not already open:
	if (referencedDocument==null)
		referencedDocument = app.open(file);

	// Save it to our temp file:
	// I find that when there are multiple windows open, it can duplicate the wrong document here, it can duplicate the one in the front -- it shouldn't.
	app.activeDocument = referencedDocument;
	var duppedDocument = referencedDocument.duplicate();

	// FUTURE: We can do any optional stuff right here, such as switching to a particular layer comp. We'd need that information passed in as a parameter.
	// optional:
	// The following "trim" is generally not a good default option, because it could result in moving things around in their space, especially if we were taking advantage of layer comps and the ability to switch them.
	// However, "trim" might be an option we might want our users to be able to choose to do.
	//duppedDocument.trim(TrimType.TRANSPARENT);
	// Never use "flatten()" here. It would be problematic in flattening out transparency -- if there's a hidden layer, it flattens that one too, making it visible again!
	// The following mergeVisibleLayers() could be useful if we plan to do something else to the image afterwards, e.g. a user-driven parameter.
	//duppedDocument.mergeVisibleLayers();	
	
	var exportOptions = new ExportOptionsSaveForWeb();
	exportOptions.format=SaveDocumentType.PNG;
	exportOptions.PNG8=false;//use 24 bit
	exportOptions.transparency=true;
	// It must be the frontmost document to do the export.
	app.activeDocument = duppedDocument;
	try {
	// Note that the next line could cause a out of space error... We'll have to handle it in another location.
	duppedDocument.exportDocument(this.tempImgFile, ExportType.SAVEFORWEB, exportOptions);
	} catch (e) {
		alert("Could not place, probably because you're out of space on your hard drive.\n\n"+e);
		return false;
	}
	// Note that we just updated this one... If we're updating the same one, we don't need to reopen and recopy it.
	this.tempImgFileLastLinkFrom = file;
	this.tempImgFileLastLinkFromDate = new Date();

	duppedDocument.close(SaveOptions.DONOTSAVECHANGES);

	if (!fileWasOpen)
		referencedDocument.close(SaveOptions.PROMPTTOSAVECHANGES); // we prompt in case it was already open... I wish we could know whether it was open or not.
	return true;
}

/**********************
	* CanLinkIt.loadFileIntoSmartObjectLayer
	* 
	* This is used before placing a flattened file into a new location: get the linked file and save it as a temporary file that we'll use to import shortly afterwards.
	* This performs the same function as the Layers Panel, Select A Layer, Right Click, then select "Replace Contents...", taking in a parameter.
	*
	* Input: file (a File)
	* Returns: the Place Action Descriptor
	* Output: None
	* Assumptions: The desired layer to update is currently the app.activeDocument.activeLayer (not sure if this is a requirement but I suspect so)
	*/
CanLinkIt.prototype.loadFileIntoSmartObjectLayer = function(file, layerRef) {
	try {
		// To replace a smart object layer, you need to use photoshop's executeAction.
		var desc = new ActionDescriptor();
		desc.putPath( charIDToTypeID("null"), new File(file) );
		/*alert("layerRef="+layerRef+"\n"+
			"className="+getClassName(layerRef)+"\n"+
			"layerRef.bounds="+layerRef.bounds+"\n"+
			"layerRef.name="+layerRef.name);*/
		if( layerRef!=undefined && layerRef.name != undefined ) {
			var ref = new ActionReference();
			// Note: Since this works even when there are multiple layers with the same layerName, it would be reasonable to guess that it's required that the target layer be the activeLayer despite the layerName parameter below.
			ref.putName( charIDToTypeID("Lyr "), layerRef.name );
			desc.putReference( charIDToTypeID("Lyr "), ref );
		}

		// The place command changes the size of the object to the original size... We don't want that, we want the current size the user has set on the object. So...
		// Save the original size
		var originalX=layerRef.bounds[0].as("pixels");
		var originalY=layerRef.bounds[1].as("pixels");
		var originalWidth=layerRef.bounds[2].as("pixels");
		var originalHeight=layerRef.bounds[3].as("pixels");

		// do the actual place
		var actionDescriptor = executeAction( stringIDToTypeID("placedLayerReplaceContents"),
			desc, DialogModes.NO );
			
		/**Restore the size
			For some reason, Photoshop's resize method doesn't actually work off the percentage you'd expect. I'm not quite sure what's going wrong with this...
			However, there is this awkward workaround.
			So I had to do two things to make this work:
			(1) When resizing, we don't rescale exactly to the % you'd expect to scale to.
			(2) I use iterations -- so if it's off by a pixel due to a rounding error, it will rescale again until it's perfect or we give up after 9 tries.
			
			I've managed to get it down to work in 1 iteration on my tests, but I expect this to not always work because of decimal inaccuracy.
			*/
		for (var i=0; i<9; i++) {
			var newX=layerRef.bounds[0].as("pixels");
			var newY=layerRef.bounds[1].as("pixels");
			var newWidth=layerRef.bounds[2].as("pixels");
			var newHeight=layerRef.bounds[3].as("pixels");
			if (originalWidth==newWidth && originalHeight==newHeight) {
				// don't do any resizing.
				logIt("count="+i+": done resizing.");
				//alert("count="+i+": done resizing.");
				break;
			} else {
				var rescaleWidth=(originalWidth/newWidth)*100;
				var rescaleHeight=(originalHeight/newHeight)*100;
		
				// When we do nothing in the next block, it would suceed at count=8. But we can do better.
				// When I set it to divide by 1.66666666666 below if it's greater, then it works in only one iteration.
				if (originalWidth<newWidth)
					rescaleWidth=rescaleWidth/1.66666666666;
				if (originalHeight<newHeight)
					rescaleHeight=rescaleHeight/1.66666666666;
				/*if (originalWidth==newWidth)
					rescaleWidth=100;
				else if (originalWidth>newWidth)
					rescaleWidth=rescaleWidth/5;
				else if (originalWidth<newWidth)
					rescaleWidth=rescaleWidth/1.333333333;// TODO
					
				if (originalHeight==newHeight)
					rescaleHeight=100;
				else if (originalHeight>newHeight)
					rescaleHeight=rescaleHeight/5;
				else if (originalHeight<newHeight)
					rescaleHeight=rescaleHeight/1.333333333;//TODO*/
					
				logIt("count="+i+"\n"+
					"width="+newWidth+" (target="+originalWidth+")\n"+
					"height="+newHeight+" (target="+originalHeight+")\n"+
					"... so.... \n"+
					"rescaleWidth="+rescaleWidth+"\n"+
					"rescaleHeight="+rescaleHeight+"\n");
				layerRef.resize(rescaleWidth, rescaleHeight, AnchorPosition.MIDDLECENTER);
			}
		}
			
		return actionDescriptor;
	} catch (e) {
		if (typeof BREAK_ON_UNEXPECTED!= "undefined") $.bp();
		logIt("CanLinkIt.loadFileIntoSmartObjectLayer(): Failed due to error: "+e);
		throw ErrStrs.DEFAULT;
	}
}

/**********************
	* CanLinkIt.loadTempFileIntoSmartObjectLayer
	* 
	* This is used to place a flattened file into the new location. Assumes you've called loadFileIntoTempFile(), this should generally be called right afterwards.
	*
	* Input: layerName: The layer name.
	* Returns: The ActionDescriptor for the place action
	* Output: None
	* Assumptions: The desired layer to update is currently the app.activeDocument.activeLayer (not sure if this is a requirement but I suspect so)
	*/
CanLinkIt.prototype.loadTempFileIntoSmartObjectLayer = function(layerRef) {
	return this.loadFileIntoSmartObjectLayer(this.tempImgFile, layerRef);
}

CanLinkIt.prototype.isLayerUpToDate = function (xmp, file) {
	if( xmp.getProperty( this.AdobeLinksNameSpace,"fileDateLinked" )  == getDateFileModified( file ).toString() )
		return true;
	else
		return false;	
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
		return this.getXMLForBrokenLink(false, false, false,true);
	}

	if (layer.kind != LayerKind.SMARTOBJECT) {
		logIt("CanLinkIt.getLayerInfo: marking data invalid because it's not a smart object");
		return this.getXMLForBrokenLink(true, false, false);
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
			return this.getXMLForBrokenLink (true, true, false);
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
         xml += convertToXML( true, "hasLink" );
		xml += convertToXML( xmp.getProperty(this.AdobeLinksNameSpace,"linkDate").toString(), "linkDate");
		if( file.exists ) {
			// TODO in the future we could use canEdit to show if the source file is editable
			//xml += convertToXML( true , "canEdit");
			xml += convertToXML( true , "isValid");// 'linked icon'
			xml += convertToXML( getDateFileModified( file ).toString(), "fileDate");
			xml += convertToXML(this.isLayerUpToDate(xmp, file), "isCurrent");
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
		return this.getXMLForBrokenLink (true, true, false);
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
					//return this.getXMLForBrokenLink(false,false, false);					
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
			return this.getXMLForBrokenLink(false,false, false);
		}
		logIt("CanLinkIt.getActiveLayerInfo: 20");
		var selectedLayerCount = getSelectedLayersCount();
		if( selectedLayerCount > 1 ){
			// Multiple layers are selected
			// TODO find out if any are smart layers and have reference info... Because we could show that status and allow updates to these selected layers.
			
			return this.getXMLForBrokenLink(true,false, true);
		}
		logIt("CanLinkIt.getActiveLayerInfo: 30");
		var supportsLayers = ( activeDocument.mode != DocumentMode.BITMAP ) && ( activeDocument.mode != DocumentMode.INDEXEDCOLOR );
		if( supportsLayers == false ) {
			// This document can't have objects.
			// TODO send back a better error message.
			return this.getXMLForBrokenLink(false,false,false);
		}
		logIt("CanLinkIt.getActiveLayerInfo: 40");
		return this.getLayerInfo(activeDocument, activeDocument.activeLayer);
	} catch (e) {
		logIt("CanLinkIt.getActiveLayerInfo(): marking data invalid because of exception: "+e.toString());
		if (typeof BREAK_ON_UNEXPECTED!= "undefined") $.bp();
		return this.getXMLForBrokenLink (true, true, false);
	}
}


CanLinkIt.prototype.getRelativeFilePath = function(filePathString) {
	// Rework the file name to make a relative version of the file name here
	var activeFileName = activeDocument.fullName.toString();
	var relativePathString = filePathString.toString();
	var numToTrim=0;
	while (activeFileName.length>0 && relativePathString.length>0 && activeFileName.charAt (numToTrim)==relativePathString.charAt(numToTrim)) {
		// Trim only at slashes, e.g. only at full folders that are identical:
		if (activeFileName.charAt(numToTrim)=="/") {
			numToTrim++; // e.g. if we're at 0, we want to keep from 1 on
			activeFileName=activeFileName.substr (numToTrim, activeFileName.length-numToTrim);
			relativePathString=relativePathString.substr (numToTrim, relativePathString.length-numToTrim);
			numToTrim=0;
		} else
			numToTrim++;
	}
	logIt("CanLinkIt.setRelativeFilePath: the current open file path is: "+activeDocument.fullName);
	logIt("CanLinkIt.setRelativeFilePath: the link to file path is:           "+filePathString);
	
	logIt("CanLinkIt.setRelativeFilePath: Short Path 1: "+activeFileName);
	logIt("CanLinkIt.setRelativeFilePath: Short Path 2: "+relativePathString);
	
	var countSlashes =0;
	var index=0;
	while (index<activeFileName.length) {
		if (activeFileName.charAt(index)=="/")
			countSlashes++;
		index++;
	}
	logIt("CanLinkIt.setRelativeFilePath: number of /: "+countSlashes);
	for (var i=0; i<countSlashes; i++)
		relativePathString="../"+relativePathString;
	logIt("CanLinkIt.setRelativeFilePath: relative path: "+relativePathString);
	return relativePathString;
}

/***************************
	* CanLinkIt.removeExtraDotDotSlashesFromFilename()
	*
	* Specifically for use on a mac, because new File(name) doesn't resolve "MyFolder/../File.psd" to just "File.psd", as it should. That messes up all our comparisons, so we use this before we create new files from paths that might include "../"
	*
	*/
CanLinkIt.prototype.removeExtraDotDotSlashesFromFilename = function(filePathString) {
	//logIt("CanLinkIt.removeExtraDotDotSlashesFromFilename("+filePathString+"): Starting:");
	// We start at the beginning of this, because we're trimming the / path right before it. If we started at the end it would collapse /../../ to just /
	while (filePathString.indexOf("../")>-1) {
		var index=filePathString.indexOf("../");
		var prevSlash = filePathString.substr(0, index-1).lastIndexOf("/");
		/*$.writeln("index="+index);
		$.writeln("prevSlash="+prevSlash);*/
		if (prevSlash==-1) {
			if (index>0)
				// Trim to the front of it.
				prevSlash=0;
			else {
				// There's nothing more to trim... Too bad
				// TODO there could be later ../ further into the document that we might need to trim... We would have to do this same thing but start at the end.
				break;
			}
		}
		filePathString=filePathString.substring(0,prevSlash)+filePathString.substr(index+2);		
	}

	// TODO we should do another pass here at the end because those ../ are the deepest. It's possible that we start with a ../ that can't be removed, so if we started at the beginning we might miss ones later on.
	// But it isn't possible that if it ends with a ../ that can't be removed, that there are any earlier ones that can't be removed.

	return filePathString;
}



/******************
	* CanLinkIt.getFileFromXMP()
	*
	* Each layer has XMP data. The XMP data stores our link info. This retrieves just the linked file from the XMP data.
	*
	* Arguments: ?XMPMeta?, boolean (true to ask the user for help finding a missing file, false is usually used for automated testing where we don't want to ask the user anything)
	* Returns: File (the one that's linked)
	*/
CanLinkIt.prototype.getFileFromXMP = function(xmp, askUser) {
		
	var linkRef = xmp.getProperty( this.AdobeLinksNameSpace, XMPObjectTags.URI );
	if (linkRef==undefined || linkRef==null)
		// it's not linked
		return null;
	var linkedFile = new File( linkRef.toString() );
	if (linkedFile.exists)
		return linkedFile;

	// It's still not there, so check for the relative URL
	linkRef = xmp.getProperty( this.AdobeLinksNameSpace, XMPObjectTags.RelativeURI );
	if (linkRef!=null && linkRef!=undefined) {
		// Get the path of the other file, relative to this one.
		linkRef = app.activeDocument.path+"/"+linkRef;
		// On a mac, when we do new File(...) it won't resolve "../" and erase the path, it sticks in the file itself. So we need to manually delete these.
		linkRef = this.removeExtraDotDotSlashesFromFilename(linkRef);
		linkedFile = new File(linkRef.toString());
		if (linkedFile.exists) {
			return linkedFile;
		}
	}
	
	// It's not there, so check for the same file name in the same folder as this document:
	linkedFile = new File( activeDocument.fullName.parent +'/' + getSmartlayerFilename() );
	if (linkedFile.exists)
		return linkedFile;
	// Still not found, so ask the user for help finding it
	if (!askUser)
		return;
	linkedFile = File.openDialog ( 'Please locate file that was at '+decodeURI(linkedFile), undefined, false );
	if( linkedFile == undefined ) {
		return null;
		//throw ErrStrs.USER_CANCELLED;
	}
}

/***************************
	* saveLinkInfoFor(file)
	* Saves info to XMP for this linked file, to the current layer.
	* (Assumes that the file was just linked)
	*
	*/
CanLinkIt.prototype.saveLinkInfoFor = function(file) {
	try {
		var xmp = this.xmpHelper.getXMPFrom(activeDocument.activeLayer);
		xmp.setProperty( this.AdobeLinksNameSpace, XMPObjectTags.URI, decodeURI( file ) );
		xmp.setProperty( this.AdobeLinksNameSpace, XMPObjectTags.RelativeURI, this.getRelativeFilePath(decodeURI(file)));
		
		xmp.setProperty( this.AdobeLinksNameSpace, XMPObjectTags.LINKDOCNAME, decodeURI( file.name ) );
		xmp.setProperty( this.AdobeLinksNameSpace, "layerName", activeDocument.activeLayer.name );
		// set with xmp date format
		xmp.setProperty( this.AdobeLinksNameSpace, "fileDate", getDateFileModified( file ) );
		xmp.setProperty( this.AdobeLinksNameSpace, "fileDateLinked", getDateFileModified( file ) );
		xmp.setProperty( this.AdobeLinksNameSpace, "linkDate", new XMPDateTime ( new Date() ).toString() );
		
		this.xmpHelper.saveXMP(activeDocument.activeLayer, xmp);
	} catch(e) {
		if (typeof BREAK_ON_UNEXPECTED!= "undefined") $.bp();
		logIt("CanLinkIt.linkToFile(): "+e.toString());
	}
}

/*********************************************
	* newLinkTo(file)
	* 
	*
	*/
CanLinkIt.prototype.newLinkTo = function(file){
	if (app.documents.length==0) {
		logIt("CanLinkIt.newLink: "+ErrStrs.NO_FILE_OPEN);
		throw ErrStrs.NO_FILE_OPEN;
	}
	if( file == undefined ) {
		// Nothing to link...
		logIt("CanLinkIt.newLinkTo(file): file was null... This is a programmer error somewhere.");
		return false;
	}

	try {
		// Then Use Photoshop's "Place" command to place The Temp File into a smart object:
		var idPlc = charIDToTypeID( "Plc " );
		var desc2 = new ActionDescriptor();
		var idnull = charIDToTypeID( "null" );

		// Update The Layer From The Link
		if (PsdLib.isMultiLayer(file.name)==false) {
			// It's pre-flattened. Just load the already flat file.
			desc2.putPath( idnull, file);
		} else {
			// It's a multilayer file or an unknown one (if the value was null). So, compress it down to one layer.
			// We need to remember what file we were in, because it may be changed in the process.
			var docToUpdate = app.activeDocument;
			if (!this.loadFileIntoTempFile(file)) {
				// failed, can't do it. Don't try. Error message should already have displayed.
				return false;
			}
			app.activeDocument=docToUpdate;
			desc2.putPath( idnull, this.tempImgFile);
		}	

		var idFTcs = charIDToTypeID( "FTcs" );
		var idQCSt = charIDToTypeID( "QCSt" );
		var idQcsa = charIDToTypeID( "Qcsa" );
		desc2.putEnumerated( idFTcs, idQCSt, idQcsa );
		var idOfst = charIDToTypeID( "Ofst" );
		var desc3 = new ActionDescriptor();
		var idHrzn = charIDToTypeID( "Hrzn" );
		var idPxl = charIDToTypeID( "#Pxl" );
		desc3.putUnitDouble( idHrzn, idPxl, 0.000000 );
		var idVrtc = charIDToTypeID( "Vrtc" );
		var idPxl = charIDToTypeID( "#Pxl" );
		desc3.putUnitDouble( idVrtc, idPxl, 0.000000 );
		var idOfst = charIDToTypeID( "Ofst" );
		desc2.putObject( idOfst, idOfst, desc3 );
		executeAction( idPlc, desc2, DialogModes.NO );

		if (PsdLib.isMultiLayer(file.name)!=false) {
			// so we collapsed it. this means the file name is the temp file name, which is no good. We have to update the layer name.
			var newName = file.name;
			if (newName.lastIndexOf(".")>0)
				newName = newName.substr(0, newName.lastIndexOf("."));
			app.activeDocument.activeLayer.name=newName;
		}
		
		this.saveLinkInfoFor(file);

		//this.linkedLayers.addLinkedLayer(app.activeDocument, app.activeDocument.activeLayer);
		
		return true;
	} catch (e) {
		logIt("CanLink.newLinkTo: "+e);
		if (typeof BREAK_ON_UNEXPECTED!= "undefined") $.bp();
	}
}

/*****************************************************************
   * CanLinkIt.newLink
   * 
   * Links to a new document.
   * We use the same xmp properties as the Adobe open "Link" project so that it will be backwards compatible with it, for any users who have used that free resource in the past.
   */
CanLinkIt.prototype.newLink = function(){
	if (app.documents.length==0) {
		logIt("CanLinkIt.newLink: "+ErrStrs.NO_FILE_OPEN);
		throw ErrStrs.NO_FILE_OPEN;
	}
	
	// We want to manually ask the user what file to use, and to link it ourself. However, we need to know how to ddo that from a script.
	try {
		var linkedFile = File.openDialog ( 'Open the file to link to', undefined, false);
		if( linkedFile == undefined ) {
			// User Cancelled.
			return;
		}
		this.newLinkTo(linkedFile);
	} catch (e) {
		logIt("CanLink.newLink: "+e);
		if (typeof BREAK_ON_UNEXPECTED!= "undefined") $.bp();
	}	
	/*try {

		// Let user place the file and get Action Descriptor
		var description = new ActionDescriptor();
		description.putEnumerated( 1179935603, 1363366772, 1365472097 );
		description.putUnitDouble( 1466201192, 592474723, 100 );
		description.putUnitDouble( 1214736500, 592474723, 100 );
		description.putUnitDouble( 1097754476, 591490663, 0 );
		description.putBoolean( 1282304868, true );
		var descriptionResult = executeAction( 1349280544, description, DialogModes.ALL );

		app.refresh();
		// get the file object from the descriptor
		var f = descriptionResult.getPath(charIDToTypeID('null'));
		this.saveLinkInfoFor(f);
	} catch(e) {logIt("CanLinkIt.newLink(): "+e.toString());}*/
}

/***************************************************
 * CanLinkIt: updateSingleLayer(layerRef)
 * This should be able to handle any layer, whether it's a linked one or not, e.g. we could use it as a vetting mechanism to update all layers in a document.
 * Warning: Due to the way we're doing loadFileIntoSmartObjectLayer(), this probably requires that this layer be the selected layer... It probably can't be done when another layer is selected.
 * Warning: This requires that the document with this layer be currently selected as the app.activeDocument.
 */
CanLinkIt.prototype.updateSingleLayer = function(layerRef) {
	if (layerRef.kind != LayerKind.SMARTOBJECT) {
		//logIt("CanLinkIt.updateSingleLayer: Can't update because it's not a smart object");
		//throw ErrStrs.CANT_UPDATE_NON_SMART_OBJECT;
		return false;
	}
		
	
	var xmp = this.xmpHelper.getXMPFrom(layerRef);
	
	var linkedFile = this.getFileFromXMP(xmp, true);
	if (linkedFile==null)
		return false;
	
	if (this.isLayerUpToDate(xmp, linkedFile))
		// No update is needed -- we're already up to date. Skip it.
		return false;
	
	// Update The Layer From The Link
	if (PsdLib.isMultiLayer(linkedFile.name)==false) {
		// It's pre-flattened. Just load the already flat file.
		this.loadFileIntoSmartObjectLayer(linkedFile, layerRef);
	} else {
		// It's a multilayer file or an unknown one (if the value was null). So, compress it down to one layer.
		// We need to remember what file we were in, because it may be changed in the process.
		var docToUpdate = app.activeDocument;
		if (!this.loadFileIntoTempFile(linkedFile)) {
			// Failed. Don't try to do any more. Error message already displayed.
			return false;
		}
		app.activeDocument=docToUpdate;
		/*alert("updateSingleLayer\n"+
			"layerRef="+layerRef+"\n"+
			"className="+getClassName(layerRef)+"\n"+
			"layerRef.bounds="+layerRef.bounds+"\n"+
			"layerRef.name="+layerRef.name);*/
		this.loadTempFileIntoSmartObjectLayer(layerRef);
	}
	
	//  Do I actually need this app.refresh? It slows down the process...
	//app.refresh();
	xmp.setProperty( this.AdobeLinksNameSpace, XMPObjectTags.URI, decodeURI( linkedFile ) );
	xmp.setProperty( this.AdobeLinksNameSpace, XMPObjectTags.LINKDOCNAME, decodeURI( linkedFile.name ) );
	xmp.setProperty( this.AdobeLinksNameSpace, "layerName", layerRef.name );
	// set with xmp date format
	xmp.setProperty( this.AdobeLinksNameSpace, "fileDate", getDateFileModified( linkedFile ) );
	xmp.setProperty( this.AdobeLinksNameSpace, "fileDateLinked", getDateFileModified( linkedFile ) );
	xmp.setProperty( this.AdobeLinksNameSpace, "linkDate", new XMPDateTime ( new Date() ).toString() );
	this.xmpHelper.saveXMP(layerRef, xmp);
	return true;
}

CanLinkIt.prototype.updateSelected = function(){
	// TODO need to update multiple layers if multiple layers are selected

	if (app.documents.length==0)
		throw ErrStrs.NO_FILE_OPEN;
	
	return this.updateSingleLayer(activeDocument.activeLayer);	
}


CanLinkIt.prototype.updateAnyLayersLinkedTo = function(file) {
	var updatedSomething=false;

	try {
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
		
			var linkedFile = this.getFileFromXMP(xmp, true);
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
	
	// Update Each Layer:
	for(var i = 0; i <= numberOfLayers; i++) {
		if (!PsdLib.prototype.isValidActiveLayer(i)) {
			logIt("CanLinkIt.updateAll: layer "+i+" is not a valid active layer");
			continue;
		}
		logIt("CanLinkIt.updateAll: layer "+i+": attempting to update");
		PsdLib.prototype.makeActiveByIndex(i, false );
		
		this.updateSelected();
    }

	// Reset to the user's original layer selection:
	activeDocument.activeLayer=originalActiveLayer;
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