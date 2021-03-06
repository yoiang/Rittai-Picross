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

    var travValues = 4;

    var BlocksZ = [];
    for( var travZ = 0; travZ < setPuzzleInfo.mDimensions[0]; travZ ++ )
    {
        var BlocksY = [];
        for( var travY = 0; travY < setPuzzleInfo.mDimensions[1]; travY ++ )
        {
            var BlocksX = [];
            for( var travX = 0; travX < setPuzzleInfo.mDimensions[2]; travX ++ )
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
    for( var travZ = 0; travZ < setPuzzleInfo.mDimensions[0]; travZ ++ )
    {
        var BlocksY = [];
        for( var travY = 0; travY < setPuzzleInfo.mDimensions[1]; travY ++ )
        {
            var BlocksX = [];
            for( var travX = 0; travX < setPuzzleInfo.mDimensions[2]; travX ++ )
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
        if ( PuzzleXML.children[travChildren].localName == "BackgroundColor" )
        {
            setPuzzleInfo.mBackgroundColor = readPuzzleXML3Color( PuzzleXML.children[travChildren] );
        } else if ( PuzzleXML.children[travChildren].localName == "PaintColor" )
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
    for( var trav0 = 0; trav0 < Dimensions[0]; trav0 ++ )
    {
        var Blocks1 = [];
        for( var trav1 = 0; trav1 < Dimensions[1]; trav1 ++ )
        {
            var Blocks2 = [];
            for( var trav2 = 0; trav2 < Dimensions[2]; trav2 ++ )
            {
                if ( travCubesDefinition < CubesXML.childElementCount )
                {
                    Blocks2[ trav2 ] = readPuzzleXML3Cube( CubesXML.children[travCubesDefinition], [ trav0, trav1, trav2 ] );
                    travCubesDefinition ++;
                } else
                {
                    Blocks2[ trav2 ] = null;
                }
            }
            Blocks1[ trav1 ] = Blocks2;
        }
        BlockDefinition[ trav0 ] = Blocks1;
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
    var Options = '<select id="puzzleSelect" name="puzzleSelect" onChange="selectPuzzle()">';
    Options += generatePuzzleOption( 'Select Puzzle' );
    for( var travPuzzleNames = 0; travPuzzleNames < gPuzzleNames.length; travPuzzleNames ++ )
    {
        Options += generatePuzzleOption( gPuzzleNames[ travPuzzleNames ] );
    }
    Options += '</select>';

    document.getElementById('puzzleSelectDiv').innerHTML = Options;
}

function generatePuzzleOption( FileName )
{
    return '<option value="' + FileName + '">' + FileName + '</option>';
}

function createXMLColorElement( XMLDoc, ElementName, Color )
{
    var ColorElement = XMLDoc.createElement( ElementName );

    var Red = XMLDoc.createElement("ns1:r");
    var Green = XMLDoc.createElement("ns1:g");
    var Blue = XMLDoc.createElement("ns1:b");
    var Alpha = XMLDoc.createElement("ns1:a");
    Red.textContent = "" + parseFloat( Color[0] );
    Green.textContent = "" + parseFloat( Color[1] );
    Blue.textContent = "" + parseFloat( Color[2] );
    Alpha.textContent = "" + parseFloat( Color[3] );

    ColorElement.appendChild( Red );
    ColorElement.appendChild( Green );
    ColorElement.appendChild( Blue );
    ColorElement.appendChild( Alpha );

    return ColorElement;
}

function createXMLCubeElement( XMLDoc, useCubeInfo )
{
    var Cube = XMLDoc.createElement( "ns1:Cube" );

    Cube.setAttribute( "Solid", useCubeInfo.mSolid );
    Cube.appendChild( createXMLColorElement( XMLDoc, "ns1:FinishedColor", useCubeInfo.mFinishedColor ) );

    return Cube;
}

function appendXMLCubeElement( Game, Puzzle, Location, ExtraParams )
{
    var XMLDoc = ExtraParams[ 0 ];
    var CubesElement = ExtraParams[ 1 ];
    var BlankCubeInfo = ExtraParams[ 2 ];

    var Test = Puzzle.getBlock( Location );
    if ( Test != null && Test.getSolid() )
    {
        CubesElement.appendChild( createXMLCubeElement( XMLDoc, Test.getInfo() ) );
    } else
    {
        CubesElement.appendChild( createXMLCubeElement( XMLDoc, BlankCubeInfo ) );
    }
}

function generatePuzzleXML( Game, Puzzle )
{
    var XMLDoc = document.implementation.createDocument("","",null);
    var PuzzleElement = XMLDoc.createElement("ns1:Puzzle");

    PuzzleElement.setAttribute( "Version", "3" );

    PuzzleElement.setAttribute( "Title", Puzzle.getTitle() );
    PuzzleElement.setAttribute( "XSize", Puzzle.getInfo().mDimensions[0] );
    PuzzleElement.setAttribute( "YSize", Puzzle.getInfo().mDimensions[1] );
    PuzzleElement.setAttribute( "ZSize", Puzzle.getInfo().mDimensions[2] );
    PuzzleElement.setAttribute( "AllowedFails", Puzzle.getInfo().mAllowedFails );

    PuzzleElement.setAttribute( "xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance" );
    PuzzleElement.setAttribute( "xmlns:ns1", "http://Rittai.Picross" );
    PuzzleElement.setAttribute( "xsi:schemaLocation", "http://Rittai.Picross file:/Users/Ian/workspace/Personal/Netbeans/Rittai%20Picross/src/js/Puzzle.xsd" );

    PuzzleElement.appendChild( createXMLColorElement( XMLDoc, "ns1:BackgroundColor", Puzzle.getBackgroundColor() ) );
    PuzzleElement.appendChild( createXMLColorElement( XMLDoc, "ns1:PaintColor", Puzzle.getPaintColor() ) );
    var CubesElement = XMLDoc.createElement( "ns1:Cubes" );

    var BlankCubeInfo = new CubeInfo();
    BlankCubeInfo.mSolid = false;

    Puzzle.travBlocks( Game, appendXMLCubeElement, [ XMLDoc, CubesElement, BlankCubeInfo ] );

    PuzzleElement.appendChild( CubesElement );

    XMLDoc.appendChild(PuzzleElement);

    return XMLDoc;
}

function savePuzzle( Game, Puzzle )
{
    var XMLDoc = generatePuzzleXML( Game, Puzzle );
    return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + (new XMLSerializer()).serializeToString( XMLDoc );
}