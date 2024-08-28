import React from "react";
import FreelancerOnboardingForm from "../../../components/forms/FreelancerOnboardingForm";
import { getCurrentUser } from "@/app/lib/session";
import { redirect } from 'next/navigation';

const FreelancerOnboarding = async () => {
  console.log('freelancer onboarding');
  let user = await getCurrentUser();

  console.log('user: ', user);;

  if (user) {
    if (user['freelancerProfile']) {
      redirect('/freelancer-dashboard');
    } else if (user['client']) {
      redirect('/client-dashboard');
    } else {
      console.log('existing user wih no profile found, starting onboarding');
    }
  }

  return (
    <div>
      <FreelancerOnboardingForm />
    </div>
  );
};

export default FreelancerOnboarding;
