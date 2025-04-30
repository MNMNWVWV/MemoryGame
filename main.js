var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

canvas.width = window.innerWidth - 100;
canvas.height = window.innerHeight - 100;

var level = 1;
var num_cnt = level+2;
let gameRunning = false;
let isStartScene = true;

let rect_buttons = [];

/*
width: 1280px;
height: 720px;
margin: 300px
*/
var startbtn = {
    x:400,
    y:(720-100)/2+300,
    big_radius:80,
    small_radius:70,
    draw() {
        ctx.fillStyle='white';
        ctx.arc(this.x,this.y,this.big_radius,0,Math.PI*2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle='black';
        ctx.arc(this.x,this.y,this.small_radius,0,Math.PI*2);
        ctx.fill();
    },
    isClicked(x, y) {
        var dx = x - this.x; 
        var dy = y - this.y; 
        var distance = Math.sqrt(dx * dx + dy * dy);

        return distance <= this.small_radius; // 작은 원 내부인지 확인
    },
    remove() {
        ctx.clearRect(this.x - this.big_radius, this.y - this.big_radius, this.big_radius * 2, this.big_radius * 2);
        ctx.clearRect(this.x - this.small_radius, this.y - this.small_radius, this.small_radius * 2, this.small_radius * 2);
    }

}

let word = {
    draw(msg) {
        ctx.font = '50px Menlo';
        ctx.fillStyle = 'Yellow';
        ctx.textAlign = 'center';    // x를 기준으로 가운데 정렬
        ctx.textBaseline = 'middle'; // y를 기준으로 가운데 정렬
        ctx.fillText(msg, 1280, 720);
    }
}

let number = {
    draw(n, x, y) {
        ctx.font = '110px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';    // x를 기준으로 가운데 정렬
        ctx.textBaseline = 'middle'; // y를 기준으로 가운데 정렬
        ctx.fillText(n, x, y);
    }
}

class RectBtn {
    constructor(x, y, width = 110, height = 110) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.n = 0;
    }

    draw() {
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    isClicked(x, y) {
        return (x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height
        );
    }

    remove() {
        ctx.clearRect(this.x, this.y, this.width, this.height);
    }
}

function drawLevelText(level) {
    ctx.clearRect(1400, 0, 300, 60);

    ctx.font = '30px monospace';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    ctx.fillText('Level ' + level, canvas.width - 400, 20);
}

function shuffle_grid() {
    let rows = 5;
    let cols = 9;

    let cell_size = 130;
    let btn_size = 110;

    let grid = new Array(rows).fill(0).map(() => new Array(cols).fill(0));

    let num = 1;
    while(num <= num_cnt) {
        let row_idx = Math.floor(Math.random()*rows);
        let col_idx = Math.floor(Math.random()*cols);

        if(grid[row_idx][col_idx] == 0) {
            grid[row_idx][col_idx] = num;

            let center_x = (col_idx*cell_size)+(cell_size/2);
            let center_y = (row_idx*cell_size)+(cell_size/2);
            let rectbtn = new RectBtn(center_x+300, center_y);
            
            //rectbtn.draw();
            number.draw(num, rectbtn.x + rectbtn.width / 2, rectbtn.y + rectbtn.height / 2 + 10);
            
            rectbtn.n = num;

            rect_buttons.push(rectbtn);
            num+=1;
        }
    }
}

function playClickSound() {
    const sound = new Audio('click.wav');
    sound.play();
}

function playClearSound() {
    const sound = new Audio('clear.wav');
    sound.play();
}

canvas.addEventListener("click", (e) => {
    let rect = canvas.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;

    if (!gameRunning) { //시작화면 or 종료화면
        if(isStartScene == true) { //시작화면
            if (startbtn != null && startbtn.isClicked(mouseX, mouseY)) {
                //startgame
                startbtn.remove();
                game_screen();
            }
        }
        else { //종료화면
            if (restartBtn.isClicked(mouseX, mouseY)) {
                // 리겜 클릭 시 게임 초기화 및 시작화면으로
                restartBtn.remove();
                ctx.clearRect(0, 0, canvas.width, canvas.height); // 캔버스 전체 지우기
                level = 1; // 레벨 초기화
                num_cnt = level + 2;
                num_cnt = Math.min(num_cnt, 20);
                gameRunning = false;
                isStartScene = true;
                start_screen();
            }
        }
    }
    else {
        for (let i = 0; i < rect_buttons.length; i++) {
            if (rect_buttons[i].isClicked(mouseX, mouseY)) {
                playClickSound();
                if (rect_buttons[i].n == cnt) {
                    if(i === 0) {
                        for (let j = 0; j < rect_buttons.length; j++) {
                            rect_buttons[j].draw();
                        }
                    }
                    rect_buttons[i].remove();
                    rect_buttons.splice(i, 1); // 수정: 해당 버튼만 제거
                    cnt++;
                    console.log("정답!");
                } else {
                    end_screen();
                    console.log("오답!");
                }
                break;
            }
        }

        if (rect_buttons.length === 0) {
            playClearSound();
            level += 1;
            game_screen();
        }
    }
});

function start_screen(){
    
    isStartScene = true;
    drawLevelText(level);
    startbtn.draw();
}

function game_screen() {
    gameRunning = true;
    isStartScene = false;
    rect_buttons = [];
    cnt = 1;

    num_cnt = level + 2;
    num_cnt = Math.min(num_cnt, 20);

    drawLevelText(level);
    shuffle_grid();
}

function end_screen() {
    gameRunning = false;
    //네모 없애고 숫자 보여주기
    for(let i=0;i<rect_buttons.length;i++) {
        rect_buttons[i].remove();
        number.draw(rect_buttons[i].n, rect_buttons[i].x + rect_buttons[i].width / 2, rect_buttons[i].y + rect_buttons[i].height / 2 + 10);
    }
    //최종 단계 보여주기
    
    //리겜 버튼 만들기 && 리겜 버튼 누를 시 게임 초기화 및 시작화면으로
    // 리겜 버튼 그리기
    restartBtn.draw();
}

var restartBtn = new RectBtn(canvas.width / 2 - 100, canvas.height / 2 + 100, 200, 60); // 리겜 버튼 위치 설정

// 리겜 버튼 클릭 시 게임 초기화 및 시작 화면으로
restartBtn.draw = function() {
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = 'black';
    ctx.font = '30px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Regame', this.x + this.width / 2, this.y + this.height / 2);
};

restartBtn.isClicked = function(x, y) {
    return (x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height);
};

start_screen();
