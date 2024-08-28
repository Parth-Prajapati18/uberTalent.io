import type { Metadata } from "next";
import Head from "next/head";
import { Inter } from "next/font/google";
import "./globals.css";
import 'react-range-slider-input/dist/style.css';
import Script from "next/script";
import { env } from "process";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";


// const siteId = 3891890;
// const hotjarVersion = 6;

// Hotjar.init(siteId, hotjarVersion);

const inter = Inter({ subsets: ["latin"] });
const raygunApiKey = env.NEXT_PUBLIC_RAYGUN_API_KEY;
const intercomAppId = env.NEXT_PUBLIC_INTERCOM_APP_ID;

export const metadata: Metadata = {
  title: "UberTalent",
  description: "Freelance Marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Script
        id="hotjar-snippet"
        dangerouslySetInnerHTML={{
          __html: `
    (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:2650568,hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        `,
        }}
      />
      {/* 
      <Script
        id="raygun-snippet"
        dangerouslySetInnerHTML={{
          __html: `
            window.raygunApiKey = "${raygunApiKey}";
            !function(a,b,c,d,e,f,g,h){a.RaygunObject=e,a[e]=a[e]||function(){
            (a[e].o=a[e].o||[]).push(arguments)},f=b.createElement(c),g=b.getElementsByTagName(c)[0],
            f.async=1,f.src=d,g.parentNode.insertBefore(f,g),h=a.onerror,a.onerror=function(b,c,d,f,g){
            h&&h(b,c,d,f,g),g||(g=new Error(b)),a[e].q=a[e].q||[],a[e].q.push({
            e:g})}}(window,document,"script","//cdn.raygun.io/raygun4js/raygun.min.js","rg4js");

            rg4js('apiKey', window.raygunApiKey);
            rg4js('enableCrashReporting', true);
            rg4js('enablePulse', true); `,
        }}
      /> */}

      <Script
        id="intercom-snippet"
        dangerouslySetInnerHTML={{
          __html: `(function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/o0vjkoio';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();
          
          window.Intercom("boot", {
            api_base: "https://api-iam.intercom.io",
            app_id: "${intercomAppId}",
            alignment: "left",
        });
          `,
        }}
      />

      {/* <Script
        id="helpscout-snippet"
        dangerouslySetInnerHTML={{
          __html: `!function(e,t,n){function a(){var e=t.getElementsByTagName("script")[0],n=t.createElement("script");n.type="text/javascript",n.async=!0,n.src="https://beacon-v2.helpscout.net",e.parentNode.insertBefore(n,e)}if(e.Beacon=n=function(t,n,a){e.Beacon.readyQueue.push({method:t,options:n,data:a})},n.readyQueue=[],"complete"===t.readyState)return a();e.attachEvent?e.attachEvent("onload",a):e.addEventListener("load",a,!1)}(window,document,window.Beacon||function(){});

          window.Beacon('init', '17fc8e7b-7035-49fa-8a0c-525829ec6bfd')`,
        }}
      /> */}

      <body className={inter.className}>{children}<SpeedInsights/></body>
      <GoogleAnalytics gaId="G-D9CZNXB84L" />
    </html>
  );
}
