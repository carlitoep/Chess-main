let figuren = [["Rook1w", "Knight1w", "Bishop1w", "Queenw", "Kingw", "Bishop2w", "Knight2w", "Rook2w", "Pawn1w", "Pawn2w", "Pawn3w", "Pawn4w", "Pawn5w", "Pawn6w", "Pawn7w", "Pawn8w", "Rook2", "Knight1", "Bishop1", "King", "Queen", "Bishop2", "Knight2", "Rook1", "Pawn1", "Pawn2", "Pawn3", "Pawn4", "Pawn5", "Pawn6", "Pawn7", "Pawn8"], [], []]
let playedMoves = []
let boards = []
const brett = new Image();
let ausgewählteFigur = null
brett.src = 'board2.png';
let moves = 0
let timeWhite = 600; let timeBlack = 600; let interval;
brett.onload = function () {
    startGame()
};

function startGame() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let color = "w"
    ctx.drawImage(brett, 0, 0, canvas.width, canvas.height);
    for (i = 0; i < 4; i++) { //alle Figuren aus figuren werden gezeichnet
        for (j = 0; j < 8; j++) {
            const figur = `figuren${figuren[0][j + 8 * i].replace(/[^a-zA-Z]/g, "")}.png`
            if (i > 1) {
                zeichneFigur(ctx, figur, 640 - (j + 1) * 80, (i - 2) * 80, figuren[0][j + 8 * i]); //weiße figuren
            }
            else {
                zeichneFigur(ctx, figur, j * 80, 640 - (i + 1) * 80, figuren[0][j + 8 * i]);//schwarze figuren
            }

        }
    }
    boards.push(board())
    const dialog = document.getElementById("popup")
    document.getElementById("close").addEventListener("click", () => {
        dialog.close()
    });

    canvas.addEventListener('mousedown', (event) => { // Figur wird beim anklicken erkannt
        if (event != undefined) {
            const { offsetX, offsetY } = event;

            figuren[1].forEach(figur => {
                if (
                    offsetX >= figur.x &&
                    offsetX <= figur.x + figur.width &&
                    offsetY >= figur.y &&
                    offsetY <= figur.y + figur.height
                ) {
                    ausgewählteFigur = figur;
                }
            });
        }
    });

    canvas.addEventListener('mouseup', (event) => {
        if (ausgewählteFigur) { // beim loslassen wird überprüft, on der Zug legal ist
            let i, kingX, kingY
            const { offsetX, offsetY } = event;
            let figurenNeu = structuredClone(figuren); // Neues Array mit der schon gezogenen Figur, damit überprüft werden kann, ob es in der neuen Stellung ein Schach gibt
            figurenNeu[1][figurenNeu[0].indexOf(ausgewählteFigur.name)] = {
                ...figurenNeu[1][figurenNeu[0].indexOf(ausgewählteFigur.name)],
                x: Math.floor((offsetX) / 80) * 80,
                y: Math.floor((offsetY) / 80) * 80
            }
            if (takePieces(ausgewählteFigur.name, Math.floor((offsetX) / 80) * 80, Math.floor((offsetY) / 80) * 80).reason == "capture") {
                figurenNeu[0].splice(figuren[0].indexOf(takePieces(ausgewählteFigur.name, Math.floor((offsetX) / 80) * 80, Math.floor((offsetY) / 80) * 80).name), 1);
                figurenNeu[1].splice(figuren[0].indexOf(takePieces(ausgewählteFigur.name, Math.floor((offsetX) / 80) * 80, Math.floor((offsetY) / 80) * 80).name), 1);
            }
            if (ausgewählteFigur.name == `King${color}`) { kingX = Math.floor((offsetX) / 80) * 80; kingY = Math.floor((offsetY) / 80) * 80 }
            else { kingX = figuren[1][figuren[0].indexOf(`King${color}`)].x; kingY = figuren[1][figuren[0].indexOf(`King${color}`)].y }
            if (check(figurenNeu, color, kingX, kingY) == false && overPieces(ausgewählteFigur.x, ausgewählteFigur.y, Math.floor((offsetX) / 80) * 80, Math.floor((offsetY) / 80) * 80, figuren) && wayOfMoving(figurenNeu, ausgewählteFigur.name.replace(/[^a-zA-Z]/g, ""), ausgewählteFigur.x, ausgewählteFigur.y, Math.floor((offsetX) / 80) * 80, Math.floor((offsetY) / 80) * 80) && takePieces(ausgewählteFigur.name, Math.floor((offsetX) / 80) * 80, Math.floor((offsetY) / 80) * 80).status == true) {
                if (ausgewählteFigur.name.charAt(ausgewählteFigur.name.length - 1) == color || (ausgewählteFigur.name.charAt(ausgewählteFigur.name.length - 1) != "w" && color == "")) { // Es wird auf Schach, im Weg stehende Figuren, die richtige Farbe und die Richtigkeit der Zugrichtung geprüft
                    ctx.clearRect(ausgewählteFigur.x, ausgewählteFigur.y, ausgewählteFigur.width, ausgewählteFigur.height);
                    ctx.drawImage(brett, ausgewählteFigur.x, ausgewählteFigur.y, ausgewählteFigur.width, ausgewählteFigur.height, ausgewählteFigur.x, ausgewählteFigur.y, ausgewählteFigur.width, ausgewählteFigur.height);
                    if (takePieces(ausgewählteFigur.name, Math.floor((offsetX) / 80) * 80, Math.floor((offsetY) / 80) * 80).reason == "capture") { // Wenn eine Figur genommen wurde, wird diese entfernt
                        i = takePieces(ausgewählteFigur.name, Math.floor((offsetX) / 80) * 80, Math.floor((offsetY) / 80) * 80).i
                        ctx.clearRect(figuren[1][i].x, figuren[1][i].y, figuren[1][i].width, figuren[1][i].height);
                        ctx.drawImage(brett, figuren[1][i].x, figuren[1][i].y, figuren[1][i].width, figuren[1][i].height, figuren[1][i].x, figuren[1][i].y, figuren[1][i].width, figuren[1][i].height);
                        figuren[1].splice(i, 1)
                        figuren[0].splice(i, 1)
                    } else if ((ausgewählteFigur.name.replace(/[^a-zA-Z]/g, "") == "Pawnw" || ausgewählteFigur.name.replace(/[^a-zA-Z]/g, "") == "Pawn") && Math.abs(ausgewählteFigur.x - Math.floor((offsetX) / 80) * 80) == 80 && Math.abs(ausgewählteFigur.y - Math.floor((offsetY) / 80) * 80) == 80) {
                        if (ausgewählteFigur.name.replace(/[^a-zA-Z]/g, "") == "Pawnw") { i = takePieces(ausgewählteFigur.name, Math.floor((offsetX) / 80) * 80, Math.floor((offsetY) / 80) * 80 + 80).i } // Wenn ein Bauer das Ende des Brettes erreicht, wird er in eine Dame umgewandelt
                        else { i = takePieces(ausgewählteFigur.name, Math.floor((offsetX) / 80) * 80, Math.floor((offsetY) / 80) * 80 - 80).i }
                        ctx.clearRect(figuren[1][i].x, figuren[1][i].y, figuren[1][i].width, figuren[1][i].height);
                        ctx.drawImage(brett, figuren[1][i].x, figuren[1][i].y, figuren[1][i].width, figuren[1][i].height, figuren[1][i].x, figuren[1][i].y, figuren[1][i].width, figuren[1][i].height);
                        figuren[1].splice(i, 1); figuren[0].splice(i, 1); figuren[2].splice(i, 1);
                    }
                    if (ausgewählteFigur.name.replace(/[^a-zA-Z]/g, "") == "Pawnw" && Math.floor((offsetY) / 80) * 80 == 0) {
                        figuren[1][figuren[0].indexOf(ausgewählteFigur.name)] = {
                            ...figuren[1][figuren[0].indexOf(ausgewählteFigur.name)],
                            name: `Queen${ausgewählteFigur.name.charAt(ausgewählteFigur.name.length - 2)}w`
                        }
                        figuren[0][figuren[0].indexOf(ausgewählteFigur.name)] = `Queen${ausgewählteFigur.name.charAt(ausgewählteFigur.name.length - 2)}w`
                        ausgewählteFigur = figuren[1][figuren[0].indexOf(`Queen${ausgewählteFigur.name.charAt(ausgewählteFigur.name.length - 2)}w`)]
                    } else if (ausgewählteFigur.name.replace(/[^a-zA-Z]/g, "") == "Pawn" && Math.floor((offsetY) / 80) * 80 == 560) {
                        figuren[1][figuren[0].indexOf(ausgewählteFigur.name)] = {
                            ...figuren[1][figuren[0].indexOf(ausgewählteFigur.name)],
                            name: `Queen${ausgewählteFigur.name.charAt(ausgewählteFigur.name.length - 1)}`
                        }
                        figuren[0][figuren[0].indexOf(ausgewählteFigur.name)] = `Queen${ausgewählteFigur.name.charAt(ausgewählteFigur.name.length - 1)}`
                        ausgewählteFigur = figuren[1][figuren[0].indexOf(`Queen${ausgewählteFigur.name.charAt(ausgewählteFigur.name.length - 1)}`)]
                    }
                    moves++
                    if (moves == 1) interval = setInterval(time, 1000) // Zeit startet
                    if (moves % 2 == 0) color = "w"
                    else color = ""
                    zeichneFigur(ctx, `figuren${(ausgewählteFigur.name).replace(/[^a-zA-Z]/g, "")}.png`, Math.floor((offsetX) / 80) * 80, Math.floor((offsetY) / 80) * 80, ausgewählteFigur.name);
                    playedMoves.push(ausgewählteFigur.name)
                    boards.push(board()) // speichert Stellungen, um auf dreifache Stellungswiederholung zu überprüfen
                    if (checkmate(color).status == true) {  //überprüft nach einem Spielende und zeigt dies an
                        dialog.showModal()
                        document.getElementById("reason").innerHTML = checkmate(color).reason
                        if (color == "" && checkmate(color).reason == "checkmate") document.getElementById("winner").innerHTML = "white won"
                        else if (color == "w" && checkmate(color).reason == "checkmate") document.getElementById("winner").innerHTML = "black won"
                        else document.getElementById("winner").innerHTML = "draw"
                    }
                }
            }
            ausgewählteFigur = null;
        }
    });
}



