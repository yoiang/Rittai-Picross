var gTransformToCube = []; // associate a transform with a cube
var gShapeTemplateMaterial = null;
var gShapeTemplate = null;

function Cube( Game, setCubeInfo, AssociateWithTransform )
{
    var mCubeInfo = setCubeInfo;

    var mRows = null;

    var mTransform = null;
    var mFaceTransforms = null;

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

    var mGuaranteedParam = null;

    this.createShape = function(Game, AssociateWithTransform)
    {
        if ( gShapeTemplate == null )
        {
            gShapeTemplateMaterial = new CubeMaterial( Game );
            gShapeTemplate = [];
            for( var travFaces = 0; travFaces < 6; travFaces ++ )
            {
                gShapeTemplate[ travFaces ] = new CubeShape( Game, travFaces );
            }
        }

        // Create a new transform and parent the Shape under it.
        mTransform = Game.mPack.createObject('Transform');
        mFaceTransforms = [];
        mIgnoreColorModifiersParam = [];
        mNumbersParam = [];
        mHideNumbersParam = [];
        mSpacesHintsParam = [];
        mDimNumbersParam = [];
        mSolidParam = [];
        mFailedBreakParam = [];
        mPaintedParam = [];
        mFinishedColorParam = [];
        mPeerThroughParam = [];
        mGuaranteedParam = [];
        for( travFaces = 0; travFaces < 6 ; travFaces ++ )
        {
            mFaceTransforms[ travFaces ] = Game.mPack.createObject('Transform');
            mFaceTransforms[ travFaces ].addShape(gShapeTemplate[ travFaces ].getShape());
            mFaceTransforms[ travFaces ].parent = mTransform;

            mIgnoreColorModifiersParam[ travFaces ] = mFaceTransforms[ travFaces ].createParam( 'IgnoreColorModifiers', 'ParamBoolean' );

            mNumbersParam[ travFaces ] = mFaceTransforms[ travFaces ].createParam('Number', 'ParamFloat');
            mHideNumbersParam[ travFaces ] = mFaceTransforms[ travFaces ].createParam('HideNumber', 'ParamBoolean');
            mSpacesHintsParam[ travFaces ] = mFaceTransforms[ travFaces ].createParam('SpacesHint', 'ParamFloat');

            mDimNumbersParam[ travFaces ] = mFaceTransforms[ travFaces ].createParam('DimNumber', 'ParamBoolean');

            mSolidParam[ travFaces ] = mFaceTransforms[ travFaces ].createParam('Solid', 'ParamBoolean');
            mFailedBreakParam[ travFaces ] = mFaceTransforms[ travFaces ].createParam('FailedBreak', 'ParamBoolean');
            mPaintedParam[ travFaces ] = mFaceTransforms[ travFaces ].createParam('Painted', 'ParamBoolean');

            mFinishedColorParam[ travFaces ] = mFaceTransforms[ travFaces ].createParam('FinishedColor', 'ParamFloat4' );

            mPeerThroughParam[ travFaces ] = mFaceTransforms[ travFaces ].createParam( 'PeerThrough', 'ParamBoolean' );

            mGuaranteedParam[ travFaces ] = mFaceTransforms[ travFaces ].createParam( 'Guaranteed', 'ParamBoolean' );
        }

        this.setIgnoreColorModifiers( false );
        this.setNumbers( -1, -1, -1 );
        this.setHideNumbers( [ 1, 1, 1 ] );
        this.setSpacesHints( 0, 0, 0 );
        this.setDimNumbers( [ 0, 0, 0 ] );
        this.setSolid( mCubeInfo.mSolid );
        this.setFailedBreak( false );
        this.setPainted( false );
        this.setFinishedColor( mCubeInfo.mFinishedColor );
        this.setPeerThrough( false );
        this.setGuaranteed( false );

        if ( AssociateWithTransform )
        {
            gTransformToCube[ gTransformToCube.length ] = [ mFaceTransforms, this ];
        }

        this.setParentTransform( mCubeInfo.mParentTransform );

        mTransform.localMatrix = o3djs.math.matrix4.mul(mTransform.localMatrix, o3djs.math.matrix4.translation( mCubeInfo.mPuzzleLocation ));
    };

    this.setNumbersTexture = function( Value )
    {
        gShapeTemplateMaterial.setNumbersTexture( Value );
    }

    this.setSymbolsTexture = function( Value )
    {
        gShapeTemplateMaterial.setSymbolsTexture( Value );
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
        for( var travFaces = 0; travFaces < 6; travFaces ++)
        {
            mIgnoreColorModifiersParam[ travFaces ].value = Value;
        }
    }

    this.getIgnoreColorModifiers = function()
    {
        return mIgnoreColorModifiersParam[ 0 ].value;
    }

    this.setNumbers = function( X, Y, Z )
    {
        mNumbersParam[ 4 ].value = X;
        mNumbersParam[ 5 ].value = X;
        mNumbersParam[ 1 ].value = Y;
        mNumbersParam[ 3 ].value = Y;
        mNumbersParam[ 0 ].value = Z;
        mNumbersParam[ 2 ].value = Z;
    }
    this.getNumbers = function()
    {
        return [ mNumbersParam[ 4 ].value, mNumbersParam[ 1 ].value, mNumbersParam[ 0 ].value ];
    }
    this.setHideNumbers = function( Value )
    {
        mHideNumbersParam[ 4 ].value = Value[ 0 ] == 1;
        mHideNumbersParam[ 5 ].value = Value[ 0 ] == 1;
        mHideNumbersParam[ 1 ].value = Value[ 1 ] == 1;
        mHideNumbersParam[ 3 ].value = Value[ 1 ] == 1;
        mHideNumbersParam[ 0 ].value = Value[ 2 ] == 1;
        mHideNumbersParam[ 2 ].value = Value[ 2 ] == 1;
    }
    this.getHideNumbers = function()
    {
        return [ mHideNumbersParam[ 4 ].value?1:0, mHideNumbersParam[ 1 ].value?1:0, mHideNumbersParam[ 0 ].value?1:0 ];
    }
    this.setSpacesHints = function( X, Y, Z )
    {
        mSpacesHintsParam[ 4 ].value = X;
        mSpacesHintsParam[ 5 ].value = X;
        mSpacesHintsParam[ 1 ].value = Y;
        mSpacesHintsParam[ 3 ].value = Y;
        mSpacesHintsParam[ 0 ].value = Z;
        mSpacesHintsParam[ 2 ].value = Z;
    }
    this.getSpacesHints = function()
    {
        return [ mSpacesHintsParam[ 4 ].value, mSpacesHintsParam[ 1 ].value, mSpacesHintsParam[ 0 ].value ];
    }

    this.setDimNumbers = function( Value )
    {
        mDimNumbersParam[ 4 ].value = Value[ 0 ] == 1;
        mDimNumbersParam[ 5 ].value = Value[ 0 ] == 1;
        mDimNumbersParam[ 1 ].value = Value[ 1 ] == 1;
        mDimNumbersParam[ 3 ].value = Value[ 1 ] == 1;
        mDimNumbersParam[ 0 ].value = Value[ 2 ] == 1;
        mDimNumbersParam[ 2 ].value = Value[ 2 ] == 1;
    }
    this.getDimNumbers = function()
    {
        return [ mDimNumbersParam[ 4 ].value?1:0, mDimNumbersParam[ 1 ].value?1:0, mDimNumbersParam[ 0 ].value?1:0 ];
    }
    this.setFailedBreak = function( Value)
    {
        for( var travFaces = 0; travFaces < 6; travFaces ++)
        {
            mFailedBreakParam[ travFaces ].value = Value;
        }
    }
    this.getFailedBreak = function()
    {
        return mFailedBreakParam[ 0 ].value;
    }
    
    this.setSolid = function( Value )
    {
        for( var travFaces = 0; travFaces < 6; travFaces ++)
        {
            mSolidParam[ travFaces ].value = Value;
        }
    }
    this.getSolid = function()
    {
        return mSolidParam[ 0 ].value;
    }

    this.togglePainted = function( )
    {
        this.setPainted( !this.getPainted() );
    }

    this.setPainted = function( Value )
    {
        for( var travFaces = 0; travFaces < 6; travFaces ++)
        {
            mPaintedParam[ travFaces ].value = Value;
        }
    }
    this.getPainted = function()
    {
        return mPaintedParam[ 0 ].value;
    }

    this.setFinishedColor = function( Value )
    {
        for( var travFaces = 0; travFaces < 6; travFaces ++)
        {
            mFinishedColorParam[ travFaces ].value = Value;
        }
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
        for( var travFaces = 0; travFaces < 6; travFaces ++)
        {
            mPeerThroughParam[ travFaces ].value = Value;
        }
    }

    this.setParentTransform = function( Value )
    {
        if ( mTransform != null )
        {
            mTransform.parent = Value;
        }
    }

    this.setGuaranteed = function( Value )
    {
        for( var travFaces = 0; travFaces < 6; travFaces ++)
        {
            mGuaranteedParam[ travFaces ].value = Value;
        }
    }
    this.getGuaranteed = function()
    {
        return mGuaranteedParam[ 0 ].value;
    }

    this.destroy = function( Game )
    {
        if ( mCubeInfo != null )
        {
            mCubeInfo.destroy();
            mCubeInfo = null;
        }
        for( var travFaces = 0; travFaces < 6; travFaces ++ )
        {
            destroyTransform( Game, mFaceTransforms[ travFaces ] );
        }
        destroyTransform( Game, mTransform );
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

function CubeShape( Game, FaceIndex )
{
    var mShape = null;
    var mMaterial = null;
    var mPrimitive = null;
    var mDrawElement = null;
    var mStreamBank = null;

    this.init = function( Game, FaceIndex )
    {
        mShape = Game.mPack.createObject('Shape');
        mMaterial = gShapeTemplateMaterial;

        mPrimitive = Game.mPack.createObject('Primitive');
        mPrimitive.owner = mShape;
        
        mPrimitive.material = mMaterial.getMaterial();

        mDrawElement = mPrimitive.createDrawElement(Game.mPack, null);

        mPrimitive.primitiveType = Game.mO3d.Primitive.TRIANGLELIST;
        mPrimitive.numberPrimitives = 2;

        mStreamBank = Game.mPack.createObject('StreamBank');

        mPrimitive.numberVertices = 4;
        mStreamBank.setVertexStream( Game.mO3d.Stream.POSITION, 0, this.getVerticesArray( Game, FaceIndex ), 0);
        mStreamBank.setVertexStream( Game.mO3d.Stream.TEXCOORD, 0, this.getTexCoordBuffer( Game, FaceIndex ), 0);
        mStreamBank.setVertexStream( Game.mO3d.Stream.NORMAL, 0, this.getNormalsBuffer( Game, FaceIndex ), 0 );
        mPrimitive.indexBuffer = this.getIndicesBuffer( Game, FaceIndex );

        mPrimitive.streamBank = mStreamBank;
    }

    this.getVerticesArray = function( Game, FaceIndex )
    {
        var VerticesBuffer = Game.mPack.createObject('VertexBuffer');
        var VertexArray = VerticesBuffer.createField('FloatField', 3);

                switch( FaceIndex )
        {
            case 0:
        VerticesBuffer.set([
                1, 1, 1,
                0, 1, 1,
                0, 0, 1,
                1, 0, 1 ] );
                break;
            case 1:
        VerticesBuffer.set([
                0, 1, 1,
                1, 1, 1,
                1, 1, 0,
                0, 1, 0 ] );
                break;
            case 2:
        VerticesBuffer.set([
                0, 1, 0,
                1, 1, 0,
                1, 0, 0,
                0, 0, 0 ] );
                break;
            case 3:
        VerticesBuffer.set([
                0, 0, 0,
                1, 0, 0,
                1, 0, 1,
                0, 0, 1 ] );
                break;
            case 4:
        VerticesBuffer.set([
                1, 1, 0,
                1, 1, 1,
                1, 0, 1,
                1, 0, 0 ] );
                break;
            case 5:
        VerticesBuffer.set([
                0, 1, 1,
                0, 1, 0,
                0, 0, 0,
                0, 0, 1
                 ]);
                break;
        }

        return VertexArray;
    }

    this.getIndicesBuffer = function( Game, FaceIndex )
    {
        var IndicesBuffer = Game.mPack.createObject('IndexBuffer');

        IndicesBuffer.set([
            0, 1, 2,
            0, 2, 3 ] );

        return IndicesBuffer;
    }

    this.getTexCoordBuffer = function( Game, FaceIndex )
    {
        var texCoordsBuffer = Game.mPack.createObject('VertexBuffer');
        var texCoordsField = texCoordsBuffer.createField('FloatField', 2);

        texCoordsBuffer.set([
            0, 0,
            1, 0,
            1, 1,
            0, 1 ] );
        return texCoordsField;
    }

    this.getNormalsBuffer = function( Game, FaceIndex )
    {
        var NormalsBuffer = Game.mPack.createObject('VertexBuffer');
        var NormalsField = NormalsBuffer.createField('FloatField', 3);

        switch ( FaceIndex )
        {
            case 0:
                NormalsBuffer.set( [
                    0, 0, 1,
                    0, 0, 1,
                    0, 0, 1,
                    0, 0, 1 ] );
                break;
            case 1:
        NormalsBuffer.set( [
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0 ] );
                break;
            case 2:
        NormalsBuffer.set( [
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1 ] );
                break;
            case 3:
        NormalsBuffer.set( [
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0 ] );
                break;
            case 4:
        NormalsBuffer.set( [
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0 ] );
                break;
            case 5:
        NormalsBuffer.set( [
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0
        ] );
                break;
        }
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

    this.init( Game, FaceIndex );
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

    var mDebugParam = null;
    
    var mFinishedParam = null;

    var mNumberTexSampler = null;
    var mSymbolTexSampler = null;

    var mPaintedColorParam = null;

    var mShowGuaranteedParam = null;

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

        mDebugParam = mMaterial.getParam('Debug');
        mDebugParam.value = false;

        mFinishedParam = mMaterial.getParam('Finished');
        mFinishedParam.value = false;

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

        mShowGuaranteedParam = mMaterial.getParam('ShowGuaranteed');
        mShowGuaranteedParam.value = false;
    }

    this.getMaterial = function()
    {
        return mMaterial;
    }

    this.setEditMode = function( Value )
    {
        mEditModeParam.value = Value;
    }

    this.togglePainted = function()
    {
        this.setPainted( !this.getPainted() );
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

    this.setShowGuaranteed = function( Value )
    {
        mShowGuaranteedParam.value = Value;
    }
    this.getShowGuaranteed = function()
    {
        return mShowGuaranteedParam.value;
    }
    this.toggleShowGuaranteed = function()
    {
        this.setShowGuaranteed(!this.getShowGuaranteed());
    }
    this.init(Game);
}