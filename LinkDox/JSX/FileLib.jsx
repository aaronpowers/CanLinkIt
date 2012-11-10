/*********************************************
Copyright 2011 Aaron Powers
All Rights Reserved

FileLib.jsx
*/
// Depends on #include "XMLLib.jsxinc"

function FileLib() {
}

// No tests have been written for tihs function.
FileLib.copyFolder=function(from, to) {
	if (!to.exists)
		to.create();
	var children = from.getFiles();
	//$.writeln("Folder class is: "+getClassName(updateFolder));
	for (var i=0; i<children.length; i++) {
		if (getClassName(children[i])=="Folder") {
			// recurse!
			var to2 = new Folder(to.fullName+"/"+children[i].name);
			FileLib.copyFolder(children[i],to2);
			//$.writeln(children[i]+" class is Folder");
		} else {
			//$.writeln(children[i]+" class is File");
			// This is a file. Copy it.
			children[i].copy(to.fullName+"/"+children[i].name);
			
		}
	}
}

// No tests have been written for this function.
FileLib.deleteFolder=function(folder) {
	var children = folder.getFiles();
	//$.writeln("Folder class is: "+getClassName(updateFolder));
	for (var i=0; i<children.length; i++) {
		if (getClassName(children[i])=="Folder") {
			// recurse!
			FileLib.deleteFolder(children[i]);
			//$.writeln(children[i]+" class is Folder");
		} else {
			//$.writeln(children[i]+" class is File");
			// This is a file. Copy it.2
			children[i].remove();			
		}
	}
	folder.remove();
}

FileLib.countFilesIn=function(folder) {
	var children = folder.getFiles();
	var fileCount =0;
	//$.writeln("Folder class is: "+getClassName(updateFolder));
	for (var i=0; i<children.length; i++) {
		if (getClassName(children[i])=="Folder") {
			// recurse!
			fileCount+=FileLib.countFilesIn(children[i]);
			//$.writeln(children[i]+" class is Folder");
		} else {
			//$.writeln(children[i]+" class is File");
			// This is a file.
			fileCount+=1;
		}
	}
	return fileCount;
}

FileLib.countFoldersIn=function(folder) {
	var children = folder.getFiles();
	var folderCount =0;
	//$.writeln("Folder class is: "+getClassName(updateFolder));
	for (var i=0; i<children.length; i++) {
		if (getClassName(children[i])=="Folder") {
			// recurse!
			folderCount+=1 + FileLib.countFoldersIn(children[i]);
			//$.writeln(children[i]+" class is Folder");
		} else {
			//$.writeln(children[i]+" class is File");
			// This is a file.
		}
	}
	return folderCount;
}