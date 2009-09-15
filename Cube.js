var gTransformToCube = []; // associate a transform with a cube
var gShapeTemplate = null;

function Cube( Game, setCubeInfo, AssociateWithTransform )
{
    var mCubeInfo = setCubeInfo;

    var mRows = null;

    var mTransform = null;

    var mIgnoreColorModifiersParam = null;

    var mNumbersParam = null;
    var mHideNumbersParam = null;
    var mSpacesHintsParam = null;
    var mDimNumbersParam = null;

    var mSolidParam = null;
    var mFailedBreakParam = null;
    var mPaintedParam = null;

    var mFinishedColorParam = null;

    var mPeerThroughParam = null;

    this.createShape = function(Game, AssociateWithTransform)
    {
        if ( gShapeTemplate == null )
        {
            gShapeTemplate = new CubeShape( Game );
        }

        // Create a new transform and parent the Shape under it.
        mTransform = Game.mPack.createObject('Transform');
        mTransform.addShape(gShapeTemplate.getShape());

        mIgnoreColorModifiersParam = mTransform.createParam( 'IgnoreColorModifiers', 'ParamBoolean' );
        this.setIgnoreColorModifiers( false );

        mNumbersParam = mTransform.createParam('Numbers', 'ParamFloat3');
        this.setNumbers( -1, -1, -1 );
        mHideNumbersParam = mTransform.createParam('HideNumbers', 'ParamFloat3');
        this.setHideNumbers( [ 1, 1, 1 ] );
        mSpacesHintsParam = mTransform.createParam('SpacesHints', 'ParamFloat3');
        this.setSpacesHints( 0, 0, 0 );

        mDimNumbersParam = mTransform.createParam('DimNumbers', 'ParamFloat3');
        this.setDimNumbers( [ 0, 0, 0 ] );

        mSolidParam = mTransform.createParam('Solid', 'ParamBoolean');
        this.setSolid( mCubeInfo.mSolid );
        mFailedBreakParam = mTransform.createParam('FailedBreak', 'ParamBoolean');
        this.setFailedBreak( false );
        mPaintedParam = mTransform.createParam('Painted', 'ParamBoolean');
        this.setPainted( false );

        mFinishedColorParam = mTransform.createParam('FinishedColor', 'ParamFloat4' );
        this.setFinishedColor( mCubeInfo.mFinishedColor );

        mPeerThroughParam = mTransform.createParam( 'PeerThrough', 'ParamBoolean' );
        this.setPeerThrough( false );

        if ( AssociateWithTransform )
        {
            gTransformToCube[ gTransformToCube.length ] = [ mTransform, this ];
        }

        this.setParentTransform( mCubeInfo.mParentTransform );

        mTransform.localMatrix = o3djs.math.matrix4.mul(mTransform.localMatrix, o3djs.math.matrix4.translation( mCubeInfo.mPuzzleLocation ));
    };

    this.setNumbersTexture = function( Value )
    {
        gShapeTemplate.getMaterial().setNumbersTexture( Value );
    }

    this.setSymbolsTexture = function( Value )
    {
        gShapeTemplate.getMaterial().setSymbolsTexture( Value );
    }

    this.setRows = function( setRows )
    {
        mRows = setRows;

        this.setNumbers( mRows[ 0 ].getNumber(), mRows[ 1 ].getNumber(), mRows[ 2 ].getNumber() );
        this.setSpacesHints( mRows[ 0 ].getSpacesHint(), mRows[ 1 ].getSpacesHint(), mRows[ 2 ].getSpacesHint() );
    }
    this.getRows = function()
    {
        return mRows;
    }

    this.setIgnoreColorModifiers = function( Value )
    {
        mIgnoreColorModifiersParam.value = Value;
    }

    this.getIgnoreColorModifiers = function()
    {
        return mIgnoreColorModifiersParam.value;
    }

    this.setNumbers = function( X, Y, Z )
    {
        mNumbersParam.value = [ X, Y, Z ];
    }
    this.getNumbers = function()
    {
        return mNumbersParam.value;
    }
    this.setHideNumbers = function( Value )
    {
        mHideNumbersParam.value = Value;
    }
    this.getHideNumbers = function()
    {
        return mHideNumbersParam.value;
    }
    this.setSpacesHints = function( X, Y, Z )
    {
        mSpacesHintsParam.value = [ X, Y, Z ];
    }
    this.getSpacesHints = function()
    {
        return mSpacesHintsParam.value;
    }

    this.setDimNumbers = function( Value )
    {
        mDimNumbersParam.value = Value;
    }
    this.getDimNumbers = function()
    {
        return mDimNumbersParam.value;
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
        mSolidParam.value = Value;
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

    this.setFinishedColor = function( Value )
    {
        mFinishedColorParam.value = Value;
    }

    this.getInfo = function()
    {
        return mCubeInfo;
    }


    this.getPuzzleLocation = function()
    {
        return this.getInfo().mPuzzleLocation;
    }

    this.setPuzzleLocation = function( Value )
    {
        this.getInfo().mPuzzleLocation = Value;
        mTransform.localMatrix = o3djs.math.matrix4.mul(o3djs.math.matrix4.identity(), o3djs.math.matrix4.translation( this.getInfo().mPuzzleLocation ));
    }

    this.setPeerThrough = function( Value )
    {
        mPeerThroughParam.value = Value;
    }

    this.setParentTransform = function( Value )
    {
        if ( mTransform != null )
        {
            mTransform.parent = Value;
        }
    }

    this.destroy = function( Game )
    {
        if ( mCubeInfo != null )
        {
            mCubeInfo.destroy();
            mCubeInfo = null;
        }
        if( mTransform != null )
        {
            mTransform.parent = null;
            Game.mPack.removeObject(mTransform);
            mTransform = null;
        }
    }

    this.createShape( Game, AssociateWithTransform );
}

function CubeInfo( )
{
    this.mPuzzle = null;
    this.mParentTransform = null;
    
    this.mSolid = false;
    this.mFinishedColor = [ 1.0, 1.0, 1.0, 1 ];
    this.mPuzzleLocation = [ -1, -1, -1 ];

    this.destroy = function()
    {
        this.mPuzzle = null;
        this.mParentTransform = null;
    }
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

function RowInfo( setRowDefinition, setDimension )
{
    var mRowDefinition = null;
    var mDimension = -1;
    var mNumber = 0;
    var mSpaces = 0;
    var mSpacesRemaining = 0;
    var mSpacesHint = 0;

    this.updateCounts = function( setRowDefinition, setDimension )
    {
        mRowDefinition = setRowDefinition;
        mDimension = setDimension;

        mNumber = 0;
        mSpaces = 0;
        mSpacesRemaining = 0;
        mSpacesHint = 0;

        var LastBlockWasSpace = false;
        for( var travRow = 0; travRow < mRowDefinition.length; travRow ++ )
        {
            if ( mRowDefinition[ travRow ] == 1 )
            {
                mNumber ++;
                LastBlockWasSpace = false;
            } else
            {
                mSpaces ++;
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
        mSpacesRemaining = mSpaces;
    }

    this.getDimension = function()
    {
        return mDimension;
    }

    this.setNumber = function( Value )
    {
        mNumber = Value;
    }
    this.getNumber = function()
    {
        return mNumber;
    }

    this.setSpaces = function( Value )
    {
        mSpaces = Value;
    }
    this.getSpaces = function()
    {
        return mSpaces;
    }

    this.setSpacesRemaining = function( Value )
    {
        mSpacesRemaining = Value;
    }
    this.getSpacesRemaining = function()
    {
        return mSpacesRemaining;
    }

    this.setSpacesHint = function( Value )
    {
        mSpacesHint = Value;
    }
    this.getSpacesHint = function()
    {
        return mSpacesHint;
    }

    this.updateCounts( setRowDefinition, setDimension );
}

function CubeMaterial( Game )
{
    var mMaterial = null;
    var mEffect = null;

    var mEditModeParam = null;

    var mNumbersParam = null;
    var mSpacesHintsParam = null;

    var mDimNumbersParam = null;
    var mHideNumbersParam = null;

    var mFailedBreakParam = null;
    var mPaintedParam = null;

    var mSolidParam = null;
    var mDebugParam = null;
    
    var mFinishedParam = null;
    var mFinishedColorParam = null;

    var mNumberTexSampler = null;
    var mSymbolTexSampler = null;

    var mPaintedColorParam = null;
    var mDebugSolidColorParam = null;
    var mDebugSpaceColorParam = null;

    this.init = function(Game)
    {
        mMaterial = Game.mPack.createObject('Material');
        
        mMaterial.drawList = Game.mCamera.getViewInfo().zOrderedDrawList;//performanceDrawList;

        mEffect = Game.mPack.createObject('Effect');
        o3djs.effect.loadEffect( mEffect, 'Cube.shader');
        mMaterial.effect = mEffect;

        mEffect.createUniformParameters(mMaterial);

        mEditModeParam = mMaterial.getParam('EditMode');
        mEditModeParam.value = false;

        mNumbersParam = mMaterial.getParam('Numbers');
        mNumbersParam.value = [ -1, -1, -1 ];
        mSpacesHintsParam = mMaterial.getParam('SpacesHints');
        mSpacesHintsParam.value = [ 0, 0, 0 ];

        mDimNumbersParam = mMaterial.getParam('DimNumbers');
        mDimNumbersParam.value = [ 0, 0, 0 ];

        mHideNumbersParam = mMaterial.getParam('HideNumbers');
        mHideNumbersParam.value = [ 0, 0, 0 ];

        mFailedBreakParam = mMaterial.getParam('FailedBreak');
        mFailedBreakParam.value = false;
        mPaintedParam = mMaterial.getParam('Painted');
        mPaintedParam.value = false;

        mSolidParam = mMaterial.getParam('Solid');
        mSolidParam.value = false;
        mDebugParam = mMaterial.getParam('Debug');
        mDebugParam.value = false;

        mFinishedParam = mMaterial.getParam('Finished');
        mFinishedParam.value = false;
        mFinishedColorParam = mMaterial.getParam('FinishedColor');
        mFinishedColorParam.value = [ 0, 0, 0, 1 ];

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

    this.setEditMode = function( Value )
    {
        mEditModeParam.value = Value;
    }

    this.setNumbers = function( Value )
    {
        mNumbersParam.value = Value;
    }
    this.setSpacesHints = function( Value )
    {
        mSpacesHintsParam.value = Value;
    }

    this.setDimNumbers = function( Value )
    {
        mDimNumbersParam.value = Value;
    }

    this.setHideNumbers = function( Value )
    {
        mHideNumbersParam.value = Value;
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

    this.setFinished = function( Value )
    {
        mFinishedParam.value = Value;
    }
    this.getFinished = function()
    {
        return mFinishedParam.value;
    }

    this.setFinishedColor = function( Value )
    {
        mFinishedColorParam.value = Value;
    }
    this.getFinishedColor = function()
    {
        return mFinishedColorParam.value;
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