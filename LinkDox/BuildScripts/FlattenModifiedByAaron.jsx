//
// Flatten.js
//   This takes a javascript file and inlines all of the included
//   files. It avoids recursive and redundant includes.
//
// $Id: Flatten.js,v 1.19 2010/03/29 02:23:22 anonymous Exp $
// Copyright: (c)2005, xbytor
// License: http://www.opensource.org/licenses/bsd-license.php
// Contact: xbytor@gmail.com
//
//@show include
//
app;
//
//
//
// TextProcessor
//   This class abstracts out the idea of iterating through a text file and
//   processing it one line at a time.
//
// $Id: Flatten.js,v 1.19 2010/03/29 02:23:22 anonymous Exp $
// Copyright: (c)2005, xbytor
// License: http://www.opensource.org/licenses/bsd-license.php
// Contact: xbytor@gmail.com
//
//@show include
//

String.prototype.trim = function() {
  return this.replace(/^[\s]+|[\s]+$/g, '');
};
String.prototype.startsWith = function(sub) {
  return this.indexOf(sub) == 0;
};
String.prototype.endsWith = function(sub) {
  return this.length >= sub.length &&
    this.substr(this.length - sub.length) == sub;
};

throwFileError = function(f, msg) {
  if (msg == undefined) msg = '';
  Error.runtimeError(9002, msg + '\"' + f + "\": " + f.error + '.');
};

//
//=============================== TextProcessor ==============================
//
// The contructors creates a new object with the input and output files,
// and a function 'processor'. This processor function is not used in this
// version. All arguments are optional.
//
TextProcessor = function(infile, outfile, processor) {
  var self = this;
  self.infile = infile;
  self.outfile = outfile;

  if (typeof processor == "function") {
    self.processor = processor;
  }
};
TextProcessor.prototype.typename = "TextProcessor";

TextProcessorStatus = {};
TextProcessorStatus.OK   = "StatusOK";
TextProcessorStatus.DONE = "StatusDONE";
TextProcessorStatus.FAIL = "StatusFAIL";


//
// convertFptr
//   Return a File or Folder object given one of:
//    A File or Folder Object
//    A string literal or a String object that refers to either
//    a File or Folder
//
TextProcessor.convertFptr = function(fptr) {
  var f;
  if (fptr.constructor == String) {
    f = File(fptr);
  } else if (fptr instanceof File || fptr instanceof Folder) {
    f = fptr;
  } else {
    Error.runtimeError(9002, "Bad file \"" + fptr + "\" specified.");
  }
  return f;
};

TextProcessor.writeToFile = function(fptr, str) {
  var file = TextProcessor.convertFptr(fptr);
  file.open("w") || throwFileError(file, "Unable to open output file ");
  file.lineFeed = 'unix';
  file.write(str);
  file.close();
};

TextProcessor.readFromFile = function(fptr) {
  var file = TextProcessor.convertFptr(fptr);
  file.open("r") || throwFileError("Unable to open input file ");
  var str = file.read();
  file.close();
  return str;
};

//
// exec
//  This function is called to actually process the input file. If the input
//  file is not specified here, is must have been specified before. The output
//  file is completely optional.
//
//  This function loads the input text file, splits the contents into an
//  array of strings and calls the processor function. The processor function
//  handles the string as needed, possibly modifying some of the strings and
//  copying them to an output buffer.
//  When the end of the input file has been reached, the line handler is called
//  with the line argument set to undefined to indicate the end of the file.
//  When all the lines have been processed, the output buffer is written to the
//  output file. The number of lines processed is returned as a result. If
//  processing was stopped because of a STATUS_FAIL, -1 is returned.
//
TextProcessor.prototype.exec = function(infile, outfile) {
  var self = this;

  if (!self.processor) {
    self.processor = self.handleLine;
  }
  if (!self.handleLine) {
    throw "No processor function has been specified.";
  }

  if (infile) {
    self.infile = infile;
  }
  if (!self.infile) {
    throw "No input file has been specified.";
  }
  if (outfile) {
    self.outfile = outfile;
  }
  var str = TextProcessor.readFromFile(self.infile);
  self.lines = str.split("\n");

  var outputBuffer = [];

  // loop through the lines...
  for (var i = 0; i < self.lines.length; i++) {
    var line = self.lines[i];
    var rc = self.processor(line, i, outputBuffer);
    if (rc == TextProcessorStatus.OK || rc == true) {
      continue;
    }
    if (rc == TextProcessorStatus.DONE) {
      break;
    }
    if (rc == TextProcessorStatus.FAIL || rc == false) {
      return -1;
    }
    throw "Unexpected status code returned by line handler.";
  }

  self.processor(undefined, i, outputBuffer);
  self.outputBuffer = outputBuffer;

  // write out the results, if needed
  if (self.outfile) {
    var outStr = outputBuffer.join("\n");
    TextProcessor.writeToFile(self.outfile, outStr + '\n');
  }
  return i;
};

