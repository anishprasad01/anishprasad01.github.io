"use strict";

function BirdTesting() {
    // The camera to view the scene
    this.mCamera = null;
    this.mBird = null;
    this.mFloor = null;
    this.mNest = null;
    this.mNest2 = null;
    this.mBirdPhysicsObjects = new GameObjectSet();
    this.mEggPhysicsObjects = new GameObjectSet();
    
    this.mEggs = null;
    
    this.mScreenKeyboard = null;
    
    this.mUITitle = null;
    this.mRestart = false;
}
gEngine.Core.inheritPrototype(BirdTesting, Scene);


BirdTesting.prototype.loadScene = function () {
};

BirdTesting.prototype.unloadScene = function () {
    gEngine.LayerManager.cleanUp();
    
    if (this.mRestart === true) {
        gEngine.Core.startScene(new BirdTesting());
    } else {
        gEngine.Core.startScene(new BirdTesting2());
    }
};

BirdTesting.prototype.initialize = function () {
    gEngine.DefaultResources.setGlobalAmbientColor([1, 1, 1, 1]);
    gEngine.DefaultResources.setGlobalAmbientIntensity(1.0);
    
    // Step A: set up the cameras
    this.mCamera = new Camera(
        vec2.fromValues(0, 0), // position of the camera
        100,                     // width of camera
        [0, 0, 800, 600]         // viewport (orgX, orgY, width, height)
    );
    this.mCamera.setBackgroundColor([0.8, 0.9, 1.0  , 1]);
    
    this.mEggs = new GameObjectSet();
    
    this.mBird = new PlayerBird(this.mEggs);
    this.mBird.setDrawRigidShape(true);
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eActors, this.mBird);
    
    this.mFloor = new RenderablePlatform();
    this.mFloor.setSize(98, 1);
    this.mFloor.setPosition(0, -36);
    this.mFloor.setDrawRigidShape(true);
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eActors, this.mFloor);
    
    this.mNest = new RenderablePlatform();
    this.mNest.setSize(15, 1);
    this.mNest.setPosition(-30, +20);
    this.mNest.setDrawRigidShape(true);
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eActors, this.mNest);
    
    this.mNest2 = new RenderablePlatform();
    this.mNest2.setSize(15, 1);
    this.mNest2.setPosition(30, 0);
    this.mNest2.setDrawRigidShape(true);
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eActors, this.mNest2);
    

    var egg = new Egg();
    egg.getXform().setPosition(30, 8);
    egg.setDrawRigidShape(true);
    egg.toggleDrawRenderable();
    egg.getRenderable().setColor([1, 0, 0, 0.5]);
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eActors, egg);
    this.mEggs.addToSet(egg);
    
    this.mBirdPhysicsObjects.addToSet(this.mBird);
    this.mBirdPhysicsObjects.addToSet(this.mFloor);
    this.mBirdPhysicsObjects.addToSet(this.mNest);
    this.mBirdPhysicsObjects.addToSet(this.mNest2);
    this.mEggPhysicsObjects.addToSet(this.mEggs.getObjectAt(0));
    this.mEggPhysicsObjects.addToSet(this.mFloor);
    this.mEggPhysicsObjects.addToSet(this.mNest);
    this.mEggPhysicsObjects.addToSet(this.mNest2);
    
    this.mScreenKeyboard = new ScreenKeyboard([
       gEngine.Input.keys.W,
       gEngine.Input.keys.A,
       gEngine.Input.keys.S,
       gEngine.Input.keys.D,
       gEngine.Input.keys.Space
    ]);
    
    this.mUITitle = new UIText("Bird Testing Arena", [400, 560], 4, 1, 2, [1, 1, 1, 1]);
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eHUD, this.mUITitle);
};

BirdTesting.prototype.draw = function () {
    gEngine.Core.clearCanvas([1.0, 1.0, 1.0, 1.0]);

    this.mCamera.setupViewProjection();
    gEngine.LayerManager.drawAllLayers(this.mCamera);
};

BirdTesting.prototype.update = function () {
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.R)) {
        this.mRestart = true;
        gEngine.GameLoop.stop();
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.E)) {
        gEngine.GameLoop.stop();
    }
    
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Q)) {
        this.mBird.setFlapFrequency(500);
        this.mBird.setWingPower([20,15]);
    }
    
    gEngine.LayerManager.updateAllLayers();
    gEngine.Physics.processCollision(this.mBirdPhysicsObjects, []);
    gEngine.Physics.processCollision(this.mEggPhysicsObjects, []);
    this.mScreenKeyboard.update();
    this.mCamera.clampAtBoundary(this.mBird.getXform(), 1.0);
};