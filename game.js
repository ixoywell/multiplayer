/*  Copyright 2012-2016 QiuYuhui

 written by : qiu
 written for : http://inir.cn/realtime-multiplayer/
 MIT Licensed.
 */

//requestAnimationFrame兼容
(function() {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
	}
	if (!window.requestAnimationFrame) window.requestAnimationFrame = function(callback, element) {
		var currTime = new Date().getTime();
		var timeToCall = Math.max(0, 16 - (currTime - lastTime));
		var id = window.setTimeout(function() {
			callback(currTime + timeToCall);
		}, timeToCall);
		lastTime = currTime + timeToCall;
		return id;
	};
	if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function(id) {
		clearTimeout(id);
	};
}());


//画布， 各参数
var canvas = document.getElementById('viewport');

var w = document.documentElement.clientWidth;
var h = document.documentElement.clientHeight;

window.addEventListener("resize", resizeCanvas, false);

function resizeCanvas() {
	canvas.width = w;   //window.innerWidth;
	canvas.height = h;
}
//Adjust their size
if ( isAdater() ) {
	canvas.width = w; // document.documentElement.clientWidth;   //screen.width;
	canvas.height = h; //document.documentElement.clientHeight;// screen.height;
}else{
	alert("用手机看，才高大上！");
};
var ctx = canvas.getContext("2d");
var bgColor = "rgb(40,40,40)";
var ready = true;
var enemyScore;
var difficultyTimer;
var spawnTimer;
var spawntime;
var gameTime;
var difficulty;
var score;
var highScore=0;
var gameOver;
var entities = [];
var player;
var fader;
var imger = 0;
var bullets = [];
var props = [];
var enemys = [];

var speed = 5;
var bulletSpeed = 10;
var enemySpeed = 20;
var fps = -1;
var bulletfps = 0;
var touching = false;

//资源载入
var imgplane = new Image();
imgplane.src="./img/plane.png";


//Global Functions
//----------------

//Clear all timers
function clearTimers(){
	clearInterval(difficultyTimer);
	clearInterval(spawnTimer);
}

//Initialize all timers
function initializeTimers(){
	difficultyTimer = setInterval(increaseDifficulty,2000);
	spawnTimer = setInterval(spawnEnemy,spawntime);
}



//Update Entities 刷新各元素
function updateEntities(){
	entities.forEach(function(e){
		if (e.position.y > canvas.height + 20){ //当enemy 到达底部的时候，分数减一
			if (e.name == "Enemy"){
				enemyScore += 1;
			}
			removeEntity(e);
		}
		if (e.name == "Bullet" && touching){ //如果是touching 是true（点击时）时，发射子弹
			e.update(0);
		}else {
			e.update(1 / fps);
		}
		if (e.name == "Player"){ //如果是player不进行位置刷新 update的参数值为0；
			e.update(0);
		}else {
			e.update(1 / fps);
		}
	})
}


// Classes
//Vector (Base class)
var Vector = function(x1,y1){
	this.x = x1;
	this.y = y1;
}
Vector.prototype.set = function(a,b){
	this.x = a;
	this.y = b;
}

//Entity (Base class) 元素公共属性
function Entity(){
	this.name = "Entity"; //名字
	this.size = 30; //大小
	this.position = new Vector(0,0); //坐标
	this.velocity = new Vector(0,0); //速度
	this.color = "#FFFFFF"; //颜色
}
Entity.prototype.sayName = function(){
	console.log(this.name);
}
Entity.prototype.update = function(deltaTime){
	this.position.x += this.velocity.x * deltaTime;
	this.position.y += this.velocity.y * deltaTime;
	//Keep in bounds
	if (this.position.x - this.size < 0) {this.position.x = this.size;}
	if (this.position.x - this.size > canvas.width) {this.position.x = canvas.width - this.size;}
}
Entity.prototype.render = function(){
	ctx.fillStyle = this.color;
	ctx.fillRect(this.position.x,this.position.y,this.size,this.size);
}

//Enemy Entity  敌机
var Enemy = function(){
	Entity.call(this);
	this.name = "Enemy";
	this.size = Math.floor((Math.random() * 50)+20);
	this.color = randomColor(90,150);
}
Enemy.prototype = Object.create(Entity.prototype);
Enemy.prototype.constructor = Entity;

//Player Entity  玩家
var Player = function(){
	Entity.call(this); //将Entity方法引进来
	this.name = "Player";
	this.color = "#4747FF"
}
Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Entity;

