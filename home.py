# Base Imports
import webapp2
import helpers

class homeHandler(helpers.helpersHandler):
    def get(self):
      user, sign_in_url, sign_out_url = helpers.get_user();
      if user:
        self.render("home.html", sign_out_url=sign_out_url)
      else:
        self.redirect(sign_in_url)