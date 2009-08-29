var gTransformToCube = []; // associate a transform with a cube
var gShapeTemplate = null;
var gSharedMaterial = null;

function Cube( Game, Puzzle, Solid, ParentTransform, PuzzleLocX, PuzzleLocY, PuzzleLocZ, AssociateWithTransform )
{
    var mRows = null;

    var mPuzzle = Puzzle;
    var mPuzzleLocX = PuzzleLocX;
    var mPuzzleLocY = PuzzleLocY;
    var mPuzzleLocZ = PuzzleLocZ;

    var mTransform = null;
    var mNumbersParam = null;
    var mSpacesHintsParam = null;
    var mSolidParam = null;
    var mFailedBreakParam = null;
    var mPaintedParam = null;

    this.createShape = function(Game, ParentTransform, Solid, AssociateWithTransform)
    {
        if ( gShapeTemplate == null )
        {
            // Create a Shape object for the mesh.
            gShapeTemplate = Game.mPack.createObject('Shape');
            gSharedMaterial = new CubeMaterial( Game );

            for( var travFaces = 0; travFaces < 6; travFaces ++ )
            {
                var addFace = new Face( Game, gShapeTemplate, gSharedMaterial, travFaces );
                if ( mPuzzle.getInfo && mPuzzle.getInfo() )
                {
                    addFace.getMaterial().setPaintedColor( mPuzzle.getInfo().mPaintColor );
                }
            }
        }

        // Create a new transform and parent the Shape under it.
        mTransform = Game.mPack.createObject('Transform');
        mTransform.addShape(gShapeTemplate);

        mNumbersParam = mTransform.createParam('Numbers', 'ParamFloat3');
        mNumbersParam.value = [ 10, 10, 10 ];
        mSpacesHintsParam = mTransform.createParam('SpacesHints', 'ParamFloat3');
        mSpacesHintsParam.value = [ 0, 0, 0 ];

        mSolidParam = mTransform.createParam('Solid', 'ParamBoolean');
        this.setSolid( Solid );
        mFailedBreakParam = mTransform.createParam('FailedBreak', 'ParamBoolean');
        this.setFailedBreak( false );
        mPaintedParam = mTransform.createParam('Painted', 'ParamBoolean');
        this.setPainted( false );

        if ( AssociateWithTransform )
        {
            gTransformToCube[ gTransformToCube.length ] = [ mTransform, this ];
        }

        mTransform.parent = ParentTransform;

        mTransform.localMatrix = o3djs.math.matrix4.mul(mTransform.localMatrix, o3djs.math.matrix4.translation([mPuzzleLocX,mPuzzleLocY,mPuzzleLocZ]));
    };

    this.setNumbersTexture = function( Value )
    {
        gSharedMaterial.setNumbersTexture( Value );
    }

    this.setSymbolsTexture = function( Value )
    {
        gSharedMaterial.setSymbolsTexture( Value );
    }

    this.setRows = function( Game, RowX, RowY, RowZ )
    {
        mRows = [ RowX, RowY, RowZ ];

        mNumbersParam.value = [ RowX.getNumber(), RowY.getNumber(), RowZ.getNumber() ];
        mSpacesHintsParam.value = [ RowX.getSpacesHint(), RowY.getSpacesHint(), RowZ.getSpacesHint() ];
    }

    this.setFailedBreak = function( Value)
    {
        mFailedBreak = true;
        gSharedMaterial.setFailedBreak(Value);
    }
    
    this.getSolid = function()
    {
        return mSolidParam.value;
    }
    this.setSolid = function( Value )
    {
        mSolidParam.value = Solid;
    }

    this.setDebug = function(Value)
    {
        gSharedMaterial.setDebug( Value );
    }

    this.togglePainted = function( )
    {
        this.setPainted( !this.getPainted() );
    }

    this.getPainted = function()
    {
        return mPaintedParam.value;
    }
    this.setPainted = function( Value )
    {
        mPaintedParam.value = Value;
    }

    this.getFailedBreak = function()
    {
        return mFailedBreakParam.value;
    }
    this.setFailedBreak = function( Value )
    {
        mFailedBreakParam.value = Value;
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
        mTransform.parent = null;
        Game.mPack.removeObject(mTransform);
        mTransform = null;
    }

    this.createShape( Game, ParentTransform, Solid, AssociateWithTransform );
}

var gVerticesArray = null;
var gIndicesArray = null;
var gNormalsArray = null;

