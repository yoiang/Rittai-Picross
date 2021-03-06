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


    this.mPuzzle = null;

    var mWon = false;
    var mLost = false;

    var mOnlyDimIfPainted = true;

    var mHideUnneededFaces = true;
    
    this.initView = function()
    {
        this.mCamera = new TargetCamera( this );

        this.mIngameOverlay = new IngameOverlay( this );

        this.doRender();
    }

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
            this.mPuzzle.unhideAllBlocks();
            this.mPuzzle.hidePeeringArrow( true );
            if ( gShapeTemplateMaterial )
            {
                gShapeTemplateMaterial.setFinished( true );
            }
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

        if ( this.mPuzzle )
        {
            this.mPuzzle.resetRemainingFails();
            this.mIngameOverlay.updateRemainingFails( this, this.mPuzzle );
            this.mCamera.getViewInfo().clearBuffer.clearColor = this.mPuzzle.getBackgroundColor();
        } else
        {
            this.mCamera.getViewInfo().clearBuffer.clearColor = [1, 1, 1, 1];
        }

        if ( gShapeTemplateMaterial )
        {
            gShapeTemplateMaterial.setFinished( false );
        }
    }

    this.createPuzzle = function( setPuzzleInfo )
    {

        if ( this.mPuzzle != null )
        {
            this.mPuzzle.destroy( this );
            this.mPuzzle = null;
            this.mIngameOverlay.puzzleDestroyed( this );
        }

        this.setEditMode( false );

        this.clearWonLost();

        this.doRender();

        this.mPuzzle = new Puzzle( this, setPuzzleInfo, this.mCamera );

        this.clearWonLost();

        this.doRender();

        if ( setPuzzleInfo.mTitle != "" )
        {
            document.getElementById("Subtitle").innerHTML = "\"" + setPuzzleInfo.mTitle + "\"";
        } else
        {
            document.getElementById("Subtitle").innerHTML = "Puzzle Mode";
        }

        this.mPuzzle.updateLost( this );
        this.mPuzzle.updateWon( this );
    }

    this.mInputState = new InputState( this );
    this.initInput = function()
    {
        mGameInput = new GameInput(Game);
        mEditInput = new EditInput(Game);
        this.mInputState.addNotify( mGameInput, 0 );
        this.mInputState.addNotify( this.mCamera, 1 );
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
            this.mInputState.addNotify( mEditInput, 0 );

            this.clearWonLost();

            this.doRender();

            if ( this.mPuzzle )
            {
                this.mPuzzle.setEditMode( this, true );
            }

            this.mIngameOverlay.destroyRemainingFails( this );

            this.doRender();

            document.getElementById("Subtitle").innerHTML = "Edit Mode";

            var ControlsString = "<table class=\"Controls\">\n";
            ControlsString += generateControlEntry( "Click and Drag Mouse", "Rotate puzzle" );
            ControlsString += generateControlEntry( "Hold W, Click Mouse", "Add block" );
            ControlsString += generateControlEntry( "Hold X, Click Mouse", "Remove block" );
            ControlsString += generateControlEntry( "Click Arrow and Drag Mouse", "Peer into puzzle" );
            ControlsString += "<br/>";
            ControlsString += generateControlEntry( "Press S", "Save puzzle to textarea" );
            ControlsString += generateControlEntry( "Press E", "Toggle Edit Mode" );
            ControlsString += generateControlEntry( "Press D", "Toggle Debug Mode" );
            ControlsString += generateControlEntry( "Press G", "Toggle Show Guaranteed" );
            ControlsString += "</table>";
            document.getElementById("ControlsBody").innerHTML = ControlsString;

            document.getElementById("EditMode").className = "unhidden";
            document.getElementById("EditModeUI").className = "unhidden";
        } else
        {
            this.mInputState.removeNotify( mEditInput );
            this.mInputState.addNotify( mGameInput, 0 );
            
            if ( this.mPuzzle )
            {
                this.mPuzzle.setEditMode( this, false );
            }

            this.clearWonLost();

            if ( this.mPuzzle && this.mPuzzle.getTitle() != "" )
            {
                document.getElementById("Subtitle").innerHTML = "\"" + this.mPuzzle.getInfo().mTitle + "\"";
            } else
            {
                document.getElementById("Subtitle").innerHTML = "Puzzle Mode";
            }

            ControlsString = "<table class=\"Controls\">\n";
            ControlsString += generateControlEntry( "Click and Drag Mouse", "Rotate puzzle" );
            ControlsString += generateControlEntry( "Hold W, Click Mouse", "<span class=\"bold\">PAINT</span> block" );
            ControlsString += generateControlEntry( "Hold X, Click Mouse", "<span class=\"bold\">BREAK</span> block" );
            ControlsString += generateControlEntry( "Click Arrow and Drag Mouse", "Peer into puzzle" );
            ControlsString += generateControlEntry( "Press Z", "<span class=\"bold\">BREAK</span> all blocks with a 0 face" );
            ControlsString += "<br/>";
            ControlsString += generateControlEntry( "Press E", "Toggle Edit Mode" );
            ControlsString += generateControlEntry( "Press D", "Toggle Debug Mode" );
            ControlsString += generateControlEntry( "Press G", "Toggle Show Guaranteed" );
            ControlsString += "</table>";
            document.getElementById("ControlsBody").innerHTML = ControlsString;

            document.getElementById("EditMode").className = "hidden";
            document.getElementById("EditModeUI").className = "hidden";

            this.clearWonLost();

            this.doRender();
        }
    }

    this.savePuzzle = function()
    {
        document.getElementById("EditModePuzzleFile").innerHTML = savePuzzle( this, this.mPuzzle );
    }

    this.doRender = function()
    {
        if ( this.mClient )
        {
            this.mClient.render();
        }
    }

    this.getOnlyDimIfPainted = function()
    {
        return mOnlyDimIfPainted;
    }

    this.setOnlyDimIfPainted = function( Value )
    {
        mOnlyDimIfPainted = Value;
    }

    this.getHideUnneededFaces = function()
    {
        return mHideUnneededFaces;
    }

    this.setHideUnneededFaces = function( Value )
    {
        mHideUnneededFaces = Value;
    }
}

