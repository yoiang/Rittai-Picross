function DebugOverlay( Game )
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
        this.mDisplayQuad = this.mCanvas.createXYQuad(0, 0, 0, Game.mClient.width, 600, true);

        this.mCanvasPaint = Game.mPack.createObject('CanvasPaint');
    }
    this.init( Game );

    this.update = function( Game )
    {
        this.mDisplayQuad.canvas.clear([0, 0, 0, 0]);

        if (Game.mPuzzle != null)
        {
            //            this.mCanvasPaint.setOutline(0, [0, 0, 0, 1]);
            this.mCanvasPaint.textAlign = Game.mO3d.CanvasPaint.LEFT;
            this.mCanvasPaint.textSize = 10;
            this.mCanvasPaint.textTypeface = 'Arial';
            this.mCanvasPaint.shader = null;
            this.mCanvasPaint.color = [1, 0, 0, 1];
            this.mDisplayQuad.canvas.drawText('Space Blocks Left:' + Game.mPuzzle.getSpaceBlocks().toString(), 10, 15, this.mCanvasPaint);
            this.mDisplayQuad.canvas.drawText('Solid Blocks:' + Game.mPuzzle.getSolidBlocks().toString(), 10, 28, this.mCanvasPaint);
            this.mDisplayQuad.canvas.drawText('Remaining Fails:' + Game.mPuzzle.getAllowedFails().toString(), 10, 41, this.mCanvasPaint);
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