/* =======================================================================
   Clients
   ======================================================================= */

/* Variables
======================================================================= */
var districtInfo = { // Object of long names to IDs for districts
                    "City of Orlando": "orange",
                    "FDOT Central Office": "central",
                    "FDOT District 1": "d1",
                    "FDOT District 2": "d2",
                    "FDOT District 3": "d3",
                    "FDOT District 4": "d4",
                    "FDOT District 5": "d5",
                    "FDOT District 6": "d6",
                    "FDOT District 7": "d7",
                    "Florida Department of Environmental Protection": "fdep",
                    "Florida's Turnpike Enterprise": "fte",
                    "Martin County": "martin",
                    "Palm Beach County": "palm_beach",
                    "St. Lucie County": "st_lucie"
                   },
    rawData = null, // Will hold raw client data
    filteredData = null, // Will hold data filtered by year
    dataView = getView(), // View toggle value
    minYear = Number(new Date().getFullYear()), // Min year for slider
    maxYear = Number(new Date().getFullYear()), // Max year for slider
    slider = document.getElementById('range_slider'), // Years range slider
    $spinner = $('.loading'), // Material Design Lite spinner
    $clients = $('.wrapper--clients'); // Clients content

/* Helper/Utility Functions
======================================================================= */

/**
 * Helper function to reset classes on the svg
 */
function resetClasses() {
  _.each(districtInfo, function(districtID) {
    $('#' + districtID + '_outline').attr('class', 'district_outline');
  });
}

/**
 * Helper function to get the value of the view toggle
 */
function getView() {

  // If checked, return numProjects, other jtd
  return $('#toggle-view').prop('checked') ? 'numProjects' : 'jtd';
}

/**
 * Helper function to update the view
 */
function updateView() {
  dataView = getView();
}

/**
 * Helper function to refresh the app view
 */
function refreshView() {
  updateView(); // Update the view
  colorMap(); // Color the map
}

/**
 * Helper function to update number of years
 */
function updateYears() {

  // Get the new years values
  var newYears = slider.noUiSlider.get();

  minYear = newYears[0]; // Update min
  maxYear = newYears[1]; // Update max
}

/**
 * Helper function to initialize slider
 */
function initSlider() {

  // Initialize the slider
  noUiSlider.create(slider, {
    range: {
      'min': minYear,
      'max': maxYear
    },
    start: [minYear, maxYear],
    step: 1,
    connect: true,
    format: {
      to: function(value) {
        return value;
      },
      from: function(value) {
        return value;
      }
    },
    behaviour: 'drag-tap'
  });

  $('.range_left').html(minYear); // Set min year
  $('.range_right').html(maxYear); // Set max year

  // When the slider update, refresh the years footnote
  slider.noUiSlider.on('update', function() {
    refreshYears();
  })
}

/**
 * Helper function to update range components
 */
function updateRangeInfo() {
  var $rangeFootnote = $('.range .footnote'); // Get range footnote

  // If the years are not the same, create full range
  if (minYear !== maxYear) {
    $rangeFootnote.html('<em>Data from ' + minYear + ' to ' + maxYear + '</em>');

    // Otherwise, just show current year
  } else {
    $rangeFootnote.html('<em>Data from ' + maxYear + '</em>');
  }
}


/**
 * Helper function to update client list info
 */
function updateClientList() {

  // Get the current district data attribute
  var currentDistrict = $('#client-list').attr('data-current-district');

  // If the current district name exists, re-build the list for this district
  if (currentDistrict) {
    listData(currentDistrict);
  }
}

/**
 * Helper function to refresh the app timeline
 */
function refreshYears() {
  updateYears(); // Update the years
  updateRangeInfo(); // Update the years footnote and labels
  resetClasses(); // Wipe out color classes
  analyzeData(); // Analyze the data
  updateClientList(); // Rebuild the client list
}

/* Data Analysis
======================================================================= */

/**
 * Function to initialize the app
 */
