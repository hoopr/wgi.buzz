"""
Base Imports
"""
import webapp2

"""
Utilities
"""
from src import utils

"""
Handlers
"""

##
# Handler for Sales Goals page (inherits from base handler in utils.py)
##
class salesGoalsHandler(utils.baseHandler):

  ##
  # Function to handle when get request is made
  ##
  def get(self):

    # Get the current year from the request
    year = self.request.get("year")

    # If no year in the request, set it equal to the current year
    if not year:
      year = utils.get_this_year();

    # Get the user, sign in url, and sign out url
    user, sign_in_url, sign_out_url = utils.get_user();

    # If the user exists (is logged in), render the page
    if user:
      self.render("pages/sales-goals.html", page_title="Sales Goals", sign_out_url=sign_out_url, year=year)

    # If the user is not logged in, redirect to the sign in url
    else:
      self.redirect(sign_in_url)
