// FORM
// import $ from 'jquery';
import { ajax } from 'rxjs/ajax';
import { fromFetch } from 'rxjs/fetch';
import { of, fromEvent, BehaviorSubject, Subject, from, combineLatest, fromPromise } from 'rxjs';
import {
   tap,
   delay,
   filter,
   take,
   map,
   debounce,
   debounceTime,
   catchError,
   switchMap,
   skip,
   skipWhile,
   pluck,
   distinctUntilChanged,
} from 'rxjs/operators';

console.log(`%cWorking...`, 'color:green; font-size:20px');

const input = document.getElementById('input');
const button = document.getElementById('button');

const button$ = fromEvent(button, 'click');
// console.log('button$', button$);

button$.subscribe(
   function next() {
      console.log(`[BUTTON SUBSCRIBE] BUTTON was clicked`);
   },
   function error(err) {
      console.log(err.message);
   },
   function complete() {
      console.log('ButBUTTONon Completed');
   },
);
function ValidateEmail(mail) {
   if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail)) {
      return true;
   } else {
      return false;
   }
}
const input$ = fromEvent(input, 'keyup').pipe(
   debounceTime(750),
   // take(2), // number of events
   filter(function check(x) {
      const val = x.target.value;
      // return ValidateEmail(val);
      return val > 3;
   }),
   tap(x => console.log('tap after filter and before map: ', x.target.value)),
   map(function (x) {
      const url = 'https://api.github.com/users?per_page=' + x.target.value;
      console.log('URL is  ', url);
      return url;
   }),
   switchMap(url => ajax(url)),
);
// console.log('input$', input$);
input$.subscribe(
   function next(x) {
      console.log('[INPUT SUBSCRIBE] ', x.response);
   },
   function error(err) {
      console.log(err.message);
   },
   function complete() {
      console.log('INPUT Completed');
   },
);

const data$ = fromFetch('https://api.github.com/users?per_page=5').pipe(
   delay(1000),
   switchMap(response => {
      if (response.ok) {
         // OK return data
         return response.json();
      } else {
         // Server is returning a status requiring the client to try something else.
         return of({ error: true, message: `Error ${response.status}` });
      }
   }),
   catchError(err => {
      // Network or other error, handle appropriately
      console.error(err);
      return of({ error: true, message: err.message });
   }),
);

data$.subscribe({
   next: result => console.log(result),
   complete: () => console.log('done'),
});

combineLatest([input$, button$, data$])
   .pipe()
   .subscribe(
      function next(x) {
         console.log('[COMBINE LATEST - DO FETCH]', x[0], x[1], x[2]);
      },
      function error(err) {
         console.log(err.message);
      },
      function complete() {
         console.log('INPUT Completed');
      },
   );
