import React, { Component } from 'react';
import AppBar from 'material-ui/lib/app-bar';
import Paper from 'material-ui/lib/paper';
import FontIcon from 'material-ui/lib/font-icon';
import FloatingActionButton from 'material-ui/lib/floating-action-button';
import Dialog from 'material-ui/lib/dialog';
import TextField from 'material-ui/lib/text-field';
import SelectField from 'material-ui/lib/select-field';
import RefreshIndicator from 'material-ui/lib/refresh-indicator';
import Snackbar from 'material-ui/lib/snackbar';
import IconButton from 'material-ui/lib/icon-button';
import Parse from 'parse';
import { TaskList } from './TaskList';
import { NAVS } from './navs'
import { Nav } from './nav';

const Todo = Parse.Object.extend("Todo");

export class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loadingStatus: 'loading',
      selectValue: props.user.get('authData').facebook.id,
      selectedNav: 1,
      titleError: '',
      showDialog: false,
      showLogoutModal: false,
      user: {
        id: props.user.get('authData').facebook.id,
        cover: {
          source: ''
        }
      },
      todos: []
    };
  }

  componentDidMount() {
    this._getFB();
    this._getToDos(1);
    this.props.pubnub.subscribe({
      channel: this.state.user.id,
      message: (message) => this._getToDos(this.state.selectedNav)
    });
  }

  _getToDos(index) {
    this.setState({loadingStatus: 'loading'});

    let query = new Parse.Query(Todo);
    if (index == 1) {
      query.equalTo('userId', this.state.user.id);
      query.notEqualTo('isDone', true);
    } else if (index == 2) {
      query.equalTo('userId', this.state.user.id);
      query.equalTo('isDone', true);
    } else {
      query.equalTo('creatorId', this.state.user.id);
      query.notEqualTo('userId', this.state.user.id);
    }
    query.descending('createdAt');
    query.find().then((todos) => {
      this.setState({todos: todos, loadingStatus: 'hide'});
    }, (err) => {
      console.error(err);
    });
  }

  _getFB() {
    FB.api('/me', {fields: 'name,friends,cover,email'}, (response) => {
      this.setState({user: response});
    });
  }

  _openMenu(e) {
    this.refs.nav.refs.leftNav.toggle();
  }

  _handleNavSelected(e, value) {
    if (value < 99) {
      this.setState({selectedNav: value});
      this._getToDos(value);
    } else {
      this.setState({showLogoutModal: true});
    }

    this.refs.nav.refs.leftNav.toggle();
  }

  _newToDo() {
    const snackbar = this.refs.snackbar;

    let title = this.refs.input.getValue();
    let creatorId = this.state.user.id;
    let userId = this.state.selectValue || userId;

    if (!title) {
      this.setState({titleError: '請輸入內容'});
      return;
    } else {
      this.setState({titleError: ''});
    }

    this.setState({showDialog: false});

    let userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo('facebookId', userId);
    userQuery.first().then((user) => {
      let todo = new Todo();
      let acl = new Parse.ACL();

      acl.setReadAccess(user, true);
      acl.setWriteAccess(user, true);
      acl.setReadAccess(Parse.User.current(), true);
      acl.setWriteAccess(Parse.User.current(), true);

      todo.setACL(acl);

      return todo.save({ title, userId, creatorId });
    }).then((todo) => {
      snackbar.show();
      this._fireRefresh(userId);
      if (userId != creatorId) {
        this._fireRefresh(creatorId);
      }
    }, (err) => {
      console.error(err);
    });
  }

  _openModal(e) {
    this.setState({showDialog: true});
  }

  _closeModal(e) {
    this.setState({showDialog: false});
  }

  _handleSelectValueChange(value) {
    this.setState({selectValue: value});
  }

  _handleToDoClick(index, event, value) {
    let todo = this.state.todos[index];
    todo.set('isDone', value);
    todo.save().then((res) => {
      this._fireRefresh(todo.get('userId'));
      if (todo.get('userId') != todo.get('creatorId')) {
        this._fireRefresh(todo.get('creatorId'));
      }
    }, (err) => {
      console.error(err);
    })
  }

  _fireRefresh(channel) {
    this.props.pubnub.publish({
      channel: channel,
      message: 'refresh'
    });
  }

  _onLogout() {
    Parse.User.logOut().then(() => {
      location.reload();
    });
  }

  _handleLogoutModalClose() {
    this.setState({showLogoutModal: false});
  }

  render() {
    const modalAction = [
      { text: '取消', onTouchTap: this._closeModal.bind(this) },
      { text: '創建', onTouchTap: this._newToDo.bind(this), ref: 'submit' }
    ];

    const logoutActions = [
      { text: '取消' },
      { text: '登出', onTouchTap: this._onLogout.bind(this), ref: 'submit' }
    ];

    let users = [{id: this.state.user.id, name: '自己'}];
    if (this.state.user.friends) {
      users = users.concat(this.state.user.friends.data);
    }

    let title = NAVS[this.state.selectedNav-1].title;
    if (this.state.loadingStatus == 'loading') {
      title += ' (...)';
    } else {
      title += ' (' + this.state.todos.length + ')';
    }

    return (
      <div>
        <AppBar
          title={title}
          showMenuIconButton={true}
          className={'list-' + this.state.selectedNav}
          style={{position: 'fixed', top: 0, left: 0}}
          onLeftIconButtonTouchTap={this._openMenu.bind(this)}/>

        <IconButton
          iconClassName="fa fa-github white"
          linkButton={true} href="https://github.com/rueian/ToDo"
          style={{position: 'fixed', top: 8, right: 12, zIndex: 5}}/>

        <RefreshIndicator
          size={50}
          left={window.innerWidth / 2 - 25}
          top={100}
          status={this.state.loadingStatus} />

        <div style={{padding: 12, maxWidth: 800, marginLeft: 'auto', marginRight: 'auto', marginTop: 60}}>
          <TaskList user={this.state.user} todos={this.state.todos} handleToDoClick={this._handleToDoClick.bind(this)}/>
        </div>

        <FloatingActionButton
          style={{position: 'fixed', right: 20, bottom: 20}}
          onTouchTap={this._openModal.bind(this)}>

          <FontIcon className="material-icons">add</FontIcon>

        </FloatingActionButton>

        <Dialog
          ref="modal"
          title="創建 ToDo"
          actions={modalAction}
          open={this.state.showDialog}
          autoScrollBodyContent={true}
          onRequestClose={this._closeModal.bind(this)}
          contentStyle={{width: '95%'}}>

          <TextField
            ref="input"
            errorText={this.state.titleError}
            hintText="12/4 要交 Web App 作業"
            floatingLabelText="輸入待辦事項內容" />

          <br />

          <SelectField
            valueLink={{value: this.state.selectValue, requestChange: this._handleSelectValueChange.bind(this)}}
            floatingLabelText="選擇指派對象"
            valueMember="id"
            displayMember="name"
            menuItems={users} />
        </Dialog>

        <Dialog
          title="你確定要登出嗎？"
          actions={logoutActions}
          actionFocus="submit"
          open={this.state.showLogoutModal}
          onRequestClose={this._handleLogoutModalClose.bind(this)}>
          這並不會將您的 Facebook 帳號一起登出
        </Dialog>

        <Nav
          ref="nav"
          user={this.state.user}
          selectedNav={this.state.selectedNav}
          handleNavSelected={this._handleNavSelected.bind(this)} />

        <Snackbar
          ref="snackbar"
          message="ToDo 創建成功"
          autoHideDuration={1000} />
      </div>
    );
  }
}
