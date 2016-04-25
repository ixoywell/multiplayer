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

var canvas = document.getElementById('GameCanvas');
var lod = document.getElementById('lod');
var over = document.getElementById('over');
var game2 = document.getElementById('game2');
var button = $(".button").get(0);

var musicbg = document.getElementById('musicbg');
var musicbullet = document.getElementById('musicbullet');
var musice1 = document.getElementById('musice1');
var musicover = document.getElementById('musicover');
var musicbomb = document.getElementById('musicbomb');


if (isAdater()) {
	canvas.width = document.documentElement.clientWidth;
	canvas.height = document.documentElement.clientHeight;
};

var ctx = canvas.getContext("2d");
var canvasWidth = canvas.width;
var canvasHeight = canvas.height;
var imger = 0;
var bullets = [];
var props = [];
var enemys = [];
var grade = 0;

var speed = 5;
var bulletspeed = 10;
var enemyspeed = 20;
var fps = -1;
var bulletfps = 0;

// 敌人爆炸音效控制
var mus = 0;

var imgbg = new Image();
imgbg.src="./img/bg.jpg";

var imgplane = new Image();
imgplane.src="./img/plane.png";

var imgplanee = new Image();
imgplanee.src="./img/planee.png";

var imgbullet1 = new Image();
imgbullet1.src="./img/bullet1.png";

var imgbullet2 = new Image();
imgbullet2.src="./img/bullet2.png";

var imgprop1 = new Image();
imgprop1.src="./img/prop1.png";

var imgprop2 = new Image();
imgprop2.src="./img/prop2.png";

var imgenemy1 = new Image();
imgenemy1.src="./img/enemy1.png";

var imgenemy2 = new Image();
imgenemy2.src="./img/enemy2.png";

var imgenemy1e = new Image();
imgenemy1e.src="./img/enemy1e.png";

var imgenemy2e = new Image();
imgenemy2e.src="./img/enemy2e.png";


// 新加图片对象
var imgfenshu_bg = new Image();
imgfenshu_bg.src="./img/fenshu_bg.png";


	//loading
    var imgarr = ["./img/loading_tu.png","./img/logo.png","./img/anniu_bufu.png","./img/anniu_guanbi.png","./img/anniu_paihangbang.png","./img/anniu_paihangbang1.png","./img/anniu_pk.png","./img/anniu_zailaiyici.png","./img/anniu_zailaiyici1.png","./img/bg.jpg","./img/bullet1.png","./img/bullet2.png","./img/chahua1_bg.png","./img/chahua1_hua1.png","./img/chahua1_hua2.png","./img/chahua2_bg.png","./img/chahua2_hua1.png","./img/chahua2_hua2.png","./img/chahua2_hua3.png","./img/chahua2_hua4.png","./img/chahua3_bg.png","./img/duishou_fenshu_bg.png","./img/enemy1.png","./img/enemy1e.png","./img/enemy2.png","./img/enemy2e.png","./img/erweima.png","./img/fenshu_bg.png","./img/game_bg.png","./img/guanzhu.png","./img/guize_bg.jpg","./img/guji1.png","./img/guji2.png","./img/jiangpai1.png","./img/jiangpai2.png","./img/jiangpai3.png","./img/jiangpin.png","./img/P1.jpg","./img/paihangbang_bg.png","./img/paihangbang_biaoti.png","./img/paihangbang_paiming_lihe.png","./img/plane.png","./img/planee.png","./img/prop1.png","./img/shouye_bg.jpg","./img/shouye_biaoti.png","./img/shouye_guaiwu.png","./img/shouye_jiangpin.png","./img/shouye_kaishi.png","./img/shouye_paihangbang.png","./img/touxiang_mengban.png","./img/touxiang_mengban2.png"];
    var imgobj = [];
    var imgs = 0;
    var jindu = 0;
    for (var i = 0,len = imgarr.length; i < len; i++) {
        imgobj[i] = new Image();
        imgobj[i].src = imgarr[i];
        imgobj[i].onload = function (){
            imgs++;
            jindu = Math.floor((imgs / len)*100) * 0.01;
            jindu = jindu.toFixed(2);
            $(".loading_tu").css("background-position",Math.floor(jindu*6) * -233 + "px 0px");
            $(".loading_t").css("width",jindu*($(".loading_tiao").width()) + "px");
            jindu = jindu * 100;
            jindu = Math.floor(jindu);
            $(".loading_zi").text(jindu + "% loading...");
            if (imgs >= len) {
            	$(".loading").css("display","none");
            	if(isChallenge){
            		musicbg.play();
					$(".shouye").hide();
					$(".guize").show();
					setTimeout(function(){
						if (kais) {
							kais = false;
						    $(".guize").hide();
						    $(".logo").hide();
							$("#canvas1").show();
						    start();	
						};
				    },8000);
            	}else{
	            	//$(".loading").css("display","none");
	                $(".chahua").css("display","block");	
            	}
                
                musicbg.play();
                musicbg.currentTime = 0;
                musicbg.play();

            };
        }
    };



