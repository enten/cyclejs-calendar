import {Observable} from 'rx';
import isolate from '@cycle/isolate';
import {div, span, input, table, tr, th, td, makeDOMDriver} from '@cycle/dom';
import {Calendar} from 'calendar';
import {defaultsDeep, isNumber, isPlainObject, mapValues, toPlainObject} from 'lodash';

const calendar = new Calendar();
const now = new Date();

const defaultProps = {
  i18n: {
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  },
  year: now.getFullYear(),
  month: now.getMonth(),
  value: null
};

function intent(DOM) {
  return Observable.merge(
    DOM.select('.prev').events('click').map(() => -1),
    DOM.select('.next').events('click').map(() => +1),
    DOM.select('.cal-date').events('click').map(x => mapValues(toPlainObject(x.target.dataset), Number))
  ).startWith(null)
}

function model(props$, intent$) {
  return Observable.combineLatest(props$, intent$,
    (props, intent) => {
      if (isNumber(intent)) {
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
      if (isPlainObject(intent)) {
        props.value = intent;
      }
      return props;
    });
}

function view(model$) {
  return model$.map(
    props => div('.cal-wg',
      table([
          tr([
            th(input('.prev', {type: 'button', value: '<'})),
            th({colSpan:5}, props.i18n.months[props.month].substring(0, 3)+' '+props.year),
            th(input('.next', {type: 'button', value: '>'}))
          ]),
          tr(props.i18n.days.map(x => th(x.substring(0, 2))))
        ]
        .concat(calendar.monthDates(props.year, props.month).map(
          w => tr(w.map(
            d => td(
              '.cal-date'
                +(d.getMonth() != props.month ? ' .minor' : '')
                +(d.getDate() == now.getDate() && d.getMonth() == now.getMonth() && d.getFullYear() == now.getFullYear() ? ' .today' : '')
                +(isPlainObject(props.value) && d.getDate() === props.value.day && d.getMonth() === props.value.month && d.getFullYear() === props.value.year ? ' .selected' : ''),
              {
                style: {
                  cursor: 'pointer'
                },
                dataset: {
                  year: d.getFullYear(),
                  month: d.getMonth(),
                  day: d.getDate()
                }
              },
              d.getDate().toString()
            )
          ))
        ))
      )
    )
  );
}

function CalendarWidget({DOM, props$}) {
  if (!props$) {
    props$ = Observable.of({});
  }

  const initProps$ = props$
    .merge(Observable.of(defaultProps))
    .reduce((x, y) => defaultsDeep(x, y));

  const intent$ = intent(DOM);
  const model$ = model(initProps$, intent$);
  const view$ = view(model$);

  const value$ = intent$
    .filter(intent => isPlainObject(intent))
    .map(value => new Date(value.year, value.month, value.day))
    .startWith(null);

  return {
    DOM: view$,
    value$
  };
}

export default (sources) => isolate(CalendarWidget)(sources);
