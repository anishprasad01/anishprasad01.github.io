"use strict";

function Bird(texture, platforms, eggs) {
    // World stuff
    this.mPlatforms = platforms;
    this.mEggs = eggs;
    
    // Sprite Stuff
    this.mSprite = new SpriteAnimateRenderable(texture);
    this.mSprite.setAnimationType(SpriteAnimateRenderable.eAnimationType.eAnimateRight);
    this.mSprite.setAnimationSpeed(60 / 8);
    this.mSprite.getXform().setSize(20, 20);
    //this.mSprite.setColor([1,1,1,1]);
    GameObject.call(this, this.mSprite);
    
    // Physics stuff
    this.mRigidBody = new RigidRectangle(this.getXform(), 4, 10);
    this.mRigidBody.setMass(0.7);
    this.mRigidBody.setRestitution(0.5);
    this.mRigidBody.setRotationLock(true);
    this.setRigidBody(this.mRigidBody);
    
    // Variables for manipulation
    this.mWingPower = [20, 20];     // velocities when flapping
    this.mFlapFrequency = 1000;     // frequency of flaps
    this.mDraft = 0.02;             // X-axis deceleration when not holding direction keys
    this.mLift = 0.9;               // how is Y velocity lessened when gliding
    
    // State
    this.mInput = 0;
    this.mVelocity = this.getRigidBody().getVelocity();
    this.mNextFlap = Date.now();
    this.mNextSmallFlap = Date.now();
    this.mItem = null;
    
    this.mStates = [];
    this.mStates[0] = new BirdStateNormal(this);
    this.mStates[Bird._input.UP] = new BirdStateUp(this);
    this.mStates[Bird._input.UP | Bird._input.LEFT] = new BirdStateUpX(this, -1);
    this.mStates[Bird._input.UP | Bird._input.RIGHT] = new BirdStateUpX(this, 1);
    this.mStates[Bird._input.LEFT] = new BirdStateNormalX(this, -1);
    this.mStates[Bird._input.RIGHT] = new BirdStateNormalX(this, 1);
    this.mStates[Bird._input.DOWN] = new BirdStateDown(this);
    this.mStates[Bird._input.DOWN | Bird._input.LEFT] = new BirdStateDownX(this, -1);
    this.mStates[Bird._input.DOWN | Bird._input.RIGHT] = new BirdStateDownX(this, 1);
    this.mStates[16] = new BirdStateGround(this); /// eWWWW!
    this.mStates[16 + Bird._input.LEFT] = new BirdStateGroundX(this, -1);
    this.mStates[16 + Bird._input.RIGHT] = new BirdStateGroundX(this, 1);
    
    this.mState = this.mStates[this.mInput];
    this.mState.initialize();
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

Bird._input = Object.freeze({
    UP: 1,
    DOWN: 2,
    LEFT: 4,
    RIGHT: 8
});

Bird.prototype.up = function() {
    this.mInput |= Bird._input.UP;
};

Bird.prototype.down = function() {
    this.mInput |= Bird._input.DOWN;
};

Bird.prototype.left = function() {
    this.mInput |= Bird._input.LEFT;
};

Bird.prototype.right = function() {
    this.mInput |= Bird._input.RIGHT;
};

Bird.prototype.grab = function() {
    for (var i = 0; i < this.mEggs.size(); i++) {
        if (this.getBBox().boundCollideStatus(this.mEggs.getObjectAt(i).getBBox()) !== 0) {
            this.mItem = this.mEggs.getObjectAt(i);
            this.mItem.setPhysicsEnabled(false);
            this.mItem.getXform().setRotationInDegree(0);
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
    if ((this.mInput & Bird._input.UP) && (this.mInput & Bird._input.DOWN)) {
        this.mInput &= (255 - (Bird._input.UP | Bird._input.DOWN));
    }
    if ((this.mInput & Bird._input.RIGHT) && (this.mInput & Bird._input.LEFT)) {
        this.mInput &= (255 - (Bird._input.RIGHT | Bird._input.LEFT));
    }
    this.mState.update();

    this.mSprite.updateAnimation();
    
    this.mPrevInput = this.mInput;
    this.mInput = 0;
};

Bird.prototype.getBBox = function() {
    return this.mState.getBBox();
};