//Particle Entity  粒子
var Particle = function(){
	Entity.call(this);
	this.name = "Particle";
	this.size = 10;
	this.time = 0;
	this.maxTime = Math.floor((Math.random() * 10) + 3);
	this.velocity.x = Math.floor((Math.random() * 20) - 10);
	this.velocity.y = Math.floor((Math.random() * 20) - 10);
}
Particle.prototype = Object.create(Entity.prototype);
Particle.prototype.constructor = Entity;
Particle.prototype.update = function(deltatime){
	Entity.prototype.update.call(this,deltatime);
	this.time += deltatime;
	if (this.time >= this.maxTime) removeEntity(this);
}

//Bullet Entity  子弹
var Bullet = function(){
	Entity.call(this);
	this.name = "Bullet";
	this.size = 10;
	this.time = 0;
	this.color = "rgba(200,200,200,1)";
	this.particlesDelay = .5;
}
Bullet.prototype = Object.create(Entity.prototype);
Bullet.prototype.constructor = Entity;
Bullet.prototype.update = function(deltatime){
	Entity.prototype.update.call(this,deltatime);

	//Check for collisions
	var me = this;
	entities.forEach(function(e){
		if (e !== me && e.name != "Particle"){
			if (overlaps(me,e)){
				death(e);
				removeEntity(me);
			}
		}
	})
	//Remove from game if outside bounds
	if (this.position.y < 0) removeEntity(this);
	console.log(this.time);
	//Create particles
	this.time += deltatime;
	if (this.time >= this.particlesDelay){
		this.time = 0;
		var p = new Particle();
		p.size = Math.floor((Math.random() * 5)+2);
		p.color = setAlpha("rgb(125,125,125)",Math.random());
		//p.color = setAlpha(randomColor(100,255),Math.random()); //Rainbow colored particles
		p.velocity.x /=2;
		p.position.x = this.position.x + this.size /2 - p.size/2;
		p.position.y = this.position.y - p.size/2;
		entities.push(p);
	}
}

//Return mouse position relative to canvas  获取touch 坐标
function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return new Vector(evt.clientX - rect.left, evt.clientY - rect.top)
}

player = new Player();
entities.push(player);
//Initialize / Start game
function init(){
	//ready = false;
	clearTimers();
	initializeTimers();
	//Spawn player
	//player = new Player();
	//player.position.set(canvas.width/2,canvas.height-player.size);
	player.render();
	//entities.push(player);

}


//Click Event
//function canvasClick(){
function launch(){
	//if (gameOver){ if (fader > .5) reset();return;}
	//if (ready)		{init(); return;}
	var bullet = new Bullet();
	bullet.position.set(player.position.x + player.size / 2 - bullet.size/2,player.position.y - player.size/2 - bullet.size /2);
	bullet.velocity.y = 10; //子弹发射速度
	entities.push(bullet);
	if (score > 0) score -= 1;
	//console.log(player.position.x + player.size / 2 - bullet.size/2,player.position.y - player.size/2 - bullet.size /2);
}


//Increment difficulty
function increaseDifficulty(){
	difficulty += 1;
	if (spawntime > 20) spawntime -= 20;
	clearInterval(spawnTimer);
	spawnTimer = setInterval(spawnEnemy,spawntime);
}
//Change alpha of color
function setAlpha(color,alpha){
	if (color.indexOf('a') == -1){
		return color.replace(")",","+alpha+")").replace("rgb","rgba");
	}
}

//Entity death
function death(entity){
	if (entity.name == "Enemy") {
		var particleCount = Math.floor((Math.random() * 6) + 3);
		for (var i = 0; i < particleCount; i++){
			var p = new Particle();
			p.color = entity.color;
			p.size = Math.floor((Math.random() * entity.size/2) + 5);
			p.position.set(entity.position.x+entity.size/2,entity.position.y+entity.size/2);
			entities.push(p);
		}
		score += 25;
	}
	removeEntity(entity);
}

//Remove Entity
function removeEntity(entity){
	var idx = entities.indexOf(entity);
	if (idx > -1) entities.splice(idx,1);
}

//Check if two entities overlap
function overlaps(entityA,entityB){
	var sa = entityA.size;
	var x1a = entityA.position.x;
	var x2a = entityA.position.x + sa;
	var y1a = entityA.position.y;
	var y2a = entityA.position.y + sa;
	var sb = entityB.size;
	var x1b = entityB.position.x;
	var x2b = entityB.position.x + sb;
	var y1b = entityB.position.y;
	var y2b = entityB.position.y + sb;
	return (x1a < x2b && x2a > x1b && y1a < y2b && y2a > y1b);
}

//Spawns new enemy
function spawnEnemy(){
	var e = new Enemy();
	var px = Math.floor((Math.random() * canvas.width));
	var py = -e.size;
	var v = difficulty;
	var a = Math.floor((Math.random() * (v + 15)) + v);
	var f = Math.floor((Math.random() * (v + 15)) + v);
	e.position.set(px,py);
	var r = Math.random();
	if (r > .5){
		straightDownMotion(e,v);
	}
	else if (r > .3){
		sineMotion(e,a,f,v);
	}
	else if (r > .1){
		triangularMotion(e,a,f,v);
	}
	else{
		sawtoothMotion(e,a,f,v);
	}
	entities.push(e);
}

