const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/web-DX43EZVX.js","assets/index-B1maL41c.js","assets/index-DTUxKjc4.css"])))=>i.map(i=>d[i]);
import { r as registerPlugin, _ as __vitePreload } from "./index-B1maL41c.js";
const SignInWithApple = registerPlugin("SignInWithApple", {
  web: () => __vitePreload(() => import("./web-DX43EZVX.js"), true ? __vite__mapDeps([0,1,2]) : void 0).then((m) => new m.SignInWithAppleWeb())
});
export {
  SignInWithApple
};
