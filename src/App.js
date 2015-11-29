import React, { Component } from 'react';
import AppBar from 'material-ui/lib/app-bar';
import LeftNav from 'material-ui/lib/left-nav';
import Paper from 'material-ui/lib/paper';
import Card from 'material-ui/lib/card/card';
import CardMedia from 'material-ui/lib/card/card-media';
import CardHeader from 'material-ui/lib/card/card-header';
import { SelectableContainerEnhance } from 'material-ui/lib/hoc/selectable-enhance';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import ListDivider from 'material-ui/lib/lists/list-divider';
import FontIcon from 'material-ui/lib/font-icon';
import FloatingActionButton from 'material-ui/lib/floating-action-button';
import { FBAvatar } from './FBAvatar';
import Dialog from 'material-ui/lib/dialog';
import TextField from 'material-ui/lib/text-field';
import SelectField from 'material-ui/lib/select-field';
import Snackbar from 'material-ui/lib/snackbar';
import RefreshIndicator from 'material-ui/lib/refresh-indicator';
import { TaskList } from './TaskList';
import IconButton from 'material-ui/lib/icon-button';
import Parse from 'parse';
import { NAVS } from './navs'

const SelectableList = SelectableContainerEnhance(List);
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
    this._getToDos();
    this.props.pubnub.subscribe({
      channel: this.state.user.id,
      message: (message) => {
        if (this.state.selectedNav == 0) {
          this._getToDos();
        }
      }
    });
  }

  _getToDos(isDone) {
    this.setState({loadingStatus: 'loading'});

    let query = new Parse.Query(Todo);
    query.equalTo('userId', this.state.user.id);
    if (isDone) {
      query.equalTo('isDone', true);
    } else {
      query.notEqualTo('isDone', true);
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
    this.refs.leftNav.toggle();
  }

  _handleNavSelected(e, value) {
    if (value == 0) {
      this.setState({selectedNav: value});
      this._getToDos();
    } else if (value == 1) {
      this.setState({selectedNav: value});
      this._getToDos(true);
    } else if (value == 2) {
      this.setState({showLogoutModal: true});
    }

    this.refs.leftNav.toggle();
  }

  _newToDo() {
    const snackbar = this.refs.snackbar;

    let title = this.refs.input.getValue();
    let creatorId = this.state.user.id;
    let userId = this.state.selectValue || userId;

    if (!title) {
      return this.setState({titleError: '請輸入內容'});
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

      todo.setACL(acl);

      return todo.save({
        title,
        userId,
        creatorId
      });
    }, (err) => {
      console.error(err);
    }).then((todo) => {
      snackbar.show();
      this.props.pubnub.publish({
        channel: userId,
        message: 'refresh'
      });
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

  _handleSnackbarCancel() {
    const snackbar = this.refs.snackbar;
    snackbar.dismiss();
  }

  _handleToDoClick(index, event, value) {
    let todo = this.state.todos[index];
    todo.set('isDone', value);
    todo.save().then((res) => {
      this.setState({todos: this.state.todos.filter((t) => {return t.id != todo.id})});
    }, (err) => {
      console.error(err);
    })
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
    let coverPath = '/img/default-cover.jpg';
    if (this.state.user.cover) {
      coverPath = this.state.user.cover.source;
    }

    let title = NAVS[this.state.selectedNav].title;
    if (this.state.loadingStatus == 'loading') {
      title += ' (...)';
    } else {
      title += ' (' + this.state.todos.length + ')';
    }

    return (
      <div>
        <AppBar
          className={this.state.selectedNav == 0 ? 'todo-list' : 'archive-list'}
          style={{position: 'fixed', top: 0, left: 0}}
          title={title}
          showMenuIconButton={true}
          onLeftIconButtonTouchTap={this._openMenu.bind(this)}/>
        <IconButton iconClassName="fa fa-github white"
          linkButton={true}
          href="https://github.com/rueian/ToDo"
          style={{position: 'fixed', top: 8, right: 12, zIndex: 5}}/>
        <RefreshIndicator size={50} left={window.innerWidth / 2 - 25} top={100} status={this.state.loadingStatus} />
        <div style={{padding: 12, maxWidth: 800, marginLeft: 'auto', marginRight: 'auto', marginTop: 60}}>
          <TaskList todos={this.state.todos} handleToDoClick={this._handleToDoClick.bind(this)}/>
        </div>
        <FloatingActionButton style={{position: 'fixed', right: 20, bottom: 20}} onTouchTap={this._openModal.bind(this)}>
          <FontIcon className="material-icons">add</FontIcon>
        </FloatingActionButton>
        <Dialog ref="modal"
          title="創建 ToDo"
          actions={modalAction}
          open={this.state.showDialog}
          onRequestClose={this._closeModal.bind(this)}
          contentStyle={{width: '95%'}}>
          <TextField ref="input"
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
        <Snackbar ref="snackbar"
          message="ToDo 創建成功"
          action="取消"
          autoHideDuration={1000}
          onActionTouchTap={this._handleSnackbarCancel.bind(this)}/>
        <LeftNav ref="leftNav" docked={false} selectedIndex={1}
          header={
            <Card>
              <CardMedia style={{height: 180}} overlay={
                <CardHeader
                  title={this.state.user.name}
                  subtitle={this.state.user.email}
                  avatar={'//graph.facebook.com/v2.5/' + this.state.user.id + '/picture?type=large'} />
                }>
                <img src={coverPath}/>
              </CardMedia>
            </Card>
          }>
          <SelectableList
            valueLink={{value: this.state.selectedNav, requestChange: this._handleNavSelected.bind(this)}}>
            <ListItem value={0} primaryText="待辦事項" leftIcon={<FontIcon className="material-icons">inbox</FontIcon>} />
            <ListItem value={1} primaryText="封存事項" leftIcon={<FontIcon className="material-icons">archive</FontIcon>} />
            <ListDivider />
            <ListItem value={2} primaryText="登出" leftIcon={<FontIcon className="material-icons">exit_to_app</FontIcon>} />
          </SelectableList>
        </LeftNav>
      </div>
    );
  }
}
