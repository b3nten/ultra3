var __defProp = Object.defineProperty;
var __require = /* @__PURE__ */ ((x3) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x3, {
  get: (a, b2) => (typeof require !== "undefined" ? require : a)[b2]
}) : x3)(function(x3) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x3 + '" is not supported');
});
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// https://esm.sh/stable/react@18.2.0/esnext/react.mjs
var react_exports = {};
__export(react_exports, {
  Children: () => le,
  Component: () => ae,
  Fragment: () => pe,
  Profiler: () => ye,
  PureComponent: () => de,
  StrictMode: () => _e,
  Suspense: () => me,
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: () => he,
  cloneElement: () => ve,
  createContext: () => Se,
  createElement: () => Ee,
  createFactory: () => Re,
  createRef: () => Ce,
  default: () => We,
  forwardRef: () => ke,
  isValidElement: () => we,
  lazy: () => be,
  memo: () => $e,
  startTransition: () => xe,
  unstable_act: () => Oe,
  useCallback: () => je,
  useContext: () => Ie,
  useDebugValue: () => ge,
  useDeferredValue: () => Pe,
  useEffect: () => Te,
  useId: () => De,
  useImperativeHandle: () => Ve,
  useInsertionEffect: () => Le,
  useLayoutEffect: () => Ne,
  useMemo: () => Fe,
  useReducer: () => Ue,
  useRef: () => qe,
  useState: () => Ae,
  useSyncExternalStore: () => Me,
  useTransition: () => ze,
  version: () => Be
});
var z = Object.create;
var E = Object.defineProperty;
var B = Object.getOwnPropertyDescriptor;
var H = Object.getOwnPropertyNames;
var W = Object.getPrototypeOf;
var Y = Object.prototype.hasOwnProperty;
var x = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports);
var G = (e, t) => {
  for (var r in t)
    E(e, r, { get: t[r], enumerable: true });
};
var S = (e, t, r, u) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (let o of H(t))
      !Y.call(e, o) && o !== r && E(e, o, { get: () => t[o], enumerable: !(u = B(t, o)) || u.enumerable });
  return e;
};
var y = (e, t, r) => (S(e, t, "default"), r && S(r, t, "default"));
var O = (e, t, r) => (r = e != null ? z(W(e)) : {}, S(t || !e || !e.__esModule ? E(r, "default", { value: e, enumerable: true }) : r, e));
var U = x((n2) => {
  "use strict";
  var _ = Symbol.for("react.element"), J = Symbol.for("react.portal"), K = Symbol.for("react.fragment"), Q = Symbol.for("react.strict_mode"), X = Symbol.for("react.profiler"), Z = Symbol.for("react.provider"), ee = Symbol.for("react.context"), te = Symbol.for("react.forward_ref"), re = Symbol.for("react.suspense"), ne = Symbol.for("react.memo"), oe = Symbol.for("react.lazy"), j2 = Symbol.iterator;
  function ue(e) {
    return e === null || typeof e != "object" ? null : (e = j2 && e[j2] || e["@@iterator"], typeof e == "function" ? e : null);
  }
  var P = { isMounted: function() {
    return false;
  }, enqueueForceUpdate: function() {
  }, enqueueReplaceState: function() {
  }, enqueueSetState: function() {
  } }, T2 = Object.assign, D = {};
  function d(e, t, r) {
    this.props = e, this.context = t, this.refs = D, this.updater = r || P;
  }
  d.prototype.isReactComponent = {};
  d.prototype.setState = function(e, t) {
    if (typeof e != "object" && typeof e != "function" && e != null)
      throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, e, t, "setState");
  };
  d.prototype.forceUpdate = function(e) {
    this.updater.enqueueForceUpdate(this, e, "forceUpdate");
  };
  function V() {
  }
  V.prototype = d.prototype;
  function C2(e, t, r) {
    this.props = e, this.context = t, this.refs = D, this.updater = r || P;
  }
  var k2 = C2.prototype = new V();
  k2.constructor = C2;
  T2(k2, d.prototype);
  k2.isPureReactComponent = true;
  var I2 = Array.isArray, L2 = Object.prototype.hasOwnProperty, w = { current: null }, N2 = { key: true, ref: true, __self: true, __source: true };
  function F(e, t, r) {
    var u, o = {}, c2 = null, f2 = null;
    if (t != null)
      for (u in t.ref !== void 0 && (f2 = t.ref), t.key !== void 0 && (c2 = "" + t.key), t)
        L2.call(t, u) && !N2.hasOwnProperty(u) && (o[u] = t[u]);
    var i2 = arguments.length - 2;
    if (i2 === 1)
      o.children = r;
    else if (1 < i2) {
      for (var s = Array(i2), a = 0; a < i2; a++)
        s[a] = arguments[a + 2];
      o.children = s;
    }
    if (e && e.defaultProps)
      for (u in i2 = e.defaultProps, i2)
        o[u] === void 0 && (o[u] = i2[u]);
    return { $$typeof: _, type: e, key: c2, ref: f2, props: o, _owner: w.current };
  }
  function se(e, t) {
    return { $$typeof: _, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner };
  }
  function b2(e) {
    return typeof e == "object" && e !== null && e.$$typeof === _;
  }
  function ce(e) {
    var t = { "=": "=0", ":": "=2" };
    return "$" + e.replace(/[=:]/g, function(r) {
      return t[r];
    });
  }
  var g2 = /\/+/g;
  function R2(e, t) {
    return typeof e == "object" && e !== null && e.key != null ? ce("" + e.key) : t.toString(36);
  }
  function h(e, t, r, u, o) {
    var c2 = typeof e;
    (c2 === "undefined" || c2 === "boolean") && (e = null);
    var f2 = false;
    if (e === null)
      f2 = true;
    else
      switch (c2) {
        case "string":
        case "number":
          f2 = true;
          break;
        case "object":
          switch (e.$$typeof) {
            case _:
            case J:
              f2 = true;
          }
      }
    if (f2)
      return f2 = e, o = o(f2), e = u === "" ? "." + R2(f2, 0) : u, I2(o) ? (r = "", e != null && (r = e.replace(g2, "$&/") + "/"), h(o, t, r, "", function(a) {
        return a;
      })) : o != null && (b2(o) && (o = se(o, r + (!o.key || f2 && f2.key === o.key ? "" : ("" + o.key).replace(g2, "$&/") + "/") + e)), t.push(o)), 1;
    if (f2 = 0, u = u === "" ? "." : u + ":", I2(e))
      for (var i2 = 0; i2 < e.length; i2++) {
        c2 = e[i2];
        var s = u + R2(c2, i2);
        f2 += h(c2, t, r, s, o);
      }
    else if (s = ue(e), typeof s == "function")
      for (e = s.call(e), i2 = 0; !(c2 = e.next()).done; )
        c2 = c2.value, s = u + R2(c2, i2++), f2 += h(c2, t, r, s, o);
    else if (c2 === "object")
      throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
    return f2;
  }
  function m2(e, t, r) {
    if (e == null)
      return e;
    var u = [], o = 0;
    return h(e, u, "", "", function(c2) {
      return t.call(r, c2, o++);
    }), u;
  }
  function ie(e) {
    if (e._status === -1) {
      var t = e._result;
      t = t(), t.then(function(r) {
        (e._status === 0 || e._status === -1) && (e._status = 1, e._result = r);
      }, function(r) {
        (e._status === 0 || e._status === -1) && (e._status = 2, e._result = r);
      }), e._status === -1 && (e._status = 0, e._result = t);
    }
    if (e._status === 1)
      return e._result.default;
    throw e._result;
  }
  var l2 = { current: null }, v2 = { transition: null }, fe = { ReactCurrentDispatcher: l2, ReactCurrentBatchConfig: v2, ReactCurrentOwner: w };
  n2.Children = { map: m2, forEach: function(e, t, r) {
    m2(e, function() {
      t.apply(this, arguments);
    }, r);
  }, count: function(e) {
    var t = 0;
    return m2(e, function() {
      t++;
    }), t;
  }, toArray: function(e) {
    return m2(e, function(t) {
      return t;
    }) || [];
  }, only: function(e) {
    if (!b2(e))
      throw Error("React.Children.only expected to receive a single React element child.");
    return e;
  } };
  n2.Component = d;
  n2.Fragment = K;
  n2.Profiler = X;
  n2.PureComponent = C2;
  n2.StrictMode = Q;
  n2.Suspense = re;
  n2.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = fe;
  n2.cloneElement = function(e, t, r) {
    if (e == null)
      throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
    var u = T2({}, e.props), o = e.key, c2 = e.ref, f2 = e._owner;
    if (t != null) {
      if (t.ref !== void 0 && (c2 = t.ref, f2 = w.current), t.key !== void 0 && (o = "" + t.key), e.type && e.type.defaultProps)
        var i2 = e.type.defaultProps;
      for (s in t)
        L2.call(t, s) && !N2.hasOwnProperty(s) && (u[s] = t[s] === void 0 && i2 !== void 0 ? i2[s] : t[s]);
    }
    var s = arguments.length - 2;
    if (s === 1)
      u.children = r;
    else if (1 < s) {
      i2 = Array(s);
      for (var a = 0; a < s; a++)
        i2[a] = arguments[a + 2];
      u.children = i2;
    }
    return { $$typeof: _, type: e.type, key: o, ref: c2, props: u, _owner: f2 };
  };
  n2.createContext = function(e) {
    return e = { $$typeof: ee, _currentValue: e, _currentValue2: e, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, e.Provider = { $$typeof: Z, _context: e }, e.Consumer = e;
  };
  n2.createElement = F;
  n2.createFactory = function(e) {
    var t = F.bind(null, e);
    return t.type = e, t;
  };
  n2.createRef = function() {
    return { current: null };
  };
  n2.forwardRef = function(e) {
    return { $$typeof: te, render: e };
  };
  n2.isValidElement = b2;
  n2.lazy = function(e) {
    return { $$typeof: oe, _payload: { _status: -1, _result: e }, _init: ie };
  };
  n2.memo = function(e, t) {
    return { $$typeof: ne, type: e, compare: t === void 0 ? null : t };
  };
  n2.startTransition = function(e) {
    var t = v2.transition;
    v2.transition = {};
    try {
      e();
    } finally {
      v2.transition = t;
    }
  };
  n2.unstable_act = function() {
    throw Error("act(...) is not supported in production builds of React.");
  };
  n2.useCallback = function(e, t) {
    return l2.current.useCallback(e, t);
  };
  n2.useContext = function(e) {
    return l2.current.useContext(e);
  };
  n2.useDebugValue = function() {
  };
  n2.useDeferredValue = function(e) {
    return l2.current.useDeferredValue(e);
  };
  n2.useEffect = function(e, t) {
    return l2.current.useEffect(e, t);
  };
  n2.useId = function() {
    return l2.current.useId();
  };
  n2.useImperativeHandle = function(e, t, r) {
    return l2.current.useImperativeHandle(e, t, r);
  };
  n2.useInsertionEffect = function(e, t) {
    return l2.current.useInsertionEffect(e, t);
  };
  n2.useLayoutEffect = function(e, t) {
    return l2.current.useLayoutEffect(e, t);
  };
  n2.useMemo = function(e, t) {
    return l2.current.useMemo(e, t);
  };
  n2.useReducer = function(e, t, r) {
    return l2.current.useReducer(e, t, r);
  };
  n2.useRef = function(e) {
    return l2.current.useRef(e);
  };
  n2.useState = function(e) {
    return l2.current.useState(e);
  };
  n2.useSyncExternalStore = function(e, t, r) {
    return l2.current.useSyncExternalStore(e, t, r);
  };
  n2.useTransition = function() {
    return l2.current.useTransition();
  };
  n2.version = "18.2.0";
});
var $ = x((Je, q) => {
  "use strict";
  q.exports = U();
});
var p = {};
G(p, { Children: () => le, Component: () => ae, Fragment: () => pe, Profiler: () => ye, PureComponent: () => de, StrictMode: () => _e, Suspense: () => me, __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: () => he, cloneElement: () => ve, createContext: () => Se, createElement: () => Ee, createFactory: () => Re, createRef: () => Ce, default: () => We, forwardRef: () => ke, isValidElement: () => we, lazy: () => be, memo: () => $e, startTransition: () => xe, unstable_act: () => Oe, useCallback: () => je, useContext: () => Ie, useDebugValue: () => ge, useDeferredValue: () => Pe, useEffect: () => Te, useId: () => De, useImperativeHandle: () => Ve, useInsertionEffect: () => Le, useLayoutEffect: () => Ne, useMemo: () => Fe, useReducer: () => Ue, useRef: () => qe, useState: () => Ae, useSyncExternalStore: () => Me, useTransition: () => ze, version: () => Be });
var M = O($());
y(p, O($()));
var { Children: le, Component: ae, Fragment: pe, Profiler: ye, PureComponent: de, StrictMode: _e, Suspense: me, __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: he, cloneElement: ve, createContext: Se, createElement: Ee, createFactory: Re, createRef: Ce, forwardRef: ke, isValidElement: we, lazy: be, memo: $e, startTransition: xe, unstable_act: Oe, useCallback: je, useContext: Ie, useDebugValue: ge, useDeferredValue: Pe, useEffect: Te, useId: De, useImperativeHandle: Ve, useInsertionEffect: Le, useLayoutEffect: Ne, useMemo: Fe, useReducer: Ue, useRef: qe, useState: Ae, useSyncExternalStore: Me, useTransition: ze, version: Be } = M;
var { default: A, ...He } = M;
var We = A !== void 0 ? A : He;

