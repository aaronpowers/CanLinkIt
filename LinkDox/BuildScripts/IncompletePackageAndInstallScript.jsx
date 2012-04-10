#target photoshop
$.writeln("Starting Packaging and installation...");

var TESTING_RUN_ONLY=true;

// Start Photoshop when it's not already running:
try {
	photoshop.open("");
} catch (e) {
	// we don't care. We don't want to actually open anything.
}

var photoshopPath=app.path;
//$.writeln("Photoshop is installed at: "+photoshopPath);

if (!TESTING_RUN_ONLY)
	photoshop.quit();
//$.writeln("Photoshop is now off.");

var fileName = $.fileName;
var buildScriptsPath = fileName.substring(0,fileName.lastIndexOf("/")+1);
//$.writeln("Current Path: "+currentPath);

var mxpFile = new File(buildScriptsPath+"/CanLinkIt.mxp");
var buildFilesFolder=new Folder(buildScriptsPath+"/CanLinkIt");

/*********************************************
	* Delete artifacts from previous builds
	*/
if (mxpFile.exists) {
	//$.writeln("MXP file found");
	// TODO uncomment this
	if (!TESTING_RUN_ONLY)
		mxpFile.remove();
}

for (var i=0; i<buildFilesFolder.getFiles().length; i++) {
	if (!TESTING_RUN_ONLY)
		buildFilesFolder.getFiles()[i].remove();
}

