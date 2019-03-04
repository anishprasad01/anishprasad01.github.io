"use strict";

function Level1() {
    this.kLevelFile = "assets/BirdTesting/Level1.xml";
    this.mUITitle = null;
    this.mUIScore = null;
    this.mRestart = false;
    this.mSwitchLevel = false;
    
    this.mCamera = null;
    this.mBird = null;

    this.mBirdPhysicsObjects = new GameObjectSet();
    this.mEggPhysicsObjects = new GameObjectSet();

    this.mPlatformSet = null;
    this.mEggSet = null;
    
    this.mScore = 0;
    this.mHomeNest = null;
    //this.mGround = null;
    
    this.mScreenKeyboard = null;
}
gEngine.Core.inheritPrototype(Level1, Scene);


Level1.prototype.loadScene = function () {
    gEngine.TextFileLoader.loadTextFile(this.kLevelFile, gEngine.TextFileLoader.eTextFileType.eXMLFile);
};

Level1.prototype.unloadScene = function () {
    gEngine.LayerManager.cleanUp();
    gEngine.TextFileLoader.unloadTextFile(this.kLevelFile);
    
    if (this.mRestart === true) {
        gEngine.Core.startScene(new Level1());
    }
    else if(this.mSwitchLevel) {
        gEngine.Core.startScene(new BirdTesting2());
    }
    else {
        gEngine.Core.startScene(new EndLevel(this.mScore, this.mEggSet.size()));
    }
};

Level1.prototype.initialize = function () {
    gEngine.DefaultResources.setGlobalAmbientColor([1, 1, 1, 1]);
    gEngine.DefaultResources.setGlobalAmbientIntensity(1.0);
    
    this.mUITitle = new UIText("Level 1", [400, 560], 8, 1, 2, [0.6, 0, 0, 1]);
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eHUD, this.mUITitle);
    
    this.mUIScore = new UIText("Score: 0", [400, 540], 5, 1, 2, [0, 0, 0, 1]);
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eHUD, this.mUIScore);
    
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
        if(this.mPlatformSet.getObjectAt(i).getGround()){
            this.mGround = this.mPlatformSet.getObjectAt(i);
        }
        if(this.mPlatformSet.getObjectAt(i).getHomeNest()){
            this.mHomeNest = this.mPlatformSet.getObjectAt(i);
        }
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

Level1.prototype.draw = function () {
    gEngine.Core.clearCanvas([1.0, 1.0, 1.0, 1.0]);

    this.mCamera.setupViewProjection();
    gEngine.LayerManager.drawAllLayers(this.mCamera);
};

Level1.prototype.update = function () {    
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
    
    this.mUIScore.setText("Score: " + this.mScore);
    
    for (var i = 0; i < this.mEggSet.size(); i++) {
        var status = this.mEggSet.getObjectAt(i).checkIfHome(this.mHomeNest);
        if(status && this.mEggSet.getObjectAt(i).isInPlay()){
            this.mScore++;
            this.mEggSet.getObjectAt(i).setNotInPlay();
            //this.mEggSet.getObjectAt(i).setPhysicsEnabled(false);
        }
        else {
            status = this.mEggSet.getObjectAt(i).checkIfOnGround(this.mGround);
            if(status){
                this.mEggSet.getObjectAt(i).setNotInPlay();
                //this.mEggSet.getObjectAt(i).setPhysicsEnabled(false);
            }
        }
    }
    
    //end game if all eggs collected
    var count = 0;
    for (var i = 0; i < this.mEggSet.size(); i++) {
        if(!this.mEggSet.getObjectAt(i).isInPlay()){
            count++;
        }
    }
    
    if(count === this.mEggSet.size()){
        gEngine.GameLoop.stop();
    }
    
    this.mCamera.panTo(this.mBird.getXform().getXPos(), this.mBird.getXform().getYPos());
    this.mCamera.update();
};