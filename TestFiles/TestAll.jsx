/*********************************************
Copyright 2011 Aaron Powers
All Rights Reserved
*/
/******************
 * 
 * To run this test:
 * (1) Open DeveloperVariables.jsx and edit any necessary variables.
 * (2) Open this file in ExtendScript Toolkit
 * (3) Open Photoshop. Make sure the CanLinkIt panel is closed. Close Photoshop.
		(The CanLinkIt panel has to have been closed when Photoshop was launched or else you'll get a lot of dialogs as Photoshop is listening to events we generate opening up smart panels).
 * (4) Press F5
 * (5) Look at ExtendScript's "Javascript Console" for a summary -- if all went well, it should say "Number of errors: 0" at the bottom.
 */

$.writeln("----------------------------------------------\n"+
	"Starting TestAll.jsx");

// Close before we do any tests (so the user interaction is up front, since we should ask in case we have anything we wanted to save).
// Each test script that accesses documents should do this too, in case that script is run on its own.
closeAllDocuments();

/**************
	I try to order these by their dependencies, so we'll find the root causes first.
	Libraries first so we test things that don't depend on anything else first:
	*/
var start = new Date().getTime();	

#include "TestXMLLib.jsx"
var trueTotalErrorCount=errorCount;
var trueErrorMessages=errorMessages;

#include "TestUnitTestLib.jsx"
trueTotalErrorCount+=errorCount;
if (errorMessages!=null && errorMessages.length>0)
	trueErrorMessages+="\n"+errorMessages;

#include "TestPrefsLib.jsx"
trueTotalErrorCount+=errorCount;
if (errorMessages!=null && errorMessages.length>0)
	trueErrorMessages+="\n"+errorMessages;

#include "TestPsdLib.jsx"
trueTotalErrorCount+=errorCount;
if (errorMessages!=null && errorMessages.length>0)
	trueErrorMessages+="\n"+errorMessages;

#include "TestFileLib.jsx"
trueTotalErrorCount+=errorCount;
if (errorMessages!=null && errorMessages.length>0)
	trueErrorMessages+="\n"+errorMessages;

/**************
	Now for CanLinkIt non-library files:
	*/

/*#include "TestLinkedLayers.jsx"
trueTotalErrorCount+=errorCount;
if (errorMessages!=null && errorMessages.length>0)
	trueErrorMessages+="\n"+errorMessages;*/

#include "TestCanLinkIt.jsx"
trueTotalErrorCount+=errorCount;
if (errorMessages!=null && errorMessages.length>0)
	trueErrorMessages+="\n"+errorMessages;

// Relies on PsdLib and CanLinkIt, but adds just one method to it. (CanLinkIt also relies on this method but I don't think any of the tests test the resize portion.
#include "Test_PsdLib_Resize.jsxinc"
trueTotalErrorCount+=errorCount;
if (errorMessages!=null && errorMessages.length>0)
	trueErrorMessages+="\n"+errorMessages;

/*The following files use base CanLinkIt, but CanLinkIt does not call them in the course of regular testing:*/
#include "TestEditedSOHelper.jsx"
trueTotalErrorCount+=errorCount;
if (errorMessages!=null && errorMessages.length>0)
	trueErrorMessages+="\n"+errorMessages;

#include "TestCanLinkIt_UpdateMultipleSelectedLayers.jsx"
trueTotalErrorCount+=errorCount;
if (errorMessages!=null && errorMessages.length>0)
	trueErrorMessages+="\n"+errorMessages;
	
#include "TestAction_LinkToLayerComp.jsx"
trueTotalErrorCount+=errorCount;
if (errorMessages!=null && errorMessages.length>0)
	trueErrorMessages+="\n"+errorMessages;

#include "TestUpdateAllFiles.jsx"
trueTotalErrorCount+=errorCount;
if (errorMessages!=null && errorMessages.length>0)
	trueErrorMessages+="\n"+errorMessages;

#include "Test_NotificationReceiverPlace.jsx"
trueTotalErrorCount+=errorCount;
if (errorMessages!=null && errorMessages.length>0)
	trueErrorMessages+="\n"+errorMessages;


// The next line will show up in the JavaScript Console in ExtendScript Toolkit, so it works to check on errors:
$.writeln("------------------------------------------------------\nSummary of all errors (duplicates of above): "+trueErrorMessages+"\n"+
"All tests are complete. total of errors: "+trueTotalErrorCount);

var stop = new Date().getTime();
var elapsed = (stop - start)/1000;
if (elapsed<60)
	$.writeln("Tests took " + Number(elapsed).toFixed(0) + " seconds.");
else
	$.writeln("Tests took " + Number(elapsed/60).toFixed(1) + " minutes.");