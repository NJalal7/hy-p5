//intial namespace
var wineApp = {};

//wineApp init
wineApp.init = function(){
	// console.log(wineApp.getWine(1));
	wineApp.getPECList();
	wineApp.smoothScroll();
	wineApp.addFilterListener();
	wineApp.addUpdateOnScrollListener();
	wineApp.addSelectionListener();
	$("#mapContainer").toggleClass("show");
	wineApp.myMap();
}

//Variables for the KEY!!!
wineApp.key = 'MDo5MTFjNGNlMi00NGI5LTExZTctYTg1Ni04M2EzZGQxMDM2Zjg6WUN3NUFvVFV6Qno5RzhPZW9nZFhtN05SQTR6elRTbGRVdlBY';
//Variable for VQA Wines
wineApp.vqa = 'is_vqa';
//Variable for just current wines
wineApp.whereNot = 'is_dead,is_discontinued';
//Array for the VQA Wine List
wineApp.wineList = [];
//Array for the PEC Winery List
wineApp.wineryList = [];
//Array for user Wine Selections
wineApp.selections = [];
//Array for filtering the Wine Types
wineApp.currentFilters = ["Red Wine", "White Wine", "Sparkling Wine", "Rosé Wine", "Dessert Wine"];
//This is for how many get appended at first.
wineApp.wineListIndex = 9;


// this will get the list of PEC wineries from sheetsu
wineApp.getPECList = function() {
	$.when(wineApp.getPEC())
	.then(function(resp) {
		resp = resp.map(n => n["Winery Name"]);
		wineApp.wineryList.push(...resp);
		wineApp.getAllWines(1); // beginning of chained ajax calls
	});
}

// if the producer name is in the list of wineries, return true
wineApp.filterPEC = function(item) {
	// console.log(item);
	if (wineApp.wineryList.includes(item.producer_name)) {
		console.log(item);
		return true;
	}
	return false;
}

// this is an api call to sheetsu
wineApp.getPEC = function() {
	return $.ajax({
		url: 'https://sheetsu.com/apis/v1.0/5ba5cb2993e7',
		method: 'GET'
	})
}

// this will recursively call the get wine app with increasing page numbers until no more wines are left
wineApp.getAllWines = function(n) {
	$.when(wineApp.getWine(n))
	.then(function(resp) {
		if (resp.result.length != 0) {
			wineApp.wineList.push(...resp.result);
			wineApp.getAllWines(n+1);
		}
		else {
			// last step: this will filter for all of the wines in PEC 
			wineApp.wineList = wineApp.wineList.filter(wineApp.filterPEC);
			for (var i = 0; i < wineApp.wineListIndex; i++) {
				wineApp.displayWine(wineApp.wineList[i]);
			}
			return;
		}
	});
}

// this is an api call to lcbo with a specific page number
// this gets 100 wines at a time
wineApp.getWine = function(pageNum) {
	return $.ajax({
		url: 'https://lcboapi.com/products',
		method: 'GET',
		dataType: 'json',
		data: {
			access_key: wineApp.key,
			per_page: 100,
			page: pageNum,
			where: wineApp.vqa,
			where_not: wineApp.whereNot,
			volume_in_milliliters: 750
		}
	});
}

wineApp.filterResults = function() {
	return;
}



//This is to separate out each wine.
wineApp.getEachWine = function(wines){
	wines.forEach(function(wine){
	});
}


// Display this info for each wine on the page.
//Look at that variable baby!
wineApp.displayWine = function(item) {
	if (item.image_url != undefined && item.secondary_category != undefined) {
		var temp = `<div class="wine-item" id="${item.id}" data-type="${item.secondary_category}">
						<figure class="wine-item__img">
							<img src="${item.image_url}" alt="">
							<figcation class="wine-item__info">
								<div class="p-info xy-center">
									<p>${item.producer_name}</p>
									<p>${item.package}</p>
									<p>${item.style}</p>
									<p>LCBO ID - ${item.id}</p>
									<p>${item.sugar_content}</p>
								</div>
							</figcation>
						</figure>
						<div class="wine-item__name">
							<h4 class="xy-center">${item.name}</h4>
						</div>
					</div>`
		$(".wines-inventory").append(temp);
	}
}


//Smooth Scroll
wineApp.smoothScroll = function(){
	$('.wines_smoothScroll').on('click', function(){
		$('html, body').animate({
			scrollTop: $('.wines').offset().top},
			1500);
	});
	$('.about_smoothScroll').on('click', function(){
		$('html, body').animate({
			scrollTop: $('.about').offset().top},
			1500);
	});
	$('.collection_smoothScroll').on('click', function(){
		$('html, body').animate({
			scrollTop: $('.collection').offset().top},
			1500);
	})
}


