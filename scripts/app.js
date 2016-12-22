/**
 * Created by ARIF on 12/20/2016.
 */

(function () {
    var filePath = "http://api.timezonedb.com/v2/list-time-zone?key=LOG8R9E644IJ&format=json";
    var citySelector = $('#city');
    $.getJSON(filePath,{ format:"json"}).done(function (city) {
        for(var i=0; i<city.zones.length; i++){
            var cityNameInnnerHtml = city.zones[i].zoneName.split('/').pop();
            var cityNameValue = city.zones[i].zoneName;
            citySelector.append('<option value="'+cityNameValue+'">'+cityNameInnnerHtml+'</option>');
        }
    });

    $('#addCityBtn').click(function () {
        if(citySelector.val() !== ''){
            var cityValue = citySelector.val();
            var cityName = citySelector.val().split('/').pop();
            $('#cities') .append(
                '<div class="col-md-4" id="'+cityValue+'">' +
                '<div class="thumbnail">' +
                '<a class="btn btn-danger btn-sm pull-right" id="removeCityBtn"><span class="glyphicon glyphicon-remove"></span></a>' +
                '<h1><span class="glyphicon glyphicon-map-marker"></span>'+cityName+'</h1>' +
                '<h3><span class="glyphicon glyphicon-cloud"></span> 31 Celsius</h3>' +
                '<h3><span class="glyphicon glyphicon-time"></span> 3.00 PM</h3>' +
                '</div>' +
                '</div>'+
                '');
        }
        else {
            alert("You didn't select any city. Select a city and try again!");
        }

    });

    $(document).on('#removeCityBtn', 'click', function () {

    });
})();