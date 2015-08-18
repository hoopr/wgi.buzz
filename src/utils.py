"""
Base Modules
"""
import jinja2
import json
import logging
import os
import re
import time
import webapp2

"""
App Engine Modules
"""
from apiclient import errors
from apiclient.discovery import build
from httplib2 import Http
from google.appengine.ext import db
from google.appengine.api import mail
from google.appengine.api import users
from oauth2client.appengine import AppAssertionCredentials

"""
Templating Config
"""

# Configure Jinja environment using template directory and other flags
template_dir = os.path.join(os.path.dirname(__file__), '../templates')
jinja_env = jinja2.Environment(loader = jinja2.FileSystemLoader(template_dir), autoescape = True)

##
# Function to render template
##
def render_str(template, **params):
  t = jinja_env.get_template(template)
  return t.render(params)

"""
Handlers
"""

##
# Basic handler class and functions for others to inherit from
##
class baseHandler(webapp2.RequestHandler):

  ##
  # Function to write out
  ##
  def write(self, *a, **kw):
      self.response.out.write(*a, **kw)

  ##
  # Function to render a string
  ##
  def render_str(self, template, **params):
      t = jinja_env.get_template(template)
      return t.render(params)

  ##
  # Function to redner a template
  ##
  def render(self, template, **kw):
      self.write(self.render_str(template, **kw))

"""
Authorization & Users
"""

##
# Function to authorize the request for Google Drive permissions
##
def authorize_request():
  credentials = AppAssertionCredentials('https://www.googleapis.com/auth/drive')
  return credentials.authorize(Http())

##
# Function to return the current user, login url, and logout url
##
def get_user():
  return users.get_current_user(), users.create_login_url('/'), users.create_logout_url('/')

"""
Data Retrieval
"""

##
# Function to return a file from the given service with the give ID
##
def get_file(service, file_id):

  # Try to return the file
  try:
    return service.files().get(fileId=file_id).execute()

  # If getting file fails, print the error
  except errors.HttpError, error:
    print 'An error occurred: %s' % error
    return None

##
# Function to get concatenated .csv data from a set of Drive files
##
def get_drive_data(file_ids):

  # Authorize the request and build the Drive service
  http_auth = authorize_request()
  drive_service = build('drive', 'v2', http=http_auth)

  # Initialize some counter and placeholer variables
  file_num = 1
  header_row = ''
  composite_content = ''

  # Loop through each file in the passed set
  for file_id in file_ids:

    # Get the file
    drive_file = get_file(drive_service, file_id)

    # If the file exists, try to get the link for downloading a csv
    if drive_file:
      try:
        download_url = drive_file['exportLinks']['text/csv']

      # If the download as csv fails, print the error
      except KeyError, error:
        print 'Key not found! %s' % error

      # If the download url exists, get the http response and content
      if download_url:
        resp, content = drive_service._http.request(download_url)

        # If the status is 200 (okay), parse and concatenate files
        if resp.status == 200:

          # Split by newline delimiter and get the length
          split_content = content.split('\r\n', 1)
          split_len = len(split_content)

          # If the length is greater than 0, do keep going
          if split_len > 0:

            # If this is the first file, set the header row to the first row
            if file_num == 1:
              header_row = split_content[0]

            # Add additional lines to file that holds all content
            if split_len > 1:
              composite_content += '\r\n' + split_content[1]

          file_num += 1 # Increment file number

        # If the file response is not 200, print it
        else:
          print 'An error occurred: %s' % resp

      # If there is no download url, indicate that
      else:
        print 'No download url!'

    # If there's no file, indicate that
    else:
      print 'No file!'

  # Return the data (header + content) as JSON
  return json.dumps(header_row + composite_content)
