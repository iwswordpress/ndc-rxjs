import { ajax } from 'rxjs/ajax';
import { fromEvent, BehaviorSubject, Subject, from, combineLatest } from 'rxjs';
import {
   tap,
   filter,
   map,
   debounce,
   debounceTime,
   switchMap,
   skip,
   skipWhile,
   pluck,
   distinctUntilChanged,
} from 'rxjs/operators';

function printLatLon(value, id, city, lat, lon) {
   const container = document.getElementById('results-container');
   const item = document.createElement('a');
   item.innerHTML = `${value}<br>`;
   item.setAttribute('id', id);
   item.setAttribute('city', city);
   item.setAttribute('lat', lat);
   item.setAttribute('lon', lon);
   item.setAttribute('href', '#!');
   item.className = '';
   container.appendChild(item);
}
import { apiKey } from './apiKey';
console.log(`%cWEATHER...`, 'color:green; font-size:20px');
const place = document.getElementById('place-data');
const locationOutput = '';
const lastSearch = localStorage.getItem('lastSearch');
const firstTerm = lastSearch !== undefined ? lastSearch : '';

// Handles to our Elements
const searchBox = document.getElementById('search');
const resultsBox = document.getElementById('results-container');
const spinner = document.getElementById('spinner');

// Event Handlers
const searchEvent = fromEvent(searchBox, 'keyup');
const resultsEvent = fromEvent(resultsBox, 'click');

// Subjects
const inputSubject = new BehaviorSubject('');
//const inputSubject = new Subject();
const weatherSubject = new Subject();
const placeSubject = new Subject();

const inputData = inputSubject
   .pipe(
      skip(1),
      skipWhile(value => value === null || value.length < 2),
      // distinctUntilChanged(),
      tap(value => {
         spinner.className = 'spinner';
         resultsBox.innerHTML = `<h3>Search term: ${value}</h3>`;
         console.log(value);
      }),
      debounceTime(500),
      switchMap(value => {
         return ajax
            .getJSON(`https://49plus.co.uk/wp-social/wp-json/wordcamp/v2/locations/${value}`)
            .pipe(
               tap(() => {
                  spinner.className = '';
               }),
               switchMap(results => {
                  return from(results);
               }),
               tap(results => {
                  console.clear();
                  console.log(
                     'Last result...',
                     results.id,
                     results.city,
                     results.country,
                     results.latitude,
                     results.longitude,
                  );
               }),
            );
      }),
   )
   .subscribe(result => {
      localStorage.setItem('lastSearch', searchBox.value);
      printLatLon(
         `${result.id}: ${result.city}, ${result.country}, ${result.latitude}, ${result.longitude}`,
         result.id,
         result.city,
         Math.floor(result.latitude),
         Math.floor(result.longitude),
      );
   });

// Put search data into inputSubject that then processes the stream
searchEvent.subscribe(ev => {
   if (searchBox.value.length > 1) inputSubject.next(searchBox.value);
});

const weatherData = resultsEvent
   .pipe(
      switchMap(ev => {
         const id = ev.target.getAttribute('id');
         const city = ev.target.getAttribute('city');
         const lat = ev.target.getAttribute('lat');
         const lon = ev.target.getAttribute('lon');
         console.clear();
         console.log('ID: ', id);
         console.log('city: ', city);
         console.log('lat: ', lat);
         console.log('lon: ', lon);

         place.innerHTML = `${id} City: ${city}, Lat: ${lat} Lon: ${lon}`;
         return ajax.getJSON(
            `http://api.openweathermap.org/data/2.5/weather?units=metric&lat=${lat}&lon=${lon}&appid=${apiKey}`,
         );
      }),
   )
   .subscribe(data => {
      const res = document.getElementById('temp');
      const output = `${data.main.temp} C`;
      res.innerHTML = output;
      console.log(output);

      const w = document.getElementById('w');
      const i = document.getElementById('image-container');
      // document.getElementById('results-container').style.display = 'none';

      i.style.display = 'block';

      console.log(w.src);
      if (data.main.temp > 12) {
         console.log('SUNNY');
         res.innerHTML += ' => SUNNY';
         w.src = 'images/sunny.png';
      } else {
         console.log('WINTER');
         res.innerHTML += ' => WINTER';
         w.src = 'images/snow.png';
      }
   });

// MINE

console.log(`%cWorking...`, 'color:blue; font-size:20px');

const input = document.getElementById('input');

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
