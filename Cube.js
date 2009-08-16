var gTransformToCube = null; // associate a transform with a cube

var gFaceShapes = null;

var gMaterial = null;
var gEffect = null;

function Cube( Game, Puzzle, Solid, PuzzleLocX, PuzzleLocY, PuzzleLocZ )
{
    this.mRows = null;
    this.mSolid = Solid;
    this.mFailedBreak = false;
    this.mPainted = false;

    this.mPuzzle = Puzzle;
    this.mPuzzleLocX = PuzzleLocX;
    this.mPuzzleLocY = PuzzleLocY;
    this.mPuzzleLocZ = PuzzleLocZ;

    this.mFaceInstances = null;
    this.mTransform = null;
    this.mDrawElement = null;

    this.createShape = function(Game, Solid)
    {
        if ( gFaceShapes == null )
        {
            gFaceShapes = [];
            for( var travFaces = 0; travFaces < 6; travFaces ++ )
            {
                gFaceShapes[travFaces] = new Face( Game, Game.mPack.createObject('Shape'), travFaces );
            }
        }

        this.mTransform = Game.mPack.createObject('Transform');

        this.mFaceInstances = [];
        for( travFaces = 0; travFaces < 6; travFaces ++ )
        {
            this.mFaceInstances[travFaces] = new FaceInstance( Game, gFaceShapes[travFaces].mShape, Solid, this.mTransform );
        }

        this.mTransform.parent = Game.mClient.root;

        gTransformToCube[ gTransformToCube.length ] = [ this.mTransform, this ];
    };
    this.createShape( Game, Solid );

    this.setRows = function( Game, RowX, RowY, RowZ )
    {
        this.mRows = [ RowX, RowY, RowZ ];

        this.mFaceInstances[4].setNumber(RowX.getNumber());
        this.mFaceInstances[5].setNumber(RowX.getNumber());
        this.mFaceInstances[4].setNonadjacentSpaces(RowX.getNonadjacentSpaces());
        this.mFaceInstances[5].setNonadjacentSpaces(RowX.getNonadjacentSpaces());

        this.mFaceInstances[1].setNumber(RowY.getNumber());
        this.mFaceInstances[3].setNumber(RowY.getNumber());
        this.mFaceInstances[1].setNonadjacentSpaces(RowY.getNonadjacentSpaces());
        this.mFaceInstances[3].setNonadjacentSpaces(RowY.getNonadjacentSpaces());

        this.mFaceInstances[0].setNumber(RowZ.getNumber());
        this.mFaceInstances[2].setNumber(RowZ.getNumber());
        this.mFaceInstances[0].setNonadjacentSpaces(RowZ.getNonadjacentSpaces());
        this.mFaceInstances[2].setNonadjacentSpaces(RowZ.getNonadjacentSpaces());
    }

    this.togglePainted = function( )
    {
        this.mPainted = !this.mPainted;
        for( var travFaces = 0; travFaces < 6; travFaces ++ )
        {
            this.mFaceInstances[ travFaces ].togglePainted();
        }
    }

    this.tryBreak = function( Game )
    {
        if ( this.mPainted || this.mFailedBreak )
        {
            return;
        }
        
        if ( this.mSolid )
        {
            this.mPuzzle.triedBreakSolid( Game, this );
        } else
        {
            this.mPuzzle.breakSpace( Game, this );
        }
    }

    this.setFailedBreak = function( Value)
    {
        for( var travFaces = 0; travFaces < 6; travFaces ++ )
        {
            this.mFaceInstances[ travFaces ].setFailedBreak(Value);
        }
    }
    
    this.getSolid = function()
    {
        return this.mSolid;
    }

    this.setDebug = function(Value)
    {
        for( var travFaces = 0; travFaces < 6; travFaces ++ )
        {
            this.mFaceInstances[ travFaces ].setDebug( Value );
        }
    }

    this.destroy = function( Game )
    {
        for( var travFaces = 0; travFaces < 6; travFaces ++ )
        {
            // this.mFaceInstances[ travFaces ].destroy();
            this.mFaceInstances[ travFaces ] = null;
        }

        Game.mPack.removeObject(this.mTransform);
        this.mTransform.parent = null;
        this.mTransform = null;
    }
}

