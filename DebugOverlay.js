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

        this.mViewInfo.drawContext.view = Game.mMath.matrix4.lookAt( [0, 0, 1], [0, 0, 0], [0, 1, 0]);
//        this.mViewInfo.root.active = true;

        this.mCanvas = o3djs.canvas.create(Game.mPack, Game.mClient.root, this.mViewInfo);
        this.mDisplayQuad = this.mCanvas.createXYQuad(0, 0, -1, 200, 150, true);
//        this.mDisplayQuad.transform.identity();
//        this.mDisplayQuad.transform.translate(10, 10, -1);

        this.mCanvasPaint = Game.mPack.createObject('CanvasPaint');
    }
    this.init( Game );

    this.update = function( Game )
    {
        if (Game.mPuzzle == null)
        {
            return;
        }
        this.mDisplayQuad.canvas.clear([0, 0, 0, 0]);

//        this.mCanvasPaint.setOutline(3, [0, 0, 0, 1]);
        this.mCanvasPaint.textAlign = Game.mO3d.CanvasPaint.LEFT;
        this.mCanvasPaint.textSize = 20;
        this.mCanvasPaint.textTypeface = 'Arial';
        this.mCanvasPaint.shader = null;
        this.mCanvasPaint.color = [1, 1, 1, 1];
        this.mDisplayQuad.canvas.drawText('Invalid Blocks Left:' + Game.mPuzzle.mInvalidBlocks.toString(), 100, 70, this.mCanvasPaint);

        this.mDisplayQuad.updateTexture();
    }
}