//背景
var bg = {
	y:-canvasHeight,
	draw:function (){
		this.move();
		ctx.drawImage(imgbg, 0, 0, 640, 2270, 0, this.y, canvasWidth, canvasHeight*2);
	},
	move:function (){
		this.y += 1;
		if (this.y > 0) {
			this.y = -canvasHeight + 1;
		};
	}
};

//我方飞机
var plane = {
	z:0,
	o:0,
	blood:1,
	img:imgplane,
	w:100,
	h:133,
	x:canvasWidth*0.5-50,
	y:canvasHeight*0.7,
	imgplaneX:0,
	imgplaneY:0,
	left:false,
	right:false,
	top:false,
	bottom:false,
	draw:function (){
		this.move();
		ctx.drawImage(this.img, this.imgplaneX, this.imgplaneY, this.w, this.h, this.x, this.y, this.w, this.h);
	},
	move:function (){
		if (this.x <= 0) {
			this.x = 0;
			this.left = false;
		};
		if (this.x >= canvasWidth-this.w) {
			this.x = canvasWidth-this.w;
			this.right = false;
		};
		if (this.y <= 0) {
			this.y = 0;
			this.top = false;
		};
		if (this.y >= canvasHeight-this.h) {
			this.y = canvasHeight-this.h;
			this.bottom = false;
		};

		if (this.left && !this.right) {
			this.x -= speed*2;
		};
		if (this.right && !this.left) {
			this.x += speed*2;
		};
		if (this.top && !this.bottom) {
			this.y -= speed*2;
		};
		if (this.bottom && !this.top) {
			this.y += speed*2;
		};
		this.left = false;
		this.right = false;
		this.top = false;
		this.bottom = false;

		this.imgplaneX += this.w;
		if (this.blood <= 0) {
			if (this.imgplaneX == this.w*2) {
				musicover.play();
			}

			this.img = imgplanee;

			if (this.imgplaneX == this.w*3) {
				endGame(grade);
				isPlay=1;
				//over.style.display = "block";

				// if (localStorage.grade) {
				// 	if (grade > localStorage.grade) {}
				// }else{
				// 	localStorage.setItem("grade",grade);
				// }

				//$(".fenshuxinxi>p").text(grade + "分!");
			};

			if (this.imgplaneX == this.w*8) {
				this.imgplaneX = this.w*7;
			};
		} else if (this.imgplaneX > this.w) {
			this.imgplaneX = 0;
		};
		
	}
};

//随机数
function fnRand(min,max){
	return parseInt(Math.random()*(max-min)+min);
}

//撞击判断
function crash(obj1,obj2){

	var l1 = obj1.x;
	var r1 = obj1.x+obj1.w;
	var t1 = obj1.y; 
	var b1 = obj1.y+obj1.h;
	var l2 = obj2.x;
	var r2 = obj2.x+obj2.w;
	var t2 = obj2.y; 
	var b2 = obj2.y+obj2.h;

	if (l1<r2&&r1>l2&&t1<b2&&b1>t2){
		return true;
	}else{
		return false;
	}
}