function init() {

  // Show the spinner and hide content while data is being loaded
  $spinner.show();
  $clients.hide();

  // Variables to form an AJAX request for data
  var requestURL = '/data', // The URL
      requestData = {
        sheet_id : '1jRWlr8K32ICVsiVdvkXHf7cmry58iDqkqhLQowMAyd8' // Spreadsheet
      };

  // Run the AJAX request
  $.getJSON(requestURL, requestData, function(response) {

    // Hide the spinner and show content when data loads successfully
    $spinner.hide();
    $clients.show();

    // Parse the data upon a successful response
    parseData(response);

    // On fail, alert the user and hide the loading screen
  }).fail(function() {
    $spinner.hide();

    alert("Sorry, there was an error loading the data. Please refresh the page or try again later.");
  });
}

/**
 * Function to read the data file
 */
function parseData(response) {

  // Use D3 to read the data file
  rawData = d3.csv.parse(response);

  // Analyze the data
  analyzeYears();
  analyzeData();
}

/**
 * Function to analyze the year information in the data
 */
function analyzeYears() {
  var yearsData = _.keys(_.groupBy(rawData, "YEAR")); // Group data by year

  maxYear = parseInt(_.max(yearsData)), // Get the most recent year
  minYear = parseInt(_.min(yearsData)), // Get the most distant year

  initSlider(); // Initialize the slider
}

/**
 * Function to analyze client data
 */
function analyzeData() {

  // Filter the data based on years requested
  filteredData = _.filter(rawData, function(obj) {
    var objYear = obj['YEAR'];

    // If year is between or equal to the min and max year, keep object
    return objYear >= minYear && objYear <= maxYear;
  });

  // Group the data by districts first
  var districts = _.groupBy(filteredData, "DISTRICT");

  // Loop through each district in the data
  for (var i in districts) {

    var district = _.sortBy(districts[i], 'CLIENT'), // Get the current district
        clients = _.groupBy(district, "CLIENT"); // Group by client

    // Loop through each client in the current district
    for (var j in clients) {

      var client = _.sortBy(clients[j], 'PROJECT').reverse(), // Get the current client
          projects = _.groupBy(client, "PROJECT"); // Group by project

      // Loop through each project in the current client
      for (var k in client) {
        var project = client[k], // Get the project
            projectFee = project['WGI FEES']; // Get the fee

        // If this project fee does not exist, make it 0
        if (projectFee === '' || projectFee === null || projectFee === null) {
          projectFee = '$0.00';
        }

        // Set this project equal to its fee
        client[k] = {
          fee: createNumber(projectFee),
          name: project['PROJECT'],
          year: project['YEAR']
        }
      }

      // Get the current client's total fee to date (JTD)
      var clientJTD = _.reduce(client, function(memo, project) {

        // Get the project fee without the commas and dollar sign
        var projectJTD = project['fee'];

        // If this project fee does not exist, make it 0
        if (projectJTD === '' || projectJTD === null || projectJTD === null) {
          projectJTD = 0;
        }

        // Add this project fee to the memo (starts at 0)
        return memo + projectJTD;
      }, 0);


      // Set current client equal to an object of its projects and JTD
      clients[j] = {
        name: j,
        projects: client,
        jtd: clientJTD,
        numProjects: _.size(client)
      };
    }

    // Sort clients by fees, desecending
    clients = _.sortBy(clients, "jtd").reverse();

    // Get the current district's total fee to date (JTD)
    var districtJTD = _.reduce(clients, function(memo, client) {

      // Get a client's JTD
      var clientJTD = client['jtd'];

      // Add this client's fee to the memo (starts at 0)
      return memo + clientJTD;
    }, 0);

    // Get the current district's number of projects
    var districtNumProjects = _.reduce(clients, function(memo, client) {
      return memo + client['numProjects'];
    }, 0);

    // Set the current district equal to an object of its clients and JTD
    districts[i] = {
      clients: clients,
      jtd: districtJTD,
      numClients: _.size(clients),
      numProjects: districtNumProjects
    }
  }

  // Updated client data to be the sorted data
  filteredData = districts;

  // Call function to color the map
  colorMap();
}

/* Data Visualizations
======================================================================= */

/**
 * Function to turn district map into choropleth
 */
