// Single-line comment
/* Multi-line comment
   spanning several lines */

// ── Imports ────────────────────────────────────────────────────────────────
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

// ── Constants & primitives ──────────────────────────────────────────────────
const VERSION = '2.0.0'
const MAX_RETRIES = 3
const isProduction = process.env.NODE_ENV === 'production'

// ── Object & destructuring ──────────────────────────────────────────────────
const config = {
  host: 'localhost',
  port: 3000,
  db: {
    name: 'chalkboard',
    pool: { min: 2, max: 10 },
  },
}

const { host, port, db: { name: dbName } } = config

// ── Arrow functions & array methods ────────────────────────────────────────
const double = (n) => n * 2
const isEven = (n) => n % 2 === 0

const numbers = [1, 2, 3, 4, 5]
const evens = numbers.filter(isEven).map(double)
const sum = numbers.reduce((acc, n) => acc + n, 0)

// ── Template literals ───────────────────────────────────────────────────────
const greeting = (name) => `Hello, ${name}! Running v${VERSION}`
const multiLine = `
  Host: ${host}
  Port: ${port}
  DB:   ${dbName}
`

// ── Classes ─────────────────────────────────────────────────────────────────
class EventEmitter {
  #listeners = new Map()

  on(event, callback) {
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, [])
    }
    this.#listeners.get(event).push(callback)
    return this
  }

  emit(event, ...args) {
    this.#listeners.get(event)?.forEach((cb) => cb(...args))
  }
}

// ── Async / await ───────────────────────────────────────────────────────────
async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (err) {
      if (attempt === retries) throw err
      console.warn(`Attempt ${attempt} failed, retrying...`)
    }
  }
}

// ── Generators ──────────────────────────────────────────────────────────────
function* range(start, end, step = 1) {
  for (let i = start; i < end; i += step) yield i
}

// ── Regex ───────────────────────────────────────────────────────────────────
const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
const slug = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// ── Symbols & well-known symbols ────────────────────────────────────────────
const kPrivate = Symbol('private')
const iterable = {
  [Symbol.iterator]() {
    return range(0, 5)
  },
}

export { EventEmitter, fetchWithRetry, greeting, config }

function Foo( arg1, arg2 )
{
    switch ( true )
    {
    case ( arg1 instanceof Foo ):
        break;
    case ( null == undefined ):
        break;
    case ( "0" ? true : false ):
        break;
    }
    try
    {
        return "My name is Java".replace( /Java/, "Javascript" );
}
catch ( errorValue )
{
    var d = new Date( 2010, 2, 1, 14, 25, 30 );
    var e = d.getFullYear() + '-' + ( d.getMonth() + 1 ) + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() );
}
finally
{
    if ( yz > 0 )
    {
        this.pyz = function ()
        {
            return this.prefix + "Y";
        };
    }
}
this.m1 = px();
};

function Operators()
{
    var a = '$' + ( 3 + 4 );
    loop1: for ( var a = 0; a < 10; a++ )
    {
        loop2: for ( var b = 0; b < 10; ++b )
        {
            if ( b == 3 )
            {
                continue loop2;
            }
            if ( b == 6 )
            {
                continue loop1;
            }
        }
    }
}