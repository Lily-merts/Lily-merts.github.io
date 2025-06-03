const PADDLE_SPEED = 5
const SCALE = 2.3
const VIRTUAL_WIDTH = 960 / SCALE
const VIRTUAL_HEIGHT = 540 / SCALE

let backgroundImg, arrowsImg, arrows, heartsImg, hearts, particle, main, retroFont
let gbricks, bricks, brick, paddles, paddle, balls, ball
let paddleHit, scoreSound, wallHit, confirm, select, noSelect, brickHit1, brickHit2, hurt, victory, recover, highScore, pause, music
let gameState = "start" // start, play, serve, gameOver, victory, highScores, enterHighScore, paddleSelect
let level = 0
let score = 0
let health = 3
let recoverPoints = 5000
let highlighted = 1
let currentPaddle = 0
let chars = [65, 65, 65]
let highlightedChar = 0
let name
let sortScores = []

function preload() {
    // load graphics
    backgroundImg = loadImage("graphics/background.png")
    main = loadImage("graphics/breakout.png")
    heartsImg = loadImage("graphics/hearts.png")
    arrowsImg = loadImage("graphics/arrows.png")

    // load sounds
    paddleHit = loadSound("sounds/paddle_hit.wav")
    scoreSound = loadSound("sounds/score.wav")
    wallHit = loadSound("sounds/wall_hit.wav")
    confirmSound = loadSound("sounds/confirm.wav")
    select = loadSound("sounds/select.wav")
    noSelect = loadSound("sounds/no-select.wav")
    brickHit1 = loadSound("sounds/brick-hit-1.wav")
    brickHit2 = loadSound("sounds/brick-hit-2.wav")
    hurt = loadSound("sounds/hurt.wav")
    victory = loadSound("sounds/victory.wav")
    recover = loadSound("sounds/recover.wav")
    highScore = loadSound("sounds/high_score.wav")
    pause = loadSound("sounds/pause.wav")
    music = loadSound("sounds/music.wav")

    // load font
    retroFont = loadFont('fonts/font.ttf')
}

function setup() {
    createCanvas(960, 540)

    // generate graphics
    paddles = generateQuadPaddles(main)
    paddle = new Paddle(0)
    balls = generateQuadBalls(main)
    ball = new Ball(parseInt(random(7)))
    bricks = generateQuadBricks(main)
    gbricks = createMap(level)
    hearts = generateHearts(heartsImg)
    arrows = generateArrows(arrowsImg)

    getHighScores()

    music.loop()
}

function draw() {
    // scale all elements by scale factor
    scale(SCALE)
    image(backgroundImg, 0, 0, VIRTUAL_WIDTH + 1, VIRTUAL_HEIGHT + 1)

    if (gameState == "serve" || gameState == "play") {
        paddle.render()
        paddle.update()

        ball.render()
        ball.update()

        for (let gbrick of gbricks) {
            gbrick.render()
            gbrick.psystem.show()
            gbrick.psystem.update()
        }
    }

    if (gameState == "start") {
        start()
    }

    if(gameState == "paddleSelect") {
        paddleSelect()
    }

    if (gameState == "highScores") {
        highScores()
    }

    if (gameState == "serve") {
        serve()
    }

    if (gameState == "play") {
        play()
    }

    if (gameState == "gameOver") {
        gameOver()
    }

    if (gameState == "victory") {
        victoryState()
    }

    if (gameState == "enterHighScore") {
        enterHighScore()
    }

    renderHealth(health)
    renderScore(score)
    displayFPS()
}

