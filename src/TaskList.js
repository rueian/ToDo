import React, { Component } from 'react';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import { FBAvatar } from './FBAvatar';
import Checkbox from 'material-ui/lib/checkbox';

export class TaskList extends Component {
  render() {
    let todos = this.props.todos.map((todo, index) => {
      return (
        <ListItem
          style={{'text-decoration': todo.get('isDone') ? 'line-through' : 'initial'}}
          key={todo.id}
          primaryText={todo.get('title')}
          leftCheckbox={<Checkbox defaultChecked={todo.get('isDone')} onCheck={this.props.handleToDoClick.bind(null, index)}/>}
          rightAvatar={FBAvatar(todo.get('creatorId'))}/>
      )
    });
    return (<List>{todos}</List>);
  }
}
