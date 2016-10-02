var app = angular.module('xChange',['ui.router']);

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('entry', {
      url: '/entry',
      templateUrl: 'templates/entry.html',
      controller: 'MainCtrl',
      onEnter: ['$state', 'auth', function($state, auth) {
        if(auth.isLoggedIn()) {
          $state.go('home');
        }
      }]
    })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'AuthCtrl',
    onEnter: ['$state', 'auth', function($state, auth){
      if(auth.isLoggedIn()){
        $state.go('entry');
      }
    }]
  })
  .state('register', {
    url: '/register',
    templateUrl: 'templates/register.html',
    controller: 'AuthCtrl',
    onEnter: ['$state', 'auth', function($state, auth){
      if(auth.isLoggedIn()){
        $state.go('entry');
      }
    }]
  })

  .state('profile', {
    url: '/profile',
    templateUrl: 'templates/profile.html',
    controller: 'ProfileCtrl'
  })

  .state('userlist', {
    url: '/userlist',
    templateUrl: 'templates/userlist.html',
    controller: 'UsersCtrl',
    resolve: {
      userPromise: ['users', function(users) {
        return users.getAll();
      }]
    }
  })

  .state('viewprofile', {
  url: '/users/{username}',
  templateUrl: 'templates/viewprofile.html',
  controller: 'ProfileViewCtrl',
  resolve: {
    user: ['$stateParams', 'users', function($stateParams, users) {
        return users.get($stateParams.username);
      }]
    }
  })

  .state('inbox', {
    url: '/inbox',
    templateUrl: 'templates/inbox.html',
    controller: 'InboxCtrl',
    resolve: {
      messagePromise: ['messages', function(messages) {
        return messages.getAll();
      }]
    }
  })

  .state('new', {
    url: '/new?touser',
    templateUrl: 'templates/new.html',
    controller: 'NewMsgCtrl'
  })

  .state('home', {
    url: '/home',
    templateUrl: 'templates/home.html',
    controller: 'HomeCtrl'
  });

  $urlRouterProvider.otherwise('home');
}]);

app.factory('auth', ['$http', '$window', function($http, $window){
   var auth = {};
   auth.saveToken = function (token){
      $window.localStorage['xchange-token'] = token;
    };

    auth.getToken = function (){
      return $window.localStorage['xchange-token'];
    }
    auth.isLoggedIn = function(){
      var token = auth.getToken();

      if(token){
        var payload = JSON.parse($window.atob(token.split('.')[1]));

        return payload.exp > Date.now() / 1000;
      } else {
        return false;
      }
    };

    auth.currentUser = function(){
      if(auth.isLoggedIn()){
        var token = auth.getToken();
        var payload = JSON.parse($window.atob(token.split('.')[1]));

        return payload.username;
      }
    };

    auth.register = function(user){
      return $http.post('/register', user).success(function(data){
        auth.saveToken(data.token);
      });
    };

    auth.logIn = function(user){
      return $http.post('/login', user).success(function(data){
        auth.saveToken(data.token);
      });
    };
    auth.logOut = function(){
      $window.localStorage.removeItem('xchange-token');
    };
  return auth;
}])

app.factory('messages', ['$http', 'auth', function($http, auth){
  var o = {};
  o.messages = [];
  o.getAll = function() {
    return $http.get('/messages',{
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      angular.copy(data, o.messages);
    });
  }
  o.create = function(message) {
    return $http.post('/messages', message, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      console.log(data);
    });
  };
  o.get = function(id) {
    return $http.get('/messages/'+ id).then(function(res) {
      return res.data;
    });
  }
  return o;
}]);

app.factory('users', ['$http', 'auth', function($http, auth){
  var o = {};
  o.users = [];
  o.getAll = function() {
    return $http.get('/users').success(function(data) {
      angular.copy(data, o.users);
    })
  }
  o.get = function(username) {
    return $http.get('/users/'+username).then(function(res) {
      return res.data;
    })
  }
  return o;
}]);

app.controller('MainCtrl', [
'$scope',
'auth',
  function($scope,auth){
    $scope.isLoggedIn = auth.isLoggedIn;
  }
]);

app.controller('HomeCtrl', [
'$scope',
'auth',
  function($scope,auth){
    $scope.isLoggedIn = auth.isLoggedIn;
  }
]);

app.controller('InboxCtrl', [
'$scope',
'auth',
'messages',
  function($scope,auth,messages){
    $scope.messages = messages.messages;
    $scope.isLoggedIn = auth.isLoggedIn;
  }
]);

app.controller('NewMsgCtrl', [
'$scope',
'$stateParams',
'auth',
'messages',
  function($scope,$stateParams,auth,messages){
    $scope.message = {};
    $scope.currentUser = auth.currentUser;
    $scope.message.receiver = $stateParams.touser;
    $scope.sendMessage = function() {
      if ($scope.message.receiver == "" || $scope.message.content == "") {return;}
      messages.create($scope.message);
    }
  }
]);

app.controller('ProfileCtrl', [
'$scope',
'$http',
'auth',
  function($scope,$http,auth){
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.username = auth.currentUser();
    $scope.profile = {username: $scope.username,
    cool: true};
    $scope.updateProfile = function() {
      return $http.post('/profile', $scope.profile).success(function(data) {
        console.log(data);
      });
    };
  }
]);

app.controller('UsersCtrl', [
'$scope',
'$http',
'auth',
'users',
  function($scope,$http,auth,users){
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.username = auth.currentUser();
    $scope.users = users.users;
  }
]);

app.controller('ProfileViewCtrl', [
'$scope',
'$http',
'auth',
'users',
'user',
  function($scope,$http,auth,users, user){
    $scope.user = user;
    $scope.isLoggedIn = auth.isLoggedIn;
  }
]);

app.controller('AuthCtrl', [
'$scope',
'$state',
'auth',
function($scope, $state, auth){
  $scope.user = {};

  $scope.register = function(){
    auth.register($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };

  $scope.logIn = function(){
    auth.logIn($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };
}]);

app.controller('NavCtrl', [
'$scope',
'auth',
function($scope, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
}]);
