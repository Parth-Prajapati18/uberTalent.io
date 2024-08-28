"use client";
import { redirect } from "next/navigation";
import React, { use, useEffect } from "react";
import { trackEvent } from "@/app/lib/mixpanel";

/**
 * 
 * Note: This page is not rendered on the client side. It is only used to track the referral 
 * landing and reidrect however this is client side due to challenges with 
 * server side mixpanel tracking.  
 * 
 * this would be better if it worked server side so we can lookup the user id ( on server side) and include
 * the user email addres in the trackevent call.
 */
const FreelancerReferral = () => {
  useEffect(() => {
    const url = window.location.href;
    const id = url.substring(url.lastIndexOf("/") + 1, url.indexOf("?"));
    console.log("FreelancerReferral Landed with id: ", id);
    trackEvent("Referral Landed", { referral_type: "freelancer", referral_id: id});
    redirect("/sign-up");
  });

  return <div />;
};

export default FreelancerReferral;
