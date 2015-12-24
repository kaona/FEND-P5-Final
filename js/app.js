var vm;
var map = document.getElementById ('map');



var viewModel = function () {

      
  var self = this;

  // non-observable array to show objects coming from Firebase DB.
  self.placeArray = [];
  
  // observable data object to make objects show object coming from Firebase.
  
  self.placeList = ko.observableArray();

  // build google map object. infowindow is function that shows data you want shown when clicking a map marker.

  self.googleMap = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 18.5128958, lng: -72.2939841},
    zoom: 15
    });

  infowindow = new google.maps.InfoWindow();

  // get data from Pages Jaunes Haiti database, push to placeArray []
  var ref = new Firebase("https://crackling-fire-1105.firebaseio.com/business");

  // get data from firebase.
  function searchbiz() {
  ref.orderByChild("city").equalTo("Pétion-Ville").on("child_added", function(snapshot) {
      if (snapshot.val().hasOwnProperty('name') && snapshot.val().hasOwnProperty('latitude')) {
           var place = { accountid: snapshot.val().accountid, name: snapshot.val().name,
                   latLng: {lat: snapshot.val().latitude, lng: snapshot.val().longitude},
                 };
          //push data to array placeArray
          self.placeArray.push(new Place(place));       
          //push data to observable array placeList
          self.placeList.push(place);
      }
  // Attach an asynchronous callback to read the data at our posts reference
    }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
    });
  }
  searchbiz();
  
  // Create a marker for each Place via the google maps api. The call takes a latlng and map id property at least.
  // Adds click event listener, animation and infowindow data
  // https://developers.google.com/maps/documentation/javascript/markers

 function Marker(place) {
    place.marker = new google.maps.Marker({
      accountid: place.accountid,
      map: self.googleMap,
      name: place.name,
      position: place.latLng,
      animation: google.maps.Animation.DROP
    });

    place.marker.addListener('click', toggleBounce);
    function toggleBounce() {
      if (place.marker.getAnimation() !== null) {
      place.marker.setAnimation(null);
      } else {
      place.marker.setAnimation(google.maps.Animation.BOUNCE);
      }
    }
     
    var contentString = '<div>' + place.name + '</div>';
    google.maps.event.addListener(place.marker, 'click', function() {      
      infowindow.setContent(contentString);      
      infowindow.open(self.googleMap, this);
      place.marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function(){place.marker.setAnimation(null);}, 1450);
    });
    return place.marker;
  };

  self.userInput = ko.observable(''); 

  self.search = function() {
  // remove all the current locations, which removes them from the view
  // set results of search to variable and make lowercase so that
  // it can be used to search the array. Be sure to use the 
  // KO () indicator after it since userInput is an observable array.
    var searchInput = self.userInput().toLowerCase();

    self.placeList.removeAll();

    self.placeArray.forEach(function(place) {
      place.marker.setVisible(false);
    
      if(place.name.toLowerCase().indexOf(searchInput) >= 0) {
        self.placeList.push(place);
      }
    });
     
    self.placeList().forEach(function(place) {
      place.marker.setVisible(true);
    });     
  };

  function Place(data) {
    this.accountid = data.accountid;
    this.name = data.name;
    this.latLng = data.latLng;
    this.marker = Marker(data);
    this.contentString = '<div><strong>' + this.name + '</strong></div>';
  }

  bounceUp = function(place) {
      google.maps.event.trigger(place.marker, 'click');
      console.log(place.marker);
  }
};

vm = new viewModel();

ko.applyBindings(vm);




