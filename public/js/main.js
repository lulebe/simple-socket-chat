var app = angular.module('chatapp', ['ui.router'])

app.config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
  $urlRouterProvider
    .otherwise('/');
  $stateProvider
    .state('index', {
      url: '/',
      templateUrl: 'views/index.html',
      data: {auth: false},
      controller: 'indexCtrl'
    })
    .state('app', {
      abstract: true,
      url: '/app',
      templateUrl: 'views/app/index.html',
      data: {auth: true},
      controller: 'appCtrl'
    })
    .state('app.chat', {
      url: '/chat/:username',
      templateUrl: 'views/app/chat.html',
      controller: 'appChatCtrl'
    })
    .state('app.newChat', {
      url: '/newChat',
      templateUrl: 'views/app/newchat.html',
      controller: 'appNewChatCtrl'
    });
  //auth interceptor
  $httpProvider.interceptors.push('authInterceptor');
});

//auth interceptor for HTTP requests
app.factory('authInterceptor', function($rootScope, $q, $window, $injector) {
  return {
    request: function (config) {
      config.headers = config.headers || {};
      if ($window.sessionStorage.authToken) {
        config.headers.Authorization = $window.sessionStorage.authToken;
      }
      return config;
    },
    responseError: function (res) {
      if (res.status === 401) {
        $window.sessionStorage.removeItem('authToken');
        var $state = $injector.get('$state');
        $state.go('index');
      }
      return $q.reject(res);
    }
  };
});


app.run(function($rootScope, $http, $state, $window) {
  $rootScope.$on('$stateChangeStart', function (event, toState) {
    if (toState.data.auth === true && !$window.sessionStorage.authToken) {
      event.preventDefault()
    }
  });
});
