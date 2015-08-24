/* =======================================================================
   Opportunities
   ======================================================================= */

/* Variables
======================================================================= */
var locationColors = { // Object of location fill and stroke colors
                      "fort lauderdale": ['#EDED6A', '#F4F4A6'],
                      jacksonville: ['#008EE5', '#66BBEF'],
                      orlando: ['#936FEE', '#BEA9F5'],
                      tallahassee: ['#FFA435', '#FFC886'],
                      tampa: ['#FC5561', '#FD99A0'],
                      "west palm beach": ['#00B058', '#66D09B']
                     },
    divisionTextures = { // Object of textures for division backgrounds
                        civil: "url(#dot)",
                        creative: "url(#vertical-stripe)",
                        "e/p/la": "url(#horizontal-stripe)",
                        "survey/sue": "url(#crosshatch)",
                        transportation: "url(#diagonal-stripe)"
                       },
    tooltipLabels = [ // Array of labels to build a tooltip
                     'NUMBER', 'LOCATION', 'DIVISION',
                     'PM', 'CLIENT', 'MARKETING COORD',
                     'WGI FEES', 'MOU COMPLETE', 'STIPEND AMOUNT',
                     'STATUS', 'START DATE', 'END DATE'
                    ],
    rawData = null, // Raw client data
    filterValues, // Values that are currently checked in the filters
    filteredData = [], // Array of project data broken into phases
    projectList = [], // Array of project names
    projectLength, // Number of projects once filtered
    $win = $(window), // jQuery window element
    $spinner = $('.loading'), // Material Design Lite spinner
    $opportunities = $('.wrapper--opportunities'), // Opportunities content
    w, // Width of SVG
    h, // Height of SVG
    m = [24, 24, 144, 160], // Margins for the SVG
    todaysDate = new Date(); // Todays date

/* Helper/Utility Functions
======================================================================= */

/**
 * Helper function to build tooltip for a phase of a project
 */
function buildTooltip(phaseObj) {

  // Start building the html using the phase name as a header
  var tooltipHTML = '<h3>' + phaseObj['PHASE NAME'] + '</h3>';

  // Loop through all labels that can be used in a tooltip
  for (var i = 0; i < tooltipLabels.length; i++) {

    // Get the current label value
    var labelVal = tooltipLabels[i];

    // If this phase has this label, use it
    if (phaseObj.hasOwnProperty(labelVal)) {
      if (phaseObj[labelVal]) {

        // Add a label and the value of this tooltip to the html
        tooltipHTML += '<strong>' + labelVal + ':</strong> ' + phaseObj[labelVal] + '<br>';
      }
    }
  }

  // Return the full html of the tooltip
  return tooltipHTML;
}

/**
 * Helper function to resize SVG
 */
