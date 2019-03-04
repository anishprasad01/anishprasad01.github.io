"use strict";

function BirdTesting2() {
    this.kLevelFile = "assets/BirdTesting/BirdTesting2.xml";
    this.mUITitle = null;
    this.mRestart = false;
    this.mSwitchLevel = false;
    
    this.mCamera = null;
    this.mBird = null;
    this.mNest = null;
    this.mTestEnemy = null;

    this.mBirdPhysicsObjects = new GameObjectSet();
    this.mEggPhysicsObjects = new GameObjectSet(); 
    
    this.mEggSet = null;
    this.mPlatformSet = null;
    
    this.mScreenKeyboard = null;
}
gEngine.Core.inheritPrototype(BirdTesting2, Scene);


BirdTesting2.prototype.loadScene = function () {
    gEngine.TextFileLoader.loadTextFile(this.kLevelFile, gEngine.TextFileLoader.eTextFileType.eXMLFile);
};

BirdTesting2.prototype.unloadScene = function () {
    gEngine.LayerManager.cleanUp();
    gEngine.TextFileLoader.unloadTextFile(this.kLevelFile);
    
    if (this.mRestart === true) {
        gEngine.Core.startScene(new BirdTesting2());
    } 
    else if(this.mSwitchLevel) {
        gEngine.Core.startScene(new Level1());
    }
    else {
        gEngine.Core.startScene(new BirdTesting());
    }
};

BirdTesting2.prototype.initialize = function () {
    gEngine.DefaultResources.setGlobalAmbientColor([1, 1, 1, 1]);
    gEngine.DefaultResources.setGlobalAmbientIntensity(1.0);
    
    this.mUITitle = new UIText("Bird Testing Arena 2", [400, 560], 4, 1, 2, [1, 1, 1, 1]);
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eHUD, this.mUITitle);
    
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
    this.mBird.toggleDrawRenderable();
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eActors, this.mBird);
    this.mBirdPhysicsObjects.addToSet(this.mBird);
    
    this.mNest = new RenderablePlatform();
    this.mNest.setSize(20, 3);
    this.mNest.setPosition(0, -34);
    this.mNest.setDrawRigidShape(false);
    this.mNest.getRenderable().setColor([170/255, 121/255, 13/255, 1.0]);
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eActors, this.mNest);
    this.mBirdPhysicsObjects.addToSet(this.mNest);
    
    this.mTestEnemy = new EnemyBird(this.mBird, [-50, -10], [40, 30]);
    this.mTestEnemy.getXform().setPosition(-50, -10);
    this.mTestEnemy.setDrawRigidShape(true);
    this.mTestEnemy.toggleDrawRenderable();
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eActors, this.mTestEnemy);
    this.mBirdPhysicsObjects.addToSet(this.mTestEnemy);
    
    this.bound = new Renderable();
    this.bound.getXform().setPosition(-50, -10);
    this.bound.getXform().setSize(40, 30);
    this.bound.setColor([1.0, 1.0, 0.0, 1]);
    
    this.mScreenKeyboard = new ScreenKeyboard([
       gEngine.Input.keys.W,
       gEngine.Input.keys.A,
       gEngine.Input.keys.S,
       gEngine.Input.keys.D,
       gEngine.Input.keys.Space
    ]);
};

BirdTesting2.prototype.draw = function () {
    gEngine.Core.clearCanvas([1.0, 1.0, 1.0, 1.0]);
    
    this.mCamera.setupViewProjection();this.bound.draw(this.mCamera);
    gEngine.LayerManager.drawAllLayers(this.mCamera);
};

BirdTesting2.prototype.update = function () {    
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.R)) {
        this.mRestart = true;
        gEngine.GameLoop.stop();
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.E)) {
        gEngine.GameLoop.stop();
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Q)) {
        this.mSwitchLevel = true;
        gEngine.GameLoop.stop();
    }
    
    gEngine.LayerManager.updateAllLayers();
    gEngine.Physics.processCollision(this.mBirdPhysicsObjects, []);
    gEngine.Physics.processCollision(this.mEggPhysicsObjects, []);
    this.mScreenKeyboard.update();
    
    for (var i = 0; i < this.mEggSet.size(); i++) {
        if (this.mNest.getBBox().boundCollideStatus(this.mEggSet.getObjectAt(i).getBBox()) !== 0)
            this.mEggSet.getObjectAt(i).setPhysicsEnabled(false);
    }
    
    this.mCamera.panTo(this.mBird.getXform().getXPos(), this.mBird.getXform().getYPos());
    this.mCamera.update();
};