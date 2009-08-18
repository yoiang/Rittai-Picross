function Game( ClientElements )
{
    this.mO3dElement = ClientElements[0];

    this.mO3d = this.mO3dElement.o3d;
    this.mClient = this.mO3dElement.client;
    this.mPack = this.mClient.createPack();

    this.mCamera = null;

    this.mClock = 0;
    this.mTimeMult = 1;

    this.mIngameOverlay = null;
    this.mDebugOverlay = null;

    this.initView = function()
    {
        this.mCamera = new TargetCamera( this );
        this.mCamera.update( this );

        this.mIngameOverlay = new IngameOverlay( this );
    }
    this.initView();

    this.mPuzzle = null;
    this.createPuzzle = function( Blocks, AllowedFails )
    {
        this.mCamera.getViewInfo().clearBuffer.clearColor = [1, 1, 1, 1];

        if ( this.mPuzzle )
        {
            this.mPuzzle.destroy( this );
            this.mPuzzle = null;
        }

        // TODO: handle recenter before creation cleaner
        this.mCamera.getTarget()[0] = Blocks.length / 2.0;
        this.mCamera.getTarget()[1] = Blocks[0].length / 2.0;
        this.mCamera.getTarget()[2] = Blocks[0][0].length / 2.0;
        this.mCamera.update( );

        this.mPuzzle = new Puzzle( this, Blocks, AllowedFails);

        this.mCamera.centerOnPuzzle( this.mPuzzle );
    }

    this.mInputState = new InputState( this );
    this.mOrbit = new OrbitTool( this.mCamera );
    this.initInput = function()
    {
        this.mInputState.addNotify( new GameInput(Game) );
        this.mInputState.addNotify( this.mOrbit );
    }
    this.initInput();

    this.mFinished = false;  // for selenium testing
    this.mTextureLoadDenied = false; // also for selenium testing

    this.mPath = window.location.href.substring(0, ( window.location.href ).lastIndexOf('/') + 1 );

    this.mFinishedInit = false;

    this.mDebug = false;
    this.toggleDebug = function()
    {
        this.mDebug = !this.mDebug;
        if ( this.mPuzzle )
            this.mPuzzle.setDebug( this.mDebug );

        if ( this.mDebug )
        {
            this.mDebugOverlay = new DebugOverlay( this );
        } else
        {
            this.mDebugOverlay.destroy( this );
            this.mDebugOverlay = null;
        }
    }

    this.setWon = function( Value )
    {
        if ( Value )
        {
            this.mCamera.getViewInfo().clearBuffer.clearColor = [0.5, 0.5, 1, 1];
        }
    }

    this.setLost = function( Value )
    {
        if ( Value )
        {
            this.mCamera.getViewInfo().clearBuffer.clearColor = [1.0, 0, 0, 1];
        }
    }
}

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

    this.init = function( Game )
    {
        // Create the render graph for a view
        mViewInfo = o3djs.rendergraph.createBasicView( Game.mPack, Game.mClient.root, Game.mClient.renderGraphRoot);

        // Set up a perspective projection.
        mViewInfo.drawContext.projection = o3djs.math.matrix4.perspective(
            o3djs.math.degToRad(30), // 30 degree fov.
            Game.mClient.width / Game.mClient.height,
            1,                  // Near plane.
            5000);              // Far plane.

        // Set up our view transformation to look towards the world origin where the
        // cube is located.
        mViewInfo.drawContext.view = o3djs.math.matrix4.lookAt(
            [0, 0, mEye.distanceFromTarget],
            mTarget,
            mUp);

        mViewInfo.clearBuffer.clearColor = [1, 1, 1, 1];
    }
    this.init( Game );

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
}