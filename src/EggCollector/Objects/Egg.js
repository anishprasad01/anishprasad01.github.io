"use strict";

function Egg(texture) {
    // Sprite Stuff
    this.mSprite = new SpriteRenderable(texture);
    this.mSprite.getXform().setSize(5, 5);
    this.mSprite.setElementPixelPositions(0, 64, 512, 576);
    this.mSprite.setColor([1,1,1,1]);
    GameObject.call(this, this.mSprite);
    
    // Physics stuff
    var r = new RigidCircle(this.mSprite.getXform(), 2);
    r.setMass(0.7);
    r.setRestitution(0.5);
    this.setRigidBody(r);
    
    this.mInPlay = true;
    this.mStatus = Egg.status.INPLAY;
}
gEngine.Core.inheritPrototype(Egg, GameObject);

Egg.status = Object.freeze({
    INPLAY: 0,
    SCORE: 1,
    GROUNDED: 2
});

Egg.prototype.setPhysicsEnabled = function(flag) {
    this.getRigidBody().setPhysicsEnabled(flag);
};

Egg.prototype.setVelocity = function(velocity) {
    var v = this.getRigidBody().getVelocity();
    v[0] = velocity[0];
    v[1] = velocity[1];
    this.getRigidBody().setAngularVelocity(0);
};

Egg.prototype.checkIfHome = function (homeNest) {
    if(this.getBBox().boundCollideStatus(homeNest.getBBox()) !== 0){
        return true;
    }
    else{
        return false;
    }
};

Egg.prototype.checkIfOnGround = function (ground) {
    //console.log(this.mSprite.getXform().getPosition());
    if(this.getBBox().boundCollideStatus(ground.getBBox()) !== 0){
        return true;
    }
    else{
        return false;
    }
};

Egg.prototype.isInPlay = function () {
    return this.mInPlay;
};

Egg.prototype.setNotInPlay = function (inputStatus) {
    this.mInPlay = false;
    if(inputStatus === Egg.status.SCORE && this.mStatus === Egg.status.INPLAY){
        this.mSprite.setColor([0,1,0,1]);
        this.mStatus = Egg.status.SCORE;
    }
    else if(inputStatus === Egg.status.GROUNDED && this.mStatus === Egg.status.INPLAY){
        this.mSprite.setColor([1,0,0,1]);
        this.mStatus = Egg.status.GROUNDED;
    }
};