function FaceInstance( Game, Shape, Solid, ParentTransform )
{
    this.mTransform = null;
    this.mShape = null;

    this.mNumberParam = null;
    this.mNonadjacentSpacesParam = null;

    this.mFailedBreakParam = null;
    this.mPaintedParam = null;

    this.mSolidParam = null;
    this.mDebugParam = null;

    this.init = function( Game, Shape, Solid, ParentTransform )
    {
        this.mTransform = Game.mPack.createObject('Transform');
        this.mShape = Shape;

        this.mTransform.addShape( this.mShape );

        this.mNumberParam = this.mTransform.createParam('Number', 'ParamInteger');
        this.mNumberParam.value = 10;
        this.mNonadjacentSpacesParam = this.mTransform.createParam('NonadjacentSpaces', 'ParamInteger');
        this.mNonadjacentSpacesParam.value = 0;

        this.mFailedBreakParam = this.mTransform.createParam('FailedBreak', 'ParamBoolean');
        this.mFailedBreakParam.value = false;
        this.mPaintedParam = this.mTransform.createParam('Painted', 'ParamBoolean');
        this.mPaintedParam.value = false;

        this.mSolidParam = this.mTransform.createParam('Solid', 'ParamBoolean');
        this.mSolidParam.value = Solid;
        this.mDebugParam = this.mTransform.createParam('Debug', 'ParamBoolean');
        this.mDebugParam.value = false;

        this.mTransform.parent = ParentTransform;
    }
    this.init( Game, Shape, Solid, ParentTransform );

    this.setNumber = function( Value )
    {
        this.mNumberParam.value = Value;
    }
    this.setNonadjacentSpaces = function( Value )
    {
        this.mNonadjacentSpacesParam.value = Value;
    }

    this.setFailedBreak = function( Value )
    {
        this.mFailedBreakParam.value = Value;
    }
    this.setPainted = function( Value )
    {
        this.mPaintedParam.value = Value;
    }
    this.getPainted = function()
    {
        return this.mPaintedParam.value;
    }
    this.togglePainted = function()
    {
        this.setPainted( !this.getPainted() );
    }

    this.setSolid = function( Value )
    {
        this.mSolidParam.value = Value;
    }
    this.setDebug = function( Value )
    {
        this.mDebugParam.value = Value;
    }
    this.getDebug = function()
    {
        return this.mDebugParam.value;
    }
    this.toggleDebug = function()
    {
        this.setDebug(!this.getDebug());
    }
}

var gVerticesArray = null;
var gIndicesArray = null;

