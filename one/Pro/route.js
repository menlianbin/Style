
var routeControl = (function(){
	//hash sheet
	var hashMap = {
		"home":homeObj,
		"search":searchObj,
		"shops":shopObj,
		"foodlist":foodlistObj

		
	}
	var curModule = null; //当前模块
	var preModule = null; //前一个模块
	var CachePageMap = {

	}
	function init(name){

		var module = hashMap[name] || hashMap["home"];
		var kname  = name;
		
		if(name.indexOf("search") !== -1){
			module = hashMap["search"];
			module.changeCity(name);
			kname = 'search';
		}
		if(name.indexOf("shops") !== -1){
			module = hashMap["shops"];
			kname = 'shops';
		}
		if(name.indexOf("foodlist") !== -1){
			module = hashMap["foodlist"];
			kname = 'foodlist';
		}
		if(module){
			if(typeof CachePageMap[kname] === "undefined"){

				module.init(name);
				CachePageMap[kname]  =  true;
				preModule = curModule;
				curModule = module;

				if(preModule){//若当前存在，则消失

					preModule.leave();

				}
				module.enter();

			}else{

				preModule = curModule;
				curModule = module;

				if(preModule){

					preModule.leave();

				}
				module.enter()

			}


		}else{
			location.href = "#home";

		}

	}

	return {
		init: init
	}
})();