//子弹
function Bullet(){
	this.blood = 1;
	this.w = 80;
	this.h = 80;
	this.img = imgbullet1;
	if (plane.z == 1) {
		this.blood = 2;
		this.w = 96;
		this.h = 96;
		this.img = imgbullet2;
	};
	this.x = plane.x + plane.w*0.5 - this.w*0.5;
	this.y = plane.y - this.h;
	this.draw = function (){
		this.move();
		ctx.drawImage(this.img, 0, 0, this.w, this.h, this.x, this.y, this.w, this.h);
	};
	this.move = function (){
		this.y -= speed*3;
	};
}

//道具
function Prop(){
	var fn = fnRand(0,2);
	this.fn = fn;
	this.w = 120;
	this.h = 83;
	this.img = imgprop1;
	if (this.fn == 1) {
		this.w = 117;
		this.h = 117;
		this.img = imgprop2;
	};
	this.x = fnRand(0,canvasWidth - this.w);
	this.y = -this.h;
	this.draw = function (){
		this.move();
		ctx.drawImage(this.img, 0, 0, this.w, this.h, this.x, this.y, this.w, this.h);
	};
	this.move = function (){
		this.y += speed*0.7;
	};
}

//敌机
function Enemy(){
	var fn = fnRand(0,15);
	this.fn = fn;
	this.speed = speed*0.8;
	this.bai_spend = 0;
	
	if (this.fn < 10) {
		this.img = imgenemy1;
		this.blood = 2;
		this.w = 90;
		this.h = 87;
	}else if (this.fn >= 10 && this.fn <= 14) {
		this.speed = speed*0.5;
		this.img = imgenemy2;
		this.blood = 5;
		this.w = 110;
		this.h = 88;
	};
	this.imgenemyX = 0;
	this.imgenemyY = 0;
	this.x = fnRand(90,canvasWidth - this.w - 90);
	this.y = fnRand(-this.h - 10,-this.h);
	this.draw = function (){
		this.move();
		ctx.drawImage(this.img, this.imgenemyX, this.imgenemyY, this.w, this.h, this.x, this.y, this.w, this.h);
	};
	this.move = function (){
		if (this.blood > 0) {
			this.y += this.speed;
			this.bai_spend++;
			if (this.bai_spend >= 2) {
				this.bai_spend = 0;
				this.imgenemyX += this.w;
				if (this.imgenemyX > this.w) {
					this.imgenemyX = 0;
				};
			}	
		};
		

		if (this.blood <= 0) {
			if (this.bai_spend >= 0) {
				this.bai_spend = -1;
				if (this.fn < 10) {
					this.w = 115;
					this.h = 95;
					this.imgenemyX = 0;
					this.img = imgenemy1e;
				}else if (this.fn <= 14) {
					this.w = 126;
					this.h = 95;
					this.imgenemyX = 0;
					this.img = imgenemy2e;
				}	
			};
			
			if (this.imgenemyX < this.w*10) {
				this.imgenemyX += this.w;
			};
		};
	};
}


// 开始定时器
function start() {
	//setInterval(render, 30);
	window.requestAnimationFrame(render);
}

