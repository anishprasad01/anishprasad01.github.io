"use strict";

function BirdCreek() {
    this.kLevelFile = "assets/BirdTesting/Level1.xml";
    this.kBirdTexture = "assets/Birds/bird-sketch-2.png";
    this.kBackgroundMusic = "assets/Audio/Level1BG.mp3";
    this.mUITitle = null;
    this.mUIScore = null;
    this.mRestart = false;
    this.mSwitchLevel = false;
    
    this.mCamera = null;
    this.mMiniMap = null;
    this.mBird = null;

    this.mBirdPhysicsObjects = new GameObjectSet();
    this.mEggPhysicsObjects = new GameObjectSet();

    this.mNestSet = null;
    this.mPlatformSet = null;
    this.mEggSet = null;
    
    this.mScore = 0;
    this.mHomeNest = null;
    this.mGround = null;
}
gEngine.Core.inheritPrototype(BirdCreek, Scene);


BirdCreek.prototype.loadScene = function () {
    gEngine.TextFileLoader.loadTextFile(this.kLevelFile, gEngine.TextFileLoader.eTextFileType.eXMLFile);
    gEngine.Textures.loadTexture(this.kBirdTexture);
    gEngine.AudioClips.loadAudio(this.kBackgroundMusic);
};

BirdCreek.prototype.unloadScene = function () {
    gEngine.LayerManager.cleanUp();
    gEngine.TextFileLoader.unloadTextFile(this.kLevelFile);
    gEngine.Textures.unloadTexture(this.kBirdTexture);
    gEngine.AudioClips.stopBackgroundAudio();
    
    if (this.mRestart === true) {
        gEngine.Core.startScene(new BirdCreek());
    }
    else if(this.mSwitchLevel) {
        gEngine.Core.startScene(new BirdTesting2());
    }
    else {
        gEngine.Core.startScene(new EndLevel(this.mScore, this.mEggSet.size()));
    }
};

BirdCreek.prototype.initialize = function () {
    gEngine.DefaultResources.setGlobalAmbientColor([1, 1, 1, 1]);
    gEngine.DefaultResources.setGlobalAmbientIntensity(1.0);
    
    this.mUITitle = new UIText("Test Level 1", [400, 560], 8, 1, 2, [0.6, 0, 0, 1]);
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eHUD, this.mUITitle);
    
    this.mUIScore = new UIText("Score: 0", [400, 540], 5, 1, 2, [0, 0, 0, 1]);
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eHUD, this.mUIScore);
    
    var parser = new SceneFileParser(this.kLevelFile);
    this.mCamera = parser.parseCamera();
    
    this.mNestSet = parser.parseNests(this.kBirdTexture);
    for (var i = 0; i < this.mNestSet.size(); i++) {
        if(this.mNestSet.getObjectAt(i).getHomeNest()){
            this.mHomeNest = this.mNestSet.getObjectAt(i);
        }
        this.mBirdPhysicsObjects.addToSet(this.mNestSet.getObjectAt(i).getRigidBodies()[0]);
        this.mNestSet.getObjectAt(i).addRigidBodiesToSet(this.mEggPhysicsObjects);
    }
    
    this.mMiniMap = parser.parseMiniMap(this.kLevelFile);
    
    this.mPlatformSet = parser.parseRenderablePlatform();
    for (var i = 0; i < this.mPlatformSet.size(); i++) {
        if(this.mPlatformSet.getObjectAt(i).getGround()){
            this.mGround = this.mPlatformSet.getObjectAt(i);
        }
        this.mBirdPhysicsObjects.addToSet(this.mPlatformSet.getObjectAt(i));
        this.mEggPhysicsObjects.addToSet(this.mPlatformSet.getObjectAt(i));
    }
    
    this.mEggSet = parser.parseEggs(this.kBirdTexture);
    for (var i = 0; i < this.mEggSet.size(); i++) {
        this.mEggPhysicsObjects.addToSet(this.mEggSet.getObjectAt(i));
    }

    this.mBird = new PlayerBird(this.kBirdTexture, this.mNestSet.concat(this.mPlatformSet) ,this.mEggSet);
    this.mBird.getXform().setPosition(0, 37.5);
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eActors, this.mBird);
    this.mBirdPhysicsObjects.addToSet(this.mBird);
    
    var icon = new MiniIcon(this.kBirdTexture, this.mBird.getXform());
    SpriteRenderable.prototype.setElementPixelPositions.call(icon, 768, 896, 896, 1024);
    SpriteRenderable.prototype.getXform.call(icon).setSize(20, 20);
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eMiniMap, icon);
    
    // Move the egg in front of the bird
    for (var i = 0; i < this.mEggSet.size(); i++) {
        gEngine.LayerManager.moveToLayerFront(gEngine.eLayer.eActors, this.mEggSet.getObjectAt(i));
    }
};

BirdCreek.prototype.draw = function () {
    gEngine.Core.clearCanvas([1.0, 1.0, 1.0, 1.0]);

    this.mCamera.setupViewProjection();
    gEngine.LayerManager.drawAllLayers(this.mCamera);
    
    this.mMiniMap.setupViewProjection();
    gEngine.LayerManager.drawLayer(gEngine.eLayer.eBackground, this.mMiniMap);
    gEngine.LayerManager.drawLayer(gEngine.eLayer.eMiniMap, this.mMiniMap);
    //gEngine.LayerManager.drawLayer(gEngine.eLayer.eActors, this.mMiniMap);
};

BirdCreek.prototype.update = function () {    
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
            //console.log(this.mGround != null);
            if(status){
                this.mEggSet.getObjectAt(i).setNotInPlay();
                //this.mEggSet.getObjectAt(i).setPhysicsEnabled(false);
            }
        }
    }
    
    //for (var i = 0; i < gEngine.LayerManager.)
    gEngine.LayerManager.updateLayer(gEngine.eLayer.eMiniMap);
    
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
    
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.M)) {
        this.mMiniMap.show();
    }
    else {
        this.mMiniMap.hide();
    }
    
    this.mCamera.panTo(this.mBird.getXform().getXPos(), this.mBird.getXform().getYPos());
    this.mCamera.update();
};