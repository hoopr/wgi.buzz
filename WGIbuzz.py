#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

"""
Base Imports
"""
import re # Regular expressions module
import sys
import webapp2

"""
System Paths
"""
from google.appengine.ext import vendor
vendor.add('lib')

"""
Data & Pages
"""
from src import data
from src.pages import home
from src.pages import clients
from src.pages import opportunities
from src.pages import salesGoals

"""
Routing
"""
app = webapp2.WSGIApplication([
  ('/', home.homeHandler),
  ('/data/?', data.dataHandler),
  ('/clients/?', clients.clientsHandler),
  ('/opportunities/?', opportunities.opportunitiesHandler),
  ('/sales-goals/?', salesGoals.salesGoalsHandler)
], debug=True)
