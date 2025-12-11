import { W as WebPlugin } from "./index-DawAxUjz.js";
var script = { exports: {} };
var hasRequiredScript;
function requireScript() {
  if (hasRequiredScript) return script.exports;
  hasRequiredScript = 1;
  (function(module) {
    (function(name, definition) {
      if (module.exports) module.exports = definition();
      else this[name] = definition();
    })("$script", function() {
      var doc = document, head = doc.getElementsByTagName("head")[0], f = false, push = "push", readyState = "readyState", onreadystatechange = "onreadystatechange", list = {}, delay = {}, scripts = {}, scriptpath, urlArgs;
      function every(ar, fn) {
        for (var i = 0, j = ar.length; i < j; ++i) if (!fn(ar[i])) return f;
        return 1;
      }
      function each(ar, fn) {
        every(ar, function(el) {
          fn(el);
          return 1;
        });
      }
      function $script(paths, idOrDone, optDone) {
        paths = paths[push] ? paths : [paths];
        var idOrDoneIsDone = idOrDone && idOrDone.call, done = idOrDoneIsDone ? idOrDone : optDone, id = idOrDoneIsDone ? paths.join("") : idOrDone, queue = paths.length;
        function loopFn(item) {
          return item.call ? item() : list[item];
        }
        function callback() {
          if (!--queue) {
            list[id] = 1;
            done && done();
            for (var dset in delay) {
              every(dset.split("|"), loopFn) && !each(delay[dset], loopFn) && (delay[dset] = []);
            }
          }
        }
        setTimeout(function() {
          each(paths, function loading(path, force) {
            if (path === null) return callback();
            if (!force && !/^https?:\/\//.test(path) && scriptpath) {
              path = path.indexOf(".js") === -1 ? scriptpath + path + ".js" : scriptpath + path;
            }
            if (scripts[path]) {
              return scripts[path] == 2 ? callback() : setTimeout(function() {
                loading(path, true);
              }, 0);
            }
            scripts[path] = 1;
            create(path, callback);
          });
        }, 0);
        return $script;
      }
      function create(path, fn) {
        var el = doc.createElement("script"), loaded;
        el.onload = el.onerror = el[onreadystatechange] = function() {
          if (el[readyState] && !/^c|loade/.test(el[readyState]) || loaded) return;
          el.onload = el[onreadystatechange] = null;
          loaded = 1;
          scripts[path] = 2;
          fn();
        };
        el.async = 1;
        el.src = urlArgs ? path + (path.indexOf("?") === -1 ? "?" : "&") + urlArgs : path;
        head.insertBefore(el, head.lastChild);
      }
      $script.get = create;
      $script.order = function(scripts2, id, done) {
        (function callback(s) {
          s = scripts2.shift();
          !scripts2.length ? $script(s, id, done) : $script(s, callback);
        })();
      };
      $script.path = function(p) {
        scriptpath = p;
      };
      $script.urlArgs = function(str) {
        urlArgs = str;
      };
      $script.ready = function(deps, ready, req) {
        deps = deps[push] ? deps : [deps];
        var missing = [];
        !each(deps, function(dep) {
          list[dep] || missing[push](dep);
        }) && every(deps, function(dep) {
          return list[dep];
        }) ? ready() : !(function(key) {
          delay[key] = delay[key] || [];
          delay[key][push](ready);
          req && req(missing);
        })(deps.join("|"));
        return $script;
      };
      $script.done = function(idOrDone) {
        $script([null], idOrDone);
      };
      return $script;
    });
  })(script);
  return script.exports;
}
var scriptExports = requireScript();
class SignInWithAppleWeb extends WebPlugin {
  constructor() {
    super(...arguments);
    this.appleScriptUrl = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    this.isAppleScriptLoaded = false;
  }
  async authorize(options) {
    return new Promise((resolve, reject) => {
      if (options) {
        this.loadSignInWithAppleJS().then((loaded) => {
          var _a, _b, _c;
          this.isAppleScriptLoaded = loaded;
          if (this.isAppleScriptLoaded) {
            AppleID.auth.init({
              clientId: options.clientId,
              redirectURI: options.redirectURI,
              scope: (_a = options.scopes) !== null && _a !== void 0 ? _a : void 0,
              state: (_b = options.state) !== null && _b !== void 0 ? _b : void 0,
              nonce: (_c = options.nonce) !== null && _c !== void 0 ? _c : void 0,
              usePopup: true
            });
            AppleID.auth.signIn().then((res) => {
              var _a2, _b2, _c2, _d, _e;
              const response = {
                response: {
                  user: null,
                  email: (_a2 = res.user) === null || _a2 === void 0 ? void 0 : _a2.email,
                  givenName: (_c2 = (_b2 = res.user) === null || _b2 === void 0 ? void 0 : _b2.name) === null || _c2 === void 0 ? void 0 : _c2.firstName,
                  familyName: (_e = (_d = res.user) === null || _d === void 0 ? void 0 : _d.name) === null || _e === void 0 ? void 0 : _e.lastName,
                  identityToken: res.authorization.id_token,
                  authorizationCode: res.authorization.code
                }
              };
              resolve(response);
            }).catch((err) => {
              reject(err);
            });
          } else {
            reject("Unable to load Sign in with Apple JS framework.");
          }
        });
      } else {
        reject("No options were provided.");
      }
    });
  }
  loadSignInWithAppleJS() {
    return new Promise((resolve) => {
      if (!this.isAppleScriptLoaded) {
        if (typeof window !== void 0) {
          scriptExports.get(this.appleScriptUrl, () => resolve(true));
        } else {
          resolve(false);
        }
      } else {
        resolve(true);
      }
    });
  }
}
export {
  SignInWithAppleWeb
};
