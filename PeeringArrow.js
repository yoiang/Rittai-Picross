function PeeringArrow( Game, Puzzle )
{
    var mPuzzle = null;

    var mTree = null;
    var mTransform = null;
    var mRotateTransform = null;
    var mNudgeTransform = null;
    var mShape = null;

    var mGrabLoc = null;
    var mLastRemained = null;
    var mGrabbed = null;
    var mRotate = 0;

    this.init = function( Game, Puzzle )
    {
        mPuzzle = Puzzle;
        
        mTransform = Game.mPack.createObject('Transform');
        mTransform.parent = Game.mClient.root;

        mRotateTransform = Game.mPack.createObject('Transform');
        mRotateTransform.parent = mTransform;

        mNudgeTransform = Game.mPack.createObject('Transform');
        mNudgeTransform.parent = mRotateTransform;

        mTree = o3djs.picking.createTransformInfo( mTransform, null);
        mTree.update();

        mShape = new ArrowShape( Game );
        mNudgeTransform.addShape( mShape.getShape() );
    }

    this.hide = function( Value )
    {
        if ( Value )
        {
            mTransform.parent = null;
        } else
        {
            mTransform.parent = Game.mClient.root;
        }
    }

    this.updateTransform = function( UpdateTree, setGrabLocation, setRotation )
    {
        mGrabLoc = setGrabLocation;
        mRotate = setRotation;

        mTransform.localMatrix = o3djs.math.matrix4.mul(o3djs.math.matrix4.identity(), o3djs.math.matrix4.translation( mGrabLoc ));

        mRotateTransform.localMatrix = o3djs.math.matrix4.mul(o3djs.math.matrix4.identity(), o3djs.math.matrix4.rotationY( mRotate ));

        mNudgeTransform.localMatrix = o3djs.math.matrix4.identity();

        if ( UpdateTree )
        {
            mTree.update();
        }
    }

    this.tryGrab = function( Game, Event )
    {
        var Ray = o3djs.picking.clientPositionToWorldRay(
            Event.x,
            Event.y,
            Game.mCamera.getViewInfo().drawContext,
            Game.mClient.width,
            Game.mClient.height);

        var PickInfo = mTree.pick(Ray);
        if ( PickInfo && PickInfo.shapeInfo.parent.transform == mNudgeTransform )
        {
            mGrabbed = [ Event.x, Event.y ];

            mRotateTransform.localMatrix = o3djs.math.matrix4.mul(mRotateTransform.localMatrix, o3djs.math.matrix4.scaling([ 0.95, 0.95, 0.95 ]));

            mShape.getMaterial().setGrabbed( true );
            Game.doRender();
            return true;
        }
        Game.doRender();
        return false;
    }

    this.getGrabbed = function()
    {
        return mGrabbed != null;
    }

    this.move = function( Game, Event )
    {
        var Delta = [ Event.x - mGrabbed[ 0 ], Event.y - mGrabbed[ 1 ] ];
        var MinDistance = Game.mClient.width / 5.0;
        var TotalDelta = Math.floor( Math.sqrt( Math.pow(Delta[0], 2) + Math.pow(Delta[1], 2)) );
        if ( mLastRemained != null )
        {
            TotalDelta += mLastRemained;
        }

        Change = TotalDelta / MinDistance;
        if ( Delta[0] < 0 )
        {
            Change *= -1;
        } else if ( Delta[0] == 0)
        {
            if ( Delta[1] < 0)
                Change *= -1;
        }

        mPuzzle.updateHidden( Change < 0, Math.floor( Math.abs( Change ) ) );
        if ( Math.floor( Math.abs( Change ) ) > 0 )
        {
            if ( Change > 0)
            {
                this.updateTransform( false, mGrabLoc, mRotate );
                mNudgeTransform.localMatrix = o3djs.math.matrix4.mul(mNudgeTransform.localMatrix, o3djs.math.matrix4.translation( [ 0.1, 0, 0] ) );
            } else if ( Change < 0)
            {
                this.updateTransform( false, mGrabLoc, mRotate );
                mNudgeTransform.localMatrix = o3djs.math.matrix4.mul(mNudgeTransform.localMatrix, o3djs.math.matrix4.translation( [ -0.1, 0, 0] ) );
            }

        }

        mGrabbed = [ Event.x, Event.y ];
        mLastRemained = TotalDelta % MinDistance;

        Game.doRender();
    }

    this.stopGrabbed = function( Game )
    {
        mGrabbed = null;
        this.updateTransform( false, mGrabLoc, mRotate );
        mShape.getMaterial().setGrabbed( false );

        Game.doRender();
    }

    this.getGrabbedLocation = function()
    {
        return mGrabLoc;
    }

    this.init( Game, Puzzle );
}

