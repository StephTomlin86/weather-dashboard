$(document).ready(function () {
  // initial array of saved cities
  let citiesList = JSON.parse(localStorage.getItem("savedCitiesList") || "[]");
  renderCityButtons();
  var selectCity = citiesList[citiesList.length - 1] || "Minneapolis";
  getForecast(selectCity);

  $("#search").on("click", function (event) {
    event.preventDefault();
    var newCity = $("#city-input").val().trim();
    citiesList.push(newCity);
    localStorage.setItem("savedCitiesList", JSON.stringify(citiesList));
    renderCityButtons();
    getForecast(newCity);
  });

  function getForecast(currentCity) {
    $("#chosenCity").empty();
    $("#fiveDayForecast").empty();
    var lat = "";
    var lon = "";

    // Creates AJAX call for the specific movie button being clicked
    $.ajax({
      url:
        "https://api.openweathermap.org/data/2.5/weather?q=" +
        currentCity +
        "&appid=33c63abdc074bfb89c02e1a51923b28a",
      method: "GET",
    }).then(function forecast(response) {
      console.log(response);
      // console.log our data request so we know what we're working with

      const cityName = $("<h2>")
        .attr("font-size", "30px")
        .attr("font-weight", "bold");
      const weatherIcon = $("<img />").attr(
        "src",
        "https://openweathermap.org/img/wn/" +
          response.weather[0].icon +
          "@2x.png"
      );
      const weatherDescription = $("<p>");
      const temperature = $("<p>");
      const humidity = $("<p>");
      const dateTime = response.dt;
      const lat = response.coord.lat;
      const lon = response.coord.lon;
      const uvIndex = $("<span>").attr("id", "uv");

      //convert unixtimestamp

      var months_arr = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      var date = new Date(dateTime * 1000);
      var year = date.getFullYear();
      var month = months_arr[date.getMonth()];
      var day = date.getDate();

      // Display date time in MM-dd-yyyy format
      var convdateTime = month + "-" + day + "-" + year;
      console.log(convdateTime);

      var fahrenheitTemp = Math.floor((response.main.temp - 273.15) * 1.8 + 32);

      // Displays the chosen city
      cityName.text(response.name + "            " + convdateTime);
      weatherDescription.text("Currently: " + response.weather[0].main);
      temperature.text("Current Temperature: " + fahrenheitTemp + "F");
      humidity.text("Humidity: " + response.main.humidity + "%");

      //second API call for UV
      $.ajax({
        url:
          "https://api.openweathermap.org/data/2.5/uvi?lat=" +
          lat +
          "&lon=" +
          lon +
          "&appid=33c63abdc074bfb89c02e1a51923b28a",
        method: "GET",
      }).then(function (response) {
        var index = response.value;
        //changing color of uv index
        if (index >= 0 && index <= 2) {
          $("#uv")
            .text("UV Index: " + index)
            .css("background-color", "green")
            .attr("font-weight", "bold");
        } else if (index <= 3 && index <= 5) {
          $("#uv")
            .text("UV Index: " + index)
            .css("background-color", "yellow")
            .attr("font-weight", "bold");
        } else if (index <= 6 && index <= 7) {
          $("#uv")
            .text("UV Index: " + index)
            .css("background-color", "orange")
            .attr("font-weight", "bold");
        } else {
          $("#uv")
            .text("UV Index: " + index)
            .css("background-color", "red")
            .attr("font-weight", "bold");
        }
      });

      //All items can be chained in jQuery.
      $("#chosenCity").prepend(
        cityName,
        weatherIcon,
        weatherDescription,
        temperature,
        humidity,
        uvIndex
      );
    });

    //third API call for five day
    $.ajax({
      url:
        "https://api.openweathermap.org/data/2.5/forecast?q=" +
        selectCity +
        "&appid=33c63abdc074bfb89c02e1a51923b28a",
      method: "GET",
    }).then(function (response) {
      //create initial empty array
      fiveDayArray = [];

      //loop to pull out the necessary data from the API call increasing index by 8
      for (var f = 2; f <= 34; f += 8) {
        var day = response.list[f].dt_txt.split(" ")[0];
        var weatherIcon =
          "https://openweathermap.org/img/wn/" +
          response.list[f].weather[0].icon +
          "@2x.png";
        var forecast = "Weather: " + response.list[f].weather[0].description;
        var fahrenheitTemp = Math.floor(
          (response.list[f].main.temp - 273.15) * 1.8 + 32
        );
        var temp = "Temperature: " + fahrenheitTemp + "F";
        var humid = "Humidity: " + response.list[f].main.humidity + "%";

        //creating an object representing the forecast for each day
        let fiveDayObject = { day, weatherIcon, forecast, temp, humid };
        console.log(fiveDayObject);
        //pushing all five objects into the initial array
        fiveDayArray.push(fiveDayObject);
      }

      //building out each card
      fiveDayArray.forEach(function (days) {
        var cardBody = $("<div>").attr(
          "class",
          "card text-white bg-primary mb-3"
        );
        var thisDay = $("<div>").text(`${days.day}`);
        var thisIcon = $("<img />").attr("src", `${days.weatherIcon}`);
        var thisForecast = $("<div>").text(`${days.forecast}`);
        var thisTemp = $("<div>").text(`${days.temp}`);
        var thisHumid = $("<div>").text(`${days.humid}`);
        $("#fiveDayForecast").append(cardBody);
        cardBody.append(thisDay, thisIcon, thisForecast, thisTemp, thisHumid);
      });
    });
  }

  function renderCityButtons(array) {
    $("#searchList").empty();
    for (var i = 0; i < citiesList.length; i++) {
      var x = $("<button>")
        .addClass("city")
        .attr("data-name", citiesList[i])
        .text(citiesList[i]);
      $("#searchList").prepend(x);
    }
  }

  //add event listener to all city buttons
  $(document).on("click", ".city", function () {
    getForecast($(this).attr("data-name"));
  });
});
