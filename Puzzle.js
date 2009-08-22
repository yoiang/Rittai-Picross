function Puzzle(Game, BlocksDefinition, AllowedFails, Camera )
{
    var mSolidBlocks = 0;
    var mSpaceBlocks = 0;
    var mAllowedFails = AllowedFails;
    var mRemainingFails = AllowedFails;
    
    var mBlocks = null;
    var mMax = null;

    var mTransform = null;
    var mTreeInfo = null;

    this.addBlock = function( Game, X, Y, Z, Solid )
    {
        var add = null;

        if ( Solid )
        {
            add = new Cube(Game, this, true, mTransform, X, Y, Z, true );
            mSolidBlocks++;
        } else
        {
            add = new Cube(Game, this, false, mTransform, X, Y, Z, true );
            mSpaceBlocks++;
        }
        if ( Game.mDebug )
        {
            add.setDebug(true);
        }

        mBlocks[X][Y][Z] = add;
    }

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
                    this.addBlock( Game, travX, travY, travZ, BlocksDefinition[travX][travY][travZ] == 1 );

                    Game.mClient.render();
                }
            }
        }

        mTreeInfo = o3djs.picking.createTransformInfo(mTransform, null);
        mTreeInfo.update();
    }

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

    this.breakSpace = function( Game, breakMe )
    {
        if ( breakMe )
        {
            if ( mBlocks && mBlocks[breakMe.getPuzzleLocX()][breakMe.getPuzzleLocY()][breakMe.getPuzzleLocZ()] == breakMe )
            {
                mBlocks[breakMe.getPuzzleLocX()][breakMe.getPuzzleLocY()][breakMe.getPuzzleLocZ()] = null;

                breakMe.destroy( Game );

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
        Game.mIngameOverlay.updateRemainingFails( Game, this );
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

    this.shouldLose = function( )
    {
        return this.getRemainingFails() == 0;
    }

    this.updateLost = function( Game )
    {
        if ( !Game.getLost() && !Game.getWon() && this.shouldLose() )
        {
            Game.setLost( true );
        }
    }

    this.shouldWin = function( )
    {
        return this.getSpaceBlocks() == 0;
    }

    this.updateWon = function( Game )
    {
        if ( !Game.getLost() && !Game.getWon() && this.shouldWin() )
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

        Game.mClient.render();
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

            Game.mClient.render();
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

            Game.mClient.render();
        }
    }

    this.setEditMode = function( Game, Value )
    {
        if ( Value )
        {
            for( var travX = 0; travX < mBlocks.length; travX ++)
            {
                for( var travY = 0; travY < mBlocks[travX].length; travY ++)
                {
                    for( var travZ = 0; travZ < mBlocks[travX][travY].length; travZ ++)
                    {
                        if ( mBlocks[travX][travY][travZ] && mBlocks[travX][travY][travZ].getSolid() == false )
                        {
                            var remove = mBlocks[travX][travY][travZ];
                            mBlocks[travX][travY][travZ] = null;
                            remove.destroy( Game );

                            mSpaceBlocks --;
                            Game.mClient.render();
                        }
                    }
                }
            }
            mTreeInfo.update();
        } else
        {
            for( travX = 0; travX < mBlocks.length; travX ++)
            {
                for( travY = 0; travY < mBlocks[travX].length; travY ++)
                {
                    for( travZ = 0; travZ < mBlocks[travX][travY].length; travZ ++)
                    {
                        if ( mBlocks[travX][travY][travZ] == null )
                        {
                            this.addBlock( Game, travX, travY, travZ, false ); // TODO: reinit puzzle
                            Game.mClient.render();
                        }
                    }
                }
            }
            this.setFaces( Game );
            mTreeInfo.update();
        }
    }

    this.editAdd = function( Game, Event )
    {

    }

    this.editRemove = function( Game, Event )
    {
        pickedCube = this.pickCube( Game, Event );
        if ( pickedCube != null )
        {
            if ( mBlocks && mBlocks[pickedCube.getPuzzleLocX()][pickedCube.getPuzzleLocY()][pickedCube.getPuzzleLocZ()] == pickedCube )
            {
                mBlocks[pickedCube.getPuzzleLocX()][pickedCube.getPuzzleLocY()][pickedCube.getPuzzleLocZ()] = null;
                pickedCube.destroy( Game );

                mSolidBlocks--;

                mTreeInfo.update();
                Game.mClient.render();
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

    this.save = function( Game )
    {
        var Output = "";
        Output += "1\n"; // file version
        Output += mAllowedFails + "\n";
        Output += mMax[0] + " " + mMax[1] + " " + mMax[2] + "\n\n";
        for( travX = 0; travX < mBlocks.length; travX ++)
        {
            for( travY = 0; travY < mBlocks[travX].length; travY ++)
            {
                for( travZ = 0; travZ < mBlocks[travX][travY].length; travZ ++)
                {
                    if ( mBlocks[travX][travY][travZ] != null )
                    {
                        if ( mBlocks[ travX ][ travY ][ travZ ].getSolid() )
                        {
                            Output += "1 ";
                        } else
                        {
                            Output += "0 ";
                        }
                    } else
                    {
                        Output += "0 ";
                    }
                }
                Output += "\n";
            }
            Output += "\n";
        }
        return Output;
    }

    Camera.centerOn( Game, [ BlocksDefinition.length, BlocksDefinition[0].length, BlocksDefinition[0][0].length] );
    this.fillPuzzle(Game, BlocksDefinition);
    this.setFaces(Game);
    Camera.centerOnPuzzle( Game, this );
}