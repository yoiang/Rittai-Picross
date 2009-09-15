function Puzzle(Game, setInfo, Camera )
{
    var mSolidBlocks = 0;
    var mSpaceBlocks = 0;
    var mRemainingFails = 0;
    
    var mBlocks = null;

    var mTransform = null;
    var mHiddenTransform = null;
    var mTreeInfo = null;

    var mInfo = setInfo;

    this.addBlock = function( Game, setCubeInfo )
    {
        if ( setCubeInfo.mSolid )
        {
            mSolidBlocks++;
        } else
        {
            mSpaceBlocks++;
        }

        setCubeInfo.mPuzzle = this;
        setCubeInfo.mParentTransform = mTransform;
        this.setBlock( setCubeInfo.mPuzzleLocation, new Cube(Game, setCubeInfo, true ) );
    }

    this.addBlockFromTrav = function( Game, Puzzle, Location, ExtraParams )
    {
        Puzzle.addBlock( Game, ExtraParams[ Location[0] ][ Location[1] ][ Location[2] ] );
    }

    this.fillPuzzle = function(Game)
    {
        mTransform = Game.mPack.createObject('Transform');
        mTransform.parent = Game.mClient.root;

        mHiddenTransform = Game.mPack.createObject('Transform');
        mHiddenTransform.parent = Game.mClient.root;

        mBlocks = [];

        BlocksDefinition = mInfo.mBlockDefinition;

        this.travBlocks( Game, this.addBlockFromTrav, BlocksDefinition );

        mTreeInfo = o3djs.picking.createTransformInfo(mTransform, null);
        mTreeInfo.update();
    }

    this.totalSolidCounts = function( Game, Puzzle, Location, ExtraParams )
    {
        var SolidCountX = ExtraParams[ 0 ];
        var SolidCountY = ExtraParams[ 1 ];
        var SolidCountZ = ExtraParams[ 2 ];

        if ( SolidCountX[ Location[ 1 ] ] == undefined )
        {
            SolidCountX[ Location[ 1 ] ] = [];
        }
        if ( SolidCountX[ Location[ 1 ] ][ Location[ 2 ] ] == undefined )
        {
            SolidCountX[ Location[ 1 ] ][ Location[ 2 ] ] = [];
        }
        if ( SolidCountY[ Location[ 0 ] ] == undefined )
        {
            SolidCountY[ Location[ 0 ] ] = [];
        }
        if ( SolidCountY[ Location[ 0 ] ][ Location[ 2 ] ] == undefined )
        {
            SolidCountY[ Location[ 0 ] ][ Location[ 2 ] ] = [];
        }

        if ( SolidCountZ[ Location[ 0 ] ] == undefined )
        {
            SolidCountZ[ Location[ 0 ] ] = [];
        }
        if ( SolidCountZ[ Location[ 0 ] ][ Location[ 1 ] ] == undefined )
        {
            SolidCountZ[ Location[ 0 ] ][ Location[ 1 ] ] = [];
        }
        if ( Puzzle.getBlock( Location ).getSolid() )
        {
            SolidCountX[ Location[ 1 ] ][ Location[ 2 ] ][ SolidCountX[ Location[ 1 ] ][ Location[ 2 ] ].length ] = 1;
            SolidCountY[ Location[ 0 ] ][ Location[ 2 ] ][ SolidCountY[ Location[ 0 ] ][ Location[ 2 ] ].length ] = 1;
            SolidCountZ[ Location[ 0 ] ][ Location[ 1 ] ][ SolidCountZ[ Location[ 0 ] ][ Location[ 1 ] ].length ] = 1;
        } else
        {
            SolidCountX[ Location[ 1 ] ][ Location[ 2 ] ][ SolidCountX[ Location[ 1 ] ][ Location[ 2 ] ].length ] = 0;
            SolidCountY[ Location[ 0 ] ][ Location[ 2 ] ][ SolidCountY[ Location[ 0 ] ][ Location[ 2 ] ].length ] = 0;
            SolidCountZ[ Location[ 0 ] ][ Location[ 1 ] ][ SolidCountZ[ Location[ 0 ] ][ Location[ 1 ] ].length ] = 0;
        }
    }
   
    this.setRowOnBlock = function( Game, Puzzle, Location, ExtraParams )
    {
        var SolidCountX = ExtraParams[ 0 ];
        var SolidCountY = ExtraParams[ 1 ];
        var SolidCountZ = ExtraParams[ 2 ];

        if ( SolidCountX[ Location[ 1 ] ][ Location[ 2 ] ] instanceof Array )
        {
            SolidCountX[ Location[ 1 ] ][ Location[ 2 ] ] = new RowInfo( SolidCountX[ Location[ 1 ] ][ Location[ 2 ] ], 0 );
        }
        if ( SolidCountY[ Location[ 0 ] ][ Location[ 2 ] ] instanceof Array )
        {
            SolidCountY[ Location[ 0 ] ][ Location[ 2 ] ] = new RowInfo( SolidCountY[ Location[ 0 ] ][ Location[ 2 ] ], 1 );
        }
        if ( SolidCountZ[ Location[ 0 ] ][ Location[ 1 ] ] instanceof Array )
        {
            SolidCountZ[ Location[ 0 ] ][ Location[ 1 ] ] = new RowInfo( SolidCountZ[ Location[ 0 ] ][ Location[ 1 ] ], 2 );
        }

        Puzzle.getBlock( Location ).setRows(
            [ SolidCountX[ Location[ 1 ] ][ Location[ 2 ] ],
              SolidCountY[ Location[ 0 ] ][ Location[ 2 ] ],
              SolidCountZ[ Location[ 0 ] ][ Location[ 1 ] ] ]
        );

        Puzzle.updateDimmedRow( Game, Location, SolidCountX[ Location[ 1 ] ][ Location[ 2 ] ] );
        Puzzle.updateDimmedRow( Game, Location, SolidCountY[ Location[ 0 ] ][ Location[ 2 ] ] );
        Puzzle.updateDimmedRow( Game, Location, SolidCountZ[ Location[ 0 ] ][ Location[ 1 ] ] );
    }

    this.setRowInfos = function( Game )
    {
        if ( mBlocks )
        {
            var SolidCountX = [];
            var SolidCountY = [];
            var SolidCountZ = [];
            this.travBlocks( Game, this.totalSolidCounts, [ SolidCountX, SolidCountY, SolidCountZ ] );
            this.travBlocks( Game, this.setRowOnBlock, [ SolidCountX, SolidCountY, SolidCountZ ] );
        }
    }

    this.showRowFaces = function( UnguaranteedLoc, Dimension )
    {
        for( var trav = 0; trav < this.getDimension( Dimension ); trav ++)
        {
            var updateCube = getByDimIterator3( mBlocks, UnguaranteedLoc, Dimension, trav );
            var Hide = updateCube.getHideNumbers();
            if ( Hide != null && Hide[ Dimension ] != 0 )
            {
                Hide[ Dimension ] = 0;
                updateCube.setHideNumbers( Hide );
            }
        }
    }
    
    this.attemptGuaranteeZeroRow = function( UnguaranteedLoc, Dimension, Guaranteed )
    {
        /*/ skip find unguaranteed, always assume we are doing it on a row with at least one?
        var FoundUnguaranteed = false;
        for( var trav = 0; trav < this.getDimension( Dimension ); trav ++ )
        {
            if ( getByDimIterator3( Guaranteed, UnguaranteedLoc, Dimension, trav ) == 0 )
            {
                FoundUnguaranteed = true;
                break;
            }
        }

        if ( FoundUnguaranteed )*/
        {
            for( var trav = 0; trav < this.getDimension( Dimension ); trav ++ )
            {
                setByDimIterator3( Guaranteed, UnguaranteedLoc, Dimension, trav, 1 );
            }
            return true;
        }
//        return false;
    }

    this.checkIndirectGuaranteed = function( UnguaranteedLoc, Dimension, Guaranteed )
    {
        var NotGuaranteed = [];
        for( var trav = 0; trav < this.getDimension( Dimension ); trav ++ ) // check that all spaces in row are guaranteed
        {
            var CheckSpace = getByDimIterator3( mBlocks, UnguaranteedLoc, Dimension, trav );
            if ( !CheckSpace.getSolid() )
            {
                if ( !getByDimIterator3( Guaranteed, UnguaranteedLoc, Dimension, trav ) )
                {
                    return false;
                }
            } else
            {
                if ( !getByDimIterator3( Guaranteed, UnguaranteedLoc, Dimension, trav ) )
                {
                    NotGuaranteed[ NotGuaranteed.length ] = trav;
                }
            }
        }

        // if so whole row is guaranteed
        for( trav = 0; trav < NotGuaranteed.length; trav ++ )
        {
            setByDimIterator3( Guaranteed, UnguaranteedLoc, Dimension, NotGuaranteed[ trav ], 1 );
        }
        return true;
    }
 
    this.attemptGuaranteeAdjacentRow = function( UnguaranteedLoc, Dimension, Guaranteed, RowNumber )
    {
        // TODO: beginning and end should be offset by surrounding guaranteed
        var MoreGuaranteed = false;
        var GuaranteedCount = 0;
        var Skip = this.getDimension( Dimension ) - RowNumber;
        for( var trav = 0; trav < this.getDimension( Dimension ); trav ++ )
        {
            if ( trav >= Skip && trav < this.getDimension( Dimension ) - Skip )
            {
                if ( getByDimIterator3( Guaranteed, UnguaranteedLoc, Dimension, trav ) == 0 )
                {
                    setByDimIterator3( Guaranteed, UnguaranteedLoc, Dimension, trav, 1 );
                    MoreGuaranteed = true;
                }
            }

            if ( getByDimIterator3( Guaranteed, UnguaranteedLoc, Dimension, trav ) == 1 )
            {
                GuaranteedCount ++;
            }
        }
        if ( GuaranteedCount >= RowNumber )
        {
            for( trav = 0; trav < this.getDimension( Dimension ); trav ++ )
            {
                if ( getByDimIterator3( Guaranteed, UnguaranteedLoc, Dimension, trav ) == 0 )
                {
                    setByDimIterator3( Guaranteed, UnguaranteedLoc, Dimension, trav, 1 );
                    MoreGuaranteed = true;
                }
            }
        }
        return MoreGuaranteed;
    }

    
    this.checkMoreGuaranteed = function( UnguaranteedLoc, Dimension, Guaranteed )
    {
        var MoreGuaranteed = false;
        
        var firstCube = getByDimIterator3( mBlocks, UnguaranteedLoc, Dimension, 0 );
        var Row = firstCube.getRows()[ Dimension ];

        var SpacesHint = Row.getSpacesHint();
        var RowNumber = Row.getNumber();
        if ( RowNumber == 0 )
        {
            MoreGuaranteed = this.attemptGuaranteeZeroRow( UnguaranteedLoc, Dimension, Guaranteed );
        } else
        {
            if ( Row.getSpaces() > 0 && this.checkIndirectGuaranteed( UnguaranteedLoc, Dimension, Guaranteed ) )
            {
                return false; // since whole row guaranteed break out and don't show faces
            }

            if ( SpacesHint == 0 )
            {
                //if ( this.getDimension( Dimension ) / 2.0 < Number )
    //            {
                    MoreGuaranteed = this.attemptGuaranteeAdjacentRow( UnguaranteedLoc, Dimension, Guaranteed, RowNumber );
      //          }
            } //todo: other spaces hints
            
        }

        return MoreGuaranteed;
    }

    this.attemptGuaranteeLocation = function( UnguaranteedLoc, Guaranteed )
    {
        var Unguaranteed = this.getBlock( UnguaranteedLoc );

        var Hidden = Unguaranteed.getHideNumbers();
        for( var Dimension = 0; Dimension < 3; Dimension ++ )
        {
            if ( Hidden[ Dimension ] == 1 )
            {
                if ( this.checkMoreGuaranteed( UnguaranteedLoc, Dimension, Guaranteed ))
                {
                    this.showRowFaces( UnguaranteedLoc, Dimension );

                    return true;
                }
            }
        }
        return false;
    }

    this.findUnguaranteedCubeLoc = function( Guaranteed, Last )
    {
        var StartFromLoc = null;
        if ( Last == null )
        {
            StartFromLoc = [ 0, 0, 0 ];
        } else
        {
            StartFromLoc = Last;
            StartFromLoc[0]++;
            if ( StartFromLoc[0] >= this.getDimension( 0 ) )
            {
                StartFromLoc[0] = 0;
                StartFromLoc[1] ++;
                if( StartFromLoc[1] >= this.getDimension(1) )
                {
                    StartFromLoc[1] = 0;
                    StartFromLoc[2] ++;
                    if ( StartFromLoc[2] >= this.getDimension(2) )
                    {
                        StartFromLoc[2] = 0;
                    }
                }
            }
        }
        
        var travX = StartFromLoc[0];
        var travY = StartFromLoc[1];
        var travZ = StartFromLoc[2];
        for(; travX < Guaranteed.length; travX ++)
        {
            for(; travY < Guaranteed[travX].length; travY ++)
            {
                for(; travZ < Guaranteed[travX][travY].length; travZ++)
                {
                    if ( Guaranteed[ travX ][ travY ][ travZ ] == 0 )
                    {
                        return [travX, travY, travZ];
                    }
                }
                travZ = 0;
            }
            travY = 0;
        }
        return null;
    }

    this.buildUnguaranteedList = function( Game, Puzzle, Location, ExtraParams )
    {
        var Guaranteed = ExtraParams[ 0 ];
        var SolidBlockLocs = ExtraParams[ 1 ];

        if ( Guaranteed[ Location[ 0 ] ] == undefined  )
        {
            Guaranteed[ Location[ 0 ] ] = [];
        }

        if ( Guaranteed[ Location[ 0 ] ][ Location[ 1 ] ] == undefined )
        {
            Guaranteed[ Location[ 0 ] ][ Location[ 1 ] ] = [];
        }

        Guaranteed[ Location[ 0 ] ][ Location[ 1 ] ][ Location[ 2 ] ] = 0;
        var Test = Puzzle.getBlock( Location );
        if ( Test != null && Test.getSolid() )
        {
            SolidBlockLocs[ SolidBlockLocs.length ] = Location;
        }
    }

    this.showNeededFaces = function( Game )
    {
        document.getElementById("DebugLog").innerHTML = "";

        var Guaranteed = [];
        var SolidBlockLocs = [];
        this.travBlocks( Game, this.buildUnguaranteedList, [ Guaranteed, SolidBlockLocs ] );

        // first try to guarantee the Solid Blocks
        for ( var travSolid = 0; travSolid < SolidBlockLocs.length; travSolid ++ )
        {
            this.attemptGuaranteeLocation( SolidBlockLocs[ travSolid ], Guaranteed );
        }

        var ItCount = 0;
        var NoImprovement = true;
        var UnguaranteedLoc = this.findUnguaranteedCubeLoc( Guaranteed, null );
        while ( UnguaranteedLoc != null || !NoImprovement)
        {
            if ( UnguaranteedLoc != null && this.attemptGuaranteeLocation( UnguaranteedLoc, Guaranteed ) )
            {
                NoImprovement = false;
            }
            
            UnguaranteedLoc = this.findUnguaranteedCubeLoc( Guaranteed, UnguaranteedLoc );
            if ( UnguaranteedLoc == null && NoImprovement == false )
            {
                NoImprovement = true;
                UnguaranteedLoc = this.findUnguaranteedCubeLoc( Guaranteed, null );
            }
            ItCount++;
        }

        document.getElementById("DebugLog").innerHTML += "showNeededFaces Iterated: " + ItCount;

        var count = 0;
        this.travBlocks( Game, this.countUnguaranteed, [ Guaranteed, count ] );

        if ( count > 0 )
            document.getElementById("DebugLog").innerHTML += " " + count;
    }

    this.countUnguaranteed = function( Game, Puzzle, Location, ExtraParams )
    {
        if ( ExtraParams[0] [ Location[ 0 ] ][ Location[ 1 ] ][ Location[ 2 ] ] == 0 )
        {
            ExtraParams[1] ++;
        }
    }

    this.showBlockFace = function( Game, Puzzle, Location )
    {
        Puzzle.getBlock( Location ).setHideNumbers( [ 0, 0, 0 ] );
    }

    this.showFaces = function( Game )
    {
        this.setRowInfos( Game );
        if ( Game.getHideUnneededFaces() )
        {
            this.showNeededFaces( Game );
        } else
        {
            this.travBlocks( Game, this.showBlockFace )
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
                for( var travRow = 0; travRow < this.getDimension( Dimension ); travRow ++ )
                {
                    var Test = getByDimIterator3( mBlocks, PuzzleLocation, Dimension, travRow );

                    if ( Test != null && !Test.getPainted() && !Test.getFailedBreak() )
                    {
                        Painted = false;
                        break;
                    }
                }
            }

            for( travRow = 0; travRow < this.getDimension( Dimension ); travRow ++ )
            {
                Set = getByDimIterator3( mBlocks, PuzzleLocation, Dimension, travRow );
                
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

    this.breakSpace = function( Game, breakMe, updateTreeInfo )
    {
        if ( breakMe && mBlocks )
        {
            var PuzzleLocation = breakMe.getPuzzleLocation();

            this.setBlock( PuzzleLocation, null );

            var mRows = breakMe.getRows();
            mRows[ 0 ].setSpaces( mRows[ 0 ].getSpaces() - 1 );
            mRows[ 1 ].setSpaces( mRows[ 1 ].getSpaces() - 1 );
            mRows[ 2 ].setSpaces( mRows[ 2 ].getSpaces() - 1 );

            this.updateDimmed( Game, PuzzleLocation, mRows );
            
            breakMe.destroy( Game );

            mSpaceBlocks--;
            this.updateWon(Game);

            if ( updateTreeInfo )
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


            Game.doRender();
        }
    }

    this.tryBreak = function( Game, Event )
    {
        var pickedCube = this.pickCube( Game, Event );
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
                this.breakSpace( Game, pickedCube, true );
            }

            Game.doRender();
        }
    }

    this.breakIfZero = function( Game, Puzzle, Location )
    {
        var Test = Puzzle.getBlock( Location );
        if ( Test != null )
        {
            var HideNumbers = Test.getHideNumbers();
            var Numbers = Test.getNumbers();
            for( var travDims = 0; travDims < 3; travDims ++ )
            {
                if ( HideNumbers[ travDims ] == 0 && Numbers[ travDims ] == 0 )
                {
                    Puzzle.breakSpace( Game, Test, false );
                    break;
                }
            }
        }
    }

    this.breakZeroRows = function( Game )
    {
        this.travBlocks( Game, this.breakIfZero );
        mTreeInfo.update();
    }

    this.setEditModeBlock = function( Game, Puzzle, Location, ExtraParams )
    {
        var EditMode = ExtraParams[ 0 ];

        if ( EditMode )
        {
            var ResetStatus = Puzzle.getBlock( Location );
            if ( ResetStatus != null )
            {
                if ( ResetStatus.getSolid() )
                {
                    ResetStatus.setFailedBreak( false );
                    ResetStatus.setPainted( false );
                    ResetStatus.setHideNumbers( [ 1, 1, 1 ] );
                } else
                {
                    ExtraParams[ 1 ] = true;

                    Puzzle.setBlock( Location, null );
                    ResetStatus.destroy( Game );

                    mSpaceBlocks --;
                    Game.doRender();
                }
            }
        } else
        {
            ResetStatus = Puzzle.getBlock( Location );
            if ( ResetStatus == null )
            {
                ExtraParams[ 1 ] = true;

                var Info = new CubeInfo();
                Info.mSolid = false;
                Info.mPuzzleLocation = Location;

                Puzzle.addBlock( Game, Info );
                Game.doRender();
            } else
            {
            }
        }
    }
    
    this.setEditMode = function( Game, Value )
    {
        var PassParams = [ Value, false ];
        this.travBlocks( Game, this.setEditModeBlock, PassParams );
        if ( Value )
        {
            gShapeTemplate.getMaterial().setEditMode( true );
            document.getElementById("EditModePuzzleTitle").value = this.getTitle();
            document.getElementById("EditModeAllowedFails").value = this.getAllowedFails();
            document.getElementById("EditModeBackgroundColor").value = ComponentToWebColor( this.getBackgroundColor() );
            document.getElementById("EditModePaintColor").value = ComponentToWebColor( this.getPaintColor() );
        } else
        {
            gShapeTemplate.getMaterial().setEditMode( false );
            this.setTitle( document.getElementById("EditModePuzzleTitle").value );
            this.setAllowedFails( parseInt( document.getElementById("EditModeAllowedFails").value ) );
            this.setBackgroundColor( WebColorToComponent( document.getElementById("EditModeBackgroundColor").value ) );
            this.setPaintColor( WebColorToComponent( document.getElementById("EditModePaintColor").value ) );
            this.showFaces( Game );

            this.resetRemainingFails();
        }
        if ( PassParams[ 1 ] )
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

            if ( addLoc[0] >= this.getDimension( 0 ) )
            {
                return;
            }
            if ( addLoc[1] >= this.getDimension( 1 ) )
            {
                return;
            }
            if ( addLoc[2] >= this.getDimension( 2 ) )
            {
                return;
            }

            var Info = new CubeInfo();
            Info.mSolid = true;
            Info.mPuzzleLocation = addLoc;
            Info.mFinishedColor = WebColorToComponent( document.getElementById("EditModeFinishedColor").value );

            this.addBlock( Game, Info );

            mTreeInfo.update();
            Game.doRender();
        }
    }

    this.editRemove = function( Game, Event )
    {
        pickedCube = this.pickCube( Game, Event );
        if ( pickedCube != null && mBlocks != null)
        {
            this.setBlock( pickedCube.getPuzzleLocation(), null );
            pickedCube.destroy( Game );

            mSolidBlocks--;

            mTreeInfo.update();
            Game.doRender();
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
        {
            var Cube = this.findCubeFromTransform( PickInfo.shapeInfo.parent.transform );
            if ( Game.mDebugOverlay )
            {
                Game.mDebugOverlay.setPickedCube( Cube );
            }
            return Cube;
        }
        return null;
    }

    this.createColorElement = function( XMLDoc, ElementName, Color )
    {
        var ColorElement = XMLDoc.createElement( ElementName );

        var Red = XMLDoc.createElement("ns1:r");
        var Green = XMLDoc.createElement("ns1:g");
        var Blue = XMLDoc.createElement("ns1:b");
        var Alpha = XMLDoc.createElement("ns1:a");
        Red.textContent = "" + parseFloat( Color[0] );
        Green.textContent = "" + parseFloat( Color[1] );
        Blue.textContent = "" + parseFloat( Color[2] );
        Alpha.textContent = "" + parseFloat( Color[3] );

        ColorElement.appendChild( Red );
        ColorElement.appendChild( Green );
        ColorElement.appendChild( Blue );
        ColorElement.appendChild( Alpha );

        return ColorElement;
    }

    this.createCubeElement = function( XMLDoc, useCubeInfo )
    {
        var Cube = XMLDoc.createElement( "ns1:Cube" );

        Cube.setAttribute( "Solid", useCubeInfo.mSolid );
        Cube.appendChild( this.createColorElement( XMLDoc, "ns1:FinishedColor", useCubeInfo.mFinishedColor ) );

        return Cube;
    }

    this.appendCubeElement = function( Game, Puzzle, Location, ExtraParams )
    {
        var XMLDoc = ExtraParams[ 0 ];
        var CubesElement = ExtraParams[ 1 ];
        var BlankCubeInfo = ExtraParams[ 2 ];
        
        var Test = Puzzle.getBlock( Location );
        if ( Test != null )
        {
            if ( Test.getSolid() )
            {
                CubesElement.appendChild( Puzzle.createCubeElement( XMLDoc, Test.getInfo() ) );
            } else
            {
                CubesElement.appendChild( Puzzle.createCubeElement( XMLDoc, BlankCubeInfo ) );
            }
        } else
        {
            CubesElement.appendChild( Puzzle.createCubeElement( XMLDoc, BlankCubeInfo ) );
        }
    }
    
    this.generateXML = function( Game )
    {
        var XMLDoc = document.implementation.createDocument("","",null);
        var PuzzleElement = XMLDoc.createElement("ns1:Puzzle");

        PuzzleElement.setAttribute( "Version", "3" );

        PuzzleElement.setAttribute( "Title", this.getTitle() );
        PuzzleElement.setAttribute( "XSize", this.getInfo().mDimensions[0] );
        PuzzleElement.setAttribute( "YSize", this.getInfo().mDimensions[1] );
        PuzzleElement.setAttribute( "ZSize", this.getInfo().mDimensions[2] );
        PuzzleElement.setAttribute( "AllowedFails", this.getInfo().mAllowedFails );

        PuzzleElement.setAttribute( "xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance" );
        PuzzleElement.setAttribute( "xmlns:ns1", "http://Rittai.Picross" );
        PuzzleElement.setAttribute( "xsi:schemaLocation", "http://Rittai.Picross file:/Users/Ian/workspace/Personal/Netbeans/Rittai%20Picross/src/js/Puzzle.xsd" );

        PuzzleElement.appendChild( this.createColorElement( XMLDoc, "ns1:BackgroundColor", this.getBackgroundColor() ) );
        PuzzleElement.appendChild( this.createColorElement( XMLDoc, "ns1:PaintColor", this.getPaintColor() ) );
        var CubesElement = XMLDoc.createElement( "ns1:Cubes" );

        var BlankCubeInfo = new CubeInfo();
        BlankCubeInfo.mSolid = false;

        this.travBlocks( Game, this.appendCubeElement, [ XMLDoc, CubesElement, BlankCubeInfo ] );

        PuzzleElement.appendChild( CubesElement );

        XMLDoc.appendChild(PuzzleElement);

        return XMLDoc;
    }

    this.save = function( Game )
    {
        var XMLDoc= this.generateXML( Game );
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + (new XMLSerializer()).serializeToString( XMLDoc );
    }

    this.checkForSolid = function( Dimension, Location )
    {
        var ODim1, ODim2;
        if ( Dimension == 0 )
        {
            ODim1 = 1;
            ODim2 = 2;
        } else if ( Dimension == 1 )
        {
            ODim1 = 0;
            ODim2 = 2;
        } else
        {
            ODim1 = 0;
            ODim2 = 1;
        }
        for ( var travODim1 = 0; travODim1 < this.getDimension( ODim1 ); travODim1 ++ )
        {
            for ( var travODim2 = 0; travODim2 < this.getDimension( ODim2 ); travODim2 ++ )
            {
                var CheckLocation = [];
                CheckLocation[Dimension] = Location;
                CheckLocation[ODim1] = travODim1;
                CheckLocation[ODim2] = travODim2;
                var Test = this.getBlock( CheckLocation );
                if ( Test != null && Test.getSolid() )
                {
                    return true;
                }
            }
        }
        return false;
    }

    this.findSolidLeading = function( Dimension )
    {
        for( var countTrim = 0; countTrim < this.getDimension( Dimension ); countTrim ++ )
        {
            if ( this.checkForSolid( Dimension, countTrim ) )
            {
//                countTrim --;
                break;
            }
        }
        return countTrim;
    }

    this.findSolidTrailing = function( Dimension )
    {
        for( var countTrim = this.getDimension( Dimension ) - 1; countTrim > 0; countTrim -- )
        {
            if ( this.checkForSolid( Dimension, countTrim ) )
            {
                countTrim ++;
                break;
            }
        }
        if ( countTrim == 0 )
        {
            return this.getDimension( Dimension );
        }
        return countTrim;
    }

    this.trim = function( Game )
    {
        var Leading = [];
        var Trailing = [];
        var NewMax = [];
        for ( var travDim = 0; travDim < 3; travDim ++ )
        {
            Leading [ travDim ] = this.findSolidLeading ( travDim );
            Trailing[ travDim ] = this.findSolidTrailing( travDim );
            NewMax  [ travDim ] = Trailing[ travDim ] - Leading[ travDim ];
        }

        var NewBlocks = [];
        for( var travX = 0; travX < this.getDimension( 0 ); travX ++)
        {
            if ( travX >= Leading[ 0 ] && travX < Trailing[ 0 ] )
            {
                NewBlocks[travX - Leading [ 0 ] ] = [];
            }

            for( var travY = 0; travY < this.getDimension( 1 ); travY ++)
            {
                if (
                    travX >= Leading[ 0 ] && travX < Trailing[ 0 ] &&
                    travY >= Leading[ 1 ] && travY < Trailing[ 1 ]
                    )
                {
                    NewBlocks[travX - Leading [ 0 ]][travY - Leading [ 1 ]] = [];
                }

                for( var travZ = 0; travZ < this.getDimension( 2 ); travZ++)
                {
                    var Test = this.getBlock( [travX, travY, travZ ] );
                    if (
                        travX >= Leading[ 0 ] && travX < Trailing[ 0 ] &&
                        travY >= Leading[ 1 ] && travY < Trailing[ 1 ] &&
                        travZ >= Leading[ 2 ] && travZ < Trailing[ 2 ]
                        )
                    {
                        if ( Test != null )
                        {
                            Test.setPuzzleLocation( [
                                travX - Leading[ 0 ],
                                travY - Leading[ 1 ],
                                travZ - Leading[ 2 ]
                            ]);
                        }
                        NewBlocks[travX - Leading [ 0 ]][travY - Leading [ 1 ]][travZ - Leading[ 2 ] ] = Test;
                    } else if ( Test != null )
                    {
                        Test.destroy( Game );
                    }
                    this.setBlock( [travX, travY, travZ], null );
                }
            }
        }

        mBlocks = NewBlocks;
        this.getInfo().mDimensions = NewMax;
    }

    this.getBlock = function( PuzzleLocation )
    {
        return mBlocks[ PuzzleLocation[ 0 ] ][ PuzzleLocation[ 1 ] ][ PuzzleLocation[ 2 ] ];
    }

    this.setBlock = function( PuzzleLocation, Value )
    {
        if ( mBlocks[ PuzzleLocation[ 0 ] ] == undefined )
        {
            mBlocks[ PuzzleLocation[ 0 ] ] = [];
        }
        if ( mBlocks[ PuzzleLocation[ 0 ] ][ PuzzleLocation[ 1 ] ] == undefined )
        {
            mBlocks[ PuzzleLocation[ 0 ] ][ PuzzleLocation[ 1 ] ] = [];
        }
        mBlocks[ PuzzleLocation[ 0 ] ][ PuzzleLocation[ 1 ] ][ PuzzleLocation[ 2 ] ] = Value;
    }

    this.getInfo = function()
    {
        return mInfo;
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
        return this.getInfo().mAllowedFails;
    }

    this.getRemainingFails = function ()
    {
        return mRemainingFails;
    }

    this.resetRemainingFails = function ()
    {
        mRemainingFails = this.getInfo().mAllowedFails;
    }

    this.setAllowedFails = function( Value )
    {
        this.getInfo().mAllowedFails = Value;
    }

    this.setDebug = function( Value )
    {
        if ( gShapeTemplate != null )
        {
            gShapeTemplate.getMaterial().setDebug( Value );
        }
    }

    this.setTitle = function( Value )
    {
        this.getInfo().mTitle = Value;
    }

    this.getTitle = function( Value )
    {
        return this.getInfo().mTitle;
    }

    this.getPaintColor = function()
    {
        return this.getInfo().mPaintColor;
    }

    this.setPaintColor = function( Value )
    {
        this.getInfo().mPaintColor = Value;
    }

    this.getBackgroundColor = function()
    {
        return this.getInfo().mBackgroundColor;
    }

    this.setBackgroundColor = function( Value )
    {
        this.getInfo().mBackgroundColor = Value;
    }

    this.getDimensions = function()
    {
        return this.getInfo().mDimensions;
    }

    this.getDimension = function( Dimension )
    {
        return this.getDimensions()[ Dimension ];
    }

    this.destroyBlock = function( Game, Puzzle, Location )
    {
        var Test = Puzzle.getBlock( Location );
        if ( Test != null )
        {
            Test.destroy( Game );
            Puzzle.setBlock( Location, null);
        }
    }

    this.destroy = function( Game )
    {
        this.travBlocks( Game, this.destroyBlock );
        
        if ( mArrowTransform != null )
        {
            Game.mPack.removeObject( mArrowTransform );
            mArrowTransform.parent = null;
            mArrowTransform = null;
        }

        if ( mTransform != null )
        {
            Game.mPack.removeObject(mTransform);
            mTransform.parent = null;
            mTransform = null;
        }
    }

    this.travBlocks = function( Game, DoThis, ExtraParams, DoEvery0, DoEvery1 )
    {
        for( var trav0 = 0; trav0 < this.getDimension( 0 ); trav0 ++)
        {
            if ( DoEvery0 )
            {
                DoEvery0( Game, this, [ trav0, 0, 0 ], ExtraParams );
            }

            for( var trav1 = 0; trav1 < this.getDimension( 1 ); trav1 ++)
            {
                if ( DoEvery1 )
                {
                    DoEvery1( Game, this, [ trav0, trav1, 0 ], ExtraParams );
                }

                for( var trav2 = 0; trav2 < this.getDimension( 2 ); trav2 ++)
                {
                    DoThis( Game, this, [ trav0, trav1, trav2 ], ExtraParams );
                }
            }
        }
    }

    var mArrowTree = null;
    var mArrowTransform = null;
    var mArrowShape = null;
    var mArrowLastLoc = null;
    var mArrowLastRemained = null;
    var mArrowGrabbed = null;

    var mPeeringDimension = null;
    var mPeeringDirection = null;
    var mPeeringTrav = -1;

    this.getPeeringDimension = function()
    {
        return mPeeringDimension;
    }

    this.getPeeringDirection = function()
    {
        return mPeeringDirection;
    }

    this.getPeeringTrav = function()
    {
        return mPeeringTrav;
    }

    this.setupArrow = function( Game )
    {
        mArrowTransform = Game.mPack.createObject('Transform');
        mArrowTransform.parent = Game.mClient.root;

        mArrowTree = o3djs.picking.createTransformInfo( mArrowTransform, null);
        mArrowTree.update();

        mArrowShape = new ArrowShape( Game );
        mArrowTransform.addShape( mArrowShape.getShape() );
        this.updateArrowLocation( Game );
    }

    var QuarterRot = Math.PI / 2.0;
    this.updateArrowLocation = function( Game )
    {
        if ( mPeeringTrav == -1 && Game.mCamera )
        {
            var Rotate = false;
            var RotZ = Game.mCamera.getEye().rotZ;
            var NewLoc = null;
            if ( RotZ >= 0 && RotZ < QuarterRot )
            {
                NewLoc = [ -1, 0, this.getDimension( 2 ) ];
                Rotate = true;
            } else if ( RotZ >= QuarterRot && RotZ < QuarterRot * 2 )
            {
                NewLoc = [ -1, 0, -1 ];
            } else if (  RotZ >= QuarterRot * 2 && RotZ < QuarterRot * 3 )
            {
                NewLoc = [ this.getDimension( 0 ), 0, -1 ];
                Rotate = true;
            } else
            {
                NewLoc = [ this.getDimension( 0 ), 0, this.getDimension( 2 ) ];
            }
            if ( mArrowLastLoc == null || mArrowLastLoc[0] != NewLoc[0] || mArrowLastLoc[1] != NewLoc[1] || mArrowLastLoc[2] != NewLoc[2] )
            {
                mArrowTransform.localMatrix = o3djs.math.matrix4.mul(o3djs.math.matrix4.identity(), o3djs.math.matrix4.translation( NewLoc ));
                mArrowLastLoc = NewLoc;
                mArrowTree.update();
            }
        }
    }

    this.tryGrabArrow = function( Game, Event )
    {
        var Ray = o3djs.picking.clientPositionToWorldRay(
            Event.x,
            Event.y,
            Game.mCamera.getViewInfo().drawContext,
            Game.mClient.width,
            Game.mClient.height);

        var PickInfo = mArrowTree.pick(Ray);
        if ( PickInfo && PickInfo.shapeInfo.parent.transform == mArrowTransform )
        {
            mArrowGrabbed = [ Event.x, Event.y ];

            if ( mPeeringTrav == -1 )
            {
                var RotZ = Game.mCamera.getEye().rotZ;
                if ( RotZ >= 0 && RotZ < QuarterRot )
                {
                    mPeeringDimension = 2;
                    mPeeringDirection = -1;
                } else if ( RotZ >= QuarterRot && RotZ < QuarterRot * 2 )
                {
                    mPeeringDimension = 0;
                    mPeeringDirection = 1;
                } else if (  RotZ >= QuarterRot * 2 && RotZ < QuarterRot * 3 )
                {
                    mPeeringDimension = 2;
                    mPeeringDirection = 1;
                } else
                {
                    mPeeringDimension = 0;
                    mPeeringDirection = -1;
                }
            }

            mArrowShape.getMaterial().setGrabbed( true );
            Game.doRender();
            return true;
        }
        Game.doRender();
        return false;
    }

    this.getArrowGrabbed = function()
    {
        return mArrowGrabbed != null;
    }

    this.moveArrow = function( Game, Event )
    {
        var Delta = [ Event.x - mArrowGrabbed[ 0 ], Event.y - mArrowGrabbed[ 1 ] ];
        var MinDistance = Game.mClient.width / 5.0;
        var TotalDelta = Math.floor( Math.sqrt( Math.pow(Delta[0], 2) + Math.pow(Delta[1], 2)) );
        if ( mArrowLastRemained != null )
        {
            TotalDelta += mArrowLastRemained;
        }
        var Sign = ( TotalDelta < MinDistance )? " < " :" > ";

        Change = TotalDelta / MinDistance;
        if ( Delta[0] < 0 )
        {
            Change *= -1;
        } else if ( Delta[0] == 0)
        {
            if ( Delta[1] < 0)
                Change *= -1;
        }

        this.updateHidden( Change < 0, mPeeringDimension, mPeeringDirection, Math.floor( Math.abs( Change ) ) );

        mArrowGrabbed = [ Event.x, Event.y ];
        mArrowLastRemained = TotalDelta % MinDistance;

        Game.doRender();
    }

    this.updateHidden = function( Hide, Dimension, Direction, Count )
    {
        var ODim1, ODim2;
        if ( Dimension == 0 )
        {
            ODim1 = 1;
            ODim2 = 2;
        } else  if ( Dimension == 1 )
        {
            ODim1 = 0;
            ODim2 = 2;
        } else
        {
            ODim1 = 0;
            ODim2 = 1;
        }

        var UpdateTree = false;
        while( Count != 0 )
        {
            if ( Hide )
            {
                if ( mPeeringTrav < this.getDimension( Dimension ) - 1 )
                    mPeeringTrav ++;
            }
            var Location = [];
            if ( Direction == 1 )
            {
                Location[ Dimension ] = mPeeringTrav;
            } else
            {
                Location[ Dimension ] = this.getDimension( Dimension ) - 1 - mPeeringTrav;
            }
            if ( Location[ Dimension ] >= 0 && Location[ Dimension ] < this.getDimension( Dimension ) )
            {
                for( var travODim1 = 0; travODim1 < this.getDimension( ODim1 ); travODim1 ++ )
                {
                    for( var travODim2 = 0; travODim2 < this.getDimension( ODim2 ); travODim2 ++ )
                    {
                        Location[ ODim1 ] = travODim1;
                        Location[ ODim2 ] = travODim2;
                        var HideBlock = this.getBlock( Location );
                        if ( HideBlock != null )
                        {
                            this.hideBlock( HideBlock, Hide );

                            UpdateTree = true;
                        }
                    }
                }
            }
            Count --;
            if ( !Hide )
            {
                if ( mPeeringTrav >= 0 )
                    mPeeringTrav --;

            }
        }

        if ( UpdateTree )
        {
            mTreeInfo.update();
        }
    }

    this.hideBlock = function( Block, Value )
    {
        if ( Value )
        {
            Block.setPeerThrough( true );
            Block.setParentTransform( mHiddenTransform );
        } else
        {
            Block.setPeerThrough( false );
            Block.setParentTransform( mTransform );
        }
    }

    this.unhideAllBlocks = function()
    {
        if ( mPeeringTrav != -1 )
        {
            var Count = mPeeringTrav + 1;
            this.updateHidden( false, mPeeringDimension, mPeeringDirection, Count );
        }
    }

    this.stopArrowGrabbed = function( Game, Event )
    {
        mArrowGrabbed = null;
        mArrowShape.getMaterial().setGrabbed( false );

        Game.doRender();
    }

    Camera.centerOnPuzzle( Game, this, true );
    this.fillPuzzle( Game );
    this.showFaces( Game );
    this.setupArrow( Game );
    this.resetRemainingFails();
}

function PuzzleInfo()
{
    this.mTitle = "";

    this.mAllowedFails = 0;

    this.mDimensions = null;
    this.mBlockDefinition = null;
    
    this.mPaintColor = [ 0, 0, 1, 1 ];
    this.mBackgroundColor = [ 1, 1, 1, 1 ];
}