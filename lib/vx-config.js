/*jshint smarttabs:true, eqeqeq:false, eqnull:true, laxbreak:true*/

/**
 * vx 配置
 */
vx.module('ibsapp.config', []).value('ibsapp.config', {});
vx.module('ibsapp.libraries', ['ibsapp.config']);
vx.module('ibsapp', ['ibsapp.libraries']);

/**
 *  Example Source Code 配置
 */
(function(window, vx, $) {//
	'use strict';

	// this block is module config, if you want do some module management, please use vx-plugins.js
	// and manage module by following methods:
	// **  module.provider(...) / module.factory(...) / module.service(...) / module.value(...) / module.constant(...)
	// **  module.filter(...)
	// **  module.directive(...)
	// **  module.controller(...)

	//### Configuration Entry
	var mod = vx.module('ibsapp.config');

	/************************************************
	 * config service factory function
	 ************************************************/
	//Log
	configLog.$inject = ['$logProvider'];
	function configLog($logProvider) {
		/**
		 * log level config, support 'debug', 'info', 'warn', 'error'
		 *  note: $log === window.console
		 *  if IE 6/7, include blackbird.js and blackbird.css will emulate window.console for you
		 *  default is 'debug'
		 */
		$logProvider.setLevel('debug');
	}

	//Browser
	configBrowser.$inject = ['$browserProvider'];
	function configBrowser($browserProvider) {

		/**
		 * if E2ETest (end to end test), you should disable browser.debounce function
		 * so setE2ETest(true), debounce used to combind events handle for performance
		 *  default is false
		 */
		//$browserProvider.setE2ETest(false);
		
		/**
		 * config Low version of the browser returns no refresh,setting iframe history href initial value.
		 * default file name by blank.html
		 */
		//$browserProvider.setBlankPage("empty.html");
	}

	//Targets
	configTargets.$inject = ['$targetsProvider'];
	function configTargets($targetsProvider) {
		/**
		 *  lets $targets service use window.History for browser forward and backward.
		 *  default is false
		 */
		$targetsProvider.useLocation(false);

		/**
		 * register transition function to $targets service,
		 *  transition function signature is function(oldEl, newEl, remove, back)
		 */
		//$targetsProvider.transition('transition-name', function(oldEl, newEl, remove, back){});

	}

	//Compile
	configCompile.$inject = ['$compileProvider'];
	function configCompile($compileProvider) {
		/**
		 *  when vx set <a href='...' />, it will sanitize for avoid XSS attack
		 *  default is /^\s*(https?|ftp|mailto|file):/
		 */
		//$compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file):/);
	}

	//RootScope
	configRootScope.$inject = ['$rootScopeProvider'];
	function configRootScope($rootScopeProvider) {
		/**
		 * scope's digest is dirty loop, until now modification found, so loop count(TTL)
		 * is fatal for performance, it means loop count over TTL, the digest will exit
		 * even if has more modifications
		 *  default is 10
		 */
		//$rootScopeProvider.digestTtl(10);

		/**
		 * for scope digest analysis, $rootScope service will use log.debug tracing
		 *  digest processing,
		 *  default is false
		 */
		$rootScopeProvider.traceDigest(true);
	}

	//Remote
	configRemote.$inject = ['$$remoteProvider'];
	function configRemote($$remoteProvider) {
		/**
		 * $remote will use this name for scope, for example, scope.$error will get error object
		 *  default is '$error'
		 */
		$$remoteProvider.setErrorTag('$error');

		/**
		 * $remote will use this callback analysis error, for examples
		 *  1.  status not in [200, 300), return 'http error'
		 *  2.  application data include $jsonError property will means application error
		 *
		 *  NOTE: application should provide this callback
		 */
		$$remoteProvider.setErrorCallback(function(data, status, headers, config) {
			// if error return error object, otherwise return null
			var $S = config.$scope, errorList = [], msg = "",msgCode="";
			if (!status && status != 200 && status !== 0) {
				switch(status) {
					case 404 :
						console.log("404.html");
						break;
					case 500 :
						console.log("500.html");
						break;
					default :
						console.log("error.html");
				}
			} else if (data && data.jsonError) {
					if (vx.isArray(data.jsonError)) {
						errorList = data.jsonError;
					} else {
						msg = data.jsonError;
					}
				}
			if (errorList) {
				for (var i = 0; i < errorList.length; i++) {
					if (errorList[i]._exceptionMessage) {
						msg = msg.concat(errorList[i]._exceptionMessage);
						msgCode = msgCode.concat(errorList[i]._exceptionMessageCode);
					} else {
						msg = msg.concat(errorList[i]);
					}
				}
			}
			if (msg) {
				//$S.jsonError = msg;
				var errorMsg;
				if (vx.isArray(msg)) {
					errorMsg = msg[0];
				} else {
					errorMsg = msg;
				}
				// 当session超时的时候，返回码是：uibs.both_user_and_bankid_is_null
				//跳转到登录页面
				if ( msgCode.indexOf("uibs.both_user_and_bankid_is_null")!== -1) {
					console.log($S);
					$S._$session.loginFlag=false;
					var st = window.confirm("您已经登录超时，是否重新登录？");
					if (st) {
						window.location.href = "login.html";
						return;
					}
				}
				$S.$error=msg;
				$S.$alertCloseBtn=true;
				return null;
			}

		});

		/**
		 * $remote could add success callback by yourself, it will could be call later
		 *  like:   $remote.get(...).method(arg1, arg2)   ** first arg is data
		 *  you could extend $remote success callback by this
		 */
		// $$remoteProvider.addCallback('method', function(data, arg1, arg2) {
		// });
		$$remoteProvider.addCallback("doMain", function(data, $R) {
			var $S = this, oo = {};
			switch(data.loginType){
				case 'C':
					oo['UserType'] = "专业版个人网银";
					break;
				case 'O':
					oo['UserType'] = "普通(动态验证码)版个人网银";
					break;
				case 'B':
					oo['UserType'] = "商户版个人网银";
					break;
				default : 
					oo['UserType'] = "大众版个人网银";
			}
			$R.post('menu.do', oo, function(data) {
				$S.$root.menus = data;
			});
		});

		$$remoteProvider.addCallback("doPage", function(data) {
			var $scope = this;
			$scope.setPagableData(data);
			//注入查询结果
			$scope.pagableQryCallBack(data);
			//分页展示
		});

	}

	//Http
	configHttp.$inject = ['$httpProvider'];
	function configHttp($httpProvider) {
		/**
		 * config $http service if use inner cache(not HTTP cache), if use inner cache
		 * all same url GET will just submit server only once
		 * default is false
		 */
		//$httpProvider.useCache(false);

		/**
		 * config $http if use json request type, if not, use form encoding, for examples
		 *  abc=a&aaa=23
		 *  defautl is true
		 */
		//$httpProvider.useJsonRequest(true);

		/**
		 * config $http service default callback, if return true, it will disable all success and error callback
		 *  typically, this callback could use for session control
		 *  but in application use $remote is recommend, so you could use $remoteProvider.setErrorCallback for
		 *  same situation
		 */
		$httpProvider.setDefaultCallback(function(data, status, headers, config) {
			// if return true, means no need further process, all others success(...) and error(...) will not invoke
			return false;
		});

		/**
		 * config $http service defaults, you could:
		 * 1. $httpProvicer.defautls.transformResponse(array) override default json convert or add your function
		 * 2. $httpProvicer.defautls.transformRequest(array) override default json convert or add your function
		 * 3. $httpProvicer.defautls.headers define default HTTP Headers, default is
		 * {
		 *   common : {
		 *     'Accept' : 'application/json, text/plain, *\/*'
		 *   },
		 *   post : {
		 *     'Content-Type' : 'application/json;charset=utf-8'
		 *   },
		 *   put : {
		 *     'Content-Type' : 'application/json;charset=utf-8'
		 *   },
		 *   xsrfCookieName : 'XSRF-TOKEN',
		 *   xsrfHeaderName : 'X-XSRF-TOKEN'
		 * }
		 */
		//$httpProvider.defaults

		/**
		 * config $http service response interceptors, default is empty array
		 *  you could use  $httpProvider.responseInterceptors.push(fn(promise)) for add interceptor
		 *  promise is $q.defer.promise object, use then(success(...), error(...)) for register callback
		 */
		//$httpProvider.responseInterceptors

	}

	//HttpBackend
	configHttpBackend.$inject = ['$httpBackendProvider'];
	function configHttpBackend($httpBackendProvider) {

		/**
		 * config $httpBackend use anti-cache policy for HTTP cache
		 * 0-none, 1-use load timestamp, 2-use request timestamp
		 *  defautl is 0
		 */
		$httpBackendProvider.useAntiCache(0);

		/**
		 * config $httpBackend use external ajax function
		 * if true will use jQuery's ajax, otherwise use vx internal ajax
		 * default is false
		 */
		$httpBackendProvider.useExternalAjax(false);

		// config ajax default port
		$httpBackendProvider.config({
			/**
			 * config $httpBackend default ajax timeout(in millisecond)
			 *  default is 30000
			 */
			ajaxTimeout : 5000,
			/**
			 * config $httpBackend use ajax queue mode, in queue mode
			 * all ajax request will execute one by one
			 *  ajaxQueueSize is queue max length, 0 means no queue
			 *  ajaxAborted use for ajax abort or not if duplicated request
			 * default is (5, false)
			 */
			ajaxQueueSize : 5,
			ajaxAborted : false,
			/**
			 * config $httpBackend beforSend and afterReceived callback
			 * typically use for ajax indicator
			 * NOTE: you should config it for ajax indicator
			 */
			beforeSend : function() {
				// beforeSend
				$('.httpBackend-backdrop.active').fadeIn();
			},
			afterReceived : function() {
				// afterReceived
				$('.httpBackend-backdrop.active').fadeOut();
			}
		});

	}

	//Validation
	configValidation.$inject = ['$validationProvider'];
	function configValidation($validationProvider) {
		/**
		 * register validation type, validation is use in data-binding, so it is
		 * bi-direction include parse and format, so validation function could
		 * registerred in 2 modes:
		 * 1.
		 *  $validationProvider.register('validator', function(value) {
		 *	  // return converted value, or undefined for invalid value
		 *  });
		 * 2.
		 *  $validationProvider.register('validator', {
		 *	  parse : function(value) {
		 *		// return converted value, or undefined for invalid value
		 *	  },
		 *	  format : function(value) {
		 *		// return converted value, or undefined for invalid value
		 *	  }
		 *  });
		 */

	}


	mod.config(configLog);
	mod.config(configBrowser);
	mod.config(configTargets);
	mod.config(configCompile);
	mod.config(configRootScope);
	mod.config(configRemote);
	mod.config(configHttp);
	mod.config(configHttpBackend);
	mod.config(configValidation);

	runRootScope.$inject = ['$rootScope','$window'];
	function runRootScope($rootScope,$window) {
		
		$rootScope.showErrMessage = function(message){
			$window.alert(message);
		}
		
		$rootScope.setValidation = function(el,value){
			vx.element(el).attr("validate", value);
		}
	}


	mod.run(runRootScope);

})(window, window.vx, window.jQuery);
