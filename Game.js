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
        this.mCamera.mViewInfo.clearBuffer.clearColor = [1, 1, 1, 1];

        if ( this.mPuzzle )
        {
            this.mPuzzle.destroy( this );
            this.mPuzzle = null;
        }

        // TODO: handle recenter before creation cleaner
        this.mCamera.target.x = Blocks.length / 2.0;
        this.mCamera.target.y = Blocks[0].length / 2.0;
        this.mCamera.target.z = Blocks[0][0].length / 2.0;
        this.mCamera.update( this );

        this.mPuzzle = new Puzzle( this, Blocks, AllowedFails);

        this.mCamera.target.x = this.mPuzzle.getMax()[0] / 2.0;
        this.mCamera.target.y = this.mPuzzle.getMax()[1] / 2.0;
        this.mCamera.target.z = this.mPuzzle.getMax()[2] / 2.0;
        this.mCamera.update( this );
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
}

function TargetCamera( Game )
{
    this.mViewInfo = null;

    this.eye = {
        rotZ: 45,
        rotH: 45,
        distanceFromTarget: 15
    };
    this.target = {
        x: 0,
        y: 0,
        z: 0
    };

    this.init = function( Game )
    {
        // Create the render graph for a view
        this.mViewInfo = o3djs.rendergraph.createBasicView( Game.mPack, Game.mClient.root, Game.mClient.renderGraphRoot);

        // Set up a perspective projection.
        this.mViewInfo.drawContext.projection = o3djs.math.matrix4.perspective(
            o3djs.math.degToRad(30), // 30 degree fov.
            Game.mClient.width / Game.mClient.height,
            1,                  // Near plane.
            5000);              // Far plane.

        // Set up our view transformation to look towards the world origin where the
        // cube is located.
        this.mViewInfo.drawContext.view = o3djs.math.matrix4.lookAt(
            [0, 0, 15],   // eye
            [0, 0, 0],   // target
            [0, 0, 1]);  // up

        this.mViewInfo.clearBuffer.clearColor = [1, 1, 1, 1];
    }
    this.init( Game );
}

TargetCamera.prototype.update = function( Game ) {
    if ( this.eye.rotH < 44.5 )
    {
        this.eye.rotH = 44.5;
    }
    if ( this.eye.rotH > 46.6 )
    {
        this.eye.rotH = 46.6;
    }

    var target = [this.target.x, this.target.y, this.target.z];

    this.eye.x = this.target.x + Math.cos(this.eye.rotZ) * this.eye.distanceFromTarget * Math.sin(this.eye.rotH);
    this.eye.y = this.target.y + Math.sin(this.eye.rotZ) * this.eye.distanceFromTarget * Math.sin(this.eye.rotH);
    this.eye.z = this.target.z + Math.cos(this.eye.rotH) * this.eye.distanceFromTarget;

    var eye = [this.eye.x, this.eye.y, this.eye.z];
    var up = [0, 0, 1];
    this.mViewInfo.drawContext.view = o3djs.math.matrix4.lookAt(eye, target, up);
    //g_lightPosParam.value = eye;
};