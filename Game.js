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

    var mGameInput = null;
    var mEditInput = null;

    var mEditMode = false;

    this.initView = function()
    {
        this.mCamera = new TargetCamera( this );

        this.mIngameOverlay = new IngameOverlay( this );

        this.mClient.render();
    }

    this.mPuzzle = null;

    var mWon = false;
    var mLost = false;

    this.getWon = function()
    {
        return mWon;
    }

    this.setWon = function( Value )
    {
        mWon = Value;
        if ( Value )
        {
            this.mCamera.getViewInfo().clearBuffer.clearColor = [0.5, 0.5, 1, 1];
        }
    }

    this.getLost = function()
    {
        return mLost;
    }

    this.setLost = function( Value )
    {
        mLost = Value;
        if ( Value )
        {
            this.mCamera.getViewInfo().clearBuffer.clearColor = [1.0, 0, 0, 1];
        }
    }

    this.clearWonLost = function()
    {
        mWon = false;
        mLost = false;
        this.mCamera.getViewInfo().clearBuffer.clearColor = [1, 1, 1, 1];        
    }

    this.createPuzzle = function( Blocks, AllowedFails )
    {

        if ( this.mPuzzle )
        {
            this.mPuzzle.destroy( this );
            this.mPuzzle = null;
            this.mIngameOverlay.puzzleDestroyed( this );
        }

        this.mPuzzle = new Puzzle( this, Blocks, AllowedFails, this.mCamera );

        this.mIngameOverlay.finishedCreatePuzzle( this, this.mPuzzle );

        this.clearWonLost();

        this.mClient.render();

        document.getElementById("Subtitle").innerHTML = "Puzzle Mode";
    }

    this.mInputState = new InputState( this );
    this.initInput = function()
    {
        mGameInput = new GameInput(Game);
        mEditInput = new EditInput(Game);
        this.mInputState.addNotify( mGameInput );
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

    this.toggleEditMode = function()
    {
        mEditMode = !mEditMode;
        if ( mEditMode )
        {
            this.mInputState.removeNotify( mGameInput );
            this.mInputState.addNotify( mEditInput );

            document.getElementById("Subtitle").innerHTML = "Edit Mode";

            this.clearWonLost();

            this.mPuzzle.setEditMode( this, true );
        } else
        {
            this.mInputState.removeNotify( mEditInput );
            this.mInputState.addNotify( mGameInput );

            document.getElementById("Subtitle").innerHTML = "Puzzle Mode";

            this.mPuzzle.setEditMode( this, false );
        }
    }
}
