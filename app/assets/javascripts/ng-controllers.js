function browserNotify(title, options) {
	if (!("Notification" in window)) {
    console.warn("This browser does not support desktop notification");
  } else if (Notification.permission === "granted") {
    new Notification(title, options);
    return true;
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(title, options);
	      return true;
      }
    });
	}
  return false;
}

(function(){
	DEFAULT_POSTS_PER_PAGE = 100; // this value must be the same as in volumes#posts

	angular.module('MyNgControllers', [])
	.controller('LogInCtrl', ['$scope', '$http', function ($scope, $http) {
		$scope.user = { remember_me: true };
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
		$scope.sendPwRecoveryEmail = function () {
			$http.post('/users/password.json', {user:$scope.user})
			.then(function () {
				$scope.bulletin({klass:'success', text:'Right on. Check your email for a reset link.'});
				$scope.recoveryEmailSent = true;
			}, function (data, status, headers, config) {
				console.error(data, status);
				$scope.bulletin({klass:'alert', text:'Password reset request failed. Check your javascript console for details.'});
			});
		};
	}])	
	.controller('UserControlPanelCtrl', ['$scope', function ($scope) {
		$scope.userCpIsCollapsed = true;
		if (!$scope.ux) $scope.ux = {};
		$scope.ux.showScrollButtons = !!parseInt(localStorage.getItem("showScrollButtons"));
		$scope.$watch("ux.showScrollButtons", function (newVal, oldVal) {
			localStorage.setItem("showScrollButtons", newVal ? 1 : 0);
		});
		const storedPollUpdatesSetting = localStorage.getItem("pollUpdates");
		const isMobileBrowser = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
		if (storedPollUpdatesSetting == null && !isMobileBrowser)
			$scope.ux.pollUpdates = true;
		else
			$scope.ux.pollUpdates = !!parseInt(storedPollUpdatesSetting);
		$scope.$watch("ux.pollUpdates", function (newVal, oldVal) {
			localStorage.setItem("pollUpdates", newVal ? 1 : 0);
		});
		$scope.scrollTop = function () { window.scrollTo(0,0) }
		$scope.scrollEnd = function () { window.scrollTo(0,document.body.scrollHeight) }
	}])
	.controller('TopCtrl', ['$scope', '$resource', '$routeParams', '$sce', function ($scope, $resource, $routeParams, $sce) {
		$scope.header = new Object;
	}])
	.controller('VolumeCtrl', ['$scope', '$resource', '$routeParams', '$sce', 'VolumeModel', 'PostModel', '$rootScope', function ($scope, $resource, $routeParams, $sce, VolumeModel, PostModel, $rootScope) {
		const ctrlState = {};

		function loadPosts($scope, params, opts) {
			// return if we're waiting on a response already
			if ($scope.posts && $scope.posts.$promise) return;

			if (!$scope.page) $scope.page = 0;
			if (!$scope.posts) $scope.posts = [];
			if (!opts) opts = {};
			if (opts.clear) {
				$scope.posts = [];
				$scope.firstPageLoaded = false;
				$scope.lastPageLoaded = false;
			}
			params.volumeId = $routeParams.volumeId;
			if (!params.per_page) params.per_page = params.n || 100;
			// Perform request
			const posts = $resource('/volumes/:volumeId/posts.json').query(params);
			// Handle promise for request
			$scope.posts.$promise = posts.$promise;
			posts.$promise.then(function(data){
				// This assumes data from the back end will be sorted appropriately, whether according to idx or created_at
				const isBefore = !!params.before || !!params.before_post_id;
				$scope.posts = isBefore ? data.concat($scope.posts) : $scope.posts.concat(data);
				if (data.length < params.per_page) {
					$scope[isBefore ? 'firstPageLoaded' : 'lastPageLoaded'] = true;
				}
			});
			posts.$promise.finally(function(){
				delete $scope.posts.$promise;
			});
			return posts;
		}

		function schedulePollForNewPosts(delayMillisec) {
			ctrlState.pollUpdatesTimer = setTimeout(() => {
				if (!$scope.lastPageLoaded) {
					// Don't poll b/c the reader is not at the end of the volume anyway.
					schedulePollForNewPosts(600000);
					return;
				}
				$scope.loadNewPosts(true).$promise.then((data) => {
					// Schedule next poll
					if (data.length)
						delayMillisec = 500;
					else
						delayMillisec = Math.min(300000, Math.round(delayMillisec*2));
					schedulePollForNewPosts(delayMillisec);
					// Notify
					if (data.length) browserNotify(
						`Duck of Doom loaded ${data.length} posts`,
						{ icon: window.location.origin+'/favicon.svg' }
					);
				})
			}, delayMillisec);
		}

		// Request posts that were created after the newest post in the current view
		$scope.loadNewPosts = function (noBulletin) {
			// return if we're awaiting a response already
			if ($scope.posts && $scope.posts.$promise) return;
			if (!$scope.posts) $scope.posts = [];
			var timestamp = $scope.posts.length && $scope.posts.reduce((prev, cur, index, array) => {
				if (!prev.created_at) return cur.created_at;
				if (!cur.created_at)  return prev.created_at;
				var p = prev.created_at = new Date(prev.created_at);
				var c = cur.created_at  = new Date(cur.created_at);
				return p < c ? c : p;
			});
			var params = { id:$routeParams.volumeId, after:new Date(timestamp).toISOString() };
			var posts = $resource('/volumes/:id/posts.json').query(params);
			$scope.posts.$promise = posts.$promise;
			posts.$promise.then(function(data){
				if (data.length) {
					$scope.bulletin({klass:'success', text:'Polled server. '+data.length+'new posts'});
					var promise = $scope.posts.$promise;
					$scope.posts = $scope.posts.concat(data);
					$scope.posts.$promise = promise;
					// Sort entire posts array (if any addition was made)
					if ($scope.volume.max_age)
						$scope.posts.sort(function(a, b){
							return new Date(a.created_at) - new Date(b.created_at);
						});
					else
						$scope.posts.sort(function(a, b){
							return a.idx - b.idx;
						});
				}
				else if (!noBulletin)
					$scope.bulletin({klass:'info', text:'Polled server. No updates for page'});
			});
			posts.$promise.finally(function(){
				delete $scope.posts.$promise;
			});
			return posts;
		}
		$scope.loadPostsAfter = function (params, post, opts) {
			if (post)
				params.after_post_id = post.id;
			else if ($scope.posts.length)
				params.after_post_id = $scope.posts[$scope.posts.length-1].id;
			return loadPosts($scope, params, opts);
		};
		$scope.loadPostsBefore = function (params, post, opts) {
			if (post)
				params.before_post_id = post.id;
			else if ($scope.posts.length)
				params.before_post_id = $scope.posts[0].id;
			else
				params.before = new Date();
			return loadPosts($scope, params, opts);
		};
		$scope.searchPosts = function (params) {
			params.after = $scope.search.after;
			params.before = $scope.search.before;
			params.search = $scope.search.text;
			loadPosts($scope, params, {clear: true});
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
			function (xhr) {
				let msg = 'Post failed';
				if (xhr.data && xhr.data.errors)
					msg += '. ' + xhr.data.errors.join('. ');
				$scope.bulletin({klass: 'alert', text: msg});
			});
		}
		$scope.toggle = function (name, index, state) {
			if (state == null) state = !$scope[name+index];
			$scope[name+index] = state;
		}
		$scope.isToggled = function (name, index) {
			return $scope[name+index];
		}
		$scope.sortPosts = function () {
			if ($scope.volume.insertions)
				$scope.posts.sort(function(a,b){
					return (b.idx||0) - (a.idx||0);
				});
			else
				$scope.posts.sort(function(a,b){
					return b.created_at - a.created_at;
				});
		}
		$scope.$watch('ux.pollUpdates', (newVal, oldVal) => {
			clearInterval(ctrlState.pollUpdatesTimer);
			if (newVal) schedulePollForNewPosts(30000); // 5 minutes
		});
		// Set $scope fields
		$scope.state = { showTools: false };
		$scope.search = { before: undefined, after: undefined, text: undefined };
		if (!$scope.volume) {
			if (parseInt($routeParams.volumeId))
				$scope.volume = VolumeModel.get({id:$routeParams.volumeId});
			else {
				$scope.volume = new VolumeModel({
					description: '<h1>The Pedestrian Site</h1><p>Beware the Pedestrian...</p>',
					anthology: true,
					'$promise': $scope.buildDummyPromise(),
				});
				$scope.homePage = true;
			}
		}
		if (!$scope.volume.childVolumes) $scope.volume.getChildren($routeParams.volumeId);
		if (parseInt($routeParams.volumeId) && !$scope.posts) loadPosts($scope, {});
		$scope.header.stylesheet = "/volumes/"+$routeParams.volumeId+".css";
		$scope.volume.$promise.then(function () {
			$scope.reversePagePlacement = ($scope.volume.max_posts || $scope.volume.max_age);
			$scope.updatedBy = $sce.trustAsHtml($scope.volume.updated_by_name);
			$scope.title = $sce.trustAsHtml($scope.volume.title_html) || $scope.volume.title;
			$scope.description = $sce.trustAsHtml($scope.volume.description);
			if ($scope.volume.max_age || $scope.volume.max_posts)
				$scope.lastPageLoaded = true;
			else
				$scope.firstPageLoaded = true;
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
			$scope.ckeditor.addCommand('submit', {
				exec: function (editor, data) {
					$scope.save();
				}
			});
			$scope.ckeditor.keystrokeHandler.keystrokes[window.CKEDITOR.CTRL + 83] = 'submit';
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
				$scope.toggle('Dropdown',$scope.post.id)
				$scope.bulletin({klass:'success', text:'Post saved'});
			},
			function () {
				$scope.bulletin({klass:'alert', text:'Post failed to save'});
			})
		}
		$scope.destroy = function () {
			if (confirm("Are you sure you want to delete post "+$scope.post.id+"?"))
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
		$scope.openInsert = function () {
			$scope.showInsertForm = true;
			$scope.insCkeditor = window.CKEDITOR.replace('ins-content-'+$scope.post.id);
			$scope.insCkeditor.focus();
		}
		$scope.content = $sce.trustAsHtml($scope.post.content);
		$scope.author = $sce.trustAsHtml($scope.post.user_name);
		$scope.timestamp = new Date($scope.post.created_at).toLocaleTimeString("en-gb", DateFmtOpts);
	}])
	.controller('Post.InsertCtrl', ['$scope', 'PostModel', function ($scope, PostModel) {
		$scope.insertForm = new PostModel({volume_id:$scope.volume.id, idx:$scope.post.idx});
		$scope.closeInsert = function () {
			$scope.showInsertForm = false;
			$scope.toggle('Dropdown', $scope.post.id, false);
			$scope.insertForm.content = $scope.insCkeditor.getData();
			$scope.insCkeditor.destroy();
		}
		$scope.createInsert = function () {
			$scope.insertForm.$save({content:$scope.insCkeditor.getData()},
			function (data, headers) {
				$scope.insCkeditor.setData('');
				var newPost = angular.extend(angular.extend({},$scope.insertForm));
				var iFollowing = $scope.posts.indexOf($scope.post);
				$scope.posts.splice(iFollowing, 0, newPost);
				$scope.bulletin({klass:'success', text:'Post inserted'});
				$scope.closeInsert();
			},
			function (httpResponse) {
				var msg = 'Post insertion failed.';
				if (httpResponse.body.errors) msg += ' ' + httpResponse.body.errors;
				$scope.bulletin({klass:'alert', text:msg});
			});
		}
	}])
	.controller('Volume.FormCtrl',  ['$scope', '$resource', '$routeParams', '$sce', function ($scope, $resource, $routeParams, $sce) {
		$scope.save = function () {
			var fn = $scope.volume.id ? '$update' : '$save';
			$scope.volume[fn](
			function(data, headers){
				$scope.bulletin({text:'Volume '+data.id+' saved', klass:'success'});
			},
			function(response){
				console.error(response);
				alert('failed to save volume');
			});
		}
	}])
	.controller('Volume.NewCtrl',  ['$scope', '$resource', '$routeParams', 'VolumeModel', function ($scope, $resource, $routeParams, VolumeModel) {
		$scope.volume = new VolumeModel({parent_id:$routeParams.parent_id});
	}])
	.controller('Volume.EditCtrl', ['$scope', '$resource', '$routeParams', '$sce', 'VolumeModel', function ($scope, $resource, $routeParams, $sce, VolumeModel) {
		$scope.volume = VolumeModel.get({id:$routeParams.volumeId});
		$scope.parentVol = new Object;
		$scope.refreshOtherVolumes = function (searchTerm) {
			$scope.otherVolumes = $resource('/volumes.json').query({title:searchTerm});
		}
		$scope.selectParentVol = function (item, model) {
			$scope.volume.parent_id = item.id;
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
				if (!window.CKEDITOR.env.isCompatible && /Android/.test(window.navigator.userAgent)) {
					window.CKEDITOR.env.isCompatible = true;
				}
				var editor = window.CKEDITOR.replace(elem[0]);
				editor.addCommand('submit', {
					exec: function (editor, data) {
						scope.createPost();
					}
				});
				editor.keystrokeHandler.keystrokes[window.CKEDITOR.CTRL + 83] = 'submit';
			}
		};
	}])
	.value('DateFmtOpts', {
		weekday: "short", year: "numeric", month: "short",
    day: "numeric", hour: "2-digit", minute: "2-digit"
	})
})();
