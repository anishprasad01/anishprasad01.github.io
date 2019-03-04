"use strict";

function Bird() {
    // Sprite Stuff
    this.mSprite = new Renderable();
    this.mSprite.setColor([1, 1, 1, 1]);
    this.mSprite.getXform().setSize(10, 10);
    GameObject.call(this, this.mSprite);
    
    // Physics stuff
    var r = new RigidRectangle(this.getXform(), 10, 10);
    r.setMass(0.7);
    r.setRestitution(0.5);
    r.setRotationLock(true);
    this.setRigidBody(r);
    
    // Variables for manipulation
    this.mWingPower = [20, 20];     // velocities when flapping
    this.mFlapFrequency = 1000;     // frequency of flaps
    this.mDraft = 0.02;             // X-axis deceleration when not holding direction keys
    this.mLift = 0.9;               // how is Y velocity lessened when gliding
    
    // State
    this.mDirection = 0;
    this.mPrevDirection = 0;
    this.mVelocity = this.getRigidBody().getVelocity();
    this.mNextFlap = Date.now();
    this.mNextSmallFlap = Date.now();
    this.mItem = null;
}
gEngine.Core.inheritPrototype(Bird, GameObject);

Bird.prototype.getWingPower = function(){return this.mWingPower;};
Bird.prototype.setWingPower = function(power){this.mWingPower=power;};

Bird.prototype.getFlapFrequency = function(){return this.mFlapFrequency;};
Bird.prototype.setFlapFrequency = function(freq){this.mFlapFrequency=freq;};

Bird.prototype.getDraft = function() { return this.mDraft; };
Bird.prototype.setDraft = function(draft) { this.mDraft = draft; };

Bird.prototype.getLift = function() { return this.mLift; };
Bird.prototype.setLift = function(lift) { this.mLift = lift; };

Bird.prototype._getTransform = function() { return this.mSprite.getXform(); };

Bird._directions = Object.freeze({
    UP: 1,
    DOWN: 2,
    LEFT: 4,
    RIGHT: 8
});

Bird.prototype.up = function() {
    this.mDirection |= Bird._directions.UP;
    this.mDirection &= (255 - Bird._directions.DOWN);
};

Bird.prototype.down = function() {
    this.mDirection |= Bird._directions.DOWN;
    this.mDirection &= (255 - Bird._directions.UP);
};

Bird.prototype.left = function() {
    this.mDirection |= Bird._directions.LEFT;
    this.mDirection &= (255 - Bird._directions.RIGHT);
};

Bird.prototype.right = function() {
    this.mDirection |= Bird._directions.RIGHT;
    this.mDirection &= (255 - Bird._directions.LEFT);
};

Bird.prototype.grab = function(eggs) {
    for (var i = 0; i < eggs.size(); i++) {
        if (this.getBBox().boundCollideStatus(eggs.getObjectAt(i).getBBox()) !== 0) {
            this.mItem = eggs.getObjectAt(i);
            this.mItem.setPhysicsEnabled(false);
            return;
        }
    }
};

Bird.prototype.release = function() {
    if (this.mItem !== null) {
        this.mItem.setPhysicsEnabled(true);
        this.mItem.setVelocity(this.mVelocity);
        this.mItem = null;
    }
};

Bird.prototype.update = function() {
    GameObject.prototype.update.call(this);
    if (this.mDirection & Bird._directions.UP) {
        if (this.mNextFlap < Date.now()) {
            this.mNextFlap = Date.now() + this.mFlapFrequency;
            this.mVelocity[1] = this.mWingPower[1] + Math.abs(this.mVelocity[0]) * 0.1;
        }
    }
    else if (this.mDirection & Bird._directions.DOWN) {
        if (!(this.mPrevDirection & Bird._directions.DOWN) && this.mVelocity[1] > -this.mWingPower[1]) {
            this.mVelocity[1] = -this.mWingPower[1];
        }
        this.mVelocity[1] += this.mVelocity[1] * 0.02; // made up this number
    }
    else if (!(this.mDirection & (Bird._directions.LEFT | Bird._directions.RIGHT))){
        if (this.mNextSmallFlap < Date.now() && this.mVelocity[1] < -1) {
            this.mNextSmallFlap = Date.now() + this.mFlapFrequency;
            this.mVelocity[1] = this.mWingPower[1] * 0.10;
        }
    }
    
    if (this.mDirection & Bird._directions.LEFT) {
        if (this.mVelocity[0] > 0) {
            this.mVelocity[0] = 0;
        }
        else if (this.mVelocity[0] > -this.mWingPower[0]) {
            this.mVelocity[0] -= this.mWingPower[0] / 30;
        }
        
        if (this.mVelocity[1] < 0 && !(this.mDirection & Bird._directions.DOWN)) {
            this.mVelocity[1] *= this.mLift;
            if (this.mVelocity[1] < -2) {
                this.mVelocity[0] -= -this.mVelocity[1] * 0.05;
            }
        }
    } 
    else if (this.mDirection & Bird._directions.RIGHT) {
        if (this.mVelocity[0] < 0) {
            this.mVelocity[0] = 0;
        }
        else if (this.mVelocity[0] < this.mWingPower[0]) {
            this.mVelocity[0] += this.mWingPower[0] / 30;
        }
        
        if (this.mVelocity[1] < 0 && !(this.mDirection & Bird._directions.DOWN)) {
            this.mVelocity[1] *= this.mLift;
            if (this.mVelocity[1] < -2) {
                this.mVelocity[0] += -this.mVelocity[1] * 0.05;
            }
        }
    }
    else {
        this.mVelocity[0] /= (1 + this.mDraft);
    }
    
    if (this.mItem !== null) {
        this.mItem.getXform().setXPos(this.getXform().getXPos());
        this.mItem.getXform().setYPos(this.getXform().getYPos());
    }
    
    this.mPrevDirection = this.mDirection;
    this.mDirection = 0;
};