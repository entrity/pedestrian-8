(function(){
	angular.module('MyNgControllers', [])
	.controller('LogInCtrl', ['$scope', '$http', function ($scope, $http) {
		$scope.logIn = function () {
			$http.post('/users/sign_in.json', {user:$scope.user})
			.then(function (data, status, headers, config) {
				angular.extend($scope.getCurrentUser(), data.data);
				$scope.bulletin({klass:'success', text:'Logged in as '+$scope.getCurrentUser().email});
			}, function (data, status, headers, config) {
				console.warn(data);
				$scope.bulletin({klass:'alert', text:'Login failed'});
			});
		};
	}])	
	.controller('UserControlPanelCtrl', ['$scope', function ($scope) {
		$scope.userCpIsCollapsed = true;
	}])
	.controller('TopCtrl', ['$scope', '$resource', '$routeParams', '$sce', function ($scope, $resource, $routeParams, $sce) {
		$scope.header = new Object;
	}])
	.controller('VolumeCtrl', ['$scope', '$resource', '$routeParams', '$sce', 'VolumeModel', function ($scope, $resource, $routeParams, $sce, VolumeModel) {
		$scope.getPrevPage = function () {
			if ($scope.posts != null && $scope.posts.$promise && !$scope.posts.$resolved) return;
			if (!$scope.posts) $scope.posts = [];
			if (!$scope.page) $scope.page = 0;
			$scope.page += 1;
			var posts = $resource('/volumes/:id/posts.json').query({
				id:$routeParams.volumeId,
				page: $scope.page,
			});
			$scope.posts.$promise = posts.$promise;
			posts.$promise.then(function(data){
				for (var i in data) $scope.posts.push(data[i]);
			});
			return posts;
		}
		if (!$scope.volume) $scope.volume = VolumeModel.get({id:$routeParams.volumeId});
		if (!$scope.volume.childVolumes) $scope.volume.getChildren($routeParams.volumeId);
		if (!$scope.posts) $scope.getPrevPage();
		$scope.header.stylesheet = "/volumes/"+$routeParams.volumeId+".css";
		$scope.volume.$promise.then(function () {
			$scope.updatedBy = $sce.trustAsHtml($scope.volume.updated_by_name);
			$scope.title = $sce.trustAsHtml($scope.volume.title_html) || $scope.volume.title;
			$scope.description = $sce.trustAsHtml($scope.volume.description);
		});
	}])
	.controller('TreeCtrl', ['$scope', '$resource', '$sce', 'VolumeModel', function ($scope, $resource, $sce, VolumeModel) {
		if (!$scope.volume.$promise) $scope.volume.$promise = $scope.buildDummyPromise();
		$scope.volume.$promise.then(function () {
			$scope.updatedBy = $sce.trustAsHtml($scope.volume.updated_by_name);
			$scope.title = $sce.trustAsHtml($scope.volume.title_html) || $scope.volume.title;
		});
		$scope.timestamp = function () {
			if (!$scope.volume.timestamp) return;
			var delta = new Date().getTime() - new Date($scope.volume.timestamp).getTime();
			var minutes = Math.floor(delta / 60000);
			var hours = Math.floor(minutes / 60);
			var days = Math.floor(hours / 24);
			var output = "";
			if (days) output += days+' days ';
			if (days || hours) output += hours%24+' hours ';
			output += minutes%60+' min ago';
			return output;
		}
		$scope.showChildVols = function (parentVol) {
			if (!parentVol.childVolumes) VolumeModel.getChildren(parentVol);
			$scope.volume.$showChildVols = !$scope.volume.$showChildVols;
		}
	}])
	.controller('PostCtrl', ['$scope', '$resource', 'DateFmtOpts', '$sce', function ($scope, $resource, DateFmtOpts, $sce) {
		$scope.content = $sce.trustAsHtml($scope.post.content);
		$scope.author = $sce.trustAsHtml($scope.post.user_name);
		$scope.timestamp = new Date($scope.post.created_at).toLocaleTimeString("en-gb", DateFmtOpts);
	}])
	.controller('Volume.EditCtrl', ['$scope', '$resource', '$routeParams', '$sce', function ($scope, $resource, $routeParams, $sce) {
		$scope.parentVol = new Object;
		$scope.refreshOtherVolumes = function (searchTerm) {
			$scope.otherVolumes = $resource('/volumes.json').query({title:searchTerm});
		}
		$scope.selectParentVol = function (item, model) {
			$scope.volume.parent_id = item.id;
		}
		$scope.save = function () {
			var fn = $scope.volume.id ? '$update' : '$save';
			$scope.volume[fn]()
			.success(function(){
				alert('saved');
			})
			.error(function(){
				alert('failed to save volume');
			})
		}
	}])
	.factory('VolumeModel', ['$resource', function ($resource) {
		var VolumeModel = $resource('/volumes/:id.json', {id:'@id'}, {"update":{method:'PUT'}});
		Object.defineProperty(VolumeModel.prototype, 'getChildren', {
			enumerable: false,
			writable: false,
			value: function (volumeId) {
				VolumeModel.getChildren(this, volumeId);
			}
		});
		Object.defineProperty(VolumeModel, 'getChildren', {
			writable: false,
			value: function (volume, parentId) {
				Object.defineProperty(volume, 'childVolumes', {
					enumerable: false,
					writable: false,
					value: $resource('/volumes/:id/children.json').query({id:parentId||volume.id})
				})
			}
		});
		return VolumeModel;
	}])
	.value('DateFmtOpts', {
		weekday: "short", year: "numeric", month: "short",
    day: "numeric", hour: "2-digit", minute: "2-digit"
	})
})();
