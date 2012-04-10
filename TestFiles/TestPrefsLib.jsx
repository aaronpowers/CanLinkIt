#includepath "../LinkDox/JSX"
#include "PrefsLib.jsxinc"
#include "UnitTestLib.jsxinc"
#include "XMLLib.jsxinc"
#include "Logging.jsxinc"


/*Because of the following line, it's no longer necessary to edit extenscript by going to just above the top of this script, change the dropdown from 
	"ExtendScript Toolkit CS5" to one of the "Adobe Photoshop" selections -- whichever one you want to test */
#target photoshop



var file = new File(app.preferencesFolder+"/CanLinkItFileForTesting.prefs");
if (file.exists)
	file.remove();
var prefs = new LDPrefs(file);
logIt("TestPrefsLib: the file is at "+file.fsName);


function testPrefs1() {
	prefs.set("name","value");
	var contents = prefs.getPrefsFileText();
	assertEquals("<object><property id=\"name\"><string>value</string></property></object>",contents,"XML file is not correct.");
	assertEquals("value",prefs.get("name"),"Pref should return matching value.");

	prefs.set("name2","value2");
	contents = prefs.getPrefsFileText();
	assertEquals("<object><property id=\"name\"><string>value</string></property><property id=\"name2\"><string>value2</string></property></object>",contents,"XML file is not correct.");
	assertEquals("value",prefs.get("name"),"Pref should return matching value.");
	assertEquals("value2",prefs.get("name2"),"Pref should return matching value.");
	 
	prefs.set("name2","value2b");
	contents = prefs.getPrefsFileText();
	assertEquals("<object><property id=\"name\"><string>value</string></property><property id=\"name2\"><string>value2b</string></property></object>",contents,"XML file is not correct.");
	assertEquals("value",prefs.get("name"),"Pref should return matching value.");
	assertEquals("value2b",prefs.get("name2"),"Pref should return matching value.");

	prefs.set("anotherNewOne","settosomething");
	contents = prefs.getPrefsFileText();
	assertEquals("<object><property id=\"name\"><string>value</string></property><property id=\"name2\"><string>value2b</string></property><property id=\"anotherNewOne\"><string>settosomething</string></property></object>",contents,"XML file is not correct.");
	assertEquals("value",prefs.get("name"),"Pref should return matching value.");
	assertEquals("value2b",prefs.get("name2"),"Pref should return matching value.");
	assertEquals("settosomething",prefs.get("anotherNewOne"),"Pref should return matching value.");

	var d = new Date("Sun Jan 08 2012 19:41:10 GMT-0500");
	d.setMilliseconds(0);
	prefs.set("anotherNewOne",d);
	contents = prefs.getPrefsFileText();
	assertEquals("<object><property id=\"name\"><string>value</string></property><property id=\"name2\"><string>value2b</string></property><property id=\"anotherNewOne\"><date>Sun Jan 08 2012 19:41:10 GMT-0500</date></property></object>",contents,"XML file is not correct.");
	assertEquals("value",prefs.get("name"),"Pref should return matching value.");
	assertEquals("value2b",prefs.get("name2"),"Pref should return matching value.");
	assertEquals(d,prefs.get("anotherNewOne"),"Pref should return matching value.");
	assertEquals("<object><property id=\"anotherNewOne\"><date>Sun Jan 08 2012 19:41:10 GMT-0500</date></property></object>",prefs.getAsXML("anotherNewOne"),"Pref should return matching XML.");

	assertEquals(undefined,prefs.get("doesnotexist"),"Pref should return matching value.");
	assertEquals("<object><property id=\"doesnotexist\"><string></string></property></object>",prefs.getAsXML("doesnotexist"),"Pref should return matching value.");
	
	// Reload it from scratch and see if we've still got our stuff
	prefs= new LDPrefs(file);
	contents = prefs.getPrefsFileText();
	assertEquals("<object><property id=\"name\"><string>value</string></property><property id=\"name2\"><string>value2b</string></property><property id=\"anotherNewOne\"><date>Sun Jan 08 2012 19:41:10 GMT-0500</date></property></object>",contents,"XML file is not correct.");
	assertEquals("value",prefs.get("name"),"Pref should return matching value.");
	assertEquals("value2b",prefs.get("name2"),"Pref should return matching value.");
	assertEquals(typeof d,typeof prefs.get("anotherNewOne"),"Date type should match.");
	// Funny thing is that without the toString() below, the assert fails, even though our number of milliseconds is the same... I dunno why.
	assertEquals(d.toString(),prefs.get("anotherNewOne").toString(),"Pref should return matching dates.");
	assertEquals(d.getMilliseconds(),prefs.get("anotherNewOne").getMilliseconds(),"Pref should return matching dates.");
	assertEquals(d.getSeconds(),prefs.get("anotherNewOne").getSeconds(),"Pref should return matching dates.");
	assertEquals("<object><property id=\"anotherNewOne\"><date>Sun Jan 08 2012 19:41:10 GMT-0500</date></property></object>",prefs.getAsXML("anotherNewOne"),"Pref should return matching XML.");

	prefs.printPrefs();
}

testPrefs1();

// The next line will show up in the JavaScript Console in ExtendScript Toolkit, so it works to check on errors:
errorMessages+"\n\n"+
"Prefs tests complete. Total errors: "+errorCount;