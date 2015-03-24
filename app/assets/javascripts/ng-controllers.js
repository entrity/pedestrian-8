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
		$scope.volume = $resource('/volumes/:id.json').query({id:$scope.volumeId || 0});
		$scope.children = $resource('/volumes/:id/children.json').query({id:$scope.volumeId || 0});
	}])
	.controller('Contents.VolumeCtrl', ['$scope', '$resource', '$sce', function ($scope, $resource, $sce) {
		this.title = $sce.trustAsHtml($scope.volume.title_html);
		this.updatedBy = $sce.trustAsHtml('not implemented'); // to change. the updater's name should be denormalized
	}])
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
