var shopObj = Object.create(homeObj);

$.extend(shopObj, {
	name: "我是搜店铺对象",
	dom: $("#shops"),
	initNum:0,
	sock:false,
	init: function(name) {
		// console.log(this.name);
		this.lat = name.split('-')[2];
		this.lng = name.split('-')[3];
		this.geohash = name.split('-')[1];
		var city_id = name.split('-')[4];
		store(this.lng,this.geohash);
		console.log(store(city_id))
		$("#goSearch").attr("href","#search-" + this.geohash);
		store(this.geohash, {
			lat: this.lat,
			lng: this.lng
		});
		this.loadAddress();
		this.loadName();
		this.loadNearBy();
		this.bindEvent();
	},
	loadAddress: function() {
		$.ajax({
			url: '/v2/pois/' + this.geohash,
			success: function(res) {
				// console.log(res);	
				var astr = '';
				if (res.name.length >= 5) {
					astr = res.name.slice(0, 8);
				}
				astr += '..'
				$(".sp-address").html(astr)
			}
		})
	},
	loadNearBy: function() {
		var me = this;
		var url = '/shopping/restaurants';
		if(this.sock){
			return ;
		}
		this.sock = true;
		var data = 	store(this.lat + this.lng);
		console.log(data)
		if(data){
			if (data.length === 0) {
				var str = '<div class="noShops">附近没有商家！</div>';
				$('.list-wrap').html(str)
			} else {
				me.resNearBy = data;
				me.rendNearBy();
			}
			return;
		}

		$.ajax({
			url: url,
			type: "GET",
			data: {
				'latitude': me.lat,
				'longitude': me.lng,
				'offset': me.initNum ,
				'limit': '20',
				'extras': ['activities']
			},
			success: function(res) {
				me.sock = false;
				// console.log(res);
				if (res.length === 0) {
					var str = '<div class="noShops">附近没有商家！</div>';
					$('.list-wrap').html(str)
				} else {
					me.resNearBy = res;
					store(this.lat + this.lng, res);
					me.rendNearBy();
				}
			}
		})
	},
	rendNearBy: function() {
		var me = this;
		var list = this.resNearBy;
		var str = '';
		for (var i = 0; i < list.length; i++) {
			//img路径处理
			str += '<a class="sp-item" href="#foodlist-'+ me.geohash +'-' + list[i].id + '">' +
				'<div class="item-img">' +
				'<img src="http://fuss10.elemecdn.com/' + me.handleData.image_pathHandle(list[i]) + '">' +
				'</div>' +
				'<div class="item-content">' +
				'<div class="shop-title ' + me.handleData.is_premium(list[i].is_premium) + '">' + list[i].name +
				'</div>' +
				'<div class="shop-rank">' +
				'<span class="rank">' +
				'<i></i>' +
				'</span>' +
				'<span class="score">' +
				list[i].rating +
				'</span>' +
				'<span class="solds">月销售' + list[i].recent_order_num + '分</span>' +
				'</div>' +
				'<div class="shop-send">' +
				'<span class="price">￥' + list[i].float_minimum_order_amount + '起送</span>/' +
				'<span class="send-p">配送费￥' + list[i].float_delivery_fee + '</span>' +
				'</div>' +
				'</div>' +
				'<div class="item-right">' +
				'<div class="shop-gur">' + me.handleData.supports_gur(list[i].supports) + me.handleData.supports_tick(list[i].supports) + '</div>' +
				'<div class="send-arrive">' +
				'<span class="beat" style="display:' + me.handleData.delivery_mode(list[i].delivery_mode) + '">蜂鸟专送</span>' +
				'<span class="arr-ontime" style="display:' + me.handleData.supports_ontime(list[i].supports) + '"> 准时达</span>' +
				'</div>' +
				'<div class="dis-time"><span class="distance">' + me.handleData.distance(list[i].distance) + '</span>/<span class="ontime">' + list[i].order_lead_time + 'min</span></div>' +
				'</div>' +
				'</a>'
		}
		$('.list-wrap').append(str)
	},
	handleData: {
		image_pathHandle:function(obj){

			if(obj.image_path === null){
				return '';
			}
			var image_path = obj.image_path;
			var image_path_1 = image_path.substr(0, 1);
			var image_path_2 = image_path.substr(1, 2);
			var image_path_3 = image_path.substr(3);
			var image_path_4 = image_path_1 + "/" + image_path_2 + "/" + image_path_3;
			if (image_path_4.indexOf("jpeg") !== -1) {
				image_path_4 += ".jpeg";
			} else if (image_path_4.indexOf("png") !== -1) {
				image_path_4 += ".png";
			} else if (image_path_4.indexOf("jpg") !== -1) {
				image_path_4 += ".jpg";
			}
			return image_path_4;
		},
		is_premium: function(bol) {
			if (bol) {
				return 'shop-title-or';
			} else {
				return "";
			}
			return "";
		},
		supports_gur: function(obj) {
			if (obj.length !== 0) {
				for (var i = 0; i < obj.length; i++) {
					if (obj[i].id === 7) {
						return obj[i].icon_name + "&nbsp;"
					}
				}
				return '';
			} else {
				return '';
			}
		},
		supports_tick: function(obj) {
			if (obj.length !== 0) {
				for (var i = 0; i < obj.length; i++) {
					if (obj[i].id === 4) {
						return "票"
					}
				}
				return '';
			} else {
				return '';
			}
		},
		supports_ontime: function(obj) {
			// console.log( obj.length)
			if (obj.length !== 0) {
				for (var i = 0; i < obj.length; i++) {
					if (obj[i].id === 9) {
						return "block"
					}
				}
				return "none";
			} else {
				return 'none';
			}
		},
		delivery_mode: function(obj) {
			if (typeof obj !== "undefined") {
				return "block";
			} else {
				return "none";
			}
			return "none";
		},
		distance: function(res) {
			if (Number(res) >= 1000) {
				return Number(Math.floor(Number(res) / 1000)) + "." + Number(Number(res) % 1000) + 'km';
			} else {
				return res + 'm';
			}
		}
	},
	loadName: function() {
		var me = this;
		var url = '/v2/index_entry';
		$.ajax({
			url: url,
			type: "GET",
			data: {
				'geohash': me.geohash,
				'group_type': 1,
				'flags': ['F']
			},
			success: function(res) {
				console.log(res);
				me.resName = res;
				me.rendName();
			}
		})
	},
	rendName: function() {
		var me = this;
		var list = this.resName;
		var str = '';
		for (var i = 0; i < list.length; i++) {
			str += '<a class="swiper-slide" ><div class="imgList"><img  src="http://fuss10.elemecdn.com/' + list[i].image_url + '"></div><span>' + list[i].title + '</span></a>'
		}
		// console.log(str);
		$('.slide-wrap').html(str);
		me.rendeSwiper();
	},
	bindEvent: function() {
		//左右滑动
		var me = this;
		$("#backto-top")[0].addEventListener('click',function(){
			window.scrollTo(0,0);
		});
		
		window.addEventListener("scroll",me.scrollEvent);
	},
	scrollEvent:function(event){
		var me = shopObj;
		var backtoTop  = $("#backto-top");
		console.log("滚动事件监听")
		var top = window.scrollY + window.innerHeight - 100;
		backtoTop.css({
			"display":"block",
			"top":top
		});
		// console.log(top);
		//模拟fixed
		var domHeight = $(".sp-title").height();
		
		if(window.scrollY >= domHeight + 10){
			// console.log(domHeight+ ":"+window.scrollY)
			$(".sp-title").addClass("onfixed");
			$(".sp-title").css("top",window.scrollY - 1);
		}else{
			$(".sp-title").removeClass("onfixed");
			backtoTop.css({
			"display":"none"
		});
		}
		//无限加载问题
		if((window.scrollY + window.innerHeight) === me.dom.height()){
			me.initNum += 20;
			me.loadNearBy();
			console.log("aa");
		}
	},
	rendeSwiper: function() {
		var mySwiper = new Swiper ('.swiper-container', {
		   	slidesPerView : 4,
			slidesPerColumn : 2,
		    pagination: '.swiper-pagination',
  		})        
	},
	leave:function(){
		var me  = this;
		this.dom.hide();
		window.removeEventListener("scroll",me.scrollEvent);
	}
})