function Puzzle(Game, BlocksDefinition, AllowedFails )
{
    this.mSolidBlocks = 0;
    this.mSpaceBlocks = 0;
    this.mAllowedFails = AllowedFails;
    
    this.mBlocks = null;
    this.mMax = null;

    this.mTreeInfo = null;
	
    this.fillPuzzle = function(Game, BlocksDefinition)
    {
        this.mBlocks = [];
        this.mMax = [];

        if ( this.mMax[ 0 ] == undefined || this.mBlocks.length > this.mMax[ 0 ] )
        {
            this.mMax[ 0 ] = BlocksDefinition.length;
        }

        for( var travX = 0; travX < BlocksDefinition.length; travX ++)
        {
            this.mBlocks[travX] = [];
            if ( this.mMax[ 1 ] == undefined || BlocksDefinition[travX].length > this.mMax[ 1 ] )
            {
                this.mMax[ 1 ] = BlocksDefinition[travX].length;
            }
            for( var travY = 0; travY < BlocksDefinition[travX].length; travY ++)
            {
                this.mBlocks[travX][travY] = [];
                if ( this.mMax[ 2 ] == undefined || BlocksDefinition[travX].length > this.mMax[ 2 ] )
                {
                    this.mMax[ 2 ] = BlocksDefinition[travX][travY].length;
                }
                for( var travZ = 0; travZ < BlocksDefinition[travX][travY].length; travZ++)
                {
                    var addCube = null;
                    if ( BlocksDefinition[travX][travY][travZ] == 1)
                    {
                        addCube = new Cube(Game, this, true, travX, travY, travZ );
                        this.mSolidBlocks++;
                    } else
                    {
                        addCube = new Cube(Game, this, false, travX, travY, travZ );
                        this.mSpaceBlocks++;
                    }
                    addCube.mTransform.localMatrix = Game.mMath.matrix4.mul(addCube.mTransform.localMatrix, Game.mMath.matrix4.translation([travX,travY,travZ]));

                    if ( Game.mDebug )
                    {
                        addCube.setDebug(true);
                    }

                    this.mBlocks[travX][travY][travZ] = addCube;
                }
            }
        }
		
		this.mTreeInfo = o3djs.picking.createTransformInfo(Game.mClient.root, null);
		this.mTreeInfo.update();
	}
    this.fillPuzzle(Game, BlocksDefinition);

    this.setFaces = function( Game )
    {
        if ( this.mBlocks )
        {
            var SolidCountX = [];
            var SolidCountY = [];
            var SolidCountZ = [];
            for( var travX = 0; travX < this.mBlocks.length; travX ++)
            {
                for( var travY = 0; travY < this.mBlocks[travX].length; travY ++)
                {
                    for( var travZ = 0; travZ < this.mBlocks[travX][travY].length; travZ ++)
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
                        if ( this.mBlocks[travX][travY][travZ].getSolid() )
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


            for( travX = 0; travX < this.mBlocks.length; travX ++)
            {
                for( travY = 0; travY < this.mBlocks[travX].length; travY ++)
                {
                    for( travZ = 0; travZ < this.mBlocks[travX][travY].length; travZ ++)
                    {
                        this.mBlocks[travX][travY][travZ].setRows(Game,
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
            if ( this.mBlocks && this.mBlocks[breakMe.mPuzzleLocX][breakMe.mPuzzleLocY][breakMe.mPuzzleLocZ] == breakMe )
            {
                breakMe.destroy( Game );

                this.mBlocks[breakMe.mPuzzleLocX][breakMe.mPuzzleLocY][breakMe.mPuzzleLocZ] = null;
                this.mSpaceBlocks--;
                this.updateWon(Game);
				
				this.mTreeInfo.update();
            }
        }
    }

    this.triedBreakSolid = function( Game, triedMe )
    {
        triedMe.setFailedBreak( true );
        this.mAllowedFails --;
        this.updateFailed(Game);
    }

    this.getSolidBlocks = function()
    {
        return this.mSolidBlocks;
    }

    this.getSpaceBlocks = function()
    {
        return this.mSpaceBlocks;
    }

    this.getAllowedFails = function ()
    {
        return this.mAllowedFails;
    }

    this.getFailed = function( )
    {
        return this.mAllowedFails == 0;
    }

    this.updateFailed = function( Game )
    {
        if ( this.getFailed() )
        {
            Game.mViewInfo.clearBuffer.clearColor = [1, 0, 0, 1];
        }
    }

    this.getWon = function( )
    {
        return this.mSpaceBlocks == 0;
    }

    this.updateWon = function( Game )
    {
        if ( !this.getFailed( ) && this.getWon() )
        {
            Game.mViewInfo.clearBuffer.clearColor = [0.5, 0.5, 1, 1];
        }
    }

    this.destroy = function( Game )
    {
        for( var travX = 0; travX < this.mBlocks.length; travX ++)
        {
            for( var travY = 0; travY < this.mBlocks[travX].length; travY ++)
            {
                for( var travZ = 0; travZ < this.mBlocks[travX][travY].length; travZ ++)
                {
                    if ( this.mBlocks[travX][travY][travZ] )
                    {
                        this.mBlocks[travX][travY][travZ].destroy( Game );
                        this.mBlocks[travX][travY][travZ] = null;
                    }
                }
            }
        }
    }

    this.setDebug = function( Value )
    {
        for( var travX = 0; travX < this.mBlocks.length; travX ++)
        {
            for( var travY = 0; travY < this.mBlocks[travX].length; travY ++)
            {
                for( var travZ = 0; travZ < this.mBlocks[travX][travY].length; travZ ++)
                {
                    if ( this.mBlocks[travX][travY][travZ] )
                    {
                        this.mBlocks[travX][travY][travZ].setDebug(Value);
                    }
                }
            }
        }
    }
}