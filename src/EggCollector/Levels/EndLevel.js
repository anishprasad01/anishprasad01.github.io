"use strict";

function EndLevel(finalScore, possibleScore) {
    this.mFinalScore = null;
    this.mFinishMessage = null;
    this.mThanksMessage = null;
    this.mPossibleScore = null;
    this.kFinalScore = finalScore;
    this.kPossibleScore = possibleScore;
    
    this.kBackgroundMusic = "assets/Audio/FinishScreenBG.mp3";
    this.kBackgroundSprite = "assets/Backdrops/bg.png";
    this.kButtonSprite = "assets/UI/button.png"
    
    this.mMainMenuButton = null;
    
    this.mRestart = false;
    this.mQuitGame = false;
};
gEngine.Core.inheritPrototype(EndLevel, Scene);


EndLevel.prototype.loadScene = function () {
    gEngine.Textures.loadTexture(this.kBackgroundSprite);
    gEngine.Textures.loadTexture(this.kButtonSprite);
    gEngine.AudioClips.loadAudio(this.kBackgroundMusic);
};

EndLevel.prototype.unloadScene = function () {
    gEngine.Textures.unloadTexture(this.kBackgroundSprite);
    gEngine.Textures.unloadTexture(this.kButtonSprite);
    gEngine.AudioClips.stopBackgroundAudio();
    
    gEngine.LayerManager.cleanUp();
    
    if (this.mRestart) {
        gEngine.Core.startScene(new Level1());
    }
    else if (this.mQuitGame){
        gEngine.Core.startScene(new MainMenu());
    }
//    else {
//        gEngine.Core.startScene(new MainMenu());
//    }
};

EndLevel.prototype.initialize = function () {
    gEngine.DefaultResources.setGlobalAmbientColor([1, 1, 1, 1]);
    gEngine.DefaultResources.setGlobalAmbientIntensity(1.0);
    
    this.mCamera = new Camera(
        vec2.fromValues(0, 0), // position of the camera
        200,                     // width of camera
        [0, 0, 800, 600]         // viewport (orgX, orgY, width, height)
    );
    this.mCamera.setBackgroundColor([0, 0, 0.5, 1]);
    
    this.text = "Finish!";
    
    if(this.kPossibleScore === this.kFinalScore){
        this.text = "PERFECT!";
    }
    else if(this.kFinalScore === 0){
        this.text = "Better Luck Next Time!";
    }
    
    this.mFinishMessage = new UIText(this.text, [400, 430], 12, 1, 2, [1, 1, 1, 1]);
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eHUD, this.mFinishMessage);
    
    var totalScoreText = "Total Score: " + this.kFinalScore;
    
    this.mFinalScore = new UIText(totalScoreText, [400, 330], 10, 1, 2, [1, 1, 1, 1]);
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eHUD, this.mFinalScore);
    
    var possibleScoreText = "Max Possible Score: " + this.kPossibleScore;
    
    this.mPossibleScore = new UIText(possibleScoreText, [400, 280], 10, 1, 2, [1, 1, 1, 1]);
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eHUD, this.mPossibleScore);
    
    this.mThanksMessage = new UIText("Thanks for Playing!", [400, 180], 10, 1, 2, [1, 1, 1, 1]);
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eHUD, this.mThanksMessage);
    
    this.mMainMenuButton = new UIButton(this.kButtonSprite,this.goHome,this,[390,80],[290,70],"Return to Main Menu",5,[1,1,1,1],[0,0,1,1]);
    
    this.mBackground = new TextureRenderable(this.kBackgroundSprite);
    this.mBackground.getXform().setPosition(0, 50);
    this.mBackground.getXform().setSize(450, 450);
    
    gEngine.AudioClips.playBackgroundAudio(this.kBackgroundMusic);
};

EndLevel.prototype.draw = function () {
    gEngine.Core.clearCanvas([1.0, 1.0, 1.0, 1.0]);

    this.mCamera.setupViewProjection();
    this.mBackground.draw(this.mCamera);
    this.mMainMenuButton.draw(this.mCamera);
    gEngine.LayerManager.drawAllLayers(this.mCamera);
};

EndLevel.prototype.update = function () {    
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.R)) {
        this.mRestart = true;
        gEngine.GameLoop.stop();
    }
    else if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Q)) {
        this.mQuitGame = true;
        gEngine.GameLoop.stop();
    }
    
    this.mMainMenuButton.update();
    
    gEngine.LayerManager.updateAllLayers();
};

EndLevel.prototype.goHome = function () {
    this.mQuitGame = true;
    gEngine.GameLoop.stop();
};