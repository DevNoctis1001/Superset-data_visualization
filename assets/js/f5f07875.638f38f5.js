"use strict";(self.webpackChunkdocs_v_2=self.webpackChunkdocs_v_2||[]).push([[9317],{3905:function(e,t,n){n.d(t,{Zo:function(){return p},kt:function(){return m}});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var s=r.createContext({}),d=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},p=function(e){var t=d(e.components);return r.createElement(s.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},c=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,o=e.originalType,s=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),c=d(n),m=i,f=c["".concat(s,".").concat(m)]||c[m]||u[m]||o;return n?r.createElement(f,a(a({ref:t},p),{},{components:n})):r.createElement(f,a({ref:t},p))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=n.length,a=new Array(o);a[0]=c;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:i,a[1]=l;for(var d=2;d<o;d++)a[d]=n[d];return r.createElement.apply(null,a)}return r.createElement.apply(null,n)}c.displayName="MDXCreateElement"},21690:function(e,t,n){n.r(t),n.d(t,{frontMatter:function(){return l},contentTitle:function(){return s},metadata:function(){return d},toc:function(){return p},default:function(){return c}});var r=n(83117),i=n(80102),o=(n(67294),n(3905)),a=["components"],l={title:"Additional Networking Settings",hide_title:!0,sidebar_position:4,version:1},s=void 0,d={unversionedId:"installation/networking-settings",id:"installation/networking-settings",title:"Additional Networking Settings",description:"Additional Networking Settings",source:"@site/docs/installation/networking-settings.mdx",sourceDirName:"installation",slug:"/installation/networking-settings",permalink:"/docs/installation/networking-settings",editUrl:"https://github.com/apache/superset/tree/master/docs/docs/installation/networking-settings.mdx",tags:[],version:"current",sidebarPosition:4,frontMatter:{title:"Additional Networking Settings",hide_title:!0,sidebar_position:4,version:1},sidebar:"tutorialSidebar",previous:{title:"Configuring Superset",permalink:"/docs/installation/configuring-superset"},next:{title:"Caching",permalink:"/docs/installation/cache"}},p=[{value:"Additional Networking Settings",id:"additional-networking-settings",children:[{value:"CORS",id:"cors",children:[],level:3},{value:"Domain Sharding",id:"domain-sharding",children:[],level:3},{value:"Middleware",id:"middleware",children:[],level:3}],level:2}],u={toc:p};function c(e){var t=e.components,n=(0,i.Z)(e,a);return(0,o.kt)("wrapper",(0,r.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h2",{id:"additional-networking-settings"},"Additional Networking Settings"),(0,o.kt)("h3",{id:"cors"},"CORS"),(0,o.kt)("p",null,"To configure CORS, or cross-origin resource sharing, the following dependency must be installed:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-python"},"pip install apache-superset[cors]\n")),(0,o.kt)("p",null,"The following keys in ",(0,o.kt)("inlineCode",{parentName:"p"},"superset_config.py")," can be specified to configure CORS:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"ENABLE_CORS"),": Must be set to ",(0,o.kt)("inlineCode",{parentName:"li"},"True")," in order to enable CORS"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"CORS_OPTIONS"),": options passed to Flask-CORS\n(",(0,o.kt)("a",{parentName:"li",href:"https://flask-cors.corydolphin.com/en/latest/api.html#extension"},"documentation"),")")),(0,o.kt)("h3",{id:"domain-sharding"},"Domain Sharding"),(0,o.kt)("p",null,"Chrome allows up to 6 open connections per domain at a time. When there are more than 6 slices in\ndashboard, a lot of time fetch requests are queued up and wait for next available socket.\n",(0,o.kt)("a",{parentName:"p",href:"https://github.com/apache/superset/pull/5039"},"PR 5039")," adds domain sharding to Superset,\nand this feature will be enabled by configuration only (by default Superset doesn\u2019t allow\ncross-domain request)."),(0,o.kt)("p",null,"Add the following setting in your ",(0,o.kt)("inlineCode",{parentName:"p"},"superset_config.py")," file:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"SUPERSET_WEBSERVER_DOMAINS"),": list of allowed hostnames for domain sharding feature.")),(0,o.kt)("h3",{id:"middleware"},"Middleware"),(0,o.kt)("p",null,"Superset allows you to add your own middleware. To add your own middleware, update the\n",(0,o.kt)("inlineCode",{parentName:"p"},"ADDITIONAL_MIDDLEWARE")," key in your ",(0,o.kt)("inlineCode",{parentName:"p"},"superset_config.py"),". ",(0,o.kt)("inlineCode",{parentName:"p"},"ADDITIONAL_MIDDLEWARE")," should be a list\nof your additional middleware classes."),(0,o.kt)("p",null,"For example, to use ",(0,o.kt)("inlineCode",{parentName:"p"},"AUTH_REMOTE_USER")," from behind a proxy server like nginx, you have to add a\nsimple middleware class to add the value of ",(0,o.kt)("inlineCode",{parentName:"p"},"HTTP_X_PROXY_REMOTE_USER")," (or any other custom header\nfrom the proxy) to Gunicorn\u2019s ",(0,o.kt)("inlineCode",{parentName:"p"},"REMOTE_USER")," environment variable:"))}c.isMDXComponent=!0}}]);