function zeichneFigur(ctx, src, x, y, figur) {
    const image = new Image();
    image.src = src;

    image.onload = () => {
        ctx.drawImage(image, x, y, 80, 80);
    };
    figuren[1][figuren[0].indexOf(`${figur}`)] = ({
        name: figur,
        x: x,
        y: y,
        width: 80,
        height: 80,
    });
    if (figuren[2][figuren[0].indexOf(`${figur}`)] == undefined) figuren[2][figuren[0].indexOf(`${figur}`)] = 0
    else figuren[2][figuren[0].indexOf(`${figur}`)] += 1
}

function wayOfMoving(figurenNeu, piece, x, y, newX, newY) {
    if (x != newX || y != newY) {
        switch (piece) {
            case "Rookw": if (x == newX || y == newY) { return true } else return false
            case "Bishopw": if (Math.abs(x - newX) == Math.abs(y - newY) || x + y == newX + newY) { return true } else return false
            case "Knightw": if ((Math.abs(newX - x) == 80 && Math.abs(newY - y) == 160) || (Math.abs(newX - x) == 160 && Math.abs(newY - y) == 80)) { return true } else return false
            case "Queenw": if ((x == newX || y == newY) || Math.abs(x - newX) == Math.abs(y - newY) || x + y == newX + newY) { return true } else return false
            case "Kingw": if ((Math.abs(x - newX) <= 80 && Math.abs(y - newY) <= 80) || (Math.abs(x - newX) == 160 && y - newY == 0 && castle(figurenNeu, x, y, newX, "w", 1))) { return true } else return false
            case "Pawnw": if ((x == newX && takePieces("Pawnw", newX, newY).reason == "no piece" && (newY - y == -80 || (newY - y == -160 && y == 480))) || (Math.abs(x - newX) == 80 && newY - y == -80 && ((takePieces("Pawnw", newX, newY).reason == "capture" && takePieces("Pawnw", newX, newY).status == true) || (takePieces("Pawnw", newX, newY + 80).reason == "capture" && newY == 160 && playedMoves[playedMoves.length - 1] == takePieces("Pawnw", newX, newY + 80).name && figuren[2][figuren[0].indexOf(playedMoves[playedMoves.length - 1])] == 1)))) { return true } else return false
            case "Rook": if (x == newX || y == newY) { return true } else return false
            case "Bishop": if (Math.abs(x - newX) == Math.abs(y - newY) || x + y == newX + newY) { return true } else return false
            case "Knight": if ((Math.abs(newX - x) == 80 && Math.abs(newY - y) == 160) || (Math.abs(newX - x) == 160 && Math.abs(newY - y) == 80)) { return true } else return false
            case "Queen": if ((x == newX || y == newY) || Math.abs(x - newX) == Math.abs(y - newY) || x + y == newX + newY) { return true } else return false
            case "King": if ((Math.abs(x - newX) <= 80 && Math.abs(y - newY) <= 80) || (Math.abs(x - newX) == 160 && y - newY == 0 && castle(figurenNeu, x, y, newX, "", 0))) { return true } else return false
            case "Pawn": if ((x == newX && takePieces("Pawn", newX, newY).reason == "no piece" && (newY - y == 80 || (newY - y == 160 && y == 80))) || (Math.abs(x - newX) == 80 && newY - y == 80 && ((takePieces("Pawn", newX, newY).reason == "capture" && takePieces("Pawn", newX, newY).status == true) || (takePieces("Pawn", newX, newY - 80).reason == "capture" && newY == 400 && playedMoves[playedMoves.length - 1] == takePieces("Pawn", newX, newY - 80).name && figuren[2][figuren[0].indexOf(playedMoves[playedMoves.length - 1])] == 1)))) { return true } else return false
        }
    } else return false
}

