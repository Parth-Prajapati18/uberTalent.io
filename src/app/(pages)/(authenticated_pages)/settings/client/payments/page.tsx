"use client"
import React, {useState, useEffect} from "react";
import { useUserContext } from "@/app/providers/UserProvider";
import { InformationCircleIcon } from '@heroicons/react/20/solid';
import {
  getStripeCustomerExists,
  getStripeBillingPortalURL,
  createStripeCustomer,
  getStripeCustomerHasDefPayment,
} from "@/app/lib/api";
import { useRouter } from 'next/navigation';
import Loader from "@/app/components/ui/shared/Loader";

const Payments = () => {
  const { push } = useRouter();
  const [stripeSessionURL, setStripeSessionURL] = useState<any | null>(null);
  const [isStripeCustomer, setIsStripeCustomer] = useState(false);
  const [hasDefaultPayment, sethasDefaultPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUserContext();

  useEffect(() => {
    const getStripeCustomer = async () => {
      try {
        setIsLoading(true);
        if (user?.client?.stripe_customer_id) {
          const isCustomer = await getStripeCustomerExists(user?.client?.stripe_customer_id);
          setIsStripeCustomer(isCustomer);
          const url = await getStripeBillingPortalURL({customer_id: user?.client?.stripe_customer_id, return_url: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/settings/client/payments`});
          setStripeSessionURL(url);
          const hasPayment = await getStripeCustomerHasDefPayment(user?.client?.stripe_customer_id);
          sethasDefaultPayment(hasPayment);
        } 
      } catch(err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    }
    getStripeCustomer();    
  }, [user]);

  const createCustomer = async () => {
    if (user && user?.client) {
      try {
        const customerId = await createStripeCustomer({name: user?.firstName + " " + user?.lastName, email: user?.email});
        if (customerId) {
          const response = await fetch(`/api/client/settings/payment`, {
            method: "PUT",
            body: JSON.stringify({
              id: user?.client?.id,
              stripe_customer_id: customerId,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (!response.ok) {
            alert("Something went wrong");
            return;
          }
          const url = await getStripeBillingPortalURL({customer_id: customerId, return_url: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/settings/client/payments`});
          push(url);
        }
      } catch(err) {
        console.log(err);
      }
    }
  }

  return (
    <div>
      <div>
        <h2 className="text-base font-semibold leading-7 text-gray-900">
          Accounts & Payments
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          Manage accounts and payments
        </p>

        {isLoading && <Loader />}

        {!isLoading && (
          <div>
            {isStripeCustomer && stripeSessionURL !== "" && (
              <div>
                {hasDefaultPayment && (
                  <div className="rounded-md bg-blue-50 p-4 mt-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <InformationCircleIcon
                          className="h-5 w-5 text-blue-400"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-3 flex-1 md:flex md:justify-between items-center">
                        <div>
                          <p className="text-sm font-semibold text-blue-700">
                            Use our billing portal to manage your accounts
                          </p>
                          <p className="text-sm text-blue-700">
                            View invoices, update payment methods, and change
                            billing email.
                          </p>
                        </div>
                        <p className="mt-3 text-sm md:ml-6 md:mt-0">
                          <a
                            href={stripeSessionURL}
                            className="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600"
                          >
                            Details
                            <span aria-hidden="true"> &rarr;</span>
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {!hasDefaultPayment && (
                  <div className="rounded-md bg-red-50 p-4 mt-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <InformationCircleIcon
                          className="h-5 w-5 text-red-400"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-3 flex-1 md:flex md:justify-between items-center">
                        <div>
                          <p className="text-sm font-semibold text-red-700">
                            No default payment method
                          </p>
                          <p className="text-sm text-red-700">
                            Use the billing portal to add a default payment
                            method
                          </p>
                        </div>
                        <p className="mt-3 text-sm md:ml-6 md:mt-0">
                          <a
                            href={stripeSessionURL}
                            className="whitespace-nowrap font-medium text-red-700 hover:text-red-600"
                          >
                            Add Payment Method
                            <span aria-hidden="true"> &rarr;</span>
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isStripeCustomer && (
              <div className="rounded-md bg-red-50 p-4 mt-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <InformationCircleIcon
                      className="h-5 w-5 text-red-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3 flex-1 md:flex md:justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold text-red-700">
                        Connect Your Stripe Account
                      </p>
                      <p className="text-sm text-red-700">
                        To start hiring freelancers, please connect your Stripe
                        account. This will enable you to handle payments
                        securely and efficiently.
                      </p>
                    </div>
                    <p className="mt-3 text-sm md:ml-6 md:mt-0">
                      <button
                        onClick={createCustomer}
                        className="whitespace-nowrap font-medium text-red-700 hover:text-red-600"
                      >
                        Add Stripe Account
                        <span aria-hidden="true"> &rarr;</span>
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
