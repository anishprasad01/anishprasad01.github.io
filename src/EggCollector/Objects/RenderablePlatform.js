"use strict";

function RenderablePlatform() {
    this.mRenderable = new Renderable();
    //this.mRenderable.setColor([1, 1, 1, 1]);
    this.mRenderable.getXform().setSize(10, 10);
    GameObject.call(this, this.mRenderable);
    var r = new RigidRectangle(this.getXform(), 10, 10);
    r.setMass(0.0);
    this.setRigidBody(r);
    this.isHomeNest = false;
    this.isGround = false;
}
gEngine.Core.inheritPrototype(RenderablePlatform, GameObject);

RenderablePlatform.prototype.setSize = function (w, h) {
    this.mRenderable.getXform().setSize(w, h);
    this.getRigidBody().setSize(w, h);
};

RenderablePlatform.prototype.setPosition = function (x, y) {
    this.mRenderable.getXform().setPosition(x, y);
};

RenderablePlatform.prototype.setColor = function (colArray) {
    this.mRenderable.setColor([colArray[0], colArray[1], colArray[2], colArray[3]]);
};

RenderablePlatform.prototype.setHomeNest = function (homeNest) {
    this.isHomeNest = homeNest;
};

RenderablePlatform.prototype.getHomeNest = function () {
    return this.isHomeNest;
};

RenderablePlatform.prototype.setGround = function (ground) {
    this.isGround = ground;
};

RenderablePlatform.prototype.getGround = function () {
    return this.isGround;
};