#includepath "../LinkDox/JSX"
#include "CanLinkIt.jsx"
#include "PrefsLib.jsxinc"
#include "UnitTestLib.jsxinc"
#include "XMLLib.jsxinc"
#include "Logging.jsxinc"


/*Because of the following line, it's no longer necessary to edit extenscript by going to just above the top of this script, change the dropdown from 
	"ExtendScript Toolkit CS5" to one of the "Adobe Photoshop" selections -- whichever one you want to test */
#target photoshop

/*function applyLayerComp(layerCompName) {
	var compsCount = app.activeDocument.layerComps.length;
	if ( compsCount <= 1 ) {
		if ( app.playbackDisplayDialogs != DialogModes.NO) {
			alert ( "The layer comp, \""+layerCompName+"\" could not be found, because there are no layer comps in the document anymore." );
		}
		return 'cancel'; // quit, returning 'cancel' (dont localize) makes the actions palette not record our script
	}
	app.activeDocument = app.documents[docName];
	docRef = app.activeDocument;
    
	var rememberMaximize;
	var needMaximize = exportInfo.psdMaxComp ? QueryStateType.ALWAYS : QueryStateType.NEVER;
	if ( exportInfo.fileType == psdIndex && app.preferences.maximizeCompatibility != needMaximize ) {
		rememberMaximize = app.preferences.maximizeCompatibility;
	app.preferences.maximizeCompatibility = needMaximize;
	}
            
	for ( compsIndex = 0; compsIndex < compsCount; compsIndex++ ) {
		var compRef = docRef.layerComps[ compsIndex ];
		if (exportInfo.selectionOnly && !compRef.selected) continue; // selected only
		compRef.apply();
	}
}*/


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

// I can get selected layer indexes, but those indexes don't seem to line up with any other list if there are any folders... I don't see any way to solve this.
function getSelectedLayersCount() {
	var res = new Number();
	var ref = new ActionReference();
	ref.putEnumerated( charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );
	// desc is of type ActionReference:
	var desc = executeActionGet(ref);
	if( desc.hasKey( stringIDToTypeID( 'targetLayers' ) ) ){
		// After this line, desc is a type ActionList
		desc = desc.getList( stringIDToTypeID( 'targetLayers' ));
		res = desc.count;
		/*alert("selected layers="+desc.count+"\n"+
		desc+"\n"+
		desc.typename);*/
		var result = "";
		for (var i=0; i<desc.count; i++) {
			var actionReference = desc.getReference(i);
			result+=/*"Item "+i+"\n"+*/
			//"Type="+desc.getType(i)+"\n"+
			//"Ref="+actionReference+"\n"+
			//"Name="+actionReference.getName()+"\n"+
			//"Form="+actionReference.getForm()+"\n"+
			"Selected Index="+actionReference.getIndex()+"\n";
		}
		alert(result);
	}else{
		try{
			// how to tell if no layer is selected?
			// this returns the top layer if no layer selected
			 app.activeDocument.activeLayer.name;
			 alert("selected layer");
			res = 1;
		}catch(e){
			res = 0;
		}	
	}
	return res;
}

function selectedLayers2() {
	var result="";
	for (var i=0; i<activeDocument.artLayers.length; i++)
		result+=activeDocument.artLayers[i]+"\n";
	alert(result);
}

selectedLayers2();
//getSelectedLayersCount();


