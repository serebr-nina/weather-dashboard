const apiKey = "20d6807795f72c95b186d3f823cfbefa";
const apiKey2 = "95075225a87b4115987247127085ca3c";
const mainEl = $("#main")

let cityFullPath = "";

// elements required
const searchBtn = $("#search-btn");
const searchDiv = $("#search");
const selectorDiv = $("#selector");
const prevSearchDiv = $("#previous-searches");

const populatePreviouslySearched = () => {
    let prevCitiesArr = getCitiesFromLocalStorage();
    for (i in prevCitiesArr) {
        console.log('here1: ' + JSON.stringify(prevCitiesArr[i]));
        const currentCityObj = {
        "cityLat" : prevCitiesArr[i].cityLat,
        "cityLon" : prevCitiesArr[i].cityLon,
        "cityName" : prevCitiesArr[i].cityName,
        "cityCountry" : prevCitiesArr[i].cityCountry,
        "cityId" : prevCitiesArr[i].cityId,
        "cityState" : prevCitiesArr[i].cityState
        };
    
        addToPreviouslySearched(currentCityObj);
    }
}

const clearPreviouslySearched = () => {
    console.log('clear');
    window.localStorage.setItem("prevCities", "[]");
    $("#previous-searches").text("");
    console.log('clear');
    window.localStorage.removeItem('lastCity');
}

const addToPreviouslySearched = currentCityObj => {
    const cityLon = currentCityObj.cityLon;
    const cityLat = currentCityObj.cityLat;
    const cityName = currentCityObj.cityName;
    const cityCountry = currentCityObj.cityCountry;
    const cityId = currentCityObj.cityId;
    const cityState = currentCityObj.cityState;
    console.log('cityState: ' + cityState);
    let cityFullPath = cityName;
    // Handle optional city state
    if (cityState && cityState != 'undefined') {
        cityFullPath += ', ' + cityState;
    }
    cityFullPath += ', ' + cityCountry;
    console.log('cityid ' + cityId);

    console.log('search: ' + cityName + ', ' + cityId);
    prevSearchDiv.prepend($(`<span>${cityFullPath}</span>`)
    .attr("data-city-lon", `${cityLon}`)
    .attr("data-city-lat", `${cityLat}`)
    .attr("data-city-name", `${cityName}`)
    .attr("data-city-country", `${cityCountry}`)
    .attr("data-city-id", `${cityId}`)
    .attr("data-city-state", `${cityState}`)
    .attr("class", "prev-searched")
    .on("click", loadNewData));
}

// return true if city already added to local storage
function isCityAlreadyinLocalStorage(city) {
    let prevCitiesArr = getCitiesFromLocalStorage();
    var found = false;
    for (i in prevCitiesArr){
        if (prevCitiesArr[i].cityId === city.cityId) {
            found = true;
            break;
        }
    }
    return found;
}

const addToLocalStorage = cityToAdd => {

    let prevCitiesArr = getCitiesFromLocalStorage();
    // only add if city is not already in the list

    prevCitiesArr.push(cityToAdd);
    var prevCitiesStr = JSON.stringify(prevCitiesArr);
    window.localStorage.setItem("prevCities", prevCitiesStr);
    
    console.log('citytoadd: ' + JSON.stringify(cityToAdd));
    window.localStorage.setItem('lastCity', JSON.stringify(cityToAdd));
    console.log('city add: ' + cityToAdd + ', array: ' + prevCitiesArr);
}

// Retrives previous city data from local storage, sets to empty array is nothing in local storage
const getCitiesFromLocalStorage = () => {
    prevCitiesArr = JSON.parse(window.localStorage.getItem("prevCities"));
    if(!prevCitiesArr){
        prevCitiesArr = [];
    }
    return prevCitiesArr;

}

const showFoundCities = () => {
    selectorDiv.removeClass("selector-hidden").addClass("selector-visible");
    $("#search").css({'display': 'none'});
}
    
const clearAndHideFoundCities = () => {
    selectorDiv.empty();
    selectorDiv.removeClass("selector-visible").addClass("selector-hidden");
    $("#search").css({'display': 'flex'});
    $("#search-btn").siblings("input")[0].value = "";
}

const getEndPoint = (cityLat, cityLon) => {
    let endpoint = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${cityLat}&lon=${cityLon}&key=${apiKey2}&days=5&units=I`;
    console.log('endpoint ' + endpoint);
    return endpoint;
}

const getEndPointCity = (cityName) => {
    let endpoint = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${apiKey}`;
    return endpoint;
}