function Face( Game, Shape, FIndex )
{
    this.mPrimitive = null;
    this.mDrawElement = null;
    this.mStreamBank = null;
    this.mMaterial = null;
    this.mShape = null;

    this.init = function( Game, Shape, FIndex )
    {
        // Create the Primitive that will contain the geometry data for
        // the cube.
        this.mPrimitive = Game.mPack.createObject('Primitive');
        this.mShape = Shape;
        this.mPrimitive.owner = this.mShape;

        this.mDrawElement = this.mPrimitive.createDrawElement(Game.mPack, null);

        this.mPrimitive.primitiveType = Game.mO3d.Primitive.TRIANGLELIST;
        this.mPrimitive.numberPrimitives = 2;

        var VerticesArray = this.getVerticesArray( Game, FIndex );
        this.mPrimitive.numberVertices = 4; //VerticesArray.length / 3;

        if ( gIndicesArray == null )
        {
            gIndicesArray = Game.mPack.createObject('IndexBuffer');
            gIndicesArray.set([
                                0, 1, 2,
                                0, 2, 3 ]);
        }
        this.mStreamBank = Game.mPack.createObject('StreamBank');
        this.mStreamBank.setVertexStream(
            Game.mO3d.Stream.POSITION, // semantic: This stream stores vertex positions
            0,                     // semantic index: First (and only) position stream
            VerticesArray,        // field: the field this stream uses.
            0);                    // start_index: How many elements to skip in the
        //     field.

        var texCoordsArray = [
            0, 0,
            1, 0,
            1, 1,
            0, 1
        ];

        var texCoordsBuffer = Game.mPack.createObject('VertexBuffer');
        var texCoordsField = texCoordsBuffer.createField('FloatField', 2);
        texCoordsBuffer.set(texCoordsArray);

        // Associate the texture coordinates buffer with the primitive.
        this.mStreamBank.setVertexStream(
            Game.mO3d.Stream.TEXCOORD,  // semantic
            0,                      // semantic index
            texCoordsField,         // field
            0);                     // start_index

        this.mPrimitive.streamBank = this.mStreamBank;

        // Associate the triangle indices Buffer with the primitive.
        this.mPrimitive.indexBuffer = gIndicesArray;

        this.mMaterial = new CubeMaterial( Game );
        this.mPrimitive.material = gMaterial;
    }

    this.getVerticesArray = function( Game, FIndex )
    {
        if ( gVerticesArray == null )
        {
            gVerticesArray = [];

            var VerticesBuffer = Game.mPack.createObject('VertexBuffer');
            gVerticesArray[0] = VerticesBuffer.createField('FloatField', 3);
            VerticesBuffer.set([
                0, 0, 1,
                1, 0, 1,
                1, 1, 1,
                0, 1, 1 ]);

            VerticesBuffer = Game.mPack.createObject('VertexBuffer');
            gVerticesArray[1] = VerticesBuffer.createField('FloatField', 3);
            VerticesBuffer.set([
                0, 1, 1,
                1, 1, 1,
                1, 1, 0,
                0, 1, 0 ]);

            VerticesBuffer = Game.mPack.createObject('VertexBuffer');
            gVerticesArray[2] = VerticesBuffer.createField('FloatField', 3);
            VerticesBuffer.set([
                0, 1, 0,
                1, 1, 0,
                1, 0, 0,
                0, 0, 0 ]);

            VerticesBuffer = Game.mPack.createObject('VertexBuffer');
            gVerticesArray[3] = VerticesBuffer.createField('FloatField', 3);
            VerticesBuffer.set([
                0, 0, 0,
                1, 0, 0,
                1, 0, 1,
                0, 0, 1 ]);

            VerticesBuffer = Game.mPack.createObject('VertexBuffer');
            gVerticesArray[4] = VerticesBuffer.createField('FloatField', 3);
            VerticesBuffer.set([
                1, 0, 1,
                1, 0, 0,
                1, 1, 0,
                1, 1,  1 ]);

            VerticesBuffer = Game.mPack.createObject('VertexBuffer');
            gVerticesArray[5] = VerticesBuffer.createField('FloatField', 3);
            VerticesBuffer.set([
                0, 0, 0,
                0, 0, 1,
                0, 1, 1,
                0, 1, 0 ]);
        }
        return gVerticesArray[ FIndex ];
    }

    this.getMaterial = function()
    {
        return this.mMaterial;
    }

    this.init( Game, Shape, FIndex );
}

function RowInfo( Row )
{
    this.mRow = Row;
    this.mNumber = 0;
    this.mNonadjacentSpaces = 0;
    this.updateCounts = function()
    {
        this.mNumber = 0;
        this.mNonadjacentSpaces = 0;
        var LastBlockWasSpace = false;
        for( var travRow = 0; travRow < this.mRow.length; travRow ++ )
        {
            if ( this.mRow[ travRow ] == 1 )
            {
                this.mNumber ++;
                LastBlockWasSpace = false;
            } else
            {
                if ( this.mNumber > 0 && !LastBlockWasSpace )
                {
                    this.mNonadjacentSpaces ++;
                    LastBlockWasSpace = true;
                }
            }
        }
        if ( LastBlockWasSpace )
        {
            this.mNonadjacentSpaces --;
        }
    }
    this.updateCounts();

    this.getNumber = function()
    {
        return this.mNumber;
    }

    this.getNonadjacentSpaces = function()
    {
        return this.mNonadjacentSpaces;
    }
}

