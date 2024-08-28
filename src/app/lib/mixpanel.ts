//client side component only
import { UserType } from "../types";
import mixpanel, { Dict } from "mixpanel-browser";

const mixpanelToken = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || ""; // Set a default value if the variable is undefined
mixpanel.init(mixpanelToken, {
  debug: true,
  track_pageview: true,
  persistence: "localStorage",
});

export const trackEvent = (name: string, properties: Dict | undefined) => {
  //console.log("Tracking event", name, properties);
  mixpanel.track(name, properties);
};

export const identify = (id: string ) => {
  //console.log("identity:", id);
  mixpanel.identify(id);
};

export const identifyUser = (user: UserType) => {
  //console.log("Identifying user", user);
  mixpanel.identify(user.email);
  mixpanel.people.set({
    $email: user.email,
    $first_name: user.firstName,
    $last_name: user.lastName,
    $created: user.createdAt,
    userType: user.client ? "CLIENT" : "FREELANCER",
  });
}
