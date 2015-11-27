import React from 'react';
import { render } from 'react-dom';
import Parse from 'parse';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { FB_APP_ID, FB_VERSION, PARSE_ID, PARSE_KEY } from '../config';
import { App } from './App';

function statusChangeCallback(response) {
  if (response.status === 'connected') {
    parseLogin();
  } else {
    showWelcome();
  }
}

function doFBLogin() {
  FB.getLoginStatus(function(response) {
    if (response == 'connected') return;
    parseLogin();
  });
}

function parseLogin() {
  Parse.FacebookUtils.logIn('public_profile,email,user_friends', {
    success: function(user) {
      showApp(user);
    },
    error: function(user, error) {
    }
  });
}

function showWelcome() {
  document.getElementById('welcome').classList.remove("hidden");
  document.getElementById('loading').classList.add("hidden");
  document.getElementById('login').classList.remove("hidden");
  document.getElementById('content').classList.add("hidden");
}

function showApp(user) {
  render(<App user={user}/>, document.getElementById('content'));

  document.getElementById('welcome').classList.add("hidden");
  document.getElementById('content').classList.remove("hidden");
}

injectTapEventPlugin();

Parse.initialize(PARSE_ID, PARSE_KEY);

window.fbAsyncInit = function() {
  Parse.FacebookUtils.init({
    appId: FB_APP_ID,
    cookie: true,
    xfbml: true,
    version: FB_VERSION
  });

  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });
};

document.addEventListener("DOMContentLoaded", function(event) {
  document.getElementById("fb_login_btn").addEventListener("click", doFBLogin);
});

(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));