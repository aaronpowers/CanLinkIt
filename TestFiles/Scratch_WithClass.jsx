/*function LinkDox() {
}*/
#include "../LinkDox/LinkDox/LinkDox.jsx"

#target photoshop

function LDPrefs() {
	this.prefsFile = new File(app.preferencesFolder+"/LinkDocs.prefs");
	logIt("Prefs file is at: "+this.prefsFile.fsName);
	this.loadPrefs();
}

LDPrefs.prototype.loadPrefs = function() {
	this.names=new Array();
	this.hash = {};
	if (!this.prefsFile.exists) {
		// nothing to read.
		return;
	}
	this.prefsFile.open("r");
	var contents = this.prefsFile.read();
	
	if (contents.indexOf("<object>")!=0) {
		logIt("LDPrefs.loadPrefs(): This prefs file is malformed, it does not start with <object> so there's nothing we can load.");
		return;
	}	
	
	var xml = new XML(contents);
	//logIt("xml="+xml);
	//logIt("xml.property="+xml.property);
	//logIt("xml.property.length="+xml.property.length());
	for (var i=0; xml.property.length(); i++) {
		var prop = xml.property[i];
		if (prop==null)
			return prop;
		if (prop.string!=undefined) {
			//logIt("prop="+prop+", String (value)="+prop.string+", name="+prop.@id);
			var id = prop.@id.toString();
			var value = prop.string.toString();
			this.names[this.names.length]=id;
			this.hash[id]=value;
		}
		// TODO right now we only support string values here. We should support more!
		
	}
	
	/*if (contents.indexOf("<object>")!=0) {
		logIt("LDPrefs.loadPrefs(): This prefs file is malformed, there's nothing we can load.");
		return;
	}
	contents = contents.substr("<object>".length);
	

	while (contents.length>0) {
		if (contents.indexOf("<property>")==0) {
			contents = contents.substr("<property>".length);
			//if (contents.
		} else
			contents = contents.substr(1);
	}*/

	
}

LDPrefs.prototype.savePrefs = function() {
	logIt("savePrefs 1");

	var xml = "<object>";
	for (var i=0; i<this.names.length; i++) {
		logIt("savePrefs i="+i);
		logIt("\tname="+this.names[i]+", value="+this.hash[this.names[i]]);
		
		xml+=convertToXML(this.hash[this.names[i]],this.names[i]);
		
	}

	xml+="</object>";
	
	logIt("Saving: "+xml);
	
	
	
	this.prefsFile.open("w");
	this.prefsFile.write(xml);
}

LDPrefs.prototype.getPref = function(name) {
	return this.hash[name];
}


LDPrefs.prototype.addPref = function(name, value) {
	if (this.hash[name]==undefined) {
		logIt("addPref("+name+","+value+"): new preference. prev length of prefs="+this.names.length);
		this.names[this.names.length]=name;
		logIt("addPref("+name+","+value+"): after length of prefs="+this.names.length);
	} else {
		logIt("addPref("+name+","+value+"): writing over an old preference");
	}
	this.hash[name]=value;
	
	logIt("addPref("+name+","+value+"): going to save:");
	
	this.savePrefs();	
	logIt("addPref("+name+","+value+"): done (saved)");

}

LDPrefs.prototype.addPrefDate = function(name, datevalue) {

}

LDPrefs.prototype.printPrefs = function() {
	logIt("printing preferences items of length "+this.names.length);

	for (var i=0; i<this.names.length; i++) {
		logIt(this.names[i]+"="+this.hash[this.names[i]]);
	}
	logIt("done printing preferences");
}




var prefs = new LDPrefs();

//prefs.addPref("name","value");
//prefs.addPref("name2","value2");
prefs.addPref("name2","value2b");
prefs.printPrefs();