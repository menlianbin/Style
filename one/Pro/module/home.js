
var homeObj = {
	name:"home",
	hot:"hot",
	dom: $("#home"),
	cL:null,
	init:function(name){
		this.cityList  = store(this.name);
		console.log(this.name)
		if(this.cityList){//性能优化
			var me  = this;
			var arr = [];
			var str = '';
			for(var index in me.cityList){

				arr.push(index)
			}	
			var aList = arr.sort();
			for(var i = 0;i < aList.length;i++){
					str += '<div class="letterList" data-letter="' + aList[i] + '">'  + aList[i] + '</div>';
			}
			$('.h-letter').html(str);	
			me.rendeCitys(aList);
			setTimeout(function(){
					me.bindEvent();
			},0);
		}
		this.hotcity = store(this.hot);
		console.log(this.hotcity)
		if(this.hotcity){
			var me = this;
			var str = '';
			for(var i = 0;i < this.hotcity.length;i++){
				str += '<div><a href="#search-' + this.hotcity[i].id + '-' + encodeURI(this.hotcity[i].name) + '">'+this.hotcity[i].name+'</a></div>'
			}	 
			$('.city-list').html(str);	

			return;		
		}
		
		this.rendeHotCity();
		this.rendeAlpha();
		
	},
	rendeHotCity:function(){
		var me = this;
	
		$.ajax({
			url: '/v1/cities?type=hot',
			type: 'get',
			success: function(res){
				var str = '';
				me.hotcity = res;
				store(me.hot,res)
				for(var i = 0;i < res.length;i++){
					str += '<div><a href="#search-' + res[i].id + '-' + encodeURI(res[i].name) + '">'+res[i].name+'</a></div>'
				}	 
				$('.city-list').html(str);	
			}
		});
	},
	rendeAlpha:function(){
		var me = this;
		$.ajax({
			url: '/v1/cities?type=group',
			type: 'get',
			success: function(res){		
				me.cityList = res;//数据与
				store(me.name,res);
				var arr = [];
				var str = '';
				for(var index in me.cityList){

					arr.push(index)
				}	
				var aList = arr.sort();
				for(var i = 0;i < aList.length;i++){
					str += '<div class="letterList" data-letter="' + aList[i] + '">'  + aList[i] + '</div>';
				}
				$('.h-letter').html(str);	
				me.rendeCitys(aList);
				setTimeout(function(){
					me.bindEvent();
				},0)
				
			}
		})	
	},
	rendeCitys:function(aList){//详细地址标题加载
		var str = '';
		for(var i = 0;i < aList.length;i++){
			str += '<div class="item">' +
						'<div class="item-title" data-tLetter="' + aList[i] + '">' + aList[i] +'</div><div class="items-wrap">' + this.rendCityItem(aList[i]) +
						'</div></div>'
		}
		$('.citys-wrap').html(str)
	},
	rendCityItem:function(index){//详细地址加载
		var str = '';
		var singleCity = this.cityList[index];
		for(var i = 0 ;i < singleCity.length;i++){
			str += '<a class="items-list" href="#search-' + singleCity[i].id + '-' + encodeURI(singleCity[i].name) + '">' + singleCity[i].name + '</a>'
		}
		return str;
	},
	bindEvent: function(){
		console.log("a")
		window.myScrollFood = new IScroll('.h-citys', {
		    scrollbars: true,
		    bounce: true,
		    preventDefault: false, //让点击事件得以执行
		    probeType:2, //让滚动条滚动正常
		    interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});

		$('.h-letter').on('click','.letterList',function(){

			console.log(this.dataset.letter);
			var titleList = document.querySelectorAll('.item-title');
			for(var i = 0;i < titleList.length;i++){
				var targetDom = titleList[i];
				if(titleList[i].dataset.tletter === this.dataset.letter){
					myScrollFood.scrollToElement(targetDom, 300, 0);
				}

			}
		})
	},
	enter: function(){

		this.dom.show();

	},
	leave: function(){

		this.dom.hide();

	}



}	

