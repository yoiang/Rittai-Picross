var gNumberTexture = null;
var gNumberTextureException = null;
var gSymbolTexture = null;
var gSymbolTextureException = null;
var gIndicatorPaintTexture = null;
var gIndicatorPaintTextureException = null;
var gIndicatorBreakTexture = null;
var gIndicatorBreakTextureException = null;

var gXMLHttp = null;

function loadTextures(Game)
{
    o3djs.io.loadTexture(Game.mPack, Game.mPath + 'images/numbers.png', loadTextureNumbersCallback);
    o3djs.io.loadTexture(Game.mPack, Game.mPath + 'images/symbols.png', loadTextureSymbolsCallback);
    o3djs.io.loadTexture(Game.mPack, Game.mPath + 'images/indicator_paint.png', loadTextureIndicatorPaintCallback);
    o3djs.io.loadTexture(Game.mPack, Game.mPath + 'images/indicator_break.png', loadTextureIndicatorBreakCallback);
}

function loadTextureNumbersCallback( texture, exception )
{
    gNumberTexture = texture;
    gNumberTextureException = exception;
    checkAllTexturesLoaded();
}

function loadTextureSymbolsCallback( texture, exception )
{
    gSymbolTexture = texture;
    gSymbolTextureException = exception;
    checkAllTexturesLoaded();
}

function loadTextureIndicatorPaintCallback( texture, exception )
{
    gIndicatorPaintTexture = texture;
    gIndicatorPaintTextureException = exception;
    checkAllTexturesLoaded();
}

function loadTextureIndicatorBreakCallback( texture, exception )
{
    gIndicatorBreakTexture = texture;
    gIndicatorBreakTextureException = exception;
    checkAllTexturesLoaded();
}

function checkAllTexturesLoaded()
{
    if ( gNumberTexture && gSymbolTexture && gIndicatorPaintTexture && gIndicatorBreakTexture )
    {
        initStep3();
    }
}

function loadPuzzle( URL )
{
    if ( URL == '' || URL == 'Select Puzzle' )
    {
        return;
    }

    if ( gXMLHttp == null )
    {
        // Provide the XMLHttpRequest class for IE 5.x-6.x:
        // Other browsers (including IE 7.x-8.x) ignore this
        //   when XMLHttpRequest is predefined
        if (typeof(XMLHttpRequest) == "undefined") {
            XMLHttpRequest = function() {
                try {
                    return new ActiveXObject("Msxml2.XMLHTTP.6.0");
                }
                catch(e) {}
                try {
                    return new ActiveXObject("Msxml2.XMLHTTP.3.0");
                }
                catch(e) {}
                try {
                    return new ActiveXObject("Msxml2.XMLHTTP");
                }
                catch(e) {}
                try {
                    return new ActiveXObject("Microsoft.XMLHTTP");
                }
                catch(e) {}
                throw new Error("This browser does not support XMLHttpRequest.");
            };
        }

        gXMLHttp = new XMLHttpRequest();
    }

    gXMLHttp.open( "GET", URL, true );
    gXMLHttp.onreadystatechange = loadPuzzleFinished;
    gXMLHttp.send( null );
}

function loadPuzzleFinished()
{
    if (gXMLHttp.readyState==4)
    {
        var Result = gXMLHttp.responseText.toString();
        Result = Result.replace(/\n/g, " ");
        Result = Result.replace(/  /g, " ");
        Values = Result.split(" ");
        var FailAttempts = Values[0];
        var X = Values[1];
        var Y = Values[2];
        var Z = Values[3];
        var travValues = 4;

        var BlocksZ = [];
        for( var travZ = 0; travZ < Z; travZ ++ )
        {
            var BlocksY = [];
            for( var travY = 0; travY < Y; travY ++ )
            {
                var BlocksX = [];
                for( var travX = 0; travX < X; travX ++ )
                {
                    BlocksX[ travX ] = Values[ travValues ];
                    travValues ++;
                }
                BlocksY[ travY ] = BlocksX;
            }
            BlocksZ[ travZ ] = BlocksY;
        }
        gGame.createPuzzle( BlocksZ, FailAttempts)
    }
}

function selectPuzzle()
{
    loadPuzzle( document.getElementById("puzzleSelect").value );
}

function PuzzleManualSelect()
{
    loadPuzzle( document.getElementById('url').value )
}

function fillPuzzleList()
{
    var PuzzleNames = [
    'One.rittai',
    'test.rittai',
    'test2.rittai',
    'HollowCube.rittai',
    'puzzles/TakeNote.rittai'
    ];

    //TODO: can I request a file list???
    var Options = '<select id="puzzleSelect" name="puzzleSelect" onChange="selectPuzzle()">';
    Options += generatePuzzleOption( 'Select Puzzle' );
    for( var travPuzzleNames = 0; travPuzzleNames < PuzzleNames.length; travPuzzleNames ++ )
    {
        Options += generatePuzzleOption( PuzzleNames[ travPuzzleNames ] );
    }
    Options += '</select>';

    document.getElementById('puzzleSelectDiv').innerHTML = Options;
}

function generatePuzzleOption( FileName )
{
    return '<option value="' + FileName + '">' + FileName + '</option>';
}