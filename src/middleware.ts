import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

//old way not used
const isPublicRoute = createRouteMatcher([
  "/",
  "/find-work",
  "/hire-talent",
  "/privacy-policy",
  "/terms-of-service",
  "/freelancer-referral/:path*",
  "/sign-in/:path*",
  "/sign-up/:path*",
]);

//const apiRoutes: ["/api", "/api(.*)"];

const isProtectedRoute = createRouteMatcher([
  "/account-type(.*)",
  "/client(.*)",
  "/clerk-profile(.*)",
  "/client-dashboard(.*)",
  "/client-onboarding(.*)",
  "/freelancer-dashboard(.*)",
  "/freelancer-onboarding(.*)",
  "/job(.*)",
  "/messages(.*)",
  "/settings(.*)",
  "/timesheets(.*)",
  "/api(.*)",
]);

export default clerkMiddleware((auth, req) => {
  console.log("middleware.ts: req.url", req.url);
  if (isProtectedRoute(req)) {
    console.log("middleware.ts: protect");
    auth().protect();
  }
  //old way not used
  //if (isPublicRoute(req)) return; // if it's a public route, do nothing
  //auth().protect(); // for any other route, require auth
});

export const config = {
  //matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
