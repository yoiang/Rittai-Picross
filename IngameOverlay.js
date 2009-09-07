function IngameOverlay( Game )
{
    this.mViewInfo = null;
    this.mFailsViewInfo = null;
    this.mCanvas = null;
    this.mCanvasPaint = null;
    this.mDisplayQuad = null;

    var mAllowedFails = null;
    var mTransform = null;

    this.init = function( Game )
    {
        this.mViewInfo = o3djs.rendergraph.createBasicView(Game.mPack, Game.mClient.root, Game.mClient.renderGraphRoot);
        this.mViewInfo.root.priority = 100000;
        this.mViewInfo.clearBuffer.clearColorFlag = false;
        this.mViewInfo.zOrderedState.getStateParam('CullMode').value = Game.mO3d.State.CULL_NONE;

        this.mViewInfo.drawContext.projection = o3djs.math.matrix4.orthographic(
            0,
            Game.mClient.width,
            Game.mClient.height,
            0,
            0.001,
            1000);

        this.mViewInfo.drawContext.view = o3djs.math.matrix4.lookAt(
            [0, 0, 1],   // eye
            [0, 0, 0],   // target
            [0, 1, 0]); // up

        this.mCanvas = o3djs.canvas.create(Game.mPack, Game.mClient.root, this.mViewInfo);
        this.mDisplayQuad = this.mCanvas.createXYQuad(0, 0, 0, Game.mClient.width, Game.mClient.height, true);

        this.mCanvasPaint = Game.mPack.createObject('CanvasPaint');




        mTransform = Game.mPack.createObject('Transform');
//        mTransform.localMatrix = o3djs.math.matrix4.mul(mTransform.localMatrix, o3djs.math.matrix4.translation([0,0,0]));
        mTransform.parent = Game.mClient.root;

       this.mFailsViewInfo = o3djs.rendergraph.createExtraView(Game.mCamera.getViewInfo(), [0.0, 0.8, 1.0, 0.2 ], [ 1, 0, 0, 1 ], 10000 ); //createView(Game.mPack, mTransform, Game.mClient.renderGraphRoot);
        this.mFailsViewInfo.clearBuffer.clearColorFlag = false;
        this.mFailsViewInfo.zOrderedState.getStateParam('CullMode').value = Game.mO3d.State.CULL_NONE;

        this.mFailsViewInfo.drawContext.projection = o3djs.math.matrix4.orthographic(
            -10.0,
            10.0,
            -2.0,
            2.0,
            0.001,
            100);

        this.mFailsViewInfo.drawContext.view = o3djs.math.matrix4.lookAt(
            [0, -99, 2],   // eye
            [0, -99, 0],   // target
            [0, -1, 0]); // up

        this.update( Game );
    }

    this.finishedCreatePuzzle = function( Game, Puzzle )
    {        
        mAllowedFails = [];

        for (var travAllowedFails = 0; travAllowedFails < Puzzle.getAllowedFails(); travAllowedFails ++)
        {
            var Info = new CubeInfo();
            Info.mParentTransform = mTransform;
            Info.mSolid = true;
            Info.mPuzzleLocation = [ travAllowedFails * 2.0 - Puzzle.getAllowedFails(), -100, 0 ];
            Info.mFinishedColor = [ 1, 1, 1, 1 ];
            mAllowedFails[travAllowedFails] = new Cube(Game, Info, false );
        }
    }

    this.updateRemainingFails = function( Game, Puzzle )
    {
        for (var travAllowedFails = 0; travAllowedFails < Puzzle.getAllowedFails(); travAllowedFails ++)
        {
            if ( travAllowedFails < Puzzle.getRemainingFails() )
            {
                mAllowedFails[travAllowedFails].setFailedBreak( false );
            } else
            {
                mAllowedFails[travAllowedFails].setFailedBreak( true );
            }
        }
    }

    this.update = function( Game )
    {
        this.mDisplayQuad.canvas.clear([0, 0, 0, 0]);

        var scaleBy = 0.8;
        var PaintDown = false;
        if ( Game.mInputState && Game.mInputState.isKeyDown(87))
        {
            PaintDown = true;
            this.mDisplayQuad.canvas.drawBitmap(
                gIndicatorPaintTexture,
                50.0 - gIndicatorPaintTexture.width / 2.0,
                500.0 + gIndicatorPaintTexture.height / 2.0);
        } else
        {
            this.mDisplayQuad.canvas.saveMatrix();
            this.mDisplayQuad.canvas.scale(scaleBy, scaleBy);

            this.mDisplayQuad.canvas.drawBitmap(
                gIndicatorPaintTexture,
                50.0 / scaleBy - gIndicatorPaintTexture.width / 2.0,
                500.0 / scaleBy + gIndicatorPaintTexture.height / 2.0);
            this.mDisplayQuad.canvas.restoreMatrix();
        }

        if ( !PaintDown && Game.mInputState && Game.mInputState.isKeyDown(88) )
        {
            this.mDisplayQuad.canvas.drawBitmap(
                gIndicatorBreakTexture,
                50.0 - gIndicatorBreakTexture.width / 2.0,
                530.0 + gIndicatorBreakTexture.height / 2.0);
        } else
        {
            this.mDisplayQuad.canvas.saveMatrix();
            this.mDisplayQuad.canvas.scale(scaleBy, scaleBy);

            this.mDisplayQuad.canvas.drawBitmap(
                gIndicatorBreakTexture,
                50.0 / scaleBy - gIndicatorBreakTexture.width / 2.0,
                530.0 / scaleBy + gIndicatorBreakTexture.height / 2.0);
            this.mDisplayQuad.canvas.restoreMatrix();
        }

        this.mDisplayQuad.updateTexture();
        Game.doRender();
    }

    this.puzzleDestroyed = function( Game )
    {
        if ( mAllowedFails != null )
        {
            for(var travAllowedFails = 0; travAllowedFails < mAllowedFails.length; travAllowedFails ++)
            {
                mAllowedFails[ travAllowedFails ].destroy( Game );
                mAllowedFails[ travAllowedFails ] = null;
            }
            mAllowedFails = null;
        }
        /*if ( mTransform != null )
        {
            mTransform.parent = null;
            Game.mPack.removeObject(mTransform);
            mTransform = null;
        }*/
    }

    this.destroy = function( Game )
    {
        this.puzzleDestroyed( Game );
        this.mViewInfo.destroy();
        Game.mPack.removeObject(this.mCanvasPaint);
        this.mViewInfo = null;
        this.mCanvas = null;
        this.mCanvasPaint = null;
        this.mDisplayQuad = null;
    }

    this.init( Game );
}