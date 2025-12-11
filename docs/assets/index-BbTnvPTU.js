const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/web-DGDD4bzs.js","assets/index-BuM4z7-3.js","assets/index-kUDKoN2N.css"])))=>i.map(i=>d[i]);
import { r as registerPlugin, _ as __vitePreload } from "./index-BuM4z7-3.js";
const SignInWithApple = registerPlugin("SignInWithApple", {
  web: () => __vitePreload(() => import("./web-DGDD4bzs.js"), true ? __vite__mapDeps([0,1,2]) : void 0).then((m) => new m.SignInWithAppleWeb())
});
export {
  SignInWithApple
};
