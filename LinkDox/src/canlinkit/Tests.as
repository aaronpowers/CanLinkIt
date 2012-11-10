package canlinkit
{
	import com.adobe.photoshop.SaveOptions;
	
	import flash.filesystem.File;

	public class Tests
	{
		// Import the following three in order to be able to use Alert()
		import mx.controls.Alert;
		import flash.display.Sprite;
		import mx.core.Application;
		import flash.system.Capabilities;
		
		import com.adobe.csawlib.photoshop.Photoshop;
		//import com.adobe.photoshop.Application;


		private var test:UnitTestFramework = new UnitTestFramework();		

		private var canLinkIt:CanLinkIt;
		public function Tests(canLinkItToUse:CanLinkIt) {
			this.canLinkIt=canLinkItToUse;
			
			// Run tests
			var errors:Number=0;
			errors+=runPhotoshopHelperTests();
			errors+=runVersionTests();
			errors+=runFileTest1();
			
			errors+=test.errorCount;
			
			Alert.show("Total number of errors: "+errors, "Unit Tests Result", Alert.OK, Sprite(Application.application));
		}
		
		private function runPhotoshopHelperTests():Number {
			try {
				var photoshopHelper:PhotoshopHelper = new PhotoshopHelper(canLinkIt);
				return 0;
			} catch (e:Error) {
				Alert.show("runPhotoshopHelperTests() had an error:\n"+e+"\nStack Trace="+e.getStackTrace(), "Debug", Alert.OK, Sprite(Application.application));
				return 1;
			}
			// This line should be unnecessary because of the try/catch returns should catch all cases, but is a compilation requirement from ActionScript to have this here:
			return 0;
		}
		
		private function runVersionTests():Number {
			try {
				var photoshopHelper:PhotoshopHelper = new PhotoshopHelper(canLinkIt);
				var versionInfo:VersionInfo = new VersionInfo(photoshopHelper);
				versionInfo.checkVersion(false);
				versionInfo.checkVersionNow(false);
				versionInfo.getVersion();
				return 0;
			} catch (e:Error) {
				Alert.show("runVersionsTests() had an error:\n"+e+"\nStack Trace="+e.getStackTrace(), "Debug", Alert.OK, Sprite(Application.application));
				return 1;
			}
			// This line should be unnecessary because of the try/catch returns should catch all cases, but is a compilation requirement from ActionScript to have this here:
			return 0;
		}
		
		private function closeAllPhotoshopFiles():void {
			var app:com.adobe.photoshop.Application = Photoshop.app;
			// TODO be more polite about this. We don't want to lose work. See JSX example.
			while (app.documents.length>0)
				app.documents[0].close(SaveOptions.PROMPTTOSAVECHANGES);

		}
		
		private function runFileTest1():Number {
			var line:Number=0;
			try {
				var photoshopHelper:PhotoshopHelper = new PhotoshopHelper(canLinkIt);
				if (photoshopHelper.photoshopMajorVersion<=PhotoshopHelper.PHOTOSHOP_CS4_VERSION) {
					Alert.show("Some tests cannot run with Photoshop CS4.\n" +
								"To run all tests, run on Photoshop CS5.", "Debug", Alert.OK, Sprite(Application.application));
					return 0;
				}
				line=10;
				// We have to start with a clean slate.
				closeAllPhotoshopFiles();
				line=15;
				var app:com.adobe.photoshop.Application = Photoshop.app;
				line=20;
				test.assertEquals('NoDocumentOpen',canLinkIt.currentState,"There should be no files open when we start this test.");
				line=20;
				app.documents.add();
				line=30;
				canLinkIt.getActiveLayerInfo("1");
				line=40;
				test.assertEquals('DocumentNotSaved',canLinkIt.currentState,"The file has not been saved so the state should be appropriately set to display the error message.");
				line=50;
				app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
				line=60;
				
				
				// Paths must be sent in platform specific version, not using Photoshop's special path format.
				// TODO we'll need to be able to adjust this depending on the platform it runs on, and depending on the developer's system.
				photoshopHelper.logIt("Capabilities.OS: "+Capabilities.os);
				var file:File = new File("C:\\Dropbox\\AllDocuments\\EntrepreneurshipAndIdeas\\LinkDox\\FlashBuilderProject\\TestFiles\\Files\\Folder1\\AssembledFiles\\AssembledFile2.psd");
				//new File("c/Dropbox/AllDocuments/EntrepreneurshipAndIdeas/LinkDox/FlashBuilderProject/TestFiles/Files/Folder1/AssembledFiles/AssembledFile2.psd");
				line=70;
				app.open(file);
				line=80;
				canLinkIt.getActiveLayerInfo("1");
				line=90;

				test.assertEquals('default',canLinkIt.currentState,"The file has not been saved so the state should be appropriately set to display the error message.");
				test.assertEquals("Linked to: ",canLinkIt.statusField1Label.text,"The file has not been saved so the state should be appropriately set to display the error message.");

				//test.assertEquals("fail now",canLinkIt.statusField1Label.text,"The file has not been saved so the state should be appropriately set to display the error message.");
				
				app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
				return 0;
			} catch (e:Error) {
				Alert.show("runFileTest1() had an error after virtual line "+line+".\n"+e+"\nStack Trace="+e.getStackTrace()+"\n"+e.message, "Debug", Alert.OK, Sprite(Application.application));
				return 1;
			}
			// This line should be unnecessary because of the try/catch returns should catch all cases, but is a compilation requirement from ActionScript to have this here:
			return 0;
		}
	}
}