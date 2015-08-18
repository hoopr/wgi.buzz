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
# Handler for Opportunities page (inherits from base handler in utils.py)
##
class opportunitiesHandler(utils.baseHandler):

  ##
  # Function to handle when get request is made
  ##
  def get(self):

    # Get the user, sign in url, and sign out url
    user, sign_in_url, sign_out_url = utils.get_user();

    # Get the sheet data from Opportunities (EPLA, Transportation) spreadsheets
    sheet_data = utils.get_drive_data(['1UMJAD0GljJErRgHE8cmgyeAZHZIGOYaC0HbpHorSlb0', '1--xnM_q-QZ9fYBj7er0j-khu_QBskbWVX9dvLOwbji8'])

    # If the user exists (is logged in), render the page
    if user:
      self.render("project-managers/opportunities.html", sign_out_url=sign_out_url, sheet_data=sheet_data)

    # If the user is not logged in, redirect to the sign in url
    else:
      self.redirect(sign_in_url)