function getByDimIterator3( Array3, Location, Dimension, Iterator )
{
    if ( Dimension == 0 )
    {
        return Array3[ Iterator ][ Location[ 1 ] ][ Location[ 2 ] ];
    } else if ( Dimension == 1 )
    {
        return Array3[ Location[ 0 ] ][ Iterator ][ Location[ 2 ] ];
    } else
    {
        return Array3[ Location[ 0 ] ][ Location[ 1 ] ][ Iterator ];
    }
    return null;
}

function setByDimIterator3( Array3, Location, Dimension, Iterator, Value )
{
    if ( Dimension == 0 )
    {
        Array3[ Iterator ][ Location[ 1 ] ][ Location[ 2 ] ] = Value;
    } else if ( Dimension == 1 )
    {
        Array3[ Location[ 0 ] ][ Iterator ][ Location[ 2 ] ] = Value;
    } else
    {
        Array3[ Location[ 0 ] ][ Location[ 1 ] ][ Iterator ] = Value;
    }
}

function HexToDec( Hex )
{
    var Dec = 0;
    for( var travHex = 0; travHex < Hex.length; travHex ++ )
    {
        Dec = Dec * 16;
        if ( Hex[ travHex ].toLowerCase() == "a" )
        {
            Dec = Dec + 10;
        } else if ( Hex[ travHex ].toLowerCase() == "b" )
        {
            Dec = Dec + 11;
        } else if ( Hex[ travHex ].toLowerCase() == "c" )
        {
            Dec = Dec + 12;
        } else if ( Hex[ travHex ].toLowerCase() == "d" )
        {
            Dec = Dec + 13;
        } else if ( Hex[ travHex ].toLowerCase() == "e" )
        {
            Dec = Dec + 14;
        } else if ( Hex[ travHex ].toLowerCase() == "f" )
        {
            Dec = Dec + 15;
        } else
        {
            Dec = Dec + parseInt( Hex[ travHex ] );
        }
    }
    return Dec;
}

function WebColorToComponent( From )
{
    return [
        HexToDec( From[0] + From[1] ) / 255.0,
        HexToDec( From[2] + From[3] ) / 255.0,
        HexToDec( From[4] + From[5] ) / 255.0,
        1.0
    ];
}

function DecToHex( Dec, MinSize )
{
    var Hex = "";
    var Remainder = Dec;
    while( Remainder > 0 )
    {
        var Divisible = Math.floor( Remainder / 16 );
        Remainder = Remainder % 16;
        if ( Remainder == 10 )
        {
            Hex = "a" + Hex;
        } else if ( Remainder == 11 )
        {
            Hex = "b" + Hex;
        } else if ( Remainder == 12 )
        {
            Hex = "c" + Hex;
        } else if ( Remainder == 13 )
        {
            Hex = "d" + Hex;
        } else if ( Remainder == 14 )
        {
            Hex = "e" + Hex;
        } else if ( Remainder == 15 )
        {
            Hex = "f" + Hex;
        } else
        {
            Hex = Remainder + Hex;
        }
        Remainder = Divisible;
    }

    if ( MinSize != undefined )
    {
        while( Hex.length < MinSize )
        {
            Hex = "0" + Hex;
        }
    }

    return Hex;
}

function ComponentToWebColor( From )
{
    return(
        DecToHex( From[0] * 255, 2 ) +
        DecToHex( From[1] * 255, 2 ) +
        DecToHex( From[2] * 255, 2 )
    );
}

function destroyTransform( Game, Transform )
{
    if ( Game != null && Transform != null )
    {
        Transform.parent = Game.mClient.root;
        Game.mPack.removeObject( Transform );
        Transform.parent = null;
        Transform = null;
    }
}

function dupArray( Original )
{
    var Dup = [];
    for( var trav = 0; trav < Original.length; trav++ )
    {
        Dup[ trav ] = Original[ trav ];
    }
    return Dup;
}