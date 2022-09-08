// get cities by name
const apiKey = "20d6807795f72c95b186d3f823cfbefa";
// get weather by location
const apiKey2 = "95075225a87b4115987247127085ca3c";
const mainEl = $("#main")
let cityFullPath = "";
let cityName = '';
// elements required
const searchBtn = $("#search-btn");
const searchDiv = $("#search");
const selectorDiv = $("#selector");
const prevSearchDiv = $("#previous-searches");
const populatePreviouslySearched = () => {
    let prevCitiesArr = getCitiesFromLocalStorage();
    for (i in prevCitiesArr) {
        const currentCityObj = {
            "cityLat": prevCitiesArr[i].cityLat,
            "cityLon": prevCitiesArr[i].cityLon,
            "cityName": prevCitiesArr[i].cityName,
            "cityCountry": prevCitiesArr[i].cityCountry,
            "cityId": prevCitiesArr[i].cityId,
            "cityState": prevCitiesArr[i].cityState
        };
        addToPreviouslySearched(currentCityObj);
    }
}
const clearPreviouslySearched = () => {
    window.localStorage.setItem("prevCities", "[]");
    $("#previous-searches").text("");
    window.localStorage.removeItem('lastCity');
}
const addToPreviouslySearched = currentCityObj => {
    const cityLon = currentCityObj.cityLon;
    const cityLat = currentCityObj.cityLat;
    const cityName = currentCityObj.cityName;
    const cityCountry = currentCityObj.cityCountry;
    const cityId = currentCityObj.cityId;
    const cityState = currentCityObj.cityState;
    let cityFullPath = cityName;
    // handle optional city state
    if (cityState && cityState != 'undefined') {
        cityFullPath += ', ' + cityState;
    }
    cityFullPath += ', ' + cityCountry;
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
    for (i in prevCitiesArr) {
        if (prevCitiesArr[i].cityId === city.cityId) {
            found = true;
            break;
        }
    }
    return found;
}
const addToLocalStorage = cityToAdd => {
    let prevCitiesArr = getCitiesFromLocalStorage();
    prevCitiesArr.push(cityToAdd);
    var prevCitiesStr = JSON.stringify(prevCitiesArr);
    window.localStorage.setItem("prevCities", prevCitiesStr);
    // save last city viewed to default to it on revisit to the app
    window.localStorage.setItem('lastCity', JSON.stringify(cityToAdd));
}
// retrive previous city data from local storage, set to empty array if nothing in local storage
const getCitiesFromLocalStorage = () => {
    prevCitiesArr = JSON.parse(window.localStorage.getItem("prevCities"));
    if (!prevCitiesArr) {
        prevCitiesArr = [];
    }
    return prevCitiesArr;
}
const showFoundCities = () => {
    selectorDiv.removeClass("selector-hidden").addClass("selector-visible");
    $("#search").css({ 'display': 'none' });
}
const clearAndHideFoundCities = () => {
    selectorDiv.empty();
    selectorDiv.removeClass("selector-visible").addClass("selector-hidden");
    $("#search").css({ 'display': 'flex' });
    $("#search-btn").siblings("input")[0].value = "";
}
const getEndPoint = (cityLat, cityLon) => {
    let endpoint = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${cityLat}&lon=${cityLon}&key=${apiKey2}&days=5&units=I`;
    return endpoint;
}
const getEndPointCity = (cityName) => {
    let endpoint = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${apiKey}`;
    return endpoint;
}
// load new data by getting from new endpoint
const loadNewData = event => {
    const curCityLon = $(event.target).data("city-lon");
    const curCityLat = $(event.target).data("city-lat");
    const curCityName = $(event.target).data("city-name");
    const curCityCountry = $(event.target).data("city-country");
    const curCityId = $(event.target).data("city-id");
    const curCityState = $(event.target).data("city-state");
    cityFullPath = curCityName;
    // handle optional city state
    if (curCityState && curCityState != 'undefined') {
        cityFullPath += ', ' + curCityState;
    }
    cityFullPath += ', ' + curCityCountry;
    getDataThenPopulatePage(getEndPoint(curCityLat, curCityLon));
    $('#weather-display').show();
    clearAndHideFoundCities();
    currentCityObj = {
        "cityLat": curCityLat,
        "cityLon": curCityLon,
        "cityName": curCityName,
        "cityCountry": curCityCountry,
        "cityState": curCityState,
        "cityId": curCityId
    };
    if (!isCityAlreadyinLocalStorage(currentCityObj)) {
        addToLocalStorage(currentCityObj);
        addToPreviouslySearched(currentCityObj);
    }
}
// update main card with saved weather data for a specific date
const updateMainDate = currIndex => {
    const data = JSON.parse(window.localStorage.getItem("weatherData"));
    const currData = data[currIndex];
    updateToday(currData);
}
// display cities in a div and make them selectable
const showCitiesFound = currentCity => {
    const cityId = '' + currentCity.lon + '' + currentCity.lat;
    const cityLon = currentCity.lon;
    const cityLat = currentCity.lat;
    const cityName = currentCity.name;
    const cityCountry = currentCity.country;
    const cityState = currentCity.state;
    let cityFullPath = cityName;
    // handle optional city state
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
// use cities object to find matching cities
const searchCity = (arrCity) => {
    selectorDiv.empty();
    if (arrCity.length > 0 && cityName != "") {
        for (i in arrCity) {
            showCitiesFound(arrCity[i]);
        }
    } else {
        showFoundCities();
        selectorDiv.append($(`<p>City not found, Please search again</p>`));
        selectorDiv.on("click", clearAndHideFoundCities);
    }
}
// return string printing the month from integer
const intToMonth = monthAsInt => {
    const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return month[monthAsInt];
}
// return string printing the day from integer
const intToDay = dayAsInt => {
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return weekday[dayAsInt];
}
// update 5 day forecast cards with data
const updateFiveDay = daysData => {
    for (let i = 0; i < 5; i++) {
        const currentDiv = $(`div[data-fiveday="${i}"]`)[0];
        const currentIcon = daysData[i].weather.icon;
        //  get dynamically icon from the weatherbit website
        const currentIconSrc = `https://www.weatherbit.io/static/img/icons/${currentIcon}.png`;
        const d = new Date(daysData[i].ts * 1000);
        const day = intToDay(d.getDay());
        currentDiv.setAttribute("onclick", "updateMainDate('" + i + "')");
        $(currentDiv).children(".max")[0].textContent = `Max: ${daysData[i].high_temp}°F`
        $(currentDiv).children(".min")[0].textContent = `Min: ${daysData[i].low_temp}°F`
        $(currentDiv).children(".wind")[0].textContent = `Wind: ${daysData[i].wind_spd}mph`
        $(currentDiv).children(".humidity")[0].textContent = `Humidity: ${daysData[i].rh}%`
        $(currentDiv).children(".weather-img")[0].src = currentIconSrc;
        $(currentDiv).children(".day")[0].textContent = day;
    }
}
// update todays forecast card
const updateToday = todayData => {
    const currentIcon = todayData.weather.icon;
    const currentIconSrc = `https://www.weatherbit.io/static/img/icons/${currentIcon}.png`;
    const uv = todayData.uv;
    // get today as a day, DoM, and month
    const d = new Date(todayData.ts * 1000);
    const day = intToDay(d.getDay());
    const dayMonth = d.getDate();
    const month = intToMonth(d.getMonth());
    // populate all todays information
    $("#today-max")[0].textContent = `Max: ${todayData.high_temp}°F`;
    $("#today-min")[0].textContent = `Min: ${todayData.low_temp}°F`;
    $("#today-wind")[0].textContent = `Wind: ${todayData.wind_spd}mph`;
    $("#today-humidity")[0].textContent = `Humidity: ${todayData.rh}%`;
    $("#today-img")[0].src = currentIconSrc;
    $("#city-name")[0].textContent = `${cityFullPath}`;
    $("#today-uv")[0].textContent = `UV: ${uv}`;
    $("#todays-date")[0].textContent = `${day}, ${dayMonth} ${month}`;
    if (uv < 3) {
        $("#today-uv").removeClass("moderate-uv severe-uv").addClass("favorable-uv");
    } else if (uv < 6) {
        $("#today-uv").removeClass("favorable-uv severe-uv").addClass("moderate-uv");
    } else {
        $("#today-uv").removeClass("favorable-uv moderate-uv").addClass("severe-uv");
    }
}
// fetch json from API and calls functions to populate the DOM
const getDataThenPopulatePage = (givenUrl) => {
    fetch(givenUrl)
        .then(reponse => reponse.json())
        .then(data => {
            if (data == null) {
            }
            updateFiveDay(data.data);
            updateToday(data.data[0]);
            // store weather data for later use to update main card date
            window.localStorage.setItem("weatherData", JSON.stringify(data.data));
        })
}
// create event listener for the search button
searchBtn.click(event => {
    event.preventDefault();
    // ensure correct formatting of search string
    let tmpCityName = $("#search-btn").siblings("input")[0].value;
    // check for an input with at least one none-whitespace char
    if (tmpCityName.trim()) {
        tmpCityName = tmpCityName.trim();
        tmpCityName = tmpCityName.toLowerCase();
        cityName = tmpCityName[0].toUpperCase() + tmpCityName.slice(1);
        getCityData(getEndPointCity(cityName));
    }
});
// fetch json from API and call functions to populate the DOM
const getCityData = (givenUrl) => {
    fetch(givenUrl)
        .then(reponse => reponse.json())
        .then(data => {
            searchCity(data);
        })
}
// load previously searched weather and cities
const initPreviouslySearched = () => {
    var lastCityStr = window.localStorage.getItem("lastCity");
    if (lastCityStr != null) {
        var lastCity = JSON.parse(lastCityStr);
        // cityName = lastCity.cityName;
        cityFullPath = lastCity.cityName;
        // handle optional city state
        if (lastCity.cityState && lastCity.cityState != 'undefined') {
            cityFullPath += ', ' + lastCity.cityState;
        }
        cityFullPath += ', ' + lastCity.cityCountry;
        getDataThenPopulatePage(getEndPoint(lastCity.cityLat, lastCity.cityLon));
        populatePreviouslySearched();
    } else {
        $('#weather-display').hide();
    }
}
initPreviouslySearched();

$("#clear-history").on("click", clearPreviouslySearched);