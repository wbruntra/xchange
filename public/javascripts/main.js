var app = angular.module('xChange',['ui.router','ngSanitize']);

// var getAllDecks = function(decks) {
//   return decks.getAll();
// };

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
    resolve: { decksPromise: ['decks', function(decks) {
      return decks.getAll();
    }]}
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
    templateUrl: 'editor',
    controller: 'EditorController',
    resolve: {
      decksPromise: ['decks', function(decks) {
        return decks.getAll();
      }]
    }
  })

  .state('study', {
    url: '/study/{uniqname}',
    templateUrl: 'templates/studydeck.html',
    controller: 'StudyController',
    resolve: {
      deck: ['$stateParams', 'decks', function($stateParams, decks) {
        return decks.get($stateParams.uniqname)
      }]
    }
  })

  .state('viewtext', {
    url: '/texts/{id}',
    templateUrl: function(stateParams) {
      return 'viewtext/'+ stateParams.id
    },
    controller: 'TextViewController',
    resolve: {
    //   text: ['$stateParams', 'texts', function($stateParams, texts) {
    //   return texts.get($stateParams.id);
    // }],
      decksPromise: ['decks', function(decks) {
        return decks.getAll();
      }]
    }
  })

  .state('texts', {
    url: '/texts',
    templateUrl: 'templates/texts.html',
    controller: 'TextController',
    resolve: {
      textsPromise: ['texts', function(texts) {
        return texts.getAll();
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

app.factory('texts', ['$http', 'auth', function($http, auth){
  var o = {};
  o.texts = [];
  o.getAll = function() {
    return $http.get('/texts',{
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      angular.copy(data, o.texts);
    });
  }
  o.create = function(text) {
    return $http.post('/texts', text, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      console.log(data);
    });
  };
  o.get = function(id) {
    return $http.get('/texts/'+ id).then(function(res) {
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
  };
  o.get = function(uniqname) {
  return $http.get('/study/'+ uniqname).then(function(res) {
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

app.controller('TextController', [
'$scope',
'auth',
'texts',
  function($scope,auth,texts){
    $scope.startQuill = function() {
      $scope.quill = new Quill('#text-area', {
        theme: 'snow'
      });
    }
    $scope.update = function() {
      console.log('hello!');
      $scope.text.content = document.getElementById('text-area').firstChild.innerHTML;
    }
    $scope.texts = texts.texts;
    $scope.text = {};
    $scope.currentUser = auth.currentUser;
    $scope.submitText = function() {
      $scope.text.content =  document.getElementById('text-area').firstChild.innerHTML;
      if ($scope.text.title == "" || $scope.text.content == "") {return;}
      texts.create($scope.text);
      $scope.text = {};
    }
  }
]);

app.controller('StudyController', ['$scope', 'auth', 'deck',
 function($scope, auth, deck) {
   $scope.deck = deck;
   $scope.cards = deck.cards;
   $scope.showFront = true;
   $scope.index = 0;
   $scope.nextCard = function() {
     $scope.index++;
     $scope.showFront = true;
     if ($scope.index >= $scope.cards.length) {
       $scope.index = 0;
     }
   }
 }
]);

app.controller('TextViewController', [
'$scope',
'$http',
'auth',
'texts',
'decks',
  function($scope,$http,auth,texts, text, decks){
    $scope.card = {};
    $scope.decks = decks.decks;
    $scope.deck = $scope.decks[0];
    $scope.deckname = $scope.decks[0].uniqname;
    // $scope.card.deck = $scope.decks[0].uniqname;
    $scope.annotate = function() {
      console.log('hiya');
      $scope.$broadcast('dataloaded');
    }
    $scope.showSelectedText = function() {
      var text = "";
            if (window.getSelection) {
          text = window.getSelection().toString();
      } else if (document.selection && document.selection.type != "Control") {
          text = document.selection.createRange().text;
      }
      $scope.card.front = text;
    };
    $scope.addCard = function() {
        return $http.post('/decks/'+ $scope.deckname +'/cards', $scope.card, {
          headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data) {
          console.log(data);
        });
    }
  }
]);

app.directive('annotateText', ['$timeout', function ($timeout) {
  return {
    link: function ($scope, element, attrs) {
    $scope.$on('dataloaded', function () {
        $timeout(function () {
          mandarinspot.annotate('#chinese');
        }, 0, false);
      })
    }
  };
}]);

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
  'decks',
  function($scope,auth,decks) {
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.currentUser = auth.currentUser;
    $scope.decks = decks.decks;
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

    $scope.loadCards = function(deckName) {

    };
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
        return $http.post('/cards', $scope.card).success(function(data) {
          console.log(data);
        });
    };
  }
])

// [END controllers]

// [START multiple use functions]

function getLetters() {
  var letters = {
    a1: "ā",
    a2: "á",
    a3: 'ǎ',
    a4: "à",
    e1: "ē",
    e2: "é",
    e3: 'ě',
    e4: "è",
    i1: "ī",
    i2: "í",
    i3: 'ǐ',
    i4: "ì",
    o1: "ō",
    o2: "ó",
    o3: 'ǒ',
    o4: "ò",
    u1: "ū",
    u2: "ú",
    u3: "ǔ",
    u4: "ù",
    v1: "ǖ",
    v2: "ǘ",
    v3: "ǚ",
    v4: "ǜ"
  }
  return letters
}

var activeVowel = "";
var onAlert = false;
$(document).on('keypress','.pinyin',function(e) {
  var key = e.key;
  if (onAlert) {
    if ('1234'.indexOf(key) != -1) {
      e.preventDefault();
      var $txt = $(this);
      var caretPos = $txt[0].selectionStart;
      var textAreaTxt = $txt.val();
      var tone = activeVowel + key;
      var txtToAdd = letters[tone];
      $txt.val(textAreaTxt.substring(0, caretPos-1) + txtToAdd + textAreaTxt.substring(caretPos) );
      activeVowel = "";
      $txt[0].selectionStart = caretPos;
      $txt[0].selectionEnd = caretPos;
      angular.element($txt).scope().$digest();
    }
    onAlert = false;
  };
  if ('aeiouv'.indexOf(key) != -1) {
    activeVowel = key;
    onAlert = true;
  };
});


// [END multiple use functions]
