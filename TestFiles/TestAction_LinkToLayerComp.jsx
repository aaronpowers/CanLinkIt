#includepath "../LinkDox/JSX"
#include "UnitTestLib.jsxinc"
#include "TestFiles.jsxinc"
/*#include "XMLLib.jsxinc"
#include "Logging.jsxinc"*/

#include "CanLinkIt.jsx"
/*#include "Action_LinkToLayerComp.jsxinc"

#include "LoadLinkedFiles.jsxinc"
#include "XMPLib.jsxinc"
#include "PsdLib.jsxinc"
#include "LinksXMP.jsxinc"

var linksXMP=new LinksXMP();
var loadLinkedFiles=new LoadLinkedFiles();*/


/*Because of the following line, it's no longer necessary to edit extenscript by going to just above the top of this script, change the dropdown from 
	"ExtendScript Toolkit CS5" to one of the "Adobe Photoshop" selections -- whichever one you want to test */
#target photoshop


function testGetLayerCompsNames() {
	app.open(new File(rootPath+endOfPath+"Files/LayerComps/HasLayerComps.psd"));
	
	var names = Action_LinkToLayerComp.getLayerCompsNames();
	assertEquals(3, names.length, "There should be 3 layer comps in the HasLayerComps.psd file.");
	assertEquals("Layer Comp 1", names[0], "The layer comp name does not match.");
	assertEquals("Layer Comp 2", names[1], "The layer comp name does not match.");
	assertEquals("Layer Comp 3", names[2], "The layer comp name does not match.");
	
	/*for (var i=0; i<names.length; i++) {
		$.writeln("\tname: "+names[i]);
	}*/
	
	app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);	
}

function manualTest_testLayerCompDialog() {
	app.open(new File(rootPath+endOfPath+"Files/LayerComps/Empty.psd"));
	Action_LinkToLayerComp.newLinkToLayerComp();
	/*app.open(new File(rootPath+endOfPath+"Files/LayerComps/HasLayerComps.psd"));
	var result = Action_LinkToLayerComp.pickLayerCompInThisFile();
	alert("Your selection was "+result+"\n(If this was wrong, it is a bug)");
	//$.writeln("manualTest_testLayerCompDialog: User Selection: "+result);*/
	app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);	
}

function testNewLinkToLayerComp() {
	var fileInsertLinkInto=new File(rootPath+endOfPath+"Files/LayerComps/Empty.psd");
	app.open(fileInsertLinkInto);
	var docToLinkInto=app.activeDocument;

	var fileLinkTo=new File(rootPath+endOfPath+"Files/LayerComps/HasLayerComps.psd");
	app.open(fileLinkTo);
	Action_LinkToLayerComp.newLinkToSpecificLayerComp(docToLinkInto, fileLinkTo,"Layer Comp 2");
	
	// test to make sure the XMP is there
	checkForActiveLayerIsUpToDate();
	// check the XMP to see if it has the layer comp
	var xml = canLinkIt.getActiveLayerInfo("1");
	assertXMLHasProperty(XMPObjectTags.LINK_LAYER_COMP_NAME, "Layer Comp 2", xml, "testLinkToNewLayerComp(): The XML should have included a property for the layer comp saying it's 'Layer Comp 2'.");
	
	app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
	app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}

function testUpdateLinkToLayerComp() {
	// TODO test updating a link to a layer comp.
	var fileInsertLinkInto=new File(rootPath+endOfPath+"Files/LayerComps/Has-Outdated-Link-To-Layer-Comp.psd");
	app.open(fileInsertLinkInto);

	checkForLayerNeedToBeUpdated("HasLayerComps");
	
	var xml = canLinkIt.getActiveLayerInfo("1");
	assertXMLHasProperty(XMPObjectTags.LINK_LAYER_COMP_NAME, "Layer Comp 2", xml, "testLinkToNewLayerComp(): The XML should have included a property for the layer comp saying it's 'Layer Comp 2'.");

	// Check if update works:
	canLinkIt.updateSelected();	
	checkForActiveLayerIsUpToDate();
	assertXMLHasProperty(XMPObjectTags.LINK_LAYER_COMP_NAME, "Layer Comp 2", xml, "testLinkToNewLayerComp(): The XML should have included a property for the layer comp saying it's 'Layer Comp 2'.");
	
	app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}

function testUpdateAllLinksToLayerComps() {
	// test updating a link to a layer comp.
	var fileInsertLinkInto=new File(rootPath+endOfPath+"Files/LayerComps/LinkedToThreeLayerComps.psd");
	var layerNames = ["HasLayerComps-LayerComp1", "HasLayerComps-LayerComp2", "HasLayerComps-LayerComp3"];
	app.open(fileInsertLinkInto);

	for (var i=0; i<layerNames.length; i++) {
		var layerRef = makeLayerNamedActive(layerNames[i]);
		checkForLayerNeedToBeUpdated(layerNames[i]);
	}
	canLinkIt.updateAll();

	for (var i=0; i<layerNames.length; i++) {
		var layerRef = makeLayerNamedActive(layerNames[i]);
		checkForLayerIsUpToDate(layerNames[i]);
	}
	app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}

closeAllDocuments();
testUpdateAllLinksToLayerComps();
testUpdateLinkToLayerComp();

testGetLayerCompsNames();
if (runManualTests)
	manualTest_testLayerCompDialog();
testNewLinkToLayerComp();

// The next line will show up in the JavaScript Console in ExtendScript Toolkit, so it works to check on errors:
$.writeln(errorMessages+"\n"+
"TestAction_LinkToLayerComp.jsxinc tests are complete. Total errors: "+errorCount);
