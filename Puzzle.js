function Puzzle(Game, setInfo, Camera )
{
    var mSolidBlocks = 0;
    var mSpaceBlocks = 0;
    var mRemainingFails = setInfo.mAllowedFails;
    
    var mBlocks = null;
    var mMax = null;

    var mTransform = null;
    var mTreeInfo = null;

    var mInfo = setInfo;

    this.addBlock = function( Game, PuzzleLocation, Solid )
    {
        var add = null;

        if ( Solid )
        {
            add = new Cube(Game, this, true, mTransform, PuzzleLocation, true );
            mSolidBlocks++;
        } else
        {
            add = new Cube(Game, this, false, mTransform, PuzzleLocation, true );
            mSpaceBlocks++;
        }
        if ( Game.mDebug )
        {
            add.setDebug(true);
        }

        mBlocks[ PuzzleLocation[0] ][ PuzzleLocation[1] ][ PuzzleLocation[2] ] = add;
    }

    this.fillPuzzle = function(Game)
    {
        mTransform = Game.mPack.createObject('Transform');
        mTransform.parent = Game.mClient.root;

        mBlocks = [];
        mMax = [];

        BlocksDefinition = mInfo.mBlockDefinition;
        
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
                    this.addBlock( Game, [ travX, travY, travZ ], BlocksDefinition[travX][travY][travZ] == 1 );

                    Game.mClient.render();
                }
            }
        }

        mTreeInfo = o3djs.picking.createTransformInfo(mTransform, null);
        mTreeInfo.update();
    }

    this.setRowInfos = function( Game )
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
                        if ( SolidCountX[travY][travZ] instanceof Array )
                        {
                            SolidCountX[ travY ][ travZ ] = new RowInfo( SolidCountX[travY][travZ], 0 );
                        }
                        if ( SolidCountY[travX][travZ] instanceof Array )
                        {
                            SolidCountY[ travX ][ travZ ] = new RowInfo( SolidCountY[travX][travZ], 1 );
                        }
                        if ( SolidCountZ[travX][travY] instanceof Array )
                        {
                            SolidCountZ[ travX ][ travY ] = new RowInfo( SolidCountZ[travX][travY], 2 );
                        }

                        mBlocks[travX][travY][travZ].setRows(Game,
                            SolidCountX[ travY ][ travZ ],
                            SolidCountY[ travX ][ travZ ],
                            SolidCountZ[ travX ][ travY ]
                        );

                        this.updateDimmedRow( Game, [ travX, travY, travZ ], SolidCountX[ travY ][ travZ ] );
                        this.updateDimmedRow( Game, [ travX, travY, travZ ], SolidCountY[ travX ][ travZ ] );
                        this.updateDimmedRow( Game, [ travX, travY, travZ ], SolidCountZ[ travX ][ travY ] );
                    }
                }
            }
        }
    }
   
    this.getBlockByDimIterator = function( PuzzleLocation, Dimension, Iterator )
    {
        if ( Dimension == 0 )
        {
            return mBlocks[ Iterator ][ PuzzleLocation[ 1 ] ][ PuzzleLocation[ 2 ] ];
        } else if ( Dimension == 1 )
        {
            return mBlocks[ PuzzleLocation[ 0 ] ][ Iterator ][ PuzzleLocation[ 2 ] ];
        } else
        {
            return mBlocks[ PuzzleLocation[ 0 ] ][ PuzzleLocation[ 1 ] ][ Iterator ];
        }
    }

    this.updateDimmedRow = function( Game, PuzzleLocation, Row )
    {
        var Painted;
        if ( Row.getSpaces() == 0 )
        {
            var Dimension = Row.getDimension();
            if ( Game.getOnlyDimIfPainted() )
            {
                Painted = true;
                for( var travRow = 0; travRow < mMax[ Dimension ]; travRow ++ )
                {
                    var Test = this.getBlockByDimIterator( PuzzleLocation, Dimension, travRow );

                    if ( Test != null && !Test.getPainted() && !Test.getFailedBreak() )
                    {
                        Painted = false;
                        break;
                    }
                }
            }

            for( travRow = 0; travRow < mMax[ Dimension ]; travRow ++ )
            {
                Set = this.getBlockByDimIterator( PuzzleLocation, Dimension, travRow );
                
                if ( Set != null )
                {
                    var Dim = Set.getDimNumbers();
                    Dim[ Dimension ] = ( !Game.getOnlyDimIfPainted() || Painted ) ? 1 : 0;
                    Set.setDimNumbers( Dim );
                }
            }
        }
    }

    this.updateDimmed = function( Game, PuzzleLocation, Rows )
    {
        for( var travRows = 0; travRows < 3; travRows ++ )
        {
            this.updateDimmedRow( Game, PuzzleLocation, Rows[ travRows ] );
        }
    }

    this.breakSpace = function( Game, breakMe )
    {
        if ( breakMe && mBlocks )
        {
            var PuzzleLocation = breakMe.getPuzzleLocation();

            mBlocks[ PuzzleLocation[0] ][ PuzzleLocation[1] ][ PuzzleLocation[2] ] = null;

            var mRows = breakMe.getRows();
            mRows[ 0 ].setSpaces( mRows[ 0 ].getSpaces() - 1 );
            mRows[ 1 ].setSpaces( mRows[ 1 ].getSpaces() - 1 );
            mRows[ 2 ].setSpaces( mRows[ 2 ].getSpaces() - 1 );

            this.updateDimmed( Game, PuzzleLocation, mRows );
            
            breakMe.destroy( Game );

            mSpaceBlocks--;
            this.updateWon(Game);

            mTreeInfo.update();
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
        return mInfo.mAllowedFails;
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

            if ( Game.getOnlyDimIfPainted())
            {
                this.updateDimmed( Game, pickedCube.getPuzzleLocation(), pickedCube.getRows() );
            }


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
        var NeedsUpdate = false;
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
                            NeedsUpdate = true;

                            var remove = mBlocks[travX][travY][travZ];
                            mBlocks[travX][travY][travZ] = null;
                            remove.destroy( Game );

                            mSpaceBlocks --;
                            Game.mClient.render();
                        }
                    }
                }
            }
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
                            NeedsUpdate = true;
                            
                            this.addBlock( Game, [ travX, travY, travZ ], false ); // TODO: reinit puzzle
                            Game.mClient.render();
                        }
                    }
                }
            }
            this.setRowInfos( Game );
        }
        if ( NeedsUpdate )
        {
            mTreeInfo.update();
        }
    }

    this.editAdd = function( Game, Event )
    {
        var pickedShape = this.pickShape( Game, Event );
        if ( pickedShape )
        {
            var pickedCube = this.findCubeFromTransform( pickedShape.shapeInfo.parent.transform );
            if ( pickedCube == null )
            {
                return;
            }
            var relHitPos = pickedShape.worldIntersectionPosition;
            var addLoc = [ pickedCube.getPuzzleLocation()[0], pickedCube.getPuzzleLocation()[1], pickedCube.getPuzzleLocation()[2] ];

            relHitPos[ 0 ] -= addLoc[0];
            relHitPos[ 1 ] -= addLoc[1];
            relHitPos[ 2 ] -= addLoc[2];

            if ( relHitPos[ 0 ] == Math.round( relHitPos[ 0 ] ) )
            {
                if ( relHitPos[ 0 ] == 0 )
                {
                    addLoc[ 0 ] -= 1;
                } else
                {
                    addLoc[ 0 ] += 1;
                }
            } else if ( relHitPos[ 1 ] == Math.round( relHitPos[ 1 ] ) )
            {
                if ( relHitPos[ 1 ] == 0 )
                {
                    addLoc[ 1 ] -= 1;
                } else
                {
                    addLoc[ 1 ] += 1;
                }
            } else if ( relHitPos[ 2 ] == Math.round( relHitPos[ 2 ] ) )
            {
                if ( relHitPos[ 2 ] == 0 )
                {
                    addLoc[ 2 ] -= 1;
                } else
                {
                    addLoc[ 2 ] += 1;
                }
            }
                //TODO: shift puzzle
            if ( addLoc[0] < 0 )
            {
                return;
            }
            if ( addLoc[1] < 0 )
            {
                return;
            }
            if ( addLoc[2] < 0 )
            {
                return;
            }

            if ( addLoc[0] >= mMax[0] )
            {
                return;
            }
            if ( addLoc[1] >= mMax[1] )
            {
                return;
            }
            if ( addLoc[2] >= mMax[2] )
            {
                return;
            }

            this.addBlock( Game, addLoc, true );

            mTreeInfo.update();
            Game.mClient.render();
        }
    }

    this.editRemove = function( Game, Event )
    {
        pickedCube = this.pickCube( Game, Event );
        if ( pickedCube != null && mBlocks != null)
        {
            var PuzzleLoc = pickedCube.getPuzzleLocation();

            mBlocks[ PuzzleLoc[0] ][ PuzzleLoc[1] ][ PuzzleLoc[2] ] = null;
            pickedCube.destroy( Game );

            mSolidBlocks--;

            mTreeInfo.update();
            Game.mClient.render();
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

    this.findCubeFromTransform = function( Transform )
    {
        for( var travTransformToCube = 0; travTransformToCube < gTransformToCube.length; travTransformToCube ++)
        {
            if ( gTransformToCube[ travTransformToCube ][ 0 ] == Transform )
            {
                return gTransformToCube[ travTransformToCube ][ 1 ];
            }
        }
        return null;
    }

    this.pickCube = function( Game, Event )
    {
        var PickInfo = this.pickShape( Game, Event );
        if ( PickInfo )
            return this.findCubeFromTransform( PickInfo.shapeInfo.parent.transform );
        return null;
    }

    this.save = function( Game )
    {
        var Output = "";
        Output += "2\n"; // file version
        Output += "Title = \"" + this.getInfo().mTitle + "\"\n";
        Output += "AllowedFails = " + this.getInfo().mAllowedFails + "\n";
        Output += "Dimensions = [ " + mMax.toString() + " ]\n";
        Output += "Puzzle = [ ";
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
                if ( travY < mBlocks[travX].length - 1 )
                {
                    Output += "\n";
                }
            }
            if ( travX < mBlocks.length - 1 )
            {
                Output += "\n";
            }
        }
        Output += " ]\n";
        Output += "PaintColor = [ " + this.getInfo().mPaintColor.toString() + " ]\n";
        return Output;
    }

    this.getInfo = function()
    {
        return mInfo;
    }

    Camera.centerOn( Game, [ mInfo.mBlockDefinition.length, mInfo.mBlockDefinition[0].length, mInfo.mBlockDefinition[0][0].length] );
    this.fillPuzzle(Game);
    this.setRowInfos(Game);
    Camera.centerOnPuzzle( Game, this );
}

function PuzzleInfo()
{
    this.mTitle = "";

    this.mAllowedFails = 0;

    this.mDimensions = null;
    this.mBlockDefinition = null;
    
    this.mPaintColor = [ 0, 0, 1, 1 ];
}