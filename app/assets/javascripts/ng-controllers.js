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
	.controller('VolumeCtrl', ['$scope', '$resource', '$routeParams', '$sce', 'VolumeModel', 'PostModel', '$rootScope', function ($scope, $resource, $routeParams, $sce, VolumeModel, PostModel, $rootScope) {
		$scope.loadAnotherPage = function () {
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
				if ($scope.reversePagePlacement)
					$scope.posts = data.concat($scope.posts);
				else
					$scope.posts = $scope.posts.concat(data);
			});
			return posts;
		}
		$scope.createPost = function () {
			var editor = CKEDITOR.instances['new-post'];
			var post = PostModel.save({volume_id:$scope.volume.id, content:editor.getData()},
			function (data) {
				editor.setData('');
				angular.extend(post, data);
				$scope.posts.push(post);
				$scope.bulletin({klass:'success', text:'Post created'});
			},
			function () {
				$scope.bulletin({klass:'alert', text:'Post failed'});
			});
		}
		$scope.toggle = function (name, index) {
			$scope[name+index] = !$scope[name+index];
		}
		$scope.isToggled = function (name, index) {
			return $scope[name+index];
		}
		// Set $scope fields
		if (!$scope.volume) $scope.volume = VolumeModel.get({id:$routeParams.volumeId});
		if (!$scope.volume.childVolumes) $scope.volume.getChildren($routeParams.volumeId);
		if (parseInt($routeParams.volumeId) && !$scope.posts) $scope.loadAnotherPage();
		$scope.header.stylesheet = "/volumes/"+$routeParams.volumeId+".css";
		$scope.volume.$promise.then(function () {
			$scope.reversePagePlacement = ($scope.volume.max_posts || $scope.volume.max_age);
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
	.controller('PostCtrl', ['$scope', '$resource', 'DateFmtOpts', '$sce', 'PostModel', function ($scope, $resource, DateFmtOpts, $sce, PostModel) {
		$scope.ckeditOff = function () {
			$scope.ckeditor.destroy();
			delete $scope.ckeditor;
		}
		$scope.ckedit = function () {
			// http://docs.cksource.com/ckeditor_api/symbols/CKEDITOR.editor.html
			$scope.ckeditor = window.CKEDITOR.replace('content-'+$scope.post.id);
			$scope.ckeditor.focus();
		}
		$scope.preview = function () {
			$scope.post.content = $scope.ckeditor.getData();
			$scope.content = $sce.trustAsHtml($scope.post.content);
			$scope.ckeditOff();
		}
		$scope.save = function () {
			$scope.post.content = $scope.ckeditor.getData();
			PostModel.update($scope.post, function (data) {
				$scope.content = $sce.trustAsHtml($scope.post.content);
				$scope.ckeditOff();
				$scope.bulletin({klass:'success', text:'Post saved'});
			},
			function () {
				$scope.bulletin({klass:'alert', text:'Post failed to save'});
			})
		}
		$scope.destroy = function () {
			PostModel.delete({id:$scope.post.id},
			function () {
				var text = $scope.post.content;
				$scope.bulletin({klass:'warning', text:'Deleted post: '+text});
				var index = $scope.posts.indexOf($scope.post);
				if (index >= 0) $scope.posts.splice(index,1);
			},
			function () {
				$scope.bulletin({klass:'alert', text:'Failed to delete post'});
			});
		}
		$scope.insert = function () {
			alert('not implementd yet');
		}
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
	.controller('User.EditCtrl', ['$scope', 'UserModel', function ($scope, UserModel) {
		$scope.user = UserModel.get({id:0});
		$scope.save = function () {
			$scope.user.$update({},
			// success
			function () {
				$scope.bulletin({text:'save success', klass:'success'});
			},
			// error
			function () {
				$scope.bulletin({text:'save failed', klass:'alert'});
			});
		}
	}])
	.factory('PostModel', ['$resource', function ($resource) {
		var PostModel = $resource('/posts/:id.json', {id:'@id'}, {"update":{method:'PUT'}});
		return PostModel;
	}])
	.factory('UserModel', ['$resource', function ($resource) {
		var UserModel = $resource('/users/:id.json', {id:'@id'}, {"update":{method:'PUT'}});
		return UserModel;
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
	.directive('pedCkeditor', [function () {
		return {
			link: function (scope, elem, attrs) {
				window.CKEDITOR.replace(elem[0]);
			}
		};
	}])
	.value('DateFmtOpts', {
		weekday: "short", year: "numeric", month: "short",
    day: "numeric", hour: "2-digit", minute: "2-digit"
	})
})();
