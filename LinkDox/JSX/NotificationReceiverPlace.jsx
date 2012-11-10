//#includepath "../LinkDox/CanLinkIt"
//#include "CanLinkIt.jsx"
//#include "PrefsLib.jsxinc"
//#include "UnitTestLib.jsxinc"
//#include "XMLLib.jsxinc"
//#include "Logging.jsxinc"


/*Because of the following line, it's no longer necessary to edit extendscript by going to just above the top of this script, change the dropdown from 
	"ExtendScript Toolkit CS5" to one of the "Adobe Photoshop" selections -- whichever one you want to test */
#target photoshop

#include "Logging.jsxinc"
#include "XMPLib.jsxinc"
#include "LinksXMP.jsxinc"
var linksXMP=new LinksXMP();
DefaultLogFile=new File(Folder.temp + "/CanLinkIt-NotificationReceiverPlace.log" );

// TODO it would be great if we could reach out to CanLinkIt. However, the JSX is undefined from this call. Is there a way to call this?
/*alert("Warning: You have just used Photoshop's 'Place' command.\n"+
	"This will not link your layers. To link your layers,\n"+
	"(1) Open the panel by going to Window -> Extensions -> CanLinkIt\n"+
	"(2) Click 'New Link'");*/
	
	
try {
	if (arguments.length >= 2) {
		var desc = arguments[0];
		var event = arguments[1];
		if (event == charIDToTypeID('Plc ')) {
			var fileObj = arguments[0].getPath(charIDToTypeID('null'));
			/*alert("The link was made to: "+ fileObj.absoluteURI );*/
			linksXMP.saveLinkInfoFor(fileObj, activeDocument.activeLayer);
			//alert("The link was tracked making CanLinkIt. You may update it in CanLinkIt.");
				/*function loadXMPLibrary(){
					if ( !ExternalObject.AdobeXMPScript ){
						try{
							ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
						}catch (e){
							alert("Can't load XMP Script Library");
							return false;
						}
					}
					return true;
				};
				function setCommMetadata(comm){
					if( app.activeDocument.activeLayer.isBackgroundLayer){
						alert( 'Can not place metadata on a background layer.' );
					} else {
						var xmp;
						if ( comm == "" )
							comm = " ";
					
						try{
							xmp = new XMPMeta( app.activeDocument.activeLayer.xmpMetadata.rawData );
						} catch( e ) {
							xmp = new XMPMeta();
						}
						try{
							xmp.setProperty( XMPConst.NS_EXIF, "userComment", comm );
						} catch( e ) {
							alert( 'Unable to place metadata on selected layer.\n' + e );
						}
						app.activeDocument.activeLayer.xmpMetadata.rawData = xmp.serialize();
					}
				};
				loadXMPLibrary();
				setCommMetadata( decodeURI(fileObj.absoluteURI ) );*/
		} else {
			logIt("NotificationReceiverPlace: wrong event type: "+event);
		}
	} else {
		logIt("NotificationReceiverPlace: arguments.length="+arguments.length);
	}
	logIt("NotificationReceiverPlace: After ifs");
} catch (e) {
	logIt( "NotificationReceiverPlace: Error: " + e + ":" + e.line );
}
	
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
