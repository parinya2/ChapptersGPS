//Define an angular module for our app
angular.module('gpsApp', ['ngRoute'])
  .controller('HomeController', function($scope, $http) {
    
    $scope.showVehicleDetail = function(data) {            
      var latlng = {lat: parseFloat(data.Lat), lng: parseFloat(data.Lon)};
      geocoder.geocode({'location': latlng}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            jQuery('#vehicleDetailTitle').text(results[0].formatted_address);
          } else {
            window.alert('No results found');
          }
        } else {
          window.alert('Geocoder failed due to: ' + status);
        }
      });
      jQuery('#vehicleDetailModal').modal('show');
      homeGoogleMap.setZoom(16);
      homeGoogleMap.setCenter(latlng);
    };

    $scope.relocateHomeGoogleMap = function(lat, lon) {
      homeGoogleMap.setZoom(16);
      homeGoogleMap.setCenter(new google.maps.LatLng(parseFloat(lat), parseFloat(lon)));
    };

    $scope.drawMarkerOnHomeGoogleMap = function(gpsDataList) {
      homeGoogleMap = new google.maps.Map(document.getElementById('homeGoogleMap'));       
      for (var i in gpsDataList) {
        var lat = gpsDataList[i].Lat;
        var lon = gpsDataList[i].Lon;
        var center = new google.maps.LatLng(parseFloat(lat), parseFloat(lon));        
        homeGoogleMap.setCenter(center)
        
        var marker=new google.maps.Marker({position:center});
        marker.setMap(homeGoogleMap);
      }
      homeGoogleMap.setZoom(12);
      homeGoogleMap.setMapTypeId(google.maps.MapTypeId.ROADMAP);
    }

    $scope.getAddressFromLatLon = function(latStr, lonStr) {
      var latlng = {lat: parseFloat(latStr), lng: parseFloat(lonStr)};
      geocoder.geocode({'location': latlng}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            console.log('addr: ' + results[0].formatted_address);
            return results[0].formatted_address;
          } else {
            window.alert('No results found');
          }
        } else {
          window.alert('Geocoder failed due to: ' + status);
        }
      });
      return "";
    }

    $scope.mergeJSONByDeviceID = function(deviceList, gpsList) {
      var result = [];
      var keyDeviceID = 'DeviceID';
      var keySpeed = 'Speed';
      var keyAddress = 'Address';
      var keyStatus = 'Status';      
      var keyLat = 'Lat';
      var keyLon = 'Lon';
      var keyLicensePLate = 'LicensePlate';
      var keyDriver = 'Driver';

      for (var i = 0; i < deviceList.length; i++) {
        var deviceObj = deviceList[i];
        var deviceID = deviceObj[keyDeviceID];
        
        for (var k = 0; k < gpsList.length; k++) {
          var gpsObj = gpsList[k];
          var gpsDeviceID = gpsObj[keyDeviceID];
          
          if (deviceID == gpsDeviceID) {
            var newObj = {};
            newObj[keyDeviceID] = gpsObj[keyDeviceID];
            newObj[keySpeed] = gpsObj[keySpeed];
            newObj[keyAddress] = gpsObj[keyAddress];
            newObj[keyStatus] = gpsObj[keyStatus];
            newObj[keyLat] = gpsObj[keyLat];
            newObj[keyLon] = gpsObj[keyLon];
            newObj[keyLicensePLate] = deviceObj[keyLicensePLate];
            newObj[keyDriver] = gpsObj[keyDriver];

            result.push(newObj);  
            break;
          }
        }        
      }

      return result;
    }

    selectMenu(0);

    if (deviceListData.length == 0) {
      $http.get("http://127.0.0.1:8080/gps-tracker-web/data-json/device-list-data.json")
        .success(function(deviceResponse) {
        deviceListData = deviceResponse;
        
        $http.get("http://127.0.0.1:8080/gps-tracker-web/data-json/gps-data.json")
          .success(function(gpsResponse) {
            var mergedData = $scope.mergeJSONByDeviceID(deviceListData, gpsResponse);
            $scope.allData = mergedData;
            $scope.drawMarkerOnHomeGoogleMap(mergedData);
          }) 
      })
    } else {
      $http.get("http://127.0.0.1:8080/gps-tracker-web/data-json/gps-data.json")
        .success(function(gpsResponse) {
          var mergedData = $scope.mergeJSONByDeviceID(deviceListData, gpsResponse);
          $scope.allData = mergedData;
          $scope.drawMarkerOnHomeGoogleMap(mergedData);
        })      
    }

  }) 
  .controller('HistoryController', function($scope, $http) {

    $scope.chooseVehicleDropDown = function(index) {
      jQuery('#historyVehicleDropdownText').text(index);
    }

    $scope.initHistoryGoogleMap = function() {
      historyGoogleMap = new google.maps.Map(document.getElementById('historyGoogleMap')); 
      historyGoogleMap.setZoom(16);
      historyGoogleMap.setMapTypeId(google.maps.MapTypeId.ROADMAP);
      
      var center = new google.maps.LatLng(13.770000, 100.620000);
      historyGoogleMap.setCenter(center)
    }

    $scope.drawFuelGraph = function() {
      var randomScalingFactor = function(){ return Math.round(Math.random()*100)};
      var lineChartData = {
        labels : ["January","February","March","April","May","June","July"],
        datasets : [
          {
            label: "My Second dataset",
            fillColor : "rgba(151,187,205,0.2)",
            strokeColor : "rgba(151,187,205,1)",
            pointColor : "rgba(151,187,205,1)",
            pointStrokeColor : "#fff",
            pointHighlightFill : "#fff",
            pointHighlightStroke : "rgba(151,187,205,1)",
           data : [randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor()]
          }
        ]
      }

      var ctx = document.getElementById("historyFuelCanvas").getContext("2d");
      var chart = new Chart(ctx).Line(lineChartData, {
        responsive: true
      });    
    }

    selectMenu(1);

    if (deviceListData.length == 0) {
      $http.get("http://127.0.0.1:8080/gps-tracker-web/data-json/device-list-data.json")
        .success(function(response) {
          $scope.deviceList = response;
          deviceListData = response;      
      })
    } else {
      $scope.deviceList = deviceListData;      
    } 

    jQuery(function () {

      jQuery('#historyStartDateTimePicker').datetimepicker({
        //locale: 'th'
      });
      jQuery('#historyEndDateTimePicker').datetimepicker({
        //locale: 'th',
        useCurrent: false 
      });
      
      jQuery("#historyStartDateTimePicker").on("dp.change",function (e) {
          jQuery('#historyEndDateTimePicker').data("DateTimePicker").minDate(e.date);
      });
      jQuery("#historyEndDateTimePicker").on("dp.change",function (e) {
          jQuery('#historyStartDateTimePicker').data("DateTimePicker").maxDate(e.date);
      });
    });

    
    $scope.drawFuelGraph();
    $scope.initHistoryGoogleMap();
  })
  .controller('SettingController', function($scope) {
    $scope.message = 'This is SettingController';
    selectMenu(2);
  })
  .controller('NavBarController', function($scope) {
    $scope.logout = function() {
      window.location.href = './login.html';
    }
  })
  .config(['$routeProvider',
    function($routeProvider) {
      $routeProvider.
        when('/home', {
          templateUrl: 'templates/home.html',
          controller: 'HomeController'
        }).
        when('/history', {
          templateUrl: 'templates/history.html',
          controller: 'HistoryController'
        }).
        when('/setting', {
          templateUrl: 'templates/setting.html',
          controller: 'SettingController'
        }).
        otherwise({
          redirectTo: '/home'
        });
  }]);