//
// handleLine
//   This is the function that will get called for each line.
//   It must be set for the processor to work. The processor
//   function takes these arguments:
// line         - the line to be processed
// index        - the line number
// outputBuffer - an array of strings representing the output buffer
//   The processor function should return STATUS_OK if everything is OK,
//   STATUS_DONE to stop processing and write out the results, or STATUS_FAIL
//   if the processing should be halted completely for this file.
//
//  The default handleLine method just copies the input to the output.
//
TextProcessor.prototype.handleLine = function(line, index, outputBuffer) {
  if (line != undefined) {
    outputBuffer.push(line);
  }
  return TextProcessorStatus.OK;
};

//============================== Demo Code ====================================
//
// lineNumbers
//   This is a _sample_ line handler. It just prepends the line with the
//   current line number and a colon and copies it to the outputBuffer
//   This function must be replaced/overridden
//
TextProcessor.lineNumbers = function(line, index, outputBuffer) {
  if (line != undefined) {
    outputBuffer.push('' + index + ": " + line);
  }
  return TextProcessorStatus.OK;
};

//
// This is a demo to show how the TextProcessor class can be used
//
TextProcessor.demo = function() {
  var proc = new TextProcessor();
  proc.handleLine = TextProcessor.lineNumbers;
  proc.exec("/c/work/mhale/Info.txt", "/c/work/mhale/Info.out");
};

//TextProcessor.demo();

"TextProcessor.js";
// EOF

//
// GenericUI
// This is a lightweight UI framework. All of the common code that you
// need to write for a ScriptUI-based application is abstracted out here.
//
// $Id: Flatten.js,v 1.19 2010/03/29 02:23:22 anonymous Exp $
// Copyright: (c)2005, xbytor
// License: http://www.opensource.org/licenses/bsd-license.php
// Contact: xbytor@gmail.com
//

isPhotoshop = function() {
  return !!app.name.match(/photoshop/i);
};
isBridge = function() {
  return !!app.name.match(/bridge/i);
};
isInDesign = function() {
  return !!app.name.match(/indesign/i);
};
isESTK = function() {
  return !!app.name.match(/estoolkit|ExtendScript Toolkit/i);
};

_initVersionFunctions = function() {
  if (isPhotoshop()) {
    isCS5 = function()  { return app.version.match(/^12\./); };
    isCS4 = function()  { return app.version.match(/^11\./); };
    isCS3 = function()  { return app.version.match(/^10\./); };
    isCS2 = function()  { return app.version.match(/^9\./); };
    isCS  = function()  { return app.version.match(/^8\./); };
    isPS7 = function()  { return app.version.match(/^7\./); };

  } else {
    var appName = BridgeTalk.appName;
    var version = BridgeTalk.appVersion;

    if (isBridge()) {
      isCS5 = function()  { return version.match(/^4\./); };
      isCS4 = function()  { return version.match(/^3\./); };
      isCS3 = function()  { return version.match(/^2\./); };
      isCS2 = function()  { return version.match(/^1\./); };
      isCS  = function()  { return false; };
      isPS7 = function()  { return false; };

    } else if (isInDesign()) {
      isCS4  = function() { return false; };
      isCS3 = function()  { return version.match(/^5\./); };
      isCS2 = function()  { return version.match(/^4\./); };
      isCS  = function()  { return false; };
      isPS7 = function()  { return false; };

    } else if (isESTK()) {
      isCS5 = function()  { return version.match(/^3\.5/); };
      isCS4 = function()  { return version.match(/^3\./); };
      isCS3 = function()  { return version.match(/^2\./); };
      isCS2 = function()  { return version.match(/^1\./); };
      isCS  = function()  { return false; };
      isPS7 = function()  { return false; };

    } else {
      isCS5 = function()  { Error.runtimeError(9001,
                                               "Unsupported application"); };
      isCS4 = function()  { Error.runtimeError(9001,
                                               "Unsupported application"); };
      isCS3 = function()  { Error.runtimeError(9001,
                                               "Unsupported application"); };
      isCS2 = function()  { Error.runtimeError(9001,
                                               "Unsupported application"); };
      isCS  = function()  { Error.runtimeError(9001,
                                               "Unsupported application"); };
      isPS7 = function()  { Error.runtimeError(9001,
                                               "Unsupported application"); };
    }
  }
};

