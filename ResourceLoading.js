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
        if ( gXMLHttp.responseXML &&
                gXMLHttp.responseXML.documentElement &&
                gXMLHttp.responseXML.documentElement.nodeName == "parsererror" )
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
        } else
        {
            if ( gXMLHttp.responseXML.documentElement.getAttribute("Version") == "3" )
            {
                loadPuzzleXML3( gXMLHttp.responseXML.documentElement );
            }
        }
    }
}

function loadPuzzleVersion1( PuzzleText )
{
    Clean = PuzzleText.replace(/\/\/.*$/img, ""); // remove comments
    Clean = Clean.replace(/\n/g, " "); // remove endlines
    Clean = Clean.replace(/\r/g, " "); // remove carriage returns
    
    var Values = Clean;
    do
    {
        Clean = Values;
        Values = Clean.replace(/  /g, " "); // remove double spaces to be safe with split
    }
    while( Values != Clean );
    if ( Values[0] == " " )
    {
	Values = Values.slice( 1 );
    }
    if ( Values[ Values.length - 1 ] == " " )
    {
	Values = Values.slice( 0, Values.length - 1 );
    }
    
    Values = Values.split(" ");

    var setPuzzleInfo = new PuzzleInfo();
    setPuzzleInfo.mDimensions = [ Values[1], Values[2], Values[3] ];
    setPuzzleInfo.mAllowedFails = parseInt( Values[0] );

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
                var Info = new CubeInfo();
                Info.mSolid = Values[ travValues ] == 1;
                Info.mPuzzleLocation = [ travZ, travY, travX ];

                BlocksX[ travX ] = Info;
                travValues ++;
            }
            BlocksY[ travY ] = BlocksX;
        }
        BlocksZ[ travZ ] = BlocksY;
    }

    setPuzzleInfo.mDimensions = [ X, Y, Z ];
    setPuzzleInfo.mBlockDefinition = BlocksZ;

    gGame.createPuzzle( setPuzzleInfo );
}

function getAssignmentValue( Assignments, Name )
{
    for( var travAssignments = 0; travAssignments + 1 < Assignments.length; travAssignments = travAssignments + 2 )
    {
        if ( Assignments[ travAssignments ] == Name )
        {
            return Assignments[ travAssignments + 1];
        }
    }
    return null;
}

function loadPuzzleVersion2( PuzzleText )
{
    Clean = PuzzleText.replace(/\/\/.*$/img, ""); // remove comments
    Clean = Clean.replace(/\r/g, ""); // remove carriage return
    var Assignments = Clean.split(/^[\s]*([\w]+)[ ]*=/im);
    var travAssignments = 0;
    if ( Assignments[travAssignments] == "" )
    {
        Assignments = Assignments.slice( 1 );
    }

    var setPuzzleInfo = new PuzzleInfo();

    setPuzzleInfo.mTitle = readTextBlock( getAssignmentValue(Assignments, "Title"));

    setPuzzleInfo.mAllowedFails = parseInt( getAssignmentValue( Assignments, "AllowedFails") );

    setPuzzleInfo.mDimensions = readIntegerArray( getAssignmentValue( Assignments, "Dimensions" ), 3 );

    BlockDefinition = readIntegerArray( getAssignmentValue( Assignments, "Puzzle") );

    setPuzzleInfo.mBlockDefinition = [];
    var travBlockDefinition = 0;
    for( var travZ = 0; travZ < setPuzzleInfo.mDimensions[2]; travZ ++ )
    {
        var BlocksY = [];
        for( var travY = 0; travY < setPuzzleInfo.mDimensions[1]; travY ++ )
        {
            var BlocksX = [];
            for( var travX = 0; travX < setPuzzleInfo.mDimensions[0]; travX ++ )
            {
                var Info = new CubeInfo();
                Info.mSolid = BlockDefinition[ travBlockDefinition ] == 1;
                Info.mPuzzleLocation = [ travZ, travY, travX ];

                BlocksX[ travX ] = Info;
                travBlockDefinition ++;
            }
            BlocksY[ travY ] = BlocksX;
        }
        setPuzzleInfo.mBlockDefinition[ travZ ] = BlocksY;
    }

    setPuzzleInfo.mPaintColor = readFloatArray( getAssignmentValue( Assignments, "PaintColor" ), 4 );

    gGame.createPuzzle( setPuzzleInfo );
    
}

function cleanSquareBlock( cleanUp )
{
    if ( cleanUp == null )
    {
        return "";
    }
    var Clean = cleanUp.match(/\[[\d\s\,]+?\]/img); // TODO: match only within [ ] so don't have to remove later
    if ( Clean == null )
    {
        return "";
    }

    Clean = Clean[0].replace(/\n/g," ");
    Clean = Clean.replace(/\r/g, " ");
    Clean = Clean.replace(/,/g," ");
    Clean = Clean.replace(/\[/g, "" );
    Clean = Clean.replace(/\]/g, "" );
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
    if ( Values[ Values.length - 1 ] == " " )
    {
	Values = Values.slice( 0, Values.length - 1 );
    }
    return Values;
}

