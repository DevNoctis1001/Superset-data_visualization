"use strict";(self.webpackChunkdocs_v_2=self.webpackChunkdocs_v_2||[]).push([[907],{3905:function(e,t,n){n.d(t,{Zo:function(){return p},kt:function(){return h}});var a=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var c=a.createContext({}),l=function(e){var t=a.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},p=function(e){var t=l(e.components);return a.createElement(c.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},d=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,c=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),d=l(n),h=r,m=d["".concat(c,".").concat(h)]||d[h]||u[h]||o;return n?a.createElement(m,i(i({ref:t},p),{},{components:n})):a.createElement(m,i({ref:t},p))}));function h(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,i=new Array(o);i[0]=d;var s={};for(var c in t)hasOwnProperty.call(t,c)&&(s[c]=t[c]);s.originalType=e,s.mdxType="string"==typeof e?e:r,i[1]=s;for(var l=2;l<o;l++)i[l]=n[l];return a.createElement.apply(null,i)}return a.createElement.apply(null,n)}d.displayName="MDXCreateElement"},16569:function(e,t,n){n.r(t),n.d(t,{frontMatter:function(){return s},contentTitle:function(){return c},metadata:function(){return l},toc:function(){return p},default:function(){return d}});var a=n(83117),r=n(80102),o=(n(67294),n(3905)),i=["components"],s={title:"Amazon Athena",hide_title:!0,sidebar_position:4,version:1},c=void 0,l={unversionedId:"databases/athena",id:"databases/athena",title:"Amazon Athena",description:"AWS Athena",source:"@site/docs/databases/athena.mdx",sourceDirName:"databases",slug:"/databases/athena",permalink:"/docs/databases/athena",editUrl:"https://github.com/apache/superset/tree/master/docs/docs/databases/athena.mdx",tags:[],version:"current",sidebarPosition:4,frontMatter:{title:"Amazon Athena",hide_title:!0,sidebar_position:4,version:1},sidebar:"tutorialSidebar",previous:{title:"Using Database Connection UI",permalink:"/docs/databases/db-connection-ui"},next:{title:"Amazon Redshift",permalink:"/docs/databases/redshift"}},p=[{value:"AWS Athena",id:"aws-athena",children:[{value:"PyAthenaJDBC",id:"pyathenajdbc",children:[],level:3},{value:"PyAthena",id:"pyathena",children:[],level:3}],level:2}],u={toc:p};function d(e){var t=e.components,n=(0,r.Z)(e,i);return(0,o.kt)("wrapper",(0,a.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h2",{id:"aws-athena"},"AWS Athena"),(0,o.kt)("h3",{id:"pyathenajdbc"},"PyAthenaJDBC"),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"https://pypi.org/project/PyAthenaJDBC/"},"PyAthenaJDBC")," is a Python DB 2.0 compliant wrapper for the\n",(0,o.kt)("a",{parentName:"p",href:"https://docs.aws.amazon.com/athena/latest/ug/connect-with-jdbc.html"},"Amazon Athena JDBC driver"),"."),(0,o.kt)("p",null,"The connection string for Amazon Athena is as follows:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},"awsathena+jdbc://{aws_access_key_id}:{aws_secret_access_key}@athena.{region_name}.amazonaws.com/{schema_name}?s3_staging_dir={s3_staging_dir}&...\n")),(0,o.kt)("p",null,"Note that you'll need to escape & encode when forming the connection string like so:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},"s3://... -> s3%3A//...\n")),(0,o.kt)("h3",{id:"pyathena"},"PyAthena"),(0,o.kt)("p",null,"You can also use ",(0,o.kt)("a",{parentName:"p",href:"https://pypi.org/project/PyAthena/"},"PyAthena library")," (no Java required) with the\nfollowing connection string:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},"awsathena+rest://{aws_access_key_id}:{aws_secret_access_key}@athena.{region_name}.amazonaws.com/{schema_name}?s3_staging_dir={s3_staging_dir}&...\n")))}d.isMDXComponent=!0}}]);