function CubeMaterial( Game )
{
    this.mMaterial = null;
    this.mEffect = null;

    this.mNumberParam = null;
    this.mNonadjacentSpacesParam = null;

    this.mFailedBreakParam = null;
    this.mPaintedParam = null;

    this.mSolidParam = null;
    this.mDebugParam = null;

    this.mNumberTexSampler = null;
    this.mSymbolTexSampler = null;

    this.init = function(Game)
    {
        if ( gMaterial == null )
        {
            gMaterial =  Game.mPack.createObject('Material');
            gMaterial.drawList = Game.mViewInfo.performanceDrawList;

            gEffect = Game.mPack.createObject('Effect');
            o3djs.effect.loadEffect( gEffect, 'Cube.shader');
            gMaterial.effect = gEffect;

            gEffect.createUniformParameters(gMaterial);
        }
        

        this.mNumberParam = gMaterial.getParam('Number');
        this.mNumberParam.value = 10;
        this.mNonadjacentSpacesParam = gMaterial.getParam('NonadjacentSpaces');
        this.mNonadjacentSpacesParam.value = 0;

        this.mFailedBreakParam = gMaterial.getParam('FailedBreak');
        this.mFailedBreakParam.value = false;
        this.mPaintedParam = gMaterial.getParam('Painted');
        this.mPaintedParam.value = false;

        this.mSolidParam = gMaterial.getParam('Solid');
        this.mSolidParam.value = false;
        this.mDebugParam = gMaterial.getParam('Debug');
        this.mDebugParam.value = false;

        var NumberSamplerParam = gMaterial.getParam('NumberTexSampler');
        this.mNumberTexSampler = Game.mPack.createObject('Sampler');
        this.mNumberTexSampler.minFilter = Game.mO3d.Sampler.ANISOTROPIC;
        this.mNumberTexSampler.maxAnisotropy = 4;
        NumberSamplerParam.value = this.mNumberTexSampler;

        var SymbolSamplerParam = gMaterial.getParam('SymbolTexSampler');
        this.mSymbolTexSampler = Game.mPack.createObject('Sampler');
        this.mSymbolTexSampler.minFilter = Game.mO3d.Sampler.ANISOTROPIC;
        this.mSymbolTexSampler.maxAnisotropy = 4;
        SymbolSamplerParam.value = this.mSymbolTexSampler;

        // TODO: handle better yo
        this.mNumberTexSampler.texture = gNumberTexture;
        this.mSymbolTexSampler.texture = gSymbolTexture;
    }
    this.init(Game);

    this.setNumber = function( Value )
    {
        this.mNumberParam.value = Value;
    }
    this.setNonadjacentSpaces = function( Value )
    {
        this.mNonadjacentSpacesParam.value = Value;
    }

    this.setFailedBreak = function( Value )
    {
        this.mFailedBreakParam.value = Value;
    }
    this.setPainted = function( Value )
    {
        this.mPaintedParam.value = Value;
    }
    this.getPainted = function()
    {
        return this.mPaintedParam.value;
    }
    this.togglePainted = function()
    {
        this.setPainted( !this.getPainted() );
    }

    this.setSolid = function( Value )
    {
        this.mSolidParam.value = Value;
    }
    this.setDebug = function( Value )
    {
        this.mDebugParam.value = Value;
    }
    this.getDebug = function()
    {
        return this.mDebugParam.value;
    }
    this.toggleDebug = function()
    {
        this.setDebug(!this.getDebug());
    }

    this.setNumbersTexture = function( Value )
    {
        this.mNumberTexSampler.texture = Value;
    }
    this.setSymbolsTexture = function( Value )
    {
        this.mSymbolTexSampler.texture = Value;
    }
}