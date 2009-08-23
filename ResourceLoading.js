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
        var Version = Result[0];
        Result = Result.slice( 2 ); // assume version number and endline
        if ( Version == "1" )
        {
            loadPuzzleVersion1( Result );
        } else if ( Version == "2" )
        {
            loadPuzzleVersion2( Result );
        }
    }
}

function loadPuzzleVersion1( PuzzleText )
{
    Clean = PuzzleText.replace(/\/\/.*$/img, ""); // remove comments
    Clean = Clean.replace(/\n/g, " "); // remove endlines
    
    var Values = Clean;
    do
    {
        Clean = Values;
        Values = Clean.replace(/  /g, " "); // remove double spaces to be safe with split
    }
    while( Values != Clean );
    
    Values = Values.split(" ");

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

function loadPuzzleVersion2( PuzzleText )
{
    Clean = PuzzleText.replace(/\/\/.*$/img, ""); // remove comments
    var Assignments = Clean.split(/^[\s]*([\w]+)[ ]*=/im);
    var travAssignments = 0;
    if ( Assignments[travAssignments] == "" )
    {
        travAssignments ++;
    }

    var FailAttempts = 0;
    var X = 0;
    var Y = 0;
    var Z = 0;
    var BlocksZ = [];

    while ( travAssignments + 1 < Assignments.length )
    {
        if ( Assignments[travAssignments] == "FailAttempts" )
        {
            FailAttempts = parseInt( Assignments[travAssignments + 1] );
        } else if ( Assignments[travAssignments] == "Dimensions" )
        {
            Dimensions = cleanSquareBlock( Assignments[travAssignments + 1] ).split(" ");
            X = parseInt( Dimensions[0] );
            Y = parseInt( Dimensions[1] );
            Z = parseInt( Dimensions[2] );
        } else if ( Assignments[travAssignments] == "Puzzle" )
        {
            BlockDefinition = cleanSquareBlock( Assignments[travAssignments + 1] ).split(" ");

            var travBlockDefinition = 0;
            for( var travZ = 0; travZ < Z; travZ ++ )
            {
                var BlocksY = [];
                for( var travY = 0; travY < Y; travY ++ )
                {
                    var BlocksX = [];
                    for( var travX = 0; travX < X; travX ++ )
                    {
                        BlocksX[ travX ] = BlockDefinition[ travBlockDefinition ];
                        travBlockDefinition ++;
                    }
                    BlocksY[ travY ] = BlocksX;
                }
                BlocksZ[ travZ ] = BlocksY;
            }
        }
        travAssignments += 2;
    }

    gGame.createPuzzle( BlocksZ, FailAttempts);
    
}

function cleanSquareBlock( cleanUp )
{
    var Clean = cleanUp.replace(/\[/g,"");
    Clean = Clean.replace(/\]/g,"");
    Clean = Clean.replace(/\n/g,"");
    Clean = Clean.replace(/,/g," ");
    var Values = Clean;
    do
    {
        Clean = Values;
        Values = Clean.replace(/  /g, " "); // remove double spaces to be safe with split
    }
    while( Values != Clean );
    
    if( Values[0] == " " )
    {
        Values = Values.slice(1);
    }

    return Values;
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
    'puzzles/Debug/One.rittai',
    'puzzles/Debug/test.rittai',
    'puzzles/Debug/test2.rittai',
    '',
    'puzzles/Tutorial/1 - Break a Block.rittai',
    'puzzles/Tutorial/2 - Break a Block, Save a Block.rittai',
    '',
    'puzzles/HollowCube.rittai',
    'puzzles/TakeNote.rittai'
    ];

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