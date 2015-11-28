import React, { Component } from 'react';
import Avatar from 'material-ui/lib/avatar';

export function FBAvatar(id) {
  let path = '//graph.facebook.com/v2.5/' + id + '/picture?type=large';
  return (<Avatar src={path} />);
}
