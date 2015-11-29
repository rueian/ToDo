import React, { Component } from 'react';
import Snackbar from 'material-ui/lib/snackbar';

export class Snackbars extends Component {

  render() {
    return (
      <Snackbar ref="success"
        message="ToDo 創建成功"
        autoHideDuration={1000} />
    )
  }
}
