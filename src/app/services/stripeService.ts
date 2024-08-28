import Stripe from 'stripe';
import { getCurrentUser } from "../lib/session";


const stripeAcct = new Stripe(process.env.STRIPE_API_KEY!);

export const stripeService = {
    async getStripeCustomerExists(id: string): Promise<boolean> {
        const customer = await stripeAcct?.customers.retrieve(id);
        if (customer) {
            console.log('customer object: ', customer);
            return true;
        }
        return false;
    },

    async createStripeCustomer(data: any): Promise<string>{
        const { name, email } = data;
        const customer =  await stripeAcct.customers.create({
            name: name,
            email: email,
        });
        return customer.id;
    },

    async getBillingPortalURL(data: any): Promise<string> {
        const { customer_id, return_url } = data;
        const session = await stripeAcct.billingPortal.sessions.create(
            {
              customer: customer_id,
              return_url: return_url,
            }
        );
        return session.url;
    },

    async getCustomerHasDefaultPayment(id: string): Promise<boolean> {
        const customer = await stripeAcct?.customers.retrieve(id) as Stripe.Response<Stripe.Customer>;
        if (customer.invoice_settings.default_payment_method) {
            return true;
        }
        return false;
    },

    async getStripeConnectAcct(id: string): Promise<Object | null> {
        const acct = await stripeAcct?.accounts.retrieve(id);
        console.log("connected account: ", acct);
        if (acct) {
            return {
                account_id: acct.id,
                account_charges_enabled: acct.charges_enabled || false,
                account_disabled_reason: acct.requirements?.disabled_reason,
            };
        }
        return null;
    },

    async createStripeConnectAccount(): Promise<string> {
        const currentUser = await getCurrentUser();

        const countrySpec = await stripeAcct.countrySpecs.retrieve(currentUser.freelancerProfile?.country || 'US');
        const account = await stripeAcct?.accounts.create({
          type: "express",
          country: currentUser.freelancerProfile?.country || "US",
          email: currentUser.email,
          default_currency: countrySpec.default_currency,
          settings: {
            payouts: {
              schedule: {
                interval: "daily",
                delay_days: 10,
              },
            },
          }
        });
        console.log('connected account created: ', account);
        return account.id;
    },

    async createStripeConnectAccountLink(data: any): Promise<string> {
        const {account, return_url, refresh_url} = data;

        const accountLink = await stripeAcct?.accountLinks.create({
            account: account,
            return_url: return_url,
            refresh_url: refresh_url,
            type: "account_onboarding",
          });
        return accountLink.url;
    },
}