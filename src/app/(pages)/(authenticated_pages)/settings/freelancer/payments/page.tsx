"use client"
import React, {useState, useEffect} from "react";
import { useUserContext } from "@/app/providers/UserProvider";
import { InformationCircleIcon } from '@heroicons/react/20/solid';
import {
  getStripeConnectAccount,
  createStripeConnectAcct,
  createStripeConnectAcctLink
} from "@/app/lib/api";
import { useRouter } from 'next/navigation';
import Loader from "@/app/components/ui/shared/Loader";

const Payments = () => {
  const { push } = useRouter();
  const [stripeSessionURL, setStripeSessionURL] = useState<string>("");
  const [hasStripeConnectAcct, setHasStripeConnectAcct] = useState(false);
  const [stripePaymentEnabled, setStripePaymentEnabled] = useState(false);
  const [stripeDisabledReason, setStripeDisabledReason] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUserContext();

  useEffect(() => {
    const getStripeConnectAcct = async () => {
      try {
        setIsLoading(true);
        if (user?.freelancerProfile?.stripe_acct_id) {
          const acctInfo = await getStripeConnectAccount(user?.freelancerProfile?.stripe_acct_id);
          if (acctInfo) {
            if (acctInfo.account_id) {
              setHasStripeConnectAcct(true);
              const url = await createStripeConnectAcctLink({
                account: acctInfo.account_id,
                return_url: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/settings/freelancer/payments`,
                refresh_url: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/settings/freelancer/payments`,
              });
              console.log('link url: ', url);
              if (url && typeof url === 'string' && url !== '') {
                setStripeSessionURL(url);
              } else {
                alert('Error creating link to Stripe account');
              }
            }
            if (acctInfo.account_charges_enabled) {
              setStripePaymentEnabled(true);
            } else {
              setStripePaymentEnabled(false);
            }
            if (acctInfo.account_disabled_reason && acctInfo.account_disabled_reason !== "") {
              setStripeDisabledReason(false);
            } else {
              setStripeDisabledReason(true);
            }
          } else {
            setHasStripeConnectAcct(false);
          }
        } 
      } catch(err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    }
    getStripeConnectAcct();    
  }, [user]);

  const createConnectAcctPlusLink = async () => {
    try {
      const acctId = await createStripeConnectAcct();
      if (acctId) {
        const response = await fetch(`/api/freelancer/settings/payment`, {
          method: "PUT",
          body: JSON.stringify({
            id: user?.freelancerProfile?.id,
            stripe_acct_id: acctId,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          alert("Error creating Stripe account");
          return;
        }
        const url = await createStripeConnectAcctLink({
          account: acctId,
          return_url: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/settings/freelancer/payments`,
          refresh_url: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/settings/freelancer/payments`,
        });
        if (url && typeof url === 'string' && url !== '') {
          push(url);
        } else {
          alert("Error creating link to Stripe account");
        }
      }
    } catch(err) {
      alert('Error creating Stripe account');
      console.log(err);
    }
  }

  return (
    <div>
      <div>
        <h2 className="text-base font-semibold leading-7 text-gray-900">
          Accounts & Payments
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          Manage accounts and  payments
        </p>

        {isLoading && <Loader />}

        {!isLoading && 
        <div>
          {hasStripeConnectAcct &&
          stripeSessionURL !== "" &&
          <div>
            {(stripePaymentEnabled && stripeDisabledReason) &&
            <div className="rounded-md bg-emerald-50 p-4 mt-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <InformationCircleIcon className="h-5 w-5 text-emerald-400 me-2" aria-hidden="true" />
                </div>
                <div className="ml-3 flex-1 md:flex md:justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-emerald-700">Payouts enabled</p>
                    <p className="text-sm text-emerald-700">Payouts through Stripe have been enabled.</p>
                    <br/>
                    <p className="text-sm font-semibold text-emerald-700">Account setup complete</p>
                    <p className="text-sm text-emerald-700">Your Stripe account information is complete</p>
                  </div>
                  <p className="mt-3 text-sm md:ml-6 md:mt-0">
                    <a 
                      href={stripeSessionURL}
                      className="whitespace-nowrap font-medium text-emerald-700 hover:text-emerald-600">
                      Details
                      <span aria-hidden="true"> &rarr;</span>
                    </a>
                  </p>
                </div>
              </div>
            </div>}

            {(!stripeDisabledReason || !stripePaymentEnabled) &&
            <div className="rounded-md bg-red-50 p-4 mt-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <InformationCircleIcon className="h-5 w-5 text-red-400 me-2" aria-hidden="true" />
                </div>
                <div className="ml-3 flex-1 md:flex md:justify-between items-center">
                  <div>
                    {!stripePaymentEnabled &&
                    <div>
                      <p className="text-sm font-semibold text-red-700">Payouts disabled</p>
                      <p className="text-sm text-red-700">Please update your Stripe setting to enable payouts.</p>
                    </div>}
                    <br/>
                    {!stripeDisabledReason &&
                    <div>
                      <p className="text-sm font-semibold text-red-700">Account setup incomplete</p>
                      <p className="text-sm text-red-700">Please finish setting up your Stripe account.</p>
                    </div>}
                  </div>
                  <p className="mt-3 text-sm md:ml-6 md:mt-0">
                    <a 
                      href={stripeSessionURL}
                      className="whitespace-nowrap font-medium text-red-700 hover:text-red-600">
                      Update
                      <span aria-hidden="true"> &rarr;</span>
                    </a>
                  </p>
                </div>
              </div>
            </div>}
          </div>
          }

          {!hasStripeConnectAcct &&
          <div className="rounded-md bg-red-50 p-4 mt-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <InformationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3 flex-1 md:flex md:justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-red-700">No Stripe Account</p>
                  <p className="text-sm text-red-700">Connect your stripe account to be able to accept payments</p>
                </div>
                <p className="mt-3 text-sm md:ml-6 md:mt-0">
                  <button
                    onClick={createConnectAcctPlusLink}
                    className="whitespace-nowrap font-medium text-red-700 hover:text-red-600">
                    Add Stripe Account
                    <span aria-hidden="true"> &rarr;</span>
                  </button>
                </p>
              </div>
            </div>
          </div>
          }
        </div>}
      </div>
    </div>
  );
};

export default Payments;
