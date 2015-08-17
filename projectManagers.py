# Base Imports
import webapp2
import helpers

class opportunitiesHandler(helpers.helpersHandler):
  def get(self):
    user, sign_in_url, sign_out_url = helpers.get_user();
    sheet_data = helpers.get_drive_data(['1UMJAD0GljJErRgHE8cmgyeAZHZIGOYaC0HbpHorSlb0', '1--xnM_q-QZ9fYBj7er0j-khu_QBskbWVX9dvLOwbji8'])
    if user:
      self.render("project-managers/opportunities.html", sign_out_url=sign_out_url, sheet_data=sheet_data)
    else:
      self.redirect(sign_in_url)