function ArrowShape( Game )
{
    var mShape = null;
    var mMaterial = null;
    var mPrimitive = null;
    var mDrawElement = null;
    var mStreamBank = null;

    this.init = function( Game )
    {
        mShape = Game.mPack.createObject('Shape');
        mMaterial = new ArrowMaterial( Game );

        mPrimitive = Game.mPack.createObject('Primitive');
        mPrimitive.owner = mShape;

        mPrimitive.material = mMaterial.getMaterial();

        mDrawElement = mPrimitive.createDrawElement(Game.mPack, null);

        mPrimitive.primitiveType = Game.mO3d.Primitive.TRIANGLELIST;
        mPrimitive.numberPrimitives = 8;

        mStreamBank = Game.mPack.createObject('StreamBank');

        mPrimitive.numberVertices = 24;
        mStreamBank.setVertexStream( Game.mO3d.Stream.POSITION, 0, this.getVerticesArray( Game ), 0);
        mStreamBank.setVertexStream( Game.mO3d.Stream.NORMAL, 0, this.getNormalsBuffer( Game ), 0 );
        mPrimitive.indexBuffer = this.getIndicesBuffer( Game );

        mPrimitive.streamBank = mStreamBank;
    }

    this.getVerticesArray = function( Game )
    {
        var VerticesBuffer = Game.mPack.createObject('VertexBuffer');
        var VertexArray = VerticesBuffer.createField('FloatField', 3);
        VerticesBuffer.set([
                0, 0.25, 0,
                -0.5, 0, 0,
                0, 0, 0.25
                ,
                0, 0, -0.25,
                -0.5, 0, 0,
                0, 0.25, 0
                ,
                0, 0, 0.25,
                -0.5, 0, 0,
                0, -0.25, 0
                ,
                0, -0.25, 0,
                -0.5, 0, 0,
                0, 0, -0.25
                ,
                0, 0, 0.25,
                0.5, 0, 0,
                0, 0.25, 0
                ,
                0, 0, 0.25,
                0, -0.25, 0,
                0.5, 0, 0
                ,
                0, 0, -0.25,
                0, 0.25, 0,
                0.5, 0, 0
                ,
                0, 0, -0.25,
                0.5, 0, 0,
                0, -0.25, 0
                 ]);

        return VertexArray;
    }

    this.getIndicesBuffer = function( Game )
    {
        var IndicesBuffer = Game.mPack.createObject('IndexBuffer');
        IndicesBuffer.set([
            0, 1, 2
            ,
            3, 4, 5
            ,
            6, 7, 8
            ,
            9, 10, 11
            ,
            12, 13, 14
            ,
            15, 16, 17
            ,
            18, 19, 20
            ,
            21, 22, 23
        ]);
        return IndicesBuffer;
    }

    this.getNormalsBuffer = function( Game )
    {
        var NormalsBuffer = Game.mPack.createObject('VertexBuffer');
        var NormalsField = NormalsBuffer.createField('FloatField', 3);

        NormalsBuffer.set( [
            -1, 1, 1,
            -1, 1, 1,
            -1, 1, 1
            ,
            -1, 1, -1,
            -1, 1, -1,
            -1, 1, -1
            ,
            -1, -1, 1,
            -1, -1, 1,
            -1, -1, 1
            ,
            -1, -1, -1,
            -1, -1, -1,
            -1, -1, -1
            ,
            1, 1, 1,
            1, 1, 1,
            1, 1, 1
            ,
            1, -1, 1,
            1, -1, 1,
            1, -1, 1
            ,
            1, 1, -1,
            1, 1, -1,
            1, 1, -1
            ,
            1, -1, -1,
            1, -1, -1,
            1, -1, -1
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

function ArrowMaterial( Game )
{
    var mMaterial = null;
    var mEffect = null;

    var mGrabbedParam = null

    var mNongrabbedColorParam = null;
    var mGrabbedColorParam = null;

    this.init = function(Game)
    {
        mMaterial = Game.mPack.createObject('Material');

        mMaterial.drawList = Game.mCamera.getViewInfo().zOrderedDrawList;//performanceDrawList;

        mEffect = Game.mPack.createObject('Effect');
        o3djs.effect.loadEffect( mEffect, 'PeeringArrow.shader');
        mMaterial.effect = mEffect;

        mEffect.createUniformParameters(mMaterial);

        mGrabbedParam = mMaterial.getParam('Grabbed');
        this.setGrabbed( false );

        mNongrabbedColorParam = mMaterial.getParam('NongrabbedColor');
        this.setNongrabbedColor( [ 0, 0.5, 1, 1 ] );
        mGrabbedColorParam = mMaterial.getParam('GrabbedColor');
        this.setGrabbedColor( [ 1, 0.5, 1, 1 ] );
    }

    this.getMaterial = function()
    {
        return mMaterial;
    }

    this.setGrabbed = function( Value )
    {
        mGrabbedParam.value = Value;
    }

    this.setNongrabbedColor = function( Value )
    {
        mNongrabbedColorParam.value = Value;
    }
    this.setGrabbedColor = function( Value )
    {
        mGrabbedColorParam.value = Value;
    }

    this.init(Game);
}


