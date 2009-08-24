function InputState( Game )
{
    this.mGame = Game;
    this.mKeyDown = [];
    this.mMouseDown = [];
    this.mNotify = [];

    this.registerO3DEvents = function(Game )
    {
        o3djs.event.addEventListener(Game.mO3dElement, 'mousedown', mouseDown);
        o3djs.event.addEventListener(Game.mO3dElement, 'mousemove', mouseMove);
        o3djs.event.addEventListener(Game.mO3dElement, 'mouseup', mouseUp);

//    gGame.mO3dElement.addEventListener('mouseover', dragOver, false);
        // for Firefox
//    gGame.mO3dElement.addEventListener('DOMMouseScroll', scrollMe, false);
        // for Safari
//    gGame.mO3dElement.onmousewheel = scrollMe;

    }
    this.registerO3DEvents( Game );

    this.handleKeyDown = function( Event )
    {
        var KeyCode = 0;
        if (window.event) {
            KeyCode = window.event.keyCode;
        } else if (Event) {
           KeyCode = Event.which;
        }
        this.mKeyDown[KeyCode] = true;

        for( var travNotify = 0; travNotify < this.mNotify.length; travNotify++)
        {
            if (this.mNotify[ travNotify ] && this.mNotify[ travNotify ].handleKeyDown )
            {
                if (this.mNotify[ travNotify ].handleKeyDown(this.mGame, Event, KeyCode))
                    break;
            }
        }
    }

    this.handleKeyUp = function( Event )
    {
        var KeyCode = 0;
        if (window.event) {
            KeyCode = window.event.keyCode;
        } else if (Event) {
           KeyCode = Event.which;
        }
        this.mKeyDown[KeyCode] = false;

        for( var travNotify = 0; travNotify < this.mNotify.length; travNotify++)
        {
            if (this.mNotify[ travNotify ] && this.mNotify[ travNotify ].handleKeyUp )
            {
                if (    this.mNotify[ travNotify ].handleKeyUp(this.mGame, Event, KeyCode) )
                    break;
            }
        }
    }

    this.handleMouseDown = function( Event ) 
    {
        this.mMouseDown[ Event.button ] = true;

        for( var travNotify = 0; travNotify < this.mNotify.length; travNotify++)
        {
            if (this.mNotify[ travNotify ] && this.mNotify[ travNotify ].handleMouseDown )
            {
                if (this.mNotify[ travNotify ].handleMouseDown(this.mGame, Event))
                    break;
            }
        }
    }

    this.handleMouseUp = function( Event )
    {
        this.mMouseDown[ Event.button ] = false;

        for( var travNotify = 0; travNotify < this.mNotify.length; travNotify++)
        {
            if (this.mNotify[ travNotify ] && this.mNotify[ travNotify ].handleMouseUp )
            {
                if (this.mNotify[ travNotify ].handleMouseUp(this.mGame, Event))
                    break;
            }
        }
    }

    this.handleMouseMove = function( Event )
    {
        for( var travNotify = 0; travNotify < this.mNotify.length; travNotify++)
        {
            if (this.mNotify[ travNotify ] && this.mNotify[ travNotify ].handleMouseMove )
            {
                if (this.mNotify[ travNotify ].handleMouseMove(this.mGame, Event))
                    break;
            }
        }
    }

    this.findNotify = function( find )
    {
        for( var travNotify = 0; travNotify < this.mNotify.length; travNotify++)
        {
            if (this.mNotify[ travNotify ] == find )
            {
                return travNotify;
            }
        }
        return -1;
    }
    
    this.addNotify = function( add )
    {
        var find = this.findNotify( add );
        if ( find == -1 )
        {
            this.mNotify[ this.mNotify.length ] = add;
        }
    }

    this.removeNotify = function( remove )
    {
        var find = this.findNotify( remove );
        if ( find != -1 )
        {
            this.mNotify[ find ] = null;
            this.mNotify.splice( find, 1 );
        }
    }

    this.isKeyDown = function( KeyCode )
    {
        return this.mKeyDown[ KeyCode ] == true;
    }

    this.isMouseDown = function( Button )
    {
        return this.mMouseDown[ Button ] == true;
    }
}

document.onkeydown = function(e) {
    if ( gGame && gGame.mInputState && gGame.mInputState.handleKeyDown )
        gGame.mInputState.handleKeyDown( e );
};

document.onkeyup = function(e) {
    if ( gGame && gGame.mInputState && gGame.mInputState.handleKeyUp )
        gGame.mInputState.handleKeyUp( e );
};

document.onmouseup = function(e) {
    if ( gGame && gGame.mInputState && gGame.mInputState.handleMouseButtonUp )
        gGame.mInputState.handleMouseButtonUp( e );
};

function mouseDown(e) {
    if ( gGame && gGame.mInputState && gGame.mInputState.handleMouseDown )
        gGame.mInputState.handleMouseDown( e );
}

function mouseMove(e) {
    if ( gGame && gGame.mInputState && gGame.mInputState.handleMouseMove )
        gGame.mInputState.handleMouseMove( e );
}

function mouseUp(e) {
    if ( gGame && gGame.mInputState && gGame.mInputState.handleMouseUp )
        gGame.mInputState.handleMouseUp( e );
}