function colorMap() {

  // Get minimum (either numProjects or jtd)
  var minDomain = _.min(filteredData, function(district) {
    return district[dataView];
  })[dataView];

  // If the minDomain is 0, sort by the view, filter out 0 values, and get the next lowest
  if (minDomain === 0) {
    minDomain = _.filter(_.sortBy(filteredData, function(district) {
      return district[dataView];
    }), function(district) {
      return district[dataView] > 0;
    })[0][dataView];
  }

  // Get maximum (either numProjects or jtd)
  var maxDomain = _.max(filteredData, function(district) {
    return district[dataView];
  })[dataView];

  // Get number of districts
  var lowerRange = 15 - _.size(filteredData);

  // Create a D3 log scale using min and max, then map to range of # districts
  var dScale = d3.scale.log()
    .domain([minDomain, maxDomain])
    .range([lowerRange, 14]);

  // Loop through each district
  _.each(filteredData, function(district, name) {

    // Get the ID and build the outline selector for this district
    var dSelector = '#' + districtInfo[name] + '_outline';

    // Get the log scale as a whole number and build color class (q#)
    var dClass = 'q' + Math.floor(dScale(district[dataView]));

    // Select the district svg part and change its class
    $(dSelector).attr('class', 'district_outline ' + dClass)
  });
}

/* Data Listing
======================================================================= */

/**
 * Function to list data
 */
function listData(districtName) {

  // If the district has data, build/rebuild the list
  if (filteredData.hasOwnProperty(districtName)) {

    var district = filteredData[districtName], // Get the district by name
        districtClients = district['clients'], // Get the clients
        $clientDiv = $('#client-list'), // Get client-list div as jQuery
        $clientList = $('<div class="client-list_clients"></div>'); // Create jQuery ul

    // Clear previous list
    $clientDiv.html('').attr('data-current-district', districtName);

    // Call function to build the heading for this district
    buildHeader($clientDiv, district, districtName);

    // Call function to build client list for this district
    buildClient(districtClients, $clientList);

    // Append the final list to the client-list div
    $clientDiv.append($clientList);

    // Otherwise, clear the list
  } else {
    $('#client-list').html('');
  }
}

/**
 * Function to build client list header
 */
function buildHeader($clientDiv, district, districtName) {

  // Start a jQuery element for an h3
  var $clientHeading = $('<h3 class="client-list_title"></h3>');

  // Append the district name and number of projects
  $clientHeading.append($('<span class="client-list_name">' + districtName + ' (' + district['numProjects'] + ')</span>'));

  // Append a flex spacer that will appear as a dotted line
  $clientHeading.append($('<span class="client-list_colon">:&nbsp;</span><span class="client-list_flex"></span>'));

  // Append the job-to-date dollars
  $clientHeading.append($('<span class="client-list_jtd">' + currencyFormat(district['jtd']) + '</span>'));

  // Append the heading to the list html
  $clientDiv.append($clientHeading);
}

/**
 * Function to build client list client items
 */
function buildClient(districtClients, $clientList) {

  // Loop through each client in the district
  _.each(districtClients, function(clientItem) {

    var clientName = clientItem['name'], // Get the name
        clientProjects = clientItem['projects']; // Get the projects

    // Start a jQuery element for a list item
    var $clientItem = $('<div class="client-list_item section accordion_header"></div>');

    // Append the client name and number of projects
    $clientItem.append($('<span class="client-list_name"><i class="material-icons">chevron_right</i>' + clientName + ' (' + clientItem['numProjects'] + ')</span>'));

    // Append a flex spacer that will appear as a dotted line
    $clientItem.append($('<span class="client-list_colon">:&nbsp;</span><span class="client-list_flex"></span>'));

    // Append the job-to-date dollars
    $clientItem.append($('<span class="client-list_jtd">' + currencyFormat(clientItem['jtd']) + '</span>'));

    // Append the list item to the list html
    $clientList.append($clientItem);

    // Call function to build projects for this client
    buildProjects(clientProjects, $clientList);
  });
}

/**
 * Function to build client list client projects
 */
