var gTransformToCube = []; // associate a transform with a cube
var gShapeTemplate = null;

function Cube( Game, Puzzle, Solid, ParentTransform, PuzzleLocation, AssociateWithTransform )
{
    var mRows = null;

    var mPuzzle = Puzzle;
    var mPuzzleLocation = PuzzleLocation;

    var mTransform = null;
    var mNumbersParam = null;
    var mHideNumbersParam = null;
    var mSpacesHintsParam = null;
    var mSolidParam = null;
    var mFailedBreakParam = null;
    var mPaintedParam = null;

    this.createShape = function(Game, ParentTransform, Solid, AssociateWithTransform)
    {
        if ( gShapeTemplate == null )
        {
            gShapeTemplate = new CubeShape( Game );
        }

        // Create a new transform and parent the Shape under it.
        mTransform = Game.mPack.createObject('Transform');
        mTransform.addShape(gShapeTemplate.getShape());

        mNumbersParam = mTransform.createParam('Numbers', 'ParamFloat3');
        mNumbersParam.value = [ 10, 10, 10 ];
        mHideNumbersParam = mTransform.createParam('HideNumbers', 'ParamFloat3');
        mHideNumbersParam.value = [ 0, 0, 0 ];
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

        mTransform.localMatrix = o3djs.math.matrix4.mul(mTransform.localMatrix, o3djs.math.matrix4.translation(mPuzzleLocation));
    };

    this.setNumbersTexture = function( Value )
    {
        gShapeTemplate.getMaterial().setNumbersTexture( Value );
    }

    this.setSymbolsTexture = function( Value )
    {
        gShapeTemplate.getMaterial().setSymbolsTexture( Value );
    }

    this.setRows = function( Game, RowX, RowY, RowZ )
    {
        mRows = [ RowX, RowY, RowZ ];

        mNumbersParam.value = [ RowX.getNumber(), RowY.getNumber(), RowZ.getNumber() ];
        mSpacesHintsParam.value = [ RowX.getSpacesHint(), RowY.getSpacesHint(), RowZ.getSpacesHint() ];
    }

    this.setFailedBreak = function( Value)
    {
        mFailedBreakParam.value = Value;
    }
    this.getFailedBreak = function()
    {
        return mFailedBreakParam.value;
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
        gShapeTemplate.getMaterial().setDebug( Value );
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

    this.getPuzzleLocation = function()
    {
        return mPuzzleLocation;
    }

    this.destroy = function( Game )
    {
        mTransform.parent = null;
        Game.mPack.removeObject(mTransform);
        mTransform = null;
    }

    this.createShape( Game, ParentTransform, Solid, AssociateWithTransform );
}

function CubeShape( Game )
{
    var mShape = null;
    var mMaterial = null;
    var mPrimitive = null;
    var mDrawElement = null;
    var mStreamBank = null;

    this.init = function( Game )
    {
        mShape = Game.mPack.createObject('Shape');
        mMaterial = new CubeMaterial( Game );

        mPrimitive = Game.mPack.createObject('Primitive');
        mPrimitive.owner = mShape;
        
        mPrimitive.material = mMaterial.getMaterial();

        mDrawElement = mPrimitive.createDrawElement(Game.mPack, null);

        mPrimitive.primitiveType = Game.mO3d.Primitive.TRIANGLELIST;
        mPrimitive.numberPrimitives = 12;

        mStreamBank = Game.mPack.createObject('StreamBank');

        mPrimitive.numberVertices = 24;
        mStreamBank.setVertexStream( Game.mO3d.Stream.POSITION, 0, this.getVerticesArray( Game ), 0);
        mStreamBank.setVertexStream( Game.mO3d.Stream.TEXCOORD, 0, this.getTexCoordBuffer( Game ), 0);
        mStreamBank.setVertexStream( Game.mO3d.Stream.NORMAL, 0, this.getNormalsBuffer( Game ), 0 );
        mPrimitive.indexBuffer = this.getIndicesBuffer( Game );

        mPrimitive.streamBank = mStreamBank;
    }

    this.getVerticesArray = function( Game )
    {
        var VerticesBuffer = Game.mPack.createObject('VertexBuffer');
        var VertexArray = VerticesBuffer.createField('FloatField', 3);
        VerticesBuffer.set([
                1, 1, 1,
                0, 1, 1,
                0, 0, 1,
                1, 0, 1
                ,
                0, 1, 1,
                1, 1, 1,
                1, 1, 0,
                0, 1, 0
                ,
                0, 1, 0,
                1, 1, 0,
                1, 0, 0,
                0, 0, 0
                ,
                0, 0, 0,
                1, 0, 0,
                1, 0, 1,
                0, 0, 1
                ,
                1, 1, 0,
                1, 1, 1,
                1, 0, 1,
                1, 0, 0
                ,
                0, 1, 1,
                0, 1, 0,
                0, 0, 0,
                0, 0, 1
                 ]);

        return VertexArray;
    }

    this.getIndicesBuffer = function( Game )
    {
        var IndicesBuffer = Game.mPack.createObject('IndexBuffer');
        IndicesBuffer.set([
            0, 1, 2,
            0, 2, 3
            ,
            4, 5, 6,
            4, 6, 7
            ,
            8, 9, 10,
            8, 10, 11
            ,
            12, 13, 14,
            12, 14, 15
            ,
            16, 17, 18,
            16, 18, 19
            ,
            20, 21, 22,
            20, 22, 23
        ]);
        return IndicesBuffer;
    }

    this.getTexCoordBuffer = function( Game )
    {
        var texCoordsBuffer = Game.mPack.createObject('VertexBuffer');
        var texCoordsField = texCoordsBuffer.createField('FloatField', 2);
        texCoordsBuffer.set([
            0, 0,
            1, 0,
            1, 1,
            0, 1
            ,
            0, 0,
            1, 0,
            1, 1,
            0, 1
            ,
            0, 0,
            1, 0,
            1, 1,
            0, 1
            ,
            0, 0,
            1, 0,
            1, 1,
            0, 1
            ,
            0, 0,
            1, 0,
            1, 1,
            0, 1
            ,
            0, 0,
            1, 0,
            1, 1,
            0, 1
        ]);
        return texCoordsField;
    }

    this.getNormalsBuffer = function( Game )
    {
        var NormalsBuffer = Game.mPack.createObject('VertexBuffer');
        var NormalsField = NormalsBuffer.createField('FloatField', 3);
        
        NormalsBuffer.set( [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1
            ,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0
            ,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1
            ,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0
            ,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0
            ,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0
        ] );
        return NormalsField;
    }

    this.getShape = function()
    {
        return mShape;
    }

    this.getMaterial = function()
    {
        return mMaterial;
    }

    this.init( Game );
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