// https://esm.sh/stable/react@18.2.0/esnext/jsx-runtime.js
var __1$ = We ?? react_exports;
var v = Object.create;
var p2 = Object.defineProperty;
var E2 = Object.getOwnPropertyDescriptor;
var k = Object.getOwnPropertyNames;
var N = Object.getPrototypeOf;
var R = Object.prototype.hasOwnProperty;
var S2 = ((r) => typeof __require < "u" ? __require : typeof Proxy < "u" ? new Proxy(r, { get: (e, t) => (typeof __require < "u" ? __require : e)[t] }) : r)(function(r) {
  if (typeof __require < "u")
    return __require.apply(this, arguments);
  throw new Error('Dynamic require of "' + r + '" is not supported');
});
var m = (r, e) => () => (e || r((e = { exports: {} }).exports, e), e.exports);
var b = (r, e) => {
  for (var t in e)
    p2(r, t, { get: e[t], enumerable: true });
};
var l = (r, e, t, o) => {
  if (e && typeof e == "object" || typeof e == "function")
    for (let s of k(e))
      !R.call(r, s) && s !== t && p2(r, s, { get: () => e[s], enumerable: !(o = E2(e, s)) || o.enumerable });
  return r;
};
var f = (r, e, t) => (l(r, e, "default"), t && l(t, e, "default"));
var c = (r, e, t) => (t = r != null ? v(N(r)) : {}, l(e || !r || !r.__esModule ? p2(t, "default", { value: r, enumerable: true }) : t, r));
var x2 = m((_) => {
  "use strict";
  var q = __1$, w = Symbol.for("react.element"), P = Symbol.for("react.fragment"), h = Object.prototype.hasOwnProperty, D = q.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, F = { key: true, ref: true, __self: true, __source: true };
  function y2(r, e, t) {
    var o, s = {}, u = null, d = null;
    t !== void 0 && (u = "" + t), e.key !== void 0 && (u = "" + e.key), e.ref !== void 0 && (d = e.ref);
    for (o in e)
      h.call(e, o) && !F.hasOwnProperty(o) && (s[o] = e[o]);
    if (r && r.defaultProps)
      for (o in e = r.defaultProps, e)
        s[o] === void 0 && (s[o] = e[o]);
    return { $$typeof: w, type: r, key: u, ref: d, props: s, _owner: D.current };
  }
  _.Fragment = P;
  _.jsx = y2;
  _.jsxs = y2;
});
var i = m((A2, a) => {
  "use strict";
  a.exports = x2();
});
var n = {};
b(n, { Fragment: () => I, default: () => C, jsx: () => L, jsxs: () => T });
var j = c(i());
f(n, c(i()));
var { Fragment: I, jsx: L, jsxs: T } = j;
var { default: O2, ...g } = j;
var C = O2 !== void 0 ? O2 : g;
export {
  I as Fragment,
  C as default,
  L as jsx,
  T as jsxs
};
/*! Bundled license information:

react/cjs/react.production.min.js:
  (**
   * @license React
   * react.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
/*! Bundled license information:

react/cjs/react-jsx-runtime.production.min.js:
  (**
   * @license React
   * react-jsx-runtime.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
