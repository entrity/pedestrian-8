(function(){
	angular.module('MyNgModels', [])
	.provider('UserModelProvider', function UserModelProvider () {
		this.$get = ["$resource", function UserModelFactory ($resource) {
			var UserModel = $resource('/users/:id.json');
			Object.defineProperties(UserModel.prototype, {
				// Get or set a single permission
				can: {
					value: function (permissionName, newVal, strict) {
						var i = window.PERMISSIONS.indexOf(permissionName);
						if (newVal == null) {
							if (i < 0) throw('Unknown user permission "'+permissionName+'"');
							// JS can't do bitwise on bits higher than the 32nd for some reason,
							// so we need to chop everything down to 32 bits.
							var magnitude = Math.floor(i / 32); // how many 32-bit sequences we need to chop off
							var permissions = this['permissions_'+magnitude];
							if (!permissions) return false;
							i = i % 32;
							if (permissions & (1<<i)) return true;
							if (!strict && permissionName != 'super_edit' && this.can('super_edit')) return true;
							if (!strict && permissionName != 'super_view' && /view_/.test(permissionName) && this.can('super_view')) return true;
							return false;
						} else if (newVal) {
							this.permissions |= i;
						} else {
							this.permissions &= ~i;
						}
					}
				}
			});
			return UserModel;
		}];
	}) // end provider for UserModel
	;
})();