function buildProjects(clientProjects, $clientList) {

  // Start a jQuery element for a list item
  var $projectList = $('<div class="client-list_projects section accordion_content"></div>')

  // Loop through each project for the client
  _.each(clientProjects, function(projectItem) {
    var projectName = projectItem['name'];
    var projectYear = projectItem['year'];
    var projectFee = projectItem['fee'];

    // Start a jQuery element for a list item
    var $projectItem = $('<div class="client-list_item"></div>');

    // Append the project name and year
    $projectItem.append($('<span class="client-list_name"><i class="material-icons">label_outline</i>' + projectName + ' (' + projectYear + ')</span>'));

    // Append a flex spacer that will appear as a dotted line
    $projectItem.append($('<span class="client-list_colon">:&nbsp;</span><span class="client-list_flex"></span>'));

    // Append the job-to-date dollars
    $projectItem.append($('<span class="client-list_jtd">' + currencyFormat(projectFee) + '</span>'));

    // Append the li item to the list html
    $projectList.append($projectItem);
  });

  $clientList.append($projectList);
}

/* Logic
======================================================================= */
init(); // Intialize the app

/* Event Listeners
======================================================================= */

/**
 * Event listener to update tooltip location on mouse move
 */
$(document).mousemove(function(event) {
  var pageX = event.pageX, // Get the X position of the mouse
      pageY = event.pageY, // Get the Y position of the mouse
      $window = $(window), // Get the window
      windowH = $window.height(), // Get the window height
      windowW = $window.width(), // Get the window width
      $tooltip = $('#client-map_tooltip'), // Get the tooltip
      tooltipH = $tooltip.outerHeight(), // Get the tooltip height
      tooltipW = $tooltip.outerWidth(), // Get the tooltip width
      tooltipX = event.pageX + 16, // Tooltip X default
      tooltipY = event.pageY + 16; // Tooltip Y default

  // If the mouse X position plus the tooltip width is greater than window width, reverse size of cursor tooltip appears on
  if (pageX + tooltipW > windowW) {
    tooltipX = pageX - tooltipW - 16;
  }

  // If the mouse Y position plus the tooltip height is greater than window width, reverse size of cursor tooltip appears on
  if (pageY + tooltipH > windowH) {
    tooltipY = pageY - tooltipH - 16;
  }

  // Set the position of the tooltip
  $('#client-map_tooltip').offset({top: tooltipY, left: tooltipX});
});

/**
 * Event listener for view toggle that updates view and then recolors map
 */
$('#toggle-view').change(function() {
  refreshView();
});

// Add event listeners for a district
$('.district').click(function() {

  // On click, list data for a district
  listData($(this).attr('data-full-name'));

  $('#wrapper').scrollTop(1000);

  /**
   * Event listener to make updates when mouse is over a district
   */
}).mouseover(function() {
  if ($(window).width() > 640) {

    var dName = $(this).attr('data-full-name'), // Get district name
        $tooltip = $('#client-map_tooltip'), // Get the tooltip
        tooltipHTML = ''; // Wipe old value

    if (filteredData.hasOwnProperty(dName) && filteredData[dName].hasOwnProperty(dataView)) {

      var dData = filteredData[dName][dataView]; // Get data for district

      // If this is view by dollars, format data as currency
      if (dataView === 'jtd') {
        dData = currencyFormat(dData);

        // Otherwise, do stuff
      } else {
        var plural = ''; // Set plural to empty string

        // If data is not 1, add an s
        if (dData !== 1) {
          plural = 's';
        }

        // Add plural value
        dData += ' project' + plural;
      }

      // Add header with district name to tooltip
      tooltipHTML += '<h5>' + dName + '</h5>';

      // Add district data to tooltip
      tooltipHTML += '<p>' + dData + '</p>';

      // Add html for tooltip
      $tooltip.html(tooltipHTML);

      // Show the tooltip
      $tooltip.show();
    }
  }

  /**
   * Event listener to hide tooltip when mouse is not over a district
   */
}).mouseleave(function() {
  $('#client-map_tooltip').hide();
});

/**
 * Event listener to toggle content when accordion header is clicked
 */
$('#client-list').on('click', '.accordion_header', function() {
  $(this).toggleClass('active').next().slideToggle();
});
