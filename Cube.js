var gShapeToCube = []; // associate a shape with a cube

function Cube( Game, Puzzle, Solid, ParentTransform, PuzzleLocX, PuzzleLocY, PuzzleLocZ )
{
    var mRows = null;
    var mSolid = Solid;
    var mFailedBreak = false;
    var mPainted = false;

    var mPuzzle = Puzzle;
    var mPuzzleLocX = PuzzleLocX;
    var mPuzzleLocY = PuzzleLocY;
    var mPuzzleLocZ = PuzzleLocZ;

    var mShape = null;
    var mFaces = null;
    var mTransform = null;

    this.createShape = function(Game, ParentTransform)
    {
        // Create a Shape object for the mesh.
        mShape = Game.mPack.createObject('Shape');
        gShapeToCube[ gShapeToCube.length ] = [ mShape, this ];

        mFaces = [];
        for( var travFaces = 0; travFaces < 6; travFaces ++ )
        {
            mFaces[ travFaces ] = new Face( Game, mShape, travFaces );
            mFaces[ travFaces ].getMaterial().setSolid(mSolid);
        }

        // Create a new transform and parent the Shape under it.
        mTransform = Game.mPack.createObject('Transform');
        mTransform.addShape(mShape);

        mTransform.parent = ParentTransform;

        mTransform.localMatrix = o3djs.math.matrix4.mul(mTransform.localMatrix, o3djs.math.matrix4.translation([mPuzzleLocX,mPuzzleLocY,mPuzzleLocZ]));
    };
    this.createShape( Game, ParentTransform );

    this.setNumbersTexture = function( Value )
    {
        for( var travFaces = 0; travFaces < 6; travFaces ++ )
        {
            mFaces[ travFaces ].getMaterial().setNumbersTexture( Value );
        }
    }

    this.setSymbolsTexture = function( Value )
    {
        for( var travFaces = 0; travFaces < 6; travFaces ++ )
        {
            mFaces[ travFaces ].getMaterial().setSymbolsTexture( Value );
        }
    }

    this.setRows = function( Game, RowX, RowY, RowZ )
    {
        mRows = [ RowX, RowY, RowZ ];

        mFaces[4].getMaterial().setNumber(RowX.getNumber());
        mFaces[5].getMaterial().setNumber(RowX.getNumber());
        mFaces[4].getMaterial().setNonadjacentSpaces(RowX.getNonadjacentSpaces());
        mFaces[5].getMaterial().setNonadjacentSpaces(RowX.getNonadjacentSpaces());

        mFaces[1].getMaterial().setNumber(RowY.getNumber());
        mFaces[3].getMaterial().setNumber(RowY.getNumber());
        mFaces[1].getMaterial().setNonadjacentSpaces(RowY.getNonadjacentSpaces());
        mFaces[3].getMaterial().setNonadjacentSpaces(RowY.getNonadjacentSpaces());

        mFaces[0].getMaterial().setNumber(RowZ.getNumber());
        mFaces[2].getMaterial().setNumber(RowZ.getNumber());
        mFaces[0].getMaterial().setNonadjacentSpaces(RowZ.getNonadjacentSpaces());
        mFaces[2].getMaterial().setNonadjacentSpaces(RowZ.getNonadjacentSpaces());
    }

    this.togglePainted = function( )
    {
        mPainted = !mPainted;
        for( var travFaces = 0; travFaces < 6; travFaces ++ )
        {
            mFaces[ travFaces ].getMaterial().togglePainted();
        }
    }

    this.setFailedBreak = function( Value)
    {
        mFailedBreak = true;
        for( var travFaces = 0; travFaces < 6; travFaces ++ )
        {
            mFaces[ travFaces ].getMaterial().setFailedBreak(Value);
        }
    }
    
    this.getSolid = function()
    {
        return mSolid;
    }

    this.setDebug = function(Value)
    {
        for( var travFaces = 0; travFaces < 6; travFaces ++ )
        {
            mFaces[ travFaces ].getMaterial().setDebug( Value );
        }
    }

    this.getPainted = function()
    {
        return mPainted;
    }

    this.getFailedBreak = function()
    {
        return mFailedBreak;
    }

    this.getPuzzleLocX = function()
    {
        return mPuzzleLocX;
    }

    this.getPuzzleLocY = function()
    {
        return mPuzzleLocY;
    }

    this.getPuzzleLocZ = function()
    {
        return mPuzzleLocZ;
    }

    this.destroy = function( Game )
    {
/*        for( var travFaces = 0; travFaces < 6; travFaces ++ )
        {
            mFaces[ travFaces ].destroy();
        }
*/
        mTransform.parent = null;
        Game.mPack.removeObject(mShape);
        Game.mPack.removeObject(mTransform);
        mTransform = null;
        mShape = null;
    }

}

