import React, { Component } from 'react';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import { avatarPath } from './avatarPath';
import Avatar from 'material-ui/lib/avatar';
import Checkbox from 'material-ui/lib/checkbox';

export class TaskList extends Component {
  render() {
    let todos = this.props.todos.map((todo, index) => {
      let avatar;
      if (this.props.user.id == todo.get('creatorId')) {
        avatar = <Avatar src={avatarPath(todo.get('userId'))} />;
      } else {
        avatar = <Avatar src={avatarPath(todo.get('creatorId'))} />;
      }
      return (
        <ListItem
          style={{textDecoration: todo.get('isDone') ? 'line-through' : 'initial'}}
          key={todo.id}
          primaryText={todo.get('title')}
          leftCheckbox={<Checkbox defaultChecked={todo.get('isDone')} onCheck={this.props.handleToDoClick.bind(null, index)}/>}
          rightAvatar={avatar}/>
      )
    });
    return (<List>{todos}</List>);
  }
}