var isCS3;
if (!isCS3 || !isPhotoshop())  {
  _initVersionFunctions();
}



if (!String.prototype.contains) {

String.prototype.contains = function(sub) {
  return this.indexOf(sub) != -1;
};

String.prototype.containsWord = function(str) {
  return this.match(new RegExp("\\b" + str + "\\b")) != null;
};

String.prototype.endsWith = function(sub) {
  return this.length >= sub.length &&
    this.substr(this.length - sub.length) == sub;
};

String.prototype.reverse = function() {
  var ar = this.split('');
  ar.reverse();
  return ar.join('');
};

String.prototype.startsWith = function(sub) {
  return this.indexOf(sub) == 0;
};

String.prototype.trim = function() {
  return this.replace(/^[\s]+|[\s]+$/g, '');
};
String.prototype.ltrim = function() {
  return this.replace(/^[\s]+/g, '');
};
String.prototype.rtrim = function() {
  return this.replace(/[\s]+$/g, '');
};

}  // String.prototype.contains.

// see SampleUI for an example of how to use this framework.

"GenericUI.jsx";

// EOF

//

isPS7 = function()  { return version.match(/^7\./); };

throwFileError = function(f, msg) {
  if (msg == undefined) msg = '';
  Error.runtimeError(9002, msg + '\"' + f + "\": " + f.error + '.');
};

function exceptionMessage(e) {
  var str = '';
  var fname = (!e.fileName ? '???' : decodeURI(e.fileName));
  str += "   Message: " + e.message + '\n';
  str += "   File: " + fname + '\n';
  str += "   Line: " + (e.line || '???') + '\n';
  str += "   Error Name: " + e.name + '\n';
  str += "   Error Number: " + e.number + '\n';

  if (e.source) {
    var srcArray = e.source.split("\n");
    var a = e.line - 10;
    var b = e.line + 10;
    var c = e.line - 1;
    if (a < 0) {
      a = 0;
    }
    if (b > srcArray.length) {
      b = srcArray.length;
    }
    for ( var i = a; i < b; i++ ) {
      if ( i == c ) {
        str += "   Line: (" + (i + 1) + ") >> " + srcArray[i] + '\n';
      } else {
        str += "   Line: (" + (i + 1) + ")    " + srcArray[i] + '\n';
      }
    }
  }

  if ($.stack) {
    str += '\n' + $.stack + '\n';
  }

  return str;
};

XStdlib = function() {};
XStdlib.getFiles = function(folder, mask) {
  var files = [];

  //XStdlib.fullStop();
  var getF;
  if (Folder.prototype._getFiles) {
    getF = function(f, m) { return f._getFiles(m); };
  } else {
    getF = function(f, m) { return f.getFiles(m); };
  }

  if (mask instanceof RegExp) {
    var allFiles = getF(folder);
    for (var i = 0; i < allFiles.length; i = i + 1) {
      var f = allFiles[i];
      if (decodeURI(f.absoluteURI).match(mask)) {
        files.push(f);
      }
    }
  } else if (typeof mask == "function") {
    var allFiles = getF(folder);
    for (var i = 0; i < allFiles.length; i = i + 1) {
      var f = allFiles[i];
      if (mask(f)) {
        files.push(f);
      }
    }
  } else {
    files = getF(folder, mask);
  }

  return files;
};

