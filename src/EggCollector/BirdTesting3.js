"use strict";

function BirdTesting3() {
    this.kLevelFile = "assets/BirdTesting/BirdTesting3.xml";
    this.mUITitle = null;
    this.mRestart = false;
    
    this.mCamera = null;
    this.mBird = null;

    this.mBirdPhysicsObjects = new GameObjectSet();
    this.mEggPhysicsObjects = new GameObjectSet();

    this.mPlatformSet = null;
    this.mEggSet = null;
    
    this.mScreenKeyboard = null;
}
gEngine.Core.inheritPrototype(BirdTesting3, Scene);


BirdTesting3.prototype.loadScene = function () {
    gEngine.TextFileLoader.loadTextFile(this.kLevelFile, gEngine.TextFileLoader.eTextFileType.eXMLFile);
};

BirdTesting3.prototype.unloadScene = function () {
    gEngine.LayerManager.cleanUp();
    gEngine.TextFileLoader.unloadTextFile(this.kLevelFile);
    
    if (this.mRestart === true) {
        gEngine.Core.startScene(new BirdTesting3());
    } else {
        gEngine.Core.startScene(new BirdTesting());
    }
};

BirdTesting3.prototype.initialize = function () {
    gEngine.DefaultResources.setGlobalAmbientColor([1, 1, 1, 1]);
    gEngine.DefaultResources.setGlobalAmbientIntensity(1.0);
    
    this.mUITitle = new UIText("Bird Testing Arena 3", [400, 560], 8, 1, 2, [1, 1, 1, 1]);
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eHUD, this.mUITitle);
    
    for (var i = 0; i < 10; i++) {
        var line = new LineRenderable(20 * i - 100, 150, 20 * i - 100, -150);
        line.setColor([0.5, 0.5, 0.5, 1]);
        gEngine.LayerManager.addToLayer(gEngine.eLayer.eBackground, line);
    }
    
    for (var i = 0; i < 7; i++) {
        var line = new LineRenderable(-100, i * 20 - 20, 100, i * 20 - 20);
        line.setColor([0.5, 0.5, 0.5, 1]);
        gEngine.LayerManager.addToLayer(gEngine.eLayer.eBackground, line);
    }
    
    var parser = new SceneFileParser(this.kLevelFile);
    this.mCamera = parser.parseCamera();
    
    this.mPlatformSet = parser.parseRenderablePlatform();
    for (var i = 0; i < this.mPlatformSet.size(); i++) {
        this.mBirdPhysicsObjects.addToSet(this.mPlatformSet.getObjectAt(i));
        this.mEggPhysicsObjects.addToSet(this.mPlatformSet.getObjectAt(i));
    }
    
    this.mEggSet = parser.parseEggs();
    for (var i = 0; i < this.mEggSet.size(); i++) {
        this.mEggPhysicsObjects.addToSet(this.mEggSet.getObjectAt(i));
    }
    
    this.mBird = new PlayerBird(this.mEggSet);
    this.mBird.setDrawRigidShape(true);
    this.mBird.getXform().setPosition(0, 37.5);
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eActors, this.mBird);
    this.mBirdPhysicsObjects.addToSet(this.mBird);
    
    // Move the egg in front of the bird
    for (var i = 0; i < this.mEggSet.size(); i++) {
        gEngine.LayerManager.moveToLayerFront(gEngine.eLayer.eActors, this.mEggSet.getObjectAt(i));
    }
    
    this.mScreenKeyboard = new ScreenKeyboard([
       gEngine.Input.keys.W,
       gEngine.Input.keys.A,
       gEngine.Input.keys.S,
       gEngine.Input.keys.D,
       gEngine.Input.keys.Space
    ]);
};

BirdTesting3.prototype.draw = function () {
    gEngine.Core.clearCanvas([1.0, 1.0, 1.0, 1.0]);

    this.mCamera.setupViewProjection();
    gEngine.LayerManager.drawAllLayers(this.mCamera);
};

BirdTesting3.prototype.update = function () {    
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.R)) {
        this.mRestart = true;
        gEngine.GameLoop.stop();
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.E)) {
        gEngine.GameLoop.stop();
    }
    
    gEngine.LayerManager.updateAllLayers();
    gEngine.Physics.processCollision(this.mBirdPhysicsObjects, []);
    gEngine.Physics.processCollision(this.mEggPhysicsObjects, []);
    this.mScreenKeyboard.update();
};