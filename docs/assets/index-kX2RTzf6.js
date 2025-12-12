const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/web-mOs0BHzI.js","assets/index-W5fmipUQ.js","assets/index-DTUxKjc4.css"])))=>i.map(i=>d[i]);
import { r as registerPlugin, _ as __vitePreload } from "./index-W5fmipUQ.js";
const SignInWithApple = registerPlugin("SignInWithApple", {
  web: () => __vitePreload(() => import("./web-mOs0BHzI.js"), true ? __vite__mapDeps([0,1,2]) : void 0).then((m) => new m.SignInWithAppleWeb())
});
export {
  SignInWithApple
};
