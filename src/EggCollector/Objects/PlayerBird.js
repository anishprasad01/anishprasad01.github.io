"use strict";

function PlayerBird(eggs) {
   Bird.call(this);
   
   this.cCantGrabTime = 1000;
   
   this.mEggs = eggs;
   this.mWasAttacked = false;
   this.mGrabbingTime = Date.now();
}
gEngine.Core.inheritPrototype(PlayerBird, Bird);

PlayerBird.prototype.attacked = function() {
    this.release();
    
    this.mWasAttacked = true;
    this.mGrabbingTime = Date.now() + this.cCantGrabTime;
};

PlayerBird.prototype.update = function() {
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.W))
        this.up();
    else if (gEngine.Input.isKeyPressed(gEngine.Input.keys.S))
        this.down();
    
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.A))
        this.left();
    else if (gEngine.Input.isKeyPressed(gEngine.Input.keys.D))
        this.right();
    
    if (this.mWasAttacked) {
        if (this.mGrabbingTime < Date.now()) {
            this.mWasAttacked = false;
        }
    }
        
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Space) && !this.mWasAttacked) {
        this.grab(this.mEggs);
    }
    if (gEngine.Input.isKeyReleased(gEngine.Input.keys.Space)) {
        this.release();
    }
    
    Bird.prototype.update.call(this);
};