//This is to filter the selection when Clicking on of the buttons.
wineApp.addFilterListener = function() {
	$(".filter").on("click", function() {
		wineApp.currentFilters = [];
		$(this).toggleClass("filter--selected");

		if ($(this).hasClass("all")) {
			if ($(this).hasClass("filter--selected")) {
				$(".reds").removeClass("filter--selected");
				$(".whites").removeClass("filter--selected");
				$(".other").removeClass("filter--selected");
				wineApp.currentFilters = ["Red Wine", "White Wine", "Sparkling Wine", "Rosé Wine", "Dessert Wine"];
				wineApp.refreshInventory();
				return;
			}
		}
		if ($(".reds").hasClass("filter--selected")) { 
			wineApp.currentFilters.push("Red Wine"); 
		}
		if ($(".whites").hasClass("filter--selected")) { 
			wineApp.currentFilters.push("White Wine"); 
		}
		if ($(".other").hasClass("filter--selected")) { 
			wineApp.currentFilters.push("Sparkling Wine", "Rosé Wine", "Dessert Wine"); 
		}
		$(".all").removeClass("filter--selected");
		wineApp.refreshInventory();
	});
}


//This is for when the wine is "selected"
wineApp.addSelectionListener = function() {
	$(".wines-inventory").on("click", ".wine-item", function() { // event delegation
		console.log("SELECTEDYOOOO");
		$(this).toggleClass("wine-item--selected");
	});
	// wineApp.appendCollection();
}

//This is to apply the selected wines to the collection section!
// wineApp.appendCollection = function(){
// 	$(".wines-inventory").on("click", ".wine-item", function(){
// 		$('.wine-choice').append(this);
// 		$('.wine-choice').removeClass('wine-item--selected');	
// 	});
// }

//This is to append more wine choices to our Wine area. Refreshes the inventory.
wineApp.refreshInventory = function() {
	var currentInventory = $(".wine-item");
	console.log(currentInventory);
	for (var i = 0; i < currentInventory.length; i++) {
		(function(i) {
			if (wineApp.currentFilters.includes(currentInventory[i].dataset.type)) {
				$(currentInventory[i]).css("transform", "scale(1)");
				setTimeout(function() {
					console.log(currentInventory);
					$(currentInventory[i]).css("display", "block");
				}, 300);
			}
			else {
				$(currentInventory[i]).css("transform", "scale(0)");
				setTimeout(function() {
					console.log(currentInventory);
					$(currentInventory[i]).css("display", "none");
				}, 300);
			}
		})(i);
	}
}


//Adds more updates on scroll.
wineApp.addUpdateOnScrollListener = function() { // issue if the user has filter on and scrolls down but nothing corresponding to their filtered category appears
	$(window).scroll(function() {
		if (wineApp.wineListIndex <= wineApp.wineList.length) {
			if ($(window).scrollTop()+$(window).height() > $(document).height()-0) {
				console.log(wineApp.wineListIndex);
				for (var i = wineApp.wineListIndex; i < wineApp.wineListIndex+9; i++) {
					if (i >= wineApp.wineList.length) { break; }
					wineApp.displayWine(wineApp.wineList[i]);
				}
				wineApp.wineListIndex += 9;
				wineApp.refreshInventory();
			}
		}
	});
}


wineApp.mymap = L.map('mapContainer').setView([51.505, -0.09], 13);

L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW15dHNjaHUiLCJhIjoiY2ozNG5zNmJnMDFrczJ3cDY1ZmI3NXNvMiJ9.xO_RFTtsZqDPHl2EW8d0IQ', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
}).addTo(wineApp.mymap);

//Wine glass marker for winery locations
wineApp.locationIcon = L.icon({
	iconUrl: 'assets/wineMarker.svg', // Wine glass image for the map marker
	iconSize: [70, 70], // dimensions of the icon
	iconAnchor:   [15, -5], // point of the icon which will correspond to marker's location
	popupAnchor: [0, 12.5] // position of the popup relative to the icon
});

// Function to place markers for wineries on map
wineApp.placeMapMarkers = function(){
	//pulling latitude and longitude for each winery in array
	wineApp.wineryArray.forEach(function(marker) {
		var lat = marker.lat;
		var lon = marker.lon;
		//Leaflet method -> add custom marker to map at lat/longs pulled from above
		L.marker([lat, lon], {icon: wineApp.locationIcon})
		.addTo(wineApp.mymap);
	});	
}



//Document Ready!!
$(function(){
	wineApp.init();
	$('.type-it').typeIt({
     strings: ["Wine it up!", "Wines of Prince Edward County"],
     speed: 150,
     breakLines: true,
     autoStart: false
});
})



