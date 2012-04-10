package canlinkit {
	public class VersionInfo {
		
		import com.adobe.csxs.core.CSXSInterface;
		import com.adobe.csxs.events.*;
		import com.adobe.csxs.external.*;
		import com.adobe.csxs.external.resources.*;
		import com.adobe.csxs.logging.targets.LocalConnectionTarget;
		import com.adobe.csxs.types.*;
		import com.adobe.csxs.types.SyncRequestResult;
		
		import flash.events.TimerEvent;
		import flash.external.ExternalInterface;
		import flash.utils.Timer;
		
		import flash.display.Sprite;
		import flash.net.navigateToURL;
		import flash.net.URLRequest;

		
		import mx.controls.Alert;
		import mx.events.CloseEvent;
		import mx.events.FlexEvent;
		import mx.rpc.events.*;
		import mx.rpc.http.HTTPService;
		import mx.core.Application;

		
		private static var CurrentVersion:String="1.0.8";
		private static var UPDATE_XML_URL:String="http://app.canlinkit.com/ExtensionUpdate.xml";
		// When we're working in development, set this to true. Befor releasing, set it to false. This will, for example, hide secret menu items.
		public static var IN_DEVELOPMENT:Boolean=true;


		private var downloadURL:String=null;
		private var showMsgIfNoUpdate:Boolean=false;
		
		private var photoshopHelper:PhotoshopHelper=null;
		
		public function VersionInfo(photoshopHelperToUse:PhotoshopHelper) {
			this.photoshopHelper=photoshopHelperToUse;
		}
		

		
		public function getVersion():String {
			return CurrentVersion;
		}
		
		/**
		 * Check to see if there's a newer version. Also, check if this is the first time the software has been run, and if so, run firstRun().
		 * */
		public function checkVersion(showMsgIfNoUpdateToDo:Boolean):void {
			try {
				//photoshopHelper.logIt("checkVersion: starting");
				
				// First of all, should we even check right now?
				
				// Let's see if it's been a while since we last checked. We don't want to put too much load on the server, and don't want to warn the user annoyingly often.
				if (!isTimeToCheckVersion()) {
					return;
				}
				
				// Are we allowed to check?
				var result:SyncRequestResult = CSXSInterface.instance.getHostEnvironment();
				var hostData:HostEnvironment = result.data;
				if (hostData.isAppOffline) {
					/*CSXSInterface.instance.evalScript( "linkDox.alert", "In order to check for updates, make \nsure 'Allow Extensions to Connect to the \nInternet' is enabled "+
					"located in \nPreferences under Plug-Ins");*/
					Alert.show("In order to check for updates, make \nsure 'Allow Extensions to Connect to the \nInternet' is enabled "+
						"located in \nPreferences under Plug-Ins", "Disabled Internet Connection", Alert.OK, Sprite(Application.application));
					return;
				}
				
				//photoshopHelper.logIt("checkVersion: start");
				checkVersionNow(showMsgIfNoUpdateToDo);
			} catch (errObject:Error) {
				photoshopHelper.logIt("checkVersion failed because of error: "+errObject.toString()+"\n"+errObject.getStackTrace());
			}
		}
		
		public function checkVersionNow(showMsgIfNoUpdateToDo:Boolean):void {
			this.showMsgIfNoUpdate=showMsgIfNoUpdateToDo;
			try {
				var checkVersionService:HTTPService = new HTTPService();
				checkVersionService.showBusyCursor=false;
				checkVersionService.url=UPDATE_XML_URL;
				checkVersionService.resultFormat="xml";
				checkVersionService.addEventListener(mx.rpc.events.FaultEvent.FAULT, checkVersionFaultHandler);
				checkVersionService.addEventListener(mx.rpc.events.ResultEvent.RESULT, checkLatestVersion);
				checkVersionService.cancel();
				/*var params:Object = new Object();
				params.tags = "dog";
				flickrService.send(params);*/
				checkVersionService.send();
			} catch (errObject:Error) {
				photoshopHelper.logIt("checkVersion failed because of error: "+errObject.toString()+"\n"+errObject.getStackTrace());
			}
		}
		
		/**
		 * Check if it's time to check for new versinons
		 * */
		private function isTimeToCheckVersion():Boolean {
			var reqResult:SyncRequestResult = CSXSInterface.instance.evalScript( "linkDox.prefs.getAsXML", "LastTimeCheckForNewVersion");
			//photoshopHelper.logIt("checkVersion: 1");
			if(SyncRequestResult.COMPLETE == reqResult.status) {
				//photoshopHelper.logIt("checkVersion: call was successfull. the pref is: "+reqResult.data.LastTimeCheckForNewVersion);
				if(reqResult.data.LastTimeCheckForNewVersion && reqResult.data.LastTimeCheckForNewVersion.length>0) {
					//photoshopHelper.logIt("checkVersion: 2");
					//var date:Date = getDateFromXMP(reqResult.data.LastTimeCheckForNewVersion);
					var date:Date = new Date(Date.parse(reqResult.data.LastTimeCheckForNewVersion));
					//photoshopHelper.logIt("checkVersion: 3");
					var today:Date = new Date();
					//photoshopHelper.logIt("checkVersion: 4");
					if (today.valueOf()-date.valueOf() < 1000/*milliseconds*/*60/*seconds*/*60/*minutes*/*24/*hours*/*7/*week*/*3) {
						// We checked within the last 3 weeks. So don't bother to check again.
						//photoshopHelper.logIt("checkVersion: we've checked within the last few weeks, so we won't check the version now. Last checked: "+reqResult.data.LastTimeCheckForNewVersion);
						return false;
					} else
						// it's been long enough to check again.
						return true;
				} else {
					photoshopHelper.logIt("checkVersion: This looks like it was the first time the program was run -- no pref was found, so we're checking for new versions.");
					firstRun();
					return true;
				}
			} else {
				photoshopHelper.logIt("checkVersion: call failed: "+reqResult.toString());
				return false; // let's not check this time. I'm not sure why it failed, but it doesn't look worth it.
			}
		}
		
		/**
		 * Call only if this is the first run.
		 * Do things that only need to be done once.
		 * 
		 * TODO this doesn't really belong in this class, VersionInfo, but it is the most convenient place assuming this is only run as a panel.
		 * */
		private function firstRun():void {
			
			/**
			 * If this line is in, it works the first time you run the app.
			 * However, if the user resizes, the next time the app boots it'll set the inside of the panel to this size, but won't resize the larger panel.
			 * TODO a tradeoff would be to do this just once, only the first time we launch the panel, and never again -- that would probably work.
			 * */
			var windowSize:WindowGeometry = new WindowGeometry(100,100,350,200);
			CSXSInterface.getInstance().requestStateChange(StateChangeEvent.WINDOW_RESIZE, windowSize);
		}
		
		
		private function checkLatestVersion(event:ResultEvent):void {
			photoshopHelper.logIt("checkLatestVersion: Got some result from the http request, now processing it:");
			try {
				//photoshopHelper.logIt("photoHandler: start");
				//photoshopHelper.logIt("photoHandler: 1: "+(event.result.toString()));
				var xml:XML = XML(event.result);
				var latestVersion:String = xml.version.toString();
				if (latestVersion==CurrentVersion) {
					photoshopHelper.logIt("checkLatestVersion: No new versions available on the web. The latest is the current version, "+latestVersion);
					// Check completed, so don't do it again anytime soon. Save when we did it:
					CSXSInterface.instance.evalScript( "linkDox.prefs.set", "LastTimeCheckForNewVersion", new Date().toString());
					if (showMsgIfNoUpdate) {
						//CSXSInterface.instance.evalScript( "linkDox.alert", "You already have the latest version, "+latestVersion+".");
						Alert.show("You already have the latest version, "+latestVersion+".",
							"No New Version", Alert.OK, Sprite(mx.core.Application.application));
						showMsgIfNoUpdate=false;
					}
					return;
				}
				showMsgIfNoUpdate=false;
				downloadURL=xml.download.toString();
				var description:String = xml.description.toString();
				
				// TODO can we send the user to a HTML page with a link on it to click, so we can track the number of downloads using google analytics? That would be more pain for the user, which I don't like.
				// I've never tried the following line:
				//var descriptionURL=xml.description.url.toString();
				photoshopHelper.logIt("checkLatestVersion: There is a newer version available for download on the web. It is: "+latestVersion+"\n"+
					"\tIt can be downloaded from: "+downloadURL+
					"\tDescription: "+description);
				Alert.yesLabel="Download";
				Alert.buttonWidth=85;
				
				Alert.show("A newer version of LinkDox is available, version \n"
					+latestVersion+"Would you like to download it?"/*+
					"\n\n"+
					description.replace("<br>","\n")*/, "Download Latest Version", Alert.YES|Alert.CANCEL, Sprite(mx.core.Application.application), alertClickHandler_UserWantsToDownload);
				
				// Set the labels back to normal
				Alert.yesLabel="OK";
				
			} catch (errObject:Error) {
				photoshopHelper.logIt("checkLatestVersion: failed because of error: "+errObject.toString()+"\n"+errObject.getStackTrace());
			}
			//photoshopHelper.logIt("checkVersion: end");
		}
		
		private function alertClickHandler_UserWantsToDownload(evt:CloseEvent):void {
			if (evt.detail == Alert.YES) {
				navigateToURL(new URLRequest(downloadURL));							
			} else {
			}
			// Check completed, so don't do it again anytime soon. Save when we did it:
			CSXSInterface.instance.evalScript( "linkDox.prefs.set", "LastTimeCheckForNewVersion", new Date().toString());
			
		}
		
		private function checkVersionFaultHandler(event:FaultEvent):void{
			photoshopHelper.logIt("faultHandler: Not able to load version number from web service: "+event.toString());
		}
		
	}
}