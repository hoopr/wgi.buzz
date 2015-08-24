"""
Base Imports
"""
import webapp2

"""
Utilities
"""
from src import utils

##
# Handler for retrieving data (inherits from base handler in utils.py)
##
class dataHandler(utils.baseHandler):

  ##
  # Function to handle when get request is made
  ##
  def get(self):

    # Get all sheet IDs
    sheet_id = self.request.get_all('sheet_id');

    # Get the user, sign in url, and sign out url
    user = utils.get_user();

    # If the user exists (is logged in), return the requested data
    if user:
      self.response.out.write(utils.get_drive_data(sheet_id))

    # If the user is not logged in, return 401 Unauthorized error
    else:
      self.response.error(401)
