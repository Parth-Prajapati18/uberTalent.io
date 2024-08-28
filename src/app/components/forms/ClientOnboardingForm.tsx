"use client";
import { Fragment, useEffect } from "react";
import { Listbox, Transition } from "@headlessui/react";
import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
  CheckIcon,
  ChevronUpDownIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { classNames, padNumber } from "@/app/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ClientOnboardingSchema,
  ClientOnbordingType,
} from "../../schema/ClientOnboardingSchema";
import OnboardingComplete from "../ui/modals/OnboardingComplete";
import { countries, industries } from "@/app/constants";
import { useUserContext } from "@/app/providers/UserProvider";
import { trackEvent } from "@/app/lib/mixpanel";
import Loader from '@/app/components/ui/shared/Loader';

const steps = [
  {
    id: "Personal Details",
    fields: ["firstName", "lastName", "country", "photo"],
  },
  {
    id: "Company Details",
    fields: ["companyName", "industry"],
  },
];

const ClientOnboardingForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [previousStep, setPreviousStep] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showSetupComplete, setShowSetupComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { fetchUser } = useUserContext();
  const { user } = useUserContext();
  
  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    clearErrors,
    formState: { errors },
  } = useForm<ClientOnbordingType>({
    resolver: zodResolver(ClientOnboardingSchema),
  });

  type FieldName = keyof ClientOnbordingType;

  useEffect(() => {
    trackEvent("Signup Started", { type: "clent" });
    if (user) {
      if (user?.firstName && user?.firstName !== "") {
        setValue("firstName", user?.firstName ?? "");
      }
      if (user?.lastName && user?.lastName !== "") {
        setValue("lastName", user?.lastName ?? "");
      }
    }
  });

  const next = async () => {
    console.log('next called!')
    const fields = steps[currentStep].fields;
    const output = await trigger(fields as FieldName[], { shouldFocus: true });

    if (!output) return;

    if (currentStep < steps.length - 1) {
      setPreviousStep(currentStep);
      setCurrentStep((step) => step + 1);
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setPreviousStep(currentStep);
      setCurrentStep((step) => step - 1);
    }
  };

  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [selectedIndustry, setSelectedIndustry] = useState("");

  useEffect(()=>{
    if(selectedCountry?.id) {
      setValue("country", selectedCountry?.id);
      clearErrors("country");
    } else {
      setValue("country", "");
    }
  }, [selectedCountry]);

  async function onSubmit(data: ClientOnbordingType) {
    console.log('submit called');
    try {
      setIsLoading(true);
      const res = await fetch("/api/client/onboarding", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const resp = await res.json();
        console.log(resp);
        alert(resp?.error || "Something went wrong");
        return;
      }
      await fetchUser();
      trackEvent("Signup Completed", {type: "client"});
      setHasSubmitted(true);
      setShowSetupComplete(true);
      setIsLoading(false);
    } catch (err) {
      console.log("ERROR", err);
    }
  }
  
  return (
    <>
      <nav aria-label="Progress">
        <ol
          role="list"
          className="divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0"
        >
          {steps.map((step, index) => (
            <li key={step.id} className="relative md:flex md:flex-1">
              {currentStep > index || hasSubmitted ? (
                <div className="group flex w-full items-center">
                  <span className="flex items-center px-6 py-4 text-base">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-black group-hover:bg-black">
                      <CheckIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="ml-4 text-base text-gray-900">
                      {step.id}
                    </span>
                  </span>
                </div>
              ) : currentStep === index ? (
                <div
                  className="flex items-center px-6 py-4 text-base"
                  aria-current="step"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-black">
                    <span className="text-black">
                      {padNumber(index + 1)}
                    </span>
                  </span>
                  <span className="ml-4 text-base text-black">
                    {step.id}
                  </span>
                </div>
              ) : (
                <div className="group flex items-center">
                  <span className="flex items-center px-6 py-4 base">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300">
                      <span className="text-gray-500">
                        {padNumber(index + 1)}
                      </span>
                    </span>
                    <span className="ml-4 text-base text-gray-500">
                      {step.id}
                    </span>
                  </span>
                </div>
              )}

              {index !== steps.length - 1 ? (
                <>
                  <div
                    className="absolute right-0 top-0 hidden h-full w-5 md:block"
                    aria-hidden="true"
                  >
                    <svg
                      className="h-full w-full text-gray-300"
                      viewBox="0 0 22 80"
                      fill="none"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0 -2L20 40L0 82"
                        vectorEffect="non-scaling-stroke"
                        stroke="currentcolor"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </>
              ) : null}
            </li>
          ))}
        </ol>
      </nav>
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <form
            className="mt-8 relative h-96 sm:h-72"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Step 1 Fields */}
            <div>
              {currentStep === 0 && (
                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-3 ">
                    <label
                      htmlFor="first-name"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      First name
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                      <input
                        type="text"
                        id="firstName"
                        {...register("firstName", {
                          onChange: () => {
                            clearErrors("firstName");
                          },
                        })}
                        autoComplete="given-name"
                        className={classNames(
                          "block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-0 sm:text-sm sm:leading-6",
                          errors.firstName
                            ? "ring-red-300"
                            : "focus:ring-2 focus:ring-inset focus:ring-black"
                        )}
                      />
                      {errors.firstName && (
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <ExclamationCircleIcon
                            className="h-5 w-5 text-red-500"
                            aria-hidden="true"
                          />
                        </div>
                      )}
                    </div>
                    {errors.firstName && (
                      <p
                        className="mt-2 text-sm text-red-600 absolute"
                        id="email-error"
                      >
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="last-name"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Last name
                    </label>

                    <div className="relative mt-2 rounded-md shadow-sm">
                      <input
                        type="text"
                        id="lastName"
                        {...register("lastName", {
                          onChange: () => {
                            clearErrors("lastName");
                          },
                        })}
                        autoComplete="given-name"
                        className={classNames(
                          "block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-0 sm:text-sm sm:leading-6",
                          errors.lastName
                            ? "ring-red-300"
                            : "focus:ring-2 focus:ring-inset focus:ring-black"
                        )}
                      />
                      {errors.lastName && (
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <ExclamationCircleIcon
                            className="h-5 w-5 text-red-500"
                            aria-hidden="true"
                          />
                        </div>
                      )}
                    </div>
                    {errors.lastName && (
                      <p
                        className="mt-2 text-sm text-red-600 absolute"
                        id="email-error"
                      >
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-3">
                    <div className="mt-2">
                      <Listbox
                        value={selectedCountry}
                        onChange={(val) => {
                          setSelectedCountry(val);
                        }}
                        by="id"
                      >
                        {({ open }) => (
                          <>
                            <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">
                              Country
                            </Listbox.Label>
                            <div className="relative mt-2">
                              <Listbox.Button
                                className={classNames(
                                  errors.country
                                    ? "ring-red-300"
                                    : "focus:ring-2  focus:ring-gray-500",
                                  "relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none sm:text-sm sm:leading-6"
                                )}
                              >
                                <span className="flex items-center">
                                  <span
                                    className={classNames(
                                      "ml-3 block truncate",
                                      selectedCountry?.name
                                        ? ""
                                        : "text-gray-400"
                                    )}
                                  >
                                    {selectedCountry.name || "Select Country"}
                                  </span>
                                </span>
                                <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                  {errors.country ? (
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                      <ExclamationCircleIcon
                                        className="h-5 w-5 text-red-500"
                                        aria-hidden="true"
                                      />
                                    </div>
                                  ) : (
                                    <ChevronUpDownIcon
                                      className="h-5 w-5 text-gray-400"
                                      aria-hidden="true"
                                    />
                                  )}
                                </span>
                              </Listbox.Button>

                              <Transition
                                show={open}
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                  {countries.map((country) => (
                                    <Listbox.Option
                                      key={country.id}
                                      className={({ active }) =>
                                        classNames(
                                          active
                                            ? "bg-black text-white"
                                            : "text-gray-900",
                                          "relative cursor-default select-none py-2 pl-3 pr-9"
                                        )
                                      }
                                      value={country}
                                    >
                                      {({ selected, active }) => (
                                        <>
                                          <div className="flex items-center">
                                            <span
                                              className={classNames(
                                                selected
                                                  ? "font-semibold"
                                                  : "font-normal",
                                                "ml-3 block truncate"
                                              )}
                                            >
                                              {country.name}
                                            </span>
                                          </div>

                                          {selected ? (
                                            <span
                                              className={classNames(
                                                active
                                                  ? "text-white"
                                                  : "text-black",
                                                "absolute inset-y-0 right-0 flex items-center pr-4"
                                              )}
                                            >
                                              <CheckIcon
                                                className="h-5 w-5"
                                                aria-hidden="true"
                                              />
                                            </span>
                                          ) : null}
                                        </>
                                      )}
                                    </Listbox.Option>
                                  ))}
                                </Listbox.Options>
                              </Transition>
                            </div>
                          </>
                        )}
                      </Listbox>
                      {errors.country && (
                        <p
                          className="mt-2 text-sm text-red-600 absolute"
                          id="email-error"
                        >
                          {errors.country.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 Fields */}
              {currentStep === 1 && (
                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-8">
                  <div className="sm:col-span-3 !col-start-1 sm:!col-start-3 sm:!col-end-7">
                    <label
                      htmlFor="first-name"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Company Name
                    </label>
                    <div className="mt-2 relative">
                      <input
                        type="text"
                        id="title"
                        {...register("companyName")}
                        className={classNames(
                          "block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-0 sm:text-sm sm:leading-6",
                          errors.companyName
                            ? "ring-red-300"
                            : "focus:ring-2 focus:ring-inset focus:ring-black"
                        )}
                      />
                      {errors.companyName && (
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <ExclamationCircleIcon
                            className="h-5 w-5 text-red-500"
                            aria-hidden="true"
                          />
                        </div>
                      )}
                    </div>
                    {errors.companyName && (
                      <p
                        className="mt-2 text-sm text-red-600 absolute"
                        id="email-error"
                      >
                        {errors.companyName.message}
                      </p>
                    )}
                  </div>
                  <br />
                  <div className="sm:col-span-3 !col-start-1 sm:!col-start-3 sm:!col-end-7">
                    <div className="mt-2">
                      <Listbox
                        value={selectedIndustry}
                        onChange={(val) => {
                          clearErrors("industry");
                          setSelectedIndustry(val);
                          setValue("industry", val);
                        }}
                      >
                        {({ open }) => (
                          <>
                            <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">
                              Industry
                            </Listbox.Label>
                            <div className="relative mt-2">
                              <Listbox.Button
                                className={classNames(
                                  errors.industry
                                    ? "ring-red-300"
                                    : "focus:ring-2  focus:ring-gray-500",
                                  "relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none sm:text-sm sm:leading-6 min-h-[32px]"
                                )}
                              >
                                <span className="flex items-center">
                                  <span className="ml-3 block truncate">
                                    {selectedIndustry}
                                  </span>
                                </span>
                                <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                  <ChevronUpDownIcon
                                    className="h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                  />
                                </span>
                              </Listbox.Button>

                              <Transition
                                show={open}
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                  {industries.map((industry) => (
                                    <Listbox.Option
                                      key={industry}
                                      className={({ active }) =>
                                        classNames(
                                          active
                                            ? "bg-black text-white"
                                            : "text-gray-900",
                                          "relative cursor-default select-none py-2 pl-3 pr-9"
                                        )
                                      }
                                      value={industry}
                                    >
                                      {({ selected, active }) => (
                                        <>
                                          <div className="flex items-center">
                                            <span
                                              className={classNames(
                                                selected
                                                  ? "font-semibold"
                                                  : "font-normal",
                                                "ml-3 block truncate"
                                              )}
                                            >
                                              {industry}
                                            </span>
                                          </div>

                                          {selected ? (
                                            <span
                                              className={classNames(
                                                active
                                                  ? "text-white"
                                                  : "text-black",
                                                "absolute inset-y-0 right-0 flex items-center pr-4"
                                              )}
                                            >
                                              <CheckIcon
                                                className="h-5 w-5"
                                                aria-hidden="true"
                                              />
                                            </span>
                                          ) : null}
                                        </>
                                      )}
                                    </Listbox.Option>
                                  ))}
                                </Listbox.Options>
                              </Transition>
                            </div>
                          </>
                        )}
                      </Listbox>
                      {errors.industry && (
                        <p
                          className="mt-2 text-sm text-red-600 absolute"
                          id="email-error"
                        >
                          {errors.industry.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Navigation Buttons */}
            <div className="mt-8 pt-5 absolute w-full bottom-0">
              <div className="flex justify-between">
                {currentStep > 0 ? (
                  <button
                    type="button"
                    key="btn-prev"
                    onClick={prev}
                    disabled={currentStep === 0}
                    className="inline-flex items-center gap-x-2 rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black w-28"
                  >
                    <ArrowLeftCircleIcon
                      className="-ml-0.5 h-5 w-5"
                      aria-hidden="true"
                    />
                    Previous
                  </button>
                ) : (
                  <div />
                )}
                {currentStep === steps.length - 1 ? (
                  <div className="flex gap-6">
                    <button
                      type="submit"
                      key="btn-submit"
                      disabled={isLoading || showSetupComplete}
                      className="inline-flex items-center gap-x-2 rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 disabled:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black w-28 justify-center"
                    >
                      Next
                      {isLoading ? (
                        <Loader className="w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" />
                      ) : (
                        <ArrowRightCircleIcon
                          className="-ml-0.5 h-5 w-5"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-6 ">
                    <button
                      type="button"
                      key="btn-next"
                      onClick={next}
                      disabled={currentStep === steps.length - 1}
                      className="inline-flex items-center gap-x-2 rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black w-28 justify-center"
                    >
                      Next
                      <ArrowRightCircleIcon
                        className="-ml-0.5 h-5 w-5"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      <OnboardingComplete
        open={showSetupComplete}
        setOpen={setShowSetupComplete}
        accountType="client"
      />
    </>
  );
};

export default ClientOnboardingForm;
