package canlinkit {
	public class UnitTestFramework {
		// Import the following three in order to be able to use Alert()
		import mx.controls.Alert;
		import flash.display.Sprite;
		import mx.core.Application;
		
		public var errorCount:Number=0;

		public function UnitTestFramework() {
		}
		
		public function assertEquals(expected:String, actual:String, description:String):void {
			if (expected==actual)
				return;
			
			Alert.show("Expected="+expected+"\nActual="+actual+"\nDescription: "+description, "UnitTestFramework.assertEquals() failed", Alert.OK, Sprite(Application.application));
			errorCount++;
		}
	}
}