//Straight down motion
function straightDownMotion(entity,speed){
	entity.update = function(deltatime){
		this.velocity.x = 0;
		this.velocity.y = speed;
		Entity.prototype.update.call(this,deltatime);
	}
}

//Define sin wave motion
function sineMotion(entity,amplitude,freq,speed){
	entity.update = function(deltatime){
		this.velocity.x = amplitude * Math.cos(this.position.y/freq);
		this.velocity.y = speed;
		Entity.prototype.update.call(this,deltatime);
	}
}

//Define saw tooth motion (sorta)
function sawtoothMotion(entity, amplitude,freq,speed){
	var modifier = 1;
	if (Math.random() > .5) modifier = -1;
	entity.update = function(deltatime){
		this.velocity.x = modifier * ((-2*amplitude)/Math.PI)*Math.atan(1/Math.tan(this.position.y / freq));
		this.velocity.y = speed;
		Entity.prototype.update.call(this,deltatime);
	}
}

//Define triangular motion ()
function triangularMotion(entity, amplitude,freq,speed){
	entity.update = function(deltatime){
		this.velocity.x = ((2*amplitude)/Math.PI)*Math.asin(Math.sin(this.position.y / freq));
		this.velocity.y = speed;
		Entity.prototype.update.call(this,deltatime);
	}
}

//Generate random rgba color string
function randomColor(min,max){
	var r = Math.floor((Math.random() * max) + min);
	var g = Math.floor((Math.random() * max) + min);
	var b = Math.floor((Math.random() * max) + min);
	var col = "rgb(" + r + "," + g + "," + b + ")";
	return col;
}

//手机校验
function isAdater(){
	var Agents = ["Android","iPhone","SymbianOS","Windows Phone","iPad","iPod"];
	var userAgentInfo = navigator.userAgent;
	var flag = false;
	for (var i = 0; i < Agents.length; i++) {
		if (userAgentInfo.indexOf(Agents[i]) > 0) {
			flag = true;
			break;
		}
	}
	return flag;
}

//Draw Score 分数
function drawScore(){
	ctx.fillStyle = "#CCFF99";
	ctx.font = "24px sans-serif";
	ctx.fillText("Score: " + score,10,24);
	ctx.font = "16px sans-serif";
	ctx.fillText("High Score: " + highScore,10,48);
	var enemyScoreString = "";
	for (var i = 0; i < enemyScore; i++){
		enemyScoreString += "X";
	}
	ctx.font = "24px sans-serif";
	ctx.fillStyle = "#FF6666";
	ctx.fillText(enemyScoreString,canvas.width - 75,24);
	ctx.font = "16px sans-serif";
	ctx.fillText("Difficulty: " + difficulty,canvas.width/2 - 50,24);
}

//Draw background 渲染背景
function drawBG(){
	ctx.fillStyle = bgColor;
	ctx.fillRect(0,0,canvas.width,canvas.height);
}

//Draw all entities 渲染所有元素
function drawEntities(){
	entities.forEach(function(e){e.render();});
}

//Render everything  渲染显示
function render(){
	drawBG();
	init();
	launch();
	drawEntities();
	drawScore();
	updateEntities();
	//console.log(new Date().getDate());
	requestAnimationFrame(render);
}

// 游戏触摸移动事件
var touchX = 0;
var touchY = 0;
var x = 0;
var y = 0;
var touchendX = 0;
var touchendY = 0;

canvas.addEventListener("touchstart", function (e){
	// console.log(e.touches[0]);
	//if (player && !gameOver) {
		touchX = e.touches[0].pageX - player.size;
		touchY = e.touches[0].pageY - player.size;
		//touchendX = e.touches[0].pageX;
		//touchendY = e.touches[0].pageY;
	//console.log(e.touches[0].pageX, e.touches[0].pageY);
	//console.log(touchX,touchY);
	touching = true;
	//}
},false);

canvas.addEventListener("touchmove", function (e){
	x = e.touches[0].pageX - player.size;
	y = e.touches[0].pageY - player.size;
	//plane.x = x;
	//plane.y = y;

	//if (player && !gameOver) {
		player.position.x = x;
		player.position.y = y;
	//}
	//e.preventDefault();


},false);


canvas.addEventListener("touchend", function (e){
	touching = false;
},false);

//HTML load event
document.addEventListener('DOMContentLoaded', render());



//游戏动画开始
//var renderTimer = setInterval(render,1/fps*100);
var renderTimer = requestAnimationFrame(render);