/*
 * 注意：
 * 1. 所有的JS接口只能在公众号绑定的域名下调用，公众号开发者需要先登录微信公众平台进入“公众号设置”的“功能设置”里填写“JS接口安全域名”。
 * 2. 如果发现在 Android 不能分享自定义内容，请到官网下载最新的包覆盖安装，Android 自定义分享接口需升级至 6.0.2.58 版本及以上。
 * 3. 常见问题及完整 JS-SDK 文档地址：http://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html
 *
 * 开发中遇到问题详见文档“附录5-常见错误及解决办法”解决，如仍未能解决可通过以下渠道反馈：
 * 邮箱地址：weixin-open@qq.com
 * 邮件主题：【微信JS-SDK反馈】具体问题
 * 邮件内容说明：用简明的语言描述问题所在，并交代清楚遇到该问题的场景，可附上截屏图片，微信团队会尽快处理你的反馈。
 */

//定义分享的文案,链接及图片
var shareTitle = "咕叽版飞机大战，挑战高分赢取大礼，还可以和朋友一比高下！";
var shareDesc = "咕叽版飞机大战，挑战高分榜首赢取圣诞大礼，还可以和朋友PK一比高下！";
var shareLink = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx1da4cc96f128c9d7&redirect_uri=http://lesso.yangyue.com.cn/activity/merrygame/oauth1.php&response_type=code&scope=snsapi_userinfo&state=0#wechat_redirect";
var shareimg = "http://lesso.yangyue.com.cn/activity/merrygame/img/shareimg.jpg";
wx.config({
    //debug: true,
    appId: 'wx1da4cc96f128c9d7',
    timestamp: 1455509993,
    nonceStr: '0WKnlxr8ecxaLpYo',
    signature: '1b6a4e22fc90977564b28b5da218cdf282b812ec',
    jsApiList: [
        // 所有要调用的 API 都要加到这个列表中
        'checkJsApi',
        'onMenuShareTimeline',
        'onMenuShareAppMessage',
        'onMenuShareQQ',
        'onMenuShareWeibo',
        'hideMenuItems',
        'showMenuItems',
        'hideAllNonBaseMenuItem',
        'showAllNonBaseMenuItem',
        'translateVoice',
        'startRecord',
        'stopRecord',
        'onRecordEnd',
        'playVoice',
        'pauseVoice',
        'stopVoice',
        'uploadVoice',
        'downloadVoice',
        'chooseImage',
        'previewImage',
        'uploadImage',
        'downloadImage',
        'getNetworkType',
        'openLocation',
        'getLocation',
        'hideOptionMenu',
        'showOptionMenu',
        'closeWindow',
        'scanQRCode',
        'chooseWXPay',
        'openProductSpecificView',
        'addCard',
        'chooseCard',
        'openCard'
    ]
});
wx.ready(function () {
    // 在这里调用 API
    // 2. 分享接口
    // 2.1 监听“分享给朋友”，按钮点击、自定义分享内容及分享结果接口
    //document.querySelector('#onMenuShareAppMessage').onclick = function () {
    share();
});


function share() {
    wx.onMenuShareAppMessage({
        title: shareTitle,
        desc: shareDesc,
        link: shareLink,
        imgUrl: shareimg,
        trigger: function (res) {
            // alert('用户点击发送给朋友');
        },
        success: function (res) {
            if (isPlay) {
                $('.guanzhu').hide();
                $('.game' + resBoard).show();
                $('#over').show();
            }
            $.ajax({
                url: "phphandle/score.php",
                data: {share: 1},
                type: "post"
            })
        },

        fail: function (res) {
            //alert(JSON.stringify(res));
        }
    });
    //alert('已注册获取“发送给朋友”状态事件');
    //};

    //分享到朋友圈
    wx.onMenuShareTimeline({
        title: shareTitle,
        link: shareLink,
        imgUrl: shareimg,
        trigger: function (res) {

        },
        success: function (res) {
            if (isPlay) {
                $('.guanzhu').hide();
                $('.game' + resBoard).show();
                $('#over').show();
            }
            $.ajax({
                url: "phphandle/score.php",
                data: {share: 1},
                type: "post"
            })
        },

        fail: function (res) {
            //alert(JSON.stringify(res));
        }

    });
}