(function(){
	angular.module("PedestrianSite", [
		'ngAnimate',
		'ngResource',
		'ngRoute',
		'ngSanitize',
		'ui.bootstrap',
		'ui.select',
		'MyNgControllers',
		'MyNgModels',
	])
	.config(['$routeProvider', '$locationProvider', 'uiSelectConfig', function ($routeProvider, $locationProvider, uiSelectConfig) {
		$routeProvider
		.when('/volumes/:volumeId', {templateUrl:'/volumes/show.html'})
		.when('/volumes/:volumeId/edit', {templateUrl:'/volumes/edit.html', controller:'Volume.EditCtrl'})
		.otherwise({redirectTo:'/volumes/0'});
	}])
	.run(['$rootScope', 'UserModelProvider', 'BulletinProvider', '$q', function ($rootScope, UserModel, BulletinProvider, $q) {
		Object.defineProperties($rootScope, {
			bulletin: {
				value: function (params) {
					BulletinProvider.add(params);
				}
			},
			// Set currentUser on $rootScope.
			// @return $rootScope.currentUser
			// @param reload is optional
			getCurrentUser: {
				value: function (reload) {
					if (!$rootScope.currentUser || reload) {
						$rootScope.currentUser = UserModel.get({id:0});
						$rootScope.currentUser.$promise.then(function(data){
						// a redirect gets treated as a success. its data should be discarded
						// We don't simply assign $rootScope.currentUser to false b/c a lower scope may have a reference to the original $rootScope.currentUser assignment. Therefore, we must alter that Object and hold onto it.
						// Use $rootScope.isLoggedIn() to check whether a currentUser really exists.
						if (!$rootScope.currentUser.id)
							for (key in data)
								delete $rootScope.currentUser[key];
						}, function(data){
							// error
							console.log('no current user');
						});
					}
					return $rootScope.currentUser;
				}
			},
			// @param email is a string holding an email address
			// @return boolean indicating whether @param email matches our regular expression for email addresses.
			isEmailValid: {
				value: function (email) {
					return email && email.match(/\S+@\S+\.\w+/);
				}
			},
			// @return boolean for whether current user exists and has an id
			isLoggedIn: {
				value: function () {
				return $rootScope.currentUser && !!$rootScope.currentUser.id;
				}
			},
			// @return a resolved promise
			buildDummyPromise: {
				writable: false,
				value: function (optionalValue) {
					var deferred = $q.defer();
					deferred.resolve(optionalValue);
					return deferred.promise;
				}
			},
		});
	}])
	.provider('BulletinProvider', function () {
		this.$get = ['$rootScope', function ($rootScope) {
			var Bulletin = function (params) {
				for (k in params) this[k] = params[k];
			};
			Object.defineProperties(Bulletin.prototype, {
				remove: {
					writable: false,
					value: function () {
						var i = $rootScope.bulletins.indexOf(this);
						if (i >= 0) $rootScope.bulletins.splice(i,1);
					}
				},
				startTimer: {
					writable: false,
					value: function (ttl) {
						var self = this;
						if (this.timer) clearInterval(this.timer);
						this.timer = setInterval(function(){
							self.remove();
						}, ttl||this.ttl||10000);
					}
				},
			});
			var BulletinService = new Object;
			Object.defineProperties(BulletinService, {
				add: {
					writable: false,
					value: function (params) {
						$rootScope.bulletins || ($rootScope.bulletins = []);
						var bulletin = new Bulletin(params);
						$rootScope.bulletins.push(bulletin);
						if (bulletin.klass != 'alert') bulletin.startTimer();
					}
				}
			});
			return BulletinService;
		}];
	})
	;
})();