function overPieces(x, y, newX, newY, figurenNeu) { // überprüft, ob auf dem Weg des Zuges eine Figur im weg steht
    let i = Math.abs(y - newY) / 80
    let j, m, negativeX, negativeY
    if (x > newX) { negativeX = -1 } else negativeX = 1
    if (y > newY) { negativeY = -1 } else negativeY = 1
    if (i != 0) m = i
    else m = Math.abs(x - newX) / 80
    for (let k = 1; k < m; k++) {
        for (let l = 0; l < figurenNeu[1].length; l++) {
            switch (i) {
                case 0: j = Math.abs(x - newX) / 80
                    if (figurenNeu[1][l].y == negativeY * k * i + y && figurenNeu[1][l].x == negativeX * k * 80 + x) { return false }
                    else continue
                default: j = Math.abs(x - newX) / i
                    if (figurenNeu[1][l].y == negativeY * k * 80 + y && figurenNeu[1][l].x == negativeX * k * j + x) { return false }
                    else continue
            }

        }
    }
    return true
}

function takePieces(piece, x, y) { // überprüft, ob eine eventuell genommene Figur auch eine des Gegners ist
    for (let i = 0; i < figuren[1].length; i++) {
        if (x == figuren[1][i].x && y == figuren[1][i].y) {
            if ((piece.charAt(piece.length - 1) == "w" && (figuren[1][i].name).charAt(figuren[1][i].name.length - 1) == "w") || (piece.charAt(piece.length - 1) != "w" && (figuren[1][i].name).charAt(figuren[1][i].name.length - 1) != "w")) {
                if (piece != figuren[1][i].name) return false
            } else {
                return { status: true, reason: "capture", i: i, name: figuren[1][i].name }
            }
        }
    }
    return { status: true, reason: "no piece" };
}