function render(){
	fps++;
	if (fps > 2000) {
		fps = 1;
	};
	requestAnimationFrame(render);
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	bg.draw();
	plane.draw();

	
	//子弹和敌机的判断
	for (var i = 0,len = bullets.length; i < len; i++) {
		if (bullets[i].y > 0 && plane.blood > 0) {
			for (var j = 0,lenj = enemys.length; j < lenj; j++) {
				if (enemys[j].y < canvasHeight && enemys[j].blood > 0 && crash(bullets[i],enemys[j])) {
					enemys[j].blood -= bullets[i].blood;
					if (enemys[j].blood <= 0) {
						if (grade > 500 && grade < 1000) {
							bulletspeed = 8;
							enemyspeed = 15;
							speed = 8;
						};
						if (grade > 1500 && grade < 2500) {
							bulletspeed = 8;
							enemyspeed = 10;
							speed = 12;
						};
						if (grade > 3000 && grade < 4000) {
							bulletspeed = 6;
							enemyspeed = 6;
							speed = 14;
						};
						if (grade > 5000 && grade < 6000) {
							bulletspeed = 5;
							enemyspeed = 4;
							speed = 17;
						};
						if (grade > 7000 && grade < 8000) {
							bulletspeed = 5;
							enemyspeed = 4;
							speed = 20;
						};


						// 敌人爆炸音效
						mus++;
						if (mus >= 5) {
							mus = 0;
						};
						switch (mus){
							case 0:
								$("#musice1").get(0).play();
								break;
							case 1:
								$("#musice2").get(0).play();
								break;
							case 2:
								$("#musice3").get(0).play();
								break;
							case 3:
								$("#musice4").get(0).play();
								break;
							case 4:
								$("#musice5").get(0).play();
								break;
						}
						// musice1.currentTime = 0;
						// musice1.play();

						if (enemys[j].fn < 10) {
							grade += 10;
						}else if (enemys[j].fn >= 10 && enemys[j].fn <= 14) {
							grade += 20;
						}
					};
					
					bullets.splice(i,1);
					i--;
					len--;
					break;
				};
			};	
		};
	};

	//飞机和敌机的判断
	for (var i = 0,len = enemys.length; i < len; i++) {
		if (enemys[i].y < canvasHeight && enemys[i].blood > 0 && plane.blood > 0 && crash(plane,enemys[i])) {
			enemys[i].blood = 0;
			plane.blood = 0;
		}
	};

	//飞机和道具的判断
	for (var i = 0,len = props.length; i < len; i++) {
		if (plane.blood > 0 && crash(plane,props[i])) {
			if (props[i].fn == 0) {
				plane.z = 1;
			}else if (props[i].fn == 1){
				plane.o = 1;
			}

			props.splice(i,1);
			i--;
			len--;
		}
	};

	//子弹创建
	if (fps % bulletspeed == 0 && plane.blood > 0) {
		bullets.push(new Bullet());
		for (var i = 0,len = bullets.length; i < len; i++) {
			if (bullets[i].y < 0) {
				bullets.splice(i,1);
				i--;
				len--;
			};	
		};
		// console.log(bullets.length);
	};

	for (var i = 0,len = bullets.length; i < len; i++) {
		bullets[i].draw();
	};


	//道具创建
	if (fps % 500 == 0) {
		props.push(new Prop());
		for (var i = 0,len = props.length; i < len; i++) {
			if (props[i].y > canvasHeight) {
				props.splice(i,1);
				i--;
				len--;
			};	
		};
			
	};

	for (var i = 0,len = props.length; i < len; i++) {
		props[i].draw();
	};

	if (plane.z == 1) {
		bulletfps++;
		if (bulletfps > 300) {
			plane.z = 0;
			bulletfps = 0;
		};
	};


	//敌机创建
	if (fps % enemyspeed == 0) {
		enemys.push(new Enemy());
		for (var i = 0,len = enemys.length; i < len; i++) {
			if (enemys[i].y > canvasHeight) {
				enemys.splice(i,1);
				i--;
				len--;
			};	
		};	
	};
	
	for (var i = 0,len = enemys.length; i < len; i++) {
		enemys[i].draw();
	};

	ctx.drawImage(imgfenshu_bg, 0, 0, 168, 71, canvasWidth - 188, 10, 168, 71);
	ctx.font = '32px 黑体';
	ctx.textBaseline = "top";
	ctx.fillText(grade,canvasWidth - 105,33);

	if (plane.o == 1) {
		ctx.drawImage(imgprop2, 0, 0, 117, 117, canvasWidth - 127, canvasHeight - 127, 117, 117);
	};
};//开始函数结束



