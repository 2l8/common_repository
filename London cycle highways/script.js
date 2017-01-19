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
            const factor = 6371 * Math.PI / 180;
            if (target.is("li")){
                $("#informationField").fadeIn("slow");
                $("#map").removeClass("hidden");
                $("#informationBar").css("margin-top", target.position().top - 2);
                $("#informationBar li").first().html("Highway label: " + data[target.val()].label);
                $("#informationBar li:nth-child(2)").html("Type: " + data[target.val()].geography.type);
                if (data[target.val()].geography.coordinates[0][0][0] != undefined){
                    let coordinateArray = data[target.val()].geography.coordinates;
                    let firstLength = coordinateArray.length - 1;
                    let secondLength = coordinateArray[firstLength].length - 1;
                    let diagonalDistance = factor * Math.acos(Math.sin(coordinateArray[0][0][1]) * Math.sin(coordinateArray[firstLength][secondLength][1]) + 
                    Math.cos(coordinateArray[0][0][1]) * Math.cos(coordinateArray[firstLength][secondLength][1]) * 
                    Math.cos(coordinateArray[0][0][0] - coordinateArray[firstLength][secondLength][0]));
                    $("#informationBar li:nth-child(3)").html("Start point: Latitude: " + coordinateArray[0][0][1] + ", Longitude: " + coordinateArray[0][0][0]);
                    $("#informationBar li:nth-child(4)").html("End point: Latitude: " + coordinateArray[firstLength][secondLength][1] + ", Longitude: " + coordinateArray[firstLength][secondLength][0]);
                    $("#informationBar li:nth-child(5)").html("Direct distance: " + diagonalDistance.toFixed(3) + " km");
                    let startPoint = {lat: coordinateArray[0][0][1], lng: coordinateArray[0][0][0]};
                    let map = new google.maps.Map(document.getElementById('map'), {
                        center: startPoint,
                        scrollwheel: false,
                        zoom: 17
                    });
                    let marker = new google.maps.Marker({
                        map: map,
                        position: startPoint,
                        title: 'Starting point'
                    });
                }else{
                    diagonalDistance = factor * Math.acos(Math.sin(data[target.val()].geography.coordinates[0][1]) * Math.sin(data[target.val()].geography.coordinates[data[target.val()].geography.coordinates.length - 1][1]) + 
                    Math.cos(data[target.val()].geography.coordinates[0][1]) * Math.cos(data[target.val()].geography.coordinates[data[target.val()].geography.coordinates.length - 1][1]) * 
                    Math.cos(data[target.val()].geography.coordinates[0][0] - data[target.val()].geography.coordinates[data[target.val()].geography.coordinates.length - 1][0]));
                    $("#informationBar li:nth-child(3)").html("Start point: Latitude: " + data[target.val()].geography.coordinates[0][1] + ", Longitude: " + data[target.val()].geography.coordinates[0][0]);
                    $("#informationBar li:nth-child(4)").html("End point: Latitude: " + data[target.val()].geography.coordinates[data[target.val()].geography.coordinates.length - 1][1] + 
                    ", Longitude: " + data[target.val()].geography.coordinates[data[target.val()].geography.coordinates.length - 1][0]);
                    $("#informationBar li:nth-child(5)").html("Direct distance: " + diagonalDistance.toFixed(3) + " km");
                    startPoint = {lat: data[target.val()].geography.coordinates[0][1], lng: data[target.val()].geography.coordinates[0][0]};
                    map = new google.maps.Map(document.getElementById('map'), {
                        center: startPoint,
                        scrollwheel: false,
                        zoom: 17
                    });
                    marker = new google.maps.Marker({
                        map: map,
                        position: startPoint,
                        title: 'Starting point'
                    });
                }
            }
        });
        
    });   
}