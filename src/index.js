import React from 'react';
import { render } from 'react-dom';
import { FB_APP_ID, FB_VERSION, PARSE_ID, PARSE_KEY } from '../config';
// import { App } from './App';

window.fbAsyncInit = function() {
  FB.init({
    appId: FB_APP_ID,
    cookie: true,
    xfbml: true,
    version: FB_VERSION
  });

  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });
};

// render(<App />, document.getElementById('root'));
//
// console.log(FB_APP_ID)

function statusChangeCallback(response) {
  console.log('statusChangeCallback');
  console.log(response);

  if (response.status === 'connected') {
    document.getElementById('welcome').classList.add("hidden");
    document.getElementById('content').classList.remove("hidden");
    // render(<App />, document.getElementById('root'));
    testAPI();
  } else {
    document.getElementById('welcome').classList.remove("hidden");
    document.getElementById('loading').classList.add("hidden");
    document.getElementById('login').classList.remove("hidden");
    document.getElementById('content').classList.add("hidden");
  }
}

function testAPI() {
  console.log('Welcome!  Fetching your information.... ');
  FB.api('/me', function(response) {
    console.log('Successful login for: ' + response.name);
    document.getElementById('status').innerHTML =
      'Thanks for logging in, ' + response.name + '!';
  });
}

function doFBLogin() {
  FB.getLoginStatus(function(response) {
    if (response == 'connected') return;

    FB.login(function(res) {
      statusChangeCallback(res);
    }, {scope: 'public_profile,email,user_friends'});
  });
}

(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

document.addEventListener("DOMContentLoaded", function(event) {
  document.getElementById("fb_login_btn").addEventListener("click", doFBLogin);
});
