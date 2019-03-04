"use strict";

function EnemyBird(playerBird, patrolCenter, patrolSize) {
    Bird.call(this);
    
    this.cStunDuration = 1000;
    this.cDirections = Object.freeze({
        LEFT: 0,
        UP: 1,
        RIGHT: 2,
        DOWN: 3
    });
    this.cChangeDirectionDelay = 1000;
    this.cSpotDistanceSquared = 300;
    this.cUpwardMoveChance = 0.00375;
    
    this.mPlayerBird = playerBird;
    
    this.mPatrolCenter = patrolCenter;
    this.mPatrolSize = patrolSize;
    
    this.mDidAttack = false;
    this.mAttackStunEnd = Date.now();
    this.mCurrentLateralMovement = 0;
    this.mNextLateralMovement = Date.now();
    this.mReturningDirection = null;
}

gEngine.Core.inheritPrototype(EnemyBird, Bird);

EnemyBird.prototype.update = function () {
    var playerXform = this.mPlayerBird.getXform();
    var xForm = this._getTransform();
    var thisToPlayerMagnitudeSquared = Math.pow(playerXform.getXPos() - xForm.getXPos(), 2) + Math.pow(playerXform.getYPos() - xForm.getYPos(), 2);
    var movementToUse = [false, false, false, false];
    
    if (this.mDidAttack) {
        if (this.mAttackStunEnd < Date.now()) {
            this.mDidAttack = false;
        }
    }
    else {
        // Check if sees player, mark movement.
        if (thisToPlayerMagnitudeSquared < this.cSpotDistanceSquared) {
//            console.log("tracking");
            // If the player character is to the left, then:
            if (playerXform.getXPos() < xForm.getXPos()) {
                movementToUse[this.cDirections.LEFT] = true;
            }
            else {
                movementToUse[this.cDirections.RIGHT] = true;
            }

            // If the player character is above, then:
            if (playerXform.getYPos() > xForm.getYPos()) {
                movementToUse[this.cDirections.UP] = true;
            }
            else {
                movementToUse[this.cDirections.DOWN] = true;
            }
        }

        // If the player wasn't seen, then:
        if (movementToUse.every(function(input){return !input;})) {
            movementToUse = this._checkPatrolBounds();
        }
//        console.log(movementToUse);
        // If the bird is inside its patrol bounds, then:
        if (movementToUse.every(function(input){return !input;})) {
//            console.log("patrolling");
            // If it's the time to consider changing lateral movement, then:
            if (this.mNextLateralMovement < Date.now()) {
                this.mNextLateralMovement = Date.now() + this.cChangeDirectionDelay;
//                console.log("natural direction change");
                this.mCurrentLateralMovement = Math.random();
            }

            // If this returned to its patrol, then:
            if (this.mReturningDirection !== null) {
                // Set the current lateral movement to back towards the patrol bounds.
                this.mCurrentLateralMovement = this.mReturningDirection === this.cDirections.LEFT ? 1 : 0;
//                console.log("override returning");
                this.mNextLateralMovement = Date.now() + this.cChangeDirectionDelay;
                this.mReturningDirection = null;
            }
//            console.log(this.mCurrentlateralMovement);
            movementToUse[this.cDirections.LEFT] = this.mCurrentLateralMovement > 0.5 ? true : false;
            movementToUse[this.cDirections.UP] = Math.random() < this.cUpwardMoveChance ? true : false;
            movementToUse[this.cDirections.RIGHT] = this.mCurrentLateralMovement <= 0.5 ? true : false;
        }

        // Assign final movement to use.
        if (movementToUse[this.cDirections.LEFT]) {
            this.left();
        }
        if (movementToUse[this.cDirections.UP]) {
            this.up();
        }
        if (movementToUse[this.cDirections.RIGHT]) {
            this.right();
        }
        if (movementToUse[this.cDirections.DOWN]) {
            this.down();
        }
    }
    Bird.prototype.update.call(this);
    
    // If this is colliding with the player, then:
    if (this.getBBox().boundCollideStatus(this.mPlayerBird.getBBox()) !== 0) {
        this.mPlayerBird.attacked();
        
        this.mAttackStunEnd = Date.now() + this.cStunDuration;
        this.mDidAttack = true;
    }
};

EnemyBird.prototype._checkPatrolBounds = function () {
    var xForm = this._getTransform();
    // Tracks which movements to use. Left, top, right, bottom.
    var patrolBoundResults = [false, false, false, false];
//    console.log("check bounds");
    // Check left bound:
    if (xForm.getXPos() < this.mPatrolCenter[0] - (this.mPatrolSize[0] / 2)) {
//        console.log("returning right");
        patrolBoundResults[this.cDirections.RIGHT] = true;
        
        this.mReturningDirection = this.cDirections.RIGHT;
        this.mNextLateralMovement = Date.now() + this.cChangeDirectionDelay;
    }
    // Check top bound:
    if (xForm.getYPos() > this.mPatrolCenter[1] + (this.mPatrolSize[1] / 2)) {
        patrolBoundResults[this.cDirections.DOWN] = true;
    }
    // Check right bound:
    if (xForm.getXPos() > this.mPatrolCenter[0] + (this.mPatrolSize[0] / 2)) {
//        console.log("returning left");
        patrolBoundResults[this.cDirections.LEFT] = true;
        this.mReturningDirection = this.cDirections.LEFT;
        this.mNextLateralMovement = Date.now() + this.cChangeDirectionDelay;
    }
    // Check bottom bound:
    if (xForm.getYPos() < this.mPatrolCenter[1] - (this.mPatrolSize[1] / 2)) {
        patrolBoundResults[this.cDirections.UP] = true;
    }
    
    return patrolBoundResults;
};