// 游戏触摸移动事件
var touchX = 0;
var touchY = 0;
var x = 0;
var y = 0;
var touchendX = 0;
var touchendY = 0;
canvas.addEventListener("touchstart", function (e){
	// console.log(e.touches[0]);
	touchX = e.touches[0].pageX - plane.x;
	touchY = e.touches[0].pageY - plane.y;
	touchendX = e.touches[0].pageX;
	touchendY = e.touches[0].pageY;
},false);

canvas.addEventListener("touchmove", function (e){
	x = e.touches[0].pageX - touchX;
	y = e.touches[0].pageY - touchY;
	plane.x = x;
	plane.y = y;
	e.preventDefault();
},false);


canvas.addEventListener("touchend", function (e){
	if (plane.o == 1 && touchendX > (canvasWidth - 127) && touchendX < (canvasWidth - 10) && touchendY > (canvasHeight - 127) && touchendY < (canvasHeight - 10)) {

		musicbomb.currentTime = 0;
		musicbomb.play();

		for (var i = 0,len = enemys.length; i < len; i++) {
			if (enemys[i].blood != 0) {

				enemys[i].blood = 0;

				if (enemys[i].fn < 10) {
					grade += 10;
				}else if (enemys[i].fn >= 10 && enemys[i].fn <= 14) {
					grade += 20;
				}
				
			};
		};
		plane.o = 0;	
	};
},false);



// 键盘操作事件
document.addEventListener("keydown", function (e){

	switch(e.keyCode){
		case 37:
				plane.right = false;
				plane.left = true;
			break;
		case 38:
				plane.bottom = false;
				plane.top = true;
			break;
		case 39:
				plane.left = false;
				plane.right = true;
			break;
		case 40:
				plane.top = false;
				plane.bottom = true;
			break;
	}

	if (plane.o == 1 && e.keyCode == 32) {

		musicbomb.currentTime = 0;
		musicbomb.play();

		for (var i = 0,len = enemys.length; i < len; i++) {
			if (enemys[i].blood != 0) {

				enemys[i].blood = 0;

				if (enemys[i].fn < 10) {
					grade += 10;
				}else if (enemys[i].fn >= 10 && enemys[i].fn <= 14) {
					grade += 20;
				}	

			};
		};
		plane.o = 0;
	};

}, false);







// 首页按钮动画结束事件
    $(".shouye_kaishi").get(0).addEventListener('webkitAnimationEnd',function (){
        $(".shouye_guaiwu").css("-webkit-transform","rotate(30deg) translateY(0%)");
    }, false);


var kais = true;
// 开始游戏点击事件
$(".shouye_kaishi").get(0).addEventListener("click", function (e){
	console.log(23123);
	musicbg.play();
	$(".shouye").hide();
	$(".guize").show();
	setTimeout(function(){
		if (kais) {
			kais = false;
		    $(".guize").hide();
		    $(".logo").hide();
			$("#canvas1").show();
		    start();	
		};
    },8000);
	
});

// 规则页点击事件
$(".guize").get(0).addEventListener("touchstart", function (e){
	if (kais) {
		$('.duishou_fenshu').show();
		kais = false;
	    $(".guize").hide();
	    $(".logo").hide();
		$("#canvas1").show();
	    start();	
	};
});



// 重新开始点击事件
$(".anniu_zailaiyici1").get(0).addEventListener("touchstart", function (){
	zailai();
},false);
$(".anniu_zailaiyici2").get(0).addEventListener("touchstart", function (){
	zailai();
},false);
$(".anniu_zailaiyici3").get(0).addEventListener("touchstart", function (){
	zailai();
},false);
$(".anniu_bufu").get(0).addEventListener("touchstart", function (){
	zailai();
},false);