XStdlib.convertFptr = function(fptr) {
  var f;
  if (fptr.constructor == String) {
    f = File(fptr);
  } else if (fptr instanceof File || fptr instanceof Folder) {
    f = fptr;
  } else {
    Error.runtimeError(9002, "Bad file \"" + fptr + "\" specified.");
  }
  return f;
};

XStdlib.writeToFile = function(fptr, str, encoding) {
  var file = XStdlib.convertFptr(fptr);

  file.open("w") || throwFileError(file, "Unable to open output file ");
  if (encoding) {
    file.encoding = encoding;
  }

  file.lineFeed = 'unix';

  if (isPS7() && encoding == 'BINARY') {
    var pos = 0;
    var cr = '\r';
    var next;
    while ((next = str.indexOf(cr, pos)) != -1) {
      file.write(str.substring(pos, next));
      file.lineFeed = 'mac';
      file.write(cr);
      file.lineFeed = 'unix';
      pos = next + 1;
    }
    if (pos < str.length) {
      file.write(str.substring(pos));
    }
  } else {
    file.write(str);
  }
  file.close();
};

XStdlib.readFromFile = function(fptr, encoding) {
  var file = XStdlib.convertFptr(fptr);
  file.open("r") || throwFileError("Unable to open input file ");
  if (encoding) {
    file.encoding = encoding;
  }
  var str = file.read();
  file.close();
  return str;
};

XStdlib.createFileSelect = function(str) {
  if (isWindows()) {
    return str;
  }

  var exts = [];
  var rex = /\*\.(\*|[\w]+)(.*)/;
  var m;
  while (m = rex.exec(str)) {
    exts.push('.' + m[1].toLowerCase());
    str = m[2];
  }

  function macSelect(f) {
    var name = decodeURI(f.absoluteURI).toLowerCase();
    var _exts = macSelect.exts;

    if (f instanceof Folder) {
      return true;
    }

    for (var i = 0; i < _exts.length; i++) {
      var ext = _exts[i];
      if (ext == '.*') {
        return true;
      }
      if (name.endsWith(ext)) {
        return true;
      }
    }
    return false;
  }

  macSelect.exts = exts;
  return macSelect;
};

//
// Open a dialog to prompt the user to select a file.
// An initial folder can optionally be specified
// Change the current directory reference if we it
// seems appropriate
//
//  XStdlib.selectFile("Choose a file", "JPEG Files: *.jpg", "/c/tmp/tmp.jpg")
//
XStdlib.selectFileOpen = function(prompt, select, start) {
  return XStdlib._selectFile(prompt, select, start, true);
};
XStdlib.selectFileSave = function(prompt, select, start) {
  return XStdlib._selectFile(prompt, select, start, false);
};
XStdlib.selectFile = XStdlib.selectFileOpen;

XStdlib._selectFile = function(prompt, select, start, open) {
  var file;

  if (!prompt) {
    prompt = 'Select a file';
  }

  if (start) {
    start = XStdlib.convertFptr(start);
  }

  var classFtn = (open ? File.openDialog : File.saveDialog);

  if (!start) {
    file = classFtn(prompt, select);

  } else {
    if (start instanceof Folder) {

      while (start && !start.exists) {
        start = start.parent;
      }

      var files = start.getFiles();
      for (var i = 0; i < files.length; i++) {
        if (files[i] instanceof File) {
          start = files[i];
          break;
        }
      }
      if (start instanceof Folder) {
        start = new File(start + "/file.ext");
      }
    }

    if (start instanceof File) {
      var instanceFtn = (open ? "openDlg" : "saveDlg");

      if (instanceFtn in start) {
        file = start[instanceFtn](prompt, select);

      } else {
        try {
          if (start.exists) {
            Folder.current = start.parent;
          }
        } catch (e) {
        }
        file = classFtn(prompt, select);
      }
    } else {
      Folder.current = start;
      file = classFtn(prompt, select);
    }
  }

  if (file) {
    Folder.current = file.parent;
  }
  return file;
};

