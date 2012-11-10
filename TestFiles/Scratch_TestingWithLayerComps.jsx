#includepath "../LinkDox/JSX"
#include "CanLinkIt.jsx"
#include "PrefsLib.jsxinc"
#include "UnitTestLib.jsxinc"
#include "XMLLib.jsxinc"
#include "Logging.jsxinc"


/*Because of the following line, it's no longer necessary to edit extenscript by going to just above the top of this script, change the dropdown from 
	"ExtendScript Toolkit CS5" to one of the "Adobe Photoshop" selections -- whichever one you want to test */
#target photoshop

function applyLayerComp(layerCompName) {
	var compsCount = app.activeDocument.layerComps.length;
	if ( compsCount <= 1 ) {
		if ( app.playbackDisplayDialogs != DialogModes.NO) {
			alert ( "The layer comp, \""+layerCompName+"\" could not be found, because there are no layer comps in the document anymore." );
		}
		return 'cancel'; // quit, returning 'cancel' (dont localize) makes the actions palette not record our script
	}
	app.activeDocument = app.documents[docName];
	docRef = app.activeDocument;
    
	/*var rememberMaximize;
	var needMaximize = exportInfo.psdMaxComp ? QueryStateType.ALWAYS : QueryStateType.NEVER;
	if ( exportInfo.fileType == psdIndex && app.preferences.maximizeCompatibility != needMaximize ) {
		rememberMaximize = app.preferences.maximizeCompatibility;
		app.preferences.maximizeCompatibility = needMaximize;
	}*/
            
	for ( compsIndex = 0; compsIndex < compsCount; compsIndex++ ) {
		var compRef = docRef.layerComps[ compsIndex ];
		if (exportInfo.selectionOnly && !compRef.selected) continue; // selected only
		compRef.apply();
	}
}

function getLayerCompsNames() {
	docRef = app.activeDocument;
	
	var compsCount = docRef.layerComps.length;
	if ( compsCount <= 1 ) {
		if ( app.playbackDisplayDialogs != DialogModes.NO) {
			alert ( "The layer comp, \""+layerCompName+"\" could not be found, because there are no layer comps in the document anymore." );
		}
		return 'cancel'; // quit, returning 'cancel' (dont localize) makes the actions palette not record our script
	}
	
	var layerCompsNames = new Array();
	for (var compsIndex = 0; compsIndex < compsCount; compsIndex++ ) {
		var compRef = docRef.layerComps[ compsIndex ];
		//if (exportInfo.selectionOnly && !compRef.selected) continue; // selected only
		compRef.apply();
		//$.writeln("Layer comp: "+compRef);
		layerCompsNames.push(compRef.name);
		//$.writeln("\tname: "+compRef.name);
	}
	return layerCompsNames;
}

function printLayerComps() {
	docRef = app.activeDocument;
	
	var compsCount = docRef.layerComps.length;
	if ( compsCount <= 1 ) {
		if ( app.playbackDisplayDialogs != DialogModes.NO) {
			alert ( "The layer comp, \""+layerCompName+"\" could not be found, because there are no layer comps in the document anymore." );
		}
		return 'cancel'; // quit, returning 'cancel' (dont localize) makes the actions palette not record our script
	}	
	
	
	for (var compsIndex = 0; compsIndex < compsCount; compsIndex++ ) {
		var compRef = docRef.layerComps[ compsIndex ];
		//if (exportInfo.selectionOnly && !compRef.selected) continue; // selected only
		compRef.apply();
		//$.writeln("Layer comp: "+compRef);
		$.writeln("\tname: "+compRef.name);
	}
}

