function Puzzle(Game, BlocksDefinition, AllowedFails )
{
    var mSolidBlocks = 0;
    var mSpaceBlocks = 0;
    var mAllowedFails = AllowedFails;
    var mRemainingFails = AllowedFails;
    
    var mBlocks = null;
    var mMax = null;

    var mTransform = null;
    var mTreeInfo = null;
	
    this.fillPuzzle = function(Game, BlocksDefinition)
    {
        mTransform = Game.mPack.createObject('Transform');
        mTransform.parent = Game.mClient.root;

        mBlocks = [];
        mMax = [];

        if ( mMax[ 0 ] == undefined || mBlocks.length > mMax[ 0 ] )
        {
            mMax[ 0 ] = BlocksDefinition.length;
        }

        for( var travX = 0; travX < BlocksDefinition.length; travX ++)
        {
            mBlocks[travX] = [];
            if ( mMax[ 1 ] == undefined || BlocksDefinition[travX].length > mMax[ 1 ] )
            {
                mMax[ 1 ] = BlocksDefinition[travX].length;
            }
            for( var travY = 0; travY < BlocksDefinition[travX].length; travY ++)
            {
                mBlocks[travX][travY] = [];
                if ( mMax[ 2 ] == undefined || BlocksDefinition[travX].length > mMax[ 2 ] )
                {
                    mMax[ 2 ] = BlocksDefinition[travX][travY].length;
                }
                for( var travZ = 0; travZ < BlocksDefinition[travX][travY].length; travZ++)
                {
                    var addCube = null;
                    if ( BlocksDefinition[travX][travY][travZ] == 1)
                    {
                        addCube = new Cube(Game, this, true, mTransform, travX, travY, travZ );
                        mSolidBlocks++;
                    } else
                    {
                        addCube = new Cube(Game, this, false, mTransform, travX, travY, travZ );
                        mSpaceBlocks++;
                    }

                    if ( Game.mDebug )
                    {
                        addCube.setDebug(true);
                    }

                    mBlocks[travX][travY][travZ] = addCube;
                }
            }
        }

        mTreeInfo = o3djs.picking.createTransformInfo(mTransform, null);
        mTreeInfo.update();
    }
    this.fillPuzzle(Game, BlocksDefinition);

    this.setFaces = function( Game )
    {
        if ( mBlocks )
        {
            var SolidCountX = [];
            var SolidCountY = [];
            var SolidCountZ = [];
            for( var travX = 0; travX < mBlocks.length; travX ++)
            {
                for( var travY = 0; travY < mBlocks[travX].length; travY ++)
                {
                    for( var travZ = 0; travZ < mBlocks[travX][travY].length; travZ ++)
                    {
                        if ( SolidCountX[travY] == undefined )
                        {
                            SolidCountX[travY] = [];
                        }
                        if ( SolidCountX[travY][travZ] == undefined )
                        {
                            SolidCountX[travY][travZ] = [];
                        }
                        if ( SolidCountY[travX] == undefined )
                        {
                            SolidCountY[travX] = [];
                        }
                        if ( SolidCountY[travX][travZ] == undefined )
                        {
                            SolidCountY[travX][travZ] = [];
                        }

                        if ( SolidCountZ[travX] == undefined )
                        {
                            SolidCountZ[travX] = [];
                        }
                        if ( SolidCountZ[travX][travY] == undefined )
                        {
                            SolidCountZ[travX][travY] = [];
                        }
                        if ( mBlocks[travX][travY][travZ].getSolid() )
                        {
                            SolidCountX[travY][travZ][ SolidCountX[travY][travZ].length ] = 1;
                            SolidCountY[travX][travZ][ SolidCountY[travX][travZ].length ] = 1;
                            SolidCountZ[travX][travY][ SolidCountZ[travX][travY].length ] = 1;
                        } else
                        {
                            SolidCountX[travY][travZ][ SolidCountX[travY][travZ].length ] = 0;
                            SolidCountY[travX][travZ][ SolidCountY[travX][travZ].length ] = 0;
                            SolidCountZ[travX][travY][ SolidCountZ[travX][travY].length ] = 0;
                        }
                    }
                }
            }


            for( travX = 0; travX < mBlocks.length; travX ++)
            {
                for( travY = 0; travY < mBlocks[travX].length; travY ++)
                {
                    for( travZ = 0; travZ < mBlocks[travX][travY].length; travZ ++)
                    {
                        mBlocks[travX][travY][travZ].setRows(Game,
                            new RowInfo(SolidCountX[travY][travZ]),
                            new RowInfo(SolidCountY[travX][travZ]),
                            new RowInfo(SolidCountZ[travX][travY])
                            );
                    }
                }
            }
        }
    }
    this.setFaces(Game);

    this.breakSpace = function( Game, breakMe )
    {
        if ( breakMe )
        {
            if ( mBlocks && mBlocks[breakMe.getPuzzleLocX()][breakMe.getPuzzleLocY()][breakMe.getPuzzleLocZ()] == breakMe )
            {
                breakMe.destroy( Game );

                mBlocks[breakMe.getPuzzleLocX()][breakMe.getPuzzleLocY()][breakMe.getPuzzleLocZ()] = null;
                mSpaceBlocks--;
                this.updateWon(Game);
				
                mTreeInfo.update();
            }
        }
    }

    this.triedBreakSolid = function( Game, triedMe )
    {
        triedMe.setFailedBreak( true );
        mRemainingFails --;
        this.updateLost(Game);
    }

    this.getSolidBlocks = function()
    {
        return mSolidBlocks;
    }

    this.getSpaceBlocks = function()
    {
        return mSpaceBlocks;
    }

    this.getAllowedFails = function ()
    {
        return mAllowedFails;
    }

    this.getRemainingFails = function ()
    {
        return mRemainingFails;
    }

    this.getLost = function( )
    {
        return this.getRemainingFails() == 0;
    }

    this.updateLost = function( Game )
    {
        if ( this.getLost() )
        {
            Game.setLost( true );
        }
    }

    this.getWon = function( )
    {
        return this.getSpaceBlocks() == 0;
    }

    this.updateWon = function( Game )
    {
        if ( !this.getLost( ) && this.getWon() )
        {
            Game.setWon( true );
        }
    }

    this.getTransform = function()
    {
        return mTransform;
    }

    this.destroy = function( Game )
    {
        for( var travX = 0; travX < mBlocks.length; travX ++)
        {
            for( var travY = 0; travY < mBlocks[travX].length; travY ++)
            {
                for( var travZ = 0; travZ < mBlocks[travX][travY].length; travZ ++)
                {
                    if ( mBlocks[travX][travY][travZ] )
                    {
                        mBlocks[travX][travY][travZ].destroy( Game );
                        mBlocks[travX][travY][travZ] = null;
                    }
                }
            }
        }

        Game.mPack.removeObject(mTransform);
        mTransform.parent = null;
        mTransform = null;
    }

    this.setDebug = function( Value )
    {
        for( var travX = 0; travX < mBlocks.length; travX ++)
        {
            for( var travY = 0; travY < mBlocks[travX].length; travY ++)
            {
                for( var travZ = 0; travZ < mBlocks[travX][travY].length; travZ ++)
                {
                    if ( mBlocks[travX][travY][travZ] )
                    {
                        mBlocks[travX][travY][travZ].setDebug(Value);
                    }
                }
            }
        }
    }

    this.getMax = function()
    {
        return mMax;
    }

    this.tryPaint = function( Game, Event )
    {
        var pickedCube = this.pickCube( Game, Event );
        if ( pickedCube != null )
        {
            pickedCube.togglePainted( Game );
        }
    }

    this.tryBreak = function( Game, Event )
    {
        pickedCube = this.pickCube( Game, Event );
        if ( pickedCube != null )
        {
            if ( pickedCube.getPainted() || pickedCube.getFailedBreak() )
            {
                return;
            }

            if ( pickedCube.getSolid() )
            {
                this.triedBreakSolid( Game, pickedCube );
            } else
            {
                this.breakSpace( Game, pickedCube );
            }
        }
    }

    this.pickShape = function( Game, Event )
    {
        var Ray = o3djs.picking.clientPositionToWorldRay(
            Event.x,
            Event.y,
            Game.mCamera.getViewInfo().drawContext,
            Game.mClient.width,
            Game.mClient.height);

        return mTreeInfo.pick(Ray);
    }

    this.findCubeFromShape = function( Shape )
    {
        for( var travShapeToCube = 0; travShapeToCube < gShapeToCube.length; travShapeToCube ++)
        {
            if ( gShapeToCube[ travShapeToCube ][ 0 ] == Shape )
            {
                return gShapeToCube[ travShapeToCube ][ 1 ];
            }
        }
        return null;
    }

    this.pickCube = function( Game, Event )
    {
        var PickInfo = this.pickShape( Game, Event );
        if ( PickInfo )
            return this.findCubeFromShape( PickInfo.shapeInfo.shape );
        return null;
    }
}