// load new data by getting from new endpoint
const loadNewData = event => {
    const curCityLon = $(event.target).data("city-lon");
    const curCityLat = $(event.target).data("city-lat");
    const curCityName = $(event.target).data("city-name");
    console.log('lon: ' + curCityLon + ', lat: ' + curCityLat + ', name: ' + curCityName);
    //cityName = curCityName;
    const curCityCountry = $(event.target).data("city-country");
    const curCityId = $(event.target).data("city-id");
    const curCityState = $(event.target).data("city-state");
    cityFullPath = curCityName;
    // Handle optional city state
    if (curCityState && curCityState != 'undefined') {
        cityFullPath += ', ' + curCityState;
    }
    cityFullPath += ', ' + curCityCountry;

    getDataThenPopulatePage(getEndPoint(curCityLat, curCityLon));
    $('#weather-display').show();
    
    clearAndHideFoundCities();
    currentCityObj = {
    "cityLat" : curCityLat,
    "cityLon" : curCityLon,
    "cityName" : curCityName,
    "cityCountry" : curCityCountry,
    "cityState": curCityState,
    "cityId" : curCityId 
    };

    if (!isCityAlreadyinLocalStorage(currentCityObj)) {
        addToLocalStorage(currentCityObj);
        addToPreviouslySearched(currentCityObj);
    }
}

// Update main card
const updateMainDate = currIndex => {
    //console.log('update main date: ' + event.target.value);
    //const index = $(event.target).data("fiveday");
    console.log('update main index: ' + currIndex);
    const data = JSON.parse(window.localStorage.getItem("weatherData"));
    const currData = data[currIndex];
    updateToday(currData);
    /*const curCityLat = $(event.target).data("city-lat");
    const curCityName = $(event.target).data("city-name");
    console.log('lon: ' + curCityLon + ', lat: ' + curCityLat + ', name: ' + curCityName);
    //cityName = curCityName;
    const curCityCountry = $(event.target).data("city-country");
    const curCityId = $(event.target).data("city-id");
    const curCityState = $(event.target).data("city-state");
    cityFullPath = curCityName;
    // Handle optional city state
    if (curCityState && curCityState != 'undefined') {
        cityFullPath += ', ' + curCityState;
    }
    cityFullPath += ', ' + curCityCountry;

    getDataThenPopulatePage(getEndPoint(curCityLat, curCityLon));
    $('#weather-display').show();
    
    clearAndHideFoundCities();
    currentCityObj = {
    "cityLat" : curCityLat,
    "cityLon" : curCityLon,
    "cityName" : curCityName,
    "cityCountry" : curCityCountry,
    "cityState": curCityState,
    "cityId" : curCityId 
    };

    if (!isCityAlreadyinLocalStorage(currentCityObj)) {
        addToLocalStorage(currentCityObj);
        addToPreviouslySearched(currentCityObj);
    }*/
}

// displays cities in a div and makes them selectable
const showCitiesFound = currentCity => {
    const cityId = '' + currentCity.lon + '' + currentCity.lat;
    const cityLon = currentCity.lon;
    const cityLat = currentCity.lat;
    const cityName = currentCity.name;
    const cityCountry = currentCity.country;
    const cityState = currentCity.state;
    let cityFullPath = cityName;
    // Handle optional city state
    if (cityState != null) {
        cityFullPath += ', ' + cityState;
    }
    cityFullPath += ', ' + cityCountry;

    showFoundCities();

    selectorDiv.append($(`<span>${cityFullPath}</span><br>`)
    .attr("data-city-lon", `${cityLon}`)
    .attr("data-city-lat", `${cityLat}`)
    .attr("data-city-name", `${cityName}`)
    .attr("data-city-country", `${cityCountry}`)
    .attr("data-city-id", `${cityId}`)
    .attr("data-city-state", `${cityState}`)
    .on("click", loadNewData));

}

// uses cities object to find matching cities
const searchCity = (arrCity) => {
        console.log('cities' + arrCity);
        selectorDiv.empty();   
        if (arrCity.length > 0 && cityName != ""){
            for (i in arrCity){
                console.log('city string ' + JSON.stringify(arrCity[i]));
                showCitiesFound(arrCity[i]);
            }
        }else{
            showFoundCities();

            selectorDiv.append($(`<p>City not found, Please search again</p>`));
            selectorDiv.on("click", clearAndHideFoundCities);
        }
}     

// returns string reprenting the month from interger
const intToMonth = monthAsInt => {
    const month= ["January","February","March","April","May","June","July","August","September","October","November","December"];
    return month[monthAsInt];
}
// returns string reprenting the day from interger
const intToDay = dayAsInt => {
    const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    return weekday[dayAsInt];
}

