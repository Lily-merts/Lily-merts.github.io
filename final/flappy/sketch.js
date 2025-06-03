let BACKGROUND_SCROLL_SPEED = .5
let BACKGROUND_LOOPING_PT = 413
let GROUND_SCROLL_SPEED = 1
let GROUND_LOOPING_SPEED = 438
let SPACE = 32

let bgScroll = 0
let groundScroll = 0
let spawnTimer = 0
let points = 0
let pipes = []
let gameState = "title" // title, countdown, play, done'
let count = 3
let timer = 0
let highScore = 0
let scroll = -1

let bgImage, groundImage, birdImage, bird, pipeImage, pipe, lastY
let flappyFont, gameFont, explosion, jump, score, hurt, music

function preload() {
    bgImage = loadImage('graphics/background.png')
    groundImage = loadImage('graphics/ground.png')
    birdImage = loadImage('graphics/bird.png')
    pipeImage = loadImage('graphics/pipe.png')

    flappyFont = loadFont('fonts/flappy.ttf')
    gameFont = loadFont('fonts/font.ttf')

    jump = loadSound('sounds/jump.wav')
    score = loadSound('sounds/score.wav')
    explosion = loadSound('sounds/explosion.wav')
    hurt = loadSound('sounds/hurt.wav')
    music = loadSound('sounds/marios_way.mp3')
}

function setup() {
    createCanvas(800, 500)
    bird = new Bird(birdImage, width / (2 * 1.74) - birdImage.width / 2, height / (2 * 1.74) - birdImage.height / 2)
    lastY = random(175, 225)
    music.loop()
}

function draw() {
    scale(1.74)
    noSmooth()

    image(bgImage, -bgScroll, 0)
    bgScroll = (bgScroll + BACKGROUND_SCROLL_SPEED) % BACKGROUND_LOOPING_PT

    image(groundImage, -groundScroll, height / 1.74 - 16)
    groundScroll = (groundScroll + GROUND_SCROLL_SPEED) % GROUND_LOOPING_SPEED

    if (gameState == "title") {
        title()
    }
    else if (gameState == "play"){
        play()
    }
    else if (gameState == "done"){
        done()
    }
}

function title() {
    fill(255)
    textSize(28)
    textAlign(CENTER)
    textFont(flappyFont)
    text("Fifty Bird", width / (2 * 1.74), 100)
    textSize(14)
    text("Press Enter to Begin", width / (2 * 1.74), 130)
    textSize(20)
    text("High Score: " + highScore, width / (2 * 1.74), 170)
}

function play() {
    bird.display()
    bird.update()

    spawnTimer += scroll/(-60)

    if (spawnTimer > 2) {
        pipe = new Pipe(pipeImage)
        pipe.y = constrain(lastY + random(-50, 50), 100, 220)
        pipes.push(pipe)
        lastY = pipe.y
        spawnTimer = 0
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        let pipe = pipes[i]
        pipe.display()
        pipe.update(scroll)

        if (bird.collides(pipe)) {
            explosion.play()
            hurt.play()
            gameState = "done"
        }

        if (pipe.x + pipe.width / 2 < bird.x && pipe.scored == false) {
            points++
            timer++
            pipe.scored = true
            score.play()
        }

        if (pipe.x + pipe.width < 0) {
            pipes.shift()
        }
    }

    if (timer == 5) {
        scroll -= 0.25
        timer = 0
    }


    displayPoints()
}

function done() {
    fill(255)
    textSize(28)
    textAlign(CENTER)
    textFont(flappyFont)

    text("GAME OVER", width / (2 * 1.74), 100)
    textSize(20)
    text("Score: " + points, width / (2 * 1.74), 130)
    text("Press Enter to Play Again", width / (2 * 1.74), 160)
    if (points > highScore) {
        textSize(24)
        text("NEW HIGH SCORE", width / (2 * 1.74), 50)
        highScore = points
    }

}

function keyPressed() {
    if (keyCode == SPACE && gameState == "play") {
        bird.jump()
        jump.play()
    }

    if (keyCode == ENTER || keyCode == RETURN) {
        if (gameState == "title") {
            scroll = -1
            gameState = "play"
        }

        if (gameState == "done") {
            points = 0
            bird.reset(height / (2 * 1.74) - birdImage.height / 2)
            pipes = []
            gameState = "title"
        }
    }
}

function displayPoints() {
    fill(255)
    textSize(28)
    textFont(flappyFont)
    textAlign(LEFT)
    text("Score: " + points, 10, 30)
}
