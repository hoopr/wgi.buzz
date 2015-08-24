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
# Handler for Clients page (inherits from base handler in utils.py)
##
class clientsHandler(utils.baseHandler):

  ##
  # Function to handle when get request is made
  ##
  def get(self):

    # Get the user, sign in url, and sign out url
    user, sign_in_url, sign_out_url = utils.get_user();

    # Get the sheet data from Clients spreadsheet
    sheet_data = utils.get_drive_data([])

    # If the user exists (is logged in), render the page
    if user:
      self.render("pages/clients.html", page_title="Clients", sign_out_url=sign_out_url, sheet_data=sheet_data)

    # If the user is not logged in, redirect to the sign in url
    else:
      self.redirect(sign_in_url)
