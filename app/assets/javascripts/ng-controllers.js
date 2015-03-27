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
	.controller('ContentsCtrl', ['$scope', '$resource', function ($scope, $resource) {
		if (!$scope.volume) $scope.volume = $resource('/volumes/:id.json').query({id:$scope.volumeId || 0});
		if (!$scope.volume.$childVolumes) $scope.volume.$childVolumes = $resource('/volumes/:id/children.json').query({id:$scope.volumeId || 0});
	}])
	// Used on Contents page
	.controller('Contents.VolumeCtrl', ['$scope', '$resource', '$sce', function ($scope, $resource, $sce) {
		this.title = $sce.trustAsHtml($scope.volume.title_html);
		this.updatedBy = $sce.trustAsHtml($scope.volume.updated_by_name);
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
			if (!parentVol.$childVolumes)
				parentVol.$childVolumes = $resource('/volumes/:id/children.json').query({id:parentVol.id});
			$scope.volume.$showChildVols = !$scope.volume.$showChildVols;
		}
	}])
	// Used on Meta page
	.controller('VolumeCtrl', ['$scope', '$resource', '$routeParams', '$sce', function ($scope, $resource, $routeParams, $sce) {
		$scope.trustHtml = $sce.trustAsHtml;
		var Volume = $resource('/volumes/:id.json', {id:'@id'}, {"update":{method:'PUT'}});
		$scope.volume = $routeParams.volumeId ? Volume.get({id:$routeParams.volumeId}) : new Volume();
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
})();
