package canlinkit {
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


	public class PhotoshopHelper {
		
		// get runtime integers for stringIDs as Strings. example newPlacedLayer = '209'
		private var newPlacedLayer:String;
		private var placedLayerEditContents:String;
		private var placedLayerReplaceContents:String;
		private var placedLayerMakeCopy:String;
		
		// host var and const
		public var photoshopMajorVersion:Number = -1;
		public var photoshopMinorVersion:Number = -1;
		public var photoshopFixVersion:Number = -1;
		
		public static const PHOTOSHOP_CS4_VERSION:Number = 11;
		public static const PHOTOSHOP_CS5_VERSION:Number = 12;


		private var canLinkIt:CanLinkIt=null;
		//private var searchForLinkedLayers:SearchForLinkedLayers=null;

		
		public function PhotoshopHelper(canLinkItToUse:CanLinkIt) {
			this.canLinkIt=canLinkItToUse;
			
			// Initialize Listeners
			CSXSInterface.instance.evalScript("PhotoshopRegisterEvent", charToInteger("save").toString());
			CSXSInterface.instance.evalScript("PhotoshopRegisterEvent", charToInteger("Opn ").toString());
			CSXSInterface.instance.evalScript("PhotoshopRegisterEvent", charToInteger("Cls ").toString());
			CSXSInterface.instance.evalScript("PhotoshopRegisterEvent", charToInteger("Dlt ").toString());
			CSXSInterface.instance.evalScript("PhotoshopRegisterEvent", charToInteger("setd").toString());
			CSXSInterface.instance.evalScript("PhotoshopRegisterEvent", charToInteger("Mk  ").toString());
			CSXSInterface.instance.evalScript("PhotoshopRegisterEvent", charToInteger("slct").toString());
			CSXSInterface.instance.evalScript("PhotoshopRegisterEvent", charToInteger("Dplc").toString());
			CSXSInterface.instance.evalScript("PhotoshopRegisterEvent", charToInteger("Plc ").toString());
			CSXSInterface.instance.evalScript("PhotoshopRegisterEvent", charToInteger("CpTL").toString());
			CSXSInterface.instance.evalScript("PhotoshopRegisterEvent", charToInteger("undo").toString());
			CSXSInterface.instance.evalScript("PhotoshopRegisterEvent", charToInteger("MrgV").toString());
			CSXSInterface.instance.evalScript("PhotoshopRegisterEvent", charToInteger("Mrg2").toString());
			CSXSInterface.instance.evalScript("PhotoshopRegisterEvent", charToInteger("past").toString());
			
			/**
			 * The next few lines are best explained here:
			 * http://ps-scripts.com/bb/viewtopic.php?p=12873
			 * */
			findPhotoshopEventIDs();
			
			CSXSInterface.instance.evalScript("PhotoshopRegisterEvent", newPlacedLayer);
			CSXSInterface.instance.evalScript("PhotoshopRegisterEvent", placedLayerEditContents);
			CSXSInterface.instance.evalScript("PhotoshopRegisterEvent", placedLayerReplaceContents);
			CSXSInterface.instance.evalScript("PhotoshopRegisterEvent", placedLayerMakeCopy);
			loadPhotoshopVersion();
			if (photoshopMajorVersion == PHOTOSHOP_CS4_VERSION) {
				ExternalInterface.addCallback("PhotoshopCallback", PhotoshopCallback);
			} else {
				ExternalInterface.addCallback("PhotoshopCallback" + CSXSInterface.instance.getExtensionId(), PhotoshopCallback);
			}
			
			//searchForLinkedLayers = new SearchForLinkedLayers(canLinkIt);
		}
		
		/**
		 * findPhotoshopEventIDs()
		 * 
		 * This method and its usage is best explained here:
		 * http://ps-scripts.com/bb/viewtopic.php?p=12873
		 * */
		public function findPhotoshopEventIDs():void{
			var reqResult:SyncRequestResult = CSXSInterface.instance.evalScript("findPhotoshopEventIDs");
			if(SyncRequestResult.COMPLETE == reqResult.status){
				newPlacedLayer = reqResult.data.newPlacedLayer;
				placedLayerEditContents = reqResult.data.placedLayerEditContents;
				placedLayerReplaceContents = reqResult.data.placedLayerReplaceContents;
				placedLayerMakeCopy = reqResult.data.placedLayerMakeCopy;
			}				
		}
		
		/**
		 Function:		charToInteger
		 Description:	Converts a four character id key to an integer value
		 understood by PhotoshopRegisterEvent.
		 @param keyword A String variable of the four character id key to
		 to be converted.
		 @return The converted value from the four character id key
		 */
		public static function charToInteger(keyword:String):Number{
			var value:Number;
			value  = keyword.charCodeAt(0) << 24;
			value += keyword.charCodeAt(1) << 16;
			value += keyword.charCodeAt(2) << 8;
			value += keyword.charCodeAt(3);
			return value;
		}
		
		
		private function loadPhotoshopVersion():void{
			var reqResult:SyncRequestResult = CSXSInterface.instance.evalScript("getVersion");
			if (SyncRequestResult.COMPLETE == reqResult.status) {
				var versionString:String = reqResult.data.version;
				var versionArray:Array = versionString.split(".");
				if (versionArray.length >= 1) {
					photoshopMajorVersion = Number(versionArray[0]);
				}
				if (versionArray.length >= 2) {
					photoshopMinorVersion = Number(versionArray[1]);
				}
				if (versionArray.length >= 3) {
					photoshopFixVersion = Number(versionArray[2]);
				}
			}
		}
		
		/*************************************************
		 *************************************************
		 Photoshop Connection Methods Below This Point (not feature code)
		 These include calls to and callbacks from Photoshop.
		 */
		
		private var editedPlacedObjectEventDescriptionID:String="1";// will be replaced later
		public function callUserJustEditedPlacedSmartObject():void {
			//logIt("callUserJustEditedPlacedSmartObject: Starting");
			/* The user has just started to edit a placed layer.
			*/
			var reqResult:SyncRequestResult = CSXSInterface.instance.evalScript("canLinkIt.editedSOHelper.userEditedSOXML");
			/*if (SyncRequestResult.COMPLETE == reqResult.status && reqResult.data.boolean==true) {
				//logIt("callUserJustEditedPlacedSmartObject: user's planning to edit, setting up the timer");
				//var versionString:String = reqResult.data.version;
				var timer:Timer = new Timer(250);
				timer.repeatCount=1;
				timer.addEventListener(TimerEvent.TIMER,callUserJustEditedPlacedSmartObjectPart2);
				timer.start();
			} else {
				//logIt("callUserJustEditedPlacedSmartObject: data="+data);
			}*/
			//logIt("callUserJustEditedPlacedSmartObject: Finished");
		}
		
		public function callEditSmartObjectOriginal():void{
			//logIt("callUserJustEditedPlacedSmartObject: Starting");
			/* The user has just started to edit a placed layer.
			*/
			/*var reqResult:SyncRequestResult = */CSXSInterface.instance.evalScript("canLinkIt.editedSOHelper.userRequestsEditSO");
			/*if (SyncRequestResult.COMPLETE == reqResult.status && reqResult.data.boolean==true) {
			} else {
				//logIt("callUserJustEditedPlacedSmartObject: data="+data);
			}*/
		}
		
		/*public function callUserJustEditedPlacedSmartObjectPart2(event:TimerEvent):void {
			logIt("callUserJustEditedPlacedSmartObjectPart2: Started");
			var reqResult:SyncRequestResult = CSXSInterface.instance.evalScript("canLinkIt.editedSOHelper.userEditedSOPartB");
			if (SyncRequestResult.COMPLETE)
				if (reqResult.data.boolean==true) {
					logIt("callUserJustEditedPlacedSmartObjectPart2: Seems to have worked successfully");
					// It worked successfully: that means we can now get our latest layer info in the new file, I hope...
					canLinkIt.getActiveLayerInfo(editedPlacedObjectEventDescriptionID);
					return;
				} else {
					// The event hasn't completed yet. It really should have completed by now...
					logIt("callUserJustEditedPlacedSmartObjectPart2: Unexpected but not a problem: Opening the smart object hasn't happened yet.");
				}
			logIt("callUserJustEditedPlacedSmartObjectPart2: Re running the part 2 in a moment");
			var timer:Timer = new Timer(250);
			timer.repeatCount=1;
			timer.addEventListener(TimerEvent.TIMER,callUserJustEditedPlacedSmartObjectPart2);
			timer.start();
			return;						
		}*/
		
		public function callNewLink():void {
			CSXSInterface.instance.evalScript("action_LinkTo.newLink");

		}
		
		public function callNewLinkToALayerComp():void {
			logIt("PhotoshopHelper.callLinkToALayerComp():(3)");
			CSXSInterface.instance.evalScript("Action_LinkToLayerComp.newLinkToLayerComp");
		}
		
		public function callUpdateSelected():void {
			CSXSInterface.instance.evalScript("canLinkIt.updateSelected");
		}
		public function callUpdateAll():void {
			CSXSInterface.instance.evalScript("canLinkIt.updateAll");
		}
		
		public function callUpdateAFolder():void {
			CSXSInterface.instance.evalScript("Action_UpdateAllFiles.updateAllFiles");
		}
		

		
		/**
		 Function:		PhotoshopCallback
		 Description:	Monitors events in Adobe Photoshop so that when an event that
		 change the activeLayer it will call the function getPsStatus
		 @param eventID A Number variable that's been converted by charToInteger.
		 @param descID A Number variable.
		 */
		public function PhotoshopCallback(eventID:Number, descID:Number):void{//
			logIt("PhotoshopCallback: got callback:"+descID.toString()+", eventID="+eventID);
			if( eventID == charToInteger("save")) {
				// The user just saved the file.
				// If it was a new file, we should stop showing the "must save" error message.
				canLinkIt.getActiveLayerInfo( descID.toString() );
				// TODO If it was a linked file, we should offer to update the locations the file is linked to, esp. if they're open or if the user just edited the layer.
				// If it was a linked file, and the destination file is open and has been edited, we'll automatically update it:
				CSXSInterface.instance.evalScript("canLinkIt.editedSOHelper.notifySaved");
				return;
			}
			if( eventID == charToInteger("slct")) {
				/*The user has just changed what layer was selected, which could even be caused by changing which document is selected.*/
				//logIt("PhotoshopCallback:   handling slct event");
				canLinkIt.getActiveLayerInfo( descID.toString() );
				/* Now there's a bug here in Photoshop. When switching documents, the action takes a moment to resolve itself, and the above line always happens before the actual switch, so it gets the old documents layer.
				So to work around the bug, we need to redo this action in a few moments, after the change has happened.
				*/
				canLinkIt.getActiveLayerInfoInAMoment();
				return;
			}
			if( eventID == new uint( placedLayerEditContents ) ) {
				/* The user has just started to edit a placed layer.
				* We may want to do something about this.
				*/
				logIt("PhotoshopCallback: user has just edited a placed smart object layer");
				callUserJustEditedPlacedSmartObject();
				// We can wait to get the info until it's all finished -- this will be faster.
				//getActiveLayerInfo( descID.toString() );
				editedPlacedObjectEventDescriptionID=descID.toString();
				return;
			}
			if( eventID == charToInteger("Opn ")) {
				canLinkIt.getActiveLayerInfo(descID.toString());
				//searchForLinkedLayers.continueSearching();
				return;
			}
			if (eventID == charToInteger("Dplc")) {
				logIt("PhotoshopCallback: was Dplc");
				// If we use searchForLinkedLayers, we'll also have to listen to "move" and possible some other ones.
				//searchForLinkedLayers.eraseAllDataAndRestart();
				canLinkIt.getActiveLayerInfo(descID.toString());
				// TODO somehow here we have to continue our search for linked layers... because these could be new!
				return;
			}
			if( eventID == charToInteger("Cls ") ||
				eventID == charToInteger("Dlt ") ||
				eventID == charToInteger("setd") || 
				eventID == charToInteger("Mk  ") ||
				eventID == charToInteger("Dplc") ||
				eventID == charToInteger("Plc ") ||
				eventID == charToInteger("undo") || 
				eventID == charToInteger("MrgV") || 
				eventID == charToInteger("Mrg2") ||
				eventID == charToInteger("past") || 
				eventID == charToInteger("CpTL") ||
				eventID == new uint(newPlacedLayer) ||
				eventID == new uint(placedLayerReplaceContents) ||
				eventID == new uint(placedLayerMakeCopy)) {
				logIt("PhotoshopCallback: was one of the others");
				// These are all just events that can change the status of our layer, so we'll just update the info in the panel.
				canLinkIt.getActiveLayerInfo( descID.toString() );
				return;
			}
			logIt("PhotoshopCallback: did not handle callback:"+descID.toString());
		}
		
		/*************************************************
		 *************************************************
		 Utility Methods Below This Point (not feature code)
		 */
		
		public function logIt(inMessage:String):void {// used for debugging
			var reqResult:SyncRequestResult = CSXSInterface.instance.evalScript("logIt", encodeURIComponent("CanLinkIt.mxml:"+inMessage));
		}
		
		
		public function getDateFromXMP( xmpDateStr:String ):Date {
			//logIt("getDateFromXMP: starting")
			var pattern:RegExp = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})./
			//logIt("getDateFromXMP: string: "+xmpDateStr)
			var result:Object = pattern.exec( xmpDateStr )
			//logIt("getDateFromXMP: 1")
			var year:uint = new uint( result[1] )
			//logIt("getDateFromXMP: 2")
			var month:uint = new uint( result[2] )
			var day:uint = new uint( result[3] )
			var hour:uint = new uint( result[4] )
			var minute:uint = new uint( result[5] )
			var second:uint = new uint( result[6] )
			//logIt("getDateFromXMP: 2")
			var date:Date = new Date()
			//logIt("getDateFromXMP: 3")
			// stored as local time so use local methods
			date.setFullYear( year, month-1, day )
			//logIt("getDateFromXMP: 4")
			date.setHours( hour, minute, second, 0 )
			return date
		}
		
		/**
		 Function:		formatDate
		 Description:	Reformats the XMPDateTime string into the
		 desired format for panel date fields.
		 '2009-09-09T00:00:00.000-4:00' to
		 'Wed Set 9, 2009 00:00:00 AM' 
		 */
		public function formatDate( xmpDateStr:String ):String{
			var date:Date = getDateFromXMP(xmpDateStr);
			var d:String = date.toLocaleString();
			return d;
		}
		
		
		
	}
}