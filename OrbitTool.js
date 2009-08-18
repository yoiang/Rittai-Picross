/*
 * Copyright 2009, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


/**
 * The Orbit tool allows the user to look around the model by click-dragging.
 * The shift key enters a pan mode instead of orbiting.
 */
function OrbitTool(camera) {
    this.camera = camera;
    this.lastOffset = null;
    this.mouseLeftDown = false;
    this.mouseRightDown = false;
}

OrbitTool.prototype.handleMouseDown = function(Game, e) {
    this.lastOffset = {
        x: e.x,
        y: e.y
    };
    if (e.button == Game.mO3d.Event.BUTTON_LEFT) {
        this.mouseLeftDown = true;
    } else if (e.button == Game.mO3d.Event.BUTTON_RIGHT) {
        this.mouseRightDown = true;
    }

    return false;
};

OrbitTool.prototype.handleMouseMove = function(Game, e) {
    if (e.x !== undefined && (this.mouseLeftDown || this.mouseMiddleDown)) {
        var offset = {
            x: e.x,
            y: e.y
        };

        dX = (offset.x - this.lastOffset.x);
        dY = (offset.y - this.lastOffset.y);
        this.lastOffset = offset;

        this.camera.eye.rotZ -= dX / 100;
        this.camera.eye.rotH -= dY / 100;
        this.camera.eye.rotH = peg(this.camera.eye.rotH, 0.1, o3djs.math.PI - 0.1);
        //      document.getElementById('output').innerHTML = this.camera.eye.rotH;
        this.camera.update( Game );
    }
    return false;
};

OrbitTool.prototype.handleMouseUp = function(Game, e) {
    if (e.button == Game.mO3d.Event.BUTTON_LEFT) {
        this.mouseLeftDown = false;
    } else if (e.button == Game.mO3d.Event.BUTTON_RIGHT) {
        this.mouseRightDown = false;
    }
    return false;
};

function peg(value, lower, upper) {
    if (value < lower) {
        return lower;
    } else if (value > upper) {
        return upper;
    } else {
        return value;
    }
}
