
(function () {
    LoadExitingCity();

    var filePath = "http://api.timezonedb.com/v2/list-time-zone?key=LOG8R9E644IJ&format=json";
    var citySelector = $('#city');

    // Loading all city from API to dropdown
    $.getJSON(filePath,{ format:"json"}).done(function (city) {
        for(var i=0; i<city.zones.length; i++){
            var cityNameInnnerHtml = city.zones[i].zoneName.split('/').pop().replace(/_/g, ' ');
            var cityNameValue = city.zones[i].zoneName;
            citySelector.append('<option value="'+cityNameValue+'">'+cityNameInnnerHtml+'</option>');
        }
    });

    // Add a city with this button click
    $('#addCityBtn').click(function () {
        if(localStorage.length == 5){
            alert("You are limited to add only 5 city");
        }
        if(localStorage.length < 5) {
            if(citySelector.val() !== ''){
                var cityValue = citySelector.val();
                var cityName = citySelector.val().split('/').pop().replace(/_/g, ' ');

                if(localStorage.getItem(cityName) !== null){
                    alert("The city already exists!");
                }
                else {
                    // Save the city info in local Storage
                    localStorage.setItem(cityName, SetJSONString(cityValue, cityName));
                    // Show the city with recent add
                    AddCity(cityName, JSON.parse(localStorage.getItem(cityName)));
                }
            }
            else {
                alert("You didn't select any city. Select a city and try again!");
            }
        }
    });

    // Remove city
    $(document).on('click', '.removeCityBtn', function () {
        // console.log($(this).closest('.col-md-4')[0].id);
        localStorage.removeItem($(this).closest('.col-md-4')[0].id);
        $(this).closest('.col-md-4').remove();
    });

    // Show Text of Remove Button
    $('.removeCityBtn').hover(function () {
        $(this).html('<span class="glyphicon glyphicon-remove"></span> Remove');
    });

    $('.removeCityBtn').mouseleave(function () {
        $(this).html('<span class="glyphicon glyphicon-remove"></span>');
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
                if(localTime.getHours() === serverTime.getHours()){
                    difference = CalculateDifferences(localTime, serverTime, 0);
                }
                else if (localTime.getHours() > serverTime.getHours()){
                    difference = CalculateDifferences(localTime, serverTime, localTime.getHours() - serverTime.getHours());
                }
                else {
                    difference = CalculateDifferences(localTime, serverTime, serverTime.getHours() - localTime.getHours());
                }
            }
        });
        return difference;
    }

    // Calculate differences
    function CalculateDifferences(localTime, serverTime, differenceHours) {
        var differenceMinutes = 0;
        var differenceDate = localTime.getDate() > serverTime.getDate() ? serverTime.getDate() - localTime.getDate() :  localTime.getDate() - serverTime.getDate();
        var differenceDay = localTime.getDay() > serverTime.getDay() ? serverTime.getDay() - localTime.getDay() :  localTime.getDay() - serverTime.getDay();
        var differenceYear = localTime.getFullYear() > serverTime.getFullYear() ? serverTime.getFullYear() - localTime.getFullYear() :  localTime.getFullYear() - serverTime.getFullYear();

        if(localTime.getMinutes() === serverTime.getMinutes()){
            differenceMinutes = 0;
        }
        else if(localTime.getMinutes() > serverTime.getMinutes()){
            differenceMinutes = (-(localTime.getMinutes() - serverTime.getMinutes()));
        }
        else {
            differenceMinutes = serverTime.getMinutes() - localTime.getMinutes();
        }

        return {"hours":differenceHours, "minutes":differenceMinutes, "day":differenceDay, "date":differenceDate, "year":differenceYear};
    }

    // Load added city
    function LoadExitingCity() {
        if(localStorage.length>0){
            $('#cities').html('');
            $.each(localStorage, function (cityName, jsonString) {
                var cityValue = JSON.parse(jsonString);
                AddCity(cityName, cityValue);
            });
        }
    }

    // Add city
    function AddCity(cityName, cityValue) {
        // Display the added city
        $('#cities') .append(
            '<div class="col-md-4" id="'+cityName+'">' +
            '<div class="thumbnail">' +
            '<a class="btn btn-danger btn-xs pull-right removeCityBtn"><span class="glyphicon glyphicon-remove"></span></a>' +
            '<h2><span class="glyphicon glyphicon-map-marker"></span>'+cityName+'</h2>' +
            '<h3><span class="glyphicon glyphicon-cloud"></span> '+GetTemperature(cityName)+'</h3>' +
            '<h5><span class="glyphicon glyphicon-time"></span> '+SynchronizeLocalTime(cityValue.Difference)+'</h5>' +
            '</div>' +
            '</div>'
        );
    }
    
    // Synchronize the real time
    function SynchronizeLocalTime(difference) {
        var now = new Date();
        var monthName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        var  daysName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var date = [(now.getDate() + Number(difference.date)), monthName[now.getMonth() + Number(difference.day)], (now.getFullYear() + Number(difference.year))],
            day= daysName[now.getDay() + Number(difference.day)];
        var min = (now.getMinutes() + Number(difference.minutes)) < 60 ? (now.getMinutes() + Number(difference.minutes)) : (now.getMinutes() + Number(difference.minutes)) % 60;
        var hour = (now.getMinutes() + Number(difference.minutes)) > 59 ? 1 : 0;
        hour = (now.getHours() + Number(difference.hours + hour)) <25 ? (now.getHours() + Number(difference.hours)) : ((now.getHours() + Number(difference.hours)) % 24);

        var time = (hour+':'+min);

        return [date.join(' '),time.replace(/-/g,''),day].join(' ');
    }

    // Get Temperature
    function GetTemperature(cityName) {
        var temperature = null;
        $.ajax({
            async:false,
            type:"get",
            url: "http://api.openweathermap.org/data/2.5/weather",
            data: {appid:"58ad549f7d342e4a1ab51214b49683a2", q:cityName},
            dataType:"JSON",
            success: function (response) {
                temperature = (response.main.temp - 273.15).toFixed(2)+' &#8451;';
            }
        });
        return temperature;
    }

    setInterval(function(){
        $.ajax({
            url: "",
            context: document.body+'#cities',
            success: function(){
                LoadExitingCity();
            }
        });
    },60000);
})();