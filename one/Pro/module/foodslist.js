
var foodlistObj  = Object.create(homeObj);

$.extend(foodlistObj,{
	name: "我是食物详情页对象",
	dom: $("#foodlist"),
	init: function(name){
		var me = this;
		console.log(this.name)
		this.geoHash = name.split('-')[1];
		this.shopId = name.split('-')[2];
		this.info = store(this.geoHash);
		this.lat = this.info.lat;
		this.lng = this.info.lng;
		this.loadHeadInfo(); //加载头部信息
		this.loadMenuInfo(); //加载商品信息
		Pace.on('done', function(){
			me.dragEventListener();
		})
	},
	loadHeadInfo: function(){
		var me = this;
		$.ajax({
			url: 'shopping/restaurant/' + this.shopId,
			data: {
				extras: ['activities', 'album', 'license', 'identification', 'statistics'],
				latitude:this.lat,
				longitude:this.lng
			},
			success: function(res){
				me.headInfo = res;
				me.rendHead();
				me.loadMask();
				me.maskShow();
			}
		});

	},
	rendHead: function(){
		var me = this;
		var handleInfo = shopObj.handleData;
		var image_path_4 = handleInfo.image_pathHandle(this.headInfo);
		var deliver_node = handleInfo.delivery_mode(this.headInfo.delivery_mode);
		console.log(this.headInfo);
		var str = '<div class="info-img">' +
					'<img src="http://fuss10.elemecdn.com/'+ image_path_4 +'">' +
					'</div>' +
					'<div class="info-detial">' +
						'<div class="food-name">'+ this.headInfo.name +'</div>' +
						'<div class="send-info">' +
							'<span class="beat-send" style="display:inline-'+ deliver_node +'">蜂鸟专送&nbsp;/</span>' +
							'<span class="send-time">'+ this.headInfo.order_lead_time +'分钟送达</span>/' +
							'<span class="send-fee">配送费'+ this.headInfo.float_delivery_fee +'元</span>' +
						'</div><div class="food-sale-wrap">' + this.handleHeadInfo.activitiesRes(this.headInfo.activities) +
							'</div></div>' +
					'</div>'
		$('.shop-infor').html(str);
		$('.infor-notice').html(this.headInfo.promotion_info)
	},
	loadMenuInfo:function(){
		var me = this;
		var data = store(this.shopId);
		if(data) {
			this.foodResult = data;
			this.renderMenu();
			return;
		}
		$.ajax({
			url: '/shopping/v1/menu?restaurant_id=' + this.shopId,
			success: function(res){
				store(me.shopId, res);
				me.foodResult = res; //数据与逻辑是相分离的
				me.renderMenu();
			}
		})		 	
	},
	renderMenu:function(){
		var me = this;
		this.renderNavMenu();
		this.renderFoodList();
		
		setTimeout(function(){
			me.bindEvent(); 
			
		});
		this.getTotalPrice();

	},
	renderNavMenu: function(){
		var str = '';
		var list  = this.foodResult;
		var distance = [];
		var sum = 0;
		for(var i =0; i < this.foodResult.length; i++) {
			var data = this.foodResult[i];
			sum += 30 + 120 * data.foods.length;
			distance.push(sum);
		}
		this.distance  = distance;
		this.endDis = distance[this.foodResult.length - 1] - 320;
		//算出最后一个元素的距离
		console.log(this.distance)
		for(var i = 0;i < list.length;i++){
			if(list[i].is_selected) {
				str += '<div class="active" data-distance="'+ distance[i] +'">'+ list[i].name +'</div>'
			}else {
				str += '<div data-distance="'+ distance[i] +'">'+ list[i].name +'</div>'
			}
		}
		$('.menu-wrap').html(str);
	},
	renderFoodList: function(){
		var str  = '';
		var me = this;
		var list = this.foodResult;
		for(var i = 0;i < list.length;i++){

			str += '<div class="f-items">' +
						'<div class="items-title"n data-title="' + this.distance[i] +'">' +
							'<span>'+ list[i].name +'</span>' +
							'<span class="it-detial">' + list[i].description + '</span>' +
						'</div>' + me.rendSingleFood(list[i].foods,i) + 
					'</div>' 

		}
		$('.flist-wrap').html(str)
		console.log()
	},	
	rendSingleFood: function(data,index){
		var str = '';
		console.log(index)
		var handleInfo = shopObj.handleData;
		for(var i = 0;i < data.length;i++){
			//初始化购物车数量
			data[i].specfoods[0].count = data[i].specfoods[0].count || 0;
			var image_path_4  = handleInfo.image_pathHandle(data[i])
			str  += '<div class="items-content">' +
							'<div class="img-content">' +
								'<img src="http://fuss10.elemecdn.com/' + image_path_4 + '">' +
							'</div>' +
							'<div class="content-det">' +
								'<div class="cd-title">'+ data[i].name +'</div>' +
								'<div class="cd-detial">月售' + data[i].month_sales +'份，好评率' + data[i].satisfy_rate +'%</div>' +
								'<div class="shopcar"  data-parentindex="'+ index +'" data-index="'+ i +'">' +
								'<div class="cd-price">￥<strong style="font-size:16px;font-weight:600;">'+ data[i].specfoods[0].price+'</strong></div><div class="sc-cal" ><div class="cd-minus">-</div><div class="cd-count">' + data[i].specfoods[0].count + '</div>' +
								'<div class="cd-plus">+</div></div>' +
								'</div>' +
							'</div>' +
						'</div>' 
		}
		return str;
	},

	bindEvent: function(){
		//添加购物车
		var me = this;
		$('.cd-plus').click(function(){

			var parentDom = $(this).closest('.shopcar');
			var parentIndex = parentDom.data('parentindex');
			var index = parentDom.data('index');
			me.foodResult[parentIndex].foods[index].specfoods[0].count++;
			parentDom.find('.cd-count').html(me.foodResult[parentIndex].foods[index].specfoods[0].count);
			me.getTotalPrice();

		});

		$('.cd-minus').click(function(){

			var parentDom = $(this).closest('.shopcar');
			var parentIndex = parentDom.data('parentindex');
			var index = parentDom.data('index');
			var minusCount = me.foodResult[parentIndex].foods[index].specfoods[0].count;
			if(minusCount <= 0){
				//总数量判断
				me.foodResult[parentIndex].foods[index].specfoods[0].count = 0;
				parentDom.find('.cd-count').html(0);

			}else{
				me.foodResult[parentIndex].foods[index].specfoods[0].count--
				parentDom.find('.cd-count').html(me.foodResult[parentIndex].foods[index].specfoods[0].count);
			}
			
			me.getTotalPrice();

		});

		if(typeof myScrollFood !== "undefined"){

			myScrollFood.destory();

		}

		window.myScrollFood = new IScroll('.food-detial', {
		    scrollbars: true,
		    bounce: true,
		    preventDefault: false, //让点击事件得以执行
		    probeType:2, //让滚动条滚动正常
		    interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
		window.myScrollFoodMenu = new IScroll('.food-menu', {
		    scrollbars: true,
		    bounce: true,
		    preventDefault: false, //让点击事件得以执行
		    probeType:2, //让滚动条滚动正常
		    interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
		var MenuList = $('.menu-wrap').find('div');
		MenuList.click(function(event){
			console.log(this);
			this.classList.add("active");
			$(this).siblings().removeClass('active');
			////////////////////
			var dis = this.dataset.distance;
			var selector = '[data-title="'+dis+'"]';
			var targetDom = $(selector)[0];
			myScrollFood.scrollToElement(targetDom, 500, 0, 0);
			/////////////////////思路
		});
		myScrollFood.on("scroll",function(){
			// console.log(1)
			var me  = this;
			// console.log(MenuList.length);
			for(var i = 0;i < MenuList.length;i++){
				var list = MenuList[i];
				if(list.dataset.distance > Math.abs(me.y)){
					$(list).siblings().removeClass('active');
					list.classList.add('active');
					break;
				}
			}
			if(Math.abs(this.y) > me.endDis){
				var endDom = MenuList[MenuList.length - 1];
				endDom.classList.add('active');
				$(endDom).siblings().removeClass('active');
			}
		});


	},
	getTotalPrice: function(){
		//计算总价
		var sum = 0;
		var countNum = 0;
		for(var i =0; i < this.foodResult.length; i++) {
			for(var j = 0; j < this.foodResult[i].foods.length;j++){
				var item = this.foodResult[i].foods[j].specfoods[0];
				// console.log(item.price, item.count);
				sum += item.price * item.count;
				countNum += item.count;
			}
		}
		store(this.shopId, this.foodResult);
		$('.carttotal').html("￥&nbsp;" + sum)
		$('.carticon').attr("attr-quantity",countNum);
	},
	loadMask:function(){
		var data = this.headInfo
		console.log(this.headInfo.activities)
		var str = '<div class="im-title">' +
						'<div class="shop-location">'+ data.name +'</div>' +
						'<div class="im-rank"></div>' +
					'</div>' +
					'<div class="im-line">' +
						'<span class="iml-info">优惠信息</span>' +
					'</div>' +
					'<div class="im-pank">'+this.handleHeadInfo.activitiesRes(data.activities)+'</div>' +
					'<div class="im-line">' +
						'<span class="iml-info">商家公告</span>' +
					'</div>' +
					'<div class="im-notic">' + this.handleHeadInfo.noticHandle(data.promotion_info) + '</div><div class="fa fa-times-circle-o fa-2x" id="closed"></div>'

		$('.info-mask').html(str);
		$('#closed').click(function(){

			$(this).parent('.info-mask').hide();
		})
	},
	handleHeadInfo: {
		activitiesRes: function(obj){
			if(obj.length !== 0){
				var str = '';
				for(var i = 0;i < obj.length;i++){
					str += '<div class="food-sale food-sale-mask">' +
								'<span class="fee-min">'+ obj[i].icon_name +'</span>' +
								'<span class="fee-detial">'+ obj[i].description +'</span>' +
							'</div>'
				}
				return str;
			}
			return '';
		},
		noticHandle: function(obj){
			if(obj){
				return obj;
			}
			return '';
		}
	},
	maskShow: function(){
		$('.shop-infor').click(function(){
			$('.info-mask').show();
		})
	},
	dragEventListener: function(){
		var moveItem = document.getElementById("foodCont");
		var hammer = new Hammer(moveItem);
		var initX = initY = 0;
		var top;
		var moveNotic = $('.move-item');
		var infor = $('.shop-infor')[0];
		var height = $('.food-sale')[0].offsetHeight;
		var minTop = (+$('.food-sale-wrap')[0].offsetTop);
		var content = $('.food-content');
		hammer.get('pan').set({ direction: Hammer.DIRECTION_VERTICAL });
		hammer.on('panstart',function(event){
			top = +moveItem.offsetTop;
			console.log(top);
		});
		hammer.on('pan',function(event){
			// console.log(event.deltaY);
			console.log(333333)
			var deltaY = event.deltaY;
			var topHeight = infor.offsetHeight;
			if(top + deltaY > topHeight || top + deltaY < minTop + height){
				return;
			}	
			moveItem.style.top = top + deltaY + 'px';
		});
		hammer.on('panend',function(event){
			console.log(event.deltaY);
			var deltaY = event.deltaY;
			if(top + deltaY >= minTop + height) {
				moveItem.style.top = '3.3rem';
				moveNotic.show();
				content.css({
				"-webkit-transition": "top .5s  cubic-bezier(0.46, 0.18, 0.72, 0.45) ",
  				"transition": "top .5s cubic-bezier(0.46, 0.18, 0.72, 0.45)"
				});
			}else if(top + deltaY <= minTop) {
				moveItem.style.top = '0rem';
				content.css({
				"-webkit-transition": "top .2s  cubic-bezier(0.46, 0.18, 0.72, 0.45) ",
  				"transition": "top .2s cubic-bezier(0.46, 0.18, 0.72, 0.45)"
				});
				moveNotic.hide();
			}
		})
	}

})

