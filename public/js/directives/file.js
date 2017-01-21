angular.module('chatapp').directive('file', function () {
  return {
    scope: {
      file: '='
    },
    link: function (scope, el, attrs) {
      el.bind('change', function (event) {
        var file = event.target.files[0]
        scope.file = file ? file : null
        scope.$apply()
      })
    }
  }
})