var gVerticesArray = null;
var gIndicesArray = null;

function Face( Game, Shape, FIndex )
{
    var mPrimitive = null;
    var mDrawElement = null;
    var mStreamBank = null;
    var mMaterial = null;

    this.init = function( Game, Shape, FIndex )
    {
        // Create the Primitive that will contain the geometry data for
        // the cube.
        mPrimitive = Game.mPack.createObject('Primitive');
        mPrimitive.owner = Shape;

        mDrawElement = mPrimitive.createDrawElement(Game.mPack, null);

        mPrimitive.primitiveType = Game.mO3d.Primitive.TRIANGLELIST;
        mPrimitive.numberPrimitives = 2;

        var VerticesArray = this.getVerticesArray( Game, FIndex );
        mPrimitive.numberVertices = 4; //VerticesArray.length / 3;

        if ( gIndicesArray == null )
        {
            gIndicesArray = Game.mPack.createObject('IndexBuffer');
            gIndicesArray.set([
                                0, 1, 2,
                                0, 2, 3 ]);
        }
        mStreamBank = Game.mPack.createObject('StreamBank');
        mStreamBank.setVertexStream(
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
        mStreamBank.setVertexStream(
            Game.mO3d.Stream.TEXCOORD,  // semantic
            0,                      // semantic index
            texCoordsField,         // field
            0);                     // start_index

        mPrimitive.streamBank = mStreamBank;

        // Associate the triangle indices Buffer with the primitive.
        mPrimitive.indexBuffer = gIndicesArray;

        mMaterial = new CubeMaterial( Game );
        mPrimitive.material = mMaterial.getMaterial();
    }

    this.getVerticesArray = function( Game, FIndex )
    {
        if ( gVerticesArray == null )
        {
            gVerticesArray = [];

            var VerticesBuffer = Game.mPack.createObject('VertexBuffer');
            gVerticesArray[0] = VerticesBuffer.createField('FloatField', 3);
            VerticesBuffer.set([
                1, 1, 1,
                0, 1, 1,
                0, 0, 1,
                1, 0, 1]);

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
                1, 1, 0,
                1, 1, 1,
                1, 0, 1,
                1, 0, 0
                 ]);

            VerticesBuffer = Game.mPack.createObject('VertexBuffer');
            gVerticesArray[5] = VerticesBuffer.createField('FloatField', 3);
            VerticesBuffer.set([
                0, 1, 1,
                0, 1, 0,
                0, 0, 0,
                0, 0, 1
                 ]);
        }
        return gVerticesArray[ FIndex ];
    }

    this.getMaterial = function()
    {
        return mMaterial;
    }

    this.init( Game, Shape, FIndex );
}

function RowInfo( Row )
{
    var mRow = Row;
    var mNumber = 0;
    var mNonadjacentSpaces = 0;
    this.updateCounts = function()
    {
        mNumber = 0;
        mNonadjacentSpaces = 0;
        var LastBlockWasSpace = false;
        for( var travRow = 0; travRow < mRow.length; travRow ++ )
        {
            if ( mRow[ travRow ] == 1 )
            {
                mNumber ++;
                LastBlockWasSpace = false;
            } else
            {
                if ( mNumber > 0 && !LastBlockWasSpace )
                {
                    mNonadjacentSpaces ++;
                    LastBlockWasSpace = true;
                }
            }
        }
        if ( LastBlockWasSpace )
        {
            mNonadjacentSpaces --;
        }
    }
    this.updateCounts();

    this.getNumber = function()
    {
        return mNumber;
    }

    this.getNonadjacentSpaces = function()
    {
        return mNonadjacentSpaces;
    }
}

