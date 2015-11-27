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
import { TaskList } from './TaskList';

const SelectableList = SelectableContainerEnhance(List);

export class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      title: '待辦事項',
      selectValue: this.props.user.get('authData').facebook.userId,
      selectedNav: 1,
      showDialog: false,
      user: {
        id: this.props.user.get('authData').facebook.userId
      }
    };
    this._getFB();
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
    } else if (value == 2) {
      this.setState({selectedNav: value, title: '封存事項'});
    }

    this.refs.leftNav.toggle();
  }

  _getToDo() {

  }

  _getArchived() {

  }

  _newToDo() {

  }

  _openModal(e) {
    this.setState({showDialog: true});
  }

  _closeModal(e) {
    this.setState({showDialog: false});
  }

  _handleInputTitleChange(e) {

  }

  _handleSelectValueChange(value) {
    this.setState({selectValue: value});
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
        <div style={{padding: 24, maxWidth: 800, marginLeft: 'auto', marginRight: 'auto'}}>
          <Paper zDepth={1}>
            <TaskList />
          </Paper>
        </div>
        <FloatingActionButton style={{position: 'fixed', right: 20, bottom: 20}} onTouchTap={this._openModal.bind(this)}>
          <FontIcon className="material-icons">add</FontIcon>
        </FloatingActionButton>
        <Dialog
          title="創建 ToDo"
          actions={modalAction}
          actionFocus="submit"
          open={this.state.showDialog}
          onRequestClose={this._closeModal}>
          <TextField
            hintText="12/4 要交 Web App 作業"
            floatingLabelText="輸入待辦事項內容"
            onChange={this._handleInputTitleChange.bind(this)} />
          <SelectField
            valueLink={{value: this.state.user.id, requestChange: this._handleSelectValueChange.bind(this)}}
            floatingLabelText="選擇指派對象"
            valueMember="id"
            displayMember="name"
            menuItems={users} />
        </Dialog>
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
