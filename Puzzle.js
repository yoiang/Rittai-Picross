function Puzzle(Game, setInfo )
{
    var mInfo = setInfo;

    var mSolidBlocks = 0;
    var mSpaceBlocks = 0;
    var mRemainingFails = 0;
    
    var mBlocks = null;

    var mTransform = null;
    var mHiddenTransform = null;
    var mTreeInfo = null;

    var mPeeringArrow = null;
    var mPeeringDimension = null;
    var mPeeringDirection = null;
    var mPeeringTrav = -1;

    this.init = function(Game)
    {
        Game.mCamera.centerOnPuzzle( Game, this, true );
        mTransform = Game.mPack.createObject('Transform');
        mTransform.parent = Game.mClient.root;

        mHiddenTransform = Game.mPack.createObject('Transform');
        mHiddenTransform.parent = Game.mClient.root;

        mBlocks = [];

        BlocksDefinition = mInfo.mBlockDefinition;

        this.travBlocks( Game, this.addBlockFromTrav, BlocksDefinition );
        this.travBlocks( Game, this.detachNonvisibleBlockFromTrav );

        mTreeInfo = o3djs.picking.createTransformInfo(mTransform, null);
        mTreeInfo.update();

        this.showFaces( Game );

        mPeeringArrow = new PeeringArrow( Game, this );
        this.updatePeeringArrowLocation( Game );

        this.resetRemainingFails();
    }

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
    
    this.isBlockVisible = function( Block )
    {
        if ( Block == null )
        {
            return false;
        }
        if ( Block.getParentTransform() == mHiddenTransform )
        {
            return false;
        }
        return true;
    }

    this.detachNonvisibleBlock = function( Detach )
    {
        if ( Detach == null )
        {
            return;
        }
        var Location = Detach.getPuzzleLocation();
        if ( !this.isBlockVisible( this.getBlock( [ Location[ 0 ] - 1, Location[ 1 ], Location[ 2 ] ] ) ) )
        {
            return;
        }
        if ( !this.isBlockVisible( this.getBlock( [ Location[ 0 ] + 1, Location[ 1 ], Location[ 2 ] ] ) ) )
        {
            return;
        }
        if ( !this.isBlockVisible( this.getBlock( [ Location[ 0 ], Location[ 1 ] - 1, Location[ 2 ] ] ) ) )
        {
            return;
        }
        if ( !this.isBlockVisible( this.getBlock( [ Location[ 0 ], Location[ 1 ] + 1, Location[ 2 ] ] ) ) )
        {
            return;
        }
        if ( !this.isBlockVisible( this.getBlock( [ Location[ 0 ], Location[ 1 ], Location[ 2 ] - 1 ] ) ) )
        {
            return;
        }
        if ( !this.isBlockVisible( this.getBlock( [ Location[ 0 ], Location[ 1 ], Location[ 2 ] + 1 ] ) ) )
        {
            return;
        }

        Detach.attachToParentTransform( false );
    }

    this.detachNonvisibleBlockFromTrav = function( Game, Puzzle, Location, ExtraParams )
    {
        Puzzle.detachNonvisibleBlock( Puzzle.getBlock( Location ) );
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
        var SolidCountX = [];
        var SolidCountY = [];
        var SolidCountZ = [];
        this.travBlocks( Game, this.totalSolidCounts, [ SolidCountX, SolidCountY, SolidCountZ ] );

        for( var trav1 = 0; trav1 < SolidCountX.length; trav1 ++ )
        {
            for ( var trav2 = 0; trav2 < SolidCountX[ trav1 ].length; trav2 ++ )
            {
                SolidCountX[ trav1 ][ trav2 ] = new RowInfo( SolidCountX[ trav1 ][ trav2 ], 0 );
            }
        }
        for( trav1 = 0; trav1 < SolidCountY.length; trav1 ++ )
        {
            for ( trav2 = 0; trav2 < SolidCountY[ trav1 ].length; trav2 ++ )
            {
                SolidCountY[ trav1 ][ trav2 ] = new RowInfo( SolidCountY[ trav1 ][ trav2 ], 1 );
            }
        }
        for( trav1 = 0; trav1 < SolidCountZ.length; trav1 ++ )
        {
            for ( trav2 = 0; trav2 < SolidCountZ[ trav1 ].length; trav2 ++ )
            {
                SolidCountZ[ trav1 ][ trav2 ] = new RowInfo( SolidCountZ[ trav1 ][ trav2 ], 2 );
            }
        }

        this.travBlocks( Game, this.setRowOnBlock, [ SolidCountX, SolidCountY, SolidCountZ ] );
    }

    this.showRowFaces = function( UnguaranteedLoc, Dimension )
    {
        var RowLocation = dupArray( UnguaranteedLoc );
        for( var trav = 0; trav < this.getDimension( Dimension ); trav ++)
        {
            RowLocation[ Dimension ] = trav;
            var updateCube = this.getBlock( RowLocation );
            var Hide = updateCube.getHideNumbers();
            if ( Hide != null && Hide[ Dimension ] != 0 )
            {
                Hide[ Dimension ] = 0;
                updateCube.setHideNumbers( Hide );
            }
        }
    }
    
    this.guaranteeZeroRow = function( UnguaranteedLoc, Dimension )
    {
        var RowLocation = dupArray( UnguaranteedLoc );
        for( var trav = 0; trav < this.getDimension( Dimension ); trav ++ )
        {
            RowLocation[ Dimension ] = trav;
            this.getBlock( RowLocation ).setGuaranteed(true);
        }
        return true;
    }

    this.findPossibleSolidSets = function( Location, Dimension )
    {
        var RowLocation = dupArray( Location );
        var SolidSets = [];
        var NewSet = true;
        for( var travRow = 0; travRow < this.getDimension( Dimension ); travRow ++ )
        {
            RowLocation[ Dimension ] = travRow;
            var Block = this.getBlock(RowLocation);
            if ( Block.getSolid() )
            {
                if ( NewSet )
                {
                    SolidSets[ SolidSets.length ] = [ travRow, 1 ];
                    NewSet = false;
                } else
                {
                    SolidSets[ SolidSets.length - 1 ][ 1 ] ++;
                }
            } else
            {
                if ( !NewSet )
                {
                    if ( Block.getGuaranteed() )
                    {
                        NewSet = true;
                    } else
                    {
                        SolidSets[ SolidSets.length - 1 ][ 1 ] ++;
                    }
                }
            }
        }
        return SolidSets;
    }
 
    // perhaps add a passive and aggressive guaranteeing, if passive isn't complete do agressive, skip Dimension == RowNumber in passive, etc etc
    this.attemptGuaranteeAdjacentRow = function( UnguaranteedLoc, Dimension, RowNumber )
    {
        var SolidSets = this.findPossibleSolidSets( UnguaranteedLoc, Dimension );
        var PossibleSets = [];
        for( var travSolidSets = 0 ; travSolidSets < SolidSets.length; travSolidSets ++ )
        {
            if ( SolidSets[ travSolidSets ][ 1 ] >= RowNumber )
            {
                PossibleSets[ PossibleSets.length ] = SolidSets[ travSolidSets ];
            } else
            {
                var travLocation = dupArray( UnguaranteedLoc );
                for( var trav = SolidSets[ travSolidSets ][ 0 ]; trav < SolidSets[ travSolidSets ][ 0 ] + SolidSets[ travSolidSets ][ 1 ]; trav ++ )
                {
                    travLocation[ Dimension ] = trav;
                    this.getBlock( travLocation ).setGuaranteed(true);
                }
            }
        }

        if ( PossibleSets.length != 1 )
        {
            return false;
        }

        var Skip = PossibleSets[ 0 ][ 1 ] - RowNumber;
        if ( Skip >= RowNumber )
        {
            return false;
        }

        var ShowFaces = false;
        travLocation = dupArray( UnguaranteedLoc );
        for( trav = PossibleSets[ 0 ][ 0 ] + Skip; trav < PossibleSets[ 0 ][ 0 ] + PossibleSets[ 0 ][ 1 ] - Skip; trav ++ )
        {
            travLocation[ Dimension ] = trav;
            var Block = this.getBlock( travLocation );
            if ( Block != null && !Block.getGuaranteed() )
            {
                Block.setGuaranteed( true );
                ShowFaces = true;
            }
        }
        return ShowFaces;
    }
    
    this.attemptGuaranteeRow = function( UnguaranteedLoc, Dimension )
    {
        var ShowFaces = false;

        var ForRow = this.getBlock( UnguaranteedLoc );
        var Row = ForRow.getRows()[ Dimension ];

        var RowNumber = Row.getNumber();
        if ( RowNumber == 0 )
        {
            ShowFaces = this.guaranteeZeroRow( UnguaranteedLoc, Dimension );
        } else
        {
            var SpacesHint = Row.getSpacesHint();
            if ( SpacesHint == 0 )
            {
                ShowFaces = this.attemptGuaranteeAdjacentRow( UnguaranteedLoc, Dimension, RowNumber );
            } else
            {
                // for now always show more complex rows
                ShowFaces = true;
            }
            
        }

        return ShowFaces;
    }

    this.attemptGuaranteeLocation = function( UnguaranteedLoc )
    {
        var Unguaranteed = this.getBlock( UnguaranteedLoc );

        var Hidden = Unguaranteed.getHideNumbers();
        for( var Dimension = 0; Dimension < 3; Dimension ++ )
        {
            if ( Hidden[ Dimension ] == 1 )
            {
                if ( this.attemptGuaranteeRow( UnguaranteedLoc, Dimension ))
                {
                    this.showRowFaces( UnguaranteedLoc, Dimension );

                    return true;
                }
            }
        }
        return false;
    }

    this.findUnguaranteedCubeLoc = function( Last )
    {
        var StartFromLoc = null;
        if ( Last == null )
        {
            StartFromLoc = [ 0, 0, 0 ];
        } else
        {
            StartFromLoc = dupArray( Last );
            StartFromLoc[2] = StartFromLoc[2] + 1;
            if ( StartFromLoc[2] >= this.getDimension( 2 ) )
            {
                StartFromLoc[2] = 0;
                StartFromLoc[1] = StartFromLoc[1] + 1;
                if( StartFromLoc[1] >= this.getDimension(1) )
                {
                    StartFromLoc[1] = 0;
                    StartFromLoc[0] = StartFromLoc[0] + 1;
                    if ( StartFromLoc[0] >= this.getDimension(0) )
                    {
                        return null;
                    }
                }
            }
          }
        
        var travX = StartFromLoc[0];
        var travY = StartFromLoc[1];
        var travZ = StartFromLoc[2];
        for(; travX < this.getDimension( 0 ); travX ++)
        {
            for(; travY < this.getDimension( 1 ); travY ++)
            {
                for(; travZ < this.getDimension( 2 ); travZ++)
                {
                    if ( !this.getBlock( [ travX, travY, travZ ] ).getGuaranteed() )
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

    this.buildSolidList = function( Game, Puzzle, Location, ExtraParams )
    {
        var SolidBlocks = ExtraParams[ 0 ];

        var Test = Puzzle.getBlock( Location );
        if ( Test != null )
        {
            Test.setGuaranteed( false );
            if ( Test.getSolid() )
            {
                SolidBlocks[ SolidBlocks.length ] = Location;
            }
        }
    }

    this.showNeededFaces = function( Game )
    {
        document.getElementById("DebugLog").innerHTML = "";

        var SolidBlockLocs = [];
        this.travBlocks( Game, this.buildSolidList, [ SolidBlockLocs ] );

        // first try to guarantee the Solid Blocks
        for ( var travSolid = 0; travSolid < SolidBlockLocs.length; travSolid ++ )
        {
            this.attemptGuaranteeLocation( SolidBlockLocs[ travSolid ] );
        }

        var ItCount = 0;
        var NoImprovement = true;
        var UnguaranteedLoc = this.findUnguaranteedCubeLoc( null );
        while ( ( UnguaranteedLoc != null || !NoImprovement ) && ItCount < 1000 )
        {
            if ( UnguaranteedLoc != null && this.attemptGuaranteeLocation( UnguaranteedLoc ) )
            {
                NoImprovement = false;
            }
            
            UnguaranteedLoc = this.findUnguaranteedCubeLoc( UnguaranteedLoc );
            if ( UnguaranteedLoc == null && NoImprovement == false )
            {
                NoImprovement = true;
                UnguaranteedLoc = this.findUnguaranteedCubeLoc( null );
            }
            ItCount++;
        }

        document.getElementById("DebugLog").innerHTML += "showNeededFaces Iterated: " + ItCount;

        // for now show all faces on any unguaranteed blocks in the hopes that it'll guaranteed 'em ;)
        var ExtraParams = [ 0 ];
        this.travBlocks( Game, this.showUnguaranteed, ExtraParams );

        if ( ExtraParams[ 0 ] > 0 )
            document.getElementById("DebugLog").innerHTML += " Remaining: " + ExtraParams[ 0 ];
    }

    this.showUnguaranteed = function( Game, Puzzle, Location, ExtraParams )
    {
        var Count = ExtraParams[ 0 ];
        var Check = Puzzle.getBlock( Location );
        if ( !Check.getGuaranteed() )
        {
            var Hidden = Check.getHideNumbers();
            for( var Dimension = 0; Dimension < 3; Dimension ++ )
            {
                if ( Hidden[ Dimension ] == 1 )
                {
                    Puzzle.showRowFaces( Location, Dimension );
                }
            }
            Count ++;
        }
        ExtraParams[ 0 ] = Count;
    }

    this.toggleShowGuaranteed = function()
    {
        if ( gShapeTemplateMaterial )
            gShapeTemplateMaterial.toggleShowGuaranteed();
    }

    this.showBlockFace = function( Game, Puzzle, Location )
    {
        var showOn = Puzzle.getBlock( Location );
        showOn.setHideNumbers( [ 0, 0, 0 ] );
        showOn.setGuaranteed( true );
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
                var travLocation = dupArray( PuzzleLocation );
                for( var travRow = 0; travRow < this.getDimension( Dimension ); travRow ++ )
                {
                    travLocation[ Dimension ] = travRow;
                    var Test = this.getBlock(travLocation);

                    if ( Test != null && !Test.getPainted() && !Test.getFailedBreak() )
                    {
                        Painted = false;
                        break;
                    }
                }
            }

            travLocation = dupArray( PuzzleLocation );
            for( travRow = 0; travRow < this.getDimension( Dimension ); travRow ++ )
            {
                travLocation[ Dimension ] = travRow;
                Set = this.getBlock(travLocation);
                
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

    this.setBlockVisible = function( Block, Value )
    {
        if ( !this.isBlockVisible( Block ) )
        {
            return;
        }
        if ( Value )
        {
            Block.attachToParentTransform( true );
        } else
        {
            this.detachNonvisibleBlock( Block );
        }
    }

    this.breakSpace = function( Game, breakMe, updateTreeInfo )
    {
        if ( breakMe )
        {
            var PuzzleLocation = breakMe.getPuzzleLocation();

            this.setBlock( PuzzleLocation, null );

            this.setBlockVisible( this.getBlock( [ PuzzleLocation[ 0 ] - 1, PuzzleLocation[ 1 ], PuzzleLocation[ 2 ] ] ), true );
            this.setBlockVisible( this.getBlock( [ PuzzleLocation[ 0 ] + 1, PuzzleLocation[ 1 ], PuzzleLocation[ 2 ] ] ), true );
            this.setBlockVisible( this.getBlock( [ PuzzleLocation[ 0 ], PuzzleLocation[ 1 ] - 1, PuzzleLocation[ 2 ] ] ), true );
            this.setBlockVisible( this.getBlock( [ PuzzleLocation[ 0 ], PuzzleLocation[ 1 ] + 1, PuzzleLocation[ 2 ] ] ), true );
            this.setBlockVisible( this.getBlock( [ PuzzleLocation[ 0 ], PuzzleLocation[ 1 ], PuzzleLocation[ 2 ] - 1 ] ), true );
            this.setBlockVisible( this.getBlock( [ PuzzleLocation[ 0 ], PuzzleLocation[ 1 ], PuzzleLocation[ 2 ] + 1 ] ), true );

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

    this.getTransformInfo = function()
    {
        return mTreeInfo;
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
                if ( ( HideNumbers[ travDims ] == 0 || Game.mDebug ) && Numbers[ travDims ] == 0 )
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

                    Puzzle.hideBlock( ResetStatus, false );
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
                Puzzle.hideBlock( ResetStatus, false );
            }
        }
    }
    
    this.setEditMode = function( Game, Value )
    {
        var PassParams = [ Value, false ];
        this.travBlocks( Game, this.setEditModeBlock, PassParams );
        if ( Value )
        {
            gShapeTemplateMaterial.setEditMode( true );
            document.getElementById("EditModePuzzleTitle").value = this.getTitle();
            document.getElementById("EditModeAllowedFails").value = this.getAllowedFails();
            document.getElementById("EditModeBackgroundColor").value = ComponentToWebColor( this.getBackgroundColor() );
            document.getElementById("EditModePaintColor").value = ComponentToWebColor( this.getPaintColor() );
            this.hidePeeringArrow( false );
        } else
        {
            gShapeTemplateMaterial.setEditMode( false );
            this.setTitle( document.getElementById("EditModePuzzleTitle").value );
            this.setAllowedFails( parseInt( document.getElementById("EditModeAllowedFails").value ) );
            this.setBackgroundColor( WebColorToComponent( document.getElementById("EditModeBackgroundColor").value ) );
            this.setPaintColor( WebColorToComponent( document.getElementById("EditModePaintColor").value ) );
            this.showFaces( Game );

            this.resetRemainingFails();
        }

        mPeeringTrav = -1;
        if ( PassParams[ 1 ] )
        {
            this.travBlocks( Game, this.detachNonvisibleBlockFromTrav );
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

            this.setBlockVisible( this.getBlock( [ addLoc[ 0 ] - 1, addLoc[ 1 ], addLoc[ 2 ] ] ), false );
            this.setBlockVisible( this.getBlock( [ addLoc[ 0 ] + 1, addLoc[ 1 ], addLoc[ 2 ] ] ), false );
            this.setBlockVisible( this.getBlock( [ addLoc[ 0 ], addLoc[ 1 ] - 1, addLoc[ 2 ] ] ), false );
            this.setBlockVisible( this.getBlock( [ addLoc[ 0 ], addLoc[ 1 ] + 1, addLoc[ 2 ] ] ), false );
            this.setBlockVisible( this.getBlock( [ addLoc[ 0 ], addLoc[ 1 ], addLoc[ 2 ] - 1 ] ), false );
            this.setBlockVisible( this.getBlock( [ addLoc[ 0 ], addLoc[ 1 ], addLoc[ 2 ] + 1 ] ), false );

            mTreeInfo.update();
            Game.doRender();
        }
    }

    this.editRemove = function( Game, Event )
    {
        var pickedCube = this.pickCube( Game, Event );
        if ( pickedCube != null )
        {
            var PuzzleLocation = pickedCube.getPuzzleLocation();
            this.setBlock( PuzzleLocation, null );
            pickedCube.destroy( Game );

            this.setBlockVisible( this.getBlock( [ PuzzleLocation[ 0 ] - 1, PuzzleLocation[ 1 ], PuzzleLocation[ 2 ] ] ), true );
            this.setBlockVisible( this.getBlock( [ PuzzleLocation[ 0 ] + 1, PuzzleLocation[ 1 ], PuzzleLocation[ 2 ] ] ), true );
            this.setBlockVisible( this.getBlock( [ PuzzleLocation[ 0 ], PuzzleLocation[ 1 ] - 1, PuzzleLocation[ 2 ] ] ), true );
            this.setBlockVisible( this.getBlock( [ PuzzleLocation[ 0 ], PuzzleLocation[ 1 ] + 1, PuzzleLocation[ 2 ] ] ), true );
            this.setBlockVisible( this.getBlock( [ PuzzleLocation[ 0 ], PuzzleLocation[ 1 ], PuzzleLocation[ 2 ] - 1 ] ), true );
            this.setBlockVisible( this.getBlock( [ PuzzleLocation[ 0 ], PuzzleLocation[ 1 ], PuzzleLocation[ 2 ] + 1 ] ), true );

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
            for ( var travFacesTransforms = 0; travFacesTransforms < 6; travFacesTransforms ++ )
            {
                if ( gTransformToCube[ travTransformToCube ][ 0 ][ travFacesTransforms ] == Transform )
                {
                    return gTransformToCube[ travTransformToCube ][ 1 ];
                }
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
            if ( Cube != null && Game.mDebugOverlay )
            {
                Game.mDebugOverlay.setPickedCube( Cube );
            }
            return Cube;
        }
        return null;
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
        if ( PuzzleLocation[ 0 ] < 0 || PuzzleLocation[ 0 ] >= this.getDimension( 0 ) ||
             PuzzleLocation[ 1 ] < 0 || PuzzleLocation[ 1 ] >= this.getDimension( 1 ) ||
             PuzzleLocation[ 2 ] < 0 || PuzzleLocation[ 2 ] >= this.getDimension( 2 ) )
        {
            return null;
        }
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
        if ( gShapeTemplateMaterial != null )
        {
            gShapeTemplateMaterial.setDebug( Value );
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

    this.updateHidden = function( Hide, Count )
    {
        var ODim1, ODim2;
        if ( mPeeringDimension == 0 )
        {
            ODim1 = 1;
            ODim2 = 2;
        } else  if ( mPeeringDimension == 1 )
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
                if ( mPeeringTrav < this.getDimension( mPeeringDimension ) - 1 )
                    mPeeringTrav ++;
            }
            var Location = [];
            if ( mPeeringDirection == 1 )
            {
                Location[ mPeeringDimension ] = mPeeringTrav;
            } else
            {
                Location[ mPeeringDimension ] = this.getDimension( mPeeringDimension ) - 1 - mPeeringTrav;
            }
            if ( Location[ mPeeringDimension ] >= 0 && Location[ mPeeringDimension ] < this.getDimension( mPeeringDimension ) )
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

                            MakeVisibleLoc = dupArray( Location );
                            if ( mPeeringDirection == 1 )
                            {
                                MakeVisibleLoc[ mPeeringDimension ] = mPeeringTrav + 1;
                            } else
                            {
                                MakeVisibleLoc[ mPeeringDimension ] = this.getDimension( mPeeringDimension ) - 1 - (mPeeringTrav + 1);
                            }
                            if ( Hide )
                            {
                                this.setBlockVisible( this.getBlock( MakeVisibleLoc ), true );
                            } else
                            {
                                this.setBlockVisible( this.getBlock( MakeVisibleLoc ), false );
                            }

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
            Block.attachToParentTransform( true );
        } else
        {
            Block.setPeerThrough( false );
            Block.setParentTransform( mTransform );
            Block.attachToParentTransform( true );
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

    this.getPeeringArrow = function()
    {
        return mPeeringArrow;
    }

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

    var QuarterRot = Math.PI / 2.0;

    this.updatePeeringArrowLocation = function( Game )
    {
        if ( mPeeringTrav == -1 && Game.mCamera )
        {
            var Rotate = false;
            var RotZ = Game.mCamera.getEye().rotZ;
            var Target = Game.mCamera.getTarget();
            var NewLoc = null;

            if ( RotZ >= 0 && RotZ < QuarterRot )
            {
                NewLoc = [ Target[0] + Target[0] * -1.5, 0, Target[2] + Target[2] * 1.5 ];
                Rotate = QuarterRot * 3;

                mPeeringDimension = 2;
                mPeeringDirection = -1;
            } else if ( RotZ >= QuarterRot && RotZ < QuarterRot * 2 )
            {
                NewLoc = [ Target[0] + Target[0] * -1.5, 0, Target[2] + Target[2] * -1.5 ];
                Rotate = QuarterRot * 2;

                mPeeringDimension = 0;
                mPeeringDirection = 1;

            } else if (  RotZ >= QuarterRot * 2 && RotZ < QuarterRot * 3 )
            {
                NewLoc = [ Target[0] + Target[0] * 1.5, 0, Target[2] + Target[2] * -1.5 ];
                Rotate = QuarterRot;

                mPeeringDimension = 2;
                mPeeringDirection = 1;

            } else
            {
                NewLoc = [ Target[0] + Target[0] * 1.5, 0, Target[2] + Target[2] * 1.5 ];
                Rotate = 0;

                mPeeringDimension = 0;
                mPeeringDirection = -1;

            }
            var OldLoc = mPeeringArrow.getGrabbedLocation();;
            if ( OldLoc == null || OldLoc[0] != NewLoc[0] || OldLoc[1] != NewLoc[1] || OldLoc[2] != NewLoc[2] )
            {
                mPeeringArrow.updateTransform( true, NewLoc, Rotate );
            }
        }
    }

    this.hidePeeringArrow = function( Hide )
    {
        mPeeringArrow.hide( Hide );
    }

    this.destroy = function( Game )
    {
        this.travBlocks( Game, this.destroyBlock );

        mPeeringArrow.destroy( Game );

        destroyTransform( Game, mHiddenTransform );
        destroyTransform( Game, mTransform );
    }

    this.init( Game );
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