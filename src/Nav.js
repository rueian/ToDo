import React, { Component } from 'react';
import LeftNav from 'material-ui/lib/left-nav';
import Card from 'material-ui/lib/card/card';
import CardMedia from 'material-ui/lib/card/card-media';
import CardHeader from 'material-ui/lib/card/card-header';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import ListDivider from 'material-ui/lib/lists/list-divider';
import FontIcon from 'material-ui/lib/font-icon';
import { SelectableContainerEnhance } from 'material-ui/lib/hoc/selectable-enhance';
import { avatarPath } from './avatarPath';
import { NAVS } from './navs'

const SelectableList = SelectableContainerEnhance(List);

export class Nav extends Component {

  render() {
    let coverPath = '/img/default-cover.jpg';
    if (this.props.user.cover) {
      coverPath = this.props.user.cover.source;
    }

    let navs = NAVS.map((nav, index) => {
      return (
        <ListItem value={index+1} key={index} primaryText={nav.title} leftIcon={<FontIcon className="material-icons">{nav.icon}</FontIcon>} />
      );
    });

    return (
      <LeftNav ref="leftNav" docked={false}
        header={
          <Card>
            <CardMedia style={{height: 180}} overlay={
              <CardHeader
                title={this.props.user.name}
                subtitle={this.props.user.email}
                avatar={avatarPath(this.props.user.id)} />
              }>
              <img src={coverPath}/>
            </CardMedia>
          </Card>
        }>
        <SelectableList
          valueLink={{value: this.props.selectedNav, requestChange: this.props.handleNavSelected}}>
          { navs }
          <ListDivider />
          <ListItem value={99} primaryText="登出" leftIcon={<FontIcon className="material-icons">exit_to_app</FontIcon>} />
        </SelectableList>
      </LeftNav>
    )
  }
}
