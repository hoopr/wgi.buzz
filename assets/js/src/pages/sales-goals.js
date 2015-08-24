/* =======================================================================
   Sales Goals
   ======================================================================= */

/* Variables
======================================================================= */
var rawData = null, // Raw sales goals data
    formattedData = [], // Array of data thats been formatted for bullets
    totalMaxSales = 0, // Max of goals vs. sales for total
    officeMaxSales = 0, // Max of goals vs. sales for offices
    $win = $(window), // jQuery window element
    $spinner = $('.loading'), // Material Design Lite spinner
    $salesGoals = $('.wrapper--sales-goals'), // Sales Goals content
    m = [24, 24, 24, 160], // Margins for a bullet section,
    h = 125 - m[0] - m[2], // Height of a bullet section
    w, // Width of the SVG chart
    year = {{ year }}, // The year of sales goals data
    sheetIDs = {
      2015 : '15eCdm0k0e_X8dSA414bCGLXkAb98Fy2RabwXj3toWms',
      2016 : '16sHzeupzLJAeV5Ak_LwzKBl0R4Go68024wqz1hPFRVo'
    },
    shortNames = { // Object for converting long office names to abbreviations
      'Fort Lauderdale' : 'fll',
      'Jacksonville' : 'jax',
      'Orlando' : 'orl',
      'Tallahassee' : 'tal',
      'Tampa' : 'tpa',
      'West Palm Beach' : 'wpb'
    };
    shortNames[year + ' Total'] = 'total'; // Abbreviation for year total

/* Helper/Utility Functions
======================================================================= */

/**
 * Helper function to resize bullet sections
 */
function resizeSVG() {

  // If the window width is greater than 640px, take margins off chart width
  $win.width() > 640 ? w = $('#sales-goals-chart').width() - m[1] - m[3] : w = 640 - m[1] - m[3];

  drawSVG(); // Redraw the SVG
}

/**
 * Helper function to update the SVG
 */
function updateSVG() {
  resizeSVG(); // Resize the chart
  drawSVG(); // Redraw the chart
}

/**
 * Helper function to update SVG on window resize (only every 300ms)
 */
var resizeWindow = _.debounce(function() {
  updateSVG();
}, 300);

/* Data Analysis
======================================================================= */

/**
 * Function to initialize the app
 */
function init() {

  // Show the spinner and hide content while data is being loaded
  $spinner.show();
  $salesGoals.hide();

  // Variables to form an AJAX request for data
  var requestURL = '/data', // The URL
      requestData = {
        sheet_id : sheetIDs[year] // The spreadsheet ID based on the year
      };

  // Run the AJAX request
  $.get(requestURL, requestData, function(response) {

    // Hide the spinner and show content when data loads successfully
    $spinner.hide();
    $salesGoals.show();

    // Parse the data upon a successful response
    parseData(JSON.parse(response));

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

  // Reset formattedData
  formattedData.length = 0;

  // Analyze the data
  getMaxValues();
}

/**
 * Function to get the max of the Totals section and of the Offices
 */
function getMaxValues() {

  // Loop through each office
  _.each(rawData, function(office) {

    var goals = createNumber(office[year + ' GOALS']) / 1000000, // Get goal
        sales = createNumber(office[year + ' SALES']) / 1000000, // Get sales
        name = office['OFFICE']; // Get the office name

    // If this is the "TOTAL:" section, make max goal vs. sales
    if (name === 'TOTAL:') {
      totalMaxSales =  Math.max(goals, sales);

      // Or if this is an office, get max of all office goals vs. sales
    } else {
      officeMaxSales = Math.max(officeMaxSales, Math.max(goals, sales));
    }
  });

  formatData();
}

/**
 * Function to format the data for presentation as bullet charts
 */
function formatData() {

  _.each(rawData, function(office) {

    // Set goal and sales number for each section (total or an office)
    var goals = createNumber(office[year + ' GOALS']) / 1000000,
        sales = createNumber(office[year + ' SALES']) / 1000000,
        goals25p = goals * 0.25,
        goals50p = goals * 0.5,
        goals75p = goals * 0.75,
        locData = {};

    // If this is the total section, set title and ranges based on total max
    if (office['OFFICE'] === 'TOTAL:') {
      locData['title'] = year + ' Total';
      locData['ranges'] = [goals25p, goals50p, goals75p, goals, totalMaxSales];

      // Or if this is an office, set title and ranges based on office max
    } else {
      locData['title'] = office['OFFICE'];
      locData['ranges'] = [goals25p, goals50p, goals75p, goals, officeMaxSales];
    }

    locData['subtitle'] = '$, millions'; // Set description of dollars
    locData['measures'] = [sales]; // Set values for where to put measures
    locData['markers'] = [goals]; // Set values for where to put markers

    // Add this office data to the formatted data array
    formattedData.push(locData);
  });

  // Pull totals from the end and put on the front of the array
  formattedData.unshift(formattedData.pop());

  updateSVG(); // Size and draw the SVG chart
}

/* Create SVG
======================================================================= */
function drawSVG() {

  // Remove old SVG chart and tooltip
  $('#sales-goals-chart svg, #sales-goals-chart .tooltip').remove();

  // Begin the bullet chart with D3 and store it
  var viz = d3.bullet()
                .width(w)
                .height(h)
                .duration(1500);

  // Create the SVG for bullet for each section
  var vizSVG = d3.select('#sales-goals-chart').selectAll("svg")
                  .data(formattedData) // Enter the data
                  .enter().append("svg") // Append an SVG for each section
                    .attr("class", function(d) { // Append class for section
                      return "bullet " + shortNames[d.title]; // Return the title
                    })
                    .attr("width", w + m[1] + m[3]) // Set width + margins
                    .attr("height", h + m[0] + m[2]) // Set height + margins
                  .append("g") // Append a group and translate left margin amount
                    .attr("transform", "translate(" + m[3] + ", 0)")
                    .call(viz); // Call the bullet

  // Create titles group and store
  var vizTitle = vizSVG.append("g")
                    .style("text-anchor", "end") // Right align
                    .attr("transform", "translate(-6," + h / 2 + ")"); // Move to middle

  // Append text to each title group
  vizTitle.append("text")
          .attr("class", "title") // Class of "title"
          .text(function(d) { return d.title; }); // Set text to be office title

  // Append more text to each title group
  vizTitle.append("text")
          .attr("class", "subtitle") // Class of "subtitle"
          .attr("dy", "1em")
          .html(function(d) { return d.subtitle; }); // Set text to description
};

/* Logic
======================================================================= */
init(); // Initialize the app

/* Event Listeners
======================================================================= */

/**
 * Event listener to update the chart when window resizes
 */
$(window).on('resize', resizeWindow);


/**
 * Event listener for year toggle that updates data when toggle changes
 */
$('#toggle-year').change(function() {

  // Update the year
  year = $(this).prop('checked') ? 2016 : 2015;

  // Update the data
  init();
});

