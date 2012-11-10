/*		
Use this file to customize your personal system depending on your settings.
(Whatever you do, though, don't edit "originalRootPath" -- that's already embedded in the files we're testing).

Please don't check this file in after making your changes.
*/


// Set this to the directory that contains the "FlashBuilderProject" folder. Make sure it ends with a /
var rootPath = "/c/Dropbox/AllDocuments/EntrepreneurshipAndIdeas/LinkDox/FlashBuilderProject/";
if (Folder.fs=="Macintosh") {
    //alert("Testing on Mac Path");
    //rootPath="/Users/aaronpowers/Dropbox/AllDocuments/EntrepreneurshipAndIdeas/LinkDox/";
    rootPath="~/Dropbox/AllDocuments/EntrepreneurshipAndIdeas/LinkDox/FlashBuilderProject/";
}

/***************
	* Some tests require manual intervention. You can use this variable to decide whether to run those tests.
	*/
	
var runManualTests=false;