// 打开排行榜点击事件
$(".shouye_paihangbang").get(0).addEventListener("touchstart", function (){
	getBoard()
},false);
$(".anniu_paihangbang1").get(0).addEventListener("touchstart", function (){
	getBoard()
},false);
$(".anniu_paihangbang2").get(0).addEventListener("touchstart", function (){
	getBoard()
},false);
$(".anniu_paihangbang3").get(0).addEventListener("touchstart", function (){
	getBoard()
},false);
$(".anniu_paihangbang4").get(0).addEventListener("touchstart", function (){
	getBoard()
},false);


// 打开奖品页点击事件
$(".shouye_jiangpin").get(0).addEventListener("touchstart", function (){
	$(".tan_jiangpin").fadeIn();
},false);

var shareFloor=1;
// 与朋友PK点击事件
$(".anniu_pk1").get(0).addEventListener("click", function (){
	shareFloor=1;
	$("#over").hide();
	$(".game1").hide();
	$(".game2").hide();
	$(".game3").hide();
	$(".game4").hide();
	$(".guanzhu").show();
},false);
$(".anniu_pk2").get(0).addEventListener("click", function (){
	shareFloor=2;
	$("#over").hide();
	$(".game1").hide();
	$(".game2").hide();
	$(".game3").hide();
	$(".game4").hide();
	$(".guanzhu").show();
},false);

$(".guanzhu").click(function(){
	$(this).hide();
	if(shareFloor==1){
		$('.game1').show();
	}else{
		$('.game2').show();
	}
	$("#over").show();
});

// 发起PK点击事件
$(".anniu_pk3").on('click',function (){
	window.location.href="index.php";
})


// 奖品页面关闭事件
$(".jiangpin_guanbi").get(0).addEventListener("touchstart", function (){
	$(".tan_jiangpin").hide();
},false);


// 排行榜页面关闭事件
$(".paihangbang_guanbi").get(0).addEventListener("touchstart", function (){
	$(".tan_paihangbang").hide();
},false);


// 注册跳转
$(".anniu_zhuce").on('click',function (){
	window.location.href="https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx1da4cc96f128c9d7&redirect_uri=http://lesso.yangyue.com.cn/activity/register/oauth.php&response_type=code&scope=snsapi_base&state=123#wechat_redirect";
})






function zailai(){
	if (plane.blood <= 0) {

		musicbomb.currentTime = 0;
		musicbomb.play();

		over.style.display = "none";
		$(".game1").hide();
		$(".game2").hide();
		$(".game3").hide();
		$(".game4").hide();

		for (var i = 0,len = enemys.length; i < len; i++) {
			if (enemys[i].blood != 0) {
				enemys[i].blood = 0;
			};
		};

		plane.blood = 1;
		plane.z = 0;
		plane.o = 0;
		plane.img = imgplane;
		plane.x = canvasWidth*0.5-50;
		plane.y = canvasHeight*0.7;
		grade = 0;	

		bulletspeed = 10;
		speed = 5;
		enemyspeed = 20;

		// musicbullet.play();

	};
}





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

// 删除排行榜前三名的数字
function delBoardThree(){
	var pais = $(".paihangbang_paiming>div").length;
	switch (pais){
	case 0:
		break;
	case 1:
		$(".paihangbang_paiming_xinxi:nth-child(1)>.paihangbang_paiming_jiangpai").text("");
		break;
	case 2:
		$(".paihangbang_paiming_xinxi:nth-child(1)>.paihangbang_paiming_jiangpai").text("");
		$(".paihangbang_paiming_xinxi:nth-child(2)>.paihangbang_paiming_jiangpai").text("");
		break;
	case 3:
		$(".paihangbang_paiming_xinxi:nth-child(1)>.paihangbang_paiming_jiangpai").text("");
		$(".paihangbang_paiming_xinxi:nth-child(2)>.paihangbang_paiming_jiangpai").text("");
		$(".paihangbang_paiming_xinxi:nth-child(3)>.paihangbang_paiming_jiangpai").text("");
		break;
	default:
		$(".paihangbang_paiming_xinxi:nth-child(1)>.paihangbang_paiming_jiangpai").text("");
		$(".paihangbang_paiming_xinxi:nth-child(2)>.paihangbang_paiming_jiangpai").text("");
		$(".paihangbang_paiming_xinxi:nth-child(3)>.paihangbang_paiming_jiangpai").text("");
	}
}

