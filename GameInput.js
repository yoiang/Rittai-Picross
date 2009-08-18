function GameInput()
{
    this.handleMouseDown = function( Game, Event )
    {
        if ( Game.mPuzzle && ( Game.mPuzzle.getLost() || Game.mPuzzle.getWon() ) )
        {
            return false;
        }

        
        var Cube = null;
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

    this.handleKeyDown = function( Game, Event, KeyCode )
    {
        if ( KeyCode == 68 )
        {
            Game.toggleDebug();
            return true;
        }
        return false;
    }
}