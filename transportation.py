# Base Imports
import webapp2
import helpers

class clientsHandler(helpers.helpersHandler):
    def get(self):
      user, sign_in_url, sign_out_url = helpers.get_user();
      sheet_data = helpers.get_drive_data(['1jRWlr8K32ICVsiVdvkXHf7cmry58iDqkqhLQowMAyd8'])
      if user:
        self.render("transportation/clients.html", sign_out_url=sign_out_url, sheet_data=sheet_data)
      else:
        self.redirect(sign_in_url)

class salesGoals2015Handler(helpers.helpersHandler):
  def get(self):
    user, sign_in_url, sign_out_url = helpers.get_user();
    sheet_data = helpers.get_drive_data(['15eCdm0k0e_X8dSA414bCGLXkAb98Fy2RabwXj3toWms'])
    if user:
      self.render("transportation/sales-goals/2015.html", sign_out_url=sign_out_url, sheet_data=sheet_data)
    else:
      self.redirect(sign_in_url)

class salesGoals2016Handler(helpers.helpersHandler):
  def get(self):
    user, sign_in_url, sign_out_url = helpers.get_user();
    sheet_data = helpers.get_drive_data(['16sHzeupzLJAeV5Ak_LwzKBl0R4Go68024wqz1hPFRVo'])
    if user:
      self.render("transportation/sales-goals/2016.html", sign_out_url=sign_out_url, sheet_data=sheet_data)
    else:
      self.redirect(sign_in_url)
