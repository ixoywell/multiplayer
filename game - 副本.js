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

//Adjust their size
if ( isAdater() ) {
	canvas.width = document.documentElement.clientWidth;
	canvas.height = document.documentElement.clientHeight;
}else{
	alert("用手机看，才高大上！");
};
var ctx = canvas.getContext("2d");
var bgColor = "rgb(40,40,40)";
var ready;
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
var score = 0;

var speed = 5;
var bulletSpeed = 10;
var enemySpeed = 20;
var fps = -1;
var bulletfps = 0;


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

//Initialize / Start game
function init(){
	ready = false;
	clearTimers();
	initializeTimers();

	//Spawn player
	player = new Player();
	player.position.set(canvas.width/2,canvas.height-player.size);
	player.render();
	entities.push(player);

}

//Update Entities
function updateEntities(){
	entities.forEach(function(e){
		if (e.position.y > canvas.height + 20){
			if (e.name == "Enemy"){
				enemyScore += 1;
			}
			removeEntity(e);
		}
		e.update(1/fps);
	})
}


// Classes
//Vector (Base class)
var Vector = function(x1,y1){
	this.x = x1;
	this.y = y1;
}

//Entity (Base class) 元素公共属性
function Entity(){
	this.name = "Entity"; //名字
	this.size = 25; //大小
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
	if (this.position.x + this.size > canvas.width) {this.position.x = canvas.width - this.size;}
}
Entity.prototype.render = function(){
	ctx.fillStyle = this.color;
	ctx.fillRect(this.position.x,this.position.y,this.size,this.size);
}

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

//Click Event
//function canvasClick(){
function launch(){
	if (gameOver){ if (fader > .5) reset();return;}
	if (ready)		{init(); return;}
	var bullet = new Bullet();
	bullet.position.set(player.position.x + player.size / 2 - bullet.size/2,player.position.y - player.size/2 - bullet.size /2);
	bullet.velocity.y = -30;
	entities.push(bullet);
	if (score > 0) score -= 1;
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



// 键盘操作事件
//document.addEventListener("keydown", function (e){
//	switch(e.keyCode){
//		case 37:
//			plane.right = false;
//			plane.left = true;
//			break;
//		case 38:
//			plane.bottom = false;
//			plane.top = true;
//			break;
//		case 39:
//			plane.left = false;
//			plane.right = true;
//			break;
//		case 40:
//			plane.top = false;
//			plane.bottom = true;
//			break;
//	}
//
//	if (plane.o == 1 && e.keyCode == 32) {
//
//		musicbomb.currentTime = 0;
//		musicbomb.play();
//
//		for (var i = 0,len = enemys.length; i < len; i++) {
//			if (enemys[i].blood != 0) {
//
//				enemys[i].blood = 0;
//
//				if (enemys[i].fn < 10) {
//					grade += 10;
//				}else if (enemys[i].fn >= 10 && enemys[i].fn <= 14) {
//					grade += 20;
//				}
//			};
//		};
//		plane.o = 0;
//	};
//}, false);

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

//Draws 'Ready?' screen 渲染游戏开始
function drawReadyScreen(){
	drawBG();
	//drawStatic(.25);
	drawScore();
	fader += .1 * 1/fps;
	ctx.fillStyle = "rgba(255,255,255," + fader + ")";
	ctx.font = "72px sans-serif";
	ctx.fillText("READY?",canvas.width/2 - 140,canvas.height/2);
	drawScore();
}

//Draw 'Game Over' screen 渲染游戏结束
function drawGameOver(){
	ctx.fillStyle = "rgba(0,0,0,"+fader +")";
	ctx.fillRect(0,0,canvas.width,canvas.height);
	drawStatic(fader/2);
	drawScore();
	fader += .1 * 1/fps
	ctx.fillStyle = "rgba(255,255,255," + fader + ")";
	ctx.font = "72px sans-serif";
	ctx.fillText("GAME OVER",canvas.width/2 - 220,canvas.height/2);
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
	drawEntities();
	drawScore();
	if (gameOver){drawGameOver(); return;}
	else if (ready){drawReadyScreen(); return;}
	updateEntities();
	gameTime += 1/fps;
	if (enemyScore >= 3) {
		clearTimers();
		gameOver = true;
		fader = 0;
	}
}

//Reset app back to 'Ready?' Screen
function reset(){
	if (score > highScore) highScore = score;
	ready = true;
	enemyScore = 0;
	gameTime = 0;
	difficulty = 1;
	score = 0;
	spawntime = 1500;
	gameOver = false;
	fader = 0;
	entities = [];
	player = null;
	launch();
	clearTimers()
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
	if (player && !gameOver) {
		touchX = e.touches[0].pageX - player.position.x;
		touchY = e.touches[0].pageY - player.position.y;
		touchendX = e.touches[0].pageX;
		touchendY = e.touches[0].pageY;
	}
},false);

canvas.addEventListener("touchmove", function (e){
	x = e.touches[0].pageX - touchX;
	y = e.touches[0].pageY - touchY;
	//plane.x = x;
	//plane.y = y;

	if (player && !gameOver) {
		player.position.x = x;
		player.position.y = y;
	}
	e.preventDefault();

},false);


canvas.addEventListener("touchend", function (e){

},false);

//HTML load event
document.addEventListener('DOMContentLoaded', reset());



//游戏动画开始
//var renderTimer = setInterval(render,1/fps*100);
var renderTimer = requestAnimationFrame(render);