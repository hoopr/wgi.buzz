'''
Import base modules
'''
import webapp2
import jinja2
import os
import re
import logging
import time
import json
import csv

'''
Import App Engine modules
'''
from google.appengine.ext import db
from google.appengine.api import mail
from google.appengine.api import users
from oauth2client.appengine import AppAssertionCredentials
from httplib2 import Http
from apiclient.discovery import build
from apiclient import errors

'''
Configure templating
'''
template_dir = os.path.join(os.path.dirname(__file__), 'templates')
jinja_env = jinja2.Environment(loader = jinja2.FileSystemLoader(template_dir), autoescape = True)

'''
Page rendering
'''
def render_str(template, **params):
    t = jinja_env.get_template(template)
    return t.render(params)

class helpersHandler(webapp2.RequestHandler):
    def write(self, *a, **kw):
        self.response.out.write(*a, **kw)

    def render_str(self, template, **params):
        t = jinja_env.get_template(template)
        return t.render(params)

    def render(self, template, **kw):
        self.write(self.render_str(template, **kw))

'''
Get the current user
'''
def get_user():
  return users.get_current_user(), users.create_login_url('/'), users.create_logout_url('/')

'''
Handle authorization and credentials
'''
def authorize_request():
  credentials = AppAssertionCredentials('https://www.googleapis.com/auth/drive')
  return credentials.authorize(Http())

'''
Get the provided file from the specified service
'''
def get_file(service, file_id):
  try:
    return service.files().get(fileId=file_id).execute()
  except errors.HttpError, error:
    print 'An error occurred: %s' % error
    return None

'''
Get csv data from an array of files
'''
def get_drive_data(file_ids):
  http_auth = authorize_request()
  drive_service = build('drive', 'v2', http=http_auth)
  file_num = 1
  header_row = ''
  composite_content = ''
  for file_id in file_ids:
    drive_file = get_file(drive_service, file_id)
    if drive_file:
      try:
        download_url = drive_file['exportLinks']['text/csv']
      except KeyError, error:
        print 'Key not found! %s' % error
      if download_url:
        resp, content = drive_service._http.request(download_url)
        if resp.status == 200:
          print 'Status: %s' % resp
          split_content = content.split('\r\n', 1)
          split_len = len(split_content)
          if split_len > 0:
            if file_num == 1:
              header_row = split_content[0]
            if split_len > 1:
              composite_content += '\r\n' + split_content[1]
          file_num += 1
        else:
          print 'An error occurred: %s' % resp
      else:
        print 'No download url!'
    else:
      print 'No file!'
  return json.dumps(header_row + composite_content)
