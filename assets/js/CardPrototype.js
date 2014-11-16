;(function() {
	// CardPrototype object
	var CardPrototype;

	// Prototype options
	CardPrototype.prototype.options = {};

	/**
	 * Prototype init method
	 */
	CardPrototype.prototype.init = function() {
		if (typeof(this.options.init) == "function")
	    	this.options.init();
	}

	/**
	 * Prototype render method
	 */
	CardPrototype.prototype.render = function() {
		if (typeof(this.options.render) == "function")
	    	this.options.render();
	}

	/**
	 * Prototype reload method
	 */
	CardPrototype.prototype.reload = function() {
		if (typeof(this.options.reload) == "function")
	    	this.options.reload();
	}

	/**
	 * Constructor for all base card objects
	 * Use this class to instantiate new cards
	 *
	 * Example: ===========================================
	 * ;(function() {
	 * 		var CardName = new CardPrototype({
	 *			name: "CardName",
	 *			constructor: function() {},
	 *			init: function() {},
	 *			reload:function() {},
	 *			render: function() {}
	 *		});
	 * }(this));
	 *
	 * @param object options
	 */
	function CardPrototype(options) {
	    this.options = options;

	    if (this.options.name == "undefined")
	    {
	    	console.log("Failed to instantiate new card without name! Aborting!")
	    	return;
	    }

		// Export the object to the global namespace
		if (typeof module !== "undefined" && module !== null)
	    	module.exports = this;
	  	else
	    	window[this.options.name] = this;
	};

	// Export the object to the global namespace
	if (typeof module !== "undefined" && module !== null)
    	module.exports = CardPrototype;
  	else
    	window.CardPrototype = CardPrototype;
}(this));