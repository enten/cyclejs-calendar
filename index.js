'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rx = require('rx');

var _cycleIsolate = require('@cycle/isolate');

var _cycleIsolate2 = _interopRequireDefault(_cycleIsolate);

var _cycleDom = require('@cycle/dom');

var _calendar = require('calendar');

var _lodash = require('lodash');

var calendar = new _calendar.Calendar();
var now = new Date();

var defaultProps = {
  i18n: {
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  },
  year: now.getFullYear(),
  month: now.getMonth(),
  value: null
};

function intent(DOM) {
  return _rx.Observable.merge(DOM.select('.prev').events('click').map(function () {
    return -1;
  }), DOM.select('.next').events('click').map(function () {
    return +1;
  }), DOM.select('.cal-date').events('click').map(function (x) {
    return (0, _lodash.mapValues)((0, _lodash.toPlainObject)(x.target.dataset), Number);
  })).startWith(null);
}

function model(props$, intent$) {
  return _rx.Observable.combineLatest(props$, intent$, function (props, intent) {
    if ((0, _lodash.isNumber)(intent)) {
      props.month = props.month + intent;
      if (props.month < 0) {
        props.year--;
        props.month = 11;
      }
      if (props.month > 11) {
        props.year++;
        props.month = 0;
      }
    }
    if ((0, _lodash.isPlainObject)(intent)) {
      props.value = intent;
    }
    return props;
  });
}

function view(model$) {
  return model$.map(function (props) {
    return (0, _cycleDom.div)('.cal-wg', (0, _cycleDom.table)([(0, _cycleDom.tr)([(0, _cycleDom.th)((0, _cycleDom.input)('.prev', { type: 'button', value: '<' })), (0, _cycleDom.th)({ colSpan: 5 }, props.i18n.months[props.month].substring(0, 3) + ' ' + props.year), (0, _cycleDom.th)((0, _cycleDom.input)('.next', { type: 'button', value: '>' }))]), (0, _cycleDom.tr)(props.i18n.days.map(function (x) {
      return (0, _cycleDom.th)(x.substring(0, 2));
    }))].concat(calendar.monthDates(props.year, props.month).map(function (w) {
      return (0, _cycleDom.tr)(w.map(function (d) {
        return (0, _cycleDom.td)('.cal-date' + (d.getMonth() != props.month ? ' .minor' : '') + (d.getDate() == now.getDate() && d.getMonth() == now.getMonth() && d.getFullYear() == now.getFullYear() ? ' .today' : '') + ((0, _lodash.isPlainObject)(props.value) && d.getDate() === props.value.day && d.getMonth() === props.value.month && d.getFullYear() === props.value.year ? ' .selected' : ''), {
          style: {
            cursor: 'pointer'
          },
          dataset: {
            year: d.getFullYear(),
            month: d.getMonth(),
            day: d.getDate()
          }
        }, d.getDate().toString());
      }));
    }))));
  });
}

function CalendarWidget(_ref) {
  var DOM = _ref.DOM;
  var props$ = _ref.props$;

  if (!props$) {
    props$ = _rx.Observable.of({});
  }

  var initProps$ = props$.merge(_rx.Observable.of(defaultProps)).reduce(function (x, y) {
    return (0, _lodash.defaultsDeep)(x, y);
  });

  var intent$ = intent(DOM);
  var model$ = model(initProps$, intent$);
  var view$ = view(model$);

  var value$ = intent$.filter(function (intent) {
    return (0, _lodash.isPlainObject)(intent);
  }).map(function (value) {
    return new Date(value.year, value.month, value.day);
  }).startWith(null);

  return {
    DOM: view$,
    value$: value$
  };
}

exports['default'] = function (sources) {
  return (0, _cycleIsolate2['default'])(CalendarWidget)(sources);
};

module.exports = exports['default'];