function check(figurenNeu, color, x, y) {// überprüft, ob in der Stellung der König im Schach steht
    for (let i = 0; i < figurenNeu[0].length; i++) {
        if ((figurenNeu[0][i].charAt(figurenNeu[0][i].length - 1) != "w" && color == "w") || (figurenNeu[0][i].charAt(figurenNeu[0][i].length - 1) == "w" && color == "")) {
            if (wayOfMoving(figurenNeu, figurenNeu[0][i].replace(/[^a-zA-Z]/g, ""), figurenNeu[1][i].x, figurenNeu[1][i].y, x, y) && overPieces(figurenNeu[1][i].x, figurenNeu[1][i].y, x, y, figurenNeu)) return true
        }
    }
    return false
}

function castle(figurenNeu, x, y, newX, color, n) { // überprüft, ob eine Rochade den Regeln entspricht
    let possible = false
    const ctx = canvas.getContext('2d');
    if (y == 560 * n && x == 320) {
        if (newX < x) {
            if (overPieces(x, y, 0, 560 * n, figuren) && figuren[1][figuren[0].indexOf(`Rook1${color}`)].x == 0 && figuren[1][figuren[0].indexOf(`Rook1${color}`)].y == 560 * n && figuren[2][figuren[0].indexOf(`Rook1${color}`)] == 0 && figuren[2][figuren[0].indexOf(`King${color}`)] == 0) {
                for (let i = 1; i < 3; i++) {
                    if (check(figurenNeu, color, x - i * 80, 560 * n) == false) possible = true
                    else possible = false; break
                }
                if (possible == true) {
                    ctx.clearRect(0, 560 * n, 80, 80);
                    ctx.drawImage(brett, 0, 560 * n, 80, 80, 0, 560 * n, 80, 80);
                    zeichneFigur(ctx, `figurenRook${color}.png`, 240, 560 * n, `Rook1${color}`);
                    return true
                }
            }
        }
        else {
            if (overPieces(x, y, 560, 560 * n, figuren) && figuren[1][figuren[0].indexOf(`Rook2${color}`)].x == 560 && figuren[1][figuren[0].indexOf(`Rook2${color}`)].y == 560 * n && figuren[2][figuren[0].indexOf(`Rook2${color}`)] == 0 && figuren[2][figuren[0].indexOf(`King${color}`)] == 0) {
                for (let i = 1; i < 3; i++) {
                    if (check(color, x + i * 80, 560 * n) == false) possible = true
                    else possible = false; break
                }
                if (possible == true) {
                    ctx.clearRect(560, 560 * n, 80, 80);
                    ctx.drawImage(brett, 560, 560 * n, 80, 80, 560, 560 * n, 80, 80);
                    zeichneFigur(ctx, `figurenRook${color}.png`, 400, 560 * n, `Rook2${color}`);
                    return true
                }
            }
        }
    }
    return false
}

