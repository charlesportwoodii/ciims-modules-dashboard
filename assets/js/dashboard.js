var Dashboard = {

	// The list of cards, populated by DashboardController::actionIndex
	cards: {},

	// The properties for each card, as loaded from the database
	cardData: {},

	// Card API endpoint
	endpoint: null,

	/**
	 * Init method
	 */
	init: function(endpoint) {
		this.endpoint = endpoint;
		var self = this;			

		// Create the global object if it hasn't been created yet
		if (typeof window.cards == "undefined")
			window.cards = {};

		$.ajax({
			url: window.location.origin + '/api/card',
			type: 'GET',
			headers: CiiMSDashboard.getRequestHeaders(),
			beforeSend: CiiMSDashboard.ajaxBeforeSend(),
			success: function(data, textStatus, jqXHR) {
				self.cards = data.response.cards;
				self.cardData = data.response.cardData;
				// If no cards are installed, flash the add icon
				if ($.isEmptyObject(self.cards) || self.cards.length == 0)
					$("section#secondary-navigation ul#secondary-nav-items li a").addClass("pulse");
				else
					self.renderCards();
			},
			completed: CiiMSDashboard.ajaxCompleted()
		});

		self.rearrange();
		self.addCard();
	},

	/**
	 * Behavior for adding a new card
	 */
	addCard: function() {
		var self = this;
		$("a#installCardButton").click(function() {
			$(".card-list section.card-details").empty();
			$(".paginated_results ul li").unbind("click");

			$.ajaxSetup({ cache: true });
			$.getJSON(self.endpoint+'/index.json', function(data) {
				$.ajaxSetup({ cache: false });
				$(".paginated_results.contained ul").empty();
				// Append the name to the list
				$.each(data, function(name, obj) {
					var li = $("<li>"),
						info = $("<div>");

					$(info).addClass("user-info");
					$(info).append($("<h6>").text(name));
					$(li).append($(info));
					$(li).attr("name", name).attr("version", obj["version"]);
					$(".paginated_results.contained ul").append($(li));
				});

				self.bindLiClickBehavior();

				// Show the container
				$(".card-list").toggleClass("visible");
				$(".shader").toggleClass("visible");
				self.nanoscroller();
			});
		});

		$(".shader").click(function() {
			$(this).removeClass("visible");
			$(".card-list").removeClass("visible");
		})
	},

	/**
	 * Specialized click behavior for the paginated_results list item
	 */
	bindLiClickBehavior: function() {
		var self = this,
			container = $(".card-list section.card-details");

		$(".paginated_results ul li").click(function() {
			// Remove the active class from the other attributes
			$(".paginated_results ul li").removeClass("active");
			$(this).addClass("active");
			$(container).empty();

			var url = self.endpoint + "/" + $(this).attr("name") + "/" + $(this).attr("version");

			// Load the card.json data and render the details pane
			$.ajaxSetup({ cache: true });
			$.getJSON(url+"/card.json", function(data) {
				$.ajaxSetup({ cache: true });

				var nano = $("<div>").addClass("nano"),
					nanoContent = $("<div>").addClass("nano-content"),
					header = $("<header>"),
					inner = $("<div>"),
					img = $("<img>"),
					title = $("<span>").text(data.name),
					btn = $("#card-install-button").clone().show().attr("url", url),
					divider = $("<div>").addClass("divider"),
					p = $("<p>").text(data.description);

				$(header).append($(title)).append($(btn));
				if (typeof data.image != "undefined")
				{
					$(img).attr("src", url+"/"+data.image);
					$(inner).append($(img)).append($(divider));
				}

				$(inner).append($(p));

				$(nanoContent).append($(inner));
				$(nano).append($(nanoContent));
				$(container).append($(header)).append($(nano));
				self.nanoscroller();

				// Bind the click behavior to install the card
				$("#card-install-button").click(function(e) {
					e.preventDefault();
					var url = $(this).attr("url");
					self.installCard(url);
				})
			});
		});
	},

	/**
	 * HAndles the re-arrangement
	 */
	rearrange: function() {
		var self = this;

		$(".dashboard-cards").on("ss-rearranged", function() {
        	var cards = {};
        	$(".dashboard-cards > .ss-active-child").each(function() {
        		var id = $(this).attr("id");
        		cards[id] = self.cards[id];
        	});

        	// Card re-arrangement didn't happen
        	if (JSON.stringify(cards) == JSON.stringify(self.cards))
        		return;

        	$.ajax({
				url: window.location.origin + '/api/card/rearrange',
				type: 'POST',
				data: { "cards": cards },
				headers: CiiMSDashboard.getRequestHeaders(),
				beforeSend: CiiMSDashboard.ajaxBeforeSend(),
				success: function(data, textStatus, jqXHR) {
					self.cards = cards
				},
				completed: CiiMSDashboard.ajaxCompleted()
			});
        })
	},

	/**
	 * Success callback for the card-renderer
	 */
	renderCards: function() {
		var self = this,
			i=0;

		// Iterate through all the cards in the database, and populate them
		$.each(self.cards, function(id, url) {
			i++;
			setTimeout(function() {
				self.renderCard(id, url, false);
			}, 250*i);
		});
	},

	/**
	 * Renders a single instance of a card
	 * @param  string   id  The card ID
	 * @param  string   url The URL of the card
	 */
	renderCard: function(id, url, reload) {
		var self = this;
		$.ajaxSetup({ cache: true });
		$.getJSON(url + "/card.json", function(data) {
			$.ajaxSetup({ cache: false });
			data.basePath = url;
			data.id = id;

			// Set the card properties if they are provided
			if (self.cardData[id] != null)
			{
				data.size = self.cardData[id].size;
				if (!$.isEmptyObject(self.cardData[id].properties))
				{
					$.each(self.cardData[id].properties, function(key, obj) {
						data.properties[key].value = obj;
					});
				}
			}

			// Add this card to the global cards object container
			window.cards[id] = new Card(data);
			window.cards[id].render(reload);
		});
	},

	/**
	 * Installs a new card
	 * @param  {[type]} url [description]
	 * @return {[type]}     [description]
	 */
	installCard: function(url, id) {
		var self = this,
			reload = false;

		if (typeof id == "undefined")
			id = self.generateUniqueID();
		else
			reload = true;

		$.ajaxSetup({ cache: true });
		$.getJSON(url + "/card.json", function(data) {
			$.ajaxSetup({ cache: false });
			var properties = {};

			if (!$.isEmptyObject(data.properties))
			{
				$.each(data.properties, function(key, obj) {
					properties[key] = obj["value"];
				});
			}

			var details = {
				"size": data.availableTileSizes[0],
				"properties": properties
			}

			$.ajax({
				url: window.location.origin + '/api/card/index',
				type: 'POST',
				data: {
					"id": id,
					"url": url,
					"details": details
				},
				headers: CiiMSDashboard.getRequestHeaders(),
				beforeSend: CiiMSDashboard.ajaxBeforeSend(),
				success: function(data, textStatus, jqXHR) {
					self.cards[id] = url;
					self.cardData[id] = details;
					self.renderCard(id, url, reload);
					// Remove the flashing icon if the card installed
					$("section#secondary-navigation ul#secondary-nav-items li a").removeClass("pulse");
					$(".card-list").removeClass("visible");
					$(".shader").removeClass("visible");
				},
				completed: CiiMSDashboard.ajaxCompleted()
			});
		}).fail(function() {
			console.log("card installation failed");
		})
	},

	/**
	 * Performs an in place upgrade of a card
	 * @param string id
	 */
	upgrade: function(id) {
		var card = window.cards[id],
			newBasePath = this.endpoint + "/" + card.options.name + "/" + card.upgradeVersion;

		// Run the install script with this card ID as the base ID
		this.installCard(newBasePath, id);
	},

	/**
	 * Generates a unique ID for each card to use
	 * @return string
	 */
	generateUniqueID: function() {
		return Math.random().toString(36).slice(2);
	},

	/**
	 * Nanoscrollers function
	 */
	nanoscroller : function() {
		return $(".nano").nanoScroller({ iOSNativeScrolling: true }); 
	}
};
