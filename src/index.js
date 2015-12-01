import React from 'react';
import { render } from 'react-dom';
import Parse from 'parse';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { FB_APP_ID, FB_VERSION, PARSE_ID, PARSE_KEY, PUBNUB_PUB_KEY, PUBNUB_SUB_KEY } from '../config';
import { App } from './App';

function showLoading() {
  document.getElementById('loading').classList.remove("hidden");
  document.getElementById('login').classList.add("hidden");
}

function showLogin() {
  document.getElementById('loading').classList.add("hidden");
  document.getElementById('login').classList.remove("hidden");
}

function parseLogin() {
  showLoading();

  setTimeout(() => showLogin(), 20000);

  Parse.FacebookUtils.logIn('public_profile,email,user_friends', {
    success: (user) => {
      if (user.get('facebookId')) {
        showApp(user);
      } else {
        user.set('facebookId', user.get('authData').facebook.id);
        user.save().then(() => showApp(user));
      }
    }
  });
}

function showApp(user) {
  let pubnub = PUBNUB.init({
      publish_key: PUBNUB_PUB_KEY,
      subscribe_key: PUBNUB_SUB_KEY,
      ssl: true
  });
  render(<App user={user} pubnub={pubnub}/>, document.getElementById('content'));

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

  if (Parse.User.current()) {
    showApp(Parse.User.current());
  } else {
    showLogin();
  }
};

document.addEventListener("DOMContentLoaded", function(event) {
  document.getElementById("fb_login_btn").addEventListener("click", parseLogin);
});

(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
