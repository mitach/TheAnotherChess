import React, { useEffect } from 'react';
import * as PIXI from 'pixi.js';
import { initChess } from '../game/game-app';


function Board() {

    useEffect(() => {
        initChess();
    }, [])

    return (
        <div id='chess'>
            {/* <p>kur</p> */}
        </div>
    );
}

export default Board;