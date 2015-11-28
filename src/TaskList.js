import React, { Component } from 'react';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import Avatar from 'material-ui/lib/avatar';
import Checkbox from 'material-ui/lib/checkbox';

export class TaskList extends Component {
  render() {
    let todos = this.props.todos.map((todo, index) => {
      let userPhoto = '//graph.facebook.com/v2.5/' + todo.get('creatorId') + '/picture?type=large';
      return (
        <ListItem
          key={todo.id}
          primaryText={todo.get('title')}
          leftCheckbox={<Checkbox defaultChecked={todo.get('isDone')} onCheck={this.props.handleToDoClick.bind(null, index)}/>}
          rightAvatar={<Avatar src={userPhoto} />}/>
      )
    });
    return (
      <List>
        {todos}
      </List>
    );
  }
}
