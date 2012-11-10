/*************
 * The goal of this file is to a platform independent packaging and installation script.
 * TODO It's only been tested on Windows and may not yet be completely platform independent.
 *
*************************************/
#target estoolkit

#include "FlattenModifiedByAaron.jsx"

var fileName = $.fileName;
var buildScriptsPath = fileName.substring(0,fileName.lastIndexOf("/")+1);

var mxpFile = new File(buildScriptsPath+"CanLinkIt.mxp");
var buildFilesFolder=new Folder(buildScriptsPath+"/CanLinkIt");
var warFilesFolder=new Folder(buildScriptsPath+"../../EclipseProject/CanLinkIt/war");

function quitPhotoshop() {
	photoshop.quit();
	//$.writeln("Photoshop is now off.");
}

function runPhotoshop() {
	photoshop.open("");
}

function deleteFiles() {
	/*********************************************
	* Delete artifacts from previous builds
	*/
	if (mxpFile.exists) {
		//$.writeln("MXP file found");
		// TODO uncomment this
		mxpFile.remove();
	}

	var deleteFiles = buildFilesFolder.getFiles();
	for (var i=0; i<deleteFiles.length; i++) {
		//$.writeln("deleting (length="+buildFilesFolder.getFiles().length+"): "+buildFilesFolder.getFiles()[i]);
		deleteFiles[i].remove();
	}

}

function flattenJSX() {
	var f = new Flattener();
	f.exec(new File(buildScriptsPath+"/../JSX/CanLinkIt.jsx"),
		new File(buildScriptsPath+"/CanLinkIt/CanLinkIt.jsx"));
}

function copyNotificationFiles() {
	var jsxNotificationFiles = new Folder(buildScriptsPath+"/../JSX/").getFiles("Notification*.jsx");
	for (var i=0; i<jsxNotificationFiles.length; i++) {
		// Also flatten all of them, just in case they have any imports in them (at least one does).
		var f = new Flattener();
		f.exec(jsxNotificationFiles[i],
			new File(buildScriptsPath+"/CanLinkIt/"+jsxNotificationFiles[i].name));
		//jsxNotificationFiles[i].copy(buildFilesFolder.fullName+"/"+jsxNotificationFiles[i].name);
	}
}

/********************************************
		use BridgeTalk here to get access to the packaging tool.
		There's some info in packaging_extension.pdf
		and more here:
		http://forums.adobe.com/message/4310403
		and a lot here:
		http://helpx.adobe.com/extension-manager/using/command-line.html
		*/

var appNames = new Array("exman-5.0","exman-5.5","exman-6.0");
var verNames = new Array(new Array("CS5 32", "CS5 64"), new Array("CS5.5 32", "CS5.5 64"), new Array("CS6 32", "CS6 64"));
var mxiFile = new File(buildScriptsPath+"../CanLinkIt.mxi");


function removeMXPs() {
	/*****************
		* Remove CanLinkIt from all available Photoshops for testing
		* (we do this so that an old version won't appear)
		*/
	for (var i=0; i<appNames.length; i++) {

		var targetApp = BridgeTalk.getSpecifier(appNames[i]);

		if( targetApp ) {
			// construct and send message
			var bt = new BridgeTalk;
			bt.target = targetApp;
			// the script to evaluate is contained in a string in the "body" property
			for (var j=0; j<verNames[i].length; j++) {
				// %EXT_MGR% -suppress -remove product="Photoshop %PS_VER%" extension="CanLinkIt"
				bt.body = "-EMBT -suppress -remove product=\"Photoshop "+verNames[i][j]+"\" extension=\"CanLinkIt\"";
				bt.send();
			}
		}
	}
}

function createMXP() {
	/*****************
		* Create CanLinkIt.mxp in any available extension manager
		*/
	for (var i=0; i<appNames.length; i++) {
		var targetApp = BridgeTalk.getSpecifier(appNames[i]);

		if( targetApp ) {
			// construct and send message
			var bt = new BridgeTalk;
			bt.target = targetApp;
			// the script to evaluate is contained in a string in the "body" property
			//bt.body = "new Document(’C:\\BridgeScripts’);app.document.target.children.length;"
			
			bt.body = "-EMBT -suppress -package mxi=\""+mxiFile.fsName+"\" mxp=\""+mxpFile.fsName+"\"";
			bt.send();
			// assuming it worked, we're done with this loop because we only need to package this once.
			break;
		}
	}
}

function installMXP() {
	/*****************
		* Install CanLinkIt.mxp in all available Photoshops for testing
		*/
	for (var i=0; i<appNames.length; i++) {

		var targetApp = BridgeTalk.getSpecifier(appNames[i]);

		if( targetApp ) {
			// construct and send message
			var bt = new BridgeTalk;
			bt.target = targetApp;
			// the script to evaluate is contained in a string in the "body" property
			//bt.body = "new Document(’C:\\BridgeScripts’);app.document.target.children.length;"
			
			bt.body = "-EMBT -suppress -install mxp=\""+mxpFile.fsName+"\"";
			bt.send();
		}
	}
}

function quitExtensionManagers() {
	/*****************
		* Quit all extension managers... They keep running and we want them gone.
		*/
	for (var i=0; i<appNames.length; i++) {

		var targetApp = BridgeTalk.getSpecifier(appNames[i]);

		if( targetApp ) {
			// construct and send message
			var bt = new BridgeTalk;
			bt.target = targetApp;
			// the script to evaluate is contained in a string in the "body" property
			//bt.body = "new Document(’C:\\BridgeScripts’);app.document.target.children.length;"
			
			bt.body = "-EMBT -quit";
			bt.send();
		}
	}
}

/****************************
	TODO
	Copy the .mxp to the website folder we're going to upload.
	*/
function copyToWebsiteWarFolder() {
	mxpFile.copy(warFilesFolder.fullName+"/"+mxpFile.name);
}

function removeCreateInstallMXP() {

	// For some reason, using the callbacks from BridgeTalk causes this program to crash at different points. Not sure why.
	$.writeln("(Step 1 Photoshop Quit Complete)");
	$.sleep(3000); // for photoshop to surely quit
	removeMXPs();
	$.writeln("(Step 2 Remove MXPs Complete)");
	$.sleep(100);
	createMXP();
	$.writeln("(Step 3 Create MXPs Complete)");
	// Unfortunately, this timing is critical: if you have a slow machine, this may not be enough to get PS6 ?installed? safely. I've seen 13000 complete (haven't tried much shorter) and it fail at 1000.
	$.sleep(18000);
	$.writeln("(Step 4 Long Wait Complete)");
	installMXP();
	$.writeln("(Step 5 Install MXP Complete)");
	$.sleep(1500);
	quitExtensionManagers();
	$.writeln("(Step 6 Quitting Extension Managers Complete)");
	//$.sleep(1000);
	copyToWebsiteWarFolder();
	$.writeln("(Step 7 Copied the mxp into the downloads folder)");
	
	$.writeln("(Step 8 Everything Is Complete)");
	if (confirm("Done building CanLinkIt. Do you want to run photoshop?"))
		runPhotoshop();

}

$.writeln("Starting Packaging and installation...");
quitPhotoshop();
deleteFiles();
flattenJSX();
copyNotificationFiles();
removeCreateInstallMXP();








