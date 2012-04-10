#target photoshop

#includepath "../LinkDox/JSX"
#include "XMLLib.jsxinc"
#include "UnitTestLib.jsxinc"

#include "Logging.jsxinc"


function testUnitTest() {
	assertEquals(true, true, "True!");
	assertEquals(false, false, "False!");
	assertEquals(null, null, "False!");
	assertEquals(undefined,undefined, "False!");
	assertXMLHasProperty("myid","myvalue","<property id=\"myid\"><string>myvalue</string></property>","my message");
	assertXMLHasNoProperty("myid2","<property id=\"myid\"><string>myvalue</string></property>","my message");
	
	xml="<object>"+
	"<property id=\"multipleLayersSelected\"><false/></property>"+
	"<property id=\"layerName\"><string>LinkedSmartObject</string></property>"+
	"<property id=\"hasDoc\"><true/></property>"+
	"<property id=\"isSO\"><true/></property>"+
	"<property id=\"uri\"><string>/c/Dropbox/AllDocuments/EntrepreneurshipAndIdeas/LinkDox/FlashBuilderProject/TestFiles/Files/Folder2/LinkToThese/BorderImageExample.psd</string></property>"+
	"<property id=\"relativeURI\"><string>../../Folder2/LinkToThese/BorderImageExample.psd</string></property>"+
	"<property id=\"fileDateLinked\"><string>2011-12-30T19:01:02-05:00</string></property>"+
	"<property id=\"hasLink\"><true/></property>"+
	"<property id=\"linkDate\"><string>2011-12-31T12:40:01.04-05:00</string></property>"+
	"<property id=\"isValid\"><true/></property>"+
	"<property id=\"fileDate\"><string>2011-12-31T18:12:14-05:00</string></property>"+
	"<property id=\"isCurrent\"><false/></property>"+
	"</object>";
	
	assertXMLHasProperty("uri","/c/Dropbox/AllDocuments/EntrepreneurshipAndIdeas/LinkDox/FlashBuilderProject/TestFiles/Files/Folder2/LinkToThese/BorderImageExample.psd",xml,"my message");
	assertXMLHasNoProperty("uri2",xml,"my message");
	assertXMLHasNoProperty("ur",xml,"my message");
	
}

function testEqualsDefinition() {
	var obj = new Object();
	assertEquals(obj, obj, "Object = itself");
	var obj2 = new Object();
	assertNotEquals(obj, obj2, "These two are not obviously identical objects");
	obj.equals=function(another) {
		return true;
	}
	assertEquals(obj, obj2, "These two should be equal based on their equals method. That's the only thing that has changed from the previous assertion.");
}

testUnitTest();
testEqualsDefinition();

// The next line will show up in the JavaScript Console in ExtendScript Toolkit, so it works to check on errors:
errorMessages+"\n"+
"UnitTest tests complete. Total errors: "+errorCount;