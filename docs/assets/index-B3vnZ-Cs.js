const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/web-CYfEAt8l.js","assets/index-BH9p7ySd.js","assets/index-D4L5K4hM.css"])))=>i.map(i=>d[i]);
import { r as registerPlugin, _ as __vitePreload } from "./index-BH9p7ySd.js";
const SignInWithApple = registerPlugin("SignInWithApple", {
  web: () => __vitePreload(() => import("./web-CYfEAt8l.js"), true ? __vite__mapDeps([0,1,2]) : void 0).then((m) => new m.SignInWithAppleWeb())
});
export {
  SignInWithApple
};
