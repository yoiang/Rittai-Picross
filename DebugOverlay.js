function DebugOverlay( Game )
{
    this.mViewInfo = null;
    this.mCanvas = null;
    this.mCanvasPaint = null;
    this.mDisplayQuad = null;

    var mPickedCubePuzzleLocation = null;

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
        this.mDisplayQuad = this.mCanvas.createXYQuad(0, 0, 0, Game.mClient.width, 600, true);

        this.mCanvasPaint = Game.mPack.createObject('CanvasPaint');
    }

    this.update = function( Game )
    {
        this.mDisplayQuad.canvas.clear([0, 0, 0, 0]);

        if (Game.mPuzzle != null)
        {
            this.mCanvasPaint.textAlign = Game.mO3d.CanvasPaint.LEFT;
            this.mCanvasPaint.textSize = 10;
            this.mCanvasPaint.textTypeface = 'Arial';
            this.mCanvasPaint.shader = null;

            this.mCanvasPaint.setOutline(0, [0, 0, 0, 0]);

            var Y = 15;
            this.mCanvasPaint.color = [0, 0.5, 0.5, 1];
            this.drawText('Space Blocks Left:' + Game.mPuzzle.getSpaceBlocks().toString(), 10, Y);
            this.drawText('Solid Blocks:' + Game.mPuzzle.getSolidBlocks().toString(), 10, Y += 13);
                this.drawText('Remaining Fails:' + Game.mPuzzle.getAllowedFails().toString(), 10, Y += 13);

            this.mCanvasPaint.color = [1, 0.5, 0, 1];
            this.drawText('Camera', 10, Y += 13, this.mCanvasPaint);
            this.drawText('Target: ( ' + Game.mCamera.getTarget()[0].toFixed(3) + ', ' + Game.mCamera.getTarget()[1].toFixed(3) + ', ' + Game.mCamera.getTarget()[2].toFixed(3) + ' )', 20, Y += 13);
            this.drawText('Eye - rotZ: ' + Game.mCamera.getEye().rotZ.toFixed(3) + '   rotH: ' + Game.mCamera.getEye().rotH.toFixed(3) + '   dFT: ' + Game.mCamera.getEye().distanceFromTarget.toFixed(3) + '   Location: ( ' + Game.mCamera.getEye().x.toFixed(3) + ', ' + Game.mCamera.getEye().y.toFixed(3) + ', ' + Game.mCamera.getEye().z.toFixed(3) + ' )', 20, Y += 13);

            if ( Game.mPuzzle != null )
            {
                var PeeringArrow = Game.mPuzzle.getPeeringArrow();
                this.mCanvasPaint.color = [0, 0, 1, 1 ];
                this.drawText('Peering', 10, Y += 13, this.mCanvasPaint);
                this.drawText('Arrow Grabbed: ' + PeeringArrow.getGrabbed(), 20, Y += 13);
                this.drawText('Peering - Dimension: ' + Game.mPuzzle.getPeeringDimension() + '   Direction: ' + Game.mPuzzle.getPeeringDirection() + '   Trav: ' + Game.mPuzzle.getPeeringTrav(), 20, Y += 13 );
                this.drawText('Attached Transforms: ' + Game.mPuzzle.getTransformInfo().transformCount, 20, Y += 13 );
            }

            if ( mPickedCubePuzzleLocation != null )
            {
                this.mCanvasPaint.color = [0, 0.5, 1, 1];
                this.drawText('Picked Cube: ( ' + mPickedCubePuzzleLocation[0] + ', ' + mPickedCubePuzzleLocation[1] + ', ' + mPickedCubePuzzleLocation[2] + ' )', 10, Y += 13, this.mCanvasPaint);
            }
        }
        this.mDisplayQuad.updateTexture();
    }

    this.drawText = function( Text, X, Y )
    {
        this.mDisplayQuad.canvas.drawText(Text, X, Y, this.mCanvasPaint);
    }

    this.setPickedCube = function( Cube )
    {
        mPickedCubePuzzleLocation = Cube.getPuzzleLocation();
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
    
    this.init( Game );
}

function getTransformCount( Start )
{
    var Count = 1;
    for (var key in Start.childTransformInfos)
    {
        var transformInfo = Start.childTransformInfos[key];
        Count = Count + getTransformCount( transformInfo );
    }
    return Count;
}