function play() {
    if (ball.collides(paddle)) {
        ball.y = paddle.y - ball.height
        ball.dy = -ball.dy
        paddleHit.play()

        if (ball.x < paddle.x + (paddle.width / 2) && paddle.dx < 0) {
            ball.dx = -0.2 * (paddle.x + paddle.width / 2 - ball.x)
        }
        else if (ball.x > paddle.x + (paddle.width / 2) && paddle.dx > 0) {
            ball.dx = 0.2 * abs(paddle.x + paddle.width / 2 - ball.x)
        }
    }

    if (ball.y > VIRTUAL_HEIGHT) {
        hurt.play()
        ball.reset()
        health--

        if (health == 0){
            gameState = "gameOver"
            return
        }
        gameState = "serve"
    }

    for (let gbrick of gbricks) {
        if(gbrick.inPlay && ball.collides(gbrick)) {
            score += gbrick.tier * 200 + (gbrick.color + 1) * 25

            gbrick.hit()

            if (score > recoverPoints) {
                health = min(3, health + 1)

                recoverPoints += min(100000, recoverPoints * 2)
                recover.play()
            }

            if (checkVictory()) {
                gameState = "victory"
                victory.play()
                return
            }

            if (ball.x + 2 < gbrick.x && ball.dx > 0) {
                ball.dx = -ball.dx
                ball.x = gbrick.x - 8
            }
            else if (ball.x + 6 > gbrick.x + gbrick.width && ball.dx < 0) {
                ball.dx = -ball.dx
                ball.x = gbrick.x + 32
            }
            else if (ball.y < gbrick.y) {
                ball.dy = -ball.dy
                ball.y = gbrick.y - 8
            }
            else {
                ball.dy = -ball.dy
                ball.y = gbrick.y + 16
            }

            if (abs(ball.dy) < 5) {
                ball.dy = 1.02 * ball.dy
            }

            break
        }
    }
}

function renderHealth(health) {
    let healthX = VIRTUAL_WIDTH - 100
    for (let i = 0; i < health; i++) {
        image(hearts[0], healthX, 4)
        healthX += 11
    }
    for (let i = 0; i < 3 - health; i++){
        image(hearts[1], healthX, 4)
        healthX += 11
    }
}

function renderScore(score) {
    textFont(retroFont)
    textSize(8)
    textAlign(LEFT)
    fill(255)
    text("Score: " + score, VIRTUAL_WIDTH - 60, 11)
}

function checkVictory() {
    for (let gbrick of gbricks) {
        if (gbrick.inPlay) {
            return false
        }
    }
    return true
}

function victoryState() {
    ball.x = paddle.x + paddle.width / 2 - 4
    ball.y = paddle.y - 8
    ball.dx = ball.dy = 0
    health = 3

    paddle.render()
    ball.render()

    renderHealth(health)
    renderScore(score)

    textSize(24)
    fill(255)
    textAlign(CENTER)
    text("Level " + level + " complete", VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 4)
    textSize(14)
    text("Press Enter to Serve", VIRTUAL_WIDTH / 2, 3 * VIRTUAL_HEIGHT / 2)
}

function serve() {
    ball.x = paddle.x + paddle.width / 2 - 4
    ball.y = paddle.y - 8

    textFont(retroFont)
    textSize(24)
    fill(255)
    textAlign(CENTER)
    text("Level " + level, VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 3 + 30)
    textSize(14)
    text("Press Enter to Serve", VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 + 30)
}

function start() {
    textFont(retroFont)
    textSize(24)
    fill(255)
    textAlign(CENTER)
    text("BREAKOUT", VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2)
    textSize(14)

    if (highlighted == 1) {
        fill(103, 255, 255)
    }
    text("START", VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 + 70)
    fill(255)
    if (highlighted == 2) {
        fill(103, 255, 255)
    }
    text("HIGH SCORES", VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 + 90)
}

function paddleSelect() {
    textFont(retroFont)
    textSize(14)
    fill(255)
    textAlign(CENTER)
    text("Select your paddle with left and right arrow", VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 4)
    textSize(8)
    text("Press enter to continue!", VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 3)
    tint(255)
    if (currentPaddle == 0) {
        tint(40, 40, 40, 128)
    }
    image(arrows[0], VIRTUAL_WIDTH / 4 - 24, VIRTUAL_HEIGHT - VIRTUAL_HEIGHT / 3)
    tint(255)
    if (currentPaddle == 3) {
        tint(40, 40, 40, 128)
    }
    image(arrows[1], 3 * VIRTUAL_WIDTH / 4 - 10, VIRTUAL_HEIGHT - VIRTUAL_HEIGHT / 3)
    tint(255)
    image(paddles[1 + 4 * currentPaddle], VIRTUAL_WIDTH / 2 - 32, VIRTUAL_HEIGHT - VIRTUAL_HEIGHT / 3)

}

