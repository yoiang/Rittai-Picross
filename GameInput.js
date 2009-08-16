function GameInput()
{
    this.handleMouseDown = function( Game, Event )
    {
        if ( Game.mPuzzle && ( Game.mPuzzle.getFailed() || Game.mPuzzle.getWon() ) )
        {
            return false;
        }

        
        var Cube = null;
        if ( Game.mInputState.mKeyDown[87] )
        {
            Cube = pickCube( Game, Event );
            if ( Cube != null )
            {
                Cube.togglePainted( Game );
                return true;
            }
        }
        
        if ( Game.mInputState.mKeyDown[88] )
        {
            Cube = pickCube( Game, Event );
            if ( Cube != null )
            {
                Cube.tryBreak( Game );
                return true;
            }
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

function pickShape( Game, Event )
{
    var worldRay = o3djs.picking.clientPositionToWorldRay(
        Event.x,
        Event.y,
        Game.mViewInfo.drawContext,
        Game.mClient.width,
        Game.mClient.height);

    var TreeInfo = o3djs.picking.createTransformInfo(Game.mClient.root, null);
    TreeInfo.update();

    var PickInfo = TreeInfo.pick(worldRay);
    return PickInfo;
}

function pickCube( Game, Event )
{
    var PickInfo = pickShape( Game, Event );
    if ( PickInfo )
        return findCubeFromShape( PickInfo.shapeInfo.shape );
    return null;
}

function findCubeFromShape( Shape )
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