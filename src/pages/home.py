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
# Handler for Home page (inherits from base handler in utils.py)
##
class homeHandler(utils.baseHandler):

  ##
  # Function to handle when get request is made
  ##
  def get(self):

    # Get the user, sign in url, and sign out url
    user, sign_in_url, sign_out_url = utils.get_user();

    # If the user exists (is logged in), render the page
    if user:
      self.render("pages/home.html", page_title="Home", sign_out_url=sign_out_url)

    # If the user is not logged in, redirect to the sign in url
    else:
      self.redirect(sign_in_url)
