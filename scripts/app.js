/**
 * Created by ARIF on 12/20/2016.
 */

(function () {
    var filePath = "http://api.timezonedb.com/v2/list-time-zone?key=LOG8R9E644IJ&format=json";
    var citySelector = $('#city');

    // Loading all city from API
    $.getJSON(filePath,{ format:"json"}).done(function (city) {
        for(var i=0; i<city.zones.length; i++){
            var cityNameInnnerHtml = city.zones[i].zoneName.split('/').pop();
            var cityNameValue = city.zones[i].zoneName;
            citySelector.append('<option value="'+cityNameValue+'">'+cityNameInnnerHtml+'</option>');
        }
    });

    // Add a city with this button click
    $('#addCityBtn').click(function () {
        if(citySelector.val() !== ''){
            var cityValue = citySelector.val();
            var cityName = citySelector.val().split('/').pop().replace(/_/g, ' ');

            // Save the city info in local Storage
            localStorage.setItem(cityName, SetJSONString(cityValue, cityName));

            // Display the added city
            $('#cities') .append(
                '<div class="col-md-4" id="'+cityName+'">' +
                '<div class="thumbnail">' +
                '<a class="btn btn-danger btn-sm pull-right" id="removeCityBtn"><span class="glyphicon glyphicon-remove"></span></a>' +
                '<h2><span class="glyphicon glyphicon-map-marker"></span>'+cityName+'</h2>' +
                '<h3><span class="glyphicon glyphicon-cloud"></span> 31 Celsius</h3>' +
                '<h3><span class="glyphicon glyphicon-time"></span> 3.00 PM</h3>' +
                '</div>' +
                '</div>'
            );
        }
        else {
            alert("You didn't select any city. Select a city and try again!");
        }

        console.log(localStorage);
    });

    // Remove city
    $(document).on('click', '#removeCityBtn', function () {
        $(this).closest('.col-md-4').remove();
    });

    // Making JSON string to save the info in Local Storage
    function SetJSONString(cityValue, cityName) {
        var jsonString = {
            "CityName": cityName,
            "CityValue": cityValue,
            "Difference": GetTimeOfCity(cityValue)
        };
        return JSON.stringify(jsonString);
    }

    // Getting differences between Client Time and Server Time
    function GetTimeOfCity(zone) {
        var difference = null;
        $.ajax({
            async:false,
            type:"get",
            url: "http://api.timezonedb.com/v2/get-time-zone",
            data: {key:"LOG8R9E644IJ",zone:zone, format:"json", by:"zone"},
            dataType:"JSON",
            success: function (response) {
                var localTime = new Date();
                var serverTime = new Date(response['formatted'].replace(/-/g, '/'));
                if((localTime.getHours()+12) === (serverTime.getHours()+12)){
                    difference = 0;
                }
                else if ((localTime.getHours()+12) > (serverTime.getHours()+12)){
                    difference =( serverTime.getHours()+12) - (localTime.getHours()+12);
                }
                else {
                    difference = (localTime.getHours()+12) - (serverTime.getHours()+12);
                }
            }
        });
        return difference;
    }


    // localStorage.clear();
    //localStorage.removeItem(key);

    // Checking the browser local storage supported or not;
    // if (typeof(Storage) !== "undefined") {
    //     // Code for localStorage/sessionStorage.
    //     alert('Storage supported');
    // } else {
    //     alert('No storage');
    // }
})();