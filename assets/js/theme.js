var Theme = {
	
	/**
	 * CiiMS's data information
	 * @var array ciims
	 */
	ciims : {},

	init : function() {
		Settings.nanoscroller();

		this.ciims = $.parseJSON(localStorage.getItem('ciims'));

		$(".theme-details").readmore({
			maxHeight: 300
		});

		hljs.initHighlightingOnLoad();

		this.checkforUpdates();
		this.update();
		this.changeTheme();
	},

	/**
	 * Checks if an update is available for a theme and provides actionalable feedback to the end user
	 */
	checkforUpdates : function() {
		var self = this;
		$(".updater").each(function() {
			var name = $(this).attr('data-attr-name');
			var btn = this;

			$.ajax({
				url: window.location.origin + '/api/theme/updateCheck/name/'+name,
				type: 'GET',
				headers: {
					'X-Auth-Email': self.ciims.email,
					'X-Auth-Token': self.ciims.token
				},
				success : function(data) {
					if (data.response)
					{
						$(btn).hide();
						$(btn).parent().find('.update-available').show();
					}
					else
					{
						$(btn).hide();
						$(btn).parent().find('.uptodate').show();
					}

				}
			});
		});
	},

	/**
	 * Attempts to apply an update to the theme
	 */
	update : function() {
		var self = this;
		$(".update-available").click(function() {
			var name = $(this).attr('data-attr-name');
			var btn = this;

			$.ajax({
				url: window.location.origin + '/api/theme/update/name/'+name,
				type: 'GET',
				headers: {
					'X-Auth-Email': self.ciims.email,
					'X-Auth-Token': self.ciims.token
				},
				success : function(data) {
					$(btn).hide();
					$(btn).parent().find('.uptodate').show();
				},
				error : function() {
					$(btn).hide();
					$(btn).parent().find('.updatefailed').show();
				}
			});
		});
	},

	changeTheme : function() {
		var self = this;
		$(".usetheme").click(function() {
			var name = $(this).attr('data-attr-name');
			var btn = this;

			$.ajax({
				url: window.location.origin + '/api/theme/changetheme/name/'+name,
				type: 'GET',
				headers: {
					'X-Auth-Email': self.ciims.email,
					'X-Auth-Token': self.ciims.token
				},
				success : function(data) {
					var activeTheme = $(".activetheme").clone();
					$(".activetheme").hide();

					$(btn).hide();
					$(btn).after($(activeTheme));
				}
			});
		});
	}
};