(function (exports) {
    'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol, Iterator */


    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __classPrivateFieldGet(receiver, state, kind, f) {
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    var _a, _ID_hexTimestamp;
    /**
     * Helper class to generate ID strings for resources.
     */
    class ID {
        /**
         * Uses the provided ID as the ID for the resource.
         *
         * @param {string} id
         * @returns {string}
         */
        static custom(id) {
            return id;
        }
        /**
         * Have Appwrite generate a unique ID for you.
         *
         * @param {number} padding. Default is 7.
         * @returns {string}
         */
        static unique(padding = 7) {
            // Generate a unique ID with padding to have a longer ID
            const baseId = __classPrivateFieldGet(_a, _a, "m", _ID_hexTimestamp).call(_a);
            let randomPadding = '';
            for (let i = 0; i < padding; i++) {
                const randomHexDigit = Math.floor(Math.random() * 16).toString(16);
                randomPadding += randomHexDigit;
            }
            return baseId + randomPadding;
        }
    }
    _a = ID, _ID_hexTimestamp = function _ID_hexTimestamp() {
        const now = new Date();
        const sec = Math.floor(now.getTime() / 1000);
        const msec = now.getMilliseconds();
        // Convert to hexadecimal
        const hexTimestamp = sec.toString(16) + msec.toString(16).padStart(5, '0');
        return hexTimestamp;
    };

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    var jsonBigint = {exports: {}};

    var stringify = {exports: {}};

    var bignumber$1 = {exports: {}};

    var bignumber = bignumber$1.exports;

    var hasRequiredBignumber;

    function requireBignumber () {
    	if (hasRequiredBignumber) return bignumber$1.exports;
    	hasRequiredBignumber = 1;
    	(function (module) {
    (function (globalObject) {

    		/*
    		 *      bignumber.js v9.3.1
    		 *      A JavaScript library for arbitrary-precision arithmetic.
    		 *      https://github.com/MikeMcl/bignumber.js
    		 *      Copyright (c) 2025 Michael Mclaughlin <M8ch88l@gmail.com>
    		 *      MIT Licensed.
    		 *
    		 *      BigNumber.prototype methods     |  BigNumber methods
    		 *                                      |
    		 *      absoluteValue            abs    |  clone
    		 *      comparedTo                      |  config               set
    		 *      decimalPlaces            dp     |      DECIMAL_PLACES
    		 *      dividedBy                div    |      ROUNDING_MODE
    		 *      dividedToIntegerBy       idiv   |      EXPONENTIAL_AT
    		 *      exponentiatedBy          pow    |      RANGE
    		 *      integerValue                    |      CRYPTO
    		 *      isEqualTo                eq     |      MODULO_MODE
    		 *      isFinite                        |      POW_PRECISION
    		 *      isGreaterThan            gt     |      FORMAT
    		 *      isGreaterThanOrEqualTo   gte    |      ALPHABET
    		 *      isInteger                       |  isBigNumber
    		 *      isLessThan               lt     |  maximum              max
    		 *      isLessThanOrEqualTo      lte    |  minimum              min
    		 *      isNaN                           |  random
    		 *      isNegative                      |  sum
    		 *      isPositive                      |
    		 *      isZero                          |
    		 *      minus                           |
    		 *      modulo                   mod    |
    		 *      multipliedBy             times  |
    		 *      negated                         |
    		 *      plus                            |
    		 *      precision                sd     |
    		 *      shiftedBy                       |
    		 *      squareRoot               sqrt   |
    		 *      toExponential                   |
    		 *      toFixed                         |
    		 *      toFormat                        |
    		 *      toFraction                      |
    		 *      toJSON                          |
    		 *      toNumber                        |
    		 *      toPrecision                     |
    		 *      toString                        |
    		 *      valueOf                         |
    		 *
    		 */


    		  var BigNumber,
    		    isNumeric = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i,
    		    mathceil = Math.ceil,
    		    mathfloor = Math.floor,

    		    bignumberError = '[BigNumber Error] ',
    		    tooManyDigits = bignumberError + 'Number primitive has more than 15 significant digits: ',

    		    BASE = 1e14,
    		    LOG_BASE = 14,
    		    MAX_SAFE_INTEGER = 0x1fffffffffffff,         // 2^53 - 1
    		    // MAX_INT32 = 0x7fffffff,                   // 2^31 - 1
    		    POWS_TEN = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13],
    		    SQRT_BASE = 1e7,

    		    // EDITABLE
    		    // The limit on the value of DECIMAL_PLACES, TO_EXP_NEG, TO_EXP_POS, MIN_EXP, MAX_EXP, and
    		    // the arguments to toExponential, toFixed, toFormat, and toPrecision.
    		    MAX = 1E9;                                   // 0 to MAX_INT32


    		  /*
    		   * Create and return a BigNumber constructor.
    		   */
    		  function clone(configObject) {
    		    var div, convertBase, parseNumeric,
    		      P = BigNumber.prototype = { constructor: BigNumber, toString: null, valueOf: null },
    		      ONE = new BigNumber(1),


    		      //----------------------------- EDITABLE CONFIG DEFAULTS -------------------------------


    		      // The default values below must be integers within the inclusive ranges stated.
    		      // The values can also be changed at run-time using BigNumber.set.

    		      // The maximum number of decimal places for operations involving division.
    		      DECIMAL_PLACES = 20,                     // 0 to MAX

    		      // The rounding mode used when rounding to the above decimal places, and when using
    		      // toExponential, toFixed, toFormat and toPrecision, and round (default value).
    		      // UP         0 Away from zero.
    		      // DOWN       1 Towards zero.
    		      // CEIL       2 Towards +Infinity.
    		      // FLOOR      3 Towards -Infinity.
    		      // HALF_UP    4 Towards nearest neighbour. If equidistant, up.
    		      // HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
    		      // HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
    		      // HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
    		      // HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
    		      ROUNDING_MODE = 4,                       // 0 to 8

    		      // EXPONENTIAL_AT : [TO_EXP_NEG , TO_EXP_POS]

    		      // The exponent value at and beneath which toString returns exponential notation.
    		      // Number type: -7
    		      TO_EXP_NEG = -7,                         // 0 to -MAX

    		      // The exponent value at and above which toString returns exponential notation.
    		      // Number type: 21
    		      TO_EXP_POS = 21,                         // 0 to MAX

    		      // RANGE : [MIN_EXP, MAX_EXP]

    		      // The minimum exponent value, beneath which underflow to zero occurs.
    		      // Number type: -324  (5e-324)
    		      MIN_EXP = -1e7,                          // -1 to -MAX

    		      // The maximum exponent value, above which overflow to Infinity occurs.
    		      // Number type:  308  (1.7976931348623157e+308)
    		      // For MAX_EXP > 1e7, e.g. new BigNumber('1e100000000').plus(1) may be slow.
    		      MAX_EXP = 1e7,                           // 1 to MAX

    		      // Whether to use cryptographically-secure random number generation, if available.
    		      CRYPTO = false,                          // true or false

    		      // The modulo mode used when calculating the modulus: a mod n.
    		      // The quotient (q = a / n) is calculated according to the corresponding rounding mode.
    		      // The remainder (r) is calculated as: r = a - n * q.
    		      //
    		      // UP        0 The remainder is positive if the dividend is negative, else is negative.
    		      // DOWN      1 The remainder has the same sign as the dividend.
    		      //             This modulo mode is commonly known as 'truncated division' and is
    		      //             equivalent to (a % n) in JavaScript.
    		      // FLOOR     3 The remainder has the same sign as the divisor (Python %).
    		      // HALF_EVEN 6 This modulo mode implements the IEEE 754 remainder function.
    		      // EUCLID    9 Euclidian division. q = sign(n) * floor(a / abs(n)).
    		      //             The remainder is always positive.
    		      //
    		      // The truncated division, floored division, Euclidian division and IEEE 754 remainder
    		      // modes are commonly used for the modulus operation.
    		      // Although the other rounding modes can also be used, they may not give useful results.
    		      MODULO_MODE = 1,                         // 0 to 9

    		      // The maximum number of significant digits of the result of the exponentiatedBy operation.
    		      // If POW_PRECISION is 0, there will be unlimited significant digits.
    		      POW_PRECISION = 0,                       // 0 to MAX

    		      // The format specification used by the BigNumber.prototype.toFormat method.
    		      FORMAT = {
    		        prefix: '',
    		        groupSize: 3,
    		        secondaryGroupSize: 0,
    		        groupSeparator: ',',
    		        decimalSeparator: '.',
    		        fractionGroupSize: 0,
    		        fractionGroupSeparator: '\xA0',        // non-breaking space
    		        suffix: ''
    		      },

    		      // The alphabet used for base conversion. It must be at least 2 characters long, with no '+',
    		      // '-', '.', whitespace, or repeated character.
    		      // '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_'
    		      ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz',
    		      alphabetHasNormalDecimalDigits = true;


    		    //------------------------------------------------------------------------------------------


    		    // CONSTRUCTOR


    		    /*
    		     * The BigNumber constructor and exported function.
    		     * Create and return a new instance of a BigNumber object.
    		     *
    		     * v {number|string|BigNumber} A numeric value.
    		     * [b] {number} The base of v. Integer, 2 to ALPHABET.length inclusive.
    		     */
    		    function BigNumber(v, b) {
    		      var alphabet, c, caseChanged, e, i, isNum, len, str,
    		        x = this;

    		      // Enable constructor call without `new`.
    		      if (!(x instanceof BigNumber)) return new BigNumber(v, b);

    		      if (b == null) {

    		        if (v && v._isBigNumber === true) {
    		          x.s = v.s;

    		          if (!v.c || v.e > MAX_EXP) {
    		            x.c = x.e = null;
    		          } else if (v.e < MIN_EXP) {
    		            x.c = [x.e = 0];
    		          } else {
    		            x.e = v.e;
    		            x.c = v.c.slice();
    		          }

    		          return;
    		        }

    		        if ((isNum = typeof v == 'number') && v * 0 == 0) {

    		          // Use `1 / n` to handle minus zero also.
    		          x.s = 1 / v < 0 ? (v = -v, -1) : 1;

    		          // Fast path for integers, where n < 2147483648 (2**31).
    		          if (v === ~~v) {
    		            for (e = 0, i = v; i >= 10; i /= 10, e++);

    		            if (e > MAX_EXP) {
    		              x.c = x.e = null;
    		            } else {
    		              x.e = e;
    		              x.c = [v];
    		            }

    		            return;
    		          }

    		          str = String(v);
    		        } else {

    		          if (!isNumeric.test(str = String(v))) return parseNumeric(x, str, isNum);

    		          x.s = str.charCodeAt(0) == 45 ? (str = str.slice(1), -1) : 1;
    		        }

    		        // Decimal point?
    		        if ((e = str.indexOf('.')) > -1) str = str.replace('.', '');

    		        // Exponential form?
    		        if ((i = str.search(/e/i)) > 0) {

    		          // Determine exponent.
    		          if (e < 0) e = i;
    		          e += +str.slice(i + 1);
    		          str = str.substring(0, i);
    		        } else if (e < 0) {

    		          // Integer.
    		          e = str.length;
    		        }

    		      } else {

    		        // '[BigNumber Error] Base {not a primitive number|not an integer|out of range}: {b}'
    		        intCheck(b, 2, ALPHABET.length, 'Base');

    		        // Allow exponential notation to be used with base 10 argument, while
    		        // also rounding to DECIMAL_PLACES as with other bases.
    		        if (b == 10 && alphabetHasNormalDecimalDigits) {
    		          x = new BigNumber(v);
    		          return round(x, DECIMAL_PLACES + x.e + 1, ROUNDING_MODE);
    		        }

    		        str = String(v);

    		        if (isNum = typeof v == 'number') {

    		          // Avoid potential interpretation of Infinity and NaN as base 44+ values.
    		          if (v * 0 != 0) return parseNumeric(x, str, isNum, b);

    		          x.s = 1 / v < 0 ? (str = str.slice(1), -1) : 1;

    		          // '[BigNumber Error] Number primitive has more than 15 significant digits: {n}'
    		          if (BigNumber.DEBUG && str.replace(/^0\.0*|\./, '').length > 15) {
    		            throw Error
    		             (tooManyDigits + v);
    		          }
    		        } else {
    		          x.s = str.charCodeAt(0) === 45 ? (str = str.slice(1), -1) : 1;
    		        }

    		        alphabet = ALPHABET.slice(0, b);
    		        e = i = 0;

    		        // Check that str is a valid base b number.
    		        // Don't use RegExp, so alphabet can contain special characters.
    		        for (len = str.length; i < len; i++) {
    		          if (alphabet.indexOf(c = str.charAt(i)) < 0) {
    		            if (c == '.') {

    		              // If '.' is not the first character and it has not be found before.
    		              if (i > e) {
    		                e = len;
    		                continue;
    		              }
    		            } else if (!caseChanged) {

    		              // Allow e.g. hexadecimal 'FF' as well as 'ff'.
    		              if (str == str.toUpperCase() && (str = str.toLowerCase()) ||
    		                  str == str.toLowerCase() && (str = str.toUpperCase())) {
    		                caseChanged = true;
    		                i = -1;
    		                e = 0;
    		                continue;
    		              }
    		            }

    		            return parseNumeric(x, String(v), isNum, b);
    		          }
    		        }

    		        // Prevent later check for length on converted number.
    		        isNum = false;
    		        str = convertBase(str, b, 10, x.s);

    		        // Decimal point?
    		        if ((e = str.indexOf('.')) > -1) str = str.replace('.', '');
    		        else e = str.length;
    		      }

    		      // Determine leading zeros.
    		      for (i = 0; str.charCodeAt(i) === 48; i++);

    		      // Determine trailing zeros.
    		      for (len = str.length; str.charCodeAt(--len) === 48;);

    		      if (str = str.slice(i, ++len)) {
    		        len -= i;

    		        // '[BigNumber Error] Number primitive has more than 15 significant digits: {n}'
    		        if (isNum && BigNumber.DEBUG &&
    		          len > 15 && (v > MAX_SAFE_INTEGER || v !== mathfloor(v))) {
    		            throw Error
    		             (tooManyDigits + (x.s * v));
    		        }

    		         // Overflow?
    		        if ((e = e - i - 1) > MAX_EXP) {

    		          // Infinity.
    		          x.c = x.e = null;

    		        // Underflow?
    		        } else if (e < MIN_EXP) {

    		          // Zero.
    		          x.c = [x.e = 0];
    		        } else {
    		          x.e = e;
    		          x.c = [];

    		          // Transform base

    		          // e is the base 10 exponent.
    		          // i is where to slice str to get the first element of the coefficient array.
    		          i = (e + 1) % LOG_BASE;
    		          if (e < 0) i += LOG_BASE;  // i < 1

    		          if (i < len) {
    		            if (i) x.c.push(+str.slice(0, i));

    		            for (len -= LOG_BASE; i < len;) {
    		              x.c.push(+str.slice(i, i += LOG_BASE));
    		            }

    		            i = LOG_BASE - (str = str.slice(i)).length;
    		          } else {
    		            i -= len;
    		          }

    		          for (; i--; str += '0');
    		          x.c.push(+str);
    		        }
    		      } else {

    		        // Zero.
    		        x.c = [x.e = 0];
    		      }
    		    }


    		    // CONSTRUCTOR PROPERTIES


    		    BigNumber.clone = clone;

    		    BigNumber.ROUND_UP = 0;
    		    BigNumber.ROUND_DOWN = 1;
    		    BigNumber.ROUND_CEIL = 2;
    		    BigNumber.ROUND_FLOOR = 3;
    		    BigNumber.ROUND_HALF_UP = 4;
    		    BigNumber.ROUND_HALF_DOWN = 5;
    		    BigNumber.ROUND_HALF_EVEN = 6;
    		    BigNumber.ROUND_HALF_CEIL = 7;
    		    BigNumber.ROUND_HALF_FLOOR = 8;
    		    BigNumber.EUCLID = 9;


    		    /*
    		     * Configure infrequently-changing library-wide settings.
    		     *
    		     * Accept an object with the following optional properties (if the value of a property is
    		     * a number, it must be an integer within the inclusive range stated):
    		     *
    		     *   DECIMAL_PLACES   {number}           0 to MAX
    		     *   ROUNDING_MODE    {number}           0 to 8
    		     *   EXPONENTIAL_AT   {number|number[]}  -MAX to MAX  or  [-MAX to 0, 0 to MAX]
    		     *   RANGE            {number|number[]}  -MAX to MAX (not zero)  or  [-MAX to -1, 1 to MAX]
    		     *   CRYPTO           {boolean}          true or false
    		     *   MODULO_MODE      {number}           0 to 9
    		     *   POW_PRECISION       {number}           0 to MAX
    		     *   ALPHABET         {string}           A string of two or more unique characters which does
    		     *                                       not contain '.'.
    		     *   FORMAT           {object}           An object with some of the following properties:
    		     *     prefix                 {string}
    		     *     groupSize              {number}
    		     *     secondaryGroupSize     {number}
    		     *     groupSeparator         {string}
    		     *     decimalSeparator       {string}
    		     *     fractionGroupSize      {number}
    		     *     fractionGroupSeparator {string}
    		     *     suffix                 {string}
    		     *
    		     * (The values assigned to the above FORMAT object properties are not checked for validity.)
    		     *
    		     * E.g.
    		     * BigNumber.config({ DECIMAL_PLACES : 20, ROUNDING_MODE : 4 })
    		     *
    		     * Ignore properties/parameters set to null or undefined, except for ALPHABET.
    		     *
    		     * Return an object with the properties current values.
    		     */
    		    BigNumber.config = BigNumber.set = function (obj) {
    		      var p, v;

    		      if (obj != null) {

    		        if (typeof obj == 'object') {

    		          // DECIMAL_PLACES {number} Integer, 0 to MAX inclusive.
    		          // '[BigNumber Error] DECIMAL_PLACES {not a primitive number|not an integer|out of range}: {v}'
    		          if (obj.hasOwnProperty(p = 'DECIMAL_PLACES')) {
    		            v = obj[p];
    		            intCheck(v, 0, MAX, p);
    		            DECIMAL_PLACES = v;
    		          }

    		          // ROUNDING_MODE {number} Integer, 0 to 8 inclusive.
    		          // '[BigNumber Error] ROUNDING_MODE {not a primitive number|not an integer|out of range}: {v}'
    		          if (obj.hasOwnProperty(p = 'ROUNDING_MODE')) {
    		            v = obj[p];
    		            intCheck(v, 0, 8, p);
    		            ROUNDING_MODE = v;
    		          }

    		          // EXPONENTIAL_AT {number|number[]}
    		          // Integer, -MAX to MAX inclusive or
    		          // [integer -MAX to 0 inclusive, 0 to MAX inclusive].
    		          // '[BigNumber Error] EXPONENTIAL_AT {not a primitive number|not an integer|out of range}: {v}'
    		          if (obj.hasOwnProperty(p = 'EXPONENTIAL_AT')) {
    		            v = obj[p];
    		            if (v && v.pop) {
    		              intCheck(v[0], -MAX, 0, p);
    		              intCheck(v[1], 0, MAX, p);
    		              TO_EXP_NEG = v[0];
    		              TO_EXP_POS = v[1];
    		            } else {
    		              intCheck(v, -MAX, MAX, p);
    		              TO_EXP_NEG = -(TO_EXP_POS = v < 0 ? -v : v);
    		            }
    		          }

    		          // RANGE {number|number[]} Non-zero integer, -MAX to MAX inclusive or
    		          // [integer -MAX to -1 inclusive, integer 1 to MAX inclusive].
    		          // '[BigNumber Error] RANGE {not a primitive number|not an integer|out of range|cannot be zero}: {v}'
    		          if (obj.hasOwnProperty(p = 'RANGE')) {
    		            v = obj[p];
    		            if (v && v.pop) {
    		              intCheck(v[0], -MAX, -1, p);
    		              intCheck(v[1], 1, MAX, p);
    		              MIN_EXP = v[0];
    		              MAX_EXP = v[1];
    		            } else {
    		              intCheck(v, -MAX, MAX, p);
    		              if (v) {
    		                MIN_EXP = -(MAX_EXP = v < 0 ? -v : v);
    		              } else {
    		                throw Error
    		                 (bignumberError + p + ' cannot be zero: ' + v);
    		              }
    		            }
    		          }

    		          // CRYPTO {boolean} true or false.
    		          // '[BigNumber Error] CRYPTO not true or false: {v}'
    		          // '[BigNumber Error] crypto unavailable'
    		          if (obj.hasOwnProperty(p = 'CRYPTO')) {
    		            v = obj[p];
    		            if (v === !!v) {
    		              if (v) {
    		                if (typeof crypto != 'undefined' && crypto &&
    		                 (crypto.getRandomValues || crypto.randomBytes)) {
    		                  CRYPTO = v;
    		                } else {
    		                  CRYPTO = !v;
    		                  throw Error
    		                   (bignumberError + 'crypto unavailable');
    		                }
    		              } else {
    		                CRYPTO = v;
    		              }
    		            } else {
    		              throw Error
    		               (bignumberError + p + ' not true or false: ' + v);
    		            }
    		          }

    		          // MODULO_MODE {number} Integer, 0 to 9 inclusive.
    		          // '[BigNumber Error] MODULO_MODE {not a primitive number|not an integer|out of range}: {v}'
    		          if (obj.hasOwnProperty(p = 'MODULO_MODE')) {
    		            v = obj[p];
    		            intCheck(v, 0, 9, p);
    		            MODULO_MODE = v;
    		          }

    		          // POW_PRECISION {number} Integer, 0 to MAX inclusive.
    		          // '[BigNumber Error] POW_PRECISION {not a primitive number|not an integer|out of range}: {v}'
    		          if (obj.hasOwnProperty(p = 'POW_PRECISION')) {
    		            v = obj[p];
    		            intCheck(v, 0, MAX, p);
    		            POW_PRECISION = v;
    		          }

    		          // FORMAT {object}
    		          // '[BigNumber Error] FORMAT not an object: {v}'
    		          if (obj.hasOwnProperty(p = 'FORMAT')) {
    		            v = obj[p];
    		            if (typeof v == 'object') FORMAT = v;
    		            else throw Error
    		             (bignumberError + p + ' not an object: ' + v);
    		          }

    		          // ALPHABET {string}
    		          // '[BigNumber Error] ALPHABET invalid: {v}'
    		          if (obj.hasOwnProperty(p = 'ALPHABET')) {
    		            v = obj[p];

    		            // Disallow if less than two characters,
    		            // or if it contains '+', '-', '.', whitespace, or a repeated character.
    		            if (typeof v == 'string' && !/^.?$|[+\-.\s]|(.).*\1/.test(v)) {
    		              alphabetHasNormalDecimalDigits = v.slice(0, 10) == '0123456789';
    		              ALPHABET = v;
    		            } else {
    		              throw Error
    		               (bignumberError + p + ' invalid: ' + v);
    		            }
    		          }

    		        } else {

    		          // '[BigNumber Error] Object expected: {v}'
    		          throw Error
    		           (bignumberError + 'Object expected: ' + obj);
    		        }
    		      }

    		      return {
    		        DECIMAL_PLACES: DECIMAL_PLACES,
    		        ROUNDING_MODE: ROUNDING_MODE,
    		        EXPONENTIAL_AT: [TO_EXP_NEG, TO_EXP_POS],
    		        RANGE: [MIN_EXP, MAX_EXP],
    		        CRYPTO: CRYPTO,
    		        MODULO_MODE: MODULO_MODE,
    		        POW_PRECISION: POW_PRECISION,
    		        FORMAT: FORMAT,
    		        ALPHABET: ALPHABET
    		      };
    		    };


    		    /*
    		     * Return true if v is a BigNumber instance, otherwise return false.
    		     *
    		     * If BigNumber.DEBUG is true, throw if a BigNumber instance is not well-formed.
    		     *
    		     * v {any}
    		     *
    		     * '[BigNumber Error] Invalid BigNumber: {v}'
    		     */
    		    BigNumber.isBigNumber = function (v) {
    		      if (!v || v._isBigNumber !== true) return false;
    		      if (!BigNumber.DEBUG) return true;

    		      var i, n,
    		        c = v.c,
    		        e = v.e,
    		        s = v.s;

    		      out: if ({}.toString.call(c) == '[object Array]') {

    		        if ((s === 1 || s === -1) && e >= -MAX && e <= MAX && e === mathfloor(e)) {

    		          // If the first element is zero, the BigNumber value must be zero.
    		          if (c[0] === 0) {
    		            if (e === 0 && c.length === 1) return true;
    		            break out;
    		          }

    		          // Calculate number of digits that c[0] should have, based on the exponent.
    		          i = (e + 1) % LOG_BASE;
    		          if (i < 1) i += LOG_BASE;

    		          // Calculate number of digits of c[0].
    		          //if (Math.ceil(Math.log(c[0] + 1) / Math.LN10) == i) {
    		          if (String(c[0]).length == i) {

    		            for (i = 0; i < c.length; i++) {
    		              n = c[i];
    		              if (n < 0 || n >= BASE || n !== mathfloor(n)) break out;
    		            }

    		            // Last element cannot be zero, unless it is the only element.
    		            if (n !== 0) return true;
    		          }
    		        }

    		      // Infinity/NaN
    		      } else if (c === null && e === null && (s === null || s === 1 || s === -1)) {
    		        return true;
    		      }

    		      throw Error
    		        (bignumberError + 'Invalid BigNumber: ' + v);
    		    };


    		    /*
    		     * Return a new BigNumber whose value is the maximum of the arguments.
    		     *
    		     * arguments {number|string|BigNumber}
    		     */
    		    BigNumber.maximum = BigNumber.max = function () {
    		      return maxOrMin(arguments, -1);
    		    };


    		    /*
    		     * Return a new BigNumber whose value is the minimum of the arguments.
    		     *
    		     * arguments {number|string|BigNumber}
    		     */
    		    BigNumber.minimum = BigNumber.min = function () {
    		      return maxOrMin(arguments, 1);
    		    };


    		    /*
    		     * Return a new BigNumber with a random value equal to or greater than 0 and less than 1,
    		     * and with dp, or DECIMAL_PLACES if dp is omitted, decimal places (or less if trailing
    		     * zeros are produced).
    		     *
    		     * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
    		     *
    		     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp}'
    		     * '[BigNumber Error] crypto unavailable'
    		     */
    		    BigNumber.random = (function () {
    		      var pow2_53 = 0x20000000000000;

    		      // Return a 53 bit integer n, where 0 <= n < 9007199254740992.
    		      // Check if Math.random() produces more than 32 bits of randomness.
    		      // If it does, assume at least 53 bits are produced, otherwise assume at least 30 bits.
    		      // 0x40000000 is 2^30, 0x800000 is 2^23, 0x1fffff is 2^21 - 1.
    		      var random53bitInt = (Math.random() * pow2_53) & 0x1fffff
    		       ? function () { return mathfloor(Math.random() * pow2_53); }
    		       : function () { return ((Math.random() * 0x40000000 | 0) * 0x800000) +
    		         (Math.random() * 0x800000 | 0); };

    		      return function (dp) {
    		        var a, b, e, k, v,
    		          i = 0,
    		          c = [],
    		          rand = new BigNumber(ONE);

    		        if (dp == null) dp = DECIMAL_PLACES;
    		        else intCheck(dp, 0, MAX);

    		        k = mathceil(dp / LOG_BASE);

    		        if (CRYPTO) {

    		          // Browsers supporting crypto.getRandomValues.
    		          if (crypto.getRandomValues) {

    		            a = crypto.getRandomValues(new Uint32Array(k *= 2));

    		            for (; i < k;) {

    		              // 53 bits:
    		              // ((Math.pow(2, 32) - 1) * Math.pow(2, 21)).toString(2)
    		              // 11111 11111111 11111111 11111111 11100000 00000000 00000000
    		              // ((Math.pow(2, 32) - 1) >>> 11).toString(2)
    		              //                                     11111 11111111 11111111
    		              // 0x20000 is 2^21.
    		              v = a[i] * 0x20000 + (a[i + 1] >>> 11);

    		              // Rejection sampling:
    		              // 0 <= v < 9007199254740992
    		              // Probability that v >= 9e15, is
    		              // 7199254740992 / 9007199254740992 ~= 0.0008, i.e. 1 in 1251
    		              if (v >= 9e15) {
    		                b = crypto.getRandomValues(new Uint32Array(2));
    		                a[i] = b[0];
    		                a[i + 1] = b[1];
    		              } else {

    		                // 0 <= v <= 8999999999999999
    		                // 0 <= (v % 1e14) <= 99999999999999
    		                c.push(v % 1e14);
    		                i += 2;
    		              }
    		            }
    		            i = k / 2;

    		          // Node.js supporting crypto.randomBytes.
    		          } else if (crypto.randomBytes) {

    		            // buffer
    		            a = crypto.randomBytes(k *= 7);

    		            for (; i < k;) {

    		              // 0x1000000000000 is 2^48, 0x10000000000 is 2^40
    		              // 0x100000000 is 2^32, 0x1000000 is 2^24
    		              // 11111 11111111 11111111 11111111 11111111 11111111 11111111
    		              // 0 <= v < 9007199254740992
    		              v = ((a[i] & 31) * 0x1000000000000) + (a[i + 1] * 0x10000000000) +
    		                 (a[i + 2] * 0x100000000) + (a[i + 3] * 0x1000000) +
    		                 (a[i + 4] << 16) + (a[i + 5] << 8) + a[i + 6];

    		              if (v >= 9e15) {
    		                crypto.randomBytes(7).copy(a, i);
    		              } else {

    		                // 0 <= (v % 1e14) <= 99999999999999
    		                c.push(v % 1e14);
    		                i += 7;
    		              }
    		            }
    		            i = k / 7;
    		          } else {
    		            CRYPTO = false;
    		            throw Error
    		             (bignumberError + 'crypto unavailable');
    		          }
    		        }

    		        // Use Math.random.
    		        if (!CRYPTO) {

    		          for (; i < k;) {
    		            v = random53bitInt();
    		            if (v < 9e15) c[i++] = v % 1e14;
    		          }
    		        }

    		        k = c[--i];
    		        dp %= LOG_BASE;

    		        // Convert trailing digits to zeros according to dp.
    		        if (k && dp) {
    		          v = POWS_TEN[LOG_BASE - dp];
    		          c[i] = mathfloor(k / v) * v;
    		        }

    		        // Remove trailing elements which are zero.
    		        for (; c[i] === 0; c.pop(), i--);

    		        // Zero?
    		        if (i < 0) {
    		          c = [e = 0];
    		        } else {

    		          // Remove leading elements which are zero and adjust exponent accordingly.
    		          for (e = -1 ; c[0] === 0; c.splice(0, 1), e -= LOG_BASE);

    		          // Count the digits of the first element of c to determine leading zeros, and...
    		          for (i = 1, v = c[0]; v >= 10; v /= 10, i++);

    		          // adjust the exponent accordingly.
    		          if (i < LOG_BASE) e -= LOG_BASE - i;
    		        }

    		        rand.e = e;
    		        rand.c = c;
    		        return rand;
    		      };
    		    })();


    		    /*
    		     * Return a BigNumber whose value is the sum of the arguments.
    		     *
    		     * arguments {number|string|BigNumber}
    		     */
    		    BigNumber.sum = function () {
    		      var i = 1,
    		        args = arguments,
    		        sum = new BigNumber(args[0]);
    		      for (; i < args.length;) sum = sum.plus(args[i++]);
    		      return sum;
    		    };


    		    // PRIVATE FUNCTIONS


    		    // Called by BigNumber and BigNumber.prototype.toString.
    		    convertBase = (function () {
    		      var decimal = '0123456789';

    		      /*
    		       * Convert string of baseIn to an array of numbers of baseOut.
    		       * Eg. toBaseOut('255', 10, 16) returns [15, 15].
    		       * Eg. toBaseOut('ff', 16, 10) returns [2, 5, 5].
    		       */
    		      function toBaseOut(str, baseIn, baseOut, alphabet) {
    		        var j,
    		          arr = [0],
    		          arrL,
    		          i = 0,
    		          len = str.length;

    		        for (; i < len;) {
    		          for (arrL = arr.length; arrL--; arr[arrL] *= baseIn);

    		          arr[0] += alphabet.indexOf(str.charAt(i++));

    		          for (j = 0; j < arr.length; j++) {

    		            if (arr[j] > baseOut - 1) {
    		              if (arr[j + 1] == null) arr[j + 1] = 0;
    		              arr[j + 1] += arr[j] / baseOut | 0;
    		              arr[j] %= baseOut;
    		            }
    		          }
    		        }

    		        return arr.reverse();
    		      }

    		      // Convert a numeric string of baseIn to a numeric string of baseOut.
    		      // If the caller is toString, we are converting from base 10 to baseOut.
    		      // If the caller is BigNumber, we are converting from baseIn to base 10.
    		      return function (str, baseIn, baseOut, sign, callerIsToString) {
    		        var alphabet, d, e, k, r, x, xc, y,
    		          i = str.indexOf('.'),
    		          dp = DECIMAL_PLACES,
    		          rm = ROUNDING_MODE;

    		        // Non-integer.
    		        if (i >= 0) {
    		          k = POW_PRECISION;

    		          // Unlimited precision.
    		          POW_PRECISION = 0;
    		          str = str.replace('.', '');
    		          y = new BigNumber(baseIn);
    		          x = y.pow(str.length - i);
    		          POW_PRECISION = k;

    		          // Convert str as if an integer, then restore the fraction part by dividing the
    		          // result by its base raised to a power.

    		          y.c = toBaseOut(toFixedPoint(coeffToString(x.c), x.e, '0'),
    		           10, baseOut, decimal);
    		          y.e = y.c.length;
    		        }

    		        // Convert the number as integer.

    		        xc = toBaseOut(str, baseIn, baseOut, callerIsToString
    		         ? (alphabet = ALPHABET, decimal)
    		         : (alphabet = decimal, ALPHABET));

    		        // xc now represents str as an integer and converted to baseOut. e is the exponent.
    		        e = k = xc.length;

    		        // Remove trailing zeros.
    		        for (; xc[--k] == 0; xc.pop());

    		        // Zero?
    		        if (!xc[0]) return alphabet.charAt(0);

    		        // Does str represent an integer? If so, no need for the division.
    		        if (i < 0) {
    		          --e;
    		        } else {
    		          x.c = xc;
    		          x.e = e;

    		          // The sign is needed for correct rounding.
    		          x.s = sign;
    		          x = div(x, y, dp, rm, baseOut);
    		          xc = x.c;
    		          r = x.r;
    		          e = x.e;
    		        }

    		        // xc now represents str converted to baseOut.

    		        // The index of the rounding digit.
    		        d = e + dp + 1;

    		        // The rounding digit: the digit to the right of the digit that may be rounded up.
    		        i = xc[d];

    		        // Look at the rounding digits and mode to determine whether to round up.

    		        k = baseOut / 2;
    		        r = r || d < 0 || xc[d + 1] != null;

    		        r = rm < 4 ? (i != null || r) && (rm == 0 || rm == (x.s < 0 ? 3 : 2))
    		              : i > k || i == k &&(rm == 4 || r || rm == 6 && xc[d - 1] & 1 ||
    		               rm == (x.s < 0 ? 8 : 7));

    		        // If the index of the rounding digit is not greater than zero, or xc represents
    		        // zero, then the result of the base conversion is zero or, if rounding up, a value
    		        // such as 0.00001.
    		        if (d < 1 || !xc[0]) {

    		          // 1^-dp or 0
    		          str = r ? toFixedPoint(alphabet.charAt(1), -dp, alphabet.charAt(0)) : alphabet.charAt(0);
    		        } else {

    		          // Truncate xc to the required number of decimal places.
    		          xc.length = d;

    		          // Round up?
    		          if (r) {

    		            // Rounding up may mean the previous digit has to be rounded up and so on.
    		            for (--baseOut; ++xc[--d] > baseOut;) {
    		              xc[d] = 0;

    		              if (!d) {
    		                ++e;
    		                xc = [1].concat(xc);
    		              }
    		            }
    		          }

    		          // Determine trailing zeros.
    		          for (k = xc.length; !xc[--k];);

    		          // E.g. [4, 11, 15] becomes 4bf.
    		          for (i = 0, str = ''; i <= k; str += alphabet.charAt(xc[i++]));

    		          // Add leading zeros, decimal point and trailing zeros as required.
    		          str = toFixedPoint(str, e, alphabet.charAt(0));
    		        }

    		        // The caller will add the sign.
    		        return str;
    		      };
    		    })();


    		    // Perform division in the specified base. Called by div and convertBase.
    		    div = (function () {

    		      // Assume non-zero x and k.
    		      function multiply(x, k, base) {
    		        var m, temp, xlo, xhi,
    		          carry = 0,
    		          i = x.length,
    		          klo = k % SQRT_BASE,
    		          khi = k / SQRT_BASE | 0;

    		        for (x = x.slice(); i--;) {
    		          xlo = x[i] % SQRT_BASE;
    		          xhi = x[i] / SQRT_BASE | 0;
    		          m = khi * xlo + xhi * klo;
    		          temp = klo * xlo + ((m % SQRT_BASE) * SQRT_BASE) + carry;
    		          carry = (temp / base | 0) + (m / SQRT_BASE | 0) + khi * xhi;
    		          x[i] = temp % base;
    		        }

    		        if (carry) x = [carry].concat(x);

    		        return x;
    		      }

    		      function compare(a, b, aL, bL) {
    		        var i, cmp;

    		        if (aL != bL) {
    		          cmp = aL > bL ? 1 : -1;
    		        } else {

    		          for (i = cmp = 0; i < aL; i++) {

    		            if (a[i] != b[i]) {
    		              cmp = a[i] > b[i] ? 1 : -1;
    		              break;
    		            }
    		          }
    		        }

    		        return cmp;
    		      }

    		      function subtract(a, b, aL, base) {
    		        var i = 0;

    		        // Subtract b from a.
    		        for (; aL--;) {
    		          a[aL] -= i;
    		          i = a[aL] < b[aL] ? 1 : 0;
    		          a[aL] = i * base + a[aL] - b[aL];
    		        }

    		        // Remove leading zeros.
    		        for (; !a[0] && a.length > 1; a.splice(0, 1));
    		      }

    		      // x: dividend, y: divisor.
    		      return function (x, y, dp, rm, base) {
    		        var cmp, e, i, more, n, prod, prodL, q, qc, rem, remL, rem0, xi, xL, yc0,
    		          yL, yz,
    		          s = x.s == y.s ? 1 : -1,
    		          xc = x.c,
    		          yc = y.c;

    		        // Either NaN, Infinity or 0?
    		        if (!xc || !xc[0] || !yc || !yc[0]) {

    		          return new BigNumber(

    		           // Return NaN if either NaN, or both Infinity or 0.
    		           !x.s || !y.s || (xc ? yc && xc[0] == yc[0] : !yc) ? NaN :

    		            // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
    		            xc && xc[0] == 0 || !yc ? s * 0 : s / 0
    		         );
    		        }

    		        q = new BigNumber(s);
    		        qc = q.c = [];
    		        e = x.e - y.e;
    		        s = dp + e + 1;

    		        if (!base) {
    		          base = BASE;
    		          e = bitFloor(x.e / LOG_BASE) - bitFloor(y.e / LOG_BASE);
    		          s = s / LOG_BASE | 0;
    		        }

    		        // Result exponent may be one less then the current value of e.
    		        // The coefficients of the BigNumbers from convertBase may have trailing zeros.
    		        for (i = 0; yc[i] == (xc[i] || 0); i++);

    		        if (yc[i] > (xc[i] || 0)) e--;

    		        if (s < 0) {
    		          qc.push(1);
    		          more = true;
    		        } else {
    		          xL = xc.length;
    		          yL = yc.length;
    		          i = 0;
    		          s += 2;

    		          // Normalise xc and yc so highest order digit of yc is >= base / 2.

    		          n = mathfloor(base / (yc[0] + 1));

    		          // Not necessary, but to handle odd bases where yc[0] == (base / 2) - 1.
    		          // if (n > 1 || n++ == 1 && yc[0] < base / 2) {
    		          if (n > 1) {
    		            yc = multiply(yc, n, base);
    		            xc = multiply(xc, n, base);
    		            yL = yc.length;
    		            xL = xc.length;
    		          }

    		          xi = yL;
    		          rem = xc.slice(0, yL);
    		          remL = rem.length;

    		          // Add zeros to make remainder as long as divisor.
    		          for (; remL < yL; rem[remL++] = 0);
    		          yz = yc.slice();
    		          yz = [0].concat(yz);
    		          yc0 = yc[0];
    		          if (yc[1] >= base / 2) yc0++;
    		          // Not necessary, but to prevent trial digit n > base, when using base 3.
    		          // else if (base == 3 && yc0 == 1) yc0 = 1 + 1e-15;

    		          do {
    		            n = 0;

    		            // Compare divisor and remainder.
    		            cmp = compare(yc, rem, yL, remL);

    		            // If divisor < remainder.
    		            if (cmp < 0) {

    		              // Calculate trial digit, n.

    		              rem0 = rem[0];
    		              if (yL != remL) rem0 = rem0 * base + (rem[1] || 0);

    		              // n is how many times the divisor goes into the current remainder.
    		              n = mathfloor(rem0 / yc0);

    		              //  Algorithm:
    		              //  product = divisor multiplied by trial digit (n).
    		              //  Compare product and remainder.
    		              //  If product is greater than remainder:
    		              //    Subtract divisor from product, decrement trial digit.
    		              //  Subtract product from remainder.
    		              //  If product was less than remainder at the last compare:
    		              //    Compare new remainder and divisor.
    		              //    If remainder is greater than divisor:
    		              //      Subtract divisor from remainder, increment trial digit.

    		              if (n > 1) {

    		                // n may be > base only when base is 3.
    		                if (n >= base) n = base - 1;

    		                // product = divisor * trial digit.
    		                prod = multiply(yc, n, base);
    		                prodL = prod.length;
    		                remL = rem.length;

    		                // Compare product and remainder.
    		                // If product > remainder then trial digit n too high.
    		                // n is 1 too high about 5% of the time, and is not known to have
    		                // ever been more than 1 too high.
    		                while (compare(prod, rem, prodL, remL) == 1) {
    		                  n--;

    		                  // Subtract divisor from product.
    		                  subtract(prod, yL < prodL ? yz : yc, prodL, base);
    		                  prodL = prod.length;
    		                  cmp = 1;
    		                }
    		              } else {

    		                // n is 0 or 1, cmp is -1.
    		                // If n is 0, there is no need to compare yc and rem again below,
    		                // so change cmp to 1 to avoid it.
    		                // If n is 1, leave cmp as -1, so yc and rem are compared again.
    		                if (n == 0) {

    		                  // divisor < remainder, so n must be at least 1.
    		                  cmp = n = 1;
    		                }

    		                // product = divisor
    		                prod = yc.slice();
    		                prodL = prod.length;
    		              }

    		              if (prodL < remL) prod = [0].concat(prod);

    		              // Subtract product from remainder.
    		              subtract(rem, prod, remL, base);
    		              remL = rem.length;

    		               // If product was < remainder.
    		              if (cmp == -1) {

    		                // Compare divisor and new remainder.
    		                // If divisor < new remainder, subtract divisor from remainder.
    		                // Trial digit n too low.
    		                // n is 1 too low about 5% of the time, and very rarely 2 too low.
    		                while (compare(yc, rem, yL, remL) < 1) {
    		                  n++;

    		                  // Subtract divisor from remainder.
    		                  subtract(rem, yL < remL ? yz : yc, remL, base);
    		                  remL = rem.length;
    		                }
    		              }
    		            } else if (cmp === 0) {
    		              n++;
    		              rem = [0];
    		            } // else cmp === 1 and n will be 0

    		            // Add the next digit, n, to the result array.
    		            qc[i++] = n;

    		            // Update the remainder.
    		            if (rem[0]) {
    		              rem[remL++] = xc[xi] || 0;
    		            } else {
    		              rem = [xc[xi]];
    		              remL = 1;
    		            }
    		          } while ((xi++ < xL || rem[0] != null) && s--);

    		          more = rem[0] != null;

    		          // Leading zero?
    		          if (!qc[0]) qc.splice(0, 1);
    		        }

    		        if (base == BASE) {

    		          // To calculate q.e, first get the number of digits of qc[0].
    		          for (i = 1, s = qc[0]; s >= 10; s /= 10, i++);

    		          round(q, dp + (q.e = i + e * LOG_BASE - 1) + 1, rm, more);

    		        // Caller is convertBase.
    		        } else {
    		          q.e = e;
    		          q.r = +more;
    		        }

    		        return q;
    		      };
    		    })();


    		    /*
    		     * Return a string representing the value of BigNumber n in fixed-point or exponential
    		     * notation rounded to the specified decimal places or significant digits.
    		     *
    		     * n: a BigNumber.
    		     * i: the index of the last digit required (i.e. the digit that may be rounded up).
    		     * rm: the rounding mode.
    		     * id: 1 (toExponential) or 2 (toPrecision).
    		     */
    		    function format(n, i, rm, id) {
    		      var c0, e, ne, len, str;

    		      if (rm == null) rm = ROUNDING_MODE;
    		      else intCheck(rm, 0, 8);

    		      if (!n.c) return n.toString();

    		      c0 = n.c[0];
    		      ne = n.e;

    		      if (i == null) {
    		        str = coeffToString(n.c);
    		        str = id == 1 || id == 2 && (ne <= TO_EXP_NEG || ne >= TO_EXP_POS)
    		         ? toExponential(str, ne)
    		         : toFixedPoint(str, ne, '0');
    		      } else {
    		        n = round(new BigNumber(n), i, rm);

    		        // n.e may have changed if the value was rounded up.
    		        e = n.e;

    		        str = coeffToString(n.c);
    		        len = str.length;

    		        // toPrecision returns exponential notation if the number of significant digits
    		        // specified is less than the number of digits necessary to represent the integer
    		        // part of the value in fixed-point notation.

    		        // Exponential notation.
    		        if (id == 1 || id == 2 && (i <= e || e <= TO_EXP_NEG)) {

    		          // Append zeros?
    		          for (; len < i; str += '0', len++);
    		          str = toExponential(str, e);

    		        // Fixed-point notation.
    		        } else {
    		          i -= ne + (id === 2 && e > ne);
    		          str = toFixedPoint(str, e, '0');

    		          // Append zeros?
    		          if (e + 1 > len) {
    		            if (--i > 0) for (str += '.'; i--; str += '0');
    		          } else {
    		            i += e - len;
    		            if (i > 0) {
    		              if (e + 1 == len) str += '.';
    		              for (; i--; str += '0');
    		            }
    		          }
    		        }
    		      }

    		      return n.s < 0 && c0 ? '-' + str : str;
    		    }


    		    // Handle BigNumber.max and BigNumber.min.
    		    // If any number is NaN, return NaN.
    		    function maxOrMin(args, n) {
    		      var k, y,
    		        i = 1,
    		        x = new BigNumber(args[0]);

    		      for (; i < args.length; i++) {
    		        y = new BigNumber(args[i]);
    		        if (!y.s || (k = compare(x, y)) === n || k === 0 && x.s === n) {
    		          x = y;
    		        }
    		      }

    		      return x;
    		    }


    		    /*
    		     * Strip trailing zeros, calculate base 10 exponent and check against MIN_EXP and MAX_EXP.
    		     * Called by minus, plus and times.
    		     */
    		    function normalise(n, c, e) {
    		      var i = 1,
    		        j = c.length;

    		       // Remove trailing zeros.
    		      for (; !c[--j]; c.pop());

    		      // Calculate the base 10 exponent. First get the number of digits of c[0].
    		      for (j = c[0]; j >= 10; j /= 10, i++);

    		      // Overflow?
    		      if ((e = i + e * LOG_BASE - 1) > MAX_EXP) {

    		        // Infinity.
    		        n.c = n.e = null;

    		      // Underflow?
    		      } else if (e < MIN_EXP) {

    		        // Zero.
    		        n.c = [n.e = 0];
    		      } else {
    		        n.e = e;
    		        n.c = c;
    		      }

    		      return n;
    		    }


    		    // Handle values that fail the validity test in BigNumber.
    		    parseNumeric = (function () {
    		      var basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i,
    		        dotAfter = /^([^.]+)\.$/,
    		        dotBefore = /^\.([^.]+)$/,
    		        isInfinityOrNaN = /^-?(Infinity|NaN)$/,
    		        whitespaceOrPlus = /^\s*\+(?=[\w.])|^\s+|\s+$/g;

    		      return function (x, str, isNum, b) {
    		        var base,
    		          s = isNum ? str : str.replace(whitespaceOrPlus, '');

    		        // No exception on ±Infinity or NaN.
    		        if (isInfinityOrNaN.test(s)) {
    		          x.s = isNaN(s) ? null : s < 0 ? -1 : 1;
    		        } else {
    		          if (!isNum) {

    		            // basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i
    		            s = s.replace(basePrefix, function (m, p1, p2) {
    		              base = (p2 = p2.toLowerCase()) == 'x' ? 16 : p2 == 'b' ? 2 : 8;
    		              return !b || b == base ? p1 : m;
    		            });

    		            if (b) {
    		              base = b;

    		              // E.g. '1.' to '1', '.1' to '0.1'
    		              s = s.replace(dotAfter, '$1').replace(dotBefore, '0.$1');
    		            }

    		            if (str != s) return new BigNumber(s, base);
    		          }

    		          // '[BigNumber Error] Not a number: {n}'
    		          // '[BigNumber Error] Not a base {b} number: {n}'
    		          if (BigNumber.DEBUG) {
    		            throw Error
    		              (bignumberError + 'Not a' + (b ? ' base ' + b : '') + ' number: ' + str);
    		          }

    		          // NaN
    		          x.s = null;
    		        }

    		        x.c = x.e = null;
    		      }
    		    })();


    		    /*
    		     * Round x to sd significant digits using rounding mode rm. Check for over/under-flow.
    		     * If r is truthy, it is known that there are more digits after the rounding digit.
    		     */
    		    function round(x, sd, rm, r) {
    		      var d, i, j, k, n, ni, rd,
    		        xc = x.c,
    		        pows10 = POWS_TEN;

    		      // if x is not Infinity or NaN...
    		      if (xc) {

    		        // rd is the rounding digit, i.e. the digit after the digit that may be rounded up.
    		        // n is a base 1e14 number, the value of the element of array x.c containing rd.
    		        // ni is the index of n within x.c.
    		        // d is the number of digits of n.
    		        // i is the index of rd within n including leading zeros.
    		        // j is the actual index of rd within n (if < 0, rd is a leading zero).
    		        out: {

    		          // Get the number of digits of the first element of xc.
    		          for (d = 1, k = xc[0]; k >= 10; k /= 10, d++);
    		          i = sd - d;

    		          // If the rounding digit is in the first element of xc...
    		          if (i < 0) {
    		            i += LOG_BASE;
    		            j = sd;
    		            n = xc[ni = 0];

    		            // Get the rounding digit at index j of n.
    		            rd = mathfloor(n / pows10[d - j - 1] % 10);
    		          } else {
    		            ni = mathceil((i + 1) / LOG_BASE);

    		            if (ni >= xc.length) {

    		              if (r) {

    		                // Needed by sqrt.
    		                for (; xc.length <= ni; xc.push(0));
    		                n = rd = 0;
    		                d = 1;
    		                i %= LOG_BASE;
    		                j = i - LOG_BASE + 1;
    		              } else {
    		                break out;
    		              }
    		            } else {
    		              n = k = xc[ni];

    		              // Get the number of digits of n.
    		              for (d = 1; k >= 10; k /= 10, d++);

    		              // Get the index of rd within n.
    		              i %= LOG_BASE;

    		              // Get the index of rd within n, adjusted for leading zeros.
    		              // The number of leading zeros of n is given by LOG_BASE - d.
    		              j = i - LOG_BASE + d;

    		              // Get the rounding digit at index j of n.
    		              rd = j < 0 ? 0 : mathfloor(n / pows10[d - j - 1] % 10);
    		            }
    		          }

    		          r = r || sd < 0 ||

    		          // Are there any non-zero digits after the rounding digit?
    		          // The expression  n % pows10[d - j - 1]  returns all digits of n to the right
    		          // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
    		           xc[ni + 1] != null || (j < 0 ? n : n % pows10[d - j - 1]);

    		          r = rm < 4
    		           ? (rd || r) && (rm == 0 || rm == (x.s < 0 ? 3 : 2))
    		           : rd > 5 || rd == 5 && (rm == 4 || r || rm == 6 &&

    		            // Check whether the digit to the left of the rounding digit is odd.
    		            ((i > 0 ? j > 0 ? n / pows10[d - j] : 0 : xc[ni - 1]) % 10) & 1 ||
    		             rm == (x.s < 0 ? 8 : 7));

    		          if (sd < 1 || !xc[0]) {
    		            xc.length = 0;

    		            if (r) {

    		              // Convert sd to decimal places.
    		              sd -= x.e + 1;

    		              // 1, 0.1, 0.01, 0.001, 0.0001 etc.
    		              xc[0] = pows10[(LOG_BASE - sd % LOG_BASE) % LOG_BASE];
    		              x.e = -sd || 0;
    		            } else {

    		              // Zero.
    		              xc[0] = x.e = 0;
    		            }

    		            return x;
    		          }

    		          // Remove excess digits.
    		          if (i == 0) {
    		            xc.length = ni;
    		            k = 1;
    		            ni--;
    		          } else {
    		            xc.length = ni + 1;
    		            k = pows10[LOG_BASE - i];

    		            // E.g. 56700 becomes 56000 if 7 is the rounding digit.
    		            // j > 0 means i > number of leading zeros of n.
    		            xc[ni] = j > 0 ? mathfloor(n / pows10[d - j] % pows10[j]) * k : 0;
    		          }

    		          // Round up?
    		          if (r) {

    		            for (; ;) {

    		              // If the digit to be rounded up is in the first element of xc...
    		              if (ni == 0) {

    		                // i will be the length of xc[0] before k is added.
    		                for (i = 1, j = xc[0]; j >= 10; j /= 10, i++);
    		                j = xc[0] += k;
    		                for (k = 1; j >= 10; j /= 10, k++);

    		                // if i != k the length has increased.
    		                if (i != k) {
    		                  x.e++;
    		                  if (xc[0] == BASE) xc[0] = 1;
    		                }

    		                break;
    		              } else {
    		                xc[ni] += k;
    		                if (xc[ni] != BASE) break;
    		                xc[ni--] = 0;
    		                k = 1;
    		              }
    		            }
    		          }

    		          // Remove trailing zeros.
    		          for (i = xc.length; xc[--i] === 0; xc.pop());
    		        }

    		        // Overflow? Infinity.
    		        if (x.e > MAX_EXP) {
    		          x.c = x.e = null;

    		        // Underflow? Zero.
    		        } else if (x.e < MIN_EXP) {
    		          x.c = [x.e = 0];
    		        }
    		      }

    		      return x;
    		    }


    		    function valueOf(n) {
    		      var str,
    		        e = n.e;

    		      if (e === null) return n.toString();

    		      str = coeffToString(n.c);

    		      str = e <= TO_EXP_NEG || e >= TO_EXP_POS
    		        ? toExponential(str, e)
    		        : toFixedPoint(str, e, '0');

    		      return n.s < 0 ? '-' + str : str;
    		    }


    		    // PROTOTYPE/INSTANCE METHODS


    		    /*
    		     * Return a new BigNumber whose value is the absolute value of this BigNumber.
    		     */
    		    P.absoluteValue = P.abs = function () {
    		      var x = new BigNumber(this);
    		      if (x.s < 0) x.s = 1;
    		      return x;
    		    };


    		    /*
    		     * Return
    		     *   1 if the value of this BigNumber is greater than the value of BigNumber(y, b),
    		     *   -1 if the value of this BigNumber is less than the value of BigNumber(y, b),
    		     *   0 if they have the same value,
    		     *   or null if the value of either is NaN.
    		     */
    		    P.comparedTo = function (y, b) {
    		      return compare(this, new BigNumber(y, b));
    		    };


    		    /*
    		     * If dp is undefined or null or true or false, return the number of decimal places of the
    		     * value of this BigNumber, or null if the value of this BigNumber is ±Infinity or NaN.
    		     *
    		     * Otherwise, if dp is a number, return a new BigNumber whose value is the value of this
    		     * BigNumber rounded to a maximum of dp decimal places using rounding mode rm, or
    		     * ROUNDING_MODE if rm is omitted.
    		     *
    		     * [dp] {number} Decimal places: integer, 0 to MAX inclusive.
    		     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
    		     *
    		     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
    		     */
    		    P.decimalPlaces = P.dp = function (dp, rm) {
    		      var c, n, v,
    		        x = this;

    		      if (dp != null) {
    		        intCheck(dp, 0, MAX);
    		        if (rm == null) rm = ROUNDING_MODE;
    		        else intCheck(rm, 0, 8);

    		        return round(new BigNumber(x), dp + x.e + 1, rm);
    		      }

    		      if (!(c = x.c)) return null;
    		      n = ((v = c.length - 1) - bitFloor(this.e / LOG_BASE)) * LOG_BASE;

    		      // Subtract the number of trailing zeros of the last number.
    		      if (v = c[v]) for (; v % 10 == 0; v /= 10, n--);
    		      if (n < 0) n = 0;

    		      return n;
    		    };


    		    /*
    		     *  n / 0 = I
    		     *  n / N = N
    		     *  n / I = 0
    		     *  0 / n = 0
    		     *  0 / 0 = N
    		     *  0 / N = N
    		     *  0 / I = 0
    		     *  N / n = N
    		     *  N / 0 = N
    		     *  N / N = N
    		     *  N / I = N
    		     *  I / n = I
    		     *  I / 0 = I
    		     *  I / N = N
    		     *  I / I = N
    		     *
    		     * Return a new BigNumber whose value is the value of this BigNumber divided by the value of
    		     * BigNumber(y, b), rounded according to DECIMAL_PLACES and ROUNDING_MODE.
    		     */
    		    P.dividedBy = P.div = function (y, b) {
    		      return div(this, new BigNumber(y, b), DECIMAL_PLACES, ROUNDING_MODE);
    		    };


    		    /*
    		     * Return a new BigNumber whose value is the integer part of dividing the value of this
    		     * BigNumber by the value of BigNumber(y, b).
    		     */
    		    P.dividedToIntegerBy = P.idiv = function (y, b) {
    		      return div(this, new BigNumber(y, b), 0, 1);
    		    };


    		    /*
    		     * Return a BigNumber whose value is the value of this BigNumber exponentiated by n.
    		     *
    		     * If m is present, return the result modulo m.
    		     * If n is negative round according to DECIMAL_PLACES and ROUNDING_MODE.
    		     * If POW_PRECISION is non-zero and m is not present, round to POW_PRECISION using ROUNDING_MODE.
    		     *
    		     * The modular power operation works efficiently when x, n, and m are integers, otherwise it
    		     * is equivalent to calculating x.exponentiatedBy(n).modulo(m) with a POW_PRECISION of 0.
    		     *
    		     * n {number|string|BigNumber} The exponent. An integer.
    		     * [m] {number|string|BigNumber} The modulus.
    		     *
    		     * '[BigNumber Error] Exponent not an integer: {n}'
    		     */
    		    P.exponentiatedBy = P.pow = function (n, m) {
    		      var half, isModExp, i, k, more, nIsBig, nIsNeg, nIsOdd, y,
    		        x = this;

    		      n = new BigNumber(n);

    		      // Allow NaN and ±Infinity, but not other non-integers.
    		      if (n.c && !n.isInteger()) {
    		        throw Error
    		          (bignumberError + 'Exponent not an integer: ' + valueOf(n));
    		      }

    		      if (m != null) m = new BigNumber(m);

    		      // Exponent of MAX_SAFE_INTEGER is 15.
    		      nIsBig = n.e > 14;

    		      // If x is NaN, ±Infinity, ±0 or ±1, or n is ±Infinity, NaN or ±0.
    		      if (!x.c || !x.c[0] || x.c[0] == 1 && !x.e && x.c.length == 1 || !n.c || !n.c[0]) {

    		        // The sign of the result of pow when x is negative depends on the evenness of n.
    		        // If +n overflows to ±Infinity, the evenness of n would be not be known.
    		        y = new BigNumber(Math.pow(+valueOf(x), nIsBig ? n.s * (2 - isOdd(n)) : +valueOf(n)));
    		        return m ? y.mod(m) : y;
    		      }

    		      nIsNeg = n.s < 0;

    		      if (m) {

    		        // x % m returns NaN if abs(m) is zero, or m is NaN.
    		        if (m.c ? !m.c[0] : !m.s) return new BigNumber(NaN);

    		        isModExp = !nIsNeg && x.isInteger() && m.isInteger();

    		        if (isModExp) x = x.mod(m);

    		      // Overflow to ±Infinity: >=2**1e10 or >=1.0000024**1e15.
    		      // Underflow to ±0: <=0.79**1e10 or <=0.9999975**1e15.
    		      } else if (n.e > 9 && (x.e > 0 || x.e < -1 || (x.e == 0
    		        // [1, 240000000]
    		        ? x.c[0] > 1 || nIsBig && x.c[1] >= 24e7
    		        // [80000000000000]  [99999750000000]
    		        : x.c[0] < 8e13 || nIsBig && x.c[0] <= 9999975e7))) {

    		        // If x is negative and n is odd, k = -0, else k = 0.
    		        k = x.s < 0 && isOdd(n) ? -0 : 0;

    		        // If x >= 1, k = ±Infinity.
    		        if (x.e > -1) k = 1 / k;

    		        // If n is negative return ±0, else return ±Infinity.
    		        return new BigNumber(nIsNeg ? 1 / k : k);

    		      } else if (POW_PRECISION) {

    		        // Truncating each coefficient array to a length of k after each multiplication
    		        // equates to truncating significant digits to POW_PRECISION + [28, 41],
    		        // i.e. there will be a minimum of 28 guard digits retained.
    		        k = mathceil(POW_PRECISION / LOG_BASE + 2);
    		      }

    		      if (nIsBig) {
    		        half = new BigNumber(0.5);
    		        if (nIsNeg) n.s = 1;
    		        nIsOdd = isOdd(n);
    		      } else {
    		        i = Math.abs(+valueOf(n));
    		        nIsOdd = i % 2;
    		      }

    		      y = new BigNumber(ONE);

    		      // Performs 54 loop iterations for n of 9007199254740991.
    		      for (; ;) {

    		        if (nIsOdd) {
    		          y = y.times(x);
    		          if (!y.c) break;

    		          if (k) {
    		            if (y.c.length > k) y.c.length = k;
    		          } else if (isModExp) {
    		            y = y.mod(m);    //y = y.minus(div(y, m, 0, MODULO_MODE).times(m));
    		          }
    		        }

    		        if (i) {
    		          i = mathfloor(i / 2);
    		          if (i === 0) break;
    		          nIsOdd = i % 2;
    		        } else {
    		          n = n.times(half);
    		          round(n, n.e + 1, 1);

    		          if (n.e > 14) {
    		            nIsOdd = isOdd(n);
    		          } else {
    		            i = +valueOf(n);
    		            if (i === 0) break;
    		            nIsOdd = i % 2;
    		          }
    		        }

    		        x = x.times(x);

    		        if (k) {
    		          if (x.c && x.c.length > k) x.c.length = k;
    		        } else if (isModExp) {
    		          x = x.mod(m);    //x = x.minus(div(x, m, 0, MODULO_MODE).times(m));
    		        }
    		      }

    		      if (isModExp) return y;
    		      if (nIsNeg) y = ONE.div(y);

    		      return m ? y.mod(m) : k ? round(y, POW_PRECISION, ROUNDING_MODE, more) : y;
    		    };


    		    /*
    		     * Return a new BigNumber whose value is the value of this BigNumber rounded to an integer
    		     * using rounding mode rm, or ROUNDING_MODE if rm is omitted.
    		     *
    		     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
    		     *
    		     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {rm}'
    		     */
    		    P.integerValue = function (rm) {
    		      var n = new BigNumber(this);
    		      if (rm == null) rm = ROUNDING_MODE;
    		      else intCheck(rm, 0, 8);
    		      return round(n, n.e + 1, rm);
    		    };


    		    /*
    		     * Return true if the value of this BigNumber is equal to the value of BigNumber(y, b),
    		     * otherwise return false.
    		     */
    		    P.isEqualTo = P.eq = function (y, b) {
    		      return compare(this, new BigNumber(y, b)) === 0;
    		    };


    		    /*
    		     * Return true if the value of this BigNumber is a finite number, otherwise return false.
    		     */
    		    P.isFinite = function () {
    		      return !!this.c;
    		    };


    		    /*
    		     * Return true if the value of this BigNumber is greater than the value of BigNumber(y, b),
    		     * otherwise return false.
    		     */
    		    P.isGreaterThan = P.gt = function (y, b) {
    		      return compare(this, new BigNumber(y, b)) > 0;
    		    };


    		    /*
    		     * Return true if the value of this BigNumber is greater than or equal to the value of
    		     * BigNumber(y, b), otherwise return false.
    		     */
    		    P.isGreaterThanOrEqualTo = P.gte = function (y, b) {
    		      return (b = compare(this, new BigNumber(y, b))) === 1 || b === 0;

    		    };


    		    /*
    		     * Return true if the value of this BigNumber is an integer, otherwise return false.
    		     */
    		    P.isInteger = function () {
    		      return !!this.c && bitFloor(this.e / LOG_BASE) > this.c.length - 2;
    		    };


    		    /*
    		     * Return true if the value of this BigNumber is less than the value of BigNumber(y, b),
    		     * otherwise return false.
    		     */
    		    P.isLessThan = P.lt = function (y, b) {
    		      return compare(this, new BigNumber(y, b)) < 0;
    		    };


    		    /*
    		     * Return true if the value of this BigNumber is less than or equal to the value of
    		     * BigNumber(y, b), otherwise return false.
    		     */
    		    P.isLessThanOrEqualTo = P.lte = function (y, b) {
    		      return (b = compare(this, new BigNumber(y, b))) === -1 || b === 0;
    		    };


    		    /*
    		     * Return true if the value of this BigNumber is NaN, otherwise return false.
    		     */
    		    P.isNaN = function () {
    		      return !this.s;
    		    };


    		    /*
    		     * Return true if the value of this BigNumber is negative, otherwise return false.
    		     */
    		    P.isNegative = function () {
    		      return this.s < 0;
    		    };


    		    /*
    		     * Return true if the value of this BigNumber is positive, otherwise return false.
    		     */
    		    P.isPositive = function () {
    		      return this.s > 0;
    		    };


    		    /*
    		     * Return true if the value of this BigNumber is 0 or -0, otherwise return false.
    		     */
    		    P.isZero = function () {
    		      return !!this.c && this.c[0] == 0;
    		    };


    		    /*
    		     *  n - 0 = n
    		     *  n - N = N
    		     *  n - I = -I
    		     *  0 - n = -n
    		     *  0 - 0 = 0
    		     *  0 - N = N
    		     *  0 - I = -I
    		     *  N - n = N
    		     *  N - 0 = N
    		     *  N - N = N
    		     *  N - I = N
    		     *  I - n = I
    		     *  I - 0 = I
    		     *  I - N = N
    		     *  I - I = N
    		     *
    		     * Return a new BigNumber whose value is the value of this BigNumber minus the value of
    		     * BigNumber(y, b).
    		     */
    		    P.minus = function (y, b) {
    		      var i, j, t, xLTy,
    		        x = this,
    		        a = x.s;

    		      y = new BigNumber(y, b);
    		      b = y.s;

    		      // Either NaN?
    		      if (!a || !b) return new BigNumber(NaN);

    		      // Signs differ?
    		      if (a != b) {
    		        y.s = -b;
    		        return x.plus(y);
    		      }

    		      var xe = x.e / LOG_BASE,
    		        ye = y.e / LOG_BASE,
    		        xc = x.c,
    		        yc = y.c;

    		      if (!xe || !ye) {

    		        // Either Infinity?
    		        if (!xc || !yc) return xc ? (y.s = -b, y) : new BigNumber(yc ? x : NaN);

    		        // Either zero?
    		        if (!xc[0] || !yc[0]) {

    		          // Return y if y is non-zero, x if x is non-zero, or zero if both are zero.
    		          return yc[0] ? (y.s = -b, y) : new BigNumber(xc[0] ? x :

    		           // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
    		           ROUNDING_MODE == 3 ? -0 : 0);
    		        }
    		      }

    		      xe = bitFloor(xe);
    		      ye = bitFloor(ye);
    		      xc = xc.slice();

    		      // Determine which is the bigger number.
    		      if (a = xe - ye) {

    		        if (xLTy = a < 0) {
    		          a = -a;
    		          t = xc;
    		        } else {
    		          ye = xe;
    		          t = yc;
    		        }

    		        t.reverse();

    		        // Prepend zeros to equalise exponents.
    		        for (b = a; b--; t.push(0));
    		        t.reverse();
    		      } else {

    		        // Exponents equal. Check digit by digit.
    		        j = (xLTy = (a = xc.length) < (b = yc.length)) ? a : b;

    		        for (a = b = 0; b < j; b++) {

    		          if (xc[b] != yc[b]) {
    		            xLTy = xc[b] < yc[b];
    		            break;
    		          }
    		        }
    		      }

    		      // x < y? Point xc to the array of the bigger number.
    		      if (xLTy) {
    		        t = xc;
    		        xc = yc;
    		        yc = t;
    		        y.s = -y.s;
    		      }

    		      b = (j = yc.length) - (i = xc.length);

    		      // Append zeros to xc if shorter.
    		      // No need to add zeros to yc if shorter as subtract only needs to start at yc.length.
    		      if (b > 0) for (; b--; xc[i++] = 0);
    		      b = BASE - 1;

    		      // Subtract yc from xc.
    		      for (; j > a;) {

    		        if (xc[--j] < yc[j]) {
    		          for (i = j; i && !xc[--i]; xc[i] = b);
    		          --xc[i];
    		          xc[j] += BASE;
    		        }

    		        xc[j] -= yc[j];
    		      }

    		      // Remove leading zeros and adjust exponent accordingly.
    		      for (; xc[0] == 0; xc.splice(0, 1), --ye);

    		      // Zero?
    		      if (!xc[0]) {

    		        // Following IEEE 754 (2008) 6.3,
    		        // n - n = +0  but  n - n = -0  when rounding towards -Infinity.
    		        y.s = ROUNDING_MODE == 3 ? -1 : 1;
    		        y.c = [y.e = 0];
    		        return y;
    		      }

    		      // No need to check for Infinity as +x - +y != Infinity && -x - -y != Infinity
    		      // for finite x and y.
    		      return normalise(y, xc, ye);
    		    };


    		    /*
    		     *   n % 0 =  N
    		     *   n % N =  N
    		     *   n % I =  n
    		     *   0 % n =  0
    		     *  -0 % n = -0
    		     *   0 % 0 =  N
    		     *   0 % N =  N
    		     *   0 % I =  0
    		     *   N % n =  N
    		     *   N % 0 =  N
    		     *   N % N =  N
    		     *   N % I =  N
    		     *   I % n =  N
    		     *   I % 0 =  N
    		     *   I % N =  N
    		     *   I % I =  N
    		     *
    		     * Return a new BigNumber whose value is the value of this BigNumber modulo the value of
    		     * BigNumber(y, b). The result depends on the value of MODULO_MODE.
    		     */
    		    P.modulo = P.mod = function (y, b) {
    		      var q, s,
    		        x = this;

    		      y = new BigNumber(y, b);

    		      // Return NaN if x is Infinity or NaN, or y is NaN or zero.
    		      if (!x.c || !y.s || y.c && !y.c[0]) {
    		        return new BigNumber(NaN);

    		      // Return x if y is Infinity or x is zero.
    		      } else if (!y.c || x.c && !x.c[0]) {
    		        return new BigNumber(x);
    		      }

    		      if (MODULO_MODE == 9) {

    		        // Euclidian division: q = sign(y) * floor(x / abs(y))
    		        // r = x - qy    where  0 <= r < abs(y)
    		        s = y.s;
    		        y.s = 1;
    		        q = div(x, y, 0, 3);
    		        y.s = s;
    		        q.s *= s;
    		      } else {
    		        q = div(x, y, 0, MODULO_MODE);
    		      }

    		      y = x.minus(q.times(y));

    		      // To match JavaScript %, ensure sign of zero is sign of dividend.
    		      if (!y.c[0] && MODULO_MODE == 1) y.s = x.s;

    		      return y;
    		    };


    		    /*
    		     *  n * 0 = 0
    		     *  n * N = N
    		     *  n * I = I
    		     *  0 * n = 0
    		     *  0 * 0 = 0
    		     *  0 * N = N
    		     *  0 * I = N
    		     *  N * n = N
    		     *  N * 0 = N
    		     *  N * N = N
    		     *  N * I = N
    		     *  I * n = I
    		     *  I * 0 = N
    		     *  I * N = N
    		     *  I * I = I
    		     *
    		     * Return a new BigNumber whose value is the value of this BigNumber multiplied by the value
    		     * of BigNumber(y, b).
    		     */
    		    P.multipliedBy = P.times = function (y, b) {
    		      var c, e, i, j, k, m, xcL, xlo, xhi, ycL, ylo, yhi, zc,
    		        base, sqrtBase,
    		        x = this,
    		        xc = x.c,
    		        yc = (y = new BigNumber(y, b)).c;

    		      // Either NaN, ±Infinity or ±0?
    		      if (!xc || !yc || !xc[0] || !yc[0]) {

    		        // Return NaN if either is NaN, or one is 0 and the other is Infinity.
    		        if (!x.s || !y.s || xc && !xc[0] && !yc || yc && !yc[0] && !xc) {
    		          y.c = y.e = y.s = null;
    		        } else {
    		          y.s *= x.s;

    		          // Return ±Infinity if either is ±Infinity.
    		          if (!xc || !yc) {
    		            y.c = y.e = null;

    		          // Return ±0 if either is ±0.
    		          } else {
    		            y.c = [0];
    		            y.e = 0;
    		          }
    		        }

    		        return y;
    		      }

    		      e = bitFloor(x.e / LOG_BASE) + bitFloor(y.e / LOG_BASE);
    		      y.s *= x.s;
    		      xcL = xc.length;
    		      ycL = yc.length;

    		      // Ensure xc points to longer array and xcL to its length.
    		      if (xcL < ycL) {
    		        zc = xc;
    		        xc = yc;
    		        yc = zc;
    		        i = xcL;
    		        xcL = ycL;
    		        ycL = i;
    		      }

    		      // Initialise the result array with zeros.
    		      for (i = xcL + ycL, zc = []; i--; zc.push(0));

    		      base = BASE;
    		      sqrtBase = SQRT_BASE;

    		      for (i = ycL; --i >= 0;) {
    		        c = 0;
    		        ylo = yc[i] % sqrtBase;
    		        yhi = yc[i] / sqrtBase | 0;

    		        for (k = xcL, j = i + k; j > i;) {
    		          xlo = xc[--k] % sqrtBase;
    		          xhi = xc[k] / sqrtBase | 0;
    		          m = yhi * xlo + xhi * ylo;
    		          xlo = ylo * xlo + ((m % sqrtBase) * sqrtBase) + zc[j] + c;
    		          c = (xlo / base | 0) + (m / sqrtBase | 0) + yhi * xhi;
    		          zc[j--] = xlo % base;
    		        }

    		        zc[j] = c;
    		      }

    		      if (c) {
    		        ++e;
    		      } else {
    		        zc.splice(0, 1);
    		      }

    		      return normalise(y, zc, e);
    		    };


    		    /*
    		     * Return a new BigNumber whose value is the value of this BigNumber negated,
    		     * i.e. multiplied by -1.
    		     */
    		    P.negated = function () {
    		      var x = new BigNumber(this);
    		      x.s = -x.s || null;
    		      return x;
    		    };


    		    /*
    		     *  n + 0 = n
    		     *  n + N = N
    		     *  n + I = I
    		     *  0 + n = n
    		     *  0 + 0 = 0
    		     *  0 + N = N
    		     *  0 + I = I
    		     *  N + n = N
    		     *  N + 0 = N
    		     *  N + N = N
    		     *  N + I = N
    		     *  I + n = I
    		     *  I + 0 = I
    		     *  I + N = N
    		     *  I + I = I
    		     *
    		     * Return a new BigNumber whose value is the value of this BigNumber plus the value of
    		     * BigNumber(y, b).
    		     */
    		    P.plus = function (y, b) {
    		      var t,
    		        x = this,
    		        a = x.s;

    		      y = new BigNumber(y, b);
    		      b = y.s;

    		      // Either NaN?
    		      if (!a || !b) return new BigNumber(NaN);

    		      // Signs differ?
    		       if (a != b) {
    		        y.s = -b;
    		        return x.minus(y);
    		      }

    		      var xe = x.e / LOG_BASE,
    		        ye = y.e / LOG_BASE,
    		        xc = x.c,
    		        yc = y.c;

    		      if (!xe || !ye) {

    		        // Return ±Infinity if either ±Infinity.
    		        if (!xc || !yc) return new BigNumber(a / 0);

    		        // Either zero?
    		        // Return y if y is non-zero, x if x is non-zero, or zero if both are zero.
    		        if (!xc[0] || !yc[0]) return yc[0] ? y : new BigNumber(xc[0] ? x : a * 0);
    		      }

    		      xe = bitFloor(xe);
    		      ye = bitFloor(ye);
    		      xc = xc.slice();

    		      // Prepend zeros to equalise exponents. Faster to use reverse then do unshifts.
    		      if (a = xe - ye) {
    		        if (a > 0) {
    		          ye = xe;
    		          t = yc;
    		        } else {
    		          a = -a;
    		          t = xc;
    		        }

    		        t.reverse();
    		        for (; a--; t.push(0));
    		        t.reverse();
    		      }

    		      a = xc.length;
    		      b = yc.length;

    		      // Point xc to the longer array, and b to the shorter length.
    		      if (a - b < 0) {
    		        t = yc;
    		        yc = xc;
    		        xc = t;
    		        b = a;
    		      }

    		      // Only start adding at yc.length - 1 as the further digits of xc can be ignored.
    		      for (a = 0; b;) {
    		        a = (xc[--b] = xc[b] + yc[b] + a) / BASE | 0;
    		        xc[b] = BASE === xc[b] ? 0 : xc[b] % BASE;
    		      }

    		      if (a) {
    		        xc = [a].concat(xc);
    		        ++ye;
    		      }

    		      // No need to check for zero, as +x + +y != 0 && -x + -y != 0
    		      // ye = MAX_EXP + 1 possible
    		      return normalise(y, xc, ye);
    		    };


    		    /*
    		     * If sd is undefined or null or true or false, return the number of significant digits of
    		     * the value of this BigNumber, or null if the value of this BigNumber is ±Infinity or NaN.
    		     * If sd is true include integer-part trailing zeros in the count.
    		     *
    		     * Otherwise, if sd is a number, return a new BigNumber whose value is the value of this
    		     * BigNumber rounded to a maximum of sd significant digits using rounding mode rm, or
    		     * ROUNDING_MODE if rm is omitted.
    		     *
    		     * sd {number|boolean} number: significant digits: integer, 1 to MAX inclusive.
    		     *                     boolean: whether to count integer-part trailing zeros: true or false.
    		     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
    		     *
    		     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {sd|rm}'
    		     */
    		    P.precision = P.sd = function (sd, rm) {
    		      var c, n, v,
    		        x = this;

    		      if (sd != null && sd !== !!sd) {
    		        intCheck(sd, 1, MAX);
    		        if (rm == null) rm = ROUNDING_MODE;
    		        else intCheck(rm, 0, 8);

    		        return round(new BigNumber(x), sd, rm);
    		      }

    		      if (!(c = x.c)) return null;
    		      v = c.length - 1;
    		      n = v * LOG_BASE + 1;

    		      if (v = c[v]) {

    		        // Subtract the number of trailing zeros of the last element.
    		        for (; v % 10 == 0; v /= 10, n--);

    		        // Add the number of digits of the first element.
    		        for (v = c[0]; v >= 10; v /= 10, n++);
    		      }

    		      if (sd && x.e + 1 > n) n = x.e + 1;

    		      return n;
    		    };


    		    /*
    		     * Return a new BigNumber whose value is the value of this BigNumber shifted by k places
    		     * (powers of 10). Shift to the right if n > 0, and to the left if n < 0.
    		     *
    		     * k {number} Integer, -MAX_SAFE_INTEGER to MAX_SAFE_INTEGER inclusive.
    		     *
    		     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {k}'
    		     */
    		    P.shiftedBy = function (k) {
    		      intCheck(k, -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER);
    		      return this.times('1e' + k);
    		    };


    		    /*
    		     *  sqrt(-n) =  N
    		     *  sqrt(N) =  N
    		     *  sqrt(-I) =  N
    		     *  sqrt(I) =  I
    		     *  sqrt(0) =  0
    		     *  sqrt(-0) = -0
    		     *
    		     * Return a new BigNumber whose value is the square root of the value of this BigNumber,
    		     * rounded according to DECIMAL_PLACES and ROUNDING_MODE.
    		     */
    		    P.squareRoot = P.sqrt = function () {
    		      var m, n, r, rep, t,
    		        x = this,
    		        c = x.c,
    		        s = x.s,
    		        e = x.e,
    		        dp = DECIMAL_PLACES + 4,
    		        half = new BigNumber('0.5');

    		      // Negative/NaN/Infinity/zero?
    		      if (s !== 1 || !c || !c[0]) {
    		        return new BigNumber(!s || s < 0 && (!c || c[0]) ? NaN : c ? x : 1 / 0);
    		      }

    		      // Initial estimate.
    		      s = Math.sqrt(+valueOf(x));

    		      // Math.sqrt underflow/overflow?
    		      // Pass x to Math.sqrt as integer, then adjust the exponent of the result.
    		      if (s == 0 || s == 1 / 0) {
    		        n = coeffToString(c);
    		        if ((n.length + e) % 2 == 0) n += '0';
    		        s = Math.sqrt(+n);
    		        e = bitFloor((e + 1) / 2) - (e < 0 || e % 2);

    		        if (s == 1 / 0) {
    		          n = '5e' + e;
    		        } else {
    		          n = s.toExponential();
    		          n = n.slice(0, n.indexOf('e') + 1) + e;
    		        }

    		        r = new BigNumber(n);
    		      } else {
    		        r = new BigNumber(s + '');
    		      }

    		      // Check for zero.
    		      // r could be zero if MIN_EXP is changed after the this value was created.
    		      // This would cause a division by zero (x/t) and hence Infinity below, which would cause
    		      // coeffToString to throw.
    		      if (r.c[0]) {
    		        e = r.e;
    		        s = e + dp;
    		        if (s < 3) s = 0;

    		        // Newton-Raphson iteration.
    		        for (; ;) {
    		          t = r;
    		          r = half.times(t.plus(div(x, t, dp, 1)));

    		          if (coeffToString(t.c).slice(0, s) === (n = coeffToString(r.c)).slice(0, s)) {

    		            // The exponent of r may here be one less than the final result exponent,
    		            // e.g 0.0009999 (e-4) --> 0.001 (e-3), so adjust s so the rounding digits
    		            // are indexed correctly.
    		            if (r.e < e) --s;
    		            n = n.slice(s - 3, s + 1);

    		            // The 4th rounding digit may be in error by -1 so if the 4 rounding digits
    		            // are 9999 or 4999 (i.e. approaching a rounding boundary) continue the
    		            // iteration.
    		            if (n == '9999' || !rep && n == '4999') {

    		              // On the first iteration only, check to see if rounding up gives the
    		              // exact result as the nines may infinitely repeat.
    		              if (!rep) {
    		                round(t, t.e + DECIMAL_PLACES + 2, 0);

    		                if (t.times(t).eq(x)) {
    		                  r = t;
    		                  break;
    		                }
    		              }

    		              dp += 4;
    		              s += 4;
    		              rep = 1;
    		            } else {

    		              // If rounding digits are null, 0{0,4} or 50{0,3}, check for exact
    		              // result. If not, then there are further digits and m will be truthy.
    		              if (!+n || !+n.slice(1) && n.charAt(0) == '5') {

    		                // Truncate to the first rounding digit.
    		                round(r, r.e + DECIMAL_PLACES + 2, 1);
    		                m = !r.times(r).eq(x);
    		              }

    		              break;
    		            }
    		          }
    		        }
    		      }

    		      return round(r, r.e + DECIMAL_PLACES + 1, ROUNDING_MODE, m);
    		    };


    		    /*
    		     * Return a string representing the value of this BigNumber in exponential notation and
    		     * rounded using ROUNDING_MODE to dp fixed decimal places.
    		     *
    		     * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
    		     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
    		     *
    		     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
    		     */
    		    P.toExponential = function (dp, rm) {
    		      if (dp != null) {
    		        intCheck(dp, 0, MAX);
    		        dp++;
    		      }
    		      return format(this, dp, rm, 1);
    		    };


    		    /*
    		     * Return a string representing the value of this BigNumber in fixed-point notation rounding
    		     * to dp fixed decimal places using rounding mode rm, or ROUNDING_MODE if rm is omitted.
    		     *
    		     * Note: as with JavaScript's number type, (-0).toFixed(0) is '0',
    		     * but e.g. (-0.00001).toFixed(0) is '-0'.
    		     *
    		     * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
    		     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
    		     *
    		     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
    		     */
    		    P.toFixed = function (dp, rm) {
    		      if (dp != null) {
    		        intCheck(dp, 0, MAX);
    		        dp = dp + this.e + 1;
    		      }
    		      return format(this, dp, rm);
    		    };


    		    /*
    		     * Return a string representing the value of this BigNumber in fixed-point notation rounded
    		     * using rm or ROUNDING_MODE to dp decimal places, and formatted according to the properties
    		     * of the format or FORMAT object (see BigNumber.set).
    		     *
    		     * The formatting object may contain some or all of the properties shown below.
    		     *
    		     * FORMAT = {
    		     *   prefix: '',
    		     *   groupSize: 3,
    		     *   secondaryGroupSize: 0,
    		     *   groupSeparator: ',',
    		     *   decimalSeparator: '.',
    		     *   fractionGroupSize: 0,
    		     *   fractionGroupSeparator: '\xA0',      // non-breaking space
    		     *   suffix: ''
    		     * };
    		     *
    		     * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
    		     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
    		     * [format] {object} Formatting options. See FORMAT pbject above.
    		     *
    		     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
    		     * '[BigNumber Error] Argument not an object: {format}'
    		     */
    		    P.toFormat = function (dp, rm, format) {
    		      var str,
    		        x = this;

    		      if (format == null) {
    		        if (dp != null && rm && typeof rm == 'object') {
    		          format = rm;
    		          rm = null;
    		        } else if (dp && typeof dp == 'object') {
    		          format = dp;
    		          dp = rm = null;
    		        } else {
    		          format = FORMAT;
    		        }
    		      } else if (typeof format != 'object') {
    		        throw Error
    		          (bignumberError + 'Argument not an object: ' + format);
    		      }

    		      str = x.toFixed(dp, rm);

    		      if (x.c) {
    		        var i,
    		          arr = str.split('.'),
    		          g1 = +format.groupSize,
    		          g2 = +format.secondaryGroupSize,
    		          groupSeparator = format.groupSeparator || '',
    		          intPart = arr[0],
    		          fractionPart = arr[1],
    		          isNeg = x.s < 0,
    		          intDigits = isNeg ? intPart.slice(1) : intPart,
    		          len = intDigits.length;

    		        if (g2) {
    		          i = g1;
    		          g1 = g2;
    		          g2 = i;
    		          len -= i;
    		        }

    		        if (g1 > 0 && len > 0) {
    		          i = len % g1 || g1;
    		          intPart = intDigits.substr(0, i);
    		          for (; i < len; i += g1) intPart += groupSeparator + intDigits.substr(i, g1);
    		          if (g2 > 0) intPart += groupSeparator + intDigits.slice(i);
    		          if (isNeg) intPart = '-' + intPart;
    		        }

    		        str = fractionPart
    		         ? intPart + (format.decimalSeparator || '') + ((g2 = +format.fractionGroupSize)
    		          ? fractionPart.replace(new RegExp('\\d{' + g2 + '}\\B', 'g'),
    		           '$&' + (format.fractionGroupSeparator || ''))
    		          : fractionPart)
    		         : intPart;
    		      }

    		      return (format.prefix || '') + str + (format.suffix || '');
    		    };


    		    /*
    		     * Return an array of two BigNumbers representing the value of this BigNumber as a simple
    		     * fraction with an integer numerator and an integer denominator.
    		     * The denominator will be a positive non-zero value less than or equal to the specified
    		     * maximum denominator. If a maximum denominator is not specified, the denominator will be
    		     * the lowest value necessary to represent the number exactly.
    		     *
    		     * [md] {number|string|BigNumber} Integer >= 1, or Infinity. The maximum denominator.
    		     *
    		     * '[BigNumber Error] Argument {not an integer|out of range} : {md}'
    		     */
    		    P.toFraction = function (md) {
    		      var d, d0, d1, d2, e, exp, n, n0, n1, q, r, s,
    		        x = this,
    		        xc = x.c;

    		      if (md != null) {
    		        n = new BigNumber(md);

    		        // Throw if md is less than one or is not an integer, unless it is Infinity.
    		        if (!n.isInteger() && (n.c || n.s !== 1) || n.lt(ONE)) {
    		          throw Error
    		            (bignumberError + 'Argument ' +
    		              (n.isInteger() ? 'out of range: ' : 'not an integer: ') + valueOf(n));
    		        }
    		      }

    		      if (!xc) return new BigNumber(x);

    		      d = new BigNumber(ONE);
    		      n1 = d0 = new BigNumber(ONE);
    		      d1 = n0 = new BigNumber(ONE);
    		      s = coeffToString(xc);

    		      // Determine initial denominator.
    		      // d is a power of 10 and the minimum max denominator that specifies the value exactly.
    		      e = d.e = s.length - x.e - 1;
    		      d.c[0] = POWS_TEN[(exp = e % LOG_BASE) < 0 ? LOG_BASE + exp : exp];
    		      md = !md || n.comparedTo(d) > 0 ? (e > 0 ? d : n1) : n;

    		      exp = MAX_EXP;
    		      MAX_EXP = 1 / 0;
    		      n = new BigNumber(s);

    		      // n0 = d1 = 0
    		      n0.c[0] = 0;

    		      for (; ;)  {
    		        q = div(n, d, 0, 1);
    		        d2 = d0.plus(q.times(d1));
    		        if (d2.comparedTo(md) == 1) break;
    		        d0 = d1;
    		        d1 = d2;
    		        n1 = n0.plus(q.times(d2 = n1));
    		        n0 = d2;
    		        d = n.minus(q.times(d2 = d));
    		        n = d2;
    		      }

    		      d2 = div(md.minus(d0), d1, 0, 1);
    		      n0 = n0.plus(d2.times(n1));
    		      d0 = d0.plus(d2.times(d1));
    		      n0.s = n1.s = x.s;
    		      e = e * 2;

    		      // Determine which fraction is closer to x, n0/d0 or n1/d1
    		      r = div(n1, d1, e, ROUNDING_MODE).minus(x).abs().comparedTo(
    		          div(n0, d0, e, ROUNDING_MODE).minus(x).abs()) < 1 ? [n1, d1] : [n0, d0];

    		      MAX_EXP = exp;

    		      return r;
    		    };


    		    /*
    		     * Return the value of this BigNumber converted to a number primitive.
    		     */
    		    P.toNumber = function () {
    		      return +valueOf(this);
    		    };


    		    /*
    		     * Return a string representing the value of this BigNumber rounded to sd significant digits
    		     * using rounding mode rm or ROUNDING_MODE. If sd is less than the number of digits
    		     * necessary to represent the integer part of the value in fixed-point notation, then use
    		     * exponential notation.
    		     *
    		     * [sd] {number} Significant digits. Integer, 1 to MAX inclusive.
    		     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
    		     *
    		     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {sd|rm}'
    		     */
    		    P.toPrecision = function (sd, rm) {
    		      if (sd != null) intCheck(sd, 1, MAX);
    		      return format(this, sd, rm, 2);
    		    };


    		    /*
    		     * Return a string representing the value of this BigNumber in base b, or base 10 if b is
    		     * omitted. If a base is specified, including base 10, round according to DECIMAL_PLACES and
    		     * ROUNDING_MODE. If a base is not specified, and this BigNumber has a positive exponent
    		     * that is equal to or greater than TO_EXP_POS, or a negative exponent equal to or less than
    		     * TO_EXP_NEG, return exponential notation.
    		     *
    		     * [b] {number} Integer, 2 to ALPHABET.length inclusive.
    		     *
    		     * '[BigNumber Error] Base {not a primitive number|not an integer|out of range}: {b}'
    		     */
    		    P.toString = function (b) {
    		      var str,
    		        n = this,
    		        s = n.s,
    		        e = n.e;

    		      // Infinity or NaN?
    		      if (e === null) {
    		        if (s) {
    		          str = 'Infinity';
    		          if (s < 0) str = '-' + str;
    		        } else {
    		          str = 'NaN';
    		        }
    		      } else {
    		        if (b == null) {
    		          str = e <= TO_EXP_NEG || e >= TO_EXP_POS
    		           ? toExponential(coeffToString(n.c), e)
    		           : toFixedPoint(coeffToString(n.c), e, '0');
    		        } else if (b === 10 && alphabetHasNormalDecimalDigits) {
    		          n = round(new BigNumber(n), DECIMAL_PLACES + e + 1, ROUNDING_MODE);
    		          str = toFixedPoint(coeffToString(n.c), n.e, '0');
    		        } else {
    		          intCheck(b, 2, ALPHABET.length, 'Base');
    		          str = convertBase(toFixedPoint(coeffToString(n.c), e, '0'), 10, b, s, true);
    		        }

    		        if (s < 0 && n.c[0]) str = '-' + str;
    		      }

    		      return str;
    		    };


    		    /*
    		     * Return as toString, but do not accept a base argument, and include the minus sign for
    		     * negative zero.
    		     */
    		    P.valueOf = P.toJSON = function () {
    		      return valueOf(this);
    		    };


    		    P._isBigNumber = true;

    		    if (configObject != null) BigNumber.set(configObject);

    		    return BigNumber;
    		  }


    		  // PRIVATE HELPER FUNCTIONS

    		  // These functions don't need access to variables,
    		  // e.g. DECIMAL_PLACES, in the scope of the `clone` function above.


    		  function bitFloor(n) {
    		    var i = n | 0;
    		    return n > 0 || n === i ? i : i - 1;
    		  }


    		  // Return a coefficient array as a string of base 10 digits.
    		  function coeffToString(a) {
    		    var s, z,
    		      i = 1,
    		      j = a.length,
    		      r = a[0] + '';

    		    for (; i < j;) {
    		      s = a[i++] + '';
    		      z = LOG_BASE - s.length;
    		      for (; z--; s = '0' + s);
    		      r += s;
    		    }

    		    // Determine trailing zeros.
    		    for (j = r.length; r.charCodeAt(--j) === 48;);

    		    return r.slice(0, j + 1 || 1);
    		  }


    		  // Compare the value of BigNumbers x and y.
    		  function compare(x, y) {
    		    var a, b,
    		      xc = x.c,
    		      yc = y.c,
    		      i = x.s,
    		      j = y.s,
    		      k = x.e,
    		      l = y.e;

    		    // Either NaN?
    		    if (!i || !j) return null;

    		    a = xc && !xc[0];
    		    b = yc && !yc[0];

    		    // Either zero?
    		    if (a || b) return a ? b ? 0 : -j : i;

    		    // Signs differ?
    		    if (i != j) return i;

    		    a = i < 0;
    		    b = k == l;

    		    // Either Infinity?
    		    if (!xc || !yc) return b ? 0 : !xc ^ a ? 1 : -1;

    		    // Compare exponents.
    		    if (!b) return k > l ^ a ? 1 : -1;

    		    j = (k = xc.length) < (l = yc.length) ? k : l;

    		    // Compare digit by digit.
    		    for (i = 0; i < j; i++) if (xc[i] != yc[i]) return xc[i] > yc[i] ^ a ? 1 : -1;

    		    // Compare lengths.
    		    return k == l ? 0 : k > l ^ a ? 1 : -1;
    		  }


    		  /*
    		   * Check that n is a primitive number, an integer, and in range, otherwise throw.
    		   */
    		  function intCheck(n, min, max, name) {
    		    if (n < min || n > max || n !== mathfloor(n)) {
    		      throw Error
    		       (bignumberError + (name || 'Argument') + (typeof n == 'number'
    		         ? n < min || n > max ? ' out of range: ' : ' not an integer: '
    		         : ' not a primitive number: ') + String(n));
    		    }
    		  }


    		  // Assumes finite n.
    		  function isOdd(n) {
    		    var k = n.c.length - 1;
    		    return bitFloor(n.e / LOG_BASE) == k && n.c[k] % 2 != 0;
    		  }


    		  function toExponential(str, e) {
    		    return (str.length > 1 ? str.charAt(0) + '.' + str.slice(1) : str) +
    		     (e < 0 ? 'e' : 'e+') + e;
    		  }


    		  function toFixedPoint(str, e, z) {
    		    var len, zs;

    		    // Negative exponent?
    		    if (e < 0) {

    		      // Prepend zeros.
    		      for (zs = z + '.'; ++e; zs += z);
    		      str = zs + str;

    		    // Positive exponent
    		    } else {
    		      len = str.length;

    		      // Append zeros.
    		      if (++e > len) {
    		        for (zs = z, e -= len; --e; zs += z);
    		        str += zs;
    		      } else if (e < len) {
    		        str = str.slice(0, e) + '.' + str.slice(e);
    		      }
    		    }

    		    return str;
    		  }


    		  // EXPORT


    		  BigNumber = clone();
    		  BigNumber['default'] = BigNumber.BigNumber = BigNumber;

    		  // AMD.
    		  if (module.exports) {
    		    module.exports = BigNumber;

    		  // Browser.
    		  } else {
    		    if (!globalObject) {
    		      globalObject = typeof self != 'undefined' && self ? self : window;
    		    }

    		    globalObject.BigNumber = BigNumber;
    		  }
    		})(bignumber); 
    	} (bignumber$1));
    	return bignumber$1.exports;
    }

    var hasRequiredStringify;

    function requireStringify () {
    	if (hasRequiredStringify) return stringify.exports;
    	hasRequiredStringify = 1;
    	(function (module) {
    		var BigNumber = requireBignumber();

    		/*
    		    json2.js
    		    2013-05-26

    		    Public Domain.

    		    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    		    See http://www.JSON.org/js.html


    		    This code should be minified before deployment.
    		    See http://javascript.crockford.com/jsmin.html

    		    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    		    NOT CONTROL.


    		    This file creates a global JSON object containing two methods: stringify
    		    and parse.

    		        JSON.stringify(value, replacer, space)
    		            value       any JavaScript value, usually an object or array.

    		            replacer    an optional parameter that determines how object
    		                        values are stringified for objects. It can be a
    		                        function or an array of strings.

    		            space       an optional parameter that specifies the indentation
    		                        of nested structures. If it is omitted, the text will
    		                        be packed without extra whitespace. If it is a number,
    		                        it will specify the number of spaces to indent at each
    		                        level. If it is a string (such as '\t' or '&nbsp;'),
    		                        it contains the characters used to indent at each level.

    		            This method produces a JSON text from a JavaScript value.

    		            When an object value is found, if the object contains a toJSON
    		            method, its toJSON method will be called and the result will be
    		            stringified. A toJSON method does not serialize: it returns the
    		            value represented by the name/value pair that should be serialized,
    		            or undefined if nothing should be serialized. The toJSON method
    		            will be passed the key associated with the value, and this will be
    		            bound to the value

    		            For example, this would serialize Dates as ISO strings.

    		                Date.prototype.toJSON = function (key) {
    		                    function f(n) {
    		                        // Format integers to have at least two digits.
    		                        return n < 10 ? '0' + n : n;
    		                    }

    		                    return this.getUTCFullYear()   + '-' +
    		                         f(this.getUTCMonth() + 1) + '-' +
    		                         f(this.getUTCDate())      + 'T' +
    		                         f(this.getUTCHours())     + ':' +
    		                         f(this.getUTCMinutes())   + ':' +
    		                         f(this.getUTCSeconds())   + 'Z';
    		                };

    		            You can provide an optional replacer method. It will be passed the
    		            key and value of each member, with this bound to the containing
    		            object. The value that is returned from your method will be
    		            serialized. If your method returns undefined, then the member will
    		            be excluded from the serialization.

    		            If the replacer parameter is an array of strings, then it will be
    		            used to select the members to be serialized. It filters the results
    		            such that only members with keys listed in the replacer array are
    		            stringified.

    		            Values that do not have JSON representations, such as undefined or
    		            functions, will not be serialized. Such values in objects will be
    		            dropped; in arrays they will be replaced with null. You can use
    		            a replacer function to replace those with JSON values.
    		            JSON.stringify(undefined) returns undefined.

    		            The optional space parameter produces a stringification of the
    		            value that is filled with line breaks and indentation to make it
    		            easier to read.

    		            If the space parameter is a non-empty string, then that string will
    		            be used for indentation. If the space parameter is a number, then
    		            the indentation will be that many spaces.

    		            Example:

    		            text = JSON.stringify(['e', {pluribus: 'unum'}]);
    		            // text is '["e",{"pluribus":"unum"}]'


    		            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
    		            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

    		            text = JSON.stringify([new Date()], function (key, value) {
    		                return this[key] instanceof Date ?
    		                    'Date(' + this[key] + ')' : value;
    		            });
    		            // text is '["Date(---current time---)"]'


    		        JSON.parse(text, reviver)
    		            This method parses a JSON text to produce an object or array.
    		            It can throw a SyntaxError exception.

    		            The optional reviver parameter is a function that can filter and
    		            transform the results. It receives each of the keys and values,
    		            and its return value is used instead of the original value.
    		            If it returns what it received, then the structure is not modified.
    		            If it returns undefined then the member is deleted.

    		            Example:

    		            // Parse the text. Values that look like ISO date strings will
    		            // be converted to Date objects.

    		            myData = JSON.parse(text, function (key, value) {
    		                var a;
    		                if (typeof value === 'string') {
    		                    a =
    		/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
    		                    if (a) {
    		                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
    		                            +a[5], +a[6]));
    		                    }
    		                }
    		                return value;
    		            });

    		            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
    		                var d;
    		                if (typeof value === 'string' &&
    		                        value.slice(0, 5) === 'Date(' &&
    		                        value.slice(-1) === ')') {
    		                    d = new Date(value.slice(5, -1));
    		                    if (d) {
    		                        return d;
    		                    }
    		                }
    		                return value;
    		            });


    		    This is a reference implementation. You are free to copy, modify, or
    		    redistribute.
    		*/

    		/*jslint evil: true, regexp: true */

    		/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    		    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    		    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    		    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    		    test, toJSON, toString, valueOf
    		*/


    		// Create a JSON object only if one does not already exist. We create the
    		// methods in a closure to avoid creating global variables.

    		var JSON = module.exports;

    		(function () {

    		    var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    		        gap,
    		        indent,
    		        meta = {    // table of character substitutions
    		            '\b': '\\b',
    		            '\t': '\\t',
    		            '\n': '\\n',
    		            '\f': '\\f',
    		            '\r': '\\r',
    		            '"' : '\\"',
    		            '\\': '\\\\'
    		        },
    		        rep;


    		    function quote(string) {

    		// If the string contains no control characters, no quote characters, and no
    		// backslash characters, then we can safely slap some quotes around it.
    		// Otherwise we must also replace the offending characters with safe escape
    		// sequences.

    		        escapable.lastIndex = 0;
    		        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
    		            var c = meta[a];
    		            return typeof c === 'string'
    		                ? c
    		                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
    		        }) + '"' : '"' + string + '"';
    		    }


    		    function str(key, holder) {

    		// Produce a string from holder[key].

    		        var i,          // The loop counter.
    		            k,          // The member key.
    		            v,          // The member value.
    		            length,
    		            mind = gap,
    		            partial,
    		            value = holder[key],
    		            isBigNumber = value != null && (value instanceof BigNumber || BigNumber.isBigNumber(value));

    		// If the value has a toJSON method, call it to obtain a replacement value.

    		        if (value && typeof value === 'object' &&
    		                typeof value.toJSON === 'function') {
    		            value = value.toJSON(key);
    		        }

    		// If we were called with a replacer function, then call the replacer to
    		// obtain a replacement value.

    		        if (typeof rep === 'function') {
    		            value = rep.call(holder, key, value);
    		        }

    		// What happens next depends on the value's type.

    		        switch (typeof value) {
    		        case 'string':
    		            if (isBigNumber) {
    		                return value;
    		            } else {
    		                return quote(value);
    		            }

    		        case 'number':

    		// JSON numbers must be finite. Encode non-finite numbers as null.

    		            return isFinite(value) ? String(value) : 'null';

    		        case 'boolean':
    		        case 'null':
    		        case 'bigint':

    		// If the value is a boolean or null, convert it to a string. Note:
    		// typeof null does not produce 'null'. The case is included here in
    		// the remote chance that this gets fixed someday.

    		            return String(value);

    		// If the type is 'object', we might be dealing with an object or an array or
    		// null.

    		        case 'object':

    		// Due to a specification blunder in ECMAScript, typeof null is 'object',
    		// so watch out for that case.

    		            if (!value) {
    		                return 'null';
    		            }

    		// Make an array to hold the partial results of stringifying this object value.

    		            gap += indent;
    		            partial = [];

    		// Is the value an array?

    		            if (Object.prototype.toString.apply(value) === '[object Array]') {

    		// The value is an array. Stringify every element. Use null as a placeholder
    		// for non-JSON values.

    		                length = value.length;
    		                for (i = 0; i < length; i += 1) {
    		                    partial[i] = str(i, value) || 'null';
    		                }

    		// Join all of the elements together, separated with commas, and wrap them in
    		// brackets.

    		                v = partial.length === 0
    		                    ? '[]'
    		                    : gap
    		                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
    		                    : '[' + partial.join(',') + ']';
    		                gap = mind;
    		                return v;
    		            }

    		// If the replacer is an array, use it to select the members to be stringified.

    		            if (rep && typeof rep === 'object') {
    		                length = rep.length;
    		                for (i = 0; i < length; i += 1) {
    		                    if (typeof rep[i] === 'string') {
    		                        k = rep[i];
    		                        v = str(k, value);
    		                        if (v) {
    		                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
    		                        }
    		                    }
    		                }
    		            } else {

    		// Otherwise, iterate through all of the keys in the object.

    		                Object.keys(value).forEach(function(k) {
    		                    var v = str(k, value);
    		                    if (v) {
    		                        partial.push(quote(k) + (gap ? ': ' : ':') + v);
    		                    }
    		                });
    		            }

    		// Join all of the member texts together, separated with commas,
    		// and wrap them in braces.

    		            v = partial.length === 0
    		                ? '{}'
    		                : gap
    		                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
    		                : '{' + partial.join(',') + '}';
    		            gap = mind;
    		            return v;
    		        }
    		    }

    		// If the JSON object does not yet have a stringify method, give it one.

    		    if (typeof JSON.stringify !== 'function') {
    		        JSON.stringify = function (value, replacer, space) {

    		// The stringify method takes a value and an optional replacer, and an optional
    		// space parameter, and returns a JSON text. The replacer can be a function
    		// that can replace values, or an array of strings that will select the keys.
    		// A default replacer method can be provided. Use of the space parameter can
    		// produce text that is more easily readable.

    		            var i;
    		            gap = '';
    		            indent = '';

    		// If the space parameter is a number, make an indent string containing that
    		// many spaces.

    		            if (typeof space === 'number') {
    		                for (i = 0; i < space; i += 1) {
    		                    indent += ' ';
    		                }

    		// If the space parameter is a string, it will be used as the indent string.

    		            } else if (typeof space === 'string') {
    		                indent = space;
    		            }

    		// If there is a replacer, it must be a function or an array.
    		// Otherwise, throw an error.

    		            rep = replacer;
    		            if (replacer && typeof replacer !== 'function' &&
    		                    (typeof replacer !== 'object' ||
    		                    typeof replacer.length !== 'number')) {
    		                throw new Error('JSON.stringify');
    		            }

    		// Make a fake root object containing our value under the key of ''.
    		// Return the result of stringifying the value.

    		            return str('', {'': value});
    		        };
    		    }
    		}()); 
    	} (stringify));
    	return stringify.exports;
    }

    var parse;
    var hasRequiredParse;

    function requireParse () {
    	if (hasRequiredParse) return parse;
    	hasRequiredParse = 1;
    	var BigNumber = null;

    	// regexpxs extracted from
    	// (c) BSD-3-Clause
    	// https://github.com/fastify/secure-json-parse/graphs/contributors and https://github.com/hapijs/bourne/graphs/contributors

    	const suspectProtoRx = /(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])/;
    	const suspectConstructorRx = /(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)/;

    	/*
    	    json_parse.js
    	    2012-06-20

    	    Public Domain.

    	    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    	    This file creates a json_parse function.
    	    During create you can (optionally) specify some behavioural switches

    	        require('json-bigint')(options)

    	            The optional options parameter holds switches that drive certain
    	            aspects of the parsing process:
    	            * options.strict = true will warn about duplicate-key usage in the json.
    	              The default (strict = false) will silently ignore those and overwrite
    	              values for keys that are in duplicate use.

    	    The resulting function follows this signature:
    	        json_parse(text, reviver)
    	            This method parses a JSON text to produce an object or array.
    	            It can throw a SyntaxError exception.

    	            The optional reviver parameter is a function that can filter and
    	            transform the results. It receives each of the keys and values,
    	            and its return value is used instead of the original value.
    	            If it returns what it received, then the structure is not modified.
    	            If it returns undefined then the member is deleted.

    	            Example:

    	            // Parse the text. Values that look like ISO date strings will
    	            // be converted to Date objects.

    	            myData = json_parse(text, function (key, value) {
    	                var a;
    	                if (typeof value === 'string') {
    	                    a =
    	/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
    	                    if (a) {
    	                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
    	                            +a[5], +a[6]));
    	                    }
    	                }
    	                return value;
    	            });

    	    This is a reference implementation. You are free to copy, modify, or
    	    redistribute.

    	    This code should be minified before deployment.
    	    See http://javascript.crockford.com/jsmin.html

    	    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    	    NOT CONTROL.
    	*/

    	/*members "", "\"", "\/", "\\", at, b, call, charAt, f, fromCharCode,
    	    hasOwnProperty, message, n, name, prototype, push, r, t, text
    	*/

    	var json_parse = function (options) {

    	  // This is a function that can parse a JSON text, producing a JavaScript
    	  // data structure. It is a simple, recursive descent parser. It does not use
    	  // eval or regular expressions, so it can be used as a model for implementing
    	  // a JSON parser in other languages.

    	  // We are defining the function inside of another function to avoid creating
    	  // global variables.

    	  // Default options one can override by passing options to the parse()
    	  var _options = {
    	    strict: false, // not being strict means do not generate syntax errors for "duplicate key"
    	    storeAsString: false, // toggles whether the values should be stored as BigNumber (default) or a string
    	    alwaysParseAsBig: false, // toggles whether all numbers should be Big
    	    useNativeBigInt: false, // toggles whether to use native BigInt instead of bignumber.js
    	    protoAction: 'error',
    	    constructorAction: 'error',
    	  };

    	  // If there are options, then use them to override the default _options
    	  if (options !== undefined && options !== null) {
    	    if (options.strict === true) {
    	      _options.strict = true;
    	    }
    	    if (options.storeAsString === true) {
    	      _options.storeAsString = true;
    	    }
    	    _options.alwaysParseAsBig =
    	      options.alwaysParseAsBig === true ? options.alwaysParseAsBig : false;
    	    _options.useNativeBigInt =
    	      options.useNativeBigInt === true ? options.useNativeBigInt : false;

    	    if (typeof options.constructorAction !== 'undefined') {
    	      if (
    	        options.constructorAction === 'error' ||
    	        options.constructorAction === 'ignore' ||
    	        options.constructorAction === 'preserve'
    	      ) {
    	        _options.constructorAction = options.constructorAction;
    	      } else {
    	        throw new Error(
    	          `Incorrect value for constructorAction option, must be "error", "ignore" or undefined but passed ${options.constructorAction}`
    	        );
    	      }
    	    }

    	    if (typeof options.protoAction !== 'undefined') {
    	      if (
    	        options.protoAction === 'error' ||
    	        options.protoAction === 'ignore' ||
    	        options.protoAction === 'preserve'
    	      ) {
    	        _options.protoAction = options.protoAction;
    	      } else {
    	        throw new Error(
    	          `Incorrect value for protoAction option, must be "error", "ignore" or undefined but passed ${options.protoAction}`
    	        );
    	      }
    	    }
    	  }

    	  var at, // The index of the current character
    	    ch, // The current character
    	    escapee = {
    	      '"': '"',
    	      '\\': '\\',
    	      '/': '/',
    	      b: '\b',
    	      f: '\f',
    	      n: '\n',
    	      r: '\r',
    	      t: '\t',
    	    },
    	    text,
    	    error = function (m) {
    	      // Call error when something is wrong.

    	      throw {
    	        name: 'SyntaxError',
    	        message: m,
    	        at: at,
    	        text: text,
    	      };
    	    },
    	    next = function (c) {
    	      // If a c parameter is provided, verify that it matches the current character.

    	      if (c && c !== ch) {
    	        error("Expected '" + c + "' instead of '" + ch + "'");
    	      }

    	      // Get the next character. When there are no more characters,
    	      // return the empty string.

    	      ch = text.charAt(at);
    	      at += 1;
    	      return ch;
    	    },
    	    number = function () {
    	      // Parse a number value.

    	      var number,
    	        string = '';

    	      if (ch === '-') {
    	        string = '-';
    	        next('-');
    	      }
    	      while (ch >= '0' && ch <= '9') {
    	        string += ch;
    	        next();
    	      }
    	      if (ch === '.') {
    	        string += '.';
    	        while (next() && ch >= '0' && ch <= '9') {
    	          string += ch;
    	        }
    	      }
    	      if (ch === 'e' || ch === 'E') {
    	        string += ch;
    	        next();
    	        if (ch === '-' || ch === '+') {
    	          string += ch;
    	          next();
    	        }
    	        while (ch >= '0' && ch <= '9') {
    	          string += ch;
    	          next();
    	        }
    	      }
    	      number = +string;
    	      if (!isFinite(number)) {
    	        error('Bad number');
    	      } else {
    	        if (BigNumber == null) BigNumber = requireBignumber();
    	        //if (number > 9007199254740992 || number < -9007199254740992)
    	        // Bignumber has stricter check: everything with length > 15 digits disallowed
    	        if (string.length > 15)
    	          return _options.storeAsString
    	            ? string
    	            : _options.useNativeBigInt
    	            ? BigInt(string)
    	            : new BigNumber(string);
    	        else
    	          return !_options.alwaysParseAsBig
    	            ? number
    	            : _options.useNativeBigInt
    	            ? BigInt(number)
    	            : new BigNumber(number);
    	      }
    	    },
    	    string = function () {
    	      // Parse a string value.

    	      var hex,
    	        i,
    	        string = '',
    	        uffff;

    	      // When parsing for string values, we must look for " and \ characters.

    	      if (ch === '"') {
    	        var startAt = at;
    	        while (next()) {
    	          if (ch === '"') {
    	            if (at - 1 > startAt) string += text.substring(startAt, at - 1);
    	            next();
    	            return string;
    	          }
    	          if (ch === '\\') {
    	            if (at - 1 > startAt) string += text.substring(startAt, at - 1);
    	            next();
    	            if (ch === 'u') {
    	              uffff = 0;
    	              for (i = 0; i < 4; i += 1) {
    	                hex = parseInt(next(), 16);
    	                if (!isFinite(hex)) {
    	                  break;
    	                }
    	                uffff = uffff * 16 + hex;
    	              }
    	              string += String.fromCharCode(uffff);
    	            } else if (typeof escapee[ch] === 'string') {
    	              string += escapee[ch];
    	            } else {
    	              break;
    	            }
    	            startAt = at;
    	          }
    	        }
    	      }
    	      error('Bad string');
    	    },
    	    white = function () {
    	      // Skip whitespace.

    	      while (ch && ch <= ' ') {
    	        next();
    	      }
    	    },
    	    word = function () {
    	      // true, false, or null.

    	      switch (ch) {
    	        case 't':
    	          next('t');
    	          next('r');
    	          next('u');
    	          next('e');
    	          return true;
    	        case 'f':
    	          next('f');
    	          next('a');
    	          next('l');
    	          next('s');
    	          next('e');
    	          return false;
    	        case 'n':
    	          next('n');
    	          next('u');
    	          next('l');
    	          next('l');
    	          return null;
    	      }
    	      error("Unexpected '" + ch + "'");
    	    },
    	    value, // Place holder for the value function.
    	    array = function () {
    	      // Parse an array value.

    	      var array = [];

    	      if (ch === '[') {
    	        next('[');
    	        white();
    	        if (ch === ']') {
    	          next(']');
    	          return array; // empty array
    	        }
    	        while (ch) {
    	          array.push(value());
    	          white();
    	          if (ch === ']') {
    	            next(']');
    	            return array;
    	          }
    	          next(',');
    	          white();
    	        }
    	      }
    	      error('Bad array');
    	    },
    	    object = function () {
    	      // Parse an object value.

    	      var key,
    	        object = Object.create(null);

    	      if (ch === '{') {
    	        next('{');
    	        white();
    	        if (ch === '}') {
    	          next('}');
    	          return object; // empty object
    	        }
    	        while (ch) {
    	          key = string();
    	          white();
    	          next(':');
    	          if (
    	            _options.strict === true &&
    	            Object.hasOwnProperty.call(object, key)
    	          ) {
    	            error('Duplicate key "' + key + '"');
    	          }

    	          if (suspectProtoRx.test(key) === true) {
    	            if (_options.protoAction === 'error') {
    	              error('Object contains forbidden prototype property');
    	            } else if (_options.protoAction === 'ignore') {
    	              value();
    	            } else {
    	              object[key] = value();
    	            }
    	          } else if (suspectConstructorRx.test(key) === true) {
    	            if (_options.constructorAction === 'error') {
    	              error('Object contains forbidden constructor property');
    	            } else if (_options.constructorAction === 'ignore') {
    	              value();
    	            } else {
    	              object[key] = value();
    	            }
    	          } else {
    	            object[key] = value();
    	          }

    	          white();
    	          if (ch === '}') {
    	            next('}');
    	            return object;
    	          }
    	          next(',');
    	          white();
    	        }
    	      }
    	      error('Bad object');
    	    };

    	  value = function () {
    	    // Parse a JSON value. It could be an object, an array, a string, a number,
    	    // or a word.

    	    white();
    	    switch (ch) {
    	      case '{':
    	        return object();
    	      case '[':
    	        return array();
    	      case '"':
    	        return string();
    	      case '-':
    	        return number();
    	      default:
    	        return ch >= '0' && ch <= '9' ? number() : word();
    	    }
    	  };

    	  // Return the json_parse function. It will have access to all of the above
    	  // functions and variables.

    	  return function (source, reviver) {
    	    var result;

    	    text = source + '';
    	    at = 0;
    	    ch = ' ';
    	    result = value();
    	    white();
    	    if (ch) {
    	      error('Syntax error');
    	    }

    	    // If there is a reviver function, we recursively walk the new structure,
    	    // passing each name/value pair to the reviver function for possible
    	    // transformation, starting with a temporary root object that holds the result
    	    // in an empty key. If there is not a reviver function, we simply return the
    	    // result.

    	    return typeof reviver === 'function'
    	      ? (function walk(holder, key) {
    	          var v,
    	            value = holder[key];
    	          if (value && typeof value === 'object') {
    	            Object.keys(value).forEach(function (k) {
    	              v = walk(value, k);
    	              if (v !== undefined) {
    	                value[k] = v;
    	              } else {
    	                delete value[k];
    	              }
    	            });
    	          }
    	          return reviver.call(holder, key, value);
    	        })({ '': result }, '')
    	      : result;
    	  };
    	};

    	parse = json_parse;
    	return parse;
    }

    var hasRequiredJsonBigint;

    function requireJsonBigint () {
    	if (hasRequiredJsonBigint) return jsonBigint.exports;
    	hasRequiredJsonBigint = 1;
    	var json_stringify = requireStringify().stringify;
    	var json_parse     = requireParse();

    	jsonBigint.exports = function(options) {
    	    return  {
    	        parse: json_parse(options),
    	        stringify: json_stringify
    	    }
    	};
    	//create the default method members with no options applied for backwards compatibility
    	jsonBigint.exports.parse = json_parse();
    	jsonBigint.exports.stringify = json_stringify;
    	return jsonBigint.exports;
    }

    var jsonBigintExports = requireJsonBigint();
    var JSONbigModule = /*@__PURE__*/getDefaultExportFromCjs(jsonBigintExports);

    const JSONbig$1 = JSONbigModule({ useNativeBigInt: true });
    /**
     * Helper class to generate query strings.
     */
    class Query {
        /**
         * Constructor for Query class.
         *
         * @param {string} method
         * @param {AttributesTypes} attribute
         * @param {QueryTypes} values
         */
        constructor(method, attribute, values) {
            this.method = method;
            this.attribute = attribute;
            if (values !== undefined) {
                if (Array.isArray(values)) {
                    this.values = values;
                }
                else {
                    this.values = [values];
                }
            }
        }
        /**
         * Convert the query object to a JSON string.
         *
         * @returns {string}
         */
        toString() {
            return JSONbig$1.stringify({
                method: this.method,
                attribute: this.attribute,
                values: this.values,
            });
        }
    }
    /**
     * Filter resources where attribute is equal to value.
     *
     * @param {string} attribute
     * @param {QueryTypes} value
     * @returns {string}
     */
    Query.equal = (attribute, value) => new Query("equal", attribute, value).toString();
    /**
     * Filter resources where attribute is not equal to value.
     *
     * @param {string} attribute
     * @param {QueryTypes} value
     * @returns {string}
     */
    Query.notEqual = (attribute, value) => new Query("notEqual", attribute, value).toString();
    /**
     * Filter resources where attribute matches a regular expression pattern.
     *
     * @param {string} attribute The attribute to filter on.
     * @param {string} pattern The regular expression pattern to match.
     * @returns {string}
     */
    Query.regex = (attribute, pattern) => new Query("regex", attribute, pattern).toString();
    /**
     * Filter resources where attribute is less than value.
     *
     * @param {string} attribute
     * @param {QueryTypes} value
     * @returns {string}
     */
    Query.lessThan = (attribute, value) => new Query("lessThan", attribute, value).toString();
    /**
     * Filter resources where attribute is less than or equal to value.
     *
     * @param {string} attribute
     * @param {QueryTypes} value
     * @returns {string}
     */
    Query.lessThanEqual = (attribute, value) => new Query("lessThanEqual", attribute, value).toString();
    /**
     * Filter resources where attribute is greater than value.
     *
     * @param {string} attribute
     * @param {QueryTypes} value
     * @returns {string}
     */
    Query.greaterThan = (attribute, value) => new Query("greaterThan", attribute, value).toString();
    /**
     * Filter resources where attribute is greater than or equal to value.
     *
     * @param {string} attribute
     * @param {QueryTypes} value
     * @returns {string}
     */
    Query.greaterThanEqual = (attribute, value) => new Query("greaterThanEqual", attribute, value).toString();
    /**
     * Filter resources where attribute is null.
     *
     * @param {string} attribute
     * @returns {string}
     */
    Query.isNull = (attribute) => new Query("isNull", attribute).toString();
    /**
     * Filter resources where attribute is not null.
     *
     * @param {string} attribute
     * @returns {string}
     */
    Query.isNotNull = (attribute) => new Query("isNotNull", attribute).toString();
    /**
     * Filter resources where the specified attributes exist.
     *
     * @param {string[]} attributes The list of attributes that must exist.
     * @returns {string}
     */
    Query.exists = (attributes) => new Query("exists", undefined, attributes).toString();
    /**
     * Filter resources where the specified attributes do not exist.
     *
     * @param {string[]} attributes The list of attributes that must not exist.
     * @returns {string}
     */
    Query.notExists = (attributes) => new Query("notExists", undefined, attributes).toString();
    /**
     * Filter resources where attribute is between start and end (inclusive).
     *
     * @param {string} attribute
     * @param {string | number | bigint} start
     * @param {string | number | bigint} end
     * @returns {string}
     */
    Query.between = (attribute, start, end) => new Query("between", attribute, [start, end]).toString();
    /**
     * Filter resources where attribute starts with value.
     *
     * @param {string} attribute
     * @param {string} value
     * @returns {string}
     */
    Query.startsWith = (attribute, value) => new Query("startsWith", attribute, value).toString();
    /**
     * Filter resources where attribute ends with value.
     *
     * @param {string} attribute
     * @param {string} value
     * @returns {string}
     */
    Query.endsWith = (attribute, value) => new Query("endsWith", attribute, value).toString();
    /**
     * Specify which attributes should be returned by the API call.
     *
     * @param {string[]} attributes
     * @returns {string}
     */
    Query.select = (attributes) => new Query("select", undefined, attributes).toString();
    /**
     * Filter resources by searching attribute for value.
     * A fulltext index on attribute is required for this query to work.
     *
     * @param {string} attribute
     * @param {string} value
     * @returns {string}
     */
    Query.search = (attribute, value) => new Query("search", attribute, value).toString();
    /**
     * Sort results by attribute descending.
     *
     * @param {string} attribute
     * @returns {string}
     */
    Query.orderDesc = (attribute) => new Query("orderDesc", attribute).toString();
    /**
     * Sort results by attribute ascending.
     *
     * @param {string} attribute
     * @returns {string}
     */
    Query.orderAsc = (attribute) => new Query("orderAsc", attribute).toString();
    /**
     * Sort results randomly.
     *
     * @returns {string}
     */
    Query.orderRandom = () => new Query("orderRandom").toString();
    /**
     * Return results after documentId.
     *
     * @param {string} documentId
     * @returns {string}
     */
    Query.cursorAfter = (documentId) => new Query("cursorAfter", undefined, documentId).toString();
    /**
     * Return results before documentId.
     *
     * @param {string} documentId
     * @returns {string}
     */
    Query.cursorBefore = (documentId) => new Query("cursorBefore", undefined, documentId).toString();
    /**
     * Return only limit results.
     *
     * @param {number} limit
     * @returns {string}
     */
    Query.limit = (limit) => new Query("limit", undefined, limit).toString();
    /**
     * Filter resources by skipping the first offset results.
     *
     * @param {number} offset
     * @returns {string}
     */
    Query.offset = (offset) => new Query("offset", undefined, offset).toString();
    /**
     * Filter resources where attribute contains the specified value.
     * For string attributes, checks if the string contains the substring.
     *
     * Note: For array attributes, use {@link containsAny} or {@link containsAll} instead.
     * @param {string} attribute
     * @param {string | string[]} value
     * @returns {string}
     */
    Query.contains = (attribute, value) => new Query("contains", attribute, value).toString();
    /**
     * Filter resources where attribute contains ANY of the specified values.
     * For array and relationship attributes, matches documents where the attribute
     * contains at least one of the given values.
     *
     * @param {string} attribute
     * @param {any[]} value
     * @returns {string}
     */
    Query.containsAny = (attribute, value) => new Query("containsAny", attribute, value).toString();
    /**
     * Filter resources where attribute contains ALL of the specified values.
     * For array and relationship attributes, matches documents where the attribute
     * contains every one of the given values.
     *
     * @param {string} attribute
     * @param {any[]} value
     * @returns {string}
     */
    Query.containsAll = (attribute, value) => new Query("containsAll", attribute, value).toString();
    /**
     * Filter resources where attribute does not contain the specified value.
     *
     * @param {string} attribute
     * @param {string | any[]} value
     * @returns {string}
     */
    Query.notContains = (attribute, value) => new Query("notContains", attribute, value).toString();
    /**
     * Filter resources by searching attribute for value (inverse of search).
     * A fulltext index on attribute is required for this query to work.
     *
     * @param {string} attribute
     * @param {string} value
     * @returns {string}
     */
    Query.notSearch = (attribute, value) => new Query("notSearch", attribute, value).toString();
    /**
     * Filter resources where attribute is not between start and end (exclusive).
     *
     * @param {string} attribute
     * @param {string | number | bigint} start
     * @param {string | number | bigint} end
     * @returns {string}
     */
    Query.notBetween = (attribute, start, end) => new Query("notBetween", attribute, [start, end]).toString();
    /**
     * Filter resources where attribute does not start with value.
     *
     * @param {string} attribute
     * @param {string} value
     * @returns {string}
     */
    Query.notStartsWith = (attribute, value) => new Query("notStartsWith", attribute, value).toString();
    /**
     * Filter resources where attribute does not end with value.
     *
     * @param {string} attribute
     * @param {string} value
     * @returns {string}
     */
    Query.notEndsWith = (attribute, value) => new Query("notEndsWith", attribute, value).toString();
    /**
     * Filter resources where document was created before date.
     *
     * @param {string} value
     * @returns {string}
     */
    Query.createdBefore = (value) => Query.lessThan("$createdAt", value);
    /**
     * Filter resources where document was created after date.
     *
     * @param {string} value
     * @returns {string}
     */
    Query.createdAfter = (value) => Query.greaterThan("$createdAt", value);
    /**
     * Filter resources where document was created between dates.
     *
     * @param {string} start
     * @param {string} end
     * @returns {string}
     */
    Query.createdBetween = (start, end) => Query.between("$createdAt", start, end);
    /**
     * Filter resources where document was updated before date.
     *
     * @param {string} value
     * @returns {string}
     */
    Query.updatedBefore = (value) => Query.lessThan("$updatedAt", value);
    /**
     * Filter resources where document was updated after date.
     *
     * @param {string} value
     * @returns {string}
     */
    Query.updatedAfter = (value) => Query.greaterThan("$updatedAt", value);
    /**
     * Filter resources where document was updated between dates.
     *
     * @param {string} start
     * @param {string} end
     * @returns {string}
     */
    Query.updatedBetween = (start, end) => Query.between("$updatedAt", start, end);
    /**
     * Combine multiple queries using logical OR operator.
     *
     * @param {string[]} queries
     * @returns {string}
     */
    Query.or = (queries) => new Query("or", undefined, queries.map((query) => JSONbig$1.parse(query))).toString();
    /**
     * Combine multiple queries using logical AND operator.
     *
     * @param {string[]} queries
     * @returns {string}
     */
    Query.and = (queries) => new Query("and", undefined, queries.map((query) => JSONbig$1.parse(query))).toString();
    /**
     * Filter array elements where at least one element matches all the specified queries.
     *
     * @param {string} attribute The attribute containing the array to filter on.
     * @param {string[]} queries The list of query strings to match against array elements.
     * @returns {string}
     */
    Query.elemMatch = (attribute, queries) => new Query("elemMatch", attribute, queries.map((query) => JSONbig$1.parse(query))).toString();
    /**
     * Filter resources where attribute is at a specific distance from the given coordinates.
     *
     * @param {string} attribute
     * @param {any[]} values
     * @param {number} distance
     * @param {boolean} meters
     * @returns {string}
     */
    Query.distanceEqual = (attribute, values, distance, meters = true) => new Query("distanceEqual", attribute, [[values, distance, meters]]).toString();
    /**
     * Filter resources where attribute is not at a specific distance from the given coordinates.
     *
     * @param {string} attribute
     * @param {any[]} values
     * @param {number} distance
     * @param {boolean} meters
     * @returns {string}
     */
    Query.distanceNotEqual = (attribute, values, distance, meters = true) => new Query("distanceNotEqual", attribute, [[values, distance, meters]]).toString();
    /**
     * Filter resources where attribute is at a distance greater than the specified value from the given coordinates.
     *
     * @param {string} attribute
     * @param {any[]} values
     * @param {number} distance
     * @param {boolean} meters
     * @returns {string}
     */
    Query.distanceGreaterThan = (attribute, values, distance, meters = true) => new Query("distanceGreaterThan", attribute, [[values, distance, meters]]).toString();
    /**
     * Filter resources where attribute is at a distance less than the specified value from the given coordinates.
     *
     * @param {string} attribute
     * @param {any[]} values
     * @param {number} distance
     * @param {boolean} meters
     * @returns {string}
     */
    Query.distanceLessThan = (attribute, values, distance, meters = true) => new Query("distanceLessThan", attribute, [[values, distance, meters]]).toString();
    /**
     * Filter resources using vector dot product similarity.
     *
     * @param {string} attribute
     * @param {number[]} vector
     * @returns {string}
     */
    Query.vectorDot = (attribute, vector) => new Query("vectorDot", attribute, [vector]).toString();
    /**
     * Filter resources using vector cosine similarity.
     *
     * @param {string} attribute
     * @param {number[]} vector
     * @returns {string}
     */
    Query.vectorCosine = (attribute, vector) => new Query("vectorCosine", attribute, [vector]).toString();
    /**
     * Filter resources using vector Euclidean distance.
     *
     * @param {string} attribute
     * @param {number[]} vector
     * @returns {string}
     */
    Query.vectorEuclidean = (attribute, vector) => new Query("vectorEuclidean", attribute, [vector]).toString();
    /**
     * Filter resources where attribute intersects with the given geometry.
     *
     * @param {string} attribute
     * @param {any[]} values
     * @returns {string}
     */
    Query.intersects = (attribute, values) => new Query("intersects", attribute, [values]).toString();
    /**
     * Filter resources where attribute does not intersect with the given geometry.
     *
     * @param {string} attribute
     * @param {any[]} values
     * @returns {string}
     */
    Query.notIntersects = (attribute, values) => new Query("notIntersects", attribute, [values]).toString();
    /**
     * Filter resources where attribute crosses the given geometry.
     *
     * @param {string} attribute
     * @param {any[]} values
     * @returns {string}
     */
    Query.crosses = (attribute, values) => new Query("crosses", attribute, [values]).toString();
    /**
     * Filter resources where attribute does not cross the given geometry.
     *
     * @param {string} attribute
     * @param {any[]} values
     * @returns {string}
     */
    Query.notCrosses = (attribute, values) => new Query("notCrosses", attribute, [values]).toString();
    /**
     * Filter resources where attribute overlaps with the given geometry.
     *
     * @param {string} attribute
     * @param {any[]} values
     * @returns {string}
     */
    Query.overlaps = (attribute, values) => new Query("overlaps", attribute, [values]).toString();
    /**
     * Filter resources where attribute does not overlap with the given geometry.
     *
     * @param {string} attribute
     * @param {any[]} values
     * @returns {string}
     */
    Query.notOverlaps = (attribute, values) => new Query("notOverlaps", attribute, [values]).toString();
    /**
     * Filter resources where attribute touches the given geometry.
     *
     * @param {string} attribute
     * @param {any[]} values
     * @returns {string}
     */
    Query.touches = (attribute, values) => new Query("touches", attribute, [values]).toString();
    /**
     * Filter resources where attribute does not touch the given geometry.
     *
     * @param {string} attribute
     * @param {any[]} values
     * @returns {string}
     */
    Query.notTouches = (attribute, values) => new Query("notTouches", attribute, [values]).toString();

    const JSONbigParser = JSONbigModule({ storeAsString: false });
    const JSONbigSerializer = JSONbigModule({ useNativeBigInt: true });
    const MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER);
    const MIN_SAFE = BigInt(Number.MIN_SAFE_INTEGER);
    const MAX_INT64 = BigInt('9223372036854775807');
    const MIN_INT64 = BigInt('-9223372036854775808');
    function isBigNumber(value) {
        return value !== null
            && typeof value === 'object'
            && value._isBigNumber === true
            && typeof value.isInteger === 'function'
            && typeof value.toFixed === 'function'
            && typeof value.toNumber === 'function';
    }
    function reviver(_key, value) {
        if (isBigNumber(value)) {
            if (value.isInteger()) {
                const str = value.toFixed();
                const bi = BigInt(str);
                if (bi >= MIN_SAFE && bi <= MAX_SAFE) {
                    return Number(str);
                }
                if (bi >= MIN_INT64 && bi <= MAX_INT64) {
                    return bi;
                }
                return value.toNumber();
            }
            return value.toNumber();
        }
        return value;
    }
    const JSONbig = {
        parse: (text) => JSONbigParser.parse(text, reviver),
        stringify: JSONbigSerializer.stringify
    };
    /**
     * Exception thrown by the  package
     */
    class AppwriteException extends Error {
        /**
         * Initializes a Appwrite Exception.
         *
         * @param {string} message - The error message.
         * @param {number} code - The error code. Default is 0.
         * @param {string} type - The error type. Default is an empty string.
         * @param {string} response - The response string. Default is an empty string.
         */
        constructor(message, code = 0, type = '', response = '') {
            super(message);
            this.name = 'AppwriteException';
            this.message = message;
            this.code = code;
            this.type = type;
            this.response = response;
        }
    }
    /**
     * Client that handles requests to Appwrite
     */
    class Client {
        constructor() {
            /**
             * Holds configuration such as project.
             */
            this.config = {
                endpoint: 'https://cloud.appwrite.io/v1',
                endpointRealtime: '',
                project: '',
                jwt: '',
                bearer: '',
                locale: '',
                session: '',
                devkey: '',
                cookie: '',
                impersonateuserid: '',
                impersonateuseremail: '',
                impersonateuserphone: '',
            };
            /**
             * Custom headers for API requests.
             */
            this.headers = {
                'x-sdk-name': 'Web',
                'x-sdk-platform': 'client',
                'x-sdk-language': 'web',
                'x-sdk-version': '26.2.0',
                'X-Appwrite-Response-Format': '1.9.5',
            };
            this.realtime = {
                socket: undefined,
                timeout: undefined,
                heartbeat: undefined,
                url: '',
                channels: new Set(),
                subscriptions: new Map(),
                pendingSubscribes: new Map(),
                reconnect: true,
                reconnectAttempts: 0,
                lastMessage: undefined,
                connect: () => {
                    clearTimeout(this.realtime.timeout);
                    this.realtime.timeout = window === null || window === void 0 ? void 0 : window.setTimeout(() => {
                        this.realtime.createSocket();
                    }, 50);
                },
                getTimeout: () => {
                    switch (true) {
                        case this.realtime.reconnectAttempts < 5:
                            return 1000;
                        case this.realtime.reconnectAttempts < 15:
                            return 5000;
                        case this.realtime.reconnectAttempts < 100:
                            return 10000;
                        default:
                            return 60000;
                    }
                },
                createHeartbeat: () => {
                    if (this.realtime.heartbeat) {
                        clearTimeout(this.realtime.heartbeat);
                    }
                    this.realtime.heartbeat = window === null || window === void 0 ? void 0 : window.setInterval(() => {
                        var _a;
                        (_a = this.realtime.socket) === null || _a === void 0 ? void 0 : _a.send(JSONbig.stringify({
                            type: 'ping'
                        }));
                    }, 20000);
                },
                createSocket: () => {
                    var _a, _b, _c, _d, _e;
                    if (this.realtime.subscriptions.size < 1) {
                        this.realtime.reconnect = false;
                        (_a = this.realtime.socket) === null || _a === void 0 ? void 0 : _a.close();
                        return;
                    }
                    const encodedProject = encodeURIComponent((_b = this.config.project) !== null && _b !== void 0 ? _b : '');
                    // URL carries only the project; channels/queries are sent via subscribe message.
                    let queryParams = 'project=' + encodedProject;
                    if (this.config.jwt) {
                        queryParams += '&jwt=' + encodeURIComponent(this.config.jwt);
                    }
                    const url = this.config.endpointRealtime + '/realtime?' + queryParams;
                    if (url !== this.realtime.url || // Check if URL is present
                        !this.realtime.socket || // Check if WebSocket has not been created
                        ((_c = this.realtime.socket) === null || _c === void 0 ? void 0 : _c.readyState) > WebSocket.OPEN // Check if WebSocket is CLOSING (3) or CLOSED (4)
                    ) {
                        if (this.realtime.socket &&
                            ((_d = this.realtime.socket) === null || _d === void 0 ? void 0 : _d.readyState) < WebSocket.CLOSING // Close WebSocket if it is CONNECTING (0) or OPEN (1)
                        ) {
                            this.realtime.reconnect = false;
                            this.realtime.socket.close();
                        }
                        this.realtime.url = url;
                        this.realtime.socket = new WebSocket(url);
                        this.realtime.socket.addEventListener('message', this.realtime.onMessage);
                        this.realtime.socket.addEventListener('open', _event => {
                            this.realtime.reconnectAttempts = 0;
                            this.realtime.createHeartbeat();
                        });
                        this.realtime.socket.addEventListener('close', event => {
                            var _a, _b, _c;
                            if (!this.realtime.reconnect ||
                                (((_b = (_a = this.realtime) === null || _a === void 0 ? void 0 : _a.lastMessage) === null || _b === void 0 ? void 0 : _b.type) === 'error' && // Check if last message was of type error
                                    ((_c = this.realtime) === null || _c === void 0 ? void 0 : _c.lastMessage.data).code === 1008 // Check for policy violation 1008
                                )) {
                                this.realtime.reconnect = true;
                                return;
                            }
                            const timeout = this.realtime.getTimeout();
                            console.error(`Realtime got disconnected. Reconnect will be attempted in ${timeout / 1000} seconds.`, event.reason);
                            setTimeout(() => {
                                this.realtime.reconnectAttempts++;
                                this.realtime.createSocket();
                            }, timeout);
                        });
                    }
                    else if (((_e = this.realtime.socket) === null || _e === void 0 ? void 0 : _e.readyState) === WebSocket.OPEN) {
                        this.realtime.sendPendingSubscribes();
                    }
                },
                sendPendingSubscribes: () => {
                    if (!this.realtime.socket || this.realtime.socket.readyState !== WebSocket.OPEN) {
                        return;
                    }
                    if (this.realtime.pendingSubscribes.size < 1) {
                        return;
                    }
                    const rows = Array.from(this.realtime.pendingSubscribes.values());
                    this.realtime.pendingSubscribes.clear();
                    this.realtime.socket.send(JSONbig.stringify({
                        type: 'subscribe',
                        data: rows
                    }));
                },
                onMessage: (event) => {
                    var _a, _b;
                    try {
                        const message = JSONbig.parse(event.data);
                        this.realtime.lastMessage = message;
                        switch (message.type) {
                            case 'connected': {
                                const messageData = message.data;
                                let session = this.config.session;
                                if (!session) {
                                    const cookie = JSONbig.parse((_a = window.localStorage.getItem('cookieFallback')) !== null && _a !== void 0 ? _a : '{}');
                                    session = cookie === null || cookie === void 0 ? void 0 : cookie[`a_session_${this.config.project}`];
                                }
                                if (session && !(messageData === null || messageData === void 0 ? void 0 : messageData.user)) {
                                    (_b = this.realtime.socket) === null || _b === void 0 ? void 0 : _b.send(JSONbig.stringify({
                                        type: 'authentication',
                                        data: {
                                            session
                                        }
                                    }));
                                }
                                this.realtime.subscriptions.forEach((sub, subscriptionId) => {
                                    var _a;
                                    this.realtime.pendingSubscribes.set(subscriptionId, {
                                        subscriptionId,
                                        channels: sub.channels,
                                        queries: (_a = sub.queries) !== null && _a !== void 0 ? _a : []
                                    });
                                });
                                this.realtime.sendPendingSubscribes();
                                break;
                            }
                            case 'response':
                                // The SDK generates subscriptionIds client-side and sends them on every
                                // subscribe/unsubscribe, so subscribe/unsubscribe acks carry no state
                                // the SDK needs to reconcile.
                                break;
                            case 'event': {
                                const data = message.data;
                                if (!(data === null || data === void 0 ? void 0 : data.channels))
                                    break;
                                const eventSubIds = data.subscriptions;
                                if (eventSubIds && eventSubIds.length > 0) {
                                    for (const subscriptionId of eventSubIds) {
                                        const subscription = this.realtime.subscriptions.get(subscriptionId);
                                        if (subscription) {
                                            setTimeout(() => subscription.callback(data));
                                        }
                                    }
                                }
                                else {
                                    const isSubscribed = data.channels.some(channel => this.realtime.channels.has(channel));
                                    if (!isSubscribed)
                                        break;
                                    this.realtime.subscriptions.forEach(subscription => {
                                        if (data.channels.some(channel => subscription.channels.includes(channel))) {
                                            setTimeout(() => subscription.callback(data));
                                        }
                                    });
                                }
                                break;
                            }
                            case 'pong':
                                break; // Handle pong response if needed
                            case 'error':
                                throw message.data;
                            default:
                                break;
                        }
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
            };
        }
        /**
         * Get Headers
         *
         * Returns a copy of the current request headers, including any
         * authentication headers. Handle with care.
         *
         * @returns {Headers}
         */
        getHeaders() {
            return Object.assign({}, this.headers);
        }
        /**
         * Set Endpoint
         *
         * Your project endpoint
         *
         * @param {string} endpoint
         *
         * @returns {this}
         */
        setEndpoint(endpoint) {
            if (!endpoint || typeof endpoint !== 'string') {
                throw new AppwriteException('Endpoint must be a valid string');
            }
            if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
                throw new AppwriteException('Invalid endpoint URL: ' + endpoint);
            }
            this.config.endpoint = endpoint;
            this.config.endpointRealtime = endpoint.replace('https://', 'wss://').replace('http://', 'ws://');
            return this;
        }
        /**
         * Set Realtime Endpoint
         *
         * @param {string} endpointRealtime
         *
         * @returns {this}
         */
        setEndpointRealtime(endpointRealtime) {
            if (!endpointRealtime || typeof endpointRealtime !== 'string') {
                throw new AppwriteException('Endpoint must be a valid string');
            }
            if (!endpointRealtime.startsWith('ws://') && !endpointRealtime.startsWith('wss://')) {
                throw new AppwriteException('Invalid realtime endpoint URL: ' + endpointRealtime);
            }
            this.config.endpointRealtime = endpointRealtime;
            return this;
        }
        /**
         * Set Project
         *
         * Your project ID
         *
         * @param value string
         *
         * @return {this}
         */
        setProject(value) {
            this.config.project = value;
            return this;
        }
        /**
         * Set JWT
         *
         * Your secret JSON Web Token
         *
         * @param value string
         *
         * @return {this}
         */
        setJWT(value) {
            this.headers['X-Appwrite-JWT'] = value;
            this.config.jwt = value;
            return this;
        }
        /**
         * Set Bearer
         *
         * The OAuth access token to authenticate with
         *
         * @param value string
         *
         * @return {this}
         */
        setBearer(value) {
            this.headers['Authorization'] = `Bearer ${value}`;
            this.config.bearer = value;
            return this;
        }
        /**
         * Set Locale
         *
         * @param value string
         *
         * @return {this}
         */
        setLocale(value) {
            this.headers['X-Appwrite-Locale'] = value;
            this.config.locale = value;
            return this;
        }
        /**
         * Set Session
         *
         * The user session to authenticate with
         *
         * @param value string
         *
         * @return {this}
         */
        setSession(value) {
            this.headers['X-Appwrite-Session'] = value;
            this.config.session = value;
            return this;
        }
        /**
         * Set DevKey
         *
         * Your secret dev API key
         *
         * @param value string
         *
         * @return {this}
         */
        setDevKey(value) {
            this.headers['X-Appwrite-Dev-Key'] = value;
            this.config.devkey = value;
            return this;
        }
        /**
         * Set Cookie
         *
         * The user cookie to authenticate with. Used by SDKs that forward an incoming Cookie header in server-side runtimes.
         *
         * @param value string
         *
         * @return {this}
         */
        setCookie(value) {
            this.headers['Cookie'] = value;
            this.config.cookie = value;
            return this;
        }
        /**
         * Set ImpersonateUserId
         *
         * Impersonate a user by ID
         *
         * @param value string
         *
         * @return {this}
         */
        setImpersonateUserId(value) {
            this.headers['X-Appwrite-Impersonate-User-Id'] = value;
            this.config.impersonateuserid = value;
            return this;
        }
        /**
         * Set ImpersonateUserEmail
         *
         * Impersonate a user by email
         *
         * @param value string
         *
         * @return {this}
         */
        setImpersonateUserEmail(value) {
            this.headers['X-Appwrite-Impersonate-User-Email'] = value;
            this.config.impersonateuseremail = value;
            return this;
        }
        /**
         * Set ImpersonateUserPhone
         *
         * Impersonate a user by phone
         *
         * @param value string
         *
         * @return {this}
         */
        setImpersonateUserPhone(value) {
            this.headers['X-Appwrite-Impersonate-User-Phone'] = value;
            this.config.impersonateuserphone = value;
            return this;
        }
        /**
         * Subscribes to Appwrite events and passes you the payload in realtime.
         *
         * @deprecated Use the Realtime service instead.
         * @see Realtime
         *
         * @param {string|string[]|Channel<any>|ActionableChannel|ResolvedChannel|(Channel<any>|ActionableChannel|ResolvedChannel)[]} channels
         * Channel to subscribe - pass a single channel as a string or Channel builder instance, or multiple with an array.
         *
         * Possible channels are:
         * - account
         * - collections
         * - collections.[ID]
         * - collections.[ID].documents
         * - documents
         * - documents.[ID]
         * - files
         * - files.[ID]
         * - executions
         * - executions.[ID]
         * - functions.[ID]
         * - teams
         * - teams.[ID]
         * - memberships
         * - memberships.[ID]
         *
         * You can also use Channel builders:
         * - Channel.database('db').collection('col').document('doc').create()
         * - Channel.bucket('bucket').file('file').update()
         * - Channel.function('func').execution('exec').delete()
         * - Channel.team('team').create()
         * - Channel.membership('membership').update()
         * @param {(payload: RealtimeMessage) => void} callback Is called on every realtime update.
         * @returns {() => void} Unsubscribes from events.
         */
        subscribe(channels, callback, queries = []) {
            const channelArray = Array.isArray(channels) ? channels : [channels];
            // Convert Channel instances to strings
            const channelStrings = channelArray.map(ch => {
                if (typeof ch === 'string') {
                    return ch;
                }
                // All Channel instances have toString() method
                if (ch && typeof ch.toString === 'function') {
                    return ch.toString();
                }
                // Fallback to generic string conversion
                return String(ch);
            });
            channelStrings.forEach(channel => this.realtime.channels.add(channel));
            const queryStrings = (queries !== null && queries !== void 0 ? queries : []).map(q => typeof q === 'string' ? q : q.toString());
            let subscriptionId = '';
            const attempts = this.realtime.subscriptions.size + 1;
            for (let i = 0; i < attempts; i++) {
                const candidate = ID.unique();
                if (!this.realtime.subscriptions.has(candidate)) {
                    subscriptionId = candidate;
                    break;
                }
            }
            if (subscriptionId === '') {
                throw new AppwriteException('Failed to generate unique subscription id');
            }
            this.realtime.subscriptions.set(subscriptionId, {
                channels: channelStrings,
                queries: queryStrings,
                callback
            });
            this.realtime.pendingSubscribes.set(subscriptionId, {
                subscriptionId,
                channels: channelStrings,
                queries: queryStrings
            });
            this.realtime.connect();
            return () => {
                this.realtime.subscriptions.delete(subscriptionId);
                this.realtime.pendingSubscribes.delete(subscriptionId);
                const stillUsed = new Set();
                this.realtime.subscriptions.forEach(sub => {
                    sub.channels.forEach(channel => stillUsed.add(channel));
                });
                this.realtime.channels.forEach(channel => {
                    if (!stillUsed.has(channel)) {
                        this.realtime.channels.delete(channel);
                    }
                });
                this.realtime.connect();
            };
        }
        prepareRequest(method, url, headers = {}, params = {}) {
            method = method.toUpperCase();
            headers = Object.assign({}, this.headers, headers);
            if (typeof window !== 'undefined' && window.localStorage) {
                const cookieFallback = window.localStorage.getItem('cookieFallback');
                if (cookieFallback) {
                    headers['X-Fallback-Cookies'] = cookieFallback;
                }
            }
            let options = {
                method,
                headers,
            };
            if (headers['X-Appwrite-Dev-Key'] === undefined) {
                options.credentials = 'include';
            }
            if (method === 'GET') {
                for (const [key, value] of Object.entries(Client.flatten(params))) {
                    url.searchParams.append(key, value);
                }
            }
            else {
                switch (headers['content-type']) {
                    case 'application/json':
                        options.body = JSONbig.stringify(params);
                        break;
                    case 'multipart/form-data':
                        const formData = new FormData();
                        for (const [key, value] of Object.entries(params)) {
                            if (value instanceof File) {
                                formData.append(key, value, value.name);
                            }
                            else if (Array.isArray(value)) {
                                for (const nestedValue of value) {
                                    formData.append(`${key}[]`, nestedValue);
                                }
                            }
                            else {
                                formData.append(key, value);
                            }
                        }
                        options.body = formData;
                        delete headers['content-type'];
                        break;
                }
            }
            return { uri: url.toString(), options };
        }
        chunkedUpload(method_1, url_1) {
            return __awaiter(this, arguments, void 0, function* (method, url, headers = {}, originalPayload = {}, onProgress) {
                var _a;
                const [fileParam, file] = (_a = Object.entries(originalPayload).find(([_, value]) => value instanceof File)) !== null && _a !== void 0 ? _a : [];
                if (!file || !fileParam) {
                    throw new Error('File not found in payload');
                }
                if (file.size <= Client.CHUNK_SIZE) {
                    return yield this.call(method, url, headers, originalPayload);
                }
                const totalChunks = Math.ceil(file.size / Client.CHUNK_SIZE);
                // Upload first chunk alone to get the upload ID
                const firstChunkEnd = Math.min(Client.CHUNK_SIZE, file.size);
                const firstChunkHeaders = Object.assign(Object.assign({}, headers), { 'content-range': `bytes 0-${firstChunkEnd - 1}/${file.size}` });
                const firstChunk = file.slice(0, firstChunkEnd);
                const firstPayload = Object.assign({}, originalPayload);
                firstPayload[fileParam] = new File([firstChunk], file.name);
                let response = yield this.call(method, url, firstChunkHeaders, firstPayload);
                const uploadId = response === null || response === void 0 ? void 0 : response.$id;
                if (onProgress && typeof onProgress === 'function') {
                    onProgress({
                        $id: uploadId,
                        progress: Math.round((firstChunkEnd / file.size) * 100),
                        sizeUploaded: firstChunkEnd,
                        chunksTotal: totalChunks,
                        chunksUploaded: 1
                    });
                }
                if (totalChunks === 1) {
                    return response;
                }
                // Prepare remaining chunks
                const chunks = [];
                for (let i = 1; i < totalChunks; i++) {
                    const start = i * Client.CHUNK_SIZE;
                    const end = Math.min(start + Client.CHUNK_SIZE, file.size);
                    chunks.push({ start, end });
                }
                // Upload remaining chunks with max concurrency of 8
                const CONCURRENCY = 8;
                let completedCount = 1;
                let uploadedBytes = firstChunkEnd;
                let lastResponse = response;
                let finalResponse = null;
                let rejected = false;
                const isUploadComplete = (chunkResponse) => {
                    var _a;
                    const chunksUploaded = chunkResponse === null || chunkResponse === void 0 ? void 0 : chunkResponse.chunksUploaded;
                    const chunksTotal = (_a = chunkResponse === null || chunkResponse === void 0 ? void 0 : chunkResponse.chunksTotal) !== null && _a !== void 0 ? _a : totalChunks;
                    return typeof chunksUploaded === 'number' && typeof chunksTotal === 'number' && chunksUploaded >= chunksTotal;
                };
                const uploadChunk = (chunk) => __awaiter(this, void 0, void 0, function* () {
                    const chunkHeaders = Object.assign({}, headers);
                    if (uploadId) {
                        chunkHeaders['x-appwrite-id'] = uploadId;
                    }
                    chunkHeaders['content-range'] = `bytes ${chunk.start}-${chunk.end - 1}/${file.size}`;
                    const chunkBlob = file.slice(chunk.start, chunk.end);
                    const chunkPayload = Object.assign({}, originalPayload);
                    chunkPayload[fileParam] = new File([chunkBlob], file.name);
                    const chunkResponse = yield this.call(method, url, chunkHeaders, chunkPayload);
                    if (rejected) {
                        return chunkResponse;
                    }
                    completedCount++;
                    uploadedBytes += (chunk.end - chunk.start);
                    lastResponse = chunkResponse;
                    if (isUploadComplete(chunkResponse)) {
                        finalResponse = chunkResponse;
                    }
                    if (onProgress && typeof onProgress === 'function') {
                        onProgress({
                            $id: uploadId,
                            progress: Math.round((uploadedBytes / file.size) * 100),
                            sizeUploaded: uploadedBytes,
                            chunksTotal: totalChunks,
                            chunksUploaded: completedCount
                        });
                    }
                    return chunkResponse;
                });
                yield new Promise((resolve, reject) => {
                    let nextChunk = 0;
                    let inFlight = 0;
                    let completed = 0;
                    const uploadNext = () => {
                        if (rejected) {
                            return;
                        }
                        if (completed === chunks.length) {
                            resolve();
                            return;
                        }
                        while (inFlight < CONCURRENCY && nextChunk < chunks.length) {
                            const chunk = chunks[nextChunk++];
                            inFlight++;
                            uploadChunk(chunk)
                                .then(() => {
                                inFlight--;
                                completed++;
                                uploadNext();
                            })
                                .catch((error) => {
                                rejected = true;
                                reject(error);
                            });
                        }
                    };
                    uploadNext();
                });
                return finalResponse !== null && finalResponse !== void 0 ? finalResponse : lastResponse;
            });
        }
        ping() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.call('GET', new URL(this.config.endpoint + '/ping'), {
                    'X-Appwrite-Project': this.config.project,
                    'accept': 'application/json',
                });
            });
        }
        call(method_1, url_1) {
            return __awaiter(this, arguments, void 0, function* (method, url, headers = {}, params = {}, responseType = 'json') {
                var _a, _b, _c;
                const { uri, options } = this.prepareRequest(method, url, headers, params);
                let data = null;
                const response = yield fetch(uri, options);
                // type opaque: No-CORS, different-origin response (CORS-issue)
                if (response.type === 'opaque') {
                    throw new AppwriteException(`Invalid Origin. Register your new client (${window.location.host}) as a new Web platform on your project console dashboard`, 403, "forbidden", "");
                }
                const warnings = response.headers.get('x-appwrite-warning');
                if (warnings) {
                    warnings.split(';').forEach((warning) => console.warn('Warning: ' + warning));
                }
                if ((_a = response.headers.get('content-type')) === null || _a === void 0 ? void 0 : _a.includes('application/json')) {
                    data = JSONbig.parse(yield response.text());
                }
                else if (responseType === 'arrayBuffer') {
                    data = yield response.arrayBuffer();
                }
                else {
                    data = {
                        message: yield response.text()
                    };
                }
                if (400 <= response.status) {
                    let responseText = '';
                    if (((_b = response.headers.get('content-type')) === null || _b === void 0 ? void 0 : _b.includes('application/json')) || responseType === 'arrayBuffer') {
                        responseText = JSONbig.stringify(data);
                    }
                    else {
                        responseText = data === null || data === void 0 ? void 0 : data.message;
                    }
                    throw new AppwriteException((_c = data === null || data === void 0 ? void 0 : data.message) !== null && _c !== void 0 ? _c : responseText, response.status, data === null || data === void 0 ? void 0 : data.type, responseText);
                }
                const cookieFallback = response.headers.get('X-Fallback-Cookies');
                if (typeof window !== 'undefined' && window.localStorage && cookieFallback) {
                    window.console.warn('Appwrite is using localStorage for session management. Increase your security by adding a custom domain as your API endpoint.');
                    window.localStorage.setItem('cookieFallback', cookieFallback);
                }
                if (data && typeof data === 'object') {
                    Object.defineProperty(data, 'toString', {
                        value: () => JSONbig.stringify(data),
                        writable: true,
                        enumerable: false,
                        configurable: true,
                    });
                }
                return data;
            });
        }
        static flatten(data, prefix = '') {
            let output = {};
            for (const [key, value] of Object.entries(data)) {
                let finalKey = prefix ? prefix + '[' + key + ']' : key;
                if (Array.isArray(value)) {
                    output = Object.assign(Object.assign({}, output), Client.flatten(value, finalKey));
                }
                else {
                    output[finalKey] = value;
                }
            }
            return output;
        }
    }
    Client.CHUNK_SIZE = 1024 * 1024 * 5;

    class Service {
        constructor(client) {
            this.client = client;
        }
        static flatten(data, prefix = '') {
            let output = {};
            for (const [key, value] of Object.entries(data)) {
                let finalKey = prefix ? prefix + '[' + key + ']' : key;
                if (Array.isArray(value)) {
                    output = Object.assign(Object.assign({}, output), Service.flatten(value, finalKey));
                }
                else {
                    output[finalKey] = value;
                }
            }
            return output;
        }
    }
    /**
     * The size for chunked uploads in bytes.
     */
    Service.CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

    class Account {
        constructor(client) {
            this.client = client;
        }
        /**
         * Get the currently logged in user.
         *
         * @throws {AppwriteException}
         * @returns {Promise<Models.User<Preferences>>}
         */
        get() {
            const apiPath = '/account';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        create(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    userId: paramsOrFirst,
                    email: rest[0],
                    password: rest[1],
                    name: rest[2]
                };
            }
            const userId = params.userId;
            const email = params.email;
            const password = params.password;
            const name = params.name;
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof email === 'undefined') {
                throw new AppwriteException('Missing required parameter: "email"');
            }
            if (typeof password === 'undefined') {
                throw new AppwriteException('Missing required parameter: "password"');
            }
            const apiPath = '/account';
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof email !== 'undefined') {
                payload['email'] = email;
            }
            if (typeof password !== 'undefined') {
                payload['password'] = password;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
        updateEmail(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    email: paramsOrFirst,
                    password: rest[0]
                };
            }
            const email = params.email;
            const password = params.password;
            if (typeof email === 'undefined') {
                throw new AppwriteException('Missing required parameter: "email"');
            }
            if (typeof password === 'undefined') {
                throw new AppwriteException('Missing required parameter: "password"');
            }
            const apiPath = '/account/email';
            const payload = {};
            if (typeof email !== 'undefined') {
                payload['email'] = email;
            }
            if (typeof password !== 'undefined') {
                payload['password'] = password;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('patch', uri, apiHeaders, payload);
        }
        listIdentities(paramsOrFirst, ...rest) {
            let params;
            if (!paramsOrFirst || (paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    queries: paramsOrFirst,
                    total: rest[0]
                };
            }
            const queries = params.queries;
            const total = params.total;
            const apiPath = '/account/identities';
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            if (typeof total !== 'undefined') {
                payload['total'] = total;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        deleteIdentity(paramsOrFirst) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    identityId: paramsOrFirst
                };
            }
            const identityId = params.identityId;
            if (typeof identityId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "identityId"');
            }
            const apiPath = '/account/identities/{identityId}'.replace('{identityId}', encodeURIComponent(String(identityId)));
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
            };
            return this.client.call('delete', uri, apiHeaders, payload);
        }
        createJWT(paramsOrFirst) {
            let params;
            if (!paramsOrFirst || (paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    duration: paramsOrFirst
                };
            }
            const duration = params.duration;
            const apiPath = '/account/jwts';
            const payload = {};
            if (typeof duration !== 'undefined') {
                payload['duration'] = duration;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
        listLogs(paramsOrFirst, ...rest) {
            let params;
            if (!paramsOrFirst || (paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    queries: paramsOrFirst,
                    total: rest[0]
                };
            }
            const queries = params.queries;
            const total = params.total;
            const apiPath = '/account/logs';
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            if (typeof total !== 'undefined') {
                payload['total'] = total;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        updateMFA(paramsOrFirst) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    mfa: paramsOrFirst
                };
            }
            const mfa = params.mfa;
            if (typeof mfa === 'undefined') {
                throw new AppwriteException('Missing required parameter: "mfa"');
            }
            const apiPath = '/account/mfa';
            const payload = {};
            if (typeof mfa !== 'undefined') {
                payload['mfa'] = mfa;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('patch', uri, apiHeaders, payload);
        }
        createMfaAuthenticator(paramsOrFirst) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst) && ('type' in paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    type: paramsOrFirst
                };
            }
            const type = params.type;
            if (typeof type === 'undefined') {
                throw new AppwriteException('Missing required parameter: "type"');
            }
            const apiPath = '/account/mfa/authenticators/{type}'.replace('{type}', encodeURIComponent(String(type)));
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
        createMFAAuthenticator(paramsOrFirst) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst) && ('type' in paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    type: paramsOrFirst
                };
            }
            const type = params.type;
            if (typeof type === 'undefined') {
                throw new AppwriteException('Missing required parameter: "type"');
            }
            const apiPath = '/account/mfa/authenticators/{type}'.replace('{type}', encodeURIComponent(String(type)));
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
        updateMfaAuthenticator(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst) && ('type' in paramsOrFirst || 'otp' in paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    type: paramsOrFirst,
                    otp: rest[0]
                };
            }
            const type = params.type;
            const otp = params.otp;
            if (typeof type === 'undefined') {
                throw new AppwriteException('Missing required parameter: "type"');
            }
            if (typeof otp === 'undefined') {
                throw new AppwriteException('Missing required parameter: "otp"');
            }
            const apiPath = '/account/mfa/authenticators/{type}'.replace('{type}', encodeURIComponent(String(type)));
            const payload = {};
            if (typeof otp !== 'undefined') {
                payload['otp'] = otp;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('put', uri, apiHeaders, payload);
        }
        updateMFAAuthenticator(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst) && ('type' in paramsOrFirst || 'otp' in paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    type: paramsOrFirst,
                    otp: rest[0]
                };
            }
            const type = params.type;
            const otp = params.otp;
            if (typeof type === 'undefined') {
                throw new AppwriteException('Missing required parameter: "type"');
            }
            if (typeof otp === 'undefined') {
                throw new AppwriteException('Missing required parameter: "otp"');
            }
            const apiPath = '/account/mfa/authenticators/{type}'.replace('{type}', encodeURIComponent(String(type)));
            const payload = {};
            if (typeof otp !== 'undefined') {
                payload['otp'] = otp;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('put', uri, apiHeaders, payload);
        }
        deleteMfaAuthenticator(paramsOrFirst) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst) && ('type' in paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    type: paramsOrFirst
                };
            }
            const type = params.type;
            if (typeof type === 'undefined') {
                throw new AppwriteException('Missing required parameter: "type"');
            }
            const apiPath = '/account/mfa/authenticators/{type}'.replace('{type}', encodeURIComponent(String(type)));
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
            };
            return this.client.call('delete', uri, apiHeaders, payload);
        }
        deleteMFAAuthenticator(paramsOrFirst) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst) && ('type' in paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    type: paramsOrFirst
                };
            }
            const type = params.type;
            if (typeof type === 'undefined') {
                throw new AppwriteException('Missing required parameter: "type"');
            }
            const apiPath = '/account/mfa/authenticators/{type}'.replace('{type}', encodeURIComponent(String(type)));
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
            };
            return this.client.call('delete', uri, apiHeaders, payload);
        }
        createMfaChallenge(paramsOrFirst) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst) && ('factor' in paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    factor: paramsOrFirst
                };
            }
            const factor = params.factor;
            if (typeof factor === 'undefined') {
                throw new AppwriteException('Missing required parameter: "factor"');
            }
            const apiPath = '/account/mfa/challenges';
            const payload = {};
            if (typeof factor !== 'undefined') {
                payload['factor'] = factor;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
        createMFAChallenge(paramsOrFirst) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst) && ('factor' in paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    factor: paramsOrFirst
                };
            }
            const factor = params.factor;
            if (typeof factor === 'undefined') {
                throw new AppwriteException('Missing required parameter: "factor"');
            }
            const apiPath = '/account/mfa/challenges';
            const payload = {};
            if (typeof factor !== 'undefined') {
                payload['factor'] = factor;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
        updateMfaChallenge(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    challengeId: paramsOrFirst,
                    otp: rest[0]
                };
            }
            const challengeId = params.challengeId;
            const otp = params.otp;
            if (typeof challengeId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "challengeId"');
            }
            if (typeof otp === 'undefined') {
                throw new AppwriteException('Missing required parameter: "otp"');
            }
            const apiPath = '/account/mfa/challenges';
            const payload = {};
            if (typeof challengeId !== 'undefined') {
                payload['challengeId'] = challengeId;
            }
            if (typeof otp !== 'undefined') {
                payload['otp'] = otp;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('put', uri, apiHeaders, payload);
        }
        updateMFAChallenge(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    challengeId: paramsOrFirst,
                    otp: rest[0]
                };
            }
            const challengeId = params.challengeId;
            const otp = params.otp;
            if (typeof challengeId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "challengeId"');
            }
            if (typeof otp === 'undefined') {
                throw new AppwriteException('Missing required parameter: "otp"');
            }
            const apiPath = '/account/mfa/challenges';
            const payload = {};
            if (typeof challengeId !== 'undefined') {
                payload['challengeId'] = challengeId;
            }
            if (typeof otp !== 'undefined') {
                payload['otp'] = otp;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('put', uri, apiHeaders, payload);
        }
        /**
         * List the factors available on the account to be used as a MFA challange.
         *
         * @throws {AppwriteException}
         * @returns {Promise<Models.MfaFactors>}
         * @deprecated This API has been deprecated since 1.8.0. Please use `Account.listMFAFactors` instead.
         */
        listMfaFactors() {
            const apiPath = '/account/mfa/factors';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        /**
         * List the factors available on the account to be used as a MFA challange.
         *
         * @throws {AppwriteException}
         * @returns {Promise<Models.MfaFactors>}
         */
        listMFAFactors() {
            const apiPath = '/account/mfa/factors';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        /**
         * Get recovery codes that can be used as backup for MFA flow. Before getting codes, they must be generated using [createMfaRecoveryCodes](/docs/references/cloud/client-web/account#createMfaRecoveryCodes) method. An OTP challenge is required to read recovery codes.
         *
         * @throws {AppwriteException}
         * @returns {Promise<Models.MfaRecoveryCodes>}
         * @deprecated This API has been deprecated since 1.8.0. Please use `Account.getMFARecoveryCodes` instead.
         */
        getMfaRecoveryCodes() {
            const apiPath = '/account/mfa/recovery-codes';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        /**
         * Get recovery codes that can be used as backup for MFA flow. Before getting codes, they must be generated using [createMfaRecoveryCodes](/docs/references/cloud/client-web/account#createMfaRecoveryCodes) method. An OTP challenge is required to read recovery codes.
         *
         * @throws {AppwriteException}
         * @returns {Promise<Models.MfaRecoveryCodes>}
         */
        getMFARecoveryCodes() {
            const apiPath = '/account/mfa/recovery-codes';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        /**
         * Generate recovery codes as backup for MFA flow. It's recommended to generate and show then immediately after user successfully adds their authehticator. Recovery codes can be used as a MFA verification type in [createMfaChallenge](/docs/references/cloud/client-web/account#createMfaChallenge) method.
         *
         * @throws {AppwriteException}
         * @returns {Promise<Models.MfaRecoveryCodes>}
         * @deprecated This API has been deprecated since 1.8.0. Please use `Account.createMFARecoveryCodes` instead.
         */
        createMfaRecoveryCodes() {
            const apiPath = '/account/mfa/recovery-codes';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
        /**
         * Generate recovery codes as backup for MFA flow. It's recommended to generate and show then immediately after user successfully adds their authehticator. Recovery codes can be used as a MFA verification type in [createMfaChallenge](/docs/references/cloud/client-web/account#createMfaChallenge) method.
         *
         * @throws {AppwriteException}
         * @returns {Promise<Models.MfaRecoveryCodes>}
         */
        createMFARecoveryCodes() {
            const apiPath = '/account/mfa/recovery-codes';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
        /**
         * Regenerate recovery codes that can be used as backup for MFA flow. Before regenerating codes, they must be first generated using [createMfaRecoveryCodes](/docs/references/cloud/client-web/account#createMfaRecoveryCodes) method. An OTP challenge is required to regenreate recovery codes.
         *
         * @throws {AppwriteException}
         * @returns {Promise<Models.MfaRecoveryCodes>}
         * @deprecated This API has been deprecated since 1.8.0. Please use `Account.updateMFARecoveryCodes` instead.
         */
        updateMfaRecoveryCodes() {
            const apiPath = '/account/mfa/recovery-codes';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('patch', uri, apiHeaders, payload);
        }
        /**
         * Regenerate recovery codes that can be used as backup for MFA flow. Before regenerating codes, they must be first generated using [createMfaRecoveryCodes](/docs/references/cloud/client-web/account#createMfaRecoveryCodes) method. An OTP challenge is required to regenreate recovery codes.
         *
         * @throws {AppwriteException}
         * @returns {Promise<Models.MfaRecoveryCodes>}
         */
        updateMFARecoveryCodes() {
            const apiPath = '/account/mfa/recovery-codes';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('patch', uri, apiHeaders, payload);
        }
        updateName(paramsOrFirst) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    name: paramsOrFirst
                };
            }
            const name = params.name;
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            const apiPath = '/account/name';
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('patch', uri, apiHeaders, payload);
        }
        updatePassword(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    password: paramsOrFirst,
                    oldPassword: rest[0]
                };
            }
            const password = params.password;
            const oldPassword = params.oldPassword;
            if (typeof password === 'undefined') {
                throw new AppwriteException('Missing required parameter: "password"');
            }
            const apiPath = '/account/password';
            const payload = {};
            if (typeof password !== 'undefined') {
                payload['password'] = password;
            }
            if (typeof oldPassword !== 'undefined') {
                payload['oldPassword'] = oldPassword;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('patch', uri, apiHeaders, payload);
        }
        updatePhone(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    phone: paramsOrFirst,
                    password: rest[0]
                };
            }
            const phone = params.phone;
            const password = params.password;
            if (typeof phone === 'undefined') {
                throw new AppwriteException('Missing required parameter: "phone"');
            }
            if (typeof password === 'undefined') {
                throw new AppwriteException('Missing required parameter: "password"');
            }
            const apiPath = '/account/phone';
            const payload = {};
            if (typeof phone !== 'undefined') {
                payload['phone'] = phone;
            }
            if (typeof password !== 'undefined') {
                payload['password'] = password;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('patch', uri, apiHeaders, payload);
        }
        /**
         * Get the preferences as a key-value object for the currently logged in user.
         *
         * @throws {AppwriteException}
         * @returns {Promise<Preferences>}
         */
        getPrefs() {
            const apiPath = '/account/prefs';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        updatePrefs(paramsOrFirst) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst) && ('prefs' in paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    prefs: paramsOrFirst
                };
            }
            const prefs = params.prefs;
            if (typeof prefs === 'undefined') {
                throw new AppwriteException('Missing required parameter: "prefs"');
            }
            const apiPath = '/account/prefs';
            const payload = {};
            if (typeof prefs !== 'undefined') {
                payload['prefs'] = prefs;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('patch', uri, apiHeaders, payload);
        }
        createRecovery(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    email: paramsOrFirst,
                    url: rest[0]
                };
            }
            const email = params.email;
            const url = params.url;
            if (typeof email === 'undefined') {
                throw new AppwriteException('Missing required parameter: "email"');
            }
            if (typeof url === 'undefined') {
                throw new AppwriteException('Missing required parameter: "url"');
            }
            const apiPath = '/account/recovery';
            const payload = {};
            if (typeof email !== 'undefined') {
                payload['email'] = email;
            }
            if (typeof url !== 'undefined') {
                payload['url'] = url;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
        updateRecovery(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    userId: paramsOrFirst,
                    secret: rest[0],
                    password: rest[1]
                };
            }
            const userId = params.userId;
            const secret = params.secret;
            const password = params.password;
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof secret === 'undefined') {
                throw new AppwriteException('Missing required parameter: "secret"');
            }
            if (typeof password === 'undefined') {
                throw new AppwriteException('Missing required parameter: "password"');
            }
            const apiPath = '/account/recovery';
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof secret !== 'undefined') {
                payload['secret'] = secret;
            }
            if (typeof password !== 'undefined') {
                payload['password'] = password;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('put', uri, apiHeaders, payload);
        }
        /**
         * Get the list of active sessions across different devices for the currently logged in user.
         *
         * @throws {AppwriteException}
         * @returns {Promise<Models.SessionList>}
         */
        listSessions() {
            const apiPath = '/account/sessions';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        /**
         * Delete all sessions from the user account and remove any sessions cookies from the end client.
         *
         * @throws {AppwriteException}
         * @returns {Promise<{}>}
         */
        deleteSessions() {
            const apiPath = '/account/sessions';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
            };
            return this.client.call('delete', uri, apiHeaders, payload);
        }
        /**
         * Use this endpoint to allow a new user to register an anonymous account in your project. This route will also create a new session for the user. To allow the new user to convert an anonymous account to a normal account, you need to update its [email and password](https://appwrite.io/docs/references/cloud/client-web/account#updateEmail) or create an [OAuth2 session](https://appwrite.io/docs/references/cloud/client-web/account#CreateOAuth2Session).
         *
         * @throws {AppwriteException}
         * @returns {Promise<Models.Session>}
         */
        createAnonymousSession() {
            const apiPath = '/account/sessions/anonymous';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
        createEmailPasswordSession(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    email: paramsOrFirst,
                    password: rest[0]
                };
            }
            const email = params.email;
            const password = params.password;
            if (typeof email === 'undefined') {
                throw new AppwriteException('Missing required parameter: "email"');
            }
            if (typeof password === 'undefined') {
                throw new AppwriteException('Missing required parameter: "password"');
            }
            const apiPath = '/account/sessions/email';
            const payload = {};
            if (typeof email !== 'undefined') {
                payload['email'] = email;
            }
            if (typeof password !== 'undefined') {
                payload['password'] = password;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
        updateMagicURLSession(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    userId: paramsOrFirst,
                    secret: rest[0]
                };
            }
            const userId = params.userId;
            const secret = params.secret;
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof secret === 'undefined') {
                throw new AppwriteException('Missing required parameter: "secret"');
            }
            const apiPath = '/account/sessions/magic-url';
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof secret !== 'undefined') {
                payload['secret'] = secret;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('put', uri, apiHeaders, payload);
        }
        createOAuth2Session(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst) && ('provider' in paramsOrFirst || 'success' in paramsOrFirst || 'failure' in paramsOrFirst || 'scopes' in paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    provider: paramsOrFirst,
                    success: rest[0],
                    failure: rest[1],
                    scopes: rest[2]
                };
            }
            const provider = params.provider;
            const success = params.success;
            const failure = params.failure;
            const scopes = params.scopes;
            if (typeof provider === 'undefined') {
                throw new AppwriteException('Missing required parameter: "provider"');
            }
            const apiPath = '/account/sessions/oauth2/{provider}'.replace('{provider}', encodeURIComponent(String(provider)));
            const payload = {};
            if (typeof success !== 'undefined') {
                payload['success'] = success;
            }
            if (typeof failure !== 'undefined') {
                payload['failure'] = failure;
            }
            if (typeof scopes !== 'undefined') {
                payload['scopes'] = scopes;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            ({
                'X-Appwrite-Project': this.client.config.project});
            payload['project'] = this.client.config.project;
            for (const [key, value] of Object.entries(Service.flatten(payload))) {
                uri.searchParams.append(key, value);
            }
            if (typeof window !== 'undefined' && (window === null || window === void 0 ? void 0 : window.location)) {
                window.location.href = uri.toString();
                return;
            }
            else {
                return uri.toString();
            }
        }
        updatePhoneSession(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    userId: paramsOrFirst,
                    secret: rest[0]
                };
            }
            const userId = params.userId;
            const secret = params.secret;
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof secret === 'undefined') {
                throw new AppwriteException('Missing required parameter: "secret"');
            }
            const apiPath = '/account/sessions/phone';
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof secret !== 'undefined') {
                payload['secret'] = secret;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('put', uri, apiHeaders, payload);
        }
        createSession(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    userId: paramsOrFirst,
                    secret: rest[0]
                };
            }
            const userId = params.userId;
            const secret = params.secret;
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof secret === 'undefined') {
                throw new AppwriteException('Missing required parameter: "secret"');
            }
            const apiPath = '/account/sessions/token';
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof secret !== 'undefined') {
                payload['secret'] = secret;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
        getSession(paramsOrFirst) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    sessionId: paramsOrFirst
                };
            }
            const sessionId = params.sessionId;
            if (typeof sessionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "sessionId"');
            }
            const apiPath = '/account/sessions/{sessionId}'.replace('{sessionId}', encodeURIComponent(String(sessionId)));
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        updateSession(paramsOrFirst) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    sessionId: paramsOrFirst
                };
            }
            const sessionId = params.sessionId;
            if (typeof sessionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "sessionId"');
            }
            const apiPath = '/account/sessions/{sessionId}'.replace('{sessionId}', encodeURIComponent(String(sessionId)));
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('patch', uri, apiHeaders, payload);
        }
        deleteSession(paramsOrFirst) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    sessionId: paramsOrFirst
                };
            }
            const sessionId = params.sessionId;
            if (typeof sessionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "sessionId"');
            }
            const apiPath = '/account/sessions/{sessionId}'.replace('{sessionId}', encodeURIComponent(String(sessionId)));
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
            };
            return this.client.call('delete', uri, apiHeaders, payload);
        }
        /**
         * Block the currently logged in user account. Behind the scene, the user record is not deleted but permanently blocked from any access. To completely delete a user, use the Users API instead.
         *
         * @throws {AppwriteException}
         * @returns {Promise<Models.User<Preferences>>}
         */
        updateStatus() {
            const apiPath = '/account/status';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('patch', uri, apiHeaders, payload);
        }
        createPushTarget(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    targetId: paramsOrFirst,
                    identifier: rest[0],
                    providerId: rest[1]
                };
            }
            const targetId = params.targetId;
            const identifier = params.identifier;
            const providerId = params.providerId;
            if (typeof targetId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "targetId"');
            }
            if (typeof identifier === 'undefined') {
                throw new AppwriteException('Missing required parameter: "identifier"');
            }
            const apiPath = '/account/targets/push';
            const payload = {};
            if (typeof targetId !== 'undefined') {
                payload['targetId'] = targetId;
            }
            if (typeof identifier !== 'undefined') {
                payload['identifier'] = identifier;
            }
            if (typeof providerId !== 'undefined') {
                payload['providerId'] = providerId;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
        updatePushTarget(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    targetId: paramsOrFirst,
                    identifier: rest[0]
                };
            }
            const targetId = params.targetId;
            const identifier = params.identifier;
            if (typeof targetId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "targetId"');
            }
            if (typeof identifier === 'undefined') {
                throw new AppwriteException('Missing required parameter: "identifier"');
            }
            const apiPath = '/account/targets/{targetId}/push'.replace('{targetId}', encodeURIComponent(String(targetId)));
            const payload = {};
            if (typeof identifier !== 'undefined') {
                payload['identifier'] = identifier;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('put', uri, apiHeaders, payload);
        }
        deletePushTarget(paramsOrFirst) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    targetId: paramsOrFirst
                };
            }
            const targetId = params.targetId;
            if (typeof targetId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "targetId"');
            }
            const apiPath = '/account/targets/{targetId}/push'.replace('{targetId}', encodeURIComponent(String(targetId)));
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
            };
            return this.client.call('delete', uri, apiHeaders, payload);
        }
        createEmailToken(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    userId: paramsOrFirst,
                    email: rest[0],
                    phrase: rest[1]
                };
            }
            const userId = params.userId;
            const email = params.email;
            const phrase = params.phrase;
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof email === 'undefined') {
                throw new AppwriteException('Missing required parameter: "email"');
            }
            const apiPath = '/account/tokens/email';
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof email !== 'undefined') {
                payload['email'] = email;
            }
            if (typeof phrase !== 'undefined') {
                payload['phrase'] = phrase;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
        createMagicURLToken(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    userId: paramsOrFirst,
                    email: rest[0],
                    url: rest[1],
                    phrase: rest[2]
                };
            }
            const userId = params.userId;
            const email = params.email;
            const url = params.url;
            const phrase = params.phrase;
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof email === 'undefined') {
                throw new AppwriteException('Missing required parameter: "email"');
            }
            const apiPath = '/account/tokens/magic-url';
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof email !== 'undefined') {
                payload['email'] = email;
            }
            if (typeof url !== 'undefined') {
                payload['url'] = url;
            }
            if (typeof phrase !== 'undefined') {
                payload['phrase'] = phrase;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
        createOAuth2Token(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst) && ('provider' in paramsOrFirst || 'success' in paramsOrFirst || 'failure' in paramsOrFirst || 'scopes' in paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    provider: paramsOrFirst,
                    success: rest[0],
                    failure: rest[1],
                    scopes: rest[2]
                };
            }
            const provider = params.provider;
            const success = params.success;
            const failure = params.failure;
            const scopes = params.scopes;
            if (typeof provider === 'undefined') {
                throw new AppwriteException('Missing required parameter: "provider"');
            }
            const apiPath = '/account/tokens/oauth2/{provider}'.replace('{provider}', encodeURIComponent(String(provider)));
            const payload = {};
            if (typeof success !== 'undefined') {
                payload['success'] = success;
            }
            if (typeof failure !== 'undefined') {
                payload['failure'] = failure;
            }
            if (typeof scopes !== 'undefined') {
                payload['scopes'] = scopes;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            ({
                'X-Appwrite-Project': this.client.config.project});
            payload['project'] = this.client.config.project;
            for (const [key, value] of Object.entries(Service.flatten(payload))) {
                uri.searchParams.append(key, value);
            }
            if (typeof window !== 'undefined' && (window === null || window === void 0 ? void 0 : window.location)) {
                window.location.href = uri.toString();
                return;
            }
            else {
                return uri.toString();
            }
        }
        createPhoneToken(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    userId: paramsOrFirst,
                    phone: rest[0]
                };
            }
            const userId = params.userId;
            const phone = params.phone;
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof phone === 'undefined') {
                throw new AppwriteException('Missing required parameter: "phone"');
            }
            const apiPath = '/account/tokens/phone';
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof phone !== 'undefined') {
                payload['phone'] = phone;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
        createEmailVerification(paramsOrFirst) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    url: paramsOrFirst
                };
            }
            const url = params.url;
            if (typeof url === 'undefined') {
                throw new AppwriteException('Missing required parameter: "url"');
            }
            const apiPath = '/account/verifications/email';
            const payload = {};
            if (typeof url !== 'undefined') {
                payload['url'] = url;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
        createVerification(paramsOrFirst) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    url: paramsOrFirst
                };
            }
            const url = params.url;
            if (typeof url === 'undefined') {
                throw new AppwriteException('Missing required parameter: "url"');
            }
            const apiPath = '/account/verifications/email';
            const payload = {};
            if (typeof url !== 'undefined') {
                payload['url'] = url;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
        updateEmailVerification(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    userId: paramsOrFirst,
                    secret: rest[0]
                };
            }
            const userId = params.userId;
            const secret = params.secret;
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof secret === 'undefined') {
                throw new AppwriteException('Missing required parameter: "secret"');
            }
            const apiPath = '/account/verifications/email';
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof secret !== 'undefined') {
                payload['secret'] = secret;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('put', uri, apiHeaders, payload);
        }
        updateVerification(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    userId: paramsOrFirst,
                    secret: rest[0]
                };
            }
            const userId = params.userId;
            const secret = params.secret;
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof secret === 'undefined') {
                throw new AppwriteException('Missing required parameter: "secret"');
            }
            const apiPath = '/account/verifications/email';
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof secret !== 'undefined') {
                payload['secret'] = secret;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('put', uri, apiHeaders, payload);
        }
        /**
         * Use this endpoint to send a verification SMS to the currently logged in user. This endpoint is meant for use after updating a user's phone number using the [accountUpdatePhone](https://appwrite.io/docs/references/cloud/client-web/account#updatePhone) endpoint. Learn more about how to [complete the verification process](https://appwrite.io/docs/references/cloud/client-web/account#updatePhoneVerification). The verification code sent to the user's phone number is valid for 15 minutes.
         *
         * @throws {AppwriteException}
         * @returns {Promise<Models.Token>}
         */
        createPhoneVerification() {
            const apiPath = '/account/verifications/phone';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
        updatePhoneVerification(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    userId: paramsOrFirst,
                    secret: rest[0]
                };
            }
            const userId = params.userId;
            const secret = params.secret;
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof secret === 'undefined') {
                throw new AppwriteException('Missing required parameter: "secret"');
            }
            const apiPath = '/account/verifications/phone';
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof secret !== 'undefined') {
                payload['secret'] = secret;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('put', uri, apiHeaders, payload);
        }
    }

    class Avatars {
        constructor(client) {
            this.client = client;
        }
        getBrowser(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst) && ('code' in paramsOrFirst || 'width' in paramsOrFirst || 'height' in paramsOrFirst || 'quality' in paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    code: paramsOrFirst,
                    width: rest[0],
                    height: rest[1],
                    quality: rest[2]
                };
            }
            const code = params.code;
            const width = params.width;
            const height = params.height;
            const quality = params.quality;
            if (typeof code === 'undefined') {
                throw new AppwriteException('Missing required parameter: "code"');
            }
            const apiPath = '/avatars/browsers/{code}'.replace('{code}', encodeURIComponent(String(code)));
            const payload = {};
            if (typeof width !== 'undefined') {
                payload['width'] = width;
            }
            if (typeof height !== 'undefined') {
                payload['height'] = height;
            }
            if (typeof quality !== 'undefined') {
                payload['quality'] = quality;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            ({
                'X-Appwrite-Project': this.client.config.project});
            payload['project'] = this.client.config.project;
            payload['impersonateuserid'] = this.client.config.impersonateuserid;
            for (const [key, value] of Object.entries(Service.flatten(payload))) {
                uri.searchParams.append(key, value);
            }
            return uri.toString();
        }
        getCreditCard(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst) && ('code' in paramsOrFirst || 'width' in paramsOrFirst || 'height' in paramsOrFirst || 'quality' in paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    code: paramsOrFirst,
                    width: rest[0],
                    height: rest[1],
                    quality: rest[2]
                };
            }
            const code = params.code;
            const width = params.width;
            const height = params.height;
            const quality = params.quality;
            if (typeof code === 'undefined') {
                throw new AppwriteException('Missing required parameter: "code"');
            }
            const apiPath = '/avatars/credit-cards/{code}'.replace('{code}', encodeURIComponent(String(code)));
            const payload = {};
            if (typeof width !== 'undefined') {
                payload['width'] = width;
            }
            if (typeof height !== 'undefined') {
                payload['height'] = height;
            }
            if (typeof quality !== 'undefined') {
                payload['quality'] = quality;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            ({
                'X-Appwrite-Project': this.client.config.project});
            payload['project'] = this.client.config.project;
            payload['impersonateuserid'] = this.client.config.impersonateuserid;
            for (const [key, value] of Object.entries(Service.flatten(payload))) {
                uri.searchParams.append(key, value);
            }
            return uri.toString();
        }
        getFavicon(paramsOrFirst) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    url: paramsOrFirst
                };
            }
            const url = params.url;
            if (typeof url === 'undefined') {
                throw new AppwriteException('Missing required parameter: "url"');
            }
            const apiPath = '/avatars/favicon';
            const payload = {};
            if (typeof url !== 'undefined') {
                payload['url'] = url;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            ({
                'X-Appwrite-Project': this.client.config.project});
            payload['project'] = this.client.config.project;
            payload['impersonateuserid'] = this.client.config.impersonateuserid;
            for (const [key, value] of Object.entries(Service.flatten(payload))) {
                uri.searchParams.append(key, value);
            }
            return uri.toString();
        }
        getFlag(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst) && ('code' in paramsOrFirst || 'width' in paramsOrFirst || 'height' in paramsOrFirst || 'quality' in paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    code: paramsOrFirst,
                    width: rest[0],
                    height: rest[1],
                    quality: rest[2]
                };
            }
            const code = params.code;
            const width = params.width;
            const height = params.height;
            const quality = params.quality;
            if (typeof code === 'undefined') {
                throw new AppwriteException('Missing required parameter: "code"');
            }
            const apiPath = '/avatars/flags/{code}'.replace('{code}', encodeURIComponent(String(code)));
            const payload = {};
            if (typeof width !== 'undefined') {
                payload['width'] = width;
            }
            if (typeof height !== 'undefined') {
                payload['height'] = height;
            }
            if (typeof quality !== 'undefined') {
                payload['quality'] = quality;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            ({
                'X-Appwrite-Project': this.client.config.project});
            payload['project'] = this.client.config.project;
            payload['impersonateuserid'] = this.client.config.impersonateuserid;
            for (const [key, value] of Object.entries(Service.flatten(payload))) {
                uri.searchParams.append(key, value);
            }
            return uri.toString();
        }
        getImage(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    url: paramsOrFirst,
                    width: rest[0],
                    height: rest[1]
                };
            }
            const url = params.url;
            const width = params.width;
            const height = params.height;
            if (typeof url === 'undefined') {
                throw new AppwriteException('Missing required parameter: "url"');
            }
            const apiPath = '/avatars/image';
            const payload = {};
            if (typeof url !== 'undefined') {
                payload['url'] = url;
            }
            if (typeof width !== 'undefined') {
                payload['width'] = width;
            }
            if (typeof height !== 'undefined') {
                payload['height'] = height;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            ({
                'X-Appwrite-Project': this.client.config.project});
            payload['project'] = this.client.config.project;
            payload['impersonateuserid'] = this.client.config.impersonateuserid;
            for (const [key, value] of Object.entries(Service.flatten(payload))) {
                uri.searchParams.append(key, value);
            }
            return uri.toString();
        }
        getInitials(paramsOrFirst, ...rest) {
            let params;
            if (!paramsOrFirst || (paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    name: paramsOrFirst,
                    width: rest[0],
                    height: rest[1],
                    background: rest[2]
                };
            }
            const name = params.name;
            const width = params.width;
            const height = params.height;
            const background = params.background;
            const apiPath = '/avatars/initials';
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof width !== 'undefined') {
                payload['width'] = width;
            }
            if (typeof height !== 'undefined') {
                payload['height'] = height;
            }
            if (typeof background !== 'undefined') {
                payload['background'] = background;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            ({
                'X-Appwrite-Project': this.client.config.project});
            payload['project'] = this.client.config.project;
            payload['impersonateuserid'] = this.client.config.impersonateuserid;
            for (const [key, value] of Object.entries(Service.flatten(payload))) {
                uri.searchParams.append(key, value);
            }
            return uri.toString();
        }
        getQR(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    text: paramsOrFirst,
                    size: rest[0],
                    margin: rest[1],
                    download: rest[2]
                };
            }
            const text = params.text;
            const size = params.size;
            const margin = params.margin;
            const download = params.download;
            if (typeof text === 'undefined') {
                throw new AppwriteException('Missing required parameter: "text"');
            }
            const apiPath = '/avatars/qr';
            const payload = {};
            if (typeof text !== 'undefined') {
                payload['text'] = text;
            }
            if (typeof size !== 'undefined') {
                payload['size'] = size;
            }
            if (typeof margin !== 'undefined') {
                payload['margin'] = margin;
            }
            if (typeof download !== 'undefined') {
                payload['download'] = download;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            ({
                'X-Appwrite-Project': this.client.config.project});
            payload['project'] = this.client.config.project;
            payload['impersonateuserid'] = this.client.config.impersonateuserid;
            for (const [key, value] of Object.entries(Service.flatten(payload))) {
                uri.searchParams.append(key, value);
            }
            return uri.toString();
        }
        getScreenshot(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    url: paramsOrFirst,
                    headers: rest[0],
                    viewportWidth: rest[1],
                    viewportHeight: rest[2],
                    scale: rest[3],
                    theme: rest[4],
                    userAgent: rest[5],
                    fullpage: rest[6],
                    locale: rest[7],
                    timezone: rest[8],
                    latitude: rest[9],
                    longitude: rest[10],
                    accuracy: rest[11],
                    touch: rest[12],
                    permissions: rest[13],
                    sleep: rest[14],
                    width: rest[15],
                    height: rest[16],
                    quality: rest[17],
                    output: rest[18]
                };
            }
            const url = params.url;
            const headers = params.headers;
            const viewportWidth = params.viewportWidth;
            const viewportHeight = params.viewportHeight;
            const scale = params.scale;
            const theme = params.theme;
            const userAgent = params.userAgent;
            const fullpage = params.fullpage;
            const locale = params.locale;
            const timezone = params.timezone;
            const latitude = params.latitude;
            const longitude = params.longitude;
            const accuracy = params.accuracy;
            const touch = params.touch;
            const permissions = params.permissions;
            const sleep = params.sleep;
            const width = params.width;
            const height = params.height;
            const quality = params.quality;
            const output = params.output;
            if (typeof url === 'undefined') {
                throw new AppwriteException('Missing required parameter: "url"');
            }
            const apiPath = '/avatars/screenshots';
            const payload = {};
            if (typeof url !== 'undefined') {
                payload['url'] = url;
            }
            if (typeof headers !== 'undefined') {
                payload['headers'] = headers;
            }
            if (typeof viewportWidth !== 'undefined') {
                payload['viewportWidth'] = viewportWidth;
            }
            if (typeof viewportHeight !== 'undefined') {
                payload['viewportHeight'] = viewportHeight;
            }
            if (typeof scale !== 'undefined') {
                payload['scale'] = scale;
            }
            if (typeof theme !== 'undefined') {
                payload['theme'] = theme;
            }
            if (typeof userAgent !== 'undefined') {
                payload['userAgent'] = userAgent;
            }
            if (typeof fullpage !== 'undefined') {
                payload['fullpage'] = fullpage;
            }
            if (typeof locale !== 'undefined') {
                payload['locale'] = locale;
            }
            if (typeof timezone !== 'undefined') {
                payload['timezone'] = timezone;
            }
            if (typeof latitude !== 'undefined') {
                payload['latitude'] = latitude;
            }
            if (typeof longitude !== 'undefined') {
                payload['longitude'] = longitude;
            }
            if (typeof accuracy !== 'undefined') {
                payload['accuracy'] = accuracy;
            }
            if (typeof touch !== 'undefined') {
                payload['touch'] = touch;
            }
            if (typeof permissions !== 'undefined') {
                payload['permissions'] = permissions;
            }
            if (typeof sleep !== 'undefined') {
                payload['sleep'] = sleep;
            }
            if (typeof width !== 'undefined') {
                payload['width'] = width;
            }
            if (typeof height !== 'undefined') {
                payload['height'] = height;
            }
            if (typeof quality !== 'undefined') {
                payload['quality'] = quality;
            }
            if (typeof output !== 'undefined') {
                payload['output'] = output;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            ({
                'X-Appwrite-Project': this.client.config.project});
            payload['project'] = this.client.config.project;
            payload['impersonateuserid'] = this.client.config.impersonateuserid;
            for (const [key, value] of Object.entries(Service.flatten(payload))) {
                uri.searchParams.append(key, value);
            }
            return uri.toString();
        }
    }

    class Databases {
        constructor(client) {
            this.client = client;
        }
        listTransactions(paramsOrFirst) {
            let params;
            if (!paramsOrFirst || (paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    queries: paramsOrFirst
                };
            }
            const queries = params.queries;
            const apiPath = '/databases/transactions';
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        createTransaction(paramsOrFirst) {
            let params;
            if (!paramsOrFirst || (paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    ttl: paramsOrFirst
                };
            }
            const ttl = params.ttl;
            const apiPath = '/databases/transactions';
            const payload = {};
            if (typeof ttl !== 'undefined') {
                payload['ttl'] = ttl;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
        getTransaction(paramsOrFirst) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    transactionId: paramsOrFirst
                };
            }
            const transactionId = params.transactionId;
            if (typeof transactionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "transactionId"');
            }
            const apiPath = '/databases/transactions/{transactionId}'.replace('{transactionId}', encodeURIComponent(String(transactionId)));
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        updateTransaction(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    transactionId: paramsOrFirst,
                    commit: rest[0],
                    rollback: rest[1]
                };
            }
            const transactionId = params.transactionId;
            const commit = params.commit;
            const rollback = params.rollback;
            if (typeof transactionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "transactionId"');
            }
            const apiPath = '/databases/transactions/{transactionId}'.replace('{transactionId}', encodeURIComponent(String(transactionId)));
            const payload = {};
            if (typeof commit !== 'undefined') {
                payload['commit'] = commit;
            }
            if (typeof rollback !== 'undefined') {
                payload['rollback'] = rollback;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('patch', uri, apiHeaders, payload);
        }
        deleteTransaction(paramsOrFirst) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    transactionId: paramsOrFirst
                };
            }
            const transactionId = params.transactionId;
            if (typeof transactionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "transactionId"');
            }
            const apiPath = '/databases/transactions/{transactionId}'.replace('{transactionId}', encodeURIComponent(String(transactionId)));
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
            };
            return this.client.call('delete', uri, apiHeaders, payload);
        }
        createOperations(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    transactionId: paramsOrFirst,
                    operations: rest[0]
                };
            }
            const transactionId = params.transactionId;
            const operations = params.operations;
            if (typeof transactionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "transactionId"');
            }
            const apiPath = '/databases/transactions/{transactionId}/operations'.replace('{transactionId}', encodeURIComponent(String(transactionId)));
            const payload = {};
            if (typeof operations !== 'undefined') {
                payload['operations'] = operations;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
        listDocuments(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    databaseId: paramsOrFirst,
                    collectionId: rest[0],
                    queries: rest[1],
                    transactionId: rest[2],
                    total: rest[3],
                    ttl: rest[4]
                };
            }
            const databaseId = params.databaseId;
            const collectionId = params.collectionId;
            const queries = params.queries;
            const transactionId = params.transactionId;
            const total = params.total;
            const ttl = params.ttl;
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/documents'.replace('{databaseId}', encodeURIComponent(String(databaseId))).replace('{collectionId}', encodeURIComponent(String(collectionId)));
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            if (typeof transactionId !== 'undefined') {
                payload['transactionId'] = transactionId;
            }
            if (typeof total !== 'undefined') {
                payload['total'] = total;
            }
            if (typeof ttl !== 'undefined') {
                payload['ttl'] = ttl;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        createDocument(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    databaseId: paramsOrFirst,
                    collectionId: rest[0],
                    documentId: rest[1],
                    data: rest[2],
                    permissions: rest[3],
                    transactionId: rest[4]
                };
            }
            const databaseId = params.databaseId;
            const collectionId = params.collectionId;
            const documentId = params.documentId;
            const data = params.data;
            const permissions = params.permissions;
            const transactionId = params.transactionId;
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof documentId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "documentId"');
            }
            if (typeof data === 'undefined') {
                throw new AppwriteException('Missing required parameter: "data"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/documents'.replace('{databaseId}', encodeURIComponent(String(databaseId))).replace('{collectionId}', encodeURIComponent(String(collectionId)));
            const payload = {};
            if (typeof documentId !== 'undefined') {
                payload['documentId'] = documentId;
            }
            if (typeof data !== 'undefined') {
                payload['data'] = data;
            }
            if (typeof permissions !== 'undefined') {
                payload['permissions'] = permissions;
            }
            if (typeof transactionId !== 'undefined') {
                payload['transactionId'] = transactionId;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
        getDocument(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    databaseId: paramsOrFirst,
                    collectionId: rest[0],
                    documentId: rest[1],
                    queries: rest[2],
                    transactionId: rest[3]
                };
            }
            const databaseId = params.databaseId;
            const collectionId = params.collectionId;
            const documentId = params.documentId;
            const queries = params.queries;
            const transactionId = params.transactionId;
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof documentId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "documentId"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/documents/{documentId}'.replace('{databaseId}', encodeURIComponent(String(databaseId))).replace('{collectionId}', encodeURIComponent(String(collectionId))).replace('{documentId}', encodeURIComponent(String(documentId)));
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            if (typeof transactionId !== 'undefined') {
                payload['transactionId'] = transactionId;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        upsertDocument(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    databaseId: paramsOrFirst,
                    collectionId: rest[0],
                    documentId: rest[1],
                    data: rest[2],
                    permissions: rest[3],
                    transactionId: rest[4]
                };
            }
            const databaseId = params.databaseId;
            const collectionId = params.collectionId;
            const documentId = params.documentId;
            const data = params.data;
            const permissions = params.permissions;
            const transactionId = params.transactionId;
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof documentId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "documentId"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/documents/{documentId}'.replace('{databaseId}', encodeURIComponent(String(databaseId))).replace('{collectionId}', encodeURIComponent(String(collectionId))).replace('{documentId}', encodeURIComponent(String(documentId)));
            const payload = {};
            if (typeof data !== 'undefined') {
                payload['data'] = data;
            }
            if (typeof permissions !== 'undefined') {
                payload['permissions'] = permissions;
            }
            if (typeof transactionId !== 'undefined') {
                payload['transactionId'] = transactionId;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('put', uri, apiHeaders, payload);
        }
        updateDocument(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    databaseId: paramsOrFirst,
                    collectionId: rest[0],
                    documentId: rest[1],
                    data: rest[2],
                    permissions: rest[3],
                    transactionId: rest[4]
                };
            }
            const databaseId = params.databaseId;
            const collectionId = params.collectionId;
            const documentId = params.documentId;
            const data = params.data;
            const permissions = params.permissions;
            const transactionId = params.transactionId;
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof documentId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "documentId"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/documents/{documentId}'.replace('{databaseId}', encodeURIComponent(String(databaseId))).replace('{collectionId}', encodeURIComponent(String(collectionId))).replace('{documentId}', encodeURIComponent(String(documentId)));
            const payload = {};
            if (typeof data !== 'undefined') {
                payload['data'] = data;
            }
            if (typeof permissions !== 'undefined') {
                payload['permissions'] = permissions;
            }
            if (typeof transactionId !== 'undefined') {
                payload['transactionId'] = transactionId;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('patch', uri, apiHeaders, payload);
        }
        deleteDocument(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    databaseId: paramsOrFirst,
                    collectionId: rest[0],
                    documentId: rest[1],
                    transactionId: rest[2]
                };
            }
            const databaseId = params.databaseId;
            const collectionId = params.collectionId;
            const documentId = params.documentId;
            const transactionId = params.transactionId;
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof documentId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "documentId"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/documents/{documentId}'.replace('{databaseId}', encodeURIComponent(String(databaseId))).replace('{collectionId}', encodeURIComponent(String(collectionId))).replace('{documentId}', encodeURIComponent(String(documentId)));
            const payload = {};
            if (typeof transactionId !== 'undefined') {
                payload['transactionId'] = transactionId;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
            };
            return this.client.call('delete', uri, apiHeaders, payload);
        }
        decrementDocumentAttribute(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    databaseId: paramsOrFirst,
                    collectionId: rest[0],
                    documentId: rest[1],
                    attribute: rest[2],
                    value: rest[3],
                    min: rest[4],
                    transactionId: rest[5]
                };
            }
            const databaseId = params.databaseId;
            const collectionId = params.collectionId;
            const documentId = params.documentId;
            const attribute = params.attribute;
            const value = params.value;
            const min = params.min;
            const transactionId = params.transactionId;
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof documentId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "documentId"');
            }
            if (typeof attribute === 'undefined') {
                throw new AppwriteException('Missing required parameter: "attribute"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/documents/{documentId}/{attribute}/decrement'.replace('{databaseId}', encodeURIComponent(String(databaseId))).replace('{collectionId}', encodeURIComponent(String(collectionId))).replace('{documentId}', encodeURIComponent(String(documentId))).replace('{attribute}', encodeURIComponent(String(attribute)));
            const payload = {};
            if (typeof value !== 'undefined') {
                payload['value'] = value;
            }
            if (typeof min !== 'undefined') {
                payload['min'] = min;
            }
            if (typeof transactionId !== 'undefined') {
                payload['transactionId'] = transactionId;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('patch', uri, apiHeaders, payload);
        }
        incrementDocumentAttribute(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    databaseId: paramsOrFirst,
                    collectionId: rest[0],
                    documentId: rest[1],
                    attribute: rest[2],
                    value: rest[3],
                    max: rest[4],
                    transactionId: rest[5]
                };
            }
            const databaseId = params.databaseId;
            const collectionId = params.collectionId;
            const documentId = params.documentId;
            const attribute = params.attribute;
            const value = params.value;
            const max = params.max;
            const transactionId = params.transactionId;
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof collectionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "collectionId"');
            }
            if (typeof documentId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "documentId"');
            }
            if (typeof attribute === 'undefined') {
                throw new AppwriteException('Missing required parameter: "attribute"');
            }
            const apiPath = '/databases/{databaseId}/collections/{collectionId}/documents/{documentId}/{attribute}/increment'.replace('{databaseId}', encodeURIComponent(String(databaseId))).replace('{collectionId}', encodeURIComponent(String(collectionId))).replace('{documentId}', encodeURIComponent(String(documentId))).replace('{attribute}', encodeURIComponent(String(attribute)));
            const payload = {};
            if (typeof value !== 'undefined') {
                payload['value'] = value;
            }
            if (typeof max !== 'undefined') {
                payload['max'] = max;
            }
            if (typeof transactionId !== 'undefined') {
                payload['transactionId'] = transactionId;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('patch', uri, apiHeaders, payload);
        }
    }

    class Functions {
        constructor(client) {
            this.client = client;
        }
        listExecutions(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    functionId: paramsOrFirst,
                    queries: rest[0],
                    total: rest[1]
                };
            }
            const functionId = params.functionId;
            const queries = params.queries;
            const total = params.total;
            if (typeof functionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "functionId"');
            }
            const apiPath = '/functions/{functionId}/executions'.replace('{functionId}', encodeURIComponent(String(functionId)));
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            if (typeof total !== 'undefined') {
                payload['total'] = total;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        createExecution(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    functionId: paramsOrFirst,
                    body: rest[0],
                    async: rest[1],
                    xpath: rest[2],
                    method: rest[3],
                    headers: rest[4],
                    scheduledAt: rest[5]
                };
            }
            const functionId = params.functionId;
            const body = params.body;
            const async = params.async;
            const xpath = params.xpath;
            const method = params.method;
            const headers = params.headers;
            const scheduledAt = params.scheduledAt;
            if (typeof functionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "functionId"');
            }
            const apiPath = '/functions/{functionId}/executions'.replace('{functionId}', encodeURIComponent(String(functionId)));
            const payload = {};
            if (typeof body !== 'undefined') {
                payload['body'] = body;
            }
            if (typeof async !== 'undefined') {
                payload['async'] = async;
            }
            if (typeof xpath !== 'undefined') {
                payload['path'] = xpath;
            }
            if (typeof method !== 'undefined') {
                payload['method'] = method;
            }
            if (typeof headers !== 'undefined') {
                payload['headers'] = headers;
            }
            if (typeof scheduledAt !== 'undefined') {
                payload['scheduledAt'] = scheduledAt;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
        getExecution(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    functionId: paramsOrFirst,
                    executionId: rest[0]
                };
            }
            const functionId = params.functionId;
            const executionId = params.executionId;
            if (typeof functionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "functionId"');
            }
            if (typeof executionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "executionId"');
            }
            const apiPath = '/functions/{functionId}/executions/{executionId}'.replace('{functionId}', encodeURIComponent(String(functionId))).replace('{executionId}', encodeURIComponent(String(executionId)));
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
    }

    class Graphql {
        constructor(client) {
            this.client = client;
        }
        query(paramsOrFirst) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst) && ('query' in paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    query: paramsOrFirst
                };
            }
            const query = params.query;
            if (typeof query === 'undefined') {
                throw new AppwriteException('Missing required parameter: "query"');
            }
            const apiPath = '/graphql';
            const payload = {};
            if (typeof query !== 'undefined') {
                payload['query'] = query;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'x-sdk-graphql': 'true',
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
        mutation(paramsOrFirst) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst) && ('query' in paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    query: paramsOrFirst
                };
            }
            const query = params.query;
            if (typeof query === 'undefined') {
                throw new AppwriteException('Missing required parameter: "query"');
            }
            const apiPath = '/graphql/mutation';
            const payload = {};
            if (typeof query !== 'undefined') {
                payload['query'] = query;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'x-sdk-graphql': 'true',
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
    }

    class Locale {
        constructor(client) {
            this.client = client;
        }
        /**
         * Get the current user location based on IP. Returns an object with user country code, country name, continent name, continent code, ip address and suggested currency. You can use the locale header to get the data in a supported language.
         *
         * ([IP Geolocation by DB-IP](https://db-ip.com))
         *
         * @throws {AppwriteException}
         * @returns {Promise<Models.Locale>}
         */
        get() {
            const apiPath = '/locale';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        /**
         * List of all locale codes in [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).
         *
         * @throws {AppwriteException}
         * @returns {Promise<Models.LocaleCodeList>}
         */
        listCodes() {
            const apiPath = '/locale/codes';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        /**
         * List of all continents. You can use the locale header to get the data in a supported language.
         *
         * @throws {AppwriteException}
         * @returns {Promise<Models.ContinentList>}
         */
        listContinents() {
            const apiPath = '/locale/continents';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        /**
         * List of all countries. You can use the locale header to get the data in a supported language.
         *
         * @throws {AppwriteException}
         * @returns {Promise<Models.CountryList>}
         */
        listCountries() {
            const apiPath = '/locale/countries';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        /**
         * List of all countries that are currently members of the EU. You can use the locale header to get the data in a supported language.
         *
         * @throws {AppwriteException}
         * @returns {Promise<Models.CountryList>}
         */
        listCountriesEU() {
            const apiPath = '/locale/countries/eu';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        /**
         * List of all countries phone codes. You can use the locale header to get the data in a supported language.
         *
         * @throws {AppwriteException}
         * @returns {Promise<Models.PhoneList>}
         */
        listCountriesPhones() {
            const apiPath = '/locale/countries/phones';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        /**
         * List of all currencies, including currency symbol, name, plural, and decimal digits for all major and minor currencies. You can use the locale header to get the data in a supported language.
         *
         * @throws {AppwriteException}
         * @returns {Promise<Models.CurrencyList>}
         */
        listCurrencies() {
            const apiPath = '/locale/currencies';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        /**
         * List of all languages classified by ISO 639-1 including 2-letter code, name in English, and name in the respective language.
         *
         * @throws {AppwriteException}
         * @returns {Promise<Models.LanguageList>}
         */
        listLanguages() {
            const apiPath = '/locale/languages';
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
    }

    class Messaging {
        constructor(client) {
            this.client = client;
        }
        createSubscriber(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    topicId: paramsOrFirst,
                    subscriberId: rest[0],
                    targetId: rest[1]
                };
            }
            const topicId = params.topicId;
            const subscriberId = params.subscriberId;
            const targetId = params.targetId;
            if (typeof topicId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "topicId"');
            }
            if (typeof subscriberId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "subscriberId"');
            }
            if (typeof targetId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "targetId"');
            }
            const apiPath = '/messaging/topics/{topicId}/subscribers'.replace('{topicId}', encodeURIComponent(String(topicId)));
            const payload = {};
            if (typeof subscriberId !== 'undefined') {
                payload['subscriberId'] = subscriberId;
            }
            if (typeof targetId !== 'undefined') {
                payload['targetId'] = targetId;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
        deleteSubscriber(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    topicId: paramsOrFirst,
                    subscriberId: rest[0]
                };
            }
            const topicId = params.topicId;
            const subscriberId = params.subscriberId;
            if (typeof topicId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "topicId"');
            }
            if (typeof subscriberId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "subscriberId"');
            }
            const apiPath = '/messaging/topics/{topicId}/subscribers/{subscriberId}'.replace('{topicId}', encodeURIComponent(String(topicId))).replace('{subscriberId}', encodeURIComponent(String(subscriberId)));
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
            };
            return this.client.call('delete', uri, apiHeaders, payload);
        }
    }

    class Presences {
        constructor(client) {
            this.client = client;
        }
        list(paramsOrFirst, ...rest) {
            let params;
            if (!paramsOrFirst || (paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    queries: paramsOrFirst,
                    total: rest[0],
                    ttl: rest[1]
                };
            }
            const queries = params.queries;
            const total = params.total;
            const ttl = params.ttl;
            const apiPath = '/presences';
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            if (typeof total !== 'undefined') {
                payload['total'] = total;
            }
            if (typeof ttl !== 'undefined') {
                payload['ttl'] = ttl;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        get(paramsOrFirst) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    presenceId: paramsOrFirst
                };
            }
            const presenceId = params.presenceId;
            if (typeof presenceId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "presenceId"');
            }
            const apiPath = '/presences/{presenceId}'.replace('{presenceId}', encodeURIComponent(String(presenceId)));
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        upsert(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    presenceId: paramsOrFirst,
                    status: rest[0],
                    permissions: rest[1],
                    expiresAt: rest[2],
                    metadata: rest[3]
                };
            }
            const presenceId = params.presenceId;
            const status = params.status;
            const permissions = params.permissions;
            const expiresAt = params.expiresAt;
            const metadata = params.metadata;
            if (typeof presenceId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "presenceId"');
            }
            if (typeof status === 'undefined') {
                throw new AppwriteException('Missing required parameter: "status"');
            }
            const apiPath = '/presences/{presenceId}'.replace('{presenceId}', encodeURIComponent(String(presenceId)));
            const payload = {};
            if (typeof status !== 'undefined') {
                payload['status'] = status;
            }
            if (typeof permissions !== 'undefined') {
                payload['permissions'] = permissions;
            }
            if (typeof expiresAt !== 'undefined') {
                payload['expiresAt'] = expiresAt;
            }
            if (typeof metadata !== 'undefined') {
                payload['metadata'] = metadata;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('put', uri, apiHeaders, payload);
        }
        update(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    presenceId: paramsOrFirst,
                    status: rest[0],
                    expiresAt: rest[1],
                    metadata: rest[2],
                    permissions: rest[3],
                    purge: rest[4]
                };
            }
            const presenceId = params.presenceId;
            const status = params.status;
            const expiresAt = params.expiresAt;
            const metadata = params.metadata;
            const permissions = params.permissions;
            const purge = params.purge;
            if (typeof presenceId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "presenceId"');
            }
            const apiPath = '/presences/{presenceId}'.replace('{presenceId}', encodeURIComponent(String(presenceId)));
            const payload = {};
            if (typeof status !== 'undefined') {
                payload['status'] = status;
            }
            if (typeof expiresAt !== 'undefined') {
                payload['expiresAt'] = expiresAt;
            }
            if (typeof metadata !== 'undefined') {
                payload['metadata'] = metadata;
            }
            if (typeof permissions !== 'undefined') {
                payload['permissions'] = permissions;
            }
            if (typeof purge !== 'undefined') {
                payload['purge'] = purge;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('patch', uri, apiHeaders, payload);
        }
        delete(paramsOrFirst) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    presenceId: paramsOrFirst
                };
            }
            const presenceId = params.presenceId;
            if (typeof presenceId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "presenceId"');
            }
            const apiPath = '/presences/{presenceId}'.replace('{presenceId}', encodeURIComponent(String(presenceId)));
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
            };
            return this.client.call('delete', uri, apiHeaders, payload);
        }
    }

    class Storage {
        constructor(client) {
            this.client = client;
        }
        listFiles(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    bucketId: paramsOrFirst,
                    queries: rest[0],
                    search: rest[1],
                    total: rest[2]
                };
            }
            const bucketId = params.bucketId;
            const queries = params.queries;
            const search = params.search;
            const total = params.total;
            if (typeof bucketId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "bucketId"');
            }
            const apiPath = '/storage/buckets/{bucketId}/files'.replace('{bucketId}', encodeURIComponent(String(bucketId)));
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            if (typeof search !== 'undefined') {
                payload['search'] = search;
            }
            if (typeof total !== 'undefined') {
                payload['total'] = total;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        createFile(paramsOrFirst, ...rest) {
            let params;
            let onProgress;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
                onProgress = paramsOrFirst === null || paramsOrFirst === void 0 ? void 0 : paramsOrFirst.onProgress;
            }
            else {
                params = {
                    bucketId: paramsOrFirst,
                    fileId: rest[0],
                    file: rest[1],
                    permissions: rest[2]
                };
                onProgress = rest[3];
            }
            const bucketId = params.bucketId;
            const fileId = params.fileId;
            const file = params.file;
            const permissions = params.permissions;
            if (typeof bucketId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "bucketId"');
            }
            if (typeof fileId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "fileId"');
            }
            if (typeof file === 'undefined') {
                throw new AppwriteException('Missing required parameter: "file"');
            }
            const apiPath = '/storage/buckets/{bucketId}/files'.replace('{bucketId}', encodeURIComponent(String(bucketId)));
            const payload = {};
            if (typeof fileId !== 'undefined') {
                payload['fileId'] = fileId;
            }
            if (typeof file !== 'undefined') {
                payload['file'] = file;
            }
            if (typeof permissions !== 'undefined') {
                payload['permissions'] = permissions;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'multipart/form-data',
                'accept': 'application/json',
            };
            return this.client.chunkedUpload('post', uri, apiHeaders, payload, onProgress);
        }
        getFile(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    bucketId: paramsOrFirst,
                    fileId: rest[0]
                };
            }
            const bucketId = params.bucketId;
            const fileId = params.fileId;
            if (typeof bucketId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "bucketId"');
            }
            if (typeof fileId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "fileId"');
            }
            const apiPath = '/storage/buckets/{bucketId}/files/{fileId}'.replace('{bucketId}', encodeURIComponent(String(bucketId))).replace('{fileId}', encodeURIComponent(String(fileId)));
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        updateFile(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    bucketId: paramsOrFirst,
                    fileId: rest[0],
                    name: rest[1],
                    permissions: rest[2]
                };
            }
            const bucketId = params.bucketId;
            const fileId = params.fileId;
            const name = params.name;
            const permissions = params.permissions;
            if (typeof bucketId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "bucketId"');
            }
            if (typeof fileId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "fileId"');
            }
            const apiPath = '/storage/buckets/{bucketId}/files/{fileId}'.replace('{bucketId}', encodeURIComponent(String(bucketId))).replace('{fileId}', encodeURIComponent(String(fileId)));
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof permissions !== 'undefined') {
                payload['permissions'] = permissions;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('put', uri, apiHeaders, payload);
        }
        deleteFile(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    bucketId: paramsOrFirst,
                    fileId: rest[0]
                };
            }
            const bucketId = params.bucketId;
            const fileId = params.fileId;
            if (typeof bucketId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "bucketId"');
            }
            if (typeof fileId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "fileId"');
            }
            const apiPath = '/storage/buckets/{bucketId}/files/{fileId}'.replace('{bucketId}', encodeURIComponent(String(bucketId))).replace('{fileId}', encodeURIComponent(String(fileId)));
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
            };
            return this.client.call('delete', uri, apiHeaders, payload);
        }
        getFileDownload(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    bucketId: paramsOrFirst,
                    fileId: rest[0],
                    token: rest[1]
                };
            }
            const bucketId = params.bucketId;
            const fileId = params.fileId;
            const token = params.token;
            if (typeof bucketId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "bucketId"');
            }
            if (typeof fileId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "fileId"');
            }
            const apiPath = '/storage/buckets/{bucketId}/files/{fileId}/download'.replace('{bucketId}', encodeURIComponent(String(bucketId))).replace('{fileId}', encodeURIComponent(String(fileId)));
            const payload = {};
            if (typeof token !== 'undefined') {
                payload['token'] = token;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            ({
                'X-Appwrite-Project': this.client.config.project});
            payload['project'] = this.client.config.project;
            payload['impersonateuserid'] = this.client.config.impersonateuserid;
            for (const [key, value] of Object.entries(Service.flatten(payload))) {
                uri.searchParams.append(key, value);
            }
            return uri.toString();
        }
        getFilePreview(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    bucketId: paramsOrFirst,
                    fileId: rest[0],
                    width: rest[1],
                    height: rest[2],
                    gravity: rest[3],
                    quality: rest[4],
                    borderWidth: rest[5],
                    borderColor: rest[6],
                    borderRadius: rest[7],
                    opacity: rest[8],
                    rotation: rest[9],
                    background: rest[10],
                    output: rest[11],
                    token: rest[12]
                };
            }
            const bucketId = params.bucketId;
            const fileId = params.fileId;
            const width = params.width;
            const height = params.height;
            const gravity = params.gravity;
            const quality = params.quality;
            const borderWidth = params.borderWidth;
            const borderColor = params.borderColor;
            const borderRadius = params.borderRadius;
            const opacity = params.opacity;
            const rotation = params.rotation;
            const background = params.background;
            const output = params.output;
            const token = params.token;
            if (typeof bucketId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "bucketId"');
            }
            if (typeof fileId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "fileId"');
            }
            const apiPath = '/storage/buckets/{bucketId}/files/{fileId}/preview'.replace('{bucketId}', encodeURIComponent(String(bucketId))).replace('{fileId}', encodeURIComponent(String(fileId)));
            const payload = {};
            if (typeof width !== 'undefined') {
                payload['width'] = width;
            }
            if (typeof height !== 'undefined') {
                payload['height'] = height;
            }
            if (typeof gravity !== 'undefined') {
                payload['gravity'] = gravity;
            }
            if (typeof quality !== 'undefined') {
                payload['quality'] = quality;
            }
            if (typeof borderWidth !== 'undefined') {
                payload['borderWidth'] = borderWidth;
            }
            if (typeof borderColor !== 'undefined') {
                payload['borderColor'] = borderColor;
            }
            if (typeof borderRadius !== 'undefined') {
                payload['borderRadius'] = borderRadius;
            }
            if (typeof opacity !== 'undefined') {
                payload['opacity'] = opacity;
            }
            if (typeof rotation !== 'undefined') {
                payload['rotation'] = rotation;
            }
            if (typeof background !== 'undefined') {
                payload['background'] = background;
            }
            if (typeof output !== 'undefined') {
                payload['output'] = output;
            }
            if (typeof token !== 'undefined') {
                payload['token'] = token;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            ({
                'X-Appwrite-Project': this.client.config.project});
            payload['project'] = this.client.config.project;
            payload['impersonateuserid'] = this.client.config.impersonateuserid;
            for (const [key, value] of Object.entries(Service.flatten(payload))) {
                uri.searchParams.append(key, value);
            }
            return uri.toString();
        }
        getFileView(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    bucketId: paramsOrFirst,
                    fileId: rest[0],
                    token: rest[1]
                };
            }
            const bucketId = params.bucketId;
            const fileId = params.fileId;
            const token = params.token;
            if (typeof bucketId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "bucketId"');
            }
            if (typeof fileId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "fileId"');
            }
            const apiPath = '/storage/buckets/{bucketId}/files/{fileId}/view'.replace('{bucketId}', encodeURIComponent(String(bucketId))).replace('{fileId}', encodeURIComponent(String(fileId)));
            const payload = {};
            if (typeof token !== 'undefined') {
                payload['token'] = token;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            ({
                'X-Appwrite-Project': this.client.config.project});
            payload['project'] = this.client.config.project;
            payload['impersonateuserid'] = this.client.config.impersonateuserid;
            for (const [key, value] of Object.entries(Service.flatten(payload))) {
                uri.searchParams.append(key, value);
            }
            return uri.toString();
        }
    }

    class TablesDB {
        constructor(client) {
            this.client = client;
        }
        listTransactions(paramsOrFirst) {
            let params;
            if (!paramsOrFirst || (paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    queries: paramsOrFirst
                };
            }
            const queries = params.queries;
            const apiPath = '/tablesdb/transactions';
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        createTransaction(paramsOrFirst) {
            let params;
            if (!paramsOrFirst || (paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    ttl: paramsOrFirst
                };
            }
            const ttl = params.ttl;
            const apiPath = '/tablesdb/transactions';
            const payload = {};
            if (typeof ttl !== 'undefined') {
                payload['ttl'] = ttl;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
        getTransaction(paramsOrFirst) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    transactionId: paramsOrFirst
                };
            }
            const transactionId = params.transactionId;
            if (typeof transactionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "transactionId"');
            }
            const apiPath = '/tablesdb/transactions/{transactionId}'.replace('{transactionId}', encodeURIComponent(String(transactionId)));
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        updateTransaction(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    transactionId: paramsOrFirst,
                    commit: rest[0],
                    rollback: rest[1]
                };
            }
            const transactionId = params.transactionId;
            const commit = params.commit;
            const rollback = params.rollback;
            if (typeof transactionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "transactionId"');
            }
            const apiPath = '/tablesdb/transactions/{transactionId}'.replace('{transactionId}', encodeURIComponent(String(transactionId)));
            const payload = {};
            if (typeof commit !== 'undefined') {
                payload['commit'] = commit;
            }
            if (typeof rollback !== 'undefined') {
                payload['rollback'] = rollback;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('patch', uri, apiHeaders, payload);
        }
        deleteTransaction(paramsOrFirst) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    transactionId: paramsOrFirst
                };
            }
            const transactionId = params.transactionId;
            if (typeof transactionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "transactionId"');
            }
            const apiPath = '/tablesdb/transactions/{transactionId}'.replace('{transactionId}', encodeURIComponent(String(transactionId)));
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
            };
            return this.client.call('delete', uri, apiHeaders, payload);
        }
        createOperations(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    transactionId: paramsOrFirst,
                    operations: rest[0]
                };
            }
            const transactionId = params.transactionId;
            const operations = params.operations;
            if (typeof transactionId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "transactionId"');
            }
            const apiPath = '/tablesdb/transactions/{transactionId}/operations'.replace('{transactionId}', encodeURIComponent(String(transactionId)));
            const payload = {};
            if (typeof operations !== 'undefined') {
                payload['operations'] = operations;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
        listRows(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    databaseId: paramsOrFirst,
                    tableId: rest[0],
                    queries: rest[1],
                    transactionId: rest[2],
                    total: rest[3],
                    ttl: rest[4]
                };
            }
            const databaseId = params.databaseId;
            const tableId = params.tableId;
            const queries = params.queries;
            const transactionId = params.transactionId;
            const total = params.total;
            const ttl = params.ttl;
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof tableId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "tableId"');
            }
            const apiPath = '/tablesdb/{databaseId}/tables/{tableId}/rows'.replace('{databaseId}', encodeURIComponent(String(databaseId))).replace('{tableId}', encodeURIComponent(String(tableId)));
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            if (typeof transactionId !== 'undefined') {
                payload['transactionId'] = transactionId;
            }
            if (typeof total !== 'undefined') {
                payload['total'] = total;
            }
            if (typeof ttl !== 'undefined') {
                payload['ttl'] = ttl;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        createRow(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    databaseId: paramsOrFirst,
                    tableId: rest[0],
                    rowId: rest[1],
                    data: rest[2],
                    permissions: rest[3],
                    transactionId: rest[4]
                };
            }
            const databaseId = params.databaseId;
            const tableId = params.tableId;
            const rowId = params.rowId;
            const data = params.data;
            const permissions = params.permissions;
            const transactionId = params.transactionId;
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof tableId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "tableId"');
            }
            if (typeof rowId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "rowId"');
            }
            if (typeof data === 'undefined') {
                throw new AppwriteException('Missing required parameter: "data"');
            }
            const apiPath = '/tablesdb/{databaseId}/tables/{tableId}/rows'.replace('{databaseId}', encodeURIComponent(String(databaseId))).replace('{tableId}', encodeURIComponent(String(tableId)));
            const payload = {};
            if (typeof rowId !== 'undefined') {
                payload['rowId'] = rowId;
            }
            if (typeof data !== 'undefined') {
                payload['data'] = data;
            }
            if (typeof permissions !== 'undefined') {
                payload['permissions'] = permissions;
            }
            if (typeof transactionId !== 'undefined') {
                payload['transactionId'] = transactionId;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
        getRow(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    databaseId: paramsOrFirst,
                    tableId: rest[0],
                    rowId: rest[1],
                    queries: rest[2],
                    transactionId: rest[3]
                };
            }
            const databaseId = params.databaseId;
            const tableId = params.tableId;
            const rowId = params.rowId;
            const queries = params.queries;
            const transactionId = params.transactionId;
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof tableId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "tableId"');
            }
            if (typeof rowId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "rowId"');
            }
            const apiPath = '/tablesdb/{databaseId}/tables/{tableId}/rows/{rowId}'.replace('{databaseId}', encodeURIComponent(String(databaseId))).replace('{tableId}', encodeURIComponent(String(tableId))).replace('{rowId}', encodeURIComponent(String(rowId)));
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            if (typeof transactionId !== 'undefined') {
                payload['transactionId'] = transactionId;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        upsertRow(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    databaseId: paramsOrFirst,
                    tableId: rest[0],
                    rowId: rest[1],
                    data: rest[2],
                    permissions: rest[3],
                    transactionId: rest[4]
                };
            }
            const databaseId = params.databaseId;
            const tableId = params.tableId;
            const rowId = params.rowId;
            const data = params.data;
            const permissions = params.permissions;
            const transactionId = params.transactionId;
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof tableId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "tableId"');
            }
            if (typeof rowId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "rowId"');
            }
            const apiPath = '/tablesdb/{databaseId}/tables/{tableId}/rows/{rowId}'.replace('{databaseId}', encodeURIComponent(String(databaseId))).replace('{tableId}', encodeURIComponent(String(tableId))).replace('{rowId}', encodeURIComponent(String(rowId)));
            const payload = {};
            if (typeof data !== 'undefined') {
                payload['data'] = data;
            }
            if (typeof permissions !== 'undefined') {
                payload['permissions'] = permissions;
            }
            if (typeof transactionId !== 'undefined') {
                payload['transactionId'] = transactionId;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('put', uri, apiHeaders, payload);
        }
        updateRow(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    databaseId: paramsOrFirst,
                    tableId: rest[0],
                    rowId: rest[1],
                    data: rest[2],
                    permissions: rest[3],
                    transactionId: rest[4]
                };
            }
            const databaseId = params.databaseId;
            const tableId = params.tableId;
            const rowId = params.rowId;
            const data = params.data;
            const permissions = params.permissions;
            const transactionId = params.transactionId;
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof tableId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "tableId"');
            }
            if (typeof rowId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "rowId"');
            }
            const apiPath = '/tablesdb/{databaseId}/tables/{tableId}/rows/{rowId}'.replace('{databaseId}', encodeURIComponent(String(databaseId))).replace('{tableId}', encodeURIComponent(String(tableId))).replace('{rowId}', encodeURIComponent(String(rowId)));
            const payload = {};
            if (typeof data !== 'undefined') {
                payload['data'] = data;
            }
            if (typeof permissions !== 'undefined') {
                payload['permissions'] = permissions;
            }
            if (typeof transactionId !== 'undefined') {
                payload['transactionId'] = transactionId;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('patch', uri, apiHeaders, payload);
        }
        deleteRow(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    databaseId: paramsOrFirst,
                    tableId: rest[0],
                    rowId: rest[1],
                    transactionId: rest[2]
                };
            }
            const databaseId = params.databaseId;
            const tableId = params.tableId;
            const rowId = params.rowId;
            const transactionId = params.transactionId;
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof tableId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "tableId"');
            }
            if (typeof rowId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "rowId"');
            }
            const apiPath = '/tablesdb/{databaseId}/tables/{tableId}/rows/{rowId}'.replace('{databaseId}', encodeURIComponent(String(databaseId))).replace('{tableId}', encodeURIComponent(String(tableId))).replace('{rowId}', encodeURIComponent(String(rowId)));
            const payload = {};
            if (typeof transactionId !== 'undefined') {
                payload['transactionId'] = transactionId;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
            };
            return this.client.call('delete', uri, apiHeaders, payload);
        }
        decrementRowColumn(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    databaseId: paramsOrFirst,
                    tableId: rest[0],
                    rowId: rest[1],
                    column: rest[2],
                    value: rest[3],
                    min: rest[4],
                    transactionId: rest[5]
                };
            }
            const databaseId = params.databaseId;
            const tableId = params.tableId;
            const rowId = params.rowId;
            const column = params.column;
            const value = params.value;
            const min = params.min;
            const transactionId = params.transactionId;
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof tableId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "tableId"');
            }
            if (typeof rowId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "rowId"');
            }
            if (typeof column === 'undefined') {
                throw new AppwriteException('Missing required parameter: "column"');
            }
            const apiPath = '/tablesdb/{databaseId}/tables/{tableId}/rows/{rowId}/{column}/decrement'.replace('{databaseId}', encodeURIComponent(String(databaseId))).replace('{tableId}', encodeURIComponent(String(tableId))).replace('{rowId}', encodeURIComponent(String(rowId))).replace('{column}', encodeURIComponent(String(column)));
            const payload = {};
            if (typeof value !== 'undefined') {
                payload['value'] = value;
            }
            if (typeof min !== 'undefined') {
                payload['min'] = min;
            }
            if (typeof transactionId !== 'undefined') {
                payload['transactionId'] = transactionId;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('patch', uri, apiHeaders, payload);
        }
        incrementRowColumn(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    databaseId: paramsOrFirst,
                    tableId: rest[0],
                    rowId: rest[1],
                    column: rest[2],
                    value: rest[3],
                    max: rest[4],
                    transactionId: rest[5]
                };
            }
            const databaseId = params.databaseId;
            const tableId = params.tableId;
            const rowId = params.rowId;
            const column = params.column;
            const value = params.value;
            const max = params.max;
            const transactionId = params.transactionId;
            if (typeof databaseId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "databaseId"');
            }
            if (typeof tableId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "tableId"');
            }
            if (typeof rowId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "rowId"');
            }
            if (typeof column === 'undefined') {
                throw new AppwriteException('Missing required parameter: "column"');
            }
            const apiPath = '/tablesdb/{databaseId}/tables/{tableId}/rows/{rowId}/{column}/increment'.replace('{databaseId}', encodeURIComponent(String(databaseId))).replace('{tableId}', encodeURIComponent(String(tableId))).replace('{rowId}', encodeURIComponent(String(rowId))).replace('{column}', encodeURIComponent(String(column)));
            const payload = {};
            if (typeof value !== 'undefined') {
                payload['value'] = value;
            }
            if (typeof max !== 'undefined') {
                payload['max'] = max;
            }
            if (typeof transactionId !== 'undefined') {
                payload['transactionId'] = transactionId;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('patch', uri, apiHeaders, payload);
        }
    }

    class Teams {
        constructor(client) {
            this.client = client;
        }
        list(paramsOrFirst, ...rest) {
            let params;
            if (!paramsOrFirst || (paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    queries: paramsOrFirst,
                    search: rest[0],
                    total: rest[1]
                };
            }
            const queries = params.queries;
            const search = params.search;
            const total = params.total;
            const apiPath = '/teams';
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            if (typeof search !== 'undefined') {
                payload['search'] = search;
            }
            if (typeof total !== 'undefined') {
                payload['total'] = total;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        create(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    teamId: paramsOrFirst,
                    name: rest[0],
                    roles: rest[1]
                };
            }
            const teamId = params.teamId;
            const name = params.name;
            const roles = params.roles;
            if (typeof teamId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "teamId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            const apiPath = '/teams';
            const payload = {};
            if (typeof teamId !== 'undefined') {
                payload['teamId'] = teamId;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            if (typeof roles !== 'undefined') {
                payload['roles'] = roles;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
        get(paramsOrFirst) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    teamId: paramsOrFirst
                };
            }
            const teamId = params.teamId;
            if (typeof teamId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "teamId"');
            }
            const apiPath = '/teams/{teamId}'.replace('{teamId}', encodeURIComponent(String(teamId)));
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        updateName(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    teamId: paramsOrFirst,
                    name: rest[0]
                };
            }
            const teamId = params.teamId;
            const name = params.name;
            if (typeof teamId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "teamId"');
            }
            if (typeof name === 'undefined') {
                throw new AppwriteException('Missing required parameter: "name"');
            }
            const apiPath = '/teams/{teamId}'.replace('{teamId}', encodeURIComponent(String(teamId)));
            const payload = {};
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('put', uri, apiHeaders, payload);
        }
        delete(paramsOrFirst) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    teamId: paramsOrFirst
                };
            }
            const teamId = params.teamId;
            if (typeof teamId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "teamId"');
            }
            const apiPath = '/teams/{teamId}'.replace('{teamId}', encodeURIComponent(String(teamId)));
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
            };
            return this.client.call('delete', uri, apiHeaders, payload);
        }
        listMemberships(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    teamId: paramsOrFirst,
                    queries: rest[0],
                    search: rest[1],
                    total: rest[2]
                };
            }
            const teamId = params.teamId;
            const queries = params.queries;
            const search = params.search;
            const total = params.total;
            if (typeof teamId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "teamId"');
            }
            const apiPath = '/teams/{teamId}/memberships'.replace('{teamId}', encodeURIComponent(String(teamId)));
            const payload = {};
            if (typeof queries !== 'undefined') {
                payload['queries'] = queries;
            }
            if (typeof search !== 'undefined') {
                payload['search'] = search;
            }
            if (typeof total !== 'undefined') {
                payload['total'] = total;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        createMembership(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    teamId: paramsOrFirst,
                    roles: rest[0],
                    email: rest[1],
                    userId: rest[2],
                    phone: rest[3],
                    url: rest[4],
                    name: rest[5]
                };
            }
            const teamId = params.teamId;
            const roles = params.roles;
            const email = params.email;
            const userId = params.userId;
            const phone = params.phone;
            const url = params.url;
            const name = params.name;
            if (typeof teamId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "teamId"');
            }
            if (typeof roles === 'undefined') {
                throw new AppwriteException('Missing required parameter: "roles"');
            }
            const apiPath = '/teams/{teamId}/memberships'.replace('{teamId}', encodeURIComponent(String(teamId)));
            const payload = {};
            if (typeof email !== 'undefined') {
                payload['email'] = email;
            }
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof phone !== 'undefined') {
                payload['phone'] = phone;
            }
            if (typeof roles !== 'undefined') {
                payload['roles'] = roles;
            }
            if (typeof url !== 'undefined') {
                payload['url'] = url;
            }
            if (typeof name !== 'undefined') {
                payload['name'] = name;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('post', uri, apiHeaders, payload);
        }
        getMembership(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    teamId: paramsOrFirst,
                    membershipId: rest[0]
                };
            }
            const teamId = params.teamId;
            const membershipId = params.membershipId;
            if (typeof teamId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "teamId"');
            }
            if (typeof membershipId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "membershipId"');
            }
            const apiPath = '/teams/{teamId}/memberships/{membershipId}'.replace('{teamId}', encodeURIComponent(String(teamId))).replace('{membershipId}', encodeURIComponent(String(membershipId)));
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        updateMembership(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    teamId: paramsOrFirst,
                    membershipId: rest[0],
                    roles: rest[1]
                };
            }
            const teamId = params.teamId;
            const membershipId = params.membershipId;
            const roles = params.roles;
            if (typeof teamId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "teamId"');
            }
            if (typeof membershipId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "membershipId"');
            }
            if (typeof roles === 'undefined') {
                throw new AppwriteException('Missing required parameter: "roles"');
            }
            const apiPath = '/teams/{teamId}/memberships/{membershipId}'.replace('{teamId}', encodeURIComponent(String(teamId))).replace('{membershipId}', encodeURIComponent(String(membershipId)));
            const payload = {};
            if (typeof roles !== 'undefined') {
                payload['roles'] = roles;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('patch', uri, apiHeaders, payload);
        }
        deleteMembership(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    teamId: paramsOrFirst,
                    membershipId: rest[0]
                };
            }
            const teamId = params.teamId;
            const membershipId = params.membershipId;
            if (typeof teamId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "teamId"');
            }
            if (typeof membershipId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "membershipId"');
            }
            const apiPath = '/teams/{teamId}/memberships/{membershipId}'.replace('{teamId}', encodeURIComponent(String(teamId))).replace('{membershipId}', encodeURIComponent(String(membershipId)));
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
            };
            return this.client.call('delete', uri, apiHeaders, payload);
        }
        updateMembershipStatus(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    teamId: paramsOrFirst,
                    membershipId: rest[0],
                    userId: rest[1],
                    secret: rest[2]
                };
            }
            const teamId = params.teamId;
            const membershipId = params.membershipId;
            const userId = params.userId;
            const secret = params.secret;
            if (typeof teamId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "teamId"');
            }
            if (typeof membershipId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "membershipId"');
            }
            if (typeof userId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "userId"');
            }
            if (typeof secret === 'undefined') {
                throw new AppwriteException('Missing required parameter: "secret"');
            }
            const apiPath = '/teams/{teamId}/memberships/{membershipId}/status'.replace('{teamId}', encodeURIComponent(String(teamId))).replace('{membershipId}', encodeURIComponent(String(membershipId)));
            const payload = {};
            if (typeof userId !== 'undefined') {
                payload['userId'] = userId;
            }
            if (typeof secret !== 'undefined') {
                payload['secret'] = secret;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('patch', uri, apiHeaders, payload);
        }
        getPrefs(paramsOrFirst) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    teamId: paramsOrFirst
                };
            }
            const teamId = params.teamId;
            if (typeof teamId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "teamId"');
            }
            const apiPath = '/teams/{teamId}/prefs'.replace('{teamId}', encodeURIComponent(String(teamId)));
            const payload = {};
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'accept': 'application/json',
            };
            return this.client.call('get', uri, apiHeaders, payload);
        }
        updatePrefs(paramsOrFirst, ...rest) {
            let params;
            if ((paramsOrFirst && typeof paramsOrFirst === 'object' && !Array.isArray(paramsOrFirst))) {
                params = (paramsOrFirst || {});
            }
            else {
                params = {
                    teamId: paramsOrFirst,
                    prefs: rest[0]
                };
            }
            const teamId = params.teamId;
            const prefs = params.prefs;
            if (typeof teamId === 'undefined') {
                throw new AppwriteException('Missing required parameter: "teamId"');
            }
            if (typeof prefs === 'undefined') {
                throw new AppwriteException('Missing required parameter: "prefs"');
            }
            const apiPath = '/teams/{teamId}/prefs'.replace('{teamId}', encodeURIComponent(String(teamId)));
            const payload = {};
            if (typeof prefs !== 'undefined') {
                payload['prefs'] = prefs;
            }
            const uri = new URL(this.client.config.endpoint + apiPath);
            const apiHeaders = {
                'X-Appwrite-Project': this.client.config.project,
                'content-type': 'application/json',
                'accept': 'application/json',
            };
            return this.client.call('put', uri, apiHeaders, payload);
        }
    }

    var RealtimeCode;
    (function (RealtimeCode) {
        RealtimeCode[RealtimeCode["NORMAL_CLOSURE"] = 1000] = "NORMAL_CLOSURE";
        RealtimeCode[RealtimeCode["POLICY_VIOLATION"] = 1008] = "POLICY_VIOLATION";
        RealtimeCode[RealtimeCode["UNKNOWN_ERROR"] = -1] = "UNKNOWN_ERROR";
    })(RealtimeCode || (RealtimeCode = {}));
    class Realtime {
        constructor(client) {
            this.TYPE_ERROR = 'error';
            this.TYPE_EVENT = 'event';
            this.TYPE_PONG = 'pong';
            this.TYPE_CONNECTED = 'connected';
            this.DEBOUNCE_MS = 1;
            this.HEARTBEAT_INTERVAL = 20000; // 20 seconds in milliseconds
            this.activeSubscriptions = new Map();
            this.pendingSubscribes = new Map();
            this.appConnected = false;
            this.subCallDepth = 0;
            this.reconnectAttempts = 0;
            this.connectionId = 0;
            this.reconnect = true;
            this.onErrorCallbacks = [];
            this.onCloseCallbacks = [];
            this.onOpenCallbacks = [];
            this.client = client;
        }
        /**
         * Register a callback function to be called when an error occurs
         *
         * @param {Function} callback - Callback function to handle errors
         * @returns {void}
         */
        onError(callback) {
            this.onErrorCallbacks.push(callback);
        }
        /**
         * Register a callback function to be called when the connection closes
         *
         * @param {Function} callback - Callback function to handle connection close
         * @returns {void}
         */
        onClose(callback) {
            this.onCloseCallbacks.push(callback);
        }
        /**
         * Register a callback function to be called when the connection opens
         *
         * @param {Function} callback - Callback function to handle connection open
         * @returns {void}
         */
        onOpen(callback) {
            this.onOpenCallbacks.push(callback);
        }
        startHeartbeat() {
            this.stopHeartbeat();
            this.heartbeatTimer = window === null || window === void 0 ? void 0 : window.setInterval(() => {
                if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                    this.socket.send(JSONbig.stringify({ type: 'ping' }));
                }
            }, this.HEARTBEAT_INTERVAL);
        }
        stopHeartbeat() {
            if (this.heartbeatTimer) {
                window === null || window === void 0 ? void 0 : window.clearInterval(this.heartbeatTimer);
                this.heartbeatTimer = undefined;
            }
        }
        /**
         * Idempotent socket opener. Both `subscribe()` and `upsertPresence()` can
         * call this; the single-flight lock (`socketCreationPromise`) guarantees
         * only one `new WebSocket(...)` is ever in flight, so concurrent callers
         * join the same connection attempt instead of opening duplicates.
         *
         * Returns early when a healthy socket is already present.
         */
        createSocket() {
            return __awaiter(this, void 0, void 0, function* () {
                // Fast path: a usable socket is already there. No need to open another.
                if (this.socket && this.socket.readyState < WebSocket.CLOSING) {
                    return;
                }
                // Another caller is already opening one — join it.
                if (this.socketCreationPromise) {
                    return this.socketCreationPromise;
                }
                this.socketCreationPromise = this.createSocketLocked().finally(() => {
                    this.socketCreationPromise = undefined;
                });
                return this.socketCreationPromise;
            });
        }
        createSocketLocked() {
            return __awaiter(this, void 0, void 0, function* () {
                // Nothing to do if there's neither a subscription nor a queued presence
                // that needs the wire. (Reconnect cleanup path also flows through here.)
                if (this.activeSubscriptions.size === 0 && !this.pendingPresence) {
                    this.reconnect = false;
                    yield this.closeSocket();
                    return;
                }
                const projectId = this.client.config.project;
                if (!projectId) {
                    throw new AppwriteException('Missing project ID');
                }
                // URL carries only the project; channels/queries are sent via the subscribe message.
                let queryParams = `project=${projectId}`;
                const jwt = this.client.config.jwt;
                if (jwt) {
                    queryParams += `&jwt=${encodeURIComponent(jwt)}`;
                }
                const endpoint = this.client.config.endpointRealtime !== ''
                    ? this.client.config.endpointRealtime
                    : this.client.config.endpoint || '';
                const realtimeEndpoint = endpoint
                    .replace('https://', 'wss://')
                    .replace('http://', 'ws://');
                const url = `${realtimeEndpoint}/realtime?${queryParams}`;
                if (this.socket) {
                    this.reconnect = false;
                    if (this.socket.readyState < WebSocket.CLOSING) {
                        yield this.closeSocket();
                    }
                    // Ensure reconnect isn't stuck false if close event was missed.
                    this.reconnect = true;
                }
                return new Promise((resolve, reject) => {
                    // Re-check the entry guard synchronously. `disconnect()` may have
                    // run during the `await this.closeSocket()` above (or any other
                    // await between the original guard and here), clearing every
                    // subscription and the pending presence. In that case opening a
                    // fresh socket would leak a connection with nothing attached.
                    if (this.activeSubscriptions.size === 0 && !this.pendingPresence) {
                        resolve();
                        return;
                    }
                    try {
                        const connectionId = ++this.connectionId;
                        const socket = (this.socket = new WebSocket(url));
                        socket.addEventListener('open', () => {
                            if (connectionId !== this.connectionId) {
                                return;
                            }
                            this.reconnectAttempts = 0;
                            this.onOpenCallbacks.forEach(callback => callback());
                            this.startHeartbeat();
                            resolve();
                        });
                        socket.addEventListener('message', (event) => {
                            if (connectionId !== this.connectionId) {
                                return;
                            }
                            try {
                                const message = JSONbig.parse(event.data);
                                this.handleMessage(message);
                            }
                            catch (error) {
                                console.error('Failed to parse message:', error);
                            }
                        });
                        socket.addEventListener('close', (event) => __awaiter(this, void 0, void 0, function* () {
                            if (connectionId !== this.connectionId || socket !== this.socket) {
                                return;
                            }
                            this.appConnected = false;
                            this.stopHeartbeat();
                            this.onCloseCallbacks.forEach(callback => callback());
                            if (!this.reconnect || event.code === RealtimeCode.POLICY_VIOLATION) {
                                this.reconnect = true;
                                return;
                            }
                            const timeout = this.getTimeout();
                            console.log(`Realtime disconnected. Re-connecting in ${timeout / 1000} seconds.`);
                            yield this.sleep(timeout);
                            this.reconnectAttempts++;
                            try {
                                yield this.createSocket();
                            }
                            catch (error) {
                                console.error('Failed to reconnect:', error);
                            }
                        }));
                        socket.addEventListener('error', (event) => {
                            if (connectionId !== this.connectionId || socket !== this.socket) {
                                return;
                            }
                            this.stopHeartbeat();
                            const error = new Error('WebSocket error');
                            console.error('WebSocket error:', error.message);
                            this.onErrorCallbacks.forEach(callback => callback(error));
                            reject(error);
                        });
                    }
                    catch (error) {
                        reject(error);
                    }
                });
            });
        }
        closeSocket() {
            return __awaiter(this, void 0, void 0, function* () {
                this.stopHeartbeat();
                if (this.socket) {
                    return new Promise((resolve) => {
                        if (!this.socket) {
                            resolve();
                            return;
                        }
                        if (this.socket.readyState === WebSocket.OPEN ||
                            this.socket.readyState === WebSocket.CONNECTING) {
                            this.socket.addEventListener('close', () => {
                                resolve();
                            }, { once: true });
                            this.socket.close(RealtimeCode.NORMAL_CLOSURE);
                        }
                        else {
                            resolve();
                        }
                    });
                }
            });
        }
        getTimeout() {
            if (this.reconnectAttempts < 5) {
                return 1000;
            }
            else if (this.reconnectAttempts < 15) {
                return 5000;
            }
            else if (this.reconnectAttempts < 100) {
                return 10000;
            }
            else {
                return 60000;
            }
        }
        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        sendUnsubscribeMessage(subscriptionIds) {
            const ids = subscriptionIds.filter(id => typeof id === 'string' && id.length > 0);
            if (ids.length === 0) {
                return;
            }
            if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
                return;
            }
            this.socket.send(JSONbig.stringify({
                type: 'unsubscribe',
                data: ids.map(subscriptionId => ({ subscriptionId }))
            }));
        }
        generateUniqueSubscriptionId() {
            const attempts = this.activeSubscriptions.size + 1;
            for (let i = 0; i < attempts; i++) {
                const id = ID.unique();
                if (!this.activeSubscriptions.has(id)) {
                    return id;
                }
            }
            throw new AppwriteException('Failed to generate unique subscription id');
        }
        enqueuePendingSubscribe(subscriptionId) {
            var _a;
            const subscription = this.activeSubscriptions.get(subscriptionId);
            if (!subscription) {
                return;
            }
            this.pendingSubscribes.set(subscriptionId, {
                subscriptionId,
                channels: Array.from(subscription.channels),
                queries: (_a = subscription.queries) !== null && _a !== void 0 ? _a : []
            });
        }
        /**
         * Close the WebSocket connection and drop all active subscriptions client-side.
         * Use this instead of calling `unsubscribe()` on every subscription when you want to tear everything down.
         */
        disconnect() {
            return __awaiter(this, void 0, void 0, function* () {
                this.activeSubscriptions.clear();
                this.pendingSubscribes.clear();
                this.pendingPresence = undefined;
                this.appConnected = false;
                this.reconnect = false;
                // Drop the in-flight single-flight slot. Promises can't be cancelled,
                // so the underlying createSocketLocked() promise may stay pending
                // forever — e.g. when closeSocket() below tears down a CONNECTING
                // socket, the `close` event fires but `open`/`error` never do, and
                // the inner `new Promise(...)` only resolves on those. Without this
                // line, the next subscribe()/upsertPresence() would join the orphan
                // promise via the single-flight gate and hang, leaving its pending
                // subscription queued with no socket ever opened. Mirrors the Swift
                // template's socketCreationTask cancel in disconnect().
                this.socketCreationPromise = undefined;
                yield this.closeSocket();
            });
        }
        sendPendingSubscribes() {
            if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
                return;
            }
            // The WebSocket 'open' event fires when the TCP/upgrade handshake
            // completes — but the server only accepts `subscribe` frames after
            // it has emitted its own application-level `connected` event (which
            // flips `appConnected` to true in handleResponseConnected). Sending
            // before then triggers a policy-violation close on real Appwrite,
            // which reconnects, which sends early again — i.e. a duplicate-
            // socket loop. handleResponseConnected re-enqueues every active
            // subscription and calls this method again once it's safe, so the
            // queued rows are guaranteed to be sent.
            if (!this.appConnected) {
                return;
            }
            if (this.pendingSubscribes.size < 1) {
                return;
            }
            const rows = Array.from(this.pendingSubscribes.values());
            this.pendingSubscribes.clear();
            this.socket.send(JSONbig.stringify({
                type: 'subscribe',
                data: rows
            }));
        }
        /**
         * Convert a channel value to a string
         *
         * @private
         * @param {string | Channel<any> | ActionableChannel | ResolvedChannel} channel - Channel value (string or Channel builder instance)
         * @returns {string} Channel string representation
         */
        channelToString(channel) {
            if (typeof channel === 'string') {
                return channel;
            }
            // All Channel instances have toString() method
            if (channel && typeof channel.toString === 'function') {
                return channel.toString();
            }
            return String(channel);
        }
        subscribe(channelsOrChannel_1, callback_1) {
            return __awaiter(this, arguments, void 0, function* (channelsOrChannel, callback, queries = []) {
                const channelArray = Array.isArray(channelsOrChannel)
                    ? channelsOrChannel
                    : [channelsOrChannel];
                // Convert all channels to strings
                const channelStrings = channelArray.map(ch => this.channelToString(ch));
                const channels = new Set(channelStrings);
                // Convert queries to array of strings
                // Ensure each query is a separate string in the array
                const queryStrings = [];
                for (const q of (queries !== null && queries !== void 0 ? queries : [])) {
                    if (Array.isArray(q)) {
                        // Handle nested arrays: [[q1, q2]] -> [q1, q2]
                        for (const inner of q) {
                            queryStrings.push(typeof inner === 'string' ? inner : inner.toString());
                        }
                    }
                    else {
                        queryStrings.push(typeof q === 'string' ? q : q.toString());
                    }
                }
                const subscriptionId = this.generateUniqueSubscriptionId();
                this.activeSubscriptions.set(subscriptionId, {
                    channels,
                    queries: queryStrings,
                    callback
                });
                this.enqueuePendingSubscribe(subscriptionId);
                this.subCallDepth++;
                try {
                    yield this.sleep(this.DEBOUNCE_MS);
                    if (this.subCallDepth === 1) {
                        if (!this.socket || this.socket.readyState > WebSocket.OPEN) {
                            yield this.createSocket();
                        }
                        else if (this.socket.readyState === WebSocket.OPEN) {
                            this.sendPendingSubscribes();
                        }
                    }
                }
                finally {
                    this.subCallDepth--;
                }
                const unsubscribe = () => __awaiter(this, void 0, void 0, function* () {
                    if (!this.activeSubscriptions.has(subscriptionId)) {
                        return;
                    }
                    this.activeSubscriptions.delete(subscriptionId);
                    this.pendingSubscribes.delete(subscriptionId);
                    this.sendUnsubscribeMessage([subscriptionId]);
                });
                const update = (changes) => __awaiter(this, void 0, void 0, function* () {
                    const subscription = this.activeSubscriptions.get(subscriptionId);
                    if (!subscription) {
                        return;
                    }
                    if (changes.channels !== undefined) {
                        const nextChannelStrings = changes.channels.map(ch => this.channelToString(ch));
                        subscription.channels = new Set(nextChannelStrings);
                    }
                    if (changes.queries !== undefined) {
                        const nextQueries = [];
                        for (const q of changes.queries) {
                            if (Array.isArray(q)) {
                                for (const inner of q) {
                                    nextQueries.push(typeof inner === 'string' ? inner : inner.toString());
                                }
                            }
                            else {
                                nextQueries.push(typeof q === 'string' ? q : q.toString());
                            }
                        }
                        subscription.queries = nextQueries;
                    }
                    this.enqueuePendingSubscribe(subscriptionId);
                    this.subCallDepth++;
                    try {
                        yield this.sleep(this.DEBOUNCE_MS);
                        if (this.subCallDepth === 1) {
                            if (!this.socket || this.socket.readyState > WebSocket.OPEN) {
                                yield this.createSocket();
                            }
                            else if (this.socket.readyState === WebSocket.OPEN) {
                                this.sendPendingSubscribes();
                            }
                        }
                    }
                    finally {
                        this.subCallDepth--;
                    }
                });
                const close = () => __awaiter(this, void 0, void 0, function* () {
                    yield unsubscribe();
                    if (this.activeSubscriptions.size === 0) {
                        this.reconnect = false;
                        yield this.closeSocket();
                    }
                });
                return { unsubscribe, update, close };
            });
        }
        /**
         * Fire-and-forget presence upsert. Records the latest payload in state so
         * that — if the WebSocket isn't open yet, or later reconnects — only the
         * most recent presence is automatically (re)sent on the next `connected`
         * event. Repeated calls while the socket is closed collapse to the latest
         * payload (older ones are discarded).
         *
         * Returns a `Promise<void>` for API consistency; the promise resolves as
         * soon as the payload has been stored and the opportunistic send attempted.
         *
         * @param {RealtimePresenceCreate} params - Presence payload (status and presenceId required, permissions/metadata optional)
         */
        upsertPresence(params) {
            return __awaiter(this, void 0, void 0, function* () {
                const data = {
                    status: params.status,
                    presenceId: params.presenceId,
                };
                if (params.permissions !== undefined) {
                    data.permissions = params.permissions;
                }
                if (params.metadata !== undefined) {
                    data.metadata = params.metadata;
                }
                this.pendingPresence = data;
                // Both subscribe() and upsertPresence() may need to open the socket.
                // createSocket() is single-flight (see `socketCreationPromise`), so
                // calling it here is a no-op when a connection is already in flight or
                // healthy. Fire-and-forget keeps the documented fire-and-forget shape
                // of upsertPresence: the returned Promise resolves as soon as the
                // payload is stored.
                if (!this.socket || this.socket.readyState >= WebSocket.CLOSING) {
                    this.createSocket().catch((error) => {
                        console.error('Failed to open realtime socket for presence:', error);
                    });
                }
                // Opportunistic send for the case where the socket is already past the
                // `connected` handshake. The gate inside flushPendingPresence keeps
                // this a no-op until appConnected flips to true.
                this.flushPendingPresence();
            });
        }
        flushPendingPresence() {
            if (!this.pendingPresence) {
                return;
            }
            if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
                return;
            }
            if (!this.appConnected) {
                return;
            }
            this.socket.send(JSONbig.stringify({
                type: 'presence',
                data: this.pendingPresence
            }));
        }
        handleMessage(message) {
            if (!message.type) {
                return;
            }
            switch (message.type) {
                case this.TYPE_CONNECTED:
                    this.handleResponseConnected(message);
                    break;
                case this.TYPE_ERROR:
                    this.handleResponseError(message);
                    break;
                case this.TYPE_EVENT:
                    this.handleResponseEvent(message);
                    break;
                case this.TYPE_PONG:
                    // Handle pong response if needed
                    break;
            }
        }
        handleResponseConnected(message) {
            var _a, _b;
            if (!message.data) {
                return;
            }
            const messageData = message.data;
            let session = this.client.config.session;
            if (!session) {
                try {
                    const cookie = JSONbig.parse((_a = window.localStorage.getItem('cookieFallback')) !== null && _a !== void 0 ? _a : '{}');
                    session = cookie === null || cookie === void 0 ? void 0 : cookie[`a_session_${this.client.config.project}`];
                }
                catch (error) {
                    console.error('Failed to parse cookie fallback:', error);
                }
            }
            if (session && !messageData.user) {
                (_b = this.socket) === null || _b === void 0 ? void 0 : _b.send(JSONbig.stringify({
                    type: 'authentication',
                    data: {
                        session
                    }
                }));
            }
            for (const subscriptionId of this.activeSubscriptions.keys()) {
                this.enqueuePendingSubscribe(subscriptionId);
            }
            this.appConnected = true;
            this.sendPendingSubscribes();
            this.flushPendingPresence();
        }
        handleResponseError(message) {
            var _a, _b;
            const error = new AppwriteException(((_a = message.data) === null || _a === void 0 ? void 0 : _a.message) || 'Unknown error');
            const statusCode = (_b = message.data) === null || _b === void 0 ? void 0 : _b.code;
            this.onErrorCallbacks.forEach(callback => callback(error, statusCode));
        }
        handleResponseEvent(message) {
            const data = message.data;
            if (!data) {
                return;
            }
            const channels = data.channels;
            const events = data.events;
            const payload = data.payload;
            const timestamp = data.timestamp;
            const subscriptions = data.subscriptions;
            if (!channels || !events || !payload || !subscriptions || subscriptions.length === 0) {
                return;
            }
            for (const subscriptionId of subscriptions) {
                const subscription = this.activeSubscriptions.get(subscriptionId);
                if (!subscription) {
                    continue;
                }
                subscription.callback({
                    events,
                    channels,
                    timestamp,
                    payload,
                    subscriptions
                });
            }
        }
    }

    /**
     * Helper class to generate permission strings for resources.
     */
    class Permission {
    }
    /**
     * Generate read permission string for the provided role.
     *
     * @param {string} role
     * @returns {string}
     */
    Permission.read = (role) => {
        return `read("${role}")`;
    };
    /**
     * Generate write permission string for the provided role.
     *
     * This is an alias of update, delete, and possibly create.
     * Don't use write in combination with update, delete, or create.
     *
     * @param {string} role
     * @returns {string}
     */
    Permission.write = (role) => {
        return `write("${role}")`;
    };
    /**
     * Generate create permission string for the provided role.
     *
     * @param {string} role
     * @returns {string}
     */
    Permission.create = (role) => {
        return `create("${role}")`;
    };
    /**
     * Generate update permission string for the provided role.
     *
     * @param {string} role
     * @returns {string}
     */
    Permission.update = (role) => {
        return `update("${role}")`;
    };
    /**
     * Generate delete permission string for the provided role.
     *
     * @param {string} role
     * @returns {string}
     */
    Permission.delete = (role) => {
        return `delete("${role}")`;
    };

    /**
     * Helper class to generate role strings for `Permission`.
     */
    class Role {
        /**
         * Grants access to anyone.
         *
         * This includes authenticated and unauthenticated users.
         *
         * @returns {string}
         */
        static any() {
            return 'any';
        }
        /**
         * Grants access to a specific user by user ID.
         *
         * You can optionally pass verified or unverified for
         * `status` to target specific types of users.
         *
         * @param {string} id
         * @param {string} status
         * @returns {string}
         */
        static user(id, status = '') {
            if (status === '') {
                return `user:${id}`;
            }
            return `user:${id}/${status}`;
        }
        /**
         * Grants access to any authenticated or anonymous user.
         *
         * You can optionally pass verified or unverified for
         * `status` to target specific types of users.
         *
         * @param {string} status
         * @returns {string}
         */
        static users(status = '') {
            if (status === '') {
                return 'users';
            }
            return `users/${status}`;
        }
        /**
         * Grants access to any guest user without a session.
         *
         * Authenticated users don't have access to this role.
         *
         * @returns {string}
         */
        static guests() {
            return 'guests';
        }
        /**
         * Grants access to a team by team ID.
         *
         * You can optionally pass a role for `role` to target
         * team members with the specified role.
         *
         * @param {string} id
         * @param {string} role
         * @returns {string}
         */
        static team(id, role = '') {
            if (role === '') {
                return `team:${id}`;
            }
            return `team:${id}/${role}`;
        }
        /**
         * Grants access to a specific member of a team.
         *
         * When the member is removed from the team, they will
         * no longer have access.
         *
         * @param {string} id
         * @returns {string}
         */
        static member(id) {
            return `member:${id}`;
        }
        /**
         * Grants access to a user with the specified label.
         *
         * @param {string} name
         * @returns  {string}
         */
        static label(name) {
            return `label:${name}`;
        }
    }

    function normalize(id) {
        if (id === undefined || id === null) {
            throw new Error("Channel ID is required");
        }
        const trimmed = String(id).trim();
        if (trimmed === "") {
            throw new Error("Channel ID is required");
        }
        return trimmed;
    }
    class Channel {
        constructor(segments) {
            this.segments = segments;
        }
        next(segment, id) {
            const segments = id === undefined
                ? [...this.segments, segment]
                : [...this.segments, segment, normalize(id)];
            return new Channel(segments);
        }
        resolve(action) {
            return new Channel([...this.segments, action]);
        }
        toString() {
            return this.segments.join(".");
        }
        // --- DATABASE ROUTE ---
        // Only available on Channel<Database>
        collection(id) {
            return this.next("collections", id);
        }
        // Only available on Channel<Collection>
        document(id) {
            // Default: no document ID segment
            return this.next("documents", id);
        }
        // --- TABLESDB ROUTE ---
        table(id) {
            return this.next("tables", id);
        }
        row(id) {
            // Default: no row ID segment
            return this.next("rows", id);
        }
        // --- BUCKET ROUTE ---
        file(id) {
            // Default: no file ID segment
            return this.next("files", id);
        }
        // --- TERMINAL ACTIONS ---
        // Restricted to the Actionable union
        create() {
            return this.resolve("create");
        }
        upsert() {
            return this.resolve("upsert");
        }
        update() {
            return this.resolve("update");
        }
        delete() {
            return this.resolve("delete");
        }
        // --- ROOT FACTORIES ---
        static database(id) {
            return new Channel(["databases", normalize(id)]);
        }
        static execution(id) {
            return new Channel(["executions", normalize(id)]);
        }
        static tablesdb(id) {
            return new Channel(["tablesdb", normalize(id)]);
        }
        static bucket(id) {
            return new Channel(["buckets", normalize(id)]);
        }
        static function(id) {
            return new Channel(["functions", normalize(id)]);
        }
        static team(id) {
            return new Channel(["teams", normalize(id)]);
        }
        static membership(id) {
            return new Channel(["memberships", normalize(id)]);
        }
        static presence(id) {
            return new Channel(["presences", normalize(id)]);
        }
        static account() {
            return "account";
        }
        // Global events
        static documents() {
            return "documents";
        }
        static rows() {
            return "rows";
        }
        static files() {
            return "files";
        }
        static executions() {
            return "executions";
        }
        static teams() {
            return "teams";
        }
        static memberships() {
            return "memberships";
        }
        static presences() {
            return "presences";
        }
    }

    exports.Condition = void 0;
    (function (Condition) {
        Condition["Equal"] = "equal";
        Condition["NotEqual"] = "notEqual";
        Condition["GreaterThan"] = "greaterThan";
        Condition["GreaterThanEqual"] = "greaterThanEqual";
        Condition["LessThan"] = "lessThan";
        Condition["LessThanEqual"] = "lessThanEqual";
        Condition["Contains"] = "contains";
        Condition["IsNull"] = "isNull";
        Condition["IsNotNull"] = "isNotNull";
    })(exports.Condition || (exports.Condition = {}));
    /**
     * Helper class to generate operator strings for atomic operations.
     */
    class Operator {
        /**
         * Constructor for Operator class.
         *
         * @param {string} method
         * @param {OperatorValues} values
         */
        constructor(method, values) {
            this.method = method;
            if (values !== undefined) {
                if (Array.isArray(values)) {
                    this.values = values;
                }
                else {
                    this.values = [values];
                }
            }
        }
        /**
         * Convert the operator object to a JSON string.
         *
         * @returns {string}
         */
        toString() {
            return JSON.stringify({
                method: this.method,
                values: this.values,
            });
        }
    }
    /**
     * Increment a numeric attribute by a specified value.
     *
     * @param {number} value
     * @param {number} max
     * @returns {string}
     */
    Operator.increment = (value = 1, max) => {
        if (isNaN(value) || !isFinite(value)) {
            throw new Error("Value cannot be NaN or Infinity");
        }
        if (max !== undefined && (isNaN(max) || !isFinite(max))) {
            throw new Error("Max cannot be NaN or Infinity");
        }
        const values = [value];
        if (max !== undefined) {
            values.push(max);
        }
        return new Operator("increment", values).toString();
    };
    /**
     * Decrement a numeric attribute by a specified value.
     *
     * @param {number} value
     * @param {number} min
     * @returns {string}
     */
    Operator.decrement = (value = 1, min) => {
        if (isNaN(value) || !isFinite(value)) {
            throw new Error("Value cannot be NaN or Infinity");
        }
        if (min !== undefined && (isNaN(min) || !isFinite(min))) {
            throw new Error("Min cannot be NaN or Infinity");
        }
        const values = [value];
        if (min !== undefined) {
            values.push(min);
        }
        return new Operator("decrement", values).toString();
    };
    /**
     * Multiply a numeric attribute by a specified factor.
     *
     * @param {number} factor
     * @param {number} max
     * @returns {string}
     */
    Operator.multiply = (factor, max) => {
        if (isNaN(factor) || !isFinite(factor)) {
            throw new Error("Factor cannot be NaN or Infinity");
        }
        if (max !== undefined && (isNaN(max) || !isFinite(max))) {
            throw new Error("Max cannot be NaN or Infinity");
        }
        const values = [factor];
        if (max !== undefined) {
            values.push(max);
        }
        return new Operator("multiply", values).toString();
    };
    /**
     * Divide a numeric attribute by a specified divisor.
     *
     * @param {number} divisor
     * @param {number} min
     * @returns {string}
     */
    Operator.divide = (divisor, min) => {
        if (isNaN(divisor) || !isFinite(divisor)) {
            throw new Error("Divisor cannot be NaN or Infinity");
        }
        if (min !== undefined && (isNaN(min) || !isFinite(min))) {
            throw new Error("Min cannot be NaN or Infinity");
        }
        if (divisor === 0) {
            throw new Error("Divisor cannot be zero");
        }
        const values = [divisor];
        if (min !== undefined) {
            values.push(min);
        }
        return new Operator("divide", values).toString();
    };
    /**
     * Apply modulo operation on a numeric attribute.
     *
     * @param {number} divisor
     * @returns {string}
     */
    Operator.modulo = (divisor) => {
        if (isNaN(divisor) || !isFinite(divisor)) {
            throw new Error("Divisor cannot be NaN or Infinity");
        }
        if (divisor === 0) {
            throw new Error("Divisor cannot be zero");
        }
        return new Operator("modulo", [divisor]).toString();
    };
    /**
     * Raise a numeric attribute to a specified power.
     *
     * @param {number} exponent
     * @param {number} max
     * @returns {string}
     */
    Operator.power = (exponent, max) => {
        if (isNaN(exponent) || !isFinite(exponent)) {
            throw new Error("Exponent cannot be NaN or Infinity");
        }
        if (max !== undefined && (isNaN(max) || !isFinite(max))) {
            throw new Error("Max cannot be NaN or Infinity");
        }
        const values = [exponent];
        if (max !== undefined) {
            values.push(max);
        }
        return new Operator("power", values).toString();
    };
    /**
     * Append values to an array attribute.
     *
     * @param {any[]} values
     * @returns {string}
     */
    Operator.arrayAppend = (values) => new Operator("arrayAppend", values).toString();
    /**
     * Prepend values to an array attribute.
     *
     * @param {any[]} values
     * @returns {string}
     */
    Operator.arrayPrepend = (values) => new Operator("arrayPrepend", values).toString();
    /**
     * Insert a value at a specific index in an array attribute.
     *
     * @param {number} index
     * @param {any} value
     * @returns {string}
     */
    Operator.arrayInsert = (index, value) => new Operator("arrayInsert", [index, value]).toString();
    /**
     * Remove a value from an array attribute.
     *
     * @param {any} value
     * @returns {string}
     */
    Operator.arrayRemove = (value) => new Operator("arrayRemove", [value]).toString();
    /**
     * Remove duplicate values from an array attribute.
     *
     * @returns {string}
     */
    Operator.arrayUnique = () => new Operator("arrayUnique", []).toString();
    /**
     * Keep only values that exist in both the current array and the provided array.
     *
     * @param {any[]} values
     * @returns {string}
     */
    Operator.arrayIntersect = (values) => new Operator("arrayIntersect", values).toString();
    /**
     * Remove values from the array that exist in the provided array.
     *
     * @param {any[]} values
     * @returns {string}
     */
    Operator.arrayDiff = (values) => new Operator("arrayDiff", values).toString();
    /**
     * Filter array values based on a condition.
     *
     * @param {Condition} condition
     * @param {any} value
     * @returns {string}
     */
    Operator.arrayFilter = (condition, value) => {
        const values = [condition, value === undefined ? null : value];
        return new Operator("arrayFilter", values).toString();
    };
    /**
     * Concatenate a value to a string or array attribute.
     *
     * @param {any} value
     * @returns {string}
     */
    Operator.stringConcat = (value) => new Operator("stringConcat", [value]).toString();
    /**
     * Replace occurrences of a search string with a replacement string.
     *
     * @param {string} search
     * @param {string} replace
     * @returns {string}
     */
    Operator.stringReplace = (search, replace) => new Operator("stringReplace", [search, replace]).toString();
    /**
     * Toggle a boolean attribute.
     *
     * @returns {string}
     */
    Operator.toggle = () => new Operator("toggle", []).toString();
    /**
     * Add days to a date attribute.
     *
     * @param {number} days
     * @returns {string}
     */
    Operator.dateAddDays = (days) => new Operator("dateAddDays", [days]).toString();
    /**
     * Subtract days from a date attribute.
     *
     * @param {number} days
     * @returns {string}
     */
    Operator.dateSubDays = (days) => new Operator("dateSubDays", [days]).toString();
    /**
     * Set a date attribute to the current date and time.
     *
     * @returns {string}
     */
    Operator.dateSetNow = () => new Operator("dateSetNow", []).toString();

    exports.AuthenticatorType = void 0;
    (function (AuthenticatorType) {
        AuthenticatorType["Totp"] = "totp";
    })(exports.AuthenticatorType || (exports.AuthenticatorType = {}));

    exports.AuthenticationFactor = void 0;
    (function (AuthenticationFactor) {
        AuthenticationFactor["Email"] = "email";
        AuthenticationFactor["Phone"] = "phone";
        AuthenticationFactor["Totp"] = "totp";
        AuthenticationFactor["Recoverycode"] = "recoverycode";
    })(exports.AuthenticationFactor || (exports.AuthenticationFactor = {}));

    exports.OAuthProvider = void 0;
    (function (OAuthProvider) {
        OAuthProvider["Amazon"] = "amazon";
        OAuthProvider["Apple"] = "apple";
        OAuthProvider["Appwrite"] = "appwrite";
        OAuthProvider["Auth0"] = "auth0";
        OAuthProvider["Authentik"] = "authentik";
        OAuthProvider["Autodesk"] = "autodesk";
        OAuthProvider["Bitbucket"] = "bitbucket";
        OAuthProvider["Bitly"] = "bitly";
        OAuthProvider["Box"] = "box";
        OAuthProvider["Dailymotion"] = "dailymotion";
        OAuthProvider["Discord"] = "discord";
        OAuthProvider["Disqus"] = "disqus";
        OAuthProvider["Dropbox"] = "dropbox";
        OAuthProvider["Etsy"] = "etsy";
        OAuthProvider["Facebook"] = "facebook";
        OAuthProvider["Figma"] = "figma";
        OAuthProvider["Fusionauth"] = "fusionauth";
        OAuthProvider["Github"] = "github";
        OAuthProvider["Gitlab"] = "gitlab";
        OAuthProvider["Google"] = "google";
        OAuthProvider["Keycloak"] = "keycloak";
        OAuthProvider["Kick"] = "kick";
        OAuthProvider["Linkedin"] = "linkedin";
        OAuthProvider["Microsoft"] = "microsoft";
        OAuthProvider["Notion"] = "notion";
        OAuthProvider["Oidc"] = "oidc";
        OAuthProvider["Okta"] = "okta";
        OAuthProvider["Paypal"] = "paypal";
        OAuthProvider["PaypalSandbox"] = "paypalSandbox";
        OAuthProvider["Podio"] = "podio";
        OAuthProvider["Salesforce"] = "salesforce";
        OAuthProvider["Slack"] = "slack";
        OAuthProvider["Spotify"] = "spotify";
        OAuthProvider["Stripe"] = "stripe";
        OAuthProvider["Tradeshift"] = "tradeshift";
        OAuthProvider["TradeshiftBox"] = "tradeshiftBox";
        OAuthProvider["Twitch"] = "twitch";
        OAuthProvider["Wordpress"] = "wordpress";
        OAuthProvider["X"] = "x";
        OAuthProvider["Yahoo"] = "yahoo";
        OAuthProvider["Yammer"] = "yammer";
        OAuthProvider["Yandex"] = "yandex";
        OAuthProvider["Zoho"] = "zoho";
        OAuthProvider["Zoom"] = "zoom";
    })(exports.OAuthProvider || (exports.OAuthProvider = {}));

    exports.Browser = void 0;
    (function (Browser) {
        Browser["AvantBrowser"] = "aa";
        Browser["AndroidWebViewBeta"] = "an";
        Browser["GoogleChrome"] = "ch";
        Browser["GoogleChromeIOS"] = "ci";
        Browser["GoogleChromeMobile"] = "cm";
        Browser["Chromium"] = "cr";
        Browser["MozillaFirefox"] = "ff";
        Browser["Safari"] = "sf";
        Browser["MobileSafari"] = "mf";
        Browser["MicrosoftEdge"] = "ps";
        Browser["MicrosoftEdgeIOS"] = "oi";
        Browser["OperaMini"] = "om";
        Browser["Opera"] = "op";
        Browser["OperaNext"] = "on";
    })(exports.Browser || (exports.Browser = {}));

    exports.CreditCard = void 0;
    (function (CreditCard) {
        CreditCard["AmericanExpress"] = "amex";
        CreditCard["Argencard"] = "argencard";
        CreditCard["Cabal"] = "cabal";
        CreditCard["Cencosud"] = "cencosud";
        CreditCard["DinersClub"] = "diners";
        CreditCard["Discover"] = "discover";
        CreditCard["Elo"] = "elo";
        CreditCard["Hipercard"] = "hipercard";
        CreditCard["JCB"] = "jcb";
        CreditCard["Mastercard"] = "mastercard";
        CreditCard["Naranja"] = "naranja";
        CreditCard["TarjetaShopping"] = "targeta-shopping";
        CreditCard["UnionPay"] = "unionpay";
        CreditCard["Visa"] = "visa";
        CreditCard["MIR"] = "mir";
        CreditCard["Maestro"] = "maestro";
        CreditCard["Rupay"] = "rupay";
    })(exports.CreditCard || (exports.CreditCard = {}));

    exports.Flag = void 0;
    (function (Flag) {
        Flag["Afghanistan"] = "af";
        Flag["Angola"] = "ao";
        Flag["Albania"] = "al";
        Flag["Andorra"] = "ad";
        Flag["UnitedArabEmirates"] = "ae";
        Flag["Argentina"] = "ar";
        Flag["Armenia"] = "am";
        Flag["AntiguaAndBarbuda"] = "ag";
        Flag["Australia"] = "au";
        Flag["Austria"] = "at";
        Flag["Azerbaijan"] = "az";
        Flag["Burundi"] = "bi";
        Flag["Belgium"] = "be";
        Flag["Benin"] = "bj";
        Flag["BurkinaFaso"] = "bf";
        Flag["Bangladesh"] = "bd";
        Flag["Bulgaria"] = "bg";
        Flag["Bahrain"] = "bh";
        Flag["Bahamas"] = "bs";
        Flag["BosniaAndHerzegovina"] = "ba";
        Flag["Belarus"] = "by";
        Flag["Belize"] = "bz";
        Flag["Bolivia"] = "bo";
        Flag["Brazil"] = "br";
        Flag["Barbados"] = "bb";
        Flag["BruneiDarussalam"] = "bn";
        Flag["Bhutan"] = "bt";
        Flag["Botswana"] = "bw";
        Flag["CentralAfricanRepublic"] = "cf";
        Flag["Canada"] = "ca";
        Flag["Switzerland"] = "ch";
        Flag["Chile"] = "cl";
        Flag["China"] = "cn";
        Flag["CoteDIvoire"] = "ci";
        Flag["Cameroon"] = "cm";
        Flag["DemocraticRepublicOfTheCongo"] = "cd";
        Flag["RepublicOfTheCongo"] = "cg";
        Flag["Colombia"] = "co";
        Flag["Comoros"] = "km";
        Flag["CapeVerde"] = "cv";
        Flag["CostaRica"] = "cr";
        Flag["Cuba"] = "cu";
        Flag["Cyprus"] = "cy";
        Flag["CzechRepublic"] = "cz";
        Flag["Germany"] = "de";
        Flag["Djibouti"] = "dj";
        Flag["Dominica"] = "dm";
        Flag["Denmark"] = "dk";
        Flag["DominicanRepublic"] = "do";
        Flag["Algeria"] = "dz";
        Flag["Ecuador"] = "ec";
        Flag["Egypt"] = "eg";
        Flag["Eritrea"] = "er";
        Flag["Spain"] = "es";
        Flag["Estonia"] = "ee";
        Flag["Ethiopia"] = "et";
        Flag["Finland"] = "fi";
        Flag["Fiji"] = "fj";
        Flag["France"] = "fr";
        Flag["MicronesiaFederatedStatesOf"] = "fm";
        Flag["Gabon"] = "ga";
        Flag["UnitedKingdom"] = "gb";
        Flag["Georgia"] = "ge";
        Flag["Ghana"] = "gh";
        Flag["Guinea"] = "gn";
        Flag["Gambia"] = "gm";
        Flag["GuineaBissau"] = "gw";
        Flag["EquatorialGuinea"] = "gq";
        Flag["Greece"] = "gr";
        Flag["Grenada"] = "gd";
        Flag["Guatemala"] = "gt";
        Flag["Guyana"] = "gy";
        Flag["Honduras"] = "hn";
        Flag["Croatia"] = "hr";
        Flag["Haiti"] = "ht";
        Flag["Hungary"] = "hu";
        Flag["Indonesia"] = "id";
        Flag["India"] = "in";
        Flag["Ireland"] = "ie";
        Flag["IranIslamicRepublicOf"] = "ir";
        Flag["Iraq"] = "iq";
        Flag["Iceland"] = "is";
        Flag["Israel"] = "il";
        Flag["Italy"] = "it";
        Flag["Jamaica"] = "jm";
        Flag["Jordan"] = "jo";
        Flag["Japan"] = "jp";
        Flag["Kazakhstan"] = "kz";
        Flag["Kenya"] = "ke";
        Flag["Kyrgyzstan"] = "kg";
        Flag["Cambodia"] = "kh";
        Flag["Kiribati"] = "ki";
        Flag["SaintKittsAndNevis"] = "kn";
        Flag["SouthKorea"] = "kr";
        Flag["Kuwait"] = "kw";
        Flag["LaoPeopleSDemocraticRepublic"] = "la";
        Flag["Lebanon"] = "lb";
        Flag["Liberia"] = "lr";
        Flag["Libya"] = "ly";
        Flag["SaintLucia"] = "lc";
        Flag["Liechtenstein"] = "li";
        Flag["SriLanka"] = "lk";
        Flag["Lesotho"] = "ls";
        Flag["Lithuania"] = "lt";
        Flag["Luxembourg"] = "lu";
        Flag["Latvia"] = "lv";
        Flag["Morocco"] = "ma";
        Flag["Monaco"] = "mc";
        Flag["Moldova"] = "md";
        Flag["Madagascar"] = "mg";
        Flag["Maldives"] = "mv";
        Flag["Mexico"] = "mx";
        Flag["MarshallIslands"] = "mh";
        Flag["NorthMacedonia"] = "mk";
        Flag["Mali"] = "ml";
        Flag["Malta"] = "mt";
        Flag["Myanmar"] = "mm";
        Flag["Montenegro"] = "me";
        Flag["Mongolia"] = "mn";
        Flag["Mozambique"] = "mz";
        Flag["Mauritania"] = "mr";
        Flag["Mauritius"] = "mu";
        Flag["Malawi"] = "mw";
        Flag["Malaysia"] = "my";
        Flag["Namibia"] = "na";
        Flag["Niger"] = "ne";
        Flag["Nigeria"] = "ng";
        Flag["Nicaragua"] = "ni";
        Flag["Netherlands"] = "nl";
        Flag["Norway"] = "no";
        Flag["Nepal"] = "np";
        Flag["Nauru"] = "nr";
        Flag["NewZealand"] = "nz";
        Flag["Oman"] = "om";
        Flag["Pakistan"] = "pk";
        Flag["Panama"] = "pa";
        Flag["Peru"] = "pe";
        Flag["Philippines"] = "ph";
        Flag["Palau"] = "pw";
        Flag["PapuaNewGuinea"] = "pg";
        Flag["Poland"] = "pl";
        Flag["FrenchPolynesia"] = "pf";
        Flag["NorthKorea"] = "kp";
        Flag["Portugal"] = "pt";
        Flag["Paraguay"] = "py";
        Flag["Qatar"] = "qa";
        Flag["Romania"] = "ro";
        Flag["Russia"] = "ru";
        Flag["Rwanda"] = "rw";
        Flag["SaudiArabia"] = "sa";
        Flag["Sudan"] = "sd";
        Flag["Senegal"] = "sn";
        Flag["Singapore"] = "sg";
        Flag["SolomonIslands"] = "sb";
        Flag["SierraLeone"] = "sl";
        Flag["ElSalvador"] = "sv";
        Flag["SanMarino"] = "sm";
        Flag["Somalia"] = "so";
        Flag["Serbia"] = "rs";
        Flag["SouthSudan"] = "ss";
        Flag["SaoTomeAndPrincipe"] = "st";
        Flag["Suriname"] = "sr";
        Flag["Slovakia"] = "sk";
        Flag["Slovenia"] = "si";
        Flag["Sweden"] = "se";
        Flag["Eswatini"] = "sz";
        Flag["Seychelles"] = "sc";
        Flag["Syria"] = "sy";
        Flag["Chad"] = "td";
        Flag["Togo"] = "tg";
        Flag["Thailand"] = "th";
        Flag["Tajikistan"] = "tj";
        Flag["Turkmenistan"] = "tm";
        Flag["TimorLeste"] = "tl";
        Flag["Tonga"] = "to";
        Flag["TrinidadAndTobago"] = "tt";
        Flag["Tunisia"] = "tn";
        Flag["Turkey"] = "tr";
        Flag["Tuvalu"] = "tv";
        Flag["Tanzania"] = "tz";
        Flag["Uganda"] = "ug";
        Flag["Ukraine"] = "ua";
        Flag["Uruguay"] = "uy";
        Flag["UnitedStates"] = "us";
        Flag["Uzbekistan"] = "uz";
        Flag["VaticanCity"] = "va";
        Flag["SaintVincentAndTheGrenadines"] = "vc";
        Flag["Venezuela"] = "ve";
        Flag["Vietnam"] = "vn";
        Flag["Vanuatu"] = "vu";
        Flag["Samoa"] = "ws";
        Flag["Yemen"] = "ye";
        Flag["SouthAfrica"] = "za";
        Flag["Zambia"] = "zm";
        Flag["Zimbabwe"] = "zw";
    })(exports.Flag || (exports.Flag = {}));

    exports.BrowserTheme = void 0;
    (function (BrowserTheme) {
        BrowserTheme["Light"] = "light";
        BrowserTheme["Dark"] = "dark";
    })(exports.BrowserTheme || (exports.BrowserTheme = {}));

    exports.Timezone = void 0;
    (function (Timezone) {
        Timezone["AfricaAbidjan"] = "africa/abidjan";
        Timezone["AfricaAccra"] = "africa/accra";
        Timezone["AfricaAddisAbaba"] = "africa/addis_ababa";
        Timezone["AfricaAlgiers"] = "africa/algiers";
        Timezone["AfricaAsmara"] = "africa/asmara";
        Timezone["AfricaBamako"] = "africa/bamako";
        Timezone["AfricaBangui"] = "africa/bangui";
        Timezone["AfricaBanjul"] = "africa/banjul";
        Timezone["AfricaBissau"] = "africa/bissau";
        Timezone["AfricaBlantyre"] = "africa/blantyre";
        Timezone["AfricaBrazzaville"] = "africa/brazzaville";
        Timezone["AfricaBujumbura"] = "africa/bujumbura";
        Timezone["AfricaCairo"] = "africa/cairo";
        Timezone["AfricaCasablanca"] = "africa/casablanca";
        Timezone["AfricaCeuta"] = "africa/ceuta";
        Timezone["AfricaConakry"] = "africa/conakry";
        Timezone["AfricaDakar"] = "africa/dakar";
        Timezone["AfricaDarEsSalaam"] = "africa/dar_es_salaam";
        Timezone["AfricaDjibouti"] = "africa/djibouti";
        Timezone["AfricaDouala"] = "africa/douala";
        Timezone["AfricaElAaiun"] = "africa/el_aaiun";
        Timezone["AfricaFreetown"] = "africa/freetown";
        Timezone["AfricaGaborone"] = "africa/gaborone";
        Timezone["AfricaHarare"] = "africa/harare";
        Timezone["AfricaJohannesburg"] = "africa/johannesburg";
        Timezone["AfricaJuba"] = "africa/juba";
        Timezone["AfricaKampala"] = "africa/kampala";
        Timezone["AfricaKhartoum"] = "africa/khartoum";
        Timezone["AfricaKigali"] = "africa/kigali";
        Timezone["AfricaKinshasa"] = "africa/kinshasa";
        Timezone["AfricaLagos"] = "africa/lagos";
        Timezone["AfricaLibreville"] = "africa/libreville";
        Timezone["AfricaLome"] = "africa/lome";
        Timezone["AfricaLuanda"] = "africa/luanda";
        Timezone["AfricaLubumbashi"] = "africa/lubumbashi";
        Timezone["AfricaLusaka"] = "africa/lusaka";
        Timezone["AfricaMalabo"] = "africa/malabo";
        Timezone["AfricaMaputo"] = "africa/maputo";
        Timezone["AfricaMaseru"] = "africa/maseru";
        Timezone["AfricaMbabane"] = "africa/mbabane";
        Timezone["AfricaMogadishu"] = "africa/mogadishu";
        Timezone["AfricaMonrovia"] = "africa/monrovia";
        Timezone["AfricaNairobi"] = "africa/nairobi";
        Timezone["AfricaNdjamena"] = "africa/ndjamena";
        Timezone["AfricaNiamey"] = "africa/niamey";
        Timezone["AfricaNouakchott"] = "africa/nouakchott";
        Timezone["AfricaOuagadougou"] = "africa/ouagadougou";
        Timezone["AfricaPortonovo"] = "africa/porto-novo";
        Timezone["AfricaSaoTome"] = "africa/sao_tome";
        Timezone["AfricaTripoli"] = "africa/tripoli";
        Timezone["AfricaTunis"] = "africa/tunis";
        Timezone["AfricaWindhoek"] = "africa/windhoek";
        Timezone["AmericaAdak"] = "america/adak";
        Timezone["AmericaAnchorage"] = "america/anchorage";
        Timezone["AmericaAnguilla"] = "america/anguilla";
        Timezone["AmericaAntigua"] = "america/antigua";
        Timezone["AmericaAraguaina"] = "america/araguaina";
        Timezone["AmericaArgentinaBuenosAires"] = "america/argentina/buenos_aires";
        Timezone["AmericaArgentinaCatamarca"] = "america/argentina/catamarca";
        Timezone["AmericaArgentinaCordoba"] = "america/argentina/cordoba";
        Timezone["AmericaArgentinaJujuy"] = "america/argentina/jujuy";
        Timezone["AmericaArgentinaLaRioja"] = "america/argentina/la_rioja";
        Timezone["AmericaArgentinaMendoza"] = "america/argentina/mendoza";
        Timezone["AmericaArgentinaRioGallegos"] = "america/argentina/rio_gallegos";
        Timezone["AmericaArgentinaSalta"] = "america/argentina/salta";
        Timezone["AmericaArgentinaSanJuan"] = "america/argentina/san_juan";
        Timezone["AmericaArgentinaSanLuis"] = "america/argentina/san_luis";
        Timezone["AmericaArgentinaTucuman"] = "america/argentina/tucuman";
        Timezone["AmericaArgentinaUshuaia"] = "america/argentina/ushuaia";
        Timezone["AmericaAruba"] = "america/aruba";
        Timezone["AmericaAsuncion"] = "america/asuncion";
        Timezone["AmericaAtikokan"] = "america/atikokan";
        Timezone["AmericaBahia"] = "america/bahia";
        Timezone["AmericaBahiaBanderas"] = "america/bahia_banderas";
        Timezone["AmericaBarbados"] = "america/barbados";
        Timezone["AmericaBelem"] = "america/belem";
        Timezone["AmericaBelize"] = "america/belize";
        Timezone["AmericaBlancsablon"] = "america/blanc-sablon";
        Timezone["AmericaBoaVista"] = "america/boa_vista";
        Timezone["AmericaBogota"] = "america/bogota";
        Timezone["AmericaBoise"] = "america/boise";
        Timezone["AmericaCambridgeBay"] = "america/cambridge_bay";
        Timezone["AmericaCampoGrande"] = "america/campo_grande";
        Timezone["AmericaCancun"] = "america/cancun";
        Timezone["AmericaCaracas"] = "america/caracas";
        Timezone["AmericaCayenne"] = "america/cayenne";
        Timezone["AmericaCayman"] = "america/cayman";
        Timezone["AmericaChicago"] = "america/chicago";
        Timezone["AmericaChihuahua"] = "america/chihuahua";
        Timezone["AmericaCiudadJuarez"] = "america/ciudad_juarez";
        Timezone["AmericaCostaRica"] = "america/costa_rica";
        Timezone["AmericaCoyhaique"] = "america/coyhaique";
        Timezone["AmericaCreston"] = "america/creston";
        Timezone["AmericaCuiaba"] = "america/cuiaba";
        Timezone["AmericaCuracao"] = "america/curacao";
        Timezone["AmericaDanmarkshavn"] = "america/danmarkshavn";
        Timezone["AmericaDawson"] = "america/dawson";
        Timezone["AmericaDawsonCreek"] = "america/dawson_creek";
        Timezone["AmericaDenver"] = "america/denver";
        Timezone["AmericaDetroit"] = "america/detroit";
        Timezone["AmericaDominica"] = "america/dominica";
        Timezone["AmericaEdmonton"] = "america/edmonton";
        Timezone["AmericaEirunepe"] = "america/eirunepe";
        Timezone["AmericaElSalvador"] = "america/el_salvador";
        Timezone["AmericaFortNelson"] = "america/fort_nelson";
        Timezone["AmericaFortaleza"] = "america/fortaleza";
        Timezone["AmericaGlaceBay"] = "america/glace_bay";
        Timezone["AmericaGooseBay"] = "america/goose_bay";
        Timezone["AmericaGrandTurk"] = "america/grand_turk";
        Timezone["AmericaGrenada"] = "america/grenada";
        Timezone["AmericaGuadeloupe"] = "america/guadeloupe";
        Timezone["AmericaGuatemala"] = "america/guatemala";
        Timezone["AmericaGuayaquil"] = "america/guayaquil";
        Timezone["AmericaGuyana"] = "america/guyana";
        Timezone["AmericaHalifax"] = "america/halifax";
        Timezone["AmericaHavana"] = "america/havana";
        Timezone["AmericaHermosillo"] = "america/hermosillo";
        Timezone["AmericaIndianaIndianapolis"] = "america/indiana/indianapolis";
        Timezone["AmericaIndianaKnox"] = "america/indiana/knox";
        Timezone["AmericaIndianaMarengo"] = "america/indiana/marengo";
        Timezone["AmericaIndianaPetersburg"] = "america/indiana/petersburg";
        Timezone["AmericaIndianaTellCity"] = "america/indiana/tell_city";
        Timezone["AmericaIndianaVevay"] = "america/indiana/vevay";
        Timezone["AmericaIndianaVincennes"] = "america/indiana/vincennes";
        Timezone["AmericaIndianaWinamac"] = "america/indiana/winamac";
        Timezone["AmericaInuvik"] = "america/inuvik";
        Timezone["AmericaIqaluit"] = "america/iqaluit";
        Timezone["AmericaJamaica"] = "america/jamaica";
        Timezone["AmericaJuneau"] = "america/juneau";
        Timezone["AmericaKentuckyLouisville"] = "america/kentucky/louisville";
        Timezone["AmericaKentuckyMonticello"] = "america/kentucky/monticello";
        Timezone["AmericaKralendijk"] = "america/kralendijk";
        Timezone["AmericaLaPaz"] = "america/la_paz";
        Timezone["AmericaLima"] = "america/lima";
        Timezone["AmericaLosAngeles"] = "america/los_angeles";
        Timezone["AmericaLowerPrinces"] = "america/lower_princes";
        Timezone["AmericaMaceio"] = "america/maceio";
        Timezone["AmericaManagua"] = "america/managua";
        Timezone["AmericaManaus"] = "america/manaus";
        Timezone["AmericaMarigot"] = "america/marigot";
        Timezone["AmericaMartinique"] = "america/martinique";
        Timezone["AmericaMatamoros"] = "america/matamoros";
        Timezone["AmericaMazatlan"] = "america/mazatlan";
        Timezone["AmericaMenominee"] = "america/menominee";
        Timezone["AmericaMerida"] = "america/merida";
        Timezone["AmericaMetlakatla"] = "america/metlakatla";
        Timezone["AmericaMexicoCity"] = "america/mexico_city";
        Timezone["AmericaMiquelon"] = "america/miquelon";
        Timezone["AmericaMoncton"] = "america/moncton";
        Timezone["AmericaMonterrey"] = "america/monterrey";
        Timezone["AmericaMontevideo"] = "america/montevideo";
        Timezone["AmericaMontserrat"] = "america/montserrat";
        Timezone["AmericaNassau"] = "america/nassau";
        Timezone["AmericaNewYork"] = "america/new_york";
        Timezone["AmericaNome"] = "america/nome";
        Timezone["AmericaNoronha"] = "america/noronha";
        Timezone["AmericaNorthDakotaBeulah"] = "america/north_dakota/beulah";
        Timezone["AmericaNorthDakotaCenter"] = "america/north_dakota/center";
        Timezone["AmericaNorthDakotaNewSalem"] = "america/north_dakota/new_salem";
        Timezone["AmericaNuuk"] = "america/nuuk";
        Timezone["AmericaOjinaga"] = "america/ojinaga";
        Timezone["AmericaPanama"] = "america/panama";
        Timezone["AmericaParamaribo"] = "america/paramaribo";
        Timezone["AmericaPhoenix"] = "america/phoenix";
        Timezone["AmericaPortauprince"] = "america/port-au-prince";
        Timezone["AmericaPortOfSpain"] = "america/port_of_spain";
        Timezone["AmericaPortoVelho"] = "america/porto_velho";
        Timezone["AmericaPuertoRico"] = "america/puerto_rico";
        Timezone["AmericaPuntaArenas"] = "america/punta_arenas";
        Timezone["AmericaRankinInlet"] = "america/rankin_inlet";
        Timezone["AmericaRecife"] = "america/recife";
        Timezone["AmericaRegina"] = "america/regina";
        Timezone["AmericaResolute"] = "america/resolute";
        Timezone["AmericaRioBranco"] = "america/rio_branco";
        Timezone["AmericaSantarem"] = "america/santarem";
        Timezone["AmericaSantiago"] = "america/santiago";
        Timezone["AmericaSantoDomingo"] = "america/santo_domingo";
        Timezone["AmericaSaoPaulo"] = "america/sao_paulo";
        Timezone["AmericaScoresbysund"] = "america/scoresbysund";
        Timezone["AmericaSitka"] = "america/sitka";
        Timezone["AmericaStBarthelemy"] = "america/st_barthelemy";
        Timezone["AmericaStJohns"] = "america/st_johns";
        Timezone["AmericaStKitts"] = "america/st_kitts";
        Timezone["AmericaStLucia"] = "america/st_lucia";
        Timezone["AmericaStThomas"] = "america/st_thomas";
        Timezone["AmericaStVincent"] = "america/st_vincent";
        Timezone["AmericaSwiftCurrent"] = "america/swift_current";
        Timezone["AmericaTegucigalpa"] = "america/tegucigalpa";
        Timezone["AmericaThule"] = "america/thule";
        Timezone["AmericaTijuana"] = "america/tijuana";
        Timezone["AmericaToronto"] = "america/toronto";
        Timezone["AmericaTortola"] = "america/tortola";
        Timezone["AmericaVancouver"] = "america/vancouver";
        Timezone["AmericaWhitehorse"] = "america/whitehorse";
        Timezone["AmericaWinnipeg"] = "america/winnipeg";
        Timezone["AmericaYakutat"] = "america/yakutat";
        Timezone["AntarcticaCasey"] = "antarctica/casey";
        Timezone["AntarcticaDavis"] = "antarctica/davis";
        Timezone["AntarcticaDumontdurville"] = "antarctica/dumontdurville";
        Timezone["AntarcticaMacquarie"] = "antarctica/macquarie";
        Timezone["AntarcticaMawson"] = "antarctica/mawson";
        Timezone["AntarcticaMcmurdo"] = "antarctica/mcmurdo";
        Timezone["AntarcticaPalmer"] = "antarctica/palmer";
        Timezone["AntarcticaRothera"] = "antarctica/rothera";
        Timezone["AntarcticaSyowa"] = "antarctica/syowa";
        Timezone["AntarcticaTroll"] = "antarctica/troll";
        Timezone["AntarcticaVostok"] = "antarctica/vostok";
        Timezone["ArcticLongyearbyen"] = "arctic/longyearbyen";
        Timezone["AsiaAden"] = "asia/aden";
        Timezone["AsiaAlmaty"] = "asia/almaty";
        Timezone["AsiaAmman"] = "asia/amman";
        Timezone["AsiaAnadyr"] = "asia/anadyr";
        Timezone["AsiaAqtau"] = "asia/aqtau";
        Timezone["AsiaAqtobe"] = "asia/aqtobe";
        Timezone["AsiaAshgabat"] = "asia/ashgabat";
        Timezone["AsiaAtyrau"] = "asia/atyrau";
        Timezone["AsiaBaghdad"] = "asia/baghdad";
        Timezone["AsiaBahrain"] = "asia/bahrain";
        Timezone["AsiaBaku"] = "asia/baku";
        Timezone["AsiaBangkok"] = "asia/bangkok";
        Timezone["AsiaBarnaul"] = "asia/barnaul";
        Timezone["AsiaBeirut"] = "asia/beirut";
        Timezone["AsiaBishkek"] = "asia/bishkek";
        Timezone["AsiaBrunei"] = "asia/brunei";
        Timezone["AsiaChita"] = "asia/chita";
        Timezone["AsiaColombo"] = "asia/colombo";
        Timezone["AsiaDamascus"] = "asia/damascus";
        Timezone["AsiaDhaka"] = "asia/dhaka";
        Timezone["AsiaDili"] = "asia/dili";
        Timezone["AsiaDubai"] = "asia/dubai";
        Timezone["AsiaDushanbe"] = "asia/dushanbe";
        Timezone["AsiaFamagusta"] = "asia/famagusta";
        Timezone["AsiaGaza"] = "asia/gaza";
        Timezone["AsiaHebron"] = "asia/hebron";
        Timezone["AsiaHoChiMinh"] = "asia/ho_chi_minh";
        Timezone["AsiaHongKong"] = "asia/hong_kong";
        Timezone["AsiaHovd"] = "asia/hovd";
        Timezone["AsiaIrkutsk"] = "asia/irkutsk";
        Timezone["AsiaJakarta"] = "asia/jakarta";
        Timezone["AsiaJayapura"] = "asia/jayapura";
        Timezone["AsiaJerusalem"] = "asia/jerusalem";
        Timezone["AsiaKabul"] = "asia/kabul";
        Timezone["AsiaKamchatka"] = "asia/kamchatka";
        Timezone["AsiaKarachi"] = "asia/karachi";
        Timezone["AsiaKathmandu"] = "asia/kathmandu";
        Timezone["AsiaKhandyga"] = "asia/khandyga";
        Timezone["AsiaKolkata"] = "asia/kolkata";
        Timezone["AsiaKrasnoyarsk"] = "asia/krasnoyarsk";
        Timezone["AsiaKualaLumpur"] = "asia/kuala_lumpur";
        Timezone["AsiaKuching"] = "asia/kuching";
        Timezone["AsiaKuwait"] = "asia/kuwait";
        Timezone["AsiaMacau"] = "asia/macau";
        Timezone["AsiaMagadan"] = "asia/magadan";
        Timezone["AsiaMakassar"] = "asia/makassar";
        Timezone["AsiaManila"] = "asia/manila";
        Timezone["AsiaMuscat"] = "asia/muscat";
        Timezone["AsiaNicosia"] = "asia/nicosia";
        Timezone["AsiaNovokuznetsk"] = "asia/novokuznetsk";
        Timezone["AsiaNovosibirsk"] = "asia/novosibirsk";
        Timezone["AsiaOmsk"] = "asia/omsk";
        Timezone["AsiaOral"] = "asia/oral";
        Timezone["AsiaPhnomPenh"] = "asia/phnom_penh";
        Timezone["AsiaPontianak"] = "asia/pontianak";
        Timezone["AsiaPyongyang"] = "asia/pyongyang";
        Timezone["AsiaQatar"] = "asia/qatar";
        Timezone["AsiaQostanay"] = "asia/qostanay";
        Timezone["AsiaQyzylorda"] = "asia/qyzylorda";
        Timezone["AsiaRiyadh"] = "asia/riyadh";
        Timezone["AsiaSakhalin"] = "asia/sakhalin";
        Timezone["AsiaSamarkand"] = "asia/samarkand";
        Timezone["AsiaSeoul"] = "asia/seoul";
        Timezone["AsiaShanghai"] = "asia/shanghai";
        Timezone["AsiaSingapore"] = "asia/singapore";
        Timezone["AsiaSrednekolymsk"] = "asia/srednekolymsk";
        Timezone["AsiaTaipei"] = "asia/taipei";
        Timezone["AsiaTashkent"] = "asia/tashkent";
        Timezone["AsiaTbilisi"] = "asia/tbilisi";
        Timezone["AsiaTehran"] = "asia/tehran";
        Timezone["AsiaThimphu"] = "asia/thimphu";
        Timezone["AsiaTokyo"] = "asia/tokyo";
        Timezone["AsiaTomsk"] = "asia/tomsk";
        Timezone["AsiaUlaanbaatar"] = "asia/ulaanbaatar";
        Timezone["AsiaUrumqi"] = "asia/urumqi";
        Timezone["AsiaUstnera"] = "asia/ust-nera";
        Timezone["AsiaVientiane"] = "asia/vientiane";
        Timezone["AsiaVladivostok"] = "asia/vladivostok";
        Timezone["AsiaYakutsk"] = "asia/yakutsk";
        Timezone["AsiaYangon"] = "asia/yangon";
        Timezone["AsiaYekaterinburg"] = "asia/yekaterinburg";
        Timezone["AsiaYerevan"] = "asia/yerevan";
        Timezone["AtlanticAzores"] = "atlantic/azores";
        Timezone["AtlanticBermuda"] = "atlantic/bermuda";
        Timezone["AtlanticCanary"] = "atlantic/canary";
        Timezone["AtlanticCapeVerde"] = "atlantic/cape_verde";
        Timezone["AtlanticFaroe"] = "atlantic/faroe";
        Timezone["AtlanticMadeira"] = "atlantic/madeira";
        Timezone["AtlanticReykjavik"] = "atlantic/reykjavik";
        Timezone["AtlanticSouthGeorgia"] = "atlantic/south_georgia";
        Timezone["AtlanticStHelena"] = "atlantic/st_helena";
        Timezone["AtlanticStanley"] = "atlantic/stanley";
        Timezone["AustraliaAdelaide"] = "australia/adelaide";
        Timezone["AustraliaBrisbane"] = "australia/brisbane";
        Timezone["AustraliaBrokenHill"] = "australia/broken_hill";
        Timezone["AustraliaDarwin"] = "australia/darwin";
        Timezone["AustraliaEucla"] = "australia/eucla";
        Timezone["AustraliaHobart"] = "australia/hobart";
        Timezone["AustraliaLindeman"] = "australia/lindeman";
        Timezone["AustraliaLordHowe"] = "australia/lord_howe";
        Timezone["AustraliaMelbourne"] = "australia/melbourne";
        Timezone["AustraliaPerth"] = "australia/perth";
        Timezone["AustraliaSydney"] = "australia/sydney";
        Timezone["EuropeAmsterdam"] = "europe/amsterdam";
        Timezone["EuropeAndorra"] = "europe/andorra";
        Timezone["EuropeAstrakhan"] = "europe/astrakhan";
        Timezone["EuropeAthens"] = "europe/athens";
        Timezone["EuropeBelgrade"] = "europe/belgrade";
        Timezone["EuropeBerlin"] = "europe/berlin";
        Timezone["EuropeBratislava"] = "europe/bratislava";
        Timezone["EuropeBrussels"] = "europe/brussels";
        Timezone["EuropeBucharest"] = "europe/bucharest";
        Timezone["EuropeBudapest"] = "europe/budapest";
        Timezone["EuropeBusingen"] = "europe/busingen";
        Timezone["EuropeChisinau"] = "europe/chisinau";
        Timezone["EuropeCopenhagen"] = "europe/copenhagen";
        Timezone["EuropeDublin"] = "europe/dublin";
        Timezone["EuropeGibraltar"] = "europe/gibraltar";
        Timezone["EuropeGuernsey"] = "europe/guernsey";
        Timezone["EuropeHelsinki"] = "europe/helsinki";
        Timezone["EuropeIsleOfMan"] = "europe/isle_of_man";
        Timezone["EuropeIstanbul"] = "europe/istanbul";
        Timezone["EuropeJersey"] = "europe/jersey";
        Timezone["EuropeKaliningrad"] = "europe/kaliningrad";
        Timezone["EuropeKirov"] = "europe/kirov";
        Timezone["EuropeKyiv"] = "europe/kyiv";
        Timezone["EuropeLisbon"] = "europe/lisbon";
        Timezone["EuropeLjubljana"] = "europe/ljubljana";
        Timezone["EuropeLondon"] = "europe/london";
        Timezone["EuropeLuxembourg"] = "europe/luxembourg";
        Timezone["EuropeMadrid"] = "europe/madrid";
        Timezone["EuropeMalta"] = "europe/malta";
        Timezone["EuropeMariehamn"] = "europe/mariehamn";
        Timezone["EuropeMinsk"] = "europe/minsk";
        Timezone["EuropeMonaco"] = "europe/monaco";
        Timezone["EuropeMoscow"] = "europe/moscow";
        Timezone["EuropeOslo"] = "europe/oslo";
        Timezone["EuropeParis"] = "europe/paris";
        Timezone["EuropePodgorica"] = "europe/podgorica";
        Timezone["EuropePrague"] = "europe/prague";
        Timezone["EuropeRiga"] = "europe/riga";
        Timezone["EuropeRome"] = "europe/rome";
        Timezone["EuropeSamara"] = "europe/samara";
        Timezone["EuropeSanMarino"] = "europe/san_marino";
        Timezone["EuropeSarajevo"] = "europe/sarajevo";
        Timezone["EuropeSaratov"] = "europe/saratov";
        Timezone["EuropeSimferopol"] = "europe/simferopol";
        Timezone["EuropeSkopje"] = "europe/skopje";
        Timezone["EuropeSofia"] = "europe/sofia";
        Timezone["EuropeStockholm"] = "europe/stockholm";
        Timezone["EuropeTallinn"] = "europe/tallinn";
        Timezone["EuropeTirane"] = "europe/tirane";
        Timezone["EuropeUlyanovsk"] = "europe/ulyanovsk";
        Timezone["EuropeVaduz"] = "europe/vaduz";
        Timezone["EuropeVatican"] = "europe/vatican";
        Timezone["EuropeVienna"] = "europe/vienna";
        Timezone["EuropeVilnius"] = "europe/vilnius";
        Timezone["EuropeVolgograd"] = "europe/volgograd";
        Timezone["EuropeWarsaw"] = "europe/warsaw";
        Timezone["EuropeZagreb"] = "europe/zagreb";
        Timezone["EuropeZurich"] = "europe/zurich";
        Timezone["IndianAntananarivo"] = "indian/antananarivo";
        Timezone["IndianChagos"] = "indian/chagos";
        Timezone["IndianChristmas"] = "indian/christmas";
        Timezone["IndianCocos"] = "indian/cocos";
        Timezone["IndianComoro"] = "indian/comoro";
        Timezone["IndianKerguelen"] = "indian/kerguelen";
        Timezone["IndianMahe"] = "indian/mahe";
        Timezone["IndianMaldives"] = "indian/maldives";
        Timezone["IndianMauritius"] = "indian/mauritius";
        Timezone["IndianMayotte"] = "indian/mayotte";
        Timezone["IndianReunion"] = "indian/reunion";
        Timezone["PacificApia"] = "pacific/apia";
        Timezone["PacificAuckland"] = "pacific/auckland";
        Timezone["PacificBougainville"] = "pacific/bougainville";
        Timezone["PacificChatham"] = "pacific/chatham";
        Timezone["PacificChuuk"] = "pacific/chuuk";
        Timezone["PacificEaster"] = "pacific/easter";
        Timezone["PacificEfate"] = "pacific/efate";
        Timezone["PacificFakaofo"] = "pacific/fakaofo";
        Timezone["PacificFiji"] = "pacific/fiji";
        Timezone["PacificFunafuti"] = "pacific/funafuti";
        Timezone["PacificGalapagos"] = "pacific/galapagos";
        Timezone["PacificGambier"] = "pacific/gambier";
        Timezone["PacificGuadalcanal"] = "pacific/guadalcanal";
        Timezone["PacificGuam"] = "pacific/guam";
        Timezone["PacificHonolulu"] = "pacific/honolulu";
        Timezone["PacificKanton"] = "pacific/kanton";
        Timezone["PacificKiritimati"] = "pacific/kiritimati";
        Timezone["PacificKosrae"] = "pacific/kosrae";
        Timezone["PacificKwajalein"] = "pacific/kwajalein";
        Timezone["PacificMajuro"] = "pacific/majuro";
        Timezone["PacificMarquesas"] = "pacific/marquesas";
        Timezone["PacificMidway"] = "pacific/midway";
        Timezone["PacificNauru"] = "pacific/nauru";
        Timezone["PacificNiue"] = "pacific/niue";
        Timezone["PacificNorfolk"] = "pacific/norfolk";
        Timezone["PacificNoumea"] = "pacific/noumea";
        Timezone["PacificPagoPago"] = "pacific/pago_pago";
        Timezone["PacificPalau"] = "pacific/palau";
        Timezone["PacificPitcairn"] = "pacific/pitcairn";
        Timezone["PacificPohnpei"] = "pacific/pohnpei";
        Timezone["PacificPortMoresby"] = "pacific/port_moresby";
        Timezone["PacificRarotonga"] = "pacific/rarotonga";
        Timezone["PacificSaipan"] = "pacific/saipan";
        Timezone["PacificTahiti"] = "pacific/tahiti";
        Timezone["PacificTarawa"] = "pacific/tarawa";
        Timezone["PacificTongatapu"] = "pacific/tongatapu";
        Timezone["PacificWake"] = "pacific/wake";
        Timezone["PacificWallis"] = "pacific/wallis";
        Timezone["Utc"] = "utc";
    })(exports.Timezone || (exports.Timezone = {}));

    exports.BrowserPermission = void 0;
    (function (BrowserPermission) {
        BrowserPermission["Geolocation"] = "geolocation";
        BrowserPermission["Camera"] = "camera";
        BrowserPermission["Microphone"] = "microphone";
        BrowserPermission["Notifications"] = "notifications";
        BrowserPermission["Midi"] = "midi";
        BrowserPermission["Push"] = "push";
        BrowserPermission["Clipboardread"] = "clipboard-read";
        BrowserPermission["Clipboardwrite"] = "clipboard-write";
        BrowserPermission["Paymenthandler"] = "payment-handler";
        BrowserPermission["Usb"] = "usb";
        BrowserPermission["Bluetooth"] = "bluetooth";
        BrowserPermission["Accelerometer"] = "accelerometer";
        BrowserPermission["Gyroscope"] = "gyroscope";
        BrowserPermission["Magnetometer"] = "magnetometer";
        BrowserPermission["Ambientlightsensor"] = "ambient-light-sensor";
        BrowserPermission["Backgroundsync"] = "background-sync";
        BrowserPermission["Persistentstorage"] = "persistent-storage";
        BrowserPermission["Screenwakelock"] = "screen-wake-lock";
        BrowserPermission["Webshare"] = "web-share";
        BrowserPermission["Xrspatialtracking"] = "xr-spatial-tracking";
    })(exports.BrowserPermission || (exports.BrowserPermission = {}));

    exports.ImageFormat = void 0;
    (function (ImageFormat) {
        ImageFormat["Jpg"] = "jpg";
        ImageFormat["Jpeg"] = "jpeg";
        ImageFormat["Png"] = "png";
        ImageFormat["Webp"] = "webp";
        ImageFormat["Heic"] = "heic";
        ImageFormat["Avif"] = "avif";
        ImageFormat["Gif"] = "gif";
    })(exports.ImageFormat || (exports.ImageFormat = {}));

    exports.ExecutionMethod = void 0;
    (function (ExecutionMethod) {
        ExecutionMethod["GET"] = "GET";
        ExecutionMethod["POST"] = "POST";
        ExecutionMethod["PUT"] = "PUT";
        ExecutionMethod["PATCH"] = "PATCH";
        ExecutionMethod["DELETE"] = "DELETE";
        ExecutionMethod["OPTIONS"] = "OPTIONS";
        ExecutionMethod["HEAD"] = "HEAD";
    })(exports.ExecutionMethod || (exports.ExecutionMethod = {}));

    exports.ImageGravity = void 0;
    (function (ImageGravity) {
        ImageGravity["Center"] = "center";
        ImageGravity["Topleft"] = "top-left";
        ImageGravity["Top"] = "top";
        ImageGravity["Topright"] = "top-right";
        ImageGravity["Left"] = "left";
        ImageGravity["Right"] = "right";
        ImageGravity["Bottomleft"] = "bottom-left";
        ImageGravity["Bottom"] = "bottom";
        ImageGravity["Bottomright"] = "bottom-right";
    })(exports.ImageGravity || (exports.ImageGravity = {}));

    exports.ExecutionTrigger = void 0;
    (function (ExecutionTrigger) {
        ExecutionTrigger["Http"] = "http";
        ExecutionTrigger["Schedule"] = "schedule";
        ExecutionTrigger["Event"] = "event";
    })(exports.ExecutionTrigger || (exports.ExecutionTrigger = {}));

    exports.ExecutionStatus = void 0;
    (function (ExecutionStatus) {
        ExecutionStatus["Waiting"] = "waiting";
        ExecutionStatus["Processing"] = "processing";
        ExecutionStatus["Completed"] = "completed";
        ExecutionStatus["Failed"] = "failed";
        ExecutionStatus["Scheduled"] = "scheduled";
    })(exports.ExecutionStatus || (exports.ExecutionStatus = {}));

    exports.Account = Account;
    exports.AppwriteException = AppwriteException;
    exports.Avatars = Avatars;
    exports.Channel = Channel;
    exports.Client = Client;
    exports.Databases = Databases;
    exports.Functions = Functions;
    exports.Graphql = Graphql;
    exports.ID = ID;
    exports.Locale = Locale;
    exports.Messaging = Messaging;
    exports.Operator = Operator;
    exports.Permission = Permission;
    exports.Presences = Presences;
    exports.Query = Query;
    exports.Realtime = Realtime;
    exports.Role = Role;
    exports.Storage = Storage;
    exports.TablesDB = TablesDB;
    exports.Teams = Teams;

})(this.Appwrite = this.Appwrite || {});
