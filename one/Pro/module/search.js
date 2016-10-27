var searchObj = Object.create(homeObj);

$.extend(searchObj, {
	name: "我是搜索页对象",
	dom: $("#search"),
	init: function(name) {
		console.log(this.name);
		this.bindEvent();
		
	},
	changeCity: function(name) {
		var city_id = name.split('-')[1];
		var city_name = decodeURI(name.split('-')[2]);
		$('input[name=city_id]').val(city_id);
		$('.s-location').html(city_name);
		//初始化
		var str = '<div class="history">搜索历史</div>' +
			'<div class="resCitys-wrap">' +
			'<div class="search-his">' +
			'<div class="s-item">' +
			'<div class="sitem-name">没有搜索记录！</div>' +
			'</div>' +
			'</div>' +
			'</div>';
		$('.s-citylist').html(str)
	},
	bindEvent: function() {
		var me = this;
		$('#query').click(function(event) {
			var keyword = $('.searchinp').val();
			var city_id = $('input[name=city_id]').val();
			var data = store(keyword + city_id);
			event.preventDefault(); //zhuzhi morenshijian 
			if (data) {
				var str = '<div class="resList">';
				var list = data;
				for (var i = 0; i < list.length; i++) {
					str += '<div class="s-item">' +
						'<a class="sitem-name" href="#shops-' + list[i].geohash + '-' + list[i].latitude + '-' + list[i].longitude + '">' + list[i].name + '</a>' +
						'<div class="sitem-add">' + list[i].address + '</div>' +
						'</div>'
				}
				str += '</div>'
				$('.s-citylist').html(str);
				setTimeout(function() {
					me.rendeScroll();
				}, 0)
				return;
			}
			var url = '/v1/pois?' + $('form').serialize();
			
			$.ajax({
				url: url,
				type: "GET",
				success: function(res) {
					if (res.length === 0) {
						var str = '<div class="resList"><div class="s-item">' +
							'<div class="sitem-name" style="color:red">搜索结果为空！</div>' +
							'</div></div>'
						$('.s-citylist').html(str);
					} else {
						me.resCitys = res; //shuju yu luoji fenli
						store(keyword + city_id, res);
						me.renderRes();

						setTimeout(function() {

							me.rendeScroll();
						}, 0)
					}
				},
				error: function() {
					alert("服务器错误，404!")
				}
			})
	
		})
	},
	renderRes: function() {
		var me = this;
		console.log(this.resCitys)
		var str = '<div class="resList">';
		var list = this.resCitys;
		for (var i = 0; i < this.resCitys.length; i++) {
			str += '<div class="s-item">' +
				'<a class="sitem-name" href="#shops-' + list[i].geohash + '-' + list[i].latitude + '-' + list[i].longitude + '">' + list[i].name + '</a>' +
				'<div class="sitem-add">' + list[i].address + '</div>' +
				'</div>'
		}
		str += '</div>'
		$('.s-citylist').html(str);
	},
	rendeScroll: function() {
		window.myScrollFood = new IScroll('.s-citylist', {
			scrollbars: true,
			bounce: true,
			preventDefault: false, //让点击事件得以执行
			probeType: 2, //让滚动条滚动正常
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
	}

})