function checkmate(color, time) { // überprüft, ob es ein Spielende gibt
    const dialog = document.getElementById("popup")
    if (time == true) {
        dialog.showModal()
        document.getElementById("reason").innerHTML = "time is up!"
        document.getElementById("winner").innerHTML = color + " won"
        clearInterval(interval)
        return { status: true, reason: "time is up!" }
    }
    for (let a = 0; a < boards.length; a++) {
        let sameBoards = 0
        for (let b = 0; b < boards.length; b++) {
            if (JSON.stringify(boards[a]) == JSON.stringify(boards[b])) { sameBoards++ }
        }
        if (sameBoards >= 3) { clearInterval(interval); return { status: true, reason: "threefold repition" } }
    }
    for (let m = 0; m < figuren[0].length; m++) {
        if (((figuren[0][m].charAt(figuren[0][m].length - 1) == "w" && color == "w") || (figuren[0][m].charAt(figuren[0][m].length - 1) != "w" && color == ""))) {
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    let figurenNeu = structuredClone(figuren);
                    figurenNeu[1][m] = { ...figurenNeu[1][m], x: i * 80, y: j * 80 }
                    if (takePieces(figuren[0][m], i * 80, j * 80).reason == "capture") {
                        figurenNeu[0].splice(figuren[0].indexOf(takePieces(figuren[0][m], i * 80, j * 80).name), 1);
                        figurenNeu[1].splice(figuren[0].indexOf(takePieces(figuren[0][m], i * 80, j * 80).name), 1);
                    }
                    if (check(figuren, color, i * 80, j * 80) == false && wayOfMoving(figuren, `King${color}`, figuren[1][figuren[0].indexOf(`King${color}`)].x, figuren[1][figuren[0].indexOf(`King${color}`)].y, i * 80, j * 80) && takePieces(`King${color}`, i * 80, j * 80).status == true && figuren[0][m] == `King${color}`) return false
                    if (check(figurenNeu, color, figuren[1][figuren[0].indexOf(`King${color}`)].x, figuren[1][figuren[0].indexOf(`King${color}`)].y) == false && wayOfMoving(figuren, figuren[0][m].replace(/[^a-zA-Z]/g, ""), figuren[1][m].x, figuren[1][m].y, i * 80, j * 80) && takePieces(figuren[0][m], i * 80, j * 80).status == true && figuren[0][m] != `King${color}` && overPieces(figuren[1][m].x, figuren[1][m].y, i * 80, j * 80, figuren)) return false
                }
            }
        }
    }
    clearInterval(interval)
    if (check(figuren, color, figuren[1][figuren[0].indexOf(`King${color}`)].x, figuren[1][figuren[0].indexOf(`King${color}`)].y) == true) return { status: true, reason: "checkmate" }
    else return { status: true, reason: "stalemate" }
}

function board() { // gibt die Aktuelle Stellung an 
    let currentBoard = []
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let pieceExists = false
            for (let k = 0; k < figuren[1].length; k++) {
                if (figuren[1][k].x == i * 80 && figuren[1][k].y == j * 80) { currentBoard.push(figuren[0][k]); pieceExists = true; break }
            }
            if (pieceExists == false) currentBoard.push("no piece")
        }
    }
    return currentBoard
}

function time() { // lässt die Zeit runterlaufen
    if (moves % 2 == 0) {
        timeWhite -= 1;
        document.getElementById("timew").innerHTML = Math.floor(timeWhite / 60) + ":" + String(timeWhite % 60).padStart(2, "0");
    } else {
        timeBlack -= 1;
        document.getElementById("time").innerHTML = Math.floor(timeBlack / 60) + ":" + String(timeBlack % 60).padStart(2, "0");
    }
    if (timeBlack <= 0) checkmate("white", true);
    if (timeWhite <= 0) checkmate("black", true);
}