XStdlib.selectFolder = function(prompt, start) {
  var folder;

  if (!prompt) {
    prompt = 'Select a folder';
  }
  if (start) {
    start = XStdlib.convertFptr(start);
    while (start && !start.exists) {
      start = start.parent;
    }
  }

  if (!start) {
    folder = Folder.selectDialog(prompt);

  } else {
    if (start instanceof File) {
      start = start.parent;
    }

    if (start.selectDlg) {   // for CS2
      folder = start.selectDlg(prompt);

    } else {               // for CS
      var preset = Folder.current;
      if (start.exists) {
        preset = start;
      }
      folder = Folder.selectDialog(prompt, preset);
    }
  }
  return folder;
};

String.prototype.startsWith = function(sub) {
  return this.indexOf(sub) == 0;
};

//===========================================================================

Flattener = function() {
  var self = this;
  this.folders = [];
  this.files = {};
};

Flattener.handleLine = function(line, index, outputBuffer) {
  var self = this;

  if (line == undefined) { // EOF
    return true;
  }

  if (line.startsWith("#include ")) {
    var re = /#include\s+\"([^"]+)\"/; ")]"; //" emacs-indent
    var m = line.match(re);
    var fname = m[1];
    var file;
    var folders = self.parent.folders;

    if (fname[0] == '/') {
      file = new File(fname);

    } else {
      for (var i = 0; i < folders.length; i++) {
        file = new File(folders[i] + '/' + fname);
        if (file.exists) {
          break;
        }
      }
    }

    if (!file.exists) {
      Error.runtimeError(9002, "File does not exist: " + fname);
    }

    if (!self.parent.files[file.name]) {
      var contents = self.parent.doFile(file);
      // outputBuffer = outputBuffer.concat(contents);
      for (var i = 0; i < contents.length; i++) {
        outputBuffer.push(contents[i]);
      }
      return true;
    }
  }
  if (line.startsWith("#includepath ")) {
    var re = /#includepath\s+\"([^"]+)\"/;  ")]"; //" emacs-indent
    var m = line.match(re);
    var paths = m[1].split(';');
    self.parent.folders = self.parent.folders.concat(paths);
    return true;
  }

  outputBuffer.push(line);
  return true;
};

Flattener.prototype.doFile = function(infile) {
  var self = this;

  infile = TextProcessor.convertFptr(infile);

  var proc = new TextProcessor(infile, undefined, Flattener.handleLine);
  self.folders.push(infile.parent);
  self.files[infile.name] = true;
  proc.parent = self;
  proc.exec(infile);
  return proc.outputBuffer;
};

Flattener.prototype.exec = function(infile, outfile) {
  try {
    if (!outfile) {
      outfile = infile.toString().replace(/\.([^.]+)$/, "-new.$1");
    }
    var contents = this.doFile(infile);
    TextProcessor.writeToFile(outfile, contents.join("\n"));
    return true;

  } catch (e) {
    var msg = ("Error processing " + decodeURI(infile.fsName) + '\r' +
               exceptionMessage(e) + "Do you wish to continue?");

    return confirm(msg);
  }
};

Flattener.prototype.folderExec = function(infolder, outfolder) {
  var self = this;
  var files = XStdlib.getFiles(infolder, /\.jsx?$/);

  if (infolder.toString() == outfolder.toString()) {
    throw "The destination folder must be different than the source folder.";
  }

  for (var i = 0; i < files.length; i++) {
    var infile = files[i];
    var outfile = new File(outfolder + '/' + infile.name);
    self.folders = [];
    self.files = {};
    if (!self.exec(infile, outfile)) {
      break;
    }
  }
};


var dbLevel = $.level;
$.level = 0;

$.level = dbLevel;

var start = new Date().getTime();
var f = new Flattener();

f.exec(new File("/c/Dropbox/AllDocuments/EntrepreneurshipAndIdeas/LinkDox/FlashBuilderProject/LinkDox/JSX/CanLinkIt.jsx"),
	new File("/c/Dropbox/AllDocuments/EntrepreneurshipAndIdeas/LinkDox/FlashBuilderProject/LinkDox/BuildScripts/CanLinkIt/CanLinkIt.jsx"));

var stop = new Date().getTime();
var elapsed = (stop - start)/1000;
//alert("Done (" + Number(elapsed).toFixed(3) + " secs).");
"Done (" + Number(elapsed).toFixed(3) + " secs)."