function readIntegerArray( fromString, ExpectedLength )
{
    Values = cleanSquareBlock( fromString ).split( " " );
    for( var travValues = 0; travValues < Values.length; travValues ++ )
    {
        Values[travValues] = parseInt(Values[travValues]);
    }
    
    if ( ExpectedLength != undefined )
    {
        while( Values.length < ExpectedLength )
        {
            Values[ Values.length ] = 0;
        }
        while( Values.length > ExpectedLength )
        {
            Values.pop();
        }
    }

    return Values;
}

function readFloatArray( fromString, ExpectedLength )
{
    Values = cleanSquareBlock( fromString ).split( " " );
    for( var travValues = 0; travValues < Values.length; travValues ++ )
    {
        Values[travValues] = parseFloat(Values[travValues]);
    }

    if ( ExpectedLength != undefined )
    {
        while( Values.length < ExpectedLength )
        {
            Values[ Values.length ] = 0.0;
        }
        while( Values.length > ExpectedLength )
        {
            Values.pop();
        }
    }

    return Values;
}

function readTextBlock( fromString )
{
    var Clean = fromString.match(/"[\w\s]+?"/img);
    if ( Clean == null )
    {
        return "";
    }

    Clean = Clean[0].replace(/\"/g, "");
    return Clean;
}

function loadPuzzleXML3( PuzzleXML )
{
    var setPuzzleInfo = new PuzzleInfo();

    setPuzzleInfo.mTitle = PuzzleXML.getAttribute("Title");
    setPuzzleInfo.mAllowedFails = PuzzleXML.getAttribute("AllowedFails");
    setPuzzleInfo.mDimensions = [
        PuzzleXML.getAttribute("XSize"),
        PuzzleXML.getAttribute("YSize"),
        PuzzleXML.getAttribute("ZSize")
    ];

    for ( var travChildren = 0; travChildren < PuzzleXML.childElementCount; travChildren ++ )
    {
        if ( PuzzleXML.children[travChildren].localName == "PaintColor" )
        {
            setPuzzleInfo.mPaintColor = readPuzzleXML3Color( PuzzleXML.children[travChildren] );
        } else if ( PuzzleXML.children[travChildren].localName == "Cubes" )
        {
            setPuzzleInfo.mBlockDefinition = readPuzzleXML3Cubes( PuzzleXML.children[travChildren], setPuzzleInfo.mDimensions );
        }
    }

    gGame.createPuzzle( setPuzzleInfo );
}

function readPuzzleXML3Color( ColorXML )
{
    return [ parseFloat( ColorXML.children[0].textContent ), parseFloat( ColorXML.children[1].textContent ), parseFloat( ColorXML.children[2].textContent ), parseFloat( ColorXML.children[3].textContent ) ];
}

function readPuzzleXML3Cubes( CubesXML, Dimensions )
{
    var BlockDefinition = [];
    var travCubesDefinition = 0;
    for( var travZ = 0; travZ < Dimensions[2]; travZ ++ )
    {
        var BlocksY = [];
        for( var travY = 0; travY < Dimensions[1]; travY ++ )
        {
            var BlocksX = [];
            for( var travX = 0; travX < Dimensions[0]; travX ++ )
            {
                if ( travCubesDefinition < CubesXML.childElementCount )
                {
                    BlocksX[ travX ] = readPuzzleXML3Cube( CubesXML.children[travCubesDefinition], [ travZ, travY, travX ] );
                    travCubesDefinition ++;
                } else
                {
                    BlocksX[ travX ] = null;
                }
            }
            BlocksY[ travY ] = BlocksX;
        }
        BlockDefinition[ travZ ] = BlocksY;
    }
    return BlockDefinition;
}

function readPuzzleXML3Cube( CubeXML, setPuzzleLocation )
{
    var setCubeInfo = new CubeInfo();

    setCubeInfo.mSolid = CubeXML.getAttribute( "Solid" ) == "true";
    setCubeInfo.mPuzzleLocation = setPuzzleLocation;
    for ( var travChildren = 0; travChildren < CubeXML.childElementCount; travChildren ++ )
    {
        if ( CubeXML.children[travChildren].localName == "FinishedColor" )
        {
            setCubeInfo.mFinishedColor = readPuzzleXML3Color( CubeXML.children[travChildren] );
        }
    }

    return setCubeInfo;
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
    'puzzles/Debug/Test.xml',
    'puzzles/Debug/test2.rittai',
    '',
    'puzzles/Tutorial/1 - Break a Block.rittai',
    'puzzles/Tutorial/2 - Break a Block, Save a Block.rittai',
    '',
    'puzzles/HollowCube.rittai',
    'puzzles/TakeNote.xml'
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