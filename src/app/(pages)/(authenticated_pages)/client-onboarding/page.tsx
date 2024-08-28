import React from "react";
import ClientOnboardingForm from "../../../components/forms/ClientOnboardingForm";
import { getCurrentUser } from "@/app/lib/session";
import { redirect } from 'next/navigation';

const ClientOnboarding = async () => {
  let user = await getCurrentUser();

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
      <ClientOnboardingForm />
    </div>
  );
};

export default ClientOnboarding;
