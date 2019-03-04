"use strict";

function EndLevel(finalScore, possibleScore) {
    this.mFinalScore = null;
    this.mFinishMessage = null;
    this.mThanksMessage = null;
    this.mPossibleScore = null;
    this.kFinalScore = finalScore;
    this.kPossibleScore = possibleScore
}
gEngine.Core.inheritPrototype(EndLevel, Scene);


EndLevel.prototype.loadScene = function () {
};

EndLevel.prototype.unloadScene = function () {
    gEngine.LayerManager.cleanUp();
    
    if (this.mRestart === true) {
        gEngine.Core.startScene(new Level1());
    } else {
        gEngine.Core.startScene(new Level1());
    }
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
    
    this.mFinishMessage = new UIText("Finish!", [400, 430], 12, 1, 2, [1, 1, 1, 1]);
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eHUD, this.mFinishMessage);
    
    var totalScoreText = "Total Score: " + this.kFinalScore;
    
    this.mFinalScore = new UIText(totalScoreText, [400, 330], 10, 1, 2, [1, 1, 1, 1]);
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eHUD, this.mFinalScore);
    
    var possibleScoreText = "Max Possible Score: " + this.kPossibleScore;
    
    this.mPossibleScore = new UIText(possibleScoreText, [400, 280], 10, 1, 2, [1, 1, 1, 1]);
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eHUD, this.mPossibleScore);
    
    this.mThanksMessage = new UIText("Thanks for Playing!", [400, 180], 10, 1, 2, [1, 1, 1, 1]);
    gEngine.LayerManager.addToLayer(gEngine.eLayer.eHUD, this.mThanksMessage);
    
};

EndLevel.prototype.draw = function () {
    gEngine.Core.clearCanvas([1.0, 1.0, 1.0, 1.0]);

    this.mCamera.setupViewProjection();
    gEngine.LayerManager.drawAllLayers(this.mCamera);
};

EndLevel.prototype.update = function () {    
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.R)) {
        this.mRestart = true;
        gEngine.GameLoop.stop();
    }
    
    gEngine.LayerManager.updateAllLayers();
};