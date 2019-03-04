"use strict";

function Egg() {
    // Sprite Stuff
    this.mSprite = new Renderable();
    this.mSprite.setColor([1, 1, 1, 1]);
    this.mSprite.getXform().setSize(7, 7);
    GameObject.call(this, this.mSprite);
    
    // Physics stuff
    var r = new RigidCircle(this.mSprite.getXform(), 3);
    r.setMass(0.7);
    r.setRestitution(0.5);
    this.setRigidBody(r);
    
    this.mInPlay = true;
}
gEngine.Core.inheritPrototype(Egg, GameObject);

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

Egg.prototype.setNotInPlay = function () {
    this.mInPlay = false;
};