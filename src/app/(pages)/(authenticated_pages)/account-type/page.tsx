import Link from "next/link";
import React from "react";
import { redirect } from 'next/navigation'
import { currentUser as AuthUser } from '@clerk/nextjs/server';
import { getCurrentUser } from "@/app/lib/session";
import { userService } from "@/app/services/userService";
import Image from "next/image";
import { identifyUser, trackEvent } from "@/app/lib/mixpanel-server";
import { UserType } from "@/app/types";

const cards = [
  {
    name: 'To Find Work',
    description: 'Create an account to become part of our talent network.',
    href: '/freelancer-onboarding',
  },
  {
    name: 'To Hire Someone',
    description: 'Create an account to start hiring from an exceptional pool of talent today.',
    href: '/client-onboarding',
  },
]

const AccountTypeSelector = async () => {

  const authUser = await AuthUser();
  console.log('authUser', authUser ? authUser.emailAddresses[0] : 'no authUser');

  let user = await getCurrentUser();
  console.log('user', user ? user : 'no user');

  /**
   * Lets check user onboarding status and redirect to the right page.
   */

  if (user) {
    console.log('existing user found, checking profile', user.email);
    identifyUser(user);
    trackEvent("Login",user.email); 

    if (user['freelancerProfile']) {
      redirect('/freelancer-dashboard');
    } else if (user['client']) {
      redirect('/client-dashboard');
    } else {
      console.log('existing user wih no profile found, starting onboarding');
    }
  } else {
    console.log('new user signup, starting onboarding');
    
    try {
      const newUser = user  = await userService.registerNewUser();
      identifyUser(newUser);
      trackEvent("Signup Account Created", newUser.email);

    } catch (err) {
      console.log("ERROR", err);
    }
  }
  trackEvent("Signup Account Type Page", user.email);
  return (
    <div className="absolute isolate overflow-hidden bg-gray-900 flex items-center justify-center mx-auto left-0 right-0" style={{ width: "95vw", height: "80vh" }}>
      <Image
        src="/images/account-type-bg.avif"
        alt="account-type-bg"
        width={2432}
        height={1442}
        className="absolute inset-0 -z-10 h-full w-full object-cover object-right md:object-center bg-cover"
      />
      <div className="hidden sm:absolute sm:-top-10 sm:right-1/2 sm:-z-10 sm:mr-10 sm:block sm:transform-gpu sm:blur-3xl">
        <div
          className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-tr from-[#ff4694] to-[#776fff] opacity-20"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
      <div className="absolute -top-52 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl sm:top-[-28rem] sm:ml-16 sm:translate-x-0 sm:transform-gpu">
        <div
          className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-tr from-[#ff4694] to-[#776fff] opacity-20"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
      <div className="mx-auto max-w-full px-6 lg:px-8">
        <div className="mx-auto w-full lg:mx-0 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">Work With Us</h2>
          <p className="mt-6 text-2xl sm:text-4xl leading-8 text-gray-300 font-semibold">
            What would you like to do?
          </p>
        </div>
        <div className="mx-auto lg:px-12 mt-12 lg:mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:gap-8">
          {cards.map((card) => (
            <div key={card.name} className="gird grid-cols-2 gap-x-4 text-center">
              <Link href={card.href} >
                <div key={card.name} className="font-semibold text-lg leading-7 rounded-xl text-white bg-white/5 hover:bg-white/20 p-6 ring-1 ring-inset ring-white/10">
                  {card.name}  <span aria-hidden="true">&rarr;</span>
                </div>
              </Link>
              <div>
                <p className="mt-2 text-gray-300 px-2">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AccountTypeSelector;