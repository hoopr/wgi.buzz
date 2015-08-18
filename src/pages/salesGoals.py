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
# Handler for 2015 Sales Goals page (inherits from base handler in utils.py)
##
class salesGoals2015Handler(utils.baseHandler):

  ##
  # Function to handle when get request is made
  ##
  def get(self):

    # Get the user, sign in url, and sign out url
    user, sign_in_url, sign_out_url = utils.get_user();

    # Get the sheet data from 2015 Sales spreadsheet
    sheet_data = utils.get_drive_data(['15eCdm0k0e_X8dSA414bCGLXkAb98Fy2RabwXj3toWms'])

    # If the user exists (is logged in), render the page
    if user:
      self.render("transportation/sales-goals/2015.html", sign_out_url=sign_out_url, sheet_data=sheet_data)

    # If the user is not logged in, redirect to the sign in url
    else:
      self.redirect(sign_in_url)

##
# Handler for 2016 Sales Goals page (inherits from base handler in utils.py)
##
class salesGoals2016Handler(utils.baseHandler):

  ##
  # Function to handle when get request is made
  ##
  def get(self):

    # Get the user, sign in url, and sign out url
    user, sign_in_url, sign_out_url = utils.get_user();

    # Get the sheet data from 2016 Sales spreadsheet
    sheet_data = utils.get_drive_data(['16sHzeupzLJAeV5Ak_LwzKBl0R4Go68024wqz1hPFRVo'])

    # If the user exists (is logged in), render the page
    if user:
      self.render("transportation/sales-goals/2016.html", sign_out_url=sign_out_url, sheet_data=sheet_data)

    # If the user is not logged in, redirect to the sign in url
    else:
      self.redirect(sign_in_url)
