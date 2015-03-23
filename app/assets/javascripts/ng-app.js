(function(){
	angular.module("PedestrianSite", [
		'ngAnimate',
		'ngResource',
		'ngRoute',
		'ngSanitize',
		'MyNgControllers',
		'MyNgModels',
	])
	.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
		$routeProvider
		.when('/contents', {templateUrl:'/contents.html'})
		.otherwise({redirectTo:'/contents'})
	}])
	.run(['$rootScope', 'UserModelProvider', 'BulletinProvider', function ($rootScope, UserModel, BulletinProvider) {
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
			}
		});
	}])
	.provider('BulletinProvider', function () {
		this.$get = ['$rootScope', function ($rootScope) {
			var BulletinService = new Object;
			Object.defineProperties(BulletinService, {
				add: {
					writable: false,
					value: function (params) {
						$rootScope.bulletins || ($rootScope.bulletins = []);
						$rootScope.bulletins.push(params);
					}
				}
			});
			return BulletinService;
		}];
	})
	;
})();
