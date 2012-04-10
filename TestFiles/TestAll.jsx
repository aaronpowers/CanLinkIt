/*********************************************
Copyright 2011 Aaron Powers
All Rights Reserved
*/
/******************
 * 
 * To run this test:
 * (1) Open DeveloperVariables.jsx and edit any necessary variables.
 * (2) Open this file in ExtendScript Toolkit
 * (3) Press F5
 * (4) Look at ExtendScript's "Javascript Console" for a summary -- if all went well, it should say "Number of errors: 0" at the bottom.
 */

$.writeln("----------------------------------------------\n"+
	"Starting TestAll.jsx");

// I try to order these by their dependencies, so we'll find the root causes first.
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

#include "TestCanLinkIt.jsx"
trueTotalErrorCount+=errorCount;
if (errorMessages!=null && errorMessages.length>0)
	trueErrorMessages+="\n"+errorMessages;

#include "TestEditedSOHelper.jsx"
trueTotalErrorCount+=errorCount;
if (errorMessages!=null && errorMessages.length>0)
	trueErrorMessages+="\n"+errorMessages;

/*#include "TestLinkedLayers.jsx"
trueTotalErrorCount+=errorCount;
if (errorMessages!=null && errorMessages.length>0)
	trueErrorMessages+="\n"+errorMessages;*/




// The next line will show up in the JavaScript Console in ExtendScript Toolkit, so it works to check on errors:
$.writeln(trueErrorMessages+"\n"+
"All tests are complete. total of errors: "+trueTotalErrorCount);