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
                0.5, 0.75, 0.5,
                0, 0.5, 0.5,
                0.5, 0.5, 0.75
                ,
                0.5, 0.5, 0.25,
                0, 0.5, 0.5,
                0.5, 0.75, 0.5
                ,
                0.5, 0.5, 0.75,
                0, 0.5, 0.5,
                0.5, 0.25, 0.5
                ,
                0.5, 0.25, 0.5,
                0, 0.5, 0.5,
                0.5, 0.5, 0.25
                ,
                0.5, 0.5, 0.75,
                1, 0.5, 0.5,
                0.5, 0.75, 0.5
                ,
                0.5, 0.5, 0.75,
                0.5, 0.25, 0.5,
                1, 0.5, 0.5
                ,
                0.5, 0.5, 0.25,
                0.5, 0.75, 0.5,
                1, 0.5, 0.5
                ,
                0.5, 0.5, 0.25,
                1, 0.5, 0.5,
                0.5, 0.25, 0.5
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


