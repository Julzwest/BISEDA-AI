const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/web-HlQURpto.js","assets/index-ekIvcioK.js","assets/index-CtrAiu-l.css"])))=>i.map(i=>d[i]);
import { r as registerPlugin, _ as __vitePreload } from "./index-ekIvcioK.js";
const SignInWithApple = registerPlugin("SignInWithApple", {
  web: () => __vitePreload(() => import("./web-HlQURpto.js"), true ? __vite__mapDeps([0,1,2]) : void 0).then((m) => new m.SignInWithAppleWeb())
});
export {
  SignInWithApple
};
