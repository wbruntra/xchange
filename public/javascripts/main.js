var app = angular.module('xChange',['ui.router']);

// [START routes]

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('entry', {
      url: '/entry',
      templateUrl: 'templates/entry.html',
      controller: 'MainController',
      onEnter: ['$state', 'auth', function($state, auth) {
        if(auth.isLoggedIn()) {
          $state.go('home');
        }
      }]
    })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'AuthController',
    onEnter: ['$state', 'auth', function($state, auth){
      if(auth.isLoggedIn()){
        $state.go('entry');
      }
    }]
  })
  .state('register', {
    url: '/register',
    templateUrl: 'templates/register.html',
    controller: 'AuthController',
    onEnter: ['$state', 'auth', function($state, auth){
      if(auth.isLoggedIn()){
        $state.go('entry');
      }
    }]
  })

  .state('profile', {
    url: '/profile',
    templateUrl: 'templates/profile.html',
    controller: 'ProfileController'
  })

  .state('userlist', {
    url: '/userlist',
    templateUrl: 'templates/userlist.html',
    controller: 'UsersController',
    resolve: {
      userPromise: ['users', function(users) {
        return users.getAll();
      }]
    }
  })

  .state('review', {
    url: '/review',
    templateUrl: 'templates/review.html',
    controller: 'ReviewController',
    resolve: {}
  })

  .state('viewprofile', {
  url: '/users/{username}',
  templateUrl: 'templates/viewprofile.html',
  controller: 'ProfileViewController',
  resolve: {
    user: ['$stateParams', 'users', function($stateParams, users) {
        return users.get($stateParams.username);
      }]
    }
  })

  .state('inbox', {
    url: '/inbox',
    templateUrl: 'templates/inbox.html',
    controller: 'InboxController',
    resolve: {
      messagePromise: ['messages', function(messages) {
        return messages.getAll();
      }]
    }
  })

  .state('editor', {
    url: '/editor',
    templateUrl: 'templates/editor.html',
    controller: 'EditorController',
    resolve: {
      decksPromise: ['decks', function(decks) {
        return decks.getAll();
      }]
    }
  })

  .state('new', {
    url: '/new?touser',
    templateUrl: 'templates/new.html',
    controller: 'NewMsgController'
  })

  .state('home', {
    url: '/home',
    templateUrl: 'templates/home.html',
    controller: 'HomeController'
  });

  $urlRouterProvider.otherwise('home');
}]);


// [START models]

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

app.factory('decks', ['$http', 'auth', function($http, auth) {
  var o = {};
  o.decks = [];
  o.getAll = function() {
    return $http.get('/decks',{
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      angular.copy(data, o.decks);
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

// [END models]

// [START controllers ]

app.controller('MainController', [
'$scope',
'auth',
  function($scope,auth){
    $scope.isLoggedIn = auth.isLoggedIn;
  }
]);

app.controller('HomeController', [
'$scope',
'auth',
  function($scope,auth){
    $scope.isLoggedIn = auth.isLoggedIn;
  }
]);

app.controller('InboxController', [
'$scope',
'auth',
'messages',
  function($scope,auth,messages){
    $scope.messages = messages.messages;
    $scope.isLoggedIn = auth.isLoggedIn;
  }
]);

app.controller('NewMsgController', [
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

app.controller('ProfileController', [
'$scope',
'$http',
'auth',
  function($scope,$http,auth){
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.username = auth.currentUser();
    $scope.profile = {username: $scope.username};
    $scope.updateProfile = function() {
      return $http.post('/profile', $scope.profile).success(function(data) {
        console.log(data);
      });
    };
  }
]);

app.controller('UsersController', [
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

app.controller('ProfileViewController', [
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

app.controller('AuthController', [
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

app.controller('NavController', [
'$scope',
'auth',
function($scope, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
}]);

app.controller('ReviewController', [
  '$scope',
  'auth',
  function($scope,auth) {
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.currentUser = auth.currentUser;

    $scope.showFront = true;
    $scope.index = 0;
    $scope.cards = [
      {front:'Hello',back:'World!',tips:'really great program'},
      {front:'Foo',back:'Bar'},
      {front:'Monty',back:'Python'}
    ];

    $scope.nextCard = function() {
      $scope.index++;
      $scope.showFront = true;
      if ($scope.index >= $scope.cards.length) {
        $scope.index = 0;
      }
    }
}]);

app.controller('EditorController', [
  '$scope',
  '$http',
  'auth',
  'decks',
  function($scope, $http, auth, decks) {
    $scope.decks = decks.decks;
    $scope.deck = {};
    $scope.deck.title = 'default';
    $scope.card = {};
    $scope.addDeck = function() {
      return $http.post('/decks', $scope.deck, {
        headers: {Authorization: 'Bearer '+auth.getToken()}
      }).success(function(data) {
        console.log(data);
      });
    }
    $scope.addCard = function() {
        return $http.post('/decks/'+ $scope.deckname, $scope.card).success(function(data) {
          console.log(data);
        });
    }
  }
])

// [END controllers]
