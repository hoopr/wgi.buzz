/* =======================================================================
   Utilities
   ======================================================================= */

/* Functions
======================================================================= */

/**
 * Helper function to convert number to currency (comes out as $x.xx)
 */
function currencyFormat(number) {
  var decimalplaces = 2;
  var decimalcharacter = ".";
  var thousandseparater = ",";
  number = parseFloat(number);
  var sign = number < 0 ? "-" : "";
  var formatted = new String(number.toFixed(decimalplaces));
  if( decimalcharacter.length && decimalcharacter != "." ) { formatted = formatted.replace(/\./,decimalcharacter); }
  var integer = "";
  var fraction = "";
  var strnumber = new String(formatted);
  var dotpos = decimalcharacter.length ? strnumber.indexOf(decimalcharacter) : -1;
  if( dotpos > -1 )
  {
    if( dotpos ) { integer = strnumber.substr(0,dotpos); }
    fraction = strnumber.substr(dotpos+1);
  }
  else { integer = strnumber; }
  if( integer ) { integer = String(Math.abs(integer)); }
  while( fraction.length < decimalplaces ) { fraction += "0"; }
  temparray = new Array();
  while( integer.length > 3 )
  {
    temparray.unshift(integer.substr(-3));
    integer = integer.substr(0,integer.length-3);
  }
  temparray.unshift(integer);
  integer = temparray.join(thousandseparater);
  return sign + '$' + integer + decimalcharacter + fraction;
}

/**
 * Helper function to convert currency to number
 */
function createNumber(currencyString) {
  return parseFloat(currencyString.replace(/(\$|,)/g, ''));
}

/**
 * Helper function to convert string to date
 */
function createDate(dateString) {
  var format = d3.time.format("%-m/%-d/%Y");
  return format.parse(dateString);
};

/**
 * Helper function to convert date to string
 */
function createString(date) {
  var format = d3.time.format("%-m/%-d/%Y");
  return format(date)
};
