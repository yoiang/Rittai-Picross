function TargetCamera( Game )
{
    var mViewInfo = null;

    var mEye = {
        rotZ: 0,
        rotH: 46,
        distanceFromTarget: 15
    };
    var mTarget = [ 0, 0, 0 ];
    var mUp = [ 0, -1, 0 ];

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

        this.update( Game );
    }

    this.centerOnPuzzle = function( Game, Puzzle, ResetAngle )
    {
        this.centerOn( Game, Puzzle.getDimensions(), ResetAngle );
    }

    this.centerOn = function( Game, Location, ResetAngle )
    {
        mTarget[0] = Location[0] / 2.0;
        mTarget[1] = Location[1] / 2.0;
        mTarget[2] = Location[2] / 2.0;

        if ( ResetAngle )
        {
            mEye.rotZ = -0.76;
            mEye.rotH = 46;
        }
        mEye.distanceFromTarget = o3djs.math.distanceSquared( [0,0,0], [mTarget[0], mTarget[1], mTarget[2]] ) + 10;

        this.update( Game );
    }

    this.update = function( Game )
    {
        if ( mEye.rotH < 44.5 )
        {
            mEye.rotH = 44.5;
        }
        if ( mEye.rotH > 46.6 )
        {
            mEye.rotH = 46.6;
        }
        if ( mEye.rotZ < 0 )
        {
            mEye.rotZ = 2 * Math.PI + mEye.rotZ;
        } else
        {
            mEye.rotZ = mEye.rotZ % ( 2 * Math.PI );
        }


        mEye.x = mTarget[0] + Math.cos(mEye.rotZ) * mEye.distanceFromTarget * Math.sin(mEye.rotH);
        mEye.y = mTarget[2] + Math.cos(mEye.rotH) * mEye.distanceFromTarget;
        mEye.z = mTarget[1] + Math.sin(mEye.rotZ) * mEye.distanceFromTarget * Math.sin(mEye.rotH);

        var EyeV = [mEye.x, mEye.y, mEye.z];
        mViewInfo.drawContext.view = o3djs.math.matrix4.lookAt(EyeV, mTarget, mUp);

        if ( Game && Game.mPuzzle )
        {
            Game.mPuzzle.updatePeeringArrowLocation( Game );
            Game.doRender();
        }
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
            if ( mLastOffset == null )
            {
                mLastOffset =
                {
                    x: e.x,
                    y: e.y
                };
                return false;
            }
            var offset =
            {
                x: e.x,
                y: e.y
            };

            dX = (offset.x - mLastOffset.x);
            dY = -1 * (offset.y - mLastOffset.y);
            mLastOffset = offset;

            mEye.rotZ -= dX / 100;
            mEye.rotH -= dY / 100;
            mEye.rotH = peg(mEye.rotH, 0.1, o3djs.math.PI - 0.1);

            this.update( Game );
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
