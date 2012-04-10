#includepath "../LinkDox/JSX"
#include "XMLLib.jsxinc"
#include "UnitTestLib.jsxinc"
#include "Logging.jsxinc"

/*Because of the following line, it's no longer necessary to edit extenscript by going to just above the top of this script, change the dropdown from 
	"ExtendScript Toolkit CS5" to one of the "Adobe Photoshop" selections -- whichever one you want to test */
#target photoshop



function testXML1() {
	//TODO
	var xml = convertToXML("value","name");
	assertEquals("<property id=\"name\"><string>value</string></property>", xml, "XML should have been converted properly.");
	
	xml = convertToXML(10,"name2");
	assertEquals("<property id=\"name2\"><number>10</number></property>", xml, "XML should have been converted properly.");
	
	xml = convertToXML(true,"name3");
	assertEquals("<property id=\"name3\"><true/></property>", xml, "XML should have been converted properly.");
	
	xml = convertToXML(false,"name4");
	assertEquals("<property id=\"name4\"><false/></property>", xml, "XML should have been converted properly.");

	var d = new Date("Sun Jan 08 2012 19:41:10 GMT-0500");
	xml = convertToXML(d,"name5");
	assertEquals("<property id=\"name5\"><date>Sun Jan 08 2012 19:41:10 GMT-0500</date></property>", xml, "XML should have been converted properly.");
}

testXML1();

// The next line will show up in the JavaScript Console in ExtendScript Toolkit, so it works to check on errors:
errorMessages+"\n\n"+
"XML tests complete. Total errors: "+errorCount;