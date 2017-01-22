const factor = 6371 * Math.PI / 180;

function addSingleSelect(block, className){
    block.parent().children().removeClass(className);
    block.addClass(className);
};

function initMap() {
    $.ajax({
        url: "https://api.tfl.gov.uk/CycleSuperhighway?app_id=d2595ff3&app_key=84964631f9f952a6c25e5aa84b2ca5e6",
        dataType: "json"
    }).done(function(data){
        for (let i = 0; i < data.length; i++){
            $(".hidden>.selectionTemplate").clone().appendTo("#selectionBar").html((data[i].label));
            $("#selectionBar>.selectionTemplate:last").val(i);
        }
        $("#selectionBar").on("click", function(event){
            let target = $(event.target);
            if (target.is("li")){
                addSingleSelect(target, "selected");
                $("#informationField").hide();
                $("#informationField").fadeIn(800);
                $("#informationBar li").first().html("Highway label: " + data[target.val()].label);
                $("#informationBar li:nth-child(2)").html("Type: " + data[target.val()].geography.type);
                if (data[target.val()].geography.coordinates[0][0][0] != undefined){
                    let coordinateArray = data[target.val()].geography.coordinates;
                    let firstLength = coordinateArray.length - 1;
                    let secondLength = coordinateArray[firstLength].length - 1;
                    let diagonalDistance = factor * Math.acos(Math.sin(coordinateArray[0][0][1]) * Math.sin(coordinateArray[firstLength][secondLength][1]) + 
                    Math.cos(coordinateArray[0][0][1]) * Math.cos(coordinateArray[firstLength][secondLength][1]) * 
                    Math.cos(coordinateArray[0][0][0] - coordinateArray[firstLength][secondLength][0]));
                    let totalDistance = coordinateArray.reduce(function (pV, cV){
                        return pV.concat(cV);
                    }).reduce(function(pV, cV, index, array){
                        if (index == array.length - 1){return pV};
                        return pV + factor * Math.acos(Math.sin(array[index][1]) * Math.sin(array[index + 1][1]) + 
                        Math.cos(array[index][1]) * Math.cos(array[index + 1][1]) * 
                        Math.cos(array[index][0] - array[index + 1][0]));
                    }, 0);
                    $.ajax({
                        url: "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + coordinateArray[0][0][1] + "," + coordinateArray[0][0][0] + "&language=en&key=AIzaSyAsdzp5NkgkVIImzKK990xGDrBRDTFv--Y",
                        dataType: "json"
                    }).done(function(address){
                        $("#informationBar li:nth-child(3)").html("Start point: " + address.results[0].formatted_address);
                    });
                    $.ajax({
                        url: "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + coordinateArray[firstLength][secondLength][1] + "," + coordinateArray[firstLength][secondLength][0] + "&language=en&key=AIzaSyAsdzp5NkgkVIImzKK990xGDrBRDTFv--Y",
                        dataType: "json"
                    }).done(function(address){
                        $("#informationBar li:nth-child(4)").html("End point: " + address.results[0].formatted_address);
                    });
                    $("#informationBar li:nth-child(5)").html("Direct distance: " + diagonalDistance.toFixed(3) + " km");
                    $("#informationBar li:nth-child(6)").html("Total length: " + totalDistance.toFixed(3) + " km");
                    let startPoint = {lat: coordinateArray[0][0][1], lng: coordinateArray[0][0][0]};
                    let endPoint = {lat: coordinateArray[firstLength][secondLength][1], lng: coordinateArray[firstLength][secondLength][0]};
                    let map = new google.maps.Map(document.getElementById('map'), {
                        center: startPoint,
                        scrollwheel: false,
                        zoom: 13
                    });
                    let startMarker = new google.maps.Marker({
                        map: map,
                        position: startPoint,
                        title: 'Starting point'
                    });
                    let endMarker = new google.maps.Marker({
                        map: map,
                        position: endPoint,
                        title: 'Ending point'
                    });
                    let cyclePath = coordinateArray.reduce(function (pV, cV){
                        return pV.concat(cV);
                    }).map(function(cV, index, array){
                        return cV.reduce(function(pV, cV){
                            return {lat: cV, lng: pV};
                        });
                    });
                    let trajectory = new google.maps.Polyline({
                        map: map,
                        strokeColor: '#3f51b5',
                        strokeOpacity: 1.0,
                        strokeWeight: 4,
                        path: cyclePath
                    });
                }else{
                    diagonalDistance = factor * Math.acos(Math.sin(data[target.val()].geography.coordinates[0][1]) * Math.sin(data[target.val()].geography.coordinates[data[target.val()].geography.coordinates.length - 1][1]) + 
                    Math.cos(data[target.val()].geography.coordinates[0][1]) * Math.cos(data[target.val()].geography.coordinates[data[target.val()].geography.coordinates.length - 1][1]) * 
                    Math.cos(data[target.val()].geography.coordinates[0][0] - data[target.val()].geography.coordinates[data[target.val()].geography.coordinates.length - 1][0]));
                    totalDistance = data[target.val()].geography.coordinates.reduce(function(pV, cV, index, array){
                        if (index == array.length - 1){return pV};
                        return pV + factor * Math.acos(Math.sin(array[index][1]) * Math.sin(array[index + 1][1]) + 
                        Math.cos(array[index][1]) * Math.cos(array[index + 1][1]) * 
                        Math.cos(array[index][0] - array[index + 1][0]));
                    }, 0);
                    $.ajax({
                        url: "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + data[target.val()].geography.coordinates[0][1] + "," + 
                        data[target.val()].geography.coordinates[0][0] + "&language=en&key=AIzaSyAsdzp5NkgkVIImzKK990xGDrBRDTFv--Y",
                        dataType: "json"
                    }).done(function(address){
                        $("#informationBar li:nth-child(3)").html("Start point: " + address.results[0].formatted_address);
                    });
                    $.ajax({
                        url: "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + data[target.val()].geography.coordinates[data[target.val()].geography.coordinates.length - 1][1] + "," + 
                        data[target.val()].geography.coordinates[data[target.val()].geography.coordinates.length - 1][0] + "&language=en&key=AIzaSyAsdzp5NkgkVIImzKK990xGDrBRDTFv--Y",
                        dataType: "json"
                    }).done(function(address){
                        $("#informationBar li:nth-child(4)").html("End point: " + address.results[0].formatted_address);
                    });
                    $("#informationBar li:nth-child(5)").html("Direct distance: " + diagonalDistance.toFixed(3) + " km");
                    $("#informationBar li:nth-child(6)").html("Total length: " + totalDistance.toFixed(3) + " km");
                    startPoint = {lat: data[target.val()].geography.coordinates[0][1], lng: data[target.val()].geography.coordinates[0][0]};
                    endPoint = {lat: data[target.val()].geography.coordinates[data[target.val()].geography.coordinates.length - 1][1], 
                        lng: data[target.val()].geography.coordinates[data[target.val()].geography.coordinates.length - 1][0]};
                    map = new google.maps.Map(document.getElementById('map'), {
                        center: startPoint,
                        scrollwheel: false,
                        zoom: 13
                    });
                    startMarker = new google.maps.Marker({
                        map: map,
                        position: startPoint,
                        title: 'Starting point'
                    });
                    endMarker = new google.maps.Marker({
                        map: map,
                        position: endPoint,
                        title: 'Ending point'
                    });
                    cyclePath =  data[target.val()].geography.coordinates.map(function(cV, index, array){
                        return cV.reduce(function(pV, cV){
                            return {lat: cV, lng: pV};
                        });
                    });
                    trajectory = new google.maps.Polyline({
                        map: map,
                        strokeColor: '#3f51b5',
                        strokeOpacity: 1.0,
                        strokeWeight: 4,
                        path: cyclePath
                    });
                }
            }
        });
        
    });   
}
