/*
*   ^
*   |     [p1]
*   |      /\
*   |     /  \
*   |    /    \
*   |   /______\
*   | [p3]    [p2]
*   --------------->
*
*/
const DBG            = false;
const APP_WIDTH      = 1000; // px
const APP_HEIGHT     = 500;  // px
const APP_SPEED      = 16;   // ms
const TRG_RADIUS     = 50;   // px
const TRG_DEGREE     = 150;  // deg
const TRG_SPEED      = 6;    // px
const TRG_ROT_DELTA  = 0.05  // rad | мин. значение разности углов векторов направления и скорости
const TRG_ROT_DEGREE = 0.08; // rad | значение изменения угла за один цикл отрисовки
const TRG_TAIL_NUM   = 10;   // num
const CIRCLE_RADIUS  = 10;   // px


class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Triangle {
    constructor(x, y, vec) {
        this.x     = x;
        this.y     = y;
        this.vec   = vec - Math.PI; // вектор направления | -PI т.к. на экране инвентирован Y
        this.vec_u = vec - Math.PI; // вектор скорости    |
        this.tail  = [];
    }

    draw(ctx) {
        let p1 = new Point(this.x + TRG_RADIUS * Math.cos(this.vec_u), this.y + TRG_RADIUS * Math.sin(this.vec_u));
        let p2 = new Point(this.x + TRG_RADIUS * Math.cos(this.vec_u - degToRad(TRG_DEGREE)), this.y + TRG_RADIUS * Math.sin(this.vec_u - degToRad(TRG_DEGREE)));
        let p3 = new Point(this.x + TRG_RADIUS * Math.cos(this.vec_u + degToRad(TRG_DEGREE)), this.y + TRG_RADIUS * Math.sin(this.vec_u + degToRad(TRG_DEGREE)));

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        ctx.strokeStyle = 'white';
        ctx.stroke();

        // this.drawTail(ctx, p2, p3);
    }

    drawTail(ctx, p2, p3) {
        if (this.tail.length == TRG_TAIL_NUM) {
            this.tail.shift();
        }
        this.tail.push(p2);

        ctx.beginPath();
        ctx.moveTo(this.tail[0].x, this.tail[0].y);
        for (let i = 1; i < this.tail.length; i++) {
            // ctx.quadraticCurveTo(this.tail[i-1].x, this.tail[i-1].y, this.tail[i].x, this.tail[i].y)
            let dx = Math.abs(this.tail[i].x - this.tail[i-1].x);
            let dy = Math.abs(this.tail[i].y - this.tail[i-1].y);
            let length = Math.sqrt(dx*dx + dy*dy);
            if (length < ctx.canvas.height) 
                ctx.lineTo(this.tail[i].x, this.tail[i].y);
            // else
            //    console.log(length + ' ' + ctx.canvas.height);
        }
        ctx.strokeStyle = 'red';
        ctx.stroke();
    }

    move() {
        this.x += TRG_SPEED * Math.cos(this.vec_u);
        this.y += TRG_SPEED * Math.sin(this.vec_u);
        this.checkCollisions();
        this.checkSpeedVector();
    }

    checkCollisions() {
        if (this.x < -TRG_RADIUS) this.x = canvas.width + TRG_RADIUS;
        else if (this.x > canvas.width + TRG_RADIUS) this.x = -TRG_RADIUS;
        if (this.y < -TRG_RADIUS) this.y = canvas.height + TRG_RADIUS;
        else if (this.y > canvas.height + TRG_RADIUS) this.y = -TRG_RADIUS;
    }

    checkCircle(circle) {
        let dx = Math.abs(circle.x - this.x);
        let dy = Math.abs(circle.y - this.y);
        let length = Math.sqrt(dx*dx + dy*dy);
        if (length < CIRCLE_RADIUS + TRG_RADIUS) {
            circle.x = randomCoordinate(0, canvas.width, CIRCLE_RADIUS);
            circle.y = randomCoordinate(0, canvas.height, CIRCLE_RADIUS);
            return true;
        }
        return false;
    }

