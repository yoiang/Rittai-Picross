function EditInput()
{
    this.handleMouseUp = function( Game, Event )
    {
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
            Game.mPuzzle.editAdd( Game, Event );
            return true;
        }
        
        if ( Game.mInputState.mKeyDown[88] )
        {
            Game.mPuzzle.editRemove( Game, Event );
            return true;
        }

        return Game.mPuzzle.getPeeringArrow().tryGrab( Game, Event );
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

        if ( KeyCode == 68 ) // D
        {
            Game.toggleDebug();
            return true;
        }
        if ( KeyCode == 69 ) // E
        {
            Game.toggleEditMode();
            return true;
        }
        if ( KeyCode == 83 ) // S
        {
            Game.savePuzzle();
        }
        if ( KeyCode == 84 ) // T
        {
            Game.mPuzzle.trim( Game );
            Game.mCamera.centerOnPuzzle( Game, Game.mPuzzle, false );
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