/*On Windows, the script home is from the Photoshop Folder:*/
#includepath "Plug-ins/Panels/CanLinkIt/"
/*On Mac, the script home is buried inside the Photoshop.app:*/
#includepath "../../../Plug-ins/Panels/CanLinkIt/"
#include "CanLinkIt.jsx"

/*Because of the following line, it's no longer necessary to edit extenscript by going to just above the top of this script, change the dropdown from 
	"ExtendScript Toolkit CS5" to one of the "Adobe Photoshop" selections -- whichever one you want to test */
#target photoshop


// TODO in order to make this work, we need to learn how to send messages that are delayed, because we're going to need to delay part of this.
function editSOWasCalled() {
	alert("Did the include work? linkDox="+linkDox);
	linkDox.userEditedSO();
}
editSOWasCalled();