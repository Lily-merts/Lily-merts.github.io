class Pipe {
    constructor(img) {
        this.img = img
        this.x = 500
        this.y = random(100, 200)
        this.width = img.width
        this.height = img.height
        this.gap = random(80, 100)
        this.scored = false
    }

    update(scroll) {
        this.x += scroll
    }

    display() {
        image(this.img, this.x, this.y, this.width * 2/3 , this.height * 2/3)
        push()
        scale(1, -1)
        image(this.img, this.x, -this.y + this.gap, this.width * 2/3, this.height * 2/3)
        pop()
    }
}
