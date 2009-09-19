function GameInput()
{
    this.handleMouseUp = function( Game, Event )
    {
        if ( Game == null || Game.mPuzzle == null )
        {
            return false;
        }

        if ( Game.mPuzzle )
        {
            if ( Game.mPuzzle.getPeeringArrow().getGrabbed() )
                Game.mPuzzle.getPeeringArrow().stopGrabbed( Game );
        }
        return false;
    }
    
    this.handleMouseDown = function( Game, Event )
    {
        if ( Game == null || Game.mPuzzle == null )
        {
            return false;
        }

        if ( Game.getLost() || Game.getWon() )
        {
            return false;
        }
        
        if ( Game.mInputState.mKeyDown[87] )
        {
            Game.mPuzzle.tryPaint( Game, Event );
            return true;
        }
        
        if ( Game.mInputState.mKeyDown[88] )
        {
            Game.mPuzzle.tryBreak( Game, Event );
            return true;
        }

        return Game.mPuzzle.getPeeringArrow().tryGrab( Game, Event );
    }

    this.handleMouseMove = function( Game, Event )
    {
        if ( Game == null || Game.mPuzzle == null )
        {
            return false;
        }
        
        if ( Game.getLost() || Game.getWon() )
        {
            return false;
        }

        if ( Game.mInputState.mKeyDown[87] )
        {
            return true;
        }

        if ( Game.mInputState.mKeyDown[88] )
        {
            return true;
        }

        if ( Game.mPuzzle.getPeeringArrow().getGrabbed() )
        {
            Game.mPuzzle.getPeeringArrow().move( Game, Event );
            return true;
        }
        
        return false;
    }

    this.handleKeyDown = function( Game, Event, KeyCode )
    {
        if ( Game == null || Game.mPuzzle == null )
        {
            return false;
        }

        if ( KeyCode == 68 )
        {
            Game.toggleDebug();
            return true;
        }
        if ( KeyCode == 71 )
        {
            Game.mPuzzle.toggleShowGuaranteed();
            return true;
        }
        if ( KeyCode == 69 )
        {
            Game.toggleEditMode();
            return true;
        }
        if ( KeyCode == 90 )
        {
            Game.mPuzzle.breakZeroRows( Game );
            return true;
        }

        Game.mIngameOverlay.update( Game );
        return false;
    }

    this.handleKeyUp = function( Game, Event, KeyCode )
    {
        if ( Game == null )
        {
            return false;
        }

        Game.mIngameOverlay.update( Game );
        return false;
    }
}