function Face( Game, Shape, Material, FIndex )
{
    var mPrimitive = null;
    var mDrawElement = null;
    var mStreamBank = null;
    var mMaterial = Material;

    this.init = function( Game, Shape, FIndex )
    {
        mPrimitive = Game.mPack.createObject('Primitive');
        mPrimitive.owner = Shape;
        
        mPrimitive.material = mMaterial.getMaterial();

        mDrawElement = mPrimitive.createDrawElement(Game.mPack, null);

        mPrimitive.primitiveType = Game.mO3d.Primitive.TRIANGLELIST;
        mPrimitive.numberPrimitives = 2;

        mStreamBank = Game.mPack.createObject('StreamBank');

        var VerticesArray = this.getVerticesArray( Game, FIndex );
        mPrimitive.numberVertices = 4; //VerticesArray.length / 3;

        mStreamBank.setVertexStream( Game.mO3d.Stream.POSITION, 0, VerticesArray, 0);

        var texCoordsArray = [ 0, 0, 1, 0, 1, 1, 0, 1];

        var texCoordsBuffer = Game.mPack.createObject('VertexBuffer');
        var texCoordsField = texCoordsBuffer.createField('FloatField', 2);
        texCoordsBuffer.set(texCoordsArray);

        mStreamBank.setVertexStream( Game.mO3d.Stream.TEXCOORD, 0, texCoordsField, 0);

        var NormalArray = this.getNormal( Game, FIndex );

        mStreamBank.setVertexStream( Game.mO3d.Stream.NORMAL, 0, NormalArray, 0 );

        mPrimitive.streamBank = mStreamBank;

        if ( gIndicesArray == null )
        {
            gIndicesArray = Game.mPack.createObject('IndexBuffer');
            gIndicesArray.set([ 0, 1, 2, 0, 2, 3 ]);
        }
        mPrimitive.indexBuffer = gIndicesArray;
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

    this.getNormal = function( Game, FIndex )
    {
        if ( gNormalsArray == null )
        {
            gNormalsArray = [];
            
            var NormalsBuffer = Game.mPack.createObject('VertexBuffer');
            gNormalsArray[ 0 ] = NormalsBuffer.createField('FloatField', 3);
            NormalsBuffer.set( [ 0, 0, 1 ] );

            NormalsBuffer = Game.mPack.createObject('VertexBuffer');
            gNormalsArray[ 1 ] = NormalsBuffer.createField('FloatField', 3);
            NormalsBuffer.set( [ 0, 1, 0 ] );

            NormalsBuffer = Game.mPack.createObject('VertexBuffer');
            gNormalsArray[ 2 ] = NormalsBuffer.createField('FloatField', 3);
            NormalsBuffer.set( [ 0, 0, -1 ] );

            NormalsBuffer = Game.mPack.createObject('VertexBuffer');
            gNormalsArray[ 3 ] = NormalsBuffer.createField('FloatField', 3);
            NormalsBuffer.set( [ 0, -1, 0 ] );

            NormalsBuffer = Game.mPack.createObject('VertexBuffer');
            gNormalsArray[ 4 ] = NormalsBuffer.createField('FloatField', 3);
            NormalsBuffer.set( [ 1, 0, 0 ] );

            NormalsBuffer = Game.mPack.createObject('VertexBuffer');
            gNormalsArray[ 5 ] = NormalsBuffer.createField('FloatField', 3);
            NormalsBuffer.set( [ -1, 0, 0 ] );
        }
        return gNormalsArray[ FIndex ];
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
    var mSpacesHint = 0;
    this.updateCounts = function()
    {
        mNumber = 0;
        mSpacesHint = 0;
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
                    mSpacesHint ++;
                    LastBlockWasSpace = true;
                }
            }
        }
        if ( LastBlockWasSpace )
        {
            mSpacesHint --;
        }
    }
    this.updateCounts();

    this.getNumber = function()
    {
        return mNumber;
    }

    this.getSpacesHint = function()
    {
        return mSpacesHint;
    }
}

function CubeMaterial( Game )
{
    var mMaterial = null;
    var mEffect = null;

    var mNumbersParam = null;
    var mSpacesHintsParam = null;

    var mDimNumberParam = null;

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

        mNumbersParam = mMaterial.getParam('Numbers');
        mNumbersParam.value = [ 10, 10, 10 ];
        mSpacesHintsParam = mMaterial.getParam('SpacesHints');
        mSpacesHintsParam.value = [ 0, 0, 0 ];

        mDimNumberParam = mMaterial.getParam('DimNumber');
        mDimNumberParam.value = false;

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

    this.setNumbers = function( Value )
    {
        mNumbersParam.value = Value;
    }
    this.setSpacesHints = function( Value )
    {
        mSpacesHintsParam.value = Value;
    }

    this.setmDimNumber = function( Value )
    {
        mDimNumberParam.value = Value;
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