function endGame(grade){
	$('.meng00').show();
	$('.nowScore').text(grade);
	$.ajax({
		type: "post",
		timeout:10000,//设置超时时间为5秒
        url: "phphandle/score.php",
        data: {newScore:grade},
        dataType: "json",
        cache:false,
        success:function(data){
        	$('.meng00').hide();
        	if(data.res=='s'){
        		if(isChallenge){
        			if(grade>friendScore){
        				$('.game3').show();
        				resBoard=3;
						shareTitle="闭着眼睛也能赢"+friendNickName+"，太容易啦，看我轻松拿下榜首大奖！";
        				shareDesc="别膜拜我，我只是个传说";
        				share();
        			}else{
        				$('.game4').show();
        				resBoard=4;
        				shareTitle="要不是我顾及"+friendNickName+"的感受，才不会输给TA呢！放开奖品，我再试一次！";
        				shareDesc="我努力一下，榜首一定是我的，奖品也是我的！";
        				share();
        			}
        		}else{
        			if(grade>bestScore){
        				bestScore=grade;
        				$('.game1').show();
        				resBoard=1;
        			}else{
        				$('.game2').show();
        				resBoard=2;
        			}
        			shareTitle="我在咕叽飞机大战获得"+grade+"分，敢跟我PK吗？挑战榜首赢大礼就现在！";
        			shareDesc="赢了我就是人生赢家！";
        			shareLink="https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx1da4cc96f128c9d7&redirect_uri=http://lesso.yangyue.com.cn/activity/merrygame/oauth1.php&response_type=code&scope=snsapi_userinfo&state="+data.id+"#wechat_redirect";
        			share();
        		}
        		$('#over').show();
        	}
        },
        error:function(x,status){
        	$('.meng00').hide();
        	if(status=='timeout'){
        		alert("哎呀，您的网络好像有问题，点击确定再试试");
        		endGame(grade);
        		return false;
        	}
        }
	});
}

function getBoard(){
	$('.meng00').show();
	$.ajax({
		type: "post",
		timeout:10000,//设置超时时间为5秒
        url: "phphandle/score.php",
        data: {getBoard:1},
        dataType: "json",
        cache:false,
        success:function(data){
        	$('.meng00').hide();
        	$('#board').empty();
        	if(data.length>0){
        		var board="";
        		for(var i=0;i<data.length;i++){
        			if(data[i].headimgurl==''){
        				data[i].headimgurl="./img/anniu_guanbi.png";
        			}
        			board+='<div class="paihangbang_paiming_xinxi">'+
								'<div class="paihangbang_paiming_jiangpai">'+
									(i+1)+
								'</div>'+
								'<div class="paihangbang_paiming_touxiang">'+
									'<img src="'+data[i].headimgurl+'" alt="">'+
								'</div>'+
								'<div class="paihangbang_paiming_mingzi">'+
									'<span class="paihangbang_paiming_mingzi_left">'+
										data[i].nickName+
									'</span>'+
									'<span class="paihangbang_paiming_mingzi_right">'+
										data[i].score+
									'分</span>'+
								'</div>'+
								'<div class="paihangbang_paiming_lihe"></div>'+
							'</div>';
        		}
        		$('#board').append(board);
        		$(".tan_paihangbang").fadeIn();
        		delBoardThree();
        	}
        },
        error:function(x,status){
        	$('.meng00').hide();
        	if(status=='timeout'){
        		alert("哎呀，您的网络好像有问题，重新再试试吧！");
        		endGame(grade);
        		return false;
        	}
        }

	});
}









// alert(123);