function init() {
    gbricks = createMap(level)
    score = 0
    health = 3
    recoverPoints = 5000
    chars = [65, 65, 65]
    highlightedChar = 0
}

function getHighScores() {
    let data = window.localStorage.getItem("breakout")
    if (data) {
        data = data.split("\n")

        for (let i = 0; i < data.length; i += 2){
            let hsname = data[i]
            let hsscore = data[i+1]
            if (hsname && hsscore) {
                sortScores.push({"name": hsname, "score": hsscore})
            }

            sortScores.sort(function (a, b) {
                return (b.score - a.score)
            })
        }
    }
    else {
        window.localStorage.setItem("breakout", "")
    }
}

function saveNewHighScore() {
    name = String.fromCharCode(chars[0], chars[1], chars[2])

    sortScores.push({"name": name, "score": score})

    sortScores.sort(function(a,b) {
        return (b.score - a.score)
    })

    data = ""
    for (let i = 0; i < min(sortScores.length, 10); i++) {
        data += sortScores[i].name + "\n" + sortScores[i].score +"\n"
    }

    if (data && name && score) {
        window.localStorage.setItem("breakout", data)
    }
}

function highScores() {
    textFont(retroFont)
    textSize(24)
    fill(255)
    textAlign(CENTER)
    text("High Scores", VIRTUAL_WIDTH / 2, 30)
    textSize(14)

    for (let i = 0; i < min(sortScores.length, 10); i++) {
        textAlign(LEFT)
        text((i + 1) + ".", VIRTUAL_WIDTH / 4, 60 + (i + 1) * 13)
        textAlign(RIGHT)
        text(sortScores[i].name, VIRTUAL_WIDTH / 2, 60 + (i + 1) * 13)
        textAlign(RIGHT)
        text(sortScores[i].score, 3 * VIRTUAL_WIDTH / 4, 60 + (i + 1) * 13)
    }

    textAlign(CENTER)
    textSize(8)
    text("Press Escape to return to the main menu", VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT - 10)
}

function enterHighScore() {
    textFont(retroFont)
    textSize(14)
    fill(255)
    textAlign(CENTER)
    text("Your score: " + score, VIRTUAL_WIDTH / 2, 30)

    textSize(24)
    if (highlightedChar == 0) {
        fill(103, 255, 255)
    }
    text(String.fromCharCode(chars[0]), VIRTUAL_WIDTH / 2 - 20, VIRTUAL_HEIGHT /2)
    fill(255)
    if (highlightedChar == 1) {
        fill(103, 255, 255)
    }
    text(String.fromCharCode(chars[1]), VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT /2)
    fill(255)
    if (highlightedChar == 2) {
        fill(103, 255, 255)
    }
    text(String.fromCharCode(chars[2]), VIRTUAL_WIDTH / 2 + 20, VIRTUAL_HEIGHT /2)
    fill(255)

    textSize(8)
    text("Use arrow keys to set name. Press enter to confirm.", VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT - 10)
}

function gameOver() {
    textFont(retroFont)
    textSize(24)
    fill(255)
    textAlign(CENTER)
    text("GAME OVER", VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 3)
    textSize(14)
    text("Final Score: " + score, VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2)
    text("Press Enter!", VIRTUAL_WIDTH / 2, 3 * VIRTUAL_HEIGHT / 2)
}

function checkIfHighScore() {
    if (sortScores.length < 10) {
        return true
    }
    else {
        for (let oldScore of sortScores) {
            if (score > oldScore.score) {
                return true
            }
        }
    }
    return false
}

function displayFPS() {
    textFont(retroFont)
    textSize(8)
    fill(0, 255, 0)
    textAlign(LEFT)
    text("FPS: " + parseInt(frameRate()), 10, 11)
}
