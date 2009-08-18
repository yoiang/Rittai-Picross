function Game( ClientElements )
{
    this.mO3dElement = ClientElements[0];

    this.mO3d = this.mO3dElement.o3d;
    this.mClient = this.mO3dElement.client;

    this.mClient.renderMode = this.mO3d.Client.RENDERMODE_ON_DEMAND;

    this.mPack = this.mClient.createPack();

    this.mCamera = null;

    this.mClock = 0;
    this.mTimeMult = 1;

    this.mIngameOverlay = null;
    this.mDebugOverlay = null;

    this.initView = function()
    {
        this.mCamera = new TargetCamera( this );

        this.mIngameOverlay = new IngameOverlay( this );

        this.mClient.render();
    }

    this.mPuzzle = null;
    this.createPuzzle = function( Blocks, AllowedFails )
    {
        this.mCamera.getViewInfo().clearBuffer.clearColor = [1, 1, 1, 1];

        if ( this.mPuzzle )
        {
            this.mPuzzle.destroy( this );
            this.mPuzzle = null;
        }

        this.mCamera.centerOn( this, [ Blocks.length, Blocks[0].length, Blocks[0][0].length] );

        this.mPuzzle = new Puzzle( this, Blocks, AllowedFails);

        this.mCamera.centerOnPuzzle( this, this.mPuzzle );

        this.mClient.render();
    }

    this.mInputState = new InputState( this );
    this.initInput = function()
    {
        this.mInputState.addNotify( new GameInput(Game) );
        this.mInputState.addNotify( this.mCamera );
    }

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
