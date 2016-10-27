var route = new Router({
	'/:page': function(name){
		routeControl.init(name);
	}
});

// Pace.on("done", function () {
	//进度条加载完成时，所需要执行的回调函数
	console.log('进度条加载完成');
	route.init('/home');
console.log(333);
