import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import Parse from 'parse';

describe('App', () => {
  describe('_getFB', () => {
    it('call FB sdk in to get profile with correct fields', () => {
      let FB = {
        api: jest.genMockFunction()
      };

      let user = new Parse.User();
      user.set('authData', { facebook: { id: 'xxxx' } });

      let { App } = require('../App');

      let getFB = (new App({ user: user}))._getFB.bind({ props: { FB } });

      getFB();
      expect(FB.api).toBeCalledWith('/me', {fields: 'name,friends,cover,email'}, jasmine.any(Function));
    })
  })

  describe('componentDidMount', () => {
    it('call _getFB, _getToDos, and pubnub.subscribe', () => {
      let user = new Parse.User();
      user.set('authData', { facebook: { id: 'xxxx' } });

      let { App } = require('../App');

      let env = {
        _getFB: jest.genMockFunction(),
        _getToDos: jest.genMockFunction(),
        props: {
          pubnub: {
            subscribe: jest.genMockFunction(),
          }
        },
        state: {
          user: { id: '' }
        }
      };

      let componentDidMount = (new App({ user: user})).componentDidMount.bind(env);

      componentDidMount();
      expect(env._getFB).toBeCalled();
      expect(env._getToDos).toBeCalledWith(1);
      expect(env.props.pubnub.subscribe).toBeCalled();
    })
  })

  describe('_getToDos', () => {
    it('load unarchived todos', () => {
      let user = new Parse.User();
      user.set('authData', { facebook: { id: 'xxxx' } });

      let { App } = require('../App');

      let query = {
        equalTo: jest.genMockFunction(),
        notEqualTo: jest.genMockFunction(),
        descending: jest.genMockFunction(),
        find: function() {
          return {
            then: function() {}
          };
        }
      }

      let env = {
        setState: jest.genMockFunction(),
        state: {
          user: { id: 'xxx' }
        },
        props: {
          Parse: {
            Object: {
              extend: jest.genMockFunction()
            },
            Query: function() {
              return query
            }
          }
        }
      };

      let _getToDos = (new App({ user: user}))._getToDos.bind(env);
      _getToDos(1);
      expect(query.equalTo).toBeCalledWith('userId', 'xxx');
      expect(query.notEqualTo).toBeCalledWith('isDone', true);
      expect(query.descending).toBeCalledWith('createdAt');
    })

    it('load archived todos', () => {
      let user = new Parse.User();
      user.set('authData', { facebook: { id: 'xxxx' } });

      let { App } = require('../App');

      let query = {
        equalTo: jest.genMockFunction(),
        notEqualTo: jest.genMockFunction(),
        descending: jest.genMockFunction(),
        find: function() {
          return {
            then: function() {}
          };
        }
      }

      let env = {
        setState: jest.genMockFunction(),
        state: {
          user: { id: 'xxx' }
        },
        props: {
          Parse: {
            Object: {
              extend: jest.genMockFunction()
            },
            Query: function() {
              return query
            }
          }
        }
      };

      let _getToDos = (new App({ user: user}))._getToDos.bind(env);
      _getToDos(2);
      expect(query.equalTo).toBeCalledWith('userId', 'xxx');
      expect(query.equalTo).toBeCalledWith('isDone', true);
      expect(query.descending).toBeCalledWith('createdAt');
    })

    it('load assigned todos', () => {
      let user = new Parse.User();
      user.set('authData', { facebook: { id: 'xxxx' } });

      let { App } = require('../App');

      let query = {
        equalTo: jest.genMockFunction(),
        notEqualTo: jest.genMockFunction(),
        descending: jest.genMockFunction(),
        find: function() {
          return {
            then: function() {}
          };
        }
      }

      let env = {
        setState: jest.genMockFunction(),
        state: {
          user: { id: 'xxx' }
        },
        props: {
          Parse: {
            Object: {
              extend: jest.genMockFunction()
            },
            Query: function() {
              return query
            }
          }
        }
      };

      let _getToDos = (new App({ user: user}))._getToDos.bind(env);
      _getToDos(3);
      expect(query.equalTo).toBeCalledWith('creatorId', 'xxx');
      expect(query.notEqualTo).toBeCalledWith('userId', 'xxx');
      expect(query.descending).toBeCalledWith('createdAt');
    })
  })

  describe('_handleNavSelected', () => {
    it('switch state', () => {
      let user = new Parse.User();
      user.set('authData', { facebook: { id: 'xxxx' } });

      let { App } = require('../App');

      let env = {
        setState: jest.genMockFunction(),
        _getToDos: jest.genMockFunction(),
        refs: {nav: {refs: {leftNav: {toggle: jest.genMockFunction()}}}}
      };

      let _handleNavSelected = (new App({ user: user}))._handleNavSelected.bind(env);
      _handleNavSelected({}, 1);
      expect(env.setState).toBeCalledWith({selectedNav: 1});
      expect(env._getToDos).toBeCalledWith(1);
    })

    it('pop logout modal', () => {
      let user = new Parse.User();
      user.set('authData', { facebook: { id: 'xxxx' } });

      let { App } = require('../App');

      let env = {
        setState: jest.genMockFunction(),
        _getToDos: jest.genMockFunction(),
        refs: {nav: {refs: {leftNav: {toggle: jest.genMockFunction()}}}}
      };

      let _handleNavSelected = (new App({ user: user}))._handleNavSelected.bind(env);
      _handleNavSelected({}, 99);
      expect(env.setState).toBeCalledWith({showLogoutModal: true});
    })
  })

  describe('_handleToDoClick', () => {
    it('mark todo be done', () => {
      let user = new Parse.User();
      user.set('authData', { facebook: { id: 'xxxx' } });

      let { App } = require('../App');

      let env = {
        _fireRefresh: jest.genMockFunction(),
        state: {
          todos: [{
            get: jest.genMockFunction(),
            set: jest.genMockFunction(),
            save: jest.genMockFunction().mockImplementation(function() {
              // do something stateful
              return {
                then: function(cb) { cb() }
              }
            })
          }]
        }
      };

      let _handleToDoClick = (new App({ user: user}))._handleToDoClick.bind(env);
      _handleToDoClick(0, {}, true);
      expect(env.state.todos[0].set).toBeCalledWith('isDone', true);
      expect(env.state.todos[0].save).toBeCalled();
      expect(env._fireRefresh).toBeCalled();
    })
  })

  describe('_fireRefresh', () => {
    it('fire pubsub event', () => {
      let user = new Parse.User();
      user.set('authData', { facebook: { id: 'xxxx' } });

      let { App } = require('../App');

      let env = {
        props: {
          pubnub: {
            publish: jest.genMockFunction()
          }
        }
      };

      let _fireRefresh = (new App({ user: user}))._fireRefresh.bind(env);
      _fireRefresh('channel');
      expect(env.props.pubnub.publish).toBeCalledWith({
        channel: 'channel',
        message: 'refresh'
      });
    })
  })
})
