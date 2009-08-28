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

        this.doRender();
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

    this.createPuzzle = function( setPuzzleInfo )
    {

        if ( this.mPuzzle )
        {
            this.mPuzzle.destroy( this );
            this.mPuzzle = null;
            this.mIngameOverlay.puzzleDestroyed( this );
        }

        this.mPuzzle = new Puzzle( this, setPuzzleInfo, this.mCamera );

        this.mIngameOverlay.finishedCreatePuzzle( this, this.mPuzzle );

        this.clearWonLost();

        this.doRender();

        if ( setPuzzleInfo.mTitle != "" )
        {
            document.getElementById("Subtitle").innerHTML = "\"" + setPuzzleInfo.mTitle + "\"";
        } else
        {
            document.getElementById("Subtitle").innerHTML = "Puzzle Mode";
        }
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
        this.setEditMode( mEditMode );
    }

    this.setGameMode = function( Value )
    {
        this.setEditMode( !Value );
    }

    this.setEditMode = function( Value )
    {
        mEditMode = Value;
        if ( mEditMode )
        {
            this.mInputState.removeNotify( mGameInput );
            this.mInputState.addNotify( mEditInput );

            document.getElementById("Subtitle").innerHTML = "Edit Mode";

            var ControlsString = "<table class=\"Controls\">\n";
            ControlsString += generateControlEntry( "Drag Mouse", "Rotate puzzle" );
            ControlsString += generateControlEntry( "Hold W, Click Mouse", "Add block" );
            ControlsString += generateControlEntry( "Hold X, Click Mouse", "Remove block" );
            ControlsString += generateControlEntry( "Press S", "Save puzzle to textarea" );
            ControlsString += generateControlEntry( "Press E", "Toggle Edit Mode" );
            ControlsString += "</table>";
            document.getElementById("ControlsBody").innerHTML = ControlsString;

            document.getElementById("EditMode").className = "unhidden";

            this.clearWonLost();

            this.doRender();

            if ( this.mPuzzle )
            {
                this.mPuzzle.setEditMode( this, true );
            }
        } else
        {
            this.mInputState.removeNotify( mEditInput );
            this.mInputState.addNotify( mGameInput );

            if ( this.mPuzzle && this.mPuzzle.getInfo().mTitle != "" )
            {
                document.getElementById("Subtitle").innerHTML = "\"" + this.mPuzzle.getInfo().mTitle + "\"";
            } else
            {
                document.getElementById("Subtitle").innerHTML = "Puzzle Mode";
            }

            ControlsString = "<table class=\"Controls\">\n";
            ControlsString += generateControlEntry( "Drag Mouse", "Rotate puzzle" );
            ControlsString += generateControlEntry( "Hold W, Click Mouse", "<span class=\"bold\">PAINT</span> block" );
            ControlsString += generateControlEntry( "Hold X, Click Mouse", "<span class=\"bold\">BREAK</span> block" );
            ControlsString += generateControlEntry( "Press E", "Toggle Edit Mode" );
            ControlsString += "</table>";
            document.getElementById("ControlsBody").innerHTML = ControlsString;

            document.getElementById("EditMode").className = "hidden";

            this.clearWonLost();

            this.doRender();

            if ( this.mPuzzle )
            {
                this.mPuzzle.setEditMode( this, false );
            }
        }
    }

    this.savePuzzle = function()
    {
        if ( document.getElementById("Subtitle").innerHTML == "Edit Mode" )
        {
            document.getElementById("Subtitle").innerHTML = "Edit Mode - saving...";
            document.getElementById("EditModePuzzleFile").innerHTML = this.mPuzzle.save( this );
            document.getElementById("Subtitle").innerHTML = "Edit Mode - saved";
        }
    }

    this.doRender = function()
    {
        if ( this.mClient )
        {
            this.mClient.render();
        }
    }
}

function generateControlEntry( Key, Function )
{
    return "<tr><td class=\"ControlsKey\">" + Key + " - </td><td class=\"ControlsFunction\">" + Function + "</td></tr>";
}