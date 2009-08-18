var gShapeToCube = []; // associate a shape with a cube

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

    this.mShape = null;
    this.mFaces = null;
    this.mTransform = null;
    this.mDrawElement = null;

    this.createShape = function(Game)
    {
        // Create a Shape object for the mesh.
        this.mShape = Game.mPack.createObject('Shape');
        gShapeToCube[ gShapeToCube.length ] = [ this.mShape, this ];

        this.mFaces = [];
        for( var travFaces = 0; travFaces < 6; travFaces ++ )
        {
            this.mFaces[ travFaces ] = new Face( Game, this.mShape, travFaces );
            this.mFaces[ travFaces ].getMaterial().setSolid(this.mSolid);
        }

        // Create a new transform and parent the Shape under it.
        this.mTransform = Game.mPack.createObject('Transform');
        this.mTransform.addShape(this.mShape);

        this.mTransform.parent = Game.mClient.root;
    };
    this.createShape( Game );

    this.setNumbersTexture = function( Value )
    {
        for( var travFaces = 0; travFaces < 6; travFaces ++ )
        {
            this.mFaces[ travFaces ].getMaterial().setNumbersTexture( Value );
        }
    }

    this.setSymbolsTexture = function( Value )
    {
        for( var travFaces = 0; travFaces < 6; travFaces ++ )
        {
            this.mFaces[ travFaces ].getMaterial().setSymbolsTexture( Value );
        }
    }

    this.setRows = function( Game, RowX, RowY, RowZ )
    {
        this.mRows = [ RowX, RowY, RowZ ];

        this.mFaces[4].getMaterial().setNumber(RowX.getNumber());
        this.mFaces[5].getMaterial().setNumber(RowX.getNumber());
        this.mFaces[4].getMaterial().setNonadjacentSpaces(RowX.getNonadjacentSpaces());
        this.mFaces[5].getMaterial().setNonadjacentSpaces(RowX.getNonadjacentSpaces());

        this.mFaces[1].getMaterial().setNumber(RowY.getNumber());
        this.mFaces[3].getMaterial().setNumber(RowY.getNumber());
        this.mFaces[1].getMaterial().setNonadjacentSpaces(RowY.getNonadjacentSpaces());
        this.mFaces[3].getMaterial().setNonadjacentSpaces(RowY.getNonadjacentSpaces());

        this.mFaces[0].getMaterial().setNumber(RowZ.getNumber());
        this.mFaces[2].getMaterial().setNumber(RowZ.getNumber());
        this.mFaces[0].getMaterial().setNonadjacentSpaces(RowZ.getNonadjacentSpaces());
        this.mFaces[2].getMaterial().setNonadjacentSpaces(RowZ.getNonadjacentSpaces());
    }

    this.togglePainted = function( )
    {
        this.mPainted = !this.mPainted;
        for( var travFaces = 0; travFaces < 6; travFaces ++ )
        {
            this.mFaces[ travFaces ].getMaterial().togglePainted();
        }
    }

    this.setFailedBreak = function( Value)
    {
        for( var travFaces = 0; travFaces < 6; travFaces ++ )
        {
            this.mFaces[ travFaces ].getMaterial().setFailedBreak(Value);
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
            this.mFaces[ travFaces ].getMaterial().setDebug( Value );
        }
    }

    this.getPainted = function()
    {
        return this.mPainted;
    }

    this.getFailedBreak = function()
    {
        return this.mFailedBreak;
    }

    this.destroy = function( Game )
    {
/*        for( var travFaces = 0; travFaces < 6; travFaces ++ )
        {
            this.mFaces[ travFaces ].destroy();
        }
*/
        Game.mPack.removeObject(this.mShape);
        Game.mPack.removeObject(this.mTransform);
        this.mTransform.parent = null;
        this.mTransform = null;
        this.mShape = null;
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

    this.init = function( Game, Shape, FIndex )
    {
        // Create the Primitive that will contain the geometry data for
        // the cube.
        this.mPrimitive = Game.mPack.createObject('Primitive');
        this.mPrimitive.owner = Shape;

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
        this.mPrimitive.material = this.mMaterial.mMaterial;
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

    this.mPaintedColorParam = null;
    this.mDebugSolidColorParam = null;
    this.mDebugSpaceColorParam = null;

    this.init = function(Game)
    {
        this.mMaterial = Game.mPack.createObject('Material');
        
        this.mMaterial.drawList = Game.mViewInfo.performanceDrawList;

        this.mEffect = Game.mPack.createObject('Effect');
        o3djs.effect.loadEffect( this.mEffect, 'Cube.shader');
        this.mMaterial.effect = this.mEffect;

        this.mEffect.createUniformParameters(this.mMaterial);

        this.mNumberParam = this.mMaterial.getParam('Number');
        this.mNumberParam.value = 10;
        this.mNonadjacentSpacesParam = this.mMaterial.getParam('NonadjacentSpaces');
        this.mNonadjacentSpacesParam.value = 0;

        this.mFailedBreakParam = this.mMaterial.getParam('FailedBreak');
        this.mFailedBreakParam.value = false;
        this.mPaintedParam = this.mMaterial.getParam('Painted');
        this.mPaintedParam.value = false;

        this.mSolidParam = this.mMaterial.getParam('Solid');
        this.mSolidParam.value = false;
        this.mDebugParam = this.mMaterial.getParam('Debug');
        this.mDebugParam.value = false;

        var NumberSamplerParam = this.mMaterial.getParam('NumberTexSampler');
        this.mNumberTexSampler = Game.mPack.createObject('Sampler');
        this.mNumberTexSampler.minFilter = Game.mO3d.Sampler.ANISOTROPIC;
        this.mNumberTexSampler.maxAnisotropy = 4;
        NumberSamplerParam.value = this.mNumberTexSampler;

        var SymbolSamplerParam = this.mMaterial.getParam('SymbolTexSampler');
        this.mSymbolTexSampler = Game.mPack.createObject('Sampler');
        this.mSymbolTexSampler.minFilter = Game.mO3d.Sampler.ANISOTROPIC;
        this.mSymbolTexSampler.maxAnisotropy = 4;
        SymbolSamplerParam.value = this.mSymbolTexSampler;

        // TODO: handle better yo
        this.mNumberTexSampler.texture = gNumberTexture;
        this.mSymbolTexSampler.texture = gSymbolTexture;

        this.mPaintedColorParam = this.mMaterial.getParam('PaintedColor');
        this.mPaintedColorParam.value = [ 0.0, 0.0, 1.0, 1.0 ]; // move to puzzle file
        this.mDebugSolidColorParam = this.mMaterial.getParam('DebugSolidColor');
        this.mDebugSolidColorParam.value = [ 0.8, 1.0, 0.8, 1.0 ]; // move to puzzle file?
        this.mDebugSpaceColorParam = this.mMaterial.getParam('DebugSpaceColor');
        this.mDebugSpaceColorParam.value = [ 1.0, 0.8, 0.8, 1.0 ]; // move to puzzle file?
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

    this.setPaintedColor = function( Value )
    {
        this.mPaintedColorParam.value = Value;    
    }
    this.setDebugSolidColor = function( Value )
    {
        this.mDebugSolidColorParam.value = Value;    
    }
    this.setDebugSpaceColor = function( Value )
    {
        this.mDebugSpaceColorParam.value = Value;    
    }
}