function applyLayerCompNamed(layerCompName) {
	docRef = app.activeDocument;
	
	var compsCount = docRef.layerComps.length;
	if ( compsCount <= 1 ) {
		if ( app.playbackDisplayDialogs != DialogModes.NO) {
			alert ( "The layer comp, \""+layerCompName+"\" could not be found, because there are no layer comps in the document anymore." );
		}
		return 'cancel'; // quit, returning 'cancel' (dont localize) makes the actions palette not record our script
	}	
	
	for (var compsIndex = 0; compsIndex < compsCount; compsIndex++ ) {
		var compRef = docRef.layerComps[ compsIndex ];
		//if (exportInfo.selectionOnly && !compRef.selected) continue; // selected only
		if (compRef.name==layerCompName) {
			compRef.apply();
			return;
		}
		//$.writeln("Layer comp: "+compRef);
		//$.writeln("\tname: "+compRef.name);
	}
	$.writeln("Bug? applyLayerCompNamed('"+layerCompName+"') did not find any layer comps with that name.");
	
}

/***************
	This only returns what the user has currently selected, not our current layer comp.
	*/
	
function getIndexOfUserSelectedLayerComp() {
	docRef = app.activeDocument;
	
	var compsCount = docRef.layerComps.length;
	if ( compsCount <= 1 ) {
		if ( app.playbackDisplayDialogs != DialogModes.NO) {
			return null;// for "None selected";
		}
		//return 'cancel'; // quit, returning 'cancel' (dont localize) makes the actions palette not record our script
	}	
	
	
	for (var compsIndex = 0; compsIndex < compsCount; compsIndex++ ) {
		var compRef = docRef.layerComps[ compsIndex ];
		if (compRef.selected) 
			return compsIndex;
	}	
	
}


/*******************
	* askForALayerComp()
	* Returns the name of a user-selected layer comp.
	*/
function askForALayerComp() {
	res = "dialog { \
				s: StaticText { text:'Which layer comp do you want to link to?', alignment: 'left' },\
				whichInfo: ListBox { alignment:'left' }, \
				buttons: Group { orientation: 'row', alignment: 'right', \
					okBtn: Button { text:'OK', properties:{name:'ok'} }, \
					cancelBtn: Button { text:'Cancel', properties:{name:'cancel'} } \
				} \
			}";
	win = new Window (res);
	var names = getLayerCompsNames();
	/* Ideally, we'd also show the selected layer comp in the background... However, Photoshop doesn't refresh. This code branch has no effect except to visually change the selection (until the actual window has completed).
	win.whichInfo.onChange = function () {
		if (this.selection != null) {
			$.writeln(this.selection.toString());
			applyLayerCompNamed(this.selection.toString());
		}
	}*/
	for (var i=0; i<names.length; i++) {
		var item = win.whichInfo.add ('item', names[i]);
	}
	/*var item = win.whichInfo.add ('item', 'Personal Info');
	//item.group = win.allGroups.info;
	item = win.whichInfo.add ('item', 'Work Info');*/
	//item.group = win.allGroups.workInfo;
	
	// Default to the one currently selected by the user, if there is one.
	var currentSelection = getIndexOfUserSelectedLayerComp();
	if (currentSelection==null) {
		// so just select the first one by default.
		win.whichInfo.selection = win.whichInfo.items[0];
	} else {
		win.whichInfo.selection = win.whichInfo.items[currentSelection];
	}
	
	win.center();
	$.writeln("show:" +win.show());
	// The dialog is closed now. So...
	return win.whichInfo.selection.toString();
}

function linkToALayerComp() {
	var layerName = askForALayerComp();
	
}

/*function setUpNotifier() {
    // Set up listeners to get notifications on certain events
	
	// Note that one advantage of this kind of notifier is that it preserves itself after restarts of Photoshop... We can listen to events even when the LinkDox panel isn't open. This is a big advantage to the one built into the panel.

    app.notifiersEnabled = true
    
    var eventFile = new File("C:/Dropbox/AllDocuments/EntrepreneurshipAndIdeas/LinkDox/FlashBuilderProject/TestFiles/ScratchNotifier.jsx")

	// On a place event:
    app.notifiers.add("Plc ", eventFile);
    // For Open File Notification:
    //app.notifiers.add("Opn ", eventFile)
}
setUpNotifier();*/

//printLayerComps();
//askForALayerComp();