function resizeSVG() {

  // If the window width is greater than 640px, take margins off chart width
  $win.width() > 640 ? w = $('#opportunities-chart').width() - m[1] - m[3] : w = 640 - m[1] - m[3];

  // Set height to project length * 50
  h = (projectLength * 50);

  drawSVG(); // Redraw the chart
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
  $opportunities.hide();

  // Traditional settings for query params to similar ones as q, not q[]
  $.ajaxSettings.traditional = true;

  // Variables to form an AJAX request for data
  var requestURL = '/data', // The URL
      requestData = {
        sheet_id : ['1UMJAD0GljJErRgHE8cmgyeAZHZIGOYaC0HbpHorSlb0', '1--xnM_q-QZ9fYBj7er0j-khu_QBskbWVX9dvLOwbji8'] // Spreadsheet IDs
      };

  // Run the AJAX request
  $.get(requestURL, requestData, function(response) {

    // Hide the spinner and show content when data loads successfully
    $spinner.hide();
    $opportunities.show();

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

  // Analyze the data
  filterData();
}

/**
 * Function to filter the data into phases (where dates exist for a phase)
 */
function filterData() {

  // Reset list of project names and filtered data
  projectList.length = 0;
  filteredData.length = 0;

  // Get all checked filter options and map their values to an array
  filterValues = _.map($('.opportunities-checkbox input:checked'), function(filter) {
    return $(filter).val();
  });

  // Initialize project count to 0
  var projCount = 0;

  // Loop through each project in the raw data
  _.each(rawData, function(project) {

    // Initialize some variables for each phase
    var phase1 = {},
        phase1Flag = false,
        phase2 = {},
        phase2Flag = false,
        phase3 = {},
        phase3Flag = false;

    // For column in a project, do stuff
    for (var col in project) {

      // If this is not one of the columns specified, push the value of the column to each phase
      if (['PROJECT NAME', 'LOCATION', 'DIVISION', 'AD DATE', 'ELOI DUE', 'ELOI SCORE', 'TECH/PACKET DUE', 'PRICE/PRESENTATION DUE'].indexOf(col) === -1) {
        phase1[col] = project[col];
        phase2[col] = project[col];
        phase3[col] = project[col];

        // Otherwise, if this is the location column, do some filtering
      } else if (col === 'LOCATION') {

        // If it's protested, make its fill and stroke colors gray
        if (project['STATUS'] === 'Protested') {
          phase1['COLORS'] = ['#BBBBBB', '#D6D6D6'];
          phase2['COLORS'] = ['#BBBBBB', '#D6D6D6'];
          phase3['COLORS'] = ['#BBBBBB', '#D6D6D6'];

          // Otherwise, push fill and strokes colors for this location
        } else {
          phase1['COLORS'] = locationColors[project[col].toLowerCase()];
          phase2['COLORS'] = locationColors[project[col].toLowerCase()];
          phase3['COLORS'] = locationColors[project[col].toLowerCase()];
        }

        // Push the value of this column to each phase
        phase1[col] = project[col];
        phase2[col] = project[col];
        phase3[col] = project[col];

        // Otherwise, if this is the division column, do some filtering
      } else if (col === 'DIVISION') {

        // Push the texture for this division
        phase1['TEXTURE'] = divisionTextures[project[col].toLowerCase()];
        phase2['TEXTURE'] = divisionTextures[project[col].toLowerCase()];
        phase3['TEXTURE'] = divisionTextures[project[col].toLowerCase()];

        // Push the value of this column to each phase
        phase1[col] = project[col];
        phase2[col] = project[col];
        phase3[col] = project[col];
      }
    }

    // If project has an AD, ELOI value, and is not being filtered out, push Phase 1
    if (project['AD DATE'] && project['ELOI DUE'] && (filterValues.indexOf(project['DIVISION']) !== -1) && (filterValues.indexOf(project['LOCATION']) !== -1)) {
      phase1['id'] = projCount;
      phase1['START DATE'] = project['AD DATE'];
      phase1['END DATE'] = project['ELOI DUE'];
      phase1['PHASE NAME'] = 'Letter';
      phase1['PROJECT NAME'] = project['PROJECT NAME'];
      phase1['TOOLTIP'] = buildTooltip(phase1);
      filteredData.push(phase1); // Push all phase 1 values to filtered data
      phase1Flag = true; // Indicate this project has a phase 1
    }

    // If project has an ELOI Score, Tech/Packet value, and is not being filtered out, push Phase 2
    if (project['ELOI SCORE'] && project['TECH/PACKET DUE'] && (filterValues.indexOf(project['DIVISION']) !== -1) && (filterValues.indexOf(project['LOCATION']) !== -1)) {
      phase2['id'] = projCount;
      phase2['START DATE'] = project['ELOI SCORE'];
      phase2['END DATE'] = project['TECH/PACKET DUE'];
      phase2['PHASE NAME'] = 'Tech';
      phase2['PROJECT NAME'] = project['PROJECT NAME'];
      phase2['TOOLTIP'] = buildTooltip(phase2);
      filteredData.push(phase2); // Push all phase 2 values to filtered data
      phase2Flag = true; // Indicate this project has a phase 2
    }

    // If project has Tech/Packet, Price/Presentation value, and is not being filtered out, push Phase 3
    if (project['TECH/PACKET DUE'] && project['PRICE/PRESENTATION DUE'] && (filterValues.indexOf(project['DIVISION']) !== -1) && filterValues.indexOf(project['LOCATION']) !== -1) {
      phase3['id'] = projCount;
      phase3['START DATE'] = project['TECH/PACKET DUE'];
      phase3['END DATE'] = project['PRICE/PRESENTATION DUE'];
      phase3['PHASE NAME'] = 'Price';
      phase3['PROJECT NAME'] = project['PROJECT NAME'];
      phase3['TOOLTIP'] = buildTooltip(phase3);
      filteredData.push(phase3); // Push all phase 3 values to filtered data
      phase3Flag = true; // Indicate this project has a phase 3
    }

    // If a project has values for ANY of the phases, increase the count and push its name to list
    if (phase1Flag || phase2Flag || phase3Flag) {
      projCount++;
      projectList.push(project['PROJECT NAME']);
    }
  });

  // Set the project length to the length of the project names list
  projectLength = projectList.length;

  updateSVG(); // Size and draw the SVG chart
};

/* Create SVG
======================================================================= */
function drawSVG() {

  // Remove the old SVG chart and tooltip
  $('#opportunities-chart svg, #opportunities-chart .tooltip').remove();

  // Begin the new SVG chart with D3 and store it
  var viz = d3.select('#opportunities-chart')
                .append('svg')
                  .attr('id', 'container') // Set ID
                  .attr('width', w + m[1] + m[3]) // Set width (width + margins)
                  .attr('height', h + m[0] + m[2]); // Set height (height + margins)

  // Create a D3 time scale for the x axis
  var xScale = d3.time.scale()
                  .domain([ // Domain is earliest to latest start or end date
                           d3.min(filteredData, function(d) {
                             return Math.min(createDate(d['START DATE']), createDate(d['END DATE']), todaysDate);
                           }),
                           d3.max(filteredData, function(d) {
                             return Math.max(createDate(d['START DATE']), createDate(d['END DATE']), todaysDate);
                           })
                        ])
                  .range([0, w]); // Map to range of zero to the width of the chart

  // Create the x axis along the bottom of the chart
  var xAxis = d3.svg.axis()
                  .scale(xScale)
                  .orient("bottom")
                  .tickFormat(d3.time.format("%b %Y")); // Format as MMM YYYY

  // Create a D3 linear scale for the y axis
  var yScale = d3.scale.linear()
                  .domain([0, projectLength]) // Domain is 0 to number of projects
                  .range([0, h]); // Range is 0 to height of chart

  // Create the scale for the thickness (height) of a project on the chart
  var hScale = d3.scale.linear()
                  .domain([ // Domain is lowest to heightest WGI fee value
                           d3.min(filteredData, function(d) {
                             return createNumber(d['WGI FEES']);
                           }),
                           d3.max(filteredData, function(d) {
                             return createNumber(d['WGI FEES']);
                           })
                          ])
                  .range([16, 40]); // Range is min height of 16 to max height of 40

  // Start a group to hold the visualization and translate it by the left and top margin amounts
  var vizGroup = viz.append('g')
                      .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

  // Create a group to hold lines that create project and chart borders
  var vizLines = vizGroup.append('g');

  // Enter the filtered data and draw lines for each project
  vizLines.selectAll('line')
    .data(filteredData)
    .enter().append('line')
      .attr('x1', 0) // Start x at 0
      .attr('y1', function(d, i) {return yScale(d['id'])}) // Start y at position of project from y scale
      .attr('x2', w) // End x at width of the chart
      .attr('y2', function(d, i) {return yScale(d['id'])}) // End y at position of project from y scale
      .attr('stroke', '#eee')
      .attr('stroke-width', 1);

  // Draw line separating bottom of chart from x axis labels
  vizLines.append('line')
              .attr('x1', 0) // Start x at 0
              .attr('y1', h) // Start y at bottom (height) of chart
              .attr('x2', w) // End x at width of chart
              .attr('y2', h) // End y at bottom (height) of chart
              .attr('stroke', '#eee')
              .attr('stroke-width', 1);

  // Draw line separating left of chart from y axis labels
  vizLines.append('line')
              .attr('x1', 0) // Start x at 0
              .attr('y1', 0) // Start y at 0
              .attr('x2', 0) // End x at 0
              .attr('y2', h) // End y at bottom (height) of chart
              .attr('stroke', '#eee')
              .attr('stroke-width', 1);

  // Draw line bordering the right of the chart
  vizLines.append('line')
              .attr('x1', w) // Start x at width of chart
              .attr('y1', 0) // Start y at 0
              .attr('x2', w) // End x at width of chart
              .attr('y2', h) // End y at bottom (height) of chart
              .attr('stroke', '#eee')
              .attr('stroke-width', 1);

  // Create a group to hold the today marker
  var vizToday = vizGroup.append('g');

  // Draw the line across the chart for today
  vizToday.append('line')
              .attr('x1', xScale(todaysDate)) // Start x at position of today's date from x time scale
              .attr('y1', 0) // Start y at 0
              .attr('x2', xScale(todaysDate)) // End x at position of today's date from x time scale
              .attr('y2', h) // End y at bottom (height) of chart
              .attr('stroke', '#00DF00')
              .attr('stroke-width', 2);

  // Add "TODAY" text
  vizToday.append('text')
              .text('TODAY')
              .attr('fill', '#00DF00')
              .attr('text-anchor', 'middle') // Center align text
              .attr('transform', 'translate(' + (xScale(todaysDate)) + ', -4)') // Place at today's date
              .style('font-weight', 700)
              .style('font-size', '1.5rem');

  // Create a group to hold the axes
  var vizAxes = vizGroup.append('g');

  // Create a group for the x axis
  vizAxes.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(-8,' + h + ')') // Move x axis to bottom (height) of chart
        .call(xAxis); // Get the xAxis

  // Create a group for the y axis
  vizAxes.append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate(-8, 0)').selectAll('text') // Move it 8px left
    .data(projectList) // Enter list of project names
    .enter().append('text')
    .text(function(d) {return d.substring(0, 16)}) // Add 16 chars of each name
    .attr('x', 0)
    .attr('y', function(d, i) {return yScale(i+0.5)}) // Place in the middle of y position from y scale
    .attr('dy', '0.5ex')
    .attr("text-anchor", "end") // Right align
    .attr('fill', '#555')
    .attr('font-weight', '700');

  // Create a group for the phases
  var vizPhases = vizGroup.append('g').selectAll('g')
    .data(filteredData) // Enter the data
    .enter().append('g') // Append a group for a phase
    .attr('transform', function(d) {return 'translate(' + xScale(createDate(d["START DATE"])) + ', ' +  yScale(d['id']) + ')'}) // Move it to its position based on x time scale and y position scale
    .attr('class', 'phase');

  // Append a rectangle for the phase
  vizPhases.append('rect')
    .attr('height', function(d) {return hScale(createNumber(d['WGI FEES']))}) // Height by fee amount
    .attr('fill', function(d) {return d['COLORS'][1]}) // Fill based on its color values
    .attr('stroke', function(d) {return d['COLORS'][0]}) // Stroke based on its color values
    .attr('stroke-width', 2)
    .attr('transform', function(d) {return 'translate(0, ' + (((h / projectLength) - hScale(createNumber(d['WGI FEES']))) / 2) + ')'}) // Move to middle of row (row height - half its height)
    .attr('width', 0)
    .transition().duration(1500) // Transition width over 1.5s
    .attr('width', function(d) {return xScale(createDate(d["END DATE"])) - xScale(createDate(d["START DATE"]))}); // Width of a phase is its end date minus its start date on the x time scale

  // Append a rectangle for the texture
  vizPhases.append('rect')
    .attr('height', function(d) {return hScale(createNumber(d['WGI FEES']))}) // Height by fee amount
    .attr('fill', function(d) {return d['TEXTURE']}) // Fill is the texture for this phase
    .attr('fill-opacity', 0.2)
    .attr('transform', function(d) {return 'translate(0, ' + (((h / projectLength) - hScale(createNumber(d['WGI FEES']))) / 2) + ')'}) // Move to middle of row (row height - half its height)
    .attr('width', 0)
    .transition().duration(1500) // Transition width over 1.5s
    .attr('width', function(d) {return xScale(createDate(d["END DATE"])) - xScale(createDate(d["START DATE"]))}); // Width of a phase is its end date minus its start date on the x time scale

  // Append phase name
  vizPhases.append('text')
    .text(function(d) {return d['PHASE NAME']}) // Set text as phase name
    .attr('transform', function(d) {return 'translate(4, ' + (h / projectLength / 2) + ')'}) // Move down
    .attr('dy', '0.5ex')

  // Create the tooltip and append to chart
  var vizTooltip = d3.select('#opportunities-chart').append('div')
                    .attr('class', 'tooltip')
                    .style('opacity', 0);

  /**
   * Event listener for hovering over a phase
   */
  vizPhases.on("mouseenter", function(d, i) {

    // Select this phase
    var phase = d3.select(this);

    // Get the rectangle
    phase.select('rect')
            .attr('fill', d['COLORS'][0]); // Set fill to border color

    // Transition the tooltip to full opacity over 0.3s
    vizTooltip.transition()
                .duration(300)
                .style('opacity', 1);

    // Build tooltip
    vizTooltip.html(d['TOOLTIP']) // Set html to the tooltip built while filtering data
                .style('left', function() { // Set left position

                  // Get width of tooltip
                  var tooltipWidth = $('#opportunities-chart .tooltip').width();

                  // If the tooltip + position is outside the window, move it to the other side
                  if ((d3.event.pageX + tooltipWidth) > w) {
                    return (d3.event.pageX - tooltipWidth) + 'px';

                    // Otherwise, position where mouse is
                  } else {
                    return d3.event.pageX + 'px';
                  }
                })
                .style('top', function() { // Set top position

                  // Get height of tooltip
                  var tooltipHeight = $('#opportunities-chart .tooltip').height();

                  // If the tooltip + position is outside the window, move it to the other side
                  if ((d3.event.pageY + tooltipHeight) > h) {
                    return (d3.event.pageY - tooltipHeight) + 'px';

                    // Otherwise, position where mouse is
                  } else {
                    return d3.event.pageY + 'px';
                  }
                });
  });

  /**
   * Event listener for mouse leaving hovering over a phase
   */
  vizPhases.on("mouseleave", function(d, i) {

    // Select this phase
    var phase = d3.select(this);

    // Get the rectangle
    phase.select('rect')
          .attr('fill', d['COLORS'][1]); // Set fill back to original fill color

    // Transition tooltip to no opacity over 0.5s
    vizTooltip.transition()
                .duration(300)
                .style('opacity', 0);
  });
}

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
 * Event listener to update SVG when filter changes
 */
$('.opportunities-checkbox input:checked').change(function() {

  // Change state of this checkbox: either checked or not
  $(this).parents('.opportunities-checkbox').toggleClass('checked');

  // Update filtered data and SVG to reflect change
  filterData();
});