    checkSpeedVector() {
        if (Math.abs(this.vec - this.vec_u) > TRG_ROT_DELTA) {
            let vec = this.vec;
            if (vec < 0) vec += 2*Math.PI;     // переводим из диапазона -PI to PI в 0 to 2PI
            let vec_u = this.vec_u;
            if (vec_u < 0) vec_u += 2*Math.PI; // переводим из диапазона -PI to PI в 0 to 2PI

            if (vec > vec_u) {
                if (vec - vec_u > Math.PI) // против часовой
                    this.rotateLeft();
                else                       // по
                    this.rotateRight();
            } else {
                if (vec_u - vec < Math.PI) // против часовой
                    this.rotateLeft();
                else                       // по
                    this.rotateRight();
            }
        }
    }

    rotateLeft() {
        this.vec_u -= TRG_ROT_DEGREE;
        if (this.vec_u < -Math.PI) this.vec_u = Math.PI;
    }

    rotateRight() {
        this.vec_u += TRG_ROT_DEGREE;
        if (this.vec_u > Math.PI) this.vec_u = -Math.PI;

    }
}

class Circle {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
        ctx.strokeStyle = 'white';
        ctx.stroke();
    }
}


var canvas = document.querySelector('#app');
var ctx    = canvas.getContext('2d');
var num    = 0;

canvas.setAttribute('width',  APP_WIDTH);
canvas.setAttribute('height', APP_HEIGHT);

document.querySelector('#num').style.top  = canvas.offsetTop  + 5  + 'px';
document.querySelector('#num').style.left = canvas.offsetLeft + 5  + 'px';


let trg    = new Triangle(100, 100, Math.PI/2);
let circle = new Circle(randomCoordinate(0, canvas.width, CIRCLE_RADIUS), randomCoordinate(0, canvas.height, CIRCLE_RADIUS), CIRCLE_RADIUS);

document.addEventListener('mousemove', function (event) {
    // if (event.which) {
        let x   = event.clientX - canvas.offsetLeft;
        let y   = event.clientY - canvas.offsetTop;
        let dx  = x - trg.x;
        let dy  = y - trg.y;
        let vec = Math.atan2(dy, dx);
        trg.vec = vec;
    // }
});


setInterval(function() {
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#2f2f2f";
    ctx.fill();

    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    trg.move();
    if (trg.checkCircle(circle)) {
        document.querySelector('#num span').textContent = ++num;
    }
    trg.draw(ctx);
    circle.draw(ctx);
    if (DBG) drawDebugInfo();
}, APP_SPEED);


function degToRad(deg) {
    return deg * Math.PI / 180;
}

function randomCoordinate(min, max, margin) {
    let coordinate = Math.random() * max;
    if (coordinate < min + margin)
        coordinate = margin;
    else if (coordinate > max - margin)
        coordinate = max - margin;

    return coordinate;
}

function drawDebugInfo() {
    // нарисовать описывающую окружность
    ctx.beginPath();
    ctx.arc(trg.x, trg.y, TRG_RADIUS, 0, 2*Math.PI);
    ctx.strokeStyle = 'red';
    ctx.stroke();

    // нарисовать вектор направления
    let p1 = new Point(trg.x + TRG_RADIUS * Math.cos(trg.vec), trg.y + TRG_RADIUS * Math.sin(trg.vec));
    ctx.beginPath();
    ctx.moveTo(trg.x, trg.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.strokeStyle = 'blue';
    ctx.stroke();

    // нарисовать вектор скорости
    let p4 = new Point(trg.x + TRG_RADIUS * Math.cos(trg.vec_u), trg.y + TRG_RADIUS * Math.sin(trg.vec_u));
    ctx.beginPath();
    ctx.moveTo(trg.x, trg.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.strokeStyle = 'red';
    ctx.stroke();
}