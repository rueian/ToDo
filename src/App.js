import React, { Component } from 'react';
import AppBar from 'material-ui/lib/app-bar';
import LeftNav from 'material-ui/lib/left-nav';
import Paper from 'material-ui/lib/paper';
import { SelectableContainerEnhance } from 'material-ui/lib/hoc/selectable-enhance';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import ListDivider from 'material-ui/lib/lists/list-divider';
import FontIcon from 'material-ui/lib/font-icon';
import Avatar from 'material-ui/lib/avatar';

const SelectableList = SelectableContainerEnhance(List);

export class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedNav: 1,
      user: {
        id: this.props.user.get('authData').facebook.userId
      }
    };
    this._getFB();
  }

  _getFB() {
    FB.api('/me', {fields: 'name,friends'}, (response) => {
      this.setState({user: response});
    });
  }

  _openMenu(e) {
    this.refs.leftNav.toggle();
  }

  _handleNavSelected(e, index) {
    if (index == 3) return;
    this.setState({selectedNav: index});
  }

  _getToDo() {

  }

  _getArchived() {

  }

  _newToDo() {
    
  }

  render() {
    const userPhoto = '//graph.facebook.com/v2.5/' + this.state.user.id + '/picture?type=large';
    return (
      <div>
        <AppBar title="Title" showMenuIconButton={true} onLeftIconButtonTouchTap={this._openMenu.bind(this)}/>
        <LeftNav ref="leftNav" docked={false} selectedIndex={1}
          header={<ListItem primaryText={this.state.user.name} leftAvatar={<Avatar src={userPhoto} />} />}>
          <SelectableList
            valueLink={{value: this.state.selectedNav, requestChange: this._handleNavSelected.bind(this)}}>
            <ListItem value={1} primaryText="代辦事項" leftIcon={<FontIcon className="material-icons">inbox</FontIcon>} />
            <ListItem value={2} primaryText="封存事項" leftIcon={<FontIcon className="material-icons">archive</FontIcon>} />
            <ListDivider />
            <ListItem value={3} primaryText="登出" leftIcon={<FontIcon className="material-icons">exit_to_app</FontIcon>} />
          </SelectableList>
        </LeftNav>
      </div>
    );
  }
}
