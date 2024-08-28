// lib/mixpanel.js
// server side component only
const Mixpanel = require("mixpanel");
import { env } from "process";
import { UserType } from "../types";
import { User } from "@prisma/client";

const mixpanel = Mixpanel.init(env.NEXT_PUBLIC_MIXPANEL_TOKEN, {});

export const trackEvent = (name: string, email: string) => {
  mixpanel.track(name, {
    distinct_id: email,
  });
};

export const trackPageViewed = () => {
  mixpanel.track("Page View");
};

export const identifyUser = (user: UserType) => {
  console.log("identify:", user);
  mixpanel.people.set(user.email, {
    $email: user.email,
    $first_name: user.firstName,
    $last_name: user.lastName,
    $created: user.createdAt,
    $account_type: user.freelancerProfile ? "freelancer" : "client",
  });
};
