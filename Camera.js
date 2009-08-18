
function TargetCamera( Game )
{
    var mViewInfo = null;

    var mEye = {
        rotZ: 45,
        rotH: 45,
        distanceFromTarget: 15
    };
    var mTarget = [ 0, 0, 0 ];
    var mUp = [ 0, 0, 1 ];

    var mLastOffset = null;

    this.init = function( Game )
    {
        // Create the render graph for a view
        mViewInfo = o3djs.rendergraph.createBasicView( Game.mPack, Game.mClient.root, Game.mClient.renderGraphRoot);
        mViewInfo.clearBuffer.clearColor = [1, 1, 1, 1];

        // Set up a perspective projection.
        mViewInfo.drawContext.projection = o3djs.math.matrix4.perspective(
            o3djs.math.degToRad(30), // 30 degree fov.
            Game.mClient.width / Game.mClient.height,
            1,                  // Near plane.
            5000);              // Far plane.

        this.update();
    }

    this.centerOnPuzzle = function( Puzzle )
    {
        mTarget[0] = Puzzle.getMax()[0] / 2.0;
        mTarget[1] = Puzzle.getMax()[1] / 2.0;
        mTarget[2] = Puzzle.getMax()[2] / 2.0;
        this.update();
    }

    this.update = function()
    {
        if ( mEye.rotH < 44.5 )
        {
            mEye.rotH = 44.5;
        }
        if ( mEye.rotH > 46.6 )
        {
            mEye.rotH = 46.6;
        }

        mEye.x = mTarget[0] + Math.cos(mEye.rotZ) * mEye.distanceFromTarget * Math.sin(mEye.rotH);
        mEye.y = mTarget[1] + Math.sin(mEye.rotZ) * mEye.distanceFromTarget * Math.sin(mEye.rotH);
        mEye.z = mTarget[2] + Math.cos(mEye.rotH) * mEye.distanceFromTarget;

        var EyeV = [mEye.x, mEye.y, mEye.z];
        mViewInfo.drawContext.view = o3djs.math.matrix4.lookAt(EyeV, mTarget, mUp);
    }

    this.getTarget = function()
    {
        return mTarget;
    }

    this.getEye = function()
    {
        return mEye;
    }

    this.getViewInfo = function()
    {
        return mViewInfo;
    }

    this.handleMouseDown = function(Game, e)
    {
        mLastOffset =
        {
            x: e.x,
            y: e.y
        };
        return false;
    }

    this.handleMouseMove = function(Game, e) {
        if (e.x !== undefined && Game.mInputState.isMouseDown( Game.mO3d.Event.BUTTON_LEFT ) )
        {
            var offset =
            {
                x: e.x,
                y: e.y
            };

            dX = (offset.x - mLastOffset.x);
            dY = (offset.y - mLastOffset.y);
            mLastOffset = offset;

            mEye.rotZ -= dX / 100;
            mEye.rotH -= dY / 100;
            mEye.rotH = peg(mEye.rotH, 0.1, o3djs.math.PI - 0.1);

            this.update( );
            return true;
        }
        return false;
    }


    this.init( Game );
}

function peg(value, lower, upper) {
    if (value < lower) {
        return lower;
    } else if (value > upper) {
        return upper;
    } else {
        return value;
    }
}