// updates 5 day forecast cards with data
const updateFiveDay = daysData => {
    console.log('five day ' + daysData);
    for (let i = 0; i < 5; i++){
        const currentDiv = $(`div[data-fiveday="${i}"]`)[0];
        const currentIcon = daysData[i].weather.icon;
        const currentIconSrc = `https://www.weatherbit.io/static/img/icons/${currentIcon}.png`;
        const d = new Date(daysData[i].ts * 1000);
        console.log('date ' + d + ' ' + daysData[i].datetime);
        const day = intToDay(d.getDay());
        currentDiv.setAttribute("onclick","updateMainDate('" + i + "')");
        //console.log('daily card ' + JSON.stringify(currentDiv));
        $(currentDiv).children(".max")[0].textContent = `Max: ${daysData[i].high_temp}°F`
        $(currentDiv).children(".min")[0].textContent = `Min: ${daysData[i].low_temp}°F`
        $(currentDiv).children(".wind")[0].textContent = `Wind: ${daysData[i].wind_spd}mph`
        $(currentDiv).children(".humidity")[0].textContent = `Humidity: ${daysData[i].rh}%`
        $(currentDiv).children(".weather-img")[0].src = currentIconSrc;
        $(currentDiv).children(".day")[0].textContent = day;
        //$(currentDiv).on("click", updateMainDate);
        // store weather data as attributes for updating main card when clicked
        /*.attr("data-max", `${daysData[i].high_temp}`)
        .attr("data-min", `${daysData[i].low_temp}`)
        .attr("data-wind", `${daysData[i].wind_spd}`)
        .attr("data-rh", `${daysData[i].rh}`)
        .attr("data-day", `${day}`)
        .attr("data-uv", `${daysData[i].uv}`);*/
    }
}

// updates todays forecast card
const updateToday = todayData => {
    const currentIcon = todayData.weather.icon;
    const currentIconSrc = `https://www.weatherbit.io/static/img/icons/${currentIcon}.png`;          
    const uv = todayData.uv;

    // Getting today as a day, DoM and month
    const d = new Date(todayData.ts * 1000);   
    const day = intToDay(d.getDay());
    const dayMonth = d.getDate();
    const month = intToMonth(d.getMonth());

    // Populating all todays information
    $("#today-max")[0].textContent = `Max: ${todayData.high_temp}°F`;
    $("#today-min")[0].textContent = `Min: ${todayData.low_temp}°F`;
    $("#today-wind")[0].textContent = `Wind: ${todayData.wind_spd}mph`;
    $("#today-humidity")[0].textContent = `Humidity: ${todayData.rh}%`;
    $("#today-img")[0].src = currentIconSrc;
    //console.log('city name ' + todayData.city_name);
    $("#city-name")[0].textContent = `${cityFullPath}`;
    $("#today-uv")[0].textContent = `UV: ${uv}`;
    $("#todays-date")[0].textContent = `${day}, ${dayMonth} ${month}`;
  
    if (uv < 3){
        $("#today-uv").removeClass("moderate-uv severe-uv").addClass("favorable-uv");
    }else if (uv < 6){
        $("#today-uv").removeClass("favorable-uv severe-uv").addClass("moderate-uv");
    }else{
        $("#today-uv").removeClass("favorable-uv moderate-uv").addClass("severe-uv");
    }    
}

// fetch json from API and calls functions to populate the DOM
const getDataThenPopulatePage = (givenUrl) => {
    fetch(givenUrl)
    .then(reponse => reponse.json())
    .then(data => {
        if (data == null) {
            console.log('null data');
        }
        console.log('stringify: ' + JSON.stringify(data));
        //console.log('data ' + typeof data + ', cod ' + data.list.length);
        updateFiveDay(data.data);
        updateToday(data.data[0]);
        // store weather data for later use to update main card date
        window.localStorage.setItem("weatherData", JSON.stringify(data.data));
    })
}

// create event listerner for the search button
searchBtn.click(event => { 
    event.preventDefault();
   
    // Ensure correct formatting of search string
    let tmpCityName = $("#search-btn").siblings("input")[0].value;

    // Checks for a input with atleast one none-whitespace char
    if(tmpCityName.trim()){
        tmpCityName = tmpCityName.trim();
        tmpCityName = tmpCityName.toLowerCase();
        cityName = tmpCityName[0].toUpperCase() + tmpCityName.slice(1);
        getCityData(getEndPointCity(cityName));
    }

});

// fetch json from API and calls functions to populate the DOM
const getCityData = (givenUrl) => {
    fetch(givenUrl)
    .then(reponse => reponse.json())
    .then(data => {
        console.log(data);
        searchCity(data);
    })
}
var lastCityStr = window.localStorage.getItem("lastCity");
var cityName = '';
if (lastCityStr != null) {
    console.log('last: ' + lastCityStr);
    var lastCity = JSON.parse(lastCityStr);
    console.log('last city: ' + JSON.stringify(lastCity));
    //cityName = lastCity.cityName;
    cityFullPath = lastCity.cityName;
    // Handle optional city state
    if (lastCity.cityState && lastCity.cityState != 'undefined') {
        cityFullPath += ', ' + lastCity.cityState;
    }
    cityFullPath += ', ' + lastCity.cityCountry;
    getDataThenPopulatePage(getEndPoint(lastCity.cityLat, lastCity.cityLon));
    populatePreviouslySearched();
} else {
    $('#weather-display').hide();
}

$("#clear-history").on("click", clearPreviouslySearched);
//$(".daily-card").on("click", updateMainDate);