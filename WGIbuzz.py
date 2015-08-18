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
sys.path.append('lib') # Add lib folder to system path

"""
Pages
"""
from src.pages import home
from src.pages import clients
from src.pages import opportunities
from src.pages import salesGoals

"""
Routing
"""
app = webapp2.WSGIApplication([
  ('/', home.homeHandler),
  ('/opportunities/?', opportunities.opportunitiesHandler),
  ('/transportation/clients?', clients.clientsHandler),
  ('/transportation/sales-goals/2015?', salesGoals.salesGoals2015Handler),
  ('/transportation/sales-goals/2016?', salesGoals.salesGoals2016Handler)
], debug=True)
