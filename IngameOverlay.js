function IngameOverlay( Game )
{
    this.mViewInfo = null;
    this.mCanvas = null;
    this.mCanvasPaint = null;
    this.mDisplayQuad = null;

    this.init = function( Game )
    {
        this.mViewInfo = o3djs.rendergraph.createBasicView(Game.mPack, Game.mClient.root, Game.mClient.renderGraphRoot);
        this.mViewInfo.root.priority = 100000;
        this.mViewInfo.clearBuffer.clearColorFlag = false;
        this.mViewInfo.zOrderedState.getStateParam('CullMode').value = Game.mO3d.State.CULL_NONE;

        this.mViewInfo.drawContext.projection = Game.mMath.matrix4.orthographic(
            0,
            Game.mClient.width,
            Game.mClient.height,
            0,
            0.001,
            1000);

        this.mViewInfo.drawContext.view = Game.mMath.matrix4.lookAt(
            [0, 0, 1],   // eye
            [0, 0, 0],   // target
            [0, 1, 0]); // up

        this.mCanvas = o3djs.canvas.create(Game.mPack, Game.mClient.root, this.mViewInfo);
        this.mDisplayQuad = this.mCanvas.createXYQuad(0, 0, 0, Game.mClient.width, Game.mClient.height, true);

        this.mCanvasPaint = Game.mPack.createObject('CanvasPaint');
    }
    this.init( Game );

    this.update = function( Game )
    {
        this.mDisplayQuad.canvas.clear([0, 0, 0, 0]);

        var scaleBy = 0.8;
        var PaintDown = false;
        if ( Game.mInputState.isKeyDown(87))
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

            // Note that the coordinates passed to drawBitmap get scaled by the current
            // canvas drawing matrix and therefore we adjust them by the scale to get
            // the bitmap to follow the mouse position.
            this.mDisplayQuad.canvas.drawBitmap(
                gIndicatorPaintTexture,
                50.0 / scaleBy - gIndicatorPaintTexture.width / 2.0,
                500.0 / scaleBy + gIndicatorPaintTexture.height / 2.0);
            this.mDisplayQuad.canvas.restoreMatrix();
        }

        if ( !PaintDown && Game.mInputState.isKeyDown(88) )
        {
            this.mDisplayQuad.canvas.drawBitmap(
                gIndicatorBreakTexture,
                50.0 - gIndicatorBreakTexture.width / 2.0,
                530.0 + gIndicatorBreakTexture.height / 2.0);
        } else
        {
            this.mDisplayQuad.canvas.saveMatrix();
            this.mDisplayQuad.canvas.scale(scaleBy, scaleBy);

            // Note that the coordinates passed to drawBitmap get scaled by the current
            // canvas drawing matrix and therefore we adjust them by the scale to get
            // the bitmap to follow the mouse position.
            this.mDisplayQuad.canvas.drawBitmap(
                gIndicatorBreakTexture,
                50.0 / scaleBy - gIndicatorBreakTexture.width / 2.0,
                530.0 / scaleBy + gIndicatorBreakTexture.height / 2.0);
            this.mDisplayQuad.canvas.restoreMatrix();
        }

        this.mDisplayQuad.updateTexture();
    }

    this.destroy = function( Game )
    {
        this.mViewInfo.destroy();
        Game.mPack.removeObject(this.mCanvasPaint);
        this.mViewInfo = null;
        this.mCanvas = null;
        this.mCanvasPaint = null;
        this.mDisplayQuad = null;
    }
}