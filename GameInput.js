function GameInput()
{
    this.handleMouseDown = function( Game, Event )
    {
        if ( Game.mPuzzle && ( Game.getLost() || Game.getWon() ) )
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
        return false;
    }

    this.handleMouseMove = function( Game, Event )
    {
        if ( Game.mPuzzle && ( Game.getLost() || Game.getWon() ) )
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


        Game.mIngameOverlay.update( Game );
        return false;
    }

    this.handleKeyUp = function( Game, Event, KeyCode )
    {
        Game.mIngameOverlay.update( Game );
        return false;
    }
}