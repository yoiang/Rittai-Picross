function GameInput()
{
    this.handleMouseUp = function( Game, Event )
    {
        if ( Game.mPuzzle && Game.mPuzzle.getArrowGrabbed() )
        {
            Game.mPuzzle.stopArrowGrabbed( Game );
        }
        return false;
    }
    
    this.handleMouseDown = function( Game, Event )
    {
        if ( !Game.mPuzzle )
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

        return Game.mPuzzle.tryGrabArrow( Game, Event );
    }

    this.handleMouseMove = function( Game, Event )
    {
        if ( ! Game.mPuzzle )
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

        if ( Game.mPuzzle.getArrowGrabbed() )
        {
            Game.mPuzzle.moveArrow( Game, Event );
            return true;
        }
        
        return false;
    }

    this.handleKeyDown = function( Game, Event, KeyCode )
    {
        if ( KeyCode == 68 )
        {
            Game.toggleDebug();
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
        }

        Game.mIngameOverlay.update( Game );
        return false;
    }

    this.handleKeyUp = function( Game, Event, KeyCode )
    {
        Game.mIngameOverlay.update( Game );
        return false;
    }
}