function CubeMaterial( Game )
{
    var mMaterial = null;
    var mEffect = null;

    var mNumberParam = null;
    var mNonadjacentSpacesParam = null;

    var mFailedBreakParam = null;
    var mPaintedParam = null;

    var mSolidParam = null;
    var mDebugParam = null;

    var mNumberTexSampler = null;
    var mSymbolTexSampler = null;

    var mPaintedColorParam = null;
    var mDebugSolidColorParam = null;
    var mDebugSpaceColorParam = null;

    this.init = function(Game)
    {
        mMaterial = Game.mPack.createObject('Material');
        
        mMaterial.drawList = Game.mCamera.getViewInfo().performanceDrawList;

        mEffect = Game.mPack.createObject('Effect');
        o3djs.effect.loadEffect( mEffect, 'Cube.shader');
        mMaterial.effect = mEffect;

        mEffect.createUniformParameters(mMaterial);

        mNumberParam = mMaterial.getParam('Number');
        mNumberParam.value = 10;
        mNonadjacentSpacesParam = mMaterial.getParam('NonadjacentSpaces');
        mNonadjacentSpacesParam.value = 0;

        mFailedBreakParam = mMaterial.getParam('FailedBreak');
        mFailedBreakParam.value = false;
        mPaintedParam = mMaterial.getParam('Painted');
        mPaintedParam.value = false;

        mSolidParam = mMaterial.getParam('Solid');
        mSolidParam.value = false;
        mDebugParam = mMaterial.getParam('Debug');
        mDebugParam.value = false;

        var NumberSamplerParam = mMaterial.getParam('NumberTexSampler');
        mNumberTexSampler = Game.mPack.createObject('Sampler');
        mNumberTexSampler.minFilter = Game.mO3d.Sampler.ANISOTROPIC;
        mNumberTexSampler.maxAnisotropy = 4;
        NumberSamplerParam.value = mNumberTexSampler;

        var SymbolSamplerParam = mMaterial.getParam('SymbolTexSampler');
        mSymbolTexSampler = Game.mPack.createObject('Sampler');
        mSymbolTexSampler.minFilter = Game.mO3d.Sampler.ANISOTROPIC;
        mSymbolTexSampler.maxAnisotropy = 4;
        SymbolSamplerParam.value = mSymbolTexSampler;

        // TODO: handle better yo
        mNumberTexSampler.texture = gNumberTexture;
        mSymbolTexSampler.texture = gSymbolTexture;

        mPaintedColorParam = mMaterial.getParam('PaintedColor');
        mPaintedColorParam.value = [ 0.0, 0.0, 1.0, 1.0 ]; // move to puzzle file
        mDebugSolidColorParam = mMaterial.getParam('DebugSolidColor');
        mDebugSolidColorParam.value = [ 0.8, 1.0, 0.8, 1.0 ]; // move to puzzle file?
        mDebugSpaceColorParam = mMaterial.getParam('DebugSpaceColor');
        mDebugSpaceColorParam.value = [ 1.0, 0.8, 0.8, 1.0 ]; // move to puzzle file?
    }

    this.getMaterial = function()
    {
        return mMaterial;
    }

    this.setNumber = function( Value )
    {
        mNumberParam.value = Value;
    }
    this.setNonadjacentSpaces = function( Value )
    {
        mNonadjacentSpacesParam.value = Value;
    }

    this.setFailedBreak = function( Value )
    {
        mFailedBreakParam.value = Value;
    }
    this.setPainted = function( Value )
    {
        mPaintedParam.value = Value;
    }
    this.getPainted = function()
    {
        return mPaintedParam.value;
    }
    this.togglePainted = function()
    {
        this.setPainted( !this.getPainted() );
    }

    this.setSolid = function( Value )
    {
        mSolidParam.value = Value;
    }
    this.setDebug = function( Value )
    {
        mDebugParam.value = Value;
    }
    this.getDebug = function()
    {
        return mDebugParam.value;
    }
    this.toggleDebug = function()
    {
        this.setDebug(!this.getDebug());
    }

    this.setNumbersTexture = function( Value )
    {
        mNumberTexSampler.texture = Value;
    }
    this.setSymbolsTexture = function( Value )
    {
        mSymbolTexSampler.texture = Value;
    }

    this.setPaintedColor = function( Value )
    {
        mPaintedColorParam.value = Value;
    }
    this.setDebugSolidColor = function( Value )
    {
        mDebugSolidColorParam.value = Value;
    }
    this.setDebugSpaceColor = function( Value )
    {
        mDebugSpaceColorParam.value = Value;
    }

    this.init(Game);
}