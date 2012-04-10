//#includepath "../LinkDox/CanLinkIt"
//#include "CanLinkIt.jsx"
//#include "PrefsLib.jsxinc"
//#include "UnitTestLib.jsxinc"
//#include "XMLLib.jsxinc"
//#include "Logging.jsxinc"


/*Because of the following line, it's no longer necessary to edit extenscript by going to just above the top of this script, change the dropdown from 
	"ExtendScript Toolkit CS5" to one of the "Adobe Photoshop" selections -- whichever one you want to test */
#target photoshop


function placeWasCalled() {
	alert("Warning: You have just used Photoshop's 'Place' command.\n"+
	"This will not link your layers. To link your layers,\n"+
	"(1) Open the panel by going to Window -> Extensions -> CanLinkIt\n"+
	"(2) Click 'New Link'");
	// TODO it would be great if we could get the results from the last ActionDescriptor, because then we could change the action. But I can't find any way to do that.
	/*var desc = new ActionDescriptor();
	desc.fromID( charIDToTypeID( 'Plc ' ));*/
	//alert( typeIDToCharID(desc.getKey(0))+':'+desc.count );
	// desc.getClass() doesn't seem to work
	// so I check the first key - "Mk  " only has one key
	/*if ( desc.count > 0 && desc.getKey(0) == charIDToTypeID( 'Nw  ' ) ) { 
		app.refresh();
	}*/
	
	/*var idnull = charIDToTypeID( "null" );
	
	alert(desc.hasKey(0));
	alert(desc.getKey(0));
	
	alert("I got called: desc="+desc+"\n");
	if (desc.count==undefined)
		alert("count's not defined...");
	else
		alert("count of keys="+desc.count+"\n");*/
	//"path="+desc.getPath(idnull)
}
placeWasCalled();