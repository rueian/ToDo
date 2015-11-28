import React, { Component } from 'react';
import AppBar from 'material-ui/lib/app-bar';
import LeftNav from 'material-ui/lib/left-nav';
import Paper from 'material-ui/lib/paper';
import { SelectableContainerEnhance } from 'material-ui/lib/hoc/selectable-enhance';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import ListDivider from 'material-ui/lib/lists/list-divider';
import FontIcon from 'material-ui/lib/font-icon';
import FloatingActionButton from 'material-ui/lib/floating-action-button';
import Avatar from 'material-ui/lib/avatar';
import Dialog from 'material-ui/lib/dialog';
import TextField from 'material-ui/lib/text-field';
import SelectField from 'material-ui/lib/select-field';
import Snackbar from 'material-ui/lib/snackbar';
import { TaskList } from './TaskList';
import Parse from 'parse';

const SelectableList = SelectableContainerEnhance(List);
const Todo = Parse.Object.extend("Todo");

export class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      title: '待辦事項',
      isLoading: true,
      selectValue: props.user.get('authData').facebook.id,
      selectedNav: 1,
      titleError: '',
      showDialog: false,
      user: {
        id: props.user.get('authData').facebook.id
      },
      todos: []
    };
  }

  componentDidMount() {
    this._getFB();
    this._getToDos();
  }

  _getToDos(isDone) {
    this.setState({isLoading: true});

    let query = new Parse.Query(Todo);
    query.equalTo('userId', this.state.user.id);
    if (isDone) {
      query.equalTo('isDone', true);
    } else {
      query.notEqualTo('isDone', true);
    }
    query.descending('createdAt');
    console.log('query',query,this.state.user.id);
    query.find().then((todos) => {
      this.setState({todos: todos, isLoading: false});
    }, (err) => {
      console.error(err);
    });
  }

  _getFB() {
    FB.api('/me', {fields: 'name,friends'}, (response) => {
      console.log(response)
      this.setState({user: response});
    });
  }

  _openMenu(e) {
    this.refs.leftNav.toggle();
  }

  _handleNavSelected(e, value) {
    if (value == 3) return;
    if (value == 1) {
      this.setState({selectedNav: value, title: '待辦事項'});
      this._getToDos();
    } else if (value == 2) {
      this.setState({selectedNav: value, title: '封存事項'});
      this._getToDos(true);
    }

    this.refs.leftNav.toggle();
  }

  _newToDo() {
    const snackbar = this.refs.snackbar;

    let title = this.refs.input.getValue();
    let userId = this.state.user.id;
    let creatorId = this.state.selectValue || userId;

    if (!title) {
      return this.setState({titleError: '請輸入內容'});
    } else {
      this.setState({titleError: ''});
    }

    this.setState({showDialog: false});

    let todo = new Todo();

    todo.save({
      title,
      userId,
      creatorId
    }).then((todo) => {
      snackbar.show();
      this._getToDos();
    }, (err) => {
      console.error(err);
    });
  }

  _openModal(e) {
    this.setState({showDialog: true}, () => {
      this.refs.input.focus();
    });
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

  render() {
    const userPhoto = '//graph.facebook.com/v2.5/' + this.state.user.id + '/picture?type=large';
    const modalAction = [
      { text: '取消', onTouchTap: this._closeModal.bind(this) },
      { text: '創建', onTouchTap: this._newToDo.bind(this), ref: 'submit' }
    ];

    let users = [{id: this.state.user.id, name: '自己'}];
    if (this.state.user.friends) {
      users = users.concat(this.state.user.friends.data);
    }

    return (
      <div>
        <AppBar title={this.state.title} showMenuIconButton={true} onLeftIconButtonTouchTap={this._openMenu.bind(this)}/>
        <div style={{padding: 12, maxWidth: 800, marginLeft: 'auto', marginRight: 'auto'}}>
          <TaskList todos={this.state.todos} handleToDoClick={this._handleToDoClick.bind(this)}/>
        </div>
        <FloatingActionButton style={{position: 'fixed', right: 20, bottom: 20}} onTouchTap={this._openModal.bind(this)}>
          <FontIcon className="material-icons">add</FontIcon>
        </FloatingActionButton>
        <Dialog ref="modal"
          title="創建 ToDo"
          actions={modalAction}
          open={this.state.showDialog}
          onRequestClose={this._closeModal}>
          <TextField ref="input"
            errorText={this.state.titleError}
            hintText="12/4 要交 Web App 作業"
            floatingLabelText="輸入待辦事項內容" />
          <SelectField
            valueLink={{value: this.state.user.id, requestChange: this._handleSelectValueChange.bind(this)}}
            floatingLabelText="選擇指派對象"
            valueMember="id"
            displayMember="name"
            menuItems={users} />
        </Dialog>
        <Snackbar ref="snackbar"
          message="ToDo 創建成功"
          action="取消"
          autoHideDuration={1000}
          onActionTouchTap={this._handleSnackbarCancel.bind(this)}/>
        <LeftNav ref="leftNav" docked={false} selectedIndex={1}
          header={<ListItem primaryText={this.state.user.name} leftAvatar={<Avatar src={userPhoto} />} />}>
          <SelectableList
            valueLink={{value: this.state.selectedNav, requestChange: this._handleNavSelected.bind(this)}}>
            <ListItem value={1} primaryText="待辦事項" leftIcon={<FontIcon className="material-icons">inbox</FontIcon>} />
            <ListItem value={2} primaryText="封存事項" leftIcon={<FontIcon className="material-icons">archive</FontIcon>} />
            <ListDivider />
            <ListItem value={3} primaryText="登出" leftIcon={<FontIcon className="material-icons">exit_to_app</FontIcon>} />
          </SelectableList>
        </LeftNav>
      </div>
    );
  }
}
