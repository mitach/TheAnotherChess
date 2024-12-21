import  { useEffect } from 'react';
import Chess from '../chess/Chess';

function Board() {
    useEffect(() => {
        const gameElement = document.getElementById("chess")!;
        const chess = new Chess(gameElement);
        chess.init()
    }, [])

    return (
        <div id='chess'>
            {/* <p>kur</p> */}
        </div>
    );
}

export default Board;
