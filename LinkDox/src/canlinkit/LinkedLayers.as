package canlinkit {
	import flash.utils.Timer;
	import flash.events.TimerEvent;
	import com.adobe.csxs.types.SyncRequestResult;
	import com.adobe.csxs.core.CSXSInterface;
	import com.adobe.csxs.events.*;
	import com.adobe.csxs.external.*;
	import com.adobe.csxs.external.resources.*;


	/********************
	 * The idea behind this is to search for linked layers asynchrously without blocking the user.
	 * However, the downside of this is that if we rely on this, every time a document changes in a way that could affect the data, we need to erase the data and re-search for it. This isn't pretty.
	 * So right now we're not using this class.
	 * If this plugin is popular, I recommend we revive this code and finish it off -- but we'll have to test thoroughly in Photoshop to make sure that we catch every way that the document can change that would invalidate our cache.
	 * 
	 * There's corresponding code in LinkedLayers.jsx
	 *
	 * 
	 * */
	public class LinkedLayers {
		
		private var canLinkIt:CanLinkIt;
		private var timer:Timer=null;

		
		public function LinkedLayers(canLinkItToUse:CanLinkIt) {
			this.canLinkIt=canLinkItToUse;
			
			// start immediately
			timer= new Timer(100);
			timer.repeatCount=0;
			timer.addEventListener(TimerEvent.TIMER,runOne);
			timer.start();
		}
		
		/**
		 * continueSearching()
		 * Call this after an event that has a bunch of new layers that might be linked in a document, such as opening a file.
		 *
		 * */
		public function continueSearching():void {
			timer.delay=100;
			if (!timer.running)
				timer.start();
		}
		
		/**
		 * eraseDataAndRestart()
		 * Call this after an event that may invalidate our previous set of searched and selected items...
		 * For example, calling a duplicate where we don't know items were duplicated. We'll have to start from the beginning.
		 *
		 * */
		public function eraseAllDataAndRestart():void {
			// TODO
			var reqResult:SyncRequestResult = CSXSInterface.instance.evalScript("linkDox.linkedLayers.eraseAllData");
			
			continueSearching();
		}
		
		private function runOne():void {
			var reqResult:SyncRequestResult = CSXSInterface.instance.evalScript("linkDox.linkedLayers.continueFindingLinkedLayersXML");
			if (SyncRequestResult.COMPLETE == reqResult.status && reqResult.data.boolean==true) {
				// We're done searching! Amazing! Let's stop the timer.
				timer.stop();
			} else {
				// There's more to search. Let's search in a bit.
				timer.delay=100;
			}
		}
	}
}