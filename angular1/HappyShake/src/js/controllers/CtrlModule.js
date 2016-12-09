/**
 * Created by Administrator on 16-8-5.
 */
angular.module("CtrlModule",[])
//该过滤器作用是信任某些自己重新生成的标签，不进行该操作时发送的标签只能生成字符串，不能转译成标签
.filter("html",function($sce){
    return function(x){
        return $sce.trustAsHtml(x);
    }
})
.directive("splash",function(){//开场动画左右滑动
    return {
        templateUrl:"./src/templates/swiper.html",
        link:function(){
            new Swiper(".swiper-container",{
               direction:"horizontal"
            })
        }
    }
})
.directive("banner",function(){//商品主页广告图左右滑动
    return {
        templateUrl:"./src/templates/banner.html",
        controller:function($scope){
            $scope.update=function(){
                $scope.swiper.update();
            }
        },
        link:function(scope){
            scope.swiper=new Swiper(".swiper-container",{
                pagination: '.swiper-pagination',
                paginationClickable: true,
                spaceBetween: 0,
                centeredSlides: true,
                autoplay: 1500,
                autoplayDisableOnInteraction: false
            });
        }
    }
})
.directive("detailbanner",function(){//商品详情页广告图左右滑动
    return {
        controller:function($scope){
            $scope.update=function(){
                $scope.swiper.update();
            }
        },
        link:function(scope){
            scope.swiper=new Swiper(".swiper-container",{
                pagination: '.swiper-pagination',
                paginationClickable: true,
                centeredSlides: true
            });
        }
    }
})
.directive("iscroll",function(){//商品主页商品列表上下滑动
    return {
        link:function(scope){
            if(scope.myIscroll){
                scope.myIscroll.refresh();
            }else{
                scope.myIscroll  = new IScroll("#wrapper",{
                    click:true  //使用iscroll后点击事件被禁用，需要开启
                });
            }
        }
    }
})
.directive("iconswiper",function(){//分类iconfont左右滑动
    return {
        controller:function($scope){
            $scope.update=function(){
                $scope.swiper.update();
            }
        },
        link:function(scope){
            scope.swiper=new Swiper(".swiper-container",{
                slidesPerView: "auto"
            });
        }
    }
})
.controller("homeCtrl",function($scope,$http,$location,$rootScope){
    $scope.headerName="商品首页";
    $rootScope.idisplay=false;
    $rootScope.emdisplay=false;
    $scope.refresh=function(){
        $scope.myIscroll.refresh();
    };
    $scope.getGoods=function(){
        $http.jsonp("http://datainfo.duapp.com/shopdata/getGoods.php?callback=JSON_CALLBACK").success(function(data){
            $scope.goods=data;
        })
    };
    $scope.getGoods();
    $scope.getBanners=function(){
        $http.jsonp("http://datainfo.duapp.com/shopdata/getBanner.php?callback=JSON_CALLBACK").success(function(data){
            $scope.banners=data.map(function(obj){
                return JSON.parse(obj.goodsBenUrl)[0]
            })
        })
    };
    $scope.getBanners();
    $scope.homeSearch=function(){
        $http.jsonp("http://datainfo.duapp.com/shopdata/selectGoodes.php?callback=JSON_CALLBACK",{
            params:{
                selectText:encodeURI($scope.searchkey)
            }
        }).success(function(data){
            if(data=="0"){
                $location.path("/search");
            }else{
                $scope.goods=data;
            }
        })
    };
    $scope.godetail=function(goodsid){//点击商品名称或图片地址栏传参
        $location.path("/detail/"+goodsid+"");
    };
    $scope.addCart=function(goodsid){//增加商品至购物车
        $http.jsonp("http://datainfo.duapp.com/shopdata/getCar.php?callback=JSON_CALLBACK",{
            params:{
                userID:$scope.loginUserID=localStorage.getItem("username",$scope.loginUserID)
            }
        }).success(function(data){
            if(data=="0"){
                $http.get("http://datainfo.duapp.com/shopdata/updatecar.php",{
                    params:{
                        userID:$scope.loginUserID=localStorage.getItem("username",$scope.loginUserID),
                        goodsID:goodsid,
                        number:1
                    }
                }).success(function(data){
                    if(data=="1"){
                        alert("成功加入购物车！");
                    }else{
                        alert("网络繁忙，请稍后再试！");
                    }
                });
            }else{
                /*假如点击前已经存储四个商品,当点击的商品为四个其中之一,则相同匹配发生一次，不同匹配发生三次，设置初始值为true，若为false说明有相同匹配,本次遍历至结束,此时取后台已有的number进行迭加,若为true说明没有匹配,则完成遍历后在外层赋值number为1*/
                var flag=true;
                for(var n in data) {//遍历后台所有存储的商品
                    //若为真说明点击之前已存在该商品,此时取后台已有的number进行迭加,再将number发送出去
                    if (goodsid == data[n].goodsID) {
                        var number = ++data[n].number;
                        flag=false;
                        $http.get("http://datainfo.duapp.com/shopdata/updatecar.php", {
                            params: {
                                userID: $scope.loginUserID=localStorage.getItem("username",$scope.loginUserID),
                                goodsID: goodsid,
                                number: number
                            }
                        }).success(function (data) {
                            if (data == "1") {
                                alert("成功加入购物车！");
                            } else {
                                alert("网络繁忙，请稍后再试！");
                            }
                        });
                    }
                }
                if(flag){//若为假说明点击前没有该商品，直接赋值number为1,再将number发送出去
                    //注意该判断不可在遍历循环中进行
                    $http.get("http://datainfo.duapp.com/shopdata/updatecar.php",{
                        params:{
                            userID:$scope.loginUserID=localStorage.getItem("username",$scope.loginUserID),
                            goodsID:goodsid,
                            number:1
                        }
                    }).success(function(data){
                        if(data=="1"){
                            alert("成功加入购物车！");
                        }else{
                            alert("网络繁忙，请稍后再试！");
                        }
                    });
                }
            }
        })
    }
})
.controller("searchCtrl",function($scope,$http,$location,$rootScope){
    $scope.headerName="商品首页";
    $rootScope.emdisplay=false;
    $scope.searchkinds=[
        { text:"印花短裙" },
        { text:"高腰短裤" },
        { text:"女装" },
        { text:"爱马仕" },
        { text:"优衣库" },
        { text:"天美意" },
        { text:"芬狄诗" },
        { text:"玛丽古椅" }
    ]
})
.controller("listCtrl",function($scope,$http,$location,$rootScope){
    $scope.headerName="新品上市";
    $scope.headerUrl="./src/images/headercart.png";
    $rootScope.emdisplay=true;
    $scope.godoing=function(){//前往购物车
        $location.path("/shoppingCart");
    };
    $scope.refresh=function(){
        $scope.myIscroll.refresh();
    };
    $scope.godetail=function(goodsid){//点击商品名称或图片地址栏传参
        $location.path("/detail/"+goodsid+"");
    };
    $scope.getListGoods=function(){//设置初始时为衬衫类商品展示
        $http.jsonp("http://datainfo.duapp.com/shopdata/getGoods.php?callback=JSON_CALLBACK",{
            params:{
                classID:1 //listicon.classID=1时为衬衫类商品展示
            }
        }).success(function(data){
            $scope.listgoods=data;
        })
    };
     $scope.getListGoods();
    //currentIndex点击鼠标时的当前下标,目的是与list.html中点击时的下标匹配，当一致时ng-if为真显示小三角图标
    $scope.currentIndex=0;//默认初始下标为0；
    // 点击a链接icon、分类发生变化，classidd的值为listicon.classID
    $scope.changeicon = function(index,classid){
        $scope.currentIndex=index;
        $scope.sendback=function(){
            $http.jsonp("http://datainfo.duapp.com/shopdata/getGoods.php?callback=JSON_CALLBACK",{
                params:{
                    classID:classid
                }
            }).success(function(data){
                $scope.listgoods=data;
            })
        };
        $scope.sendback();
    };
    $scope.getListIcons=function(){//商品分类iconfont接口
        $http.get("http://datainfo.duapp.com/shopdata/getclass.php").success(function(data){
            $scope.listicons=data;
        })
    };
    $scope.getListIcons();
    /*$scope.listicons=[//矢量图标路由配置
        {
            //className:"iconfont icon-piyi", text:"皮衣"
            icon:"&#xe68a;"
        },
        {
            //className:"iconfont icon-waitao", text:"外套"
            icon:"&#xe664;"
        },
        {
            //className:"iconfont icon-nvtong", text:"女童"
            icon:"&#xe67d;"
        },
        {
            //className:"iconfont icon-nvshangyi", text:"女上衣"
            icon:"&#xe685;"
        },
        {
            //className:"iconfont icon-nanshangyi", text:"男上衣"
            icon:"&#xe680;"
        },
        {
            //className:"iconfont icon-chenshanzhuanhuan", text:"衬衫装"
            icon:"&#xe684;"
        },
        {
            //className:"iconfont icon-jiakezhuanhuan", text:"夹克装"
            icon:"&#xe682;"
        },
        {
            //className:"iconfont icon-doupengzhuanhuan", text:"斗篷装"
            icon:"&#xe670;"
        },
        {
            //className:"iconfont icon-weiyizhuanhuan", text:"卫衣"
            icon:"&#xe66f;"
        },
        {
            //className:"iconfont icon-xizhuangzhuanhuan", text:"西装"
            icon:"&#xe678;"
        },
        {
            //className:"iconfont icon-txuzhuanhuan", text:"徒步"
            icon:"&#xe677;"
        },
        {
            //className:"iconfont icon-lifuzhuanhuan", text:"礼服"
            icon:"&#xe676;"
        },
        {
            //className:"iconfont icon-maoyizhuanhuan", text:"毛衣"
            icon:"&#xe672;"
        },
        {
            icon:"&#xe66e;"
        },
        {
            icon:"&#xe66b;"
        },
        {
            icon:"&#xe675;"
        }
    ];*/
})
.controller("shoppingCartCtrl",function($scope,$http,$location,$rootScope) {
    $scope.headerName = "购物车";
    $scope.headerUrl="./src/images/headerjiesuan.png";
    $rootScope.idisplay=false;
    $rootScope.emdisplay = true;
    $scope.refresh=function(){
        $scope.myIscroll.refresh();
    };
    $scope.goadd=function(addPro,items,itemNumber,index){//点击+增加商品
        var addnum=++items[index].number;
        $http.get("http://datainfo.duapp.com/shopdata/updatecar.php",{
            params:{
                userID:$scope.loginUserID=localStorage.getItem("username",$scope.loginUserID),
                goodsID:addPro,
                number:addnum
            }
        }).success(function(){
            var goodsum= 0,pricesum=0;
            for(var i in items){
                goodsum+=parseInt(items[i].number);//获取每个对象中的数量
                pricesum+=parseInt((items[i].number)*(items[i].discount=="0"?items[i].price*1:(items[i].price*items[i].discount/10).toFixed(0)));//获取每个对象中的单价
            }
            $scope.goodCount=goodsum;
            $scope.priceCount=pricesum;
        });
    };
    $scope.goreduce=function(reducePro,items,itemNumber,index){//点击-减少商品
        if(items[index].number==1){//若当前商品数量为1时禁止单击事件
            return false;
        }else {//否则进行减少商品操作
            var reducenum = --items[index].number;
            $http.get("http://datainfo.duapp.com/shopdata/updatecar.php", {
                params: {
                    userID: $scope.loginUserID=localStorage.getItem("username",$scope.loginUserID),
                    goodsID: reducePro,
                    number: reducenum
                }
            }).success(function () {
                var goodsum = 0, pricesum = 0;
                for (var i in items) {
                        goodsum += parseInt(items[i].number);//获取每个对象中的数量
                        pricesum += parseInt((items[i].number) * (items[i].discount == "0" ? items[i].price * 1 : (items[i].price * items[i].discount / 10).toFixed(0)));//获取每个对象中的单价
                }
                $scope.goodCount = goodsum;
                $scope.priceCount = pricesum;
            });
        }
    };
    $scope.jumpnumber=function(jumpPro,items,itemNumber,index){
        if(itemNumber==""){//当输入框为空时强制输入框商品数量为1
            $http.get("http://datainfo.duapp.com/shopdata/updatecar.php", {
                params: {
                    userID: $scope.loginUserID=localStorage.getItem("username",$scope.loginUserID),
                    goodsID: jumpPro,
                    number: 1
                }
            }).success(function () {
                items[index].number=1;//当输入框为空时强制当前输入框商品数量为1
                var goodsum = 0, pricesum = 0;
                for (var i in items) {
                    goodsum += parseInt(items[i].number);//获取每个对象中的数量
                    pricesum += parseInt((items[i].number) * (items[i].discount == "0" ? items[i].price * 1 : (items[i].price * items[i].discount / 10).toFixed(0)));//获取每个对象中的单价
                }
                $scope.goodCount = goodsum;
                $scope.priceCount = pricesum;
            });
        }else{
            $http.get("http://datainfo.duapp.com/shopdata/updatecar.php", {
                params: {
                    userID: $scope.loginUserID=localStorage.getItem("username",$scope.loginUserID),
                    goodsID: jumpPro,
                    number: itemNumber
                }
            }).success(function () {
                var goodsum = 0, pricesum = 0;
                for (var i in items) {
                    goodsum += parseInt(items[i].number);//获取每个对象中的数量
                    pricesum += parseInt((items[i].number) * (items[i].discount == "0" ? items[i].price * 1 : (items[i].price * items[i].discount / 10).toFixed(0)));//获取每个对象中的单价
                }
                $scope.goodCount = goodsum;
                $scope.priceCount = pricesum;
            });
        }
    };
    $scope.sendCart=function(){
        $http.jsonp("http://datainfo.duapp.com/shopdata/getCar.php?callback=JSON_CALLBACK",{
            params:{
                userID:$scope.loginUserID=localStorage.getItem("username",$scope.loginUserID)
            }
        }).success(function(data){
            $scope.cartdetail=data;
            var goodsum= 0,pricesum=0;
            for(var i in data){
                goodsum+=parseInt(data[i].number);//获取每个对象中的数量
                pricesum+=parseInt((data[i].number)*(data[i].discount=="0"?data[i].price*1:(data[i].price*data[i].discount/10).toFixed(0)));//获取每个对象中的单价
            }
            $scope.goodCount=goodsum;
            $scope.priceCount=pricesum;
        })
    };
    $scope.sendCart();
    $scope.delGood=function(deletePro,items,index){//购物车删除商品
        //该代码作用是在后台上删除点击选中的商品
        $http.get("http://datainfo.duapp.com/shopdata/updatecar.php",{
            params:{
                userID: $scope.loginUserID=localStorage.getItem("username",$scope.loginUserID),
                goodsID:deletePro,
                number:0
            }
        }).success(function(data){
            if(data=="1"){
                $scope.items=data;
            }else{
                alert("网络繁忙，请稍后再试！");
            }
        });
        items.splice(index,1);//该代码作用是在页面上删除点击选中的商品
        $scope.goodCount=0;
        $scope.priceCount=0;
        for(var i in items){
            $scope.goodCount+=parseInt(items[i].number);
            $scope.priceCount+=parseInt((items[i].number)*(items[i].discount=="0"?items[i].price*1:(items[i].price*items[i].discount/10).toFixed(0)));
        }
    };
})
.controller("detailCtrl",function($scope,$http,$location,$rootScope) {
    $scope.headerName = "商品资料";
    $rootScope.idisplay=true;
    $rootScope.emdisplay = true;
    $scope.headerUrl="./src/images/headercart.png";
    $scope.gopage=function(){//返回上一页
        history.go(-1);
    };
    $scope.godoing=function(){//前往购物车
        $location.path("/shoppingCart");
    };
    $scope.godetailexplain=function(goodsid){//点击商品名称或图片地址栏传参
        $location.path("/detailexplain/"+goodsid+"");
    };
    var goodid=$location.$$path.replace("/detail/","");//获取商品详情
    $http.jsonp("http://datainfo.duapp.com/shopdata/getGoods.php?callback=JSON_CALLBACK",{
        params:{
            goodsID:goodid
        }
    }).success(function(data){
        $scope.goods=data[0];
        //$scope.goods.imgsUrl是字符串格式，需转化为数组
        $scope.banners=JSON.parse($scope.goods.imgsUrl);
    });
    $scope.addCart=function(goodsid){//增加商品至购物车
        $http.jsonp("http://datainfo.duapp.com/shopdata/getCar.php?callback=JSON_CALLBACK",{
            params:{
                userID:$scope.loginUserID=localStorage.getItem("username",$scope.loginUserID)
            }
        }).success(function(data){
            if(data=="0"){
                $http.get("http://datainfo.duapp.com/shopdata/updatecar.php",{
                    params:{
                        userID:$scope.loginUserID=localStorage.getItem("username",$scope.loginUserID),
                        goodsID:goodsid,
                        number:1
                    }
                }).success(function(data){
                    if(data=="1"){
                        alert("成功加入购物车！");
                    }else{
                        alert("网络繁忙，请稍后再试！");
                    }
                });
            }else{
                /*假如点击前已经存储四个商品,当点击的商品为四个其中之一,则相同匹配发生一次，不同匹配发生三次，设置初始值为true，若为false说明有相同匹配,本次遍历至结束,此时取后台已有的number进行迭加,若为true说明没有匹配,则完成遍历后在外层赋值number为1*/
                var flag=true;
                for(var n in data) {//遍历后台所有存储的商品
                    //若为真说明点击之前已存在该商品,此时取后台已有的number进行迭加,再将number发送出去
                    if (goodsid == data[n].goodsID) {
                        var number = ++data[n].number;
                        flag=false;
                        $http.get("http://datainfo.duapp.com/shopdata/updatecar.php", {
                            params: {
                                userID: $scope.loginUserID=localStorage.getItem("username",$scope.loginUserID),
                                goodsID: goodsid,
                                number: number
                            }
                        }).success(function (data) {
                            if (data == "1") {
                                alert("成功加入购物车！");
                            } else {
                                alert("网络繁忙，请稍后再试！");
                            }
                        });
                    }
                }
                if(flag){//若为假说明点击前没有该商品，直接赋值number为1,再将number发送出去
                    //注意该判断不可在遍历循环中进行
                    $http.get("http://datainfo.duapp.com/shopdata/updatecar.php",{
                        params:{
                            userID:$scope.loginUserID=localStorage.getItem("username",$scope.loginUserID),
                            goodsID:goodsid,
                            number:1
                        }
                    }).success(function(data){
                        if(data=="1"){
                            alert("成功加入购物车！");
                        }else{
                            alert("网络繁忙，请稍后再试！");
                        }
                    });
                }
            }
        })
    }
})
.controller("detailexplainCtrl",function($scope,$http,$location,$rootScope) {
    $scope.headerName = "商品资料";
    $rootScope.idisplay=true;
    $rootScope.emdisplay = true;
    $scope.headerUrl="./src/images/headercart.png";
    $scope.gopage=function(){//返回上一页
        history.go(-1);
    };
    $scope.godoing=function(){//前往购物车
        $location.path("/shoppingCart");
    };
    var goodid=$location.$$path.replace("/detailexplain/","");//获取商品详情
    $http.jsonp("http://datainfo.duapp.com/shopdata/getGoods.php?callback=JSON_CALLBACK",{
        params:{
            goodsID:goodid
        }
    }).success(function(data){
        $scope.goods=data[0];
        $scope.arr=data[0].detail.split("。");//$scope.goods.imgsUrl是字符串格式,需转化为数组
    });
})
.controller("myShowCtrl",function($scope,$http,$location,$rootScope) {
    $scope.headerName = "我的秀";
    $scope.headerUrl="./src/images/headerchongzhi.png";
    $rootScope.emdisplay = true;
    $scope.showname=localStorage.getItem("username",$scope.loginUserID);
    $scope.changePic=function(){
        $scope.pictureHide=1;
    };
    $scope.app = {
        initialize: function() {
            this.bindEvents();
        },
        bindEvents: function() {
            document.addEventListener('deviceready', this.onDeviceReady, false);
        },
        onDeviceReady: function() {
            $scope.getphone=function () {// 调用照相机
                $scope.pictureHide=0;
                navigator.camera.getPicture(function (img) {
                    // 拍照成功后执行此方法，将所拍的照片的地址设为 divPhoto 的背景。
                    // img可能是照片的base64格式，也可能是照片的文件地址，具体是什么取决于 destinationType 的值
                    document.getElementById('takephoneimg').style.backgroundImage = 'url(' + img + ')';
                }, function (err) {// 拍照失败后执行此方法
                    alert('发生错误了。' + err);
                }, {
                    quality: 50, // 设置照片的质量，取值花园为 0 -- 100，值越大表示照片质量越高。某些版本的 BlackBerry、Palm 不支持此参数，在iPhone设备上此值不要大于50（有可能会发生内存错误）
                    destinationType: 1 // 设置拍照成功后返回的数据的类型。如果为0（默认值），则返回的是照片的base64格式，如果是1，则返回的是照片的文件地址
                });
            };
            $scope.getpicture=function () {// 从设备中获取图片
                $scope.pictureHide=0;
                navigator.camera.getPicture(function (img) {
                    // 选择照片成功后执行此方法。
                    // 由于 getPicture 的第三个参数中 destinationType 的值为 0，因此这里返回的 img 是所选择照片的base64编码。
                    document.getElementById('takephoneimg').style.backgroundImage = 'url(data:image/jpeg;base64,' + img + ')';
                }, function (err) {
                    // 选择照片失败（包括取消选择）后执行此方法
                    alert('发生错误了。' + err);
                }, {
                    quality: 50,
                    destinationType: 0,
                    sourceType: 0 // 如果此值设为0或2，表示从照片库或文件系统中选择图片，如果是1（默认），表示从相机中选择照片
                });
            };
        }
    };
    $scope.app.initialize();
    $scope.closePic=function(){
        $scope.pictureHide=0;
    };
    $scope.shows=[
        { text:"我的订单" },
        { text:"我的优惠券" },
        { text:"浏览记录" },
        { text:"我的收藏" }
    ]
})
.controller("moreCtrl",function($scope,$http,$location,$rootScope) {
    $scope.headerName = "更多";
    $rootScope.emdisplay = true;
})
.controller("footerCtrl",function($scope,$location){
    $scope.homes=[
        {
            text:"首页",
            href:"#/home",
            backgroundurl:"./src/images/homeindexpage.png"
        },
        {
            text : "分类",
            href:"#/list",
            backgroundurl:"./src/images/homekinds.png"
        },
        {
            text : "购物车",
            href:"#/shoppingCart",
            backgroundurl:"./src/images/homeshopcar.png"
        },
        {
            text : "我的秀",
            href:"#/myShow",
            backgroundurl:"./src/images/homemgshow.png"
        },
        {
            text : "更多",
            href:"#/more",
            backgroundurl:"./src/images/homemore.png"
        }
    ];
    /*  $location==>$$protocol: "http", $$host: "localhost", $$port: 63342, $$path: "/home",
        $location.$$path==>/home
        $location.$$path.replace("/","")==>home
    */
    //currentIndex点击鼠标时的当前下标,下面的操作是三目运算判断点击的下标是哪一个
    $scope.currentIndex = $location.$$path.replace("/","")=="home"?0:$location.$$path.replace("/","")=="list"?1:$location.$$path.replace("/","")=="shoppingCart"?2:$location.$$path.replace("/","")=="myShow"?3:$location.$$path.replace("/","")=="more"?4:0;
    $scope.updateShowHide = function(index,path){
        $location.path(path.replace("#",""))
    }
})
.controller("loginCtrl",function($scope,$location,$http,$rootScope){
    $scope.headerName="开心摇摇用户登录";
    $rootScope.idisplay=false;
    $rootScope.emdisplay=false;
    $scope.loginUserID=localStorage.getItem("username",$scope.loginUserID);
    $scope.loginPassword=localStorage.getItem("userpwd",$scope.loginPassword);
    $scope.goIndexPage=function(loginValue){
        if(loginValue){
            //ajax请求登录数据
            $http.get("http://datainfo.duapp.com/shopdata/userinfo.php",{
                params: {
                    status: "login",
                    userID: $scope.loginUserID,
                    password: $scope.loginPassword
                }
            }).success(function(data){
                /* status:login	登陆成功：返回json对象{code:'',userID:'',password:'', userimg_url:'', sex:''}
                 userID用户名	用户名不存在：0
                 password:密码	用户名密码不符：2
                 */
                if(data=="0"){
                    alert("用户名不存在，请重新输入！");
                    $scope.loginUserID="";
                    $scope.loginPassword="";
                }else if(data=="2"){
                    alert("用户名密码不符，请重新输入！");
                    //$scope.loginUserID="";
                    $scope.loginPassword="";
                }else{
                    localStorage.setItem("username",$scope.loginUserID);
                    localStorage.setItem("userpwd",$scope.loginPassword);
                    alert("登录成功！");
                    $location.path("/home");
                }
            })
        }else{
            alert("填写数据与要求不符，请重新填写！");
            $scope.loginUserID="";
            $scope.loginPassword="";
        }
    }
})
.controller("registerCtrl",function($scope,$location,$http,$rootScope){
    $scope.headerName="用户注册";//需要使用过滤器才能生成i标签
    $rootScope.idisplay=true;
    $rootScope.emdisplay=false;
    $scope.gopage=function(){//返回登录页
        $location.path("/login");
    };
    $scope.gologin=function(registerValue){//点击跳转至登录页
        if(registerValue){
            //ajax请求注册数据
            $http.get("http://datainfo.duapp.com/shopdata/userinfo.php",{
                params:{
                    status:"register",
                    userID:$scope.registerUserID,
                    password:$scope.registerPassword
                }
            }).success(function(data){
                //status:register userID:用户名 password:密码 用户名重名:0 注册成功:1 数据库报错：2
                if(data=="0"){
                    alert("用户名已存在，请重新输入！");
                    $scope.registerUserID="";
                    $scope.registerPassword="";
                    $scope.checkPassword="";
                }else if(data=="1"){
                    alert("恭喜您，注册成功！");
                    $location.path("/login");
                }else{
                    alert("服务器请求错误，请重新输入！");
                    $scope.registerUserID="";
                    $scope.registerPassword="";
                    $scope.checkPassword="";
                }
            })
        }else{
            alert("填写数据与要求不符，请重新填写！");
            $scope.registerUserID="";
            $scope.registerPassword="";
            $scope.checkPassword="";
        }
    }
})
.controller("headerCtrl",function($scope,$location){

})
.controller("swiperCtrl",function($scope,$location){
    $scope.going=function(){
        $location.path("/login");
    }
});
