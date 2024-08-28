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
  FreelancerOnboardingSchema,
  FreelancerType,
} from "../../schema/FreelancerOnboardingSchema";
import OnboardingComplete from "../ui/modals/OnboardingComplete";
import ComboMultiSelect from "../ui/shared/ComboMultiSelect";
import { categories_clean, countries, skills } from "@/app/constants";
import { useUserContext } from "@/app/providers/UserProvider";
import { trackEvent } from "@/app/lib/mixpanel";
import Loader from '@/app/components/ui/shared/Loader';
import CategoryComboSelect from "../ui/shared/CategoryComboSelect";

const steps = [
  {
    id: "Personal Details",
    fields: ["firstName", "lastName", "country"],
  },
  {
    id: "Profile",
    fields: ["title", "profileSummary"],
  },
  { id: "Expertise", fields: ["skills", "categories"] },
  {
    id: "Compensation",
    fields: ["hourlyRate"],
  },
  {
    id: "Availability",
    fields: ["hoursPerWeek"],
  },
];

const FreelancerOnboardingForm = () => {
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
  } = useForm<FreelancerType>({
    resolver: zodResolver(FreelancerOnboardingSchema),
  });
  type FieldName = keyof FreelancerType;

  useEffect(() => {
    trackEvent("Signup Started", { type: "freelancer" });
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
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const handleCategorySelect = (val: any) => {
    clearErrors("categories")
    setSelectedCategory(val);
    setValue("categories", val);
  };

  const removeSelectedCategory = (val: any) => {
    let temp = [...selectedCategory];
    let indx = temp.findIndex((elem) => elem === val);
    if (indx != -1) {
      temp.splice(indx, 1);
      setSelectedCategory(temp);
      setValue("categories", temp);
    }
  }

  const handleSkillSelect = (val: any) => {
    clearErrors("skills")
    setSelectedSkills(val);
    setValue("skills", val);
  };

  function removeSkill(value: string) {
    let temp = selectedSkills.filter((skill) => skill != value);
    setSelectedSkills(temp);
  }

  async function onSubmit(data: FreelancerType) {
    try {
      setIsLoading(true);
      const res = await fetch("/api/freelancer/onboarding", {
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
      trackEvent("Signup Completed",{type: "freelancer"});
      await fetchUser();
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
                  <span className="flex items-center px-6 py-4 text-base">
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
            className="mt-8 relative h-96 sm:h-[22rem]"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Step 1 Fields */}
            <div>
              {currentStep === 0 && (
                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-3 ">
                    <label
                      htmlFor="first-name"
                      className="block text-base font-semibold leading-7 text-gray-900"
                    >
                      First name
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                      <input
                        type="text"
                        id="firstName"
                        {...register("firstName", {
                          onChange: () => clearErrors("firstName")
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
                      className="block text-base font-semibold leading-7 text-gray-900"
                    >
                      Last name
                    </label>

                    <div className="relative mt-2 rounded-md shadow-sm">
                      <input
                        type="text"
                        id="lastName"
                        {...register("lastName", {
                          onChange: () => clearErrors("lastName")
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
                          setValue("country", val.id);
                        }}
                        by="id"
                      >
                        {({ open }) => (
                          <>
                            <Listbox.Label className="block text-base font-semibold leading-7 text-gray-900">
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
                                  <span className="ml-3 block truncate">
                                    {selectedCountry.name}
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
                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="title"
                      className="text-base font-semibold leading-7 text-gray-900"
                    >
                      Title
                    </label>
                    <div className="mt-2 relative">
                      <div
                        className={classNames(
                          "flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset sm:max-w-md focus:outline-0",
                          errors.title
                            ? "ring-red-300"
                            : "focus:ring-2 focus:ring-inset focus:ring-black"
                        )}
                      >
                        <input
                          type="text"
                          {...register("title", {
                            onChange: () => clearErrors("title")
                          })}
                          id="title"
                          autoComplete="title"
                          className={classNames(
                            "block flex-1 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 pl-3 outline-0"
                          )}
                          placeholder="Add your profile title"
                        />
                        {errors.title && (
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <ExclamationCircleIcon
                              className="h-5 w-5 text-red-500"
                              aria-hidden="true"
                            />
                          </div>
                        )}
                      </div>
                      {errors.title && (
                        <p
                          className="mt-2 text-sm text-red-600 absolute"
                          id="email-error"
                        >
                          {errors.title.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="sm:col-span-6">
                    <label
                      htmlFor="last-name"
                      className="text-base font-semibold leading-7 text-gray-900"
                    >
                      Profile Summary<span className="font-normal text-xs flex italic">* Optional</span>
                    </label>
                    <div className="mt-2 relative">
                      <textarea
                        rows={5}
                        placeholder="Describe your strengths and skills, Highlight projects, accomplishments and education.  Keep it short and to the point."
                        {...register("profileSummary", {
                          onChange: () => clearErrors("profileSummary")
                        })}
                        id="profileSummary"
                        className={classNames(
                          "block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-0 sm:text-sm sm:leading-6",
                          errors.profileSummary
                            ? "ring-red-300"
                            : "focus:ring-2 focus:ring-inset focus:ring-black"
                        )}
                      />
                      {errors.profileSummary && (
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <ExclamationCircleIcon
                            className="h-5 w-5 text-red-500"
                            aria-hidden="true"
                          />
                        </div>
                      )}
                    </div>
                    {errors.profileSummary && (
                      <p
                        className="mt-2 text-sm text-red-600 absolute"
                        id="email-error"
                      >
                        {errors.profileSummary.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3 Fields */}
              {currentStep === 2 && (
                <div className="grid grid-cols-1 gap-x-6  sm:grid-cols-6">
                  <div className="sm:col-span-6 mb-9">
                    <label
                      htmlFor="category"
                      className="text-base font-semibold leading-7 text-gray-900"
                    >
                      Category
                    </label>
                    <div className="relative">
                      <CategoryComboSelect
                        selectedCategory={selectedCategory}
                        setSelectedCategory={handleCategorySelect}
                        errors={errors.categories}
                        multiple={true}
                      />
                      <div className="flex mt-4 gap-2 flex-wrap">
                        {selectedCategory.map((item) => (
                          <div
                            className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            key={item}
                          >
                            {item}
                            <button
                              type="button"
                              className="ml-4 text-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSelectedCategory(item);
                              }}
                            >
                              x
                            </button>
                          </div>
                        ))}
                      </div>
                      {errors.categories && (
                        <p
                          className="mt-2 text-sm text-red-600 absolute"
                          id="email-error"
                        >
                          {errors.categories.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="sm:col-span-6">
                    <div>
                      <h2 className="text-base font-semibold leading-7 text-gray-900">
                        Skills<span className="font-normal text-xs flex italic">* Optional</span>
                      </h2>
                    </div>
                    <div className="col-span-2 relative">
                      <ComboMultiSelect
                        label="Search skills or add your own"
                        options={skills}
                        selectedOptions={selectedSkills}
                        setSelectedOptions={handleSkillSelect}
                      />

                      {/* Pills */}
                      <div className="flex mt-4 gap-2 flex-wrap">
                        {selectedSkills.map((skill) => (
                          <div
                            className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            key={skill}
                          >
                            {skill}
                            <button
                              type="button"
                              className="w-fit bg-transparent ml-4 text-md"
                              onClick={() => removeSkill(skill)}
                            >
                              x
                            </button>
                          </div>
                        ))}
                      </div>
                      {errors.skills && (
                        <p
                          className="mt-2 text-sm text-red-600 absolute"
                          id="email-error"
                        >
                          {errors.skills.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4 Fields */}
              {currentStep === 3 && (
                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-8">
                  <div className="sm:col-span-3 !col-start-1 sm:!col-start-3 sm:!col-end-7">
                    <label
                      htmlFor="first-name"
                      className="text-base font-semibold leading-7 text-gray-900"
                    >
                      Hourly Rate
                    </label>
                    <div className="mt-2 relative">
                      <div className="relative mt-2 rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          id="hourlyRate"
                          {...register("hourlyRate", {
                            onChange: () => clearErrors("hourlyRate")
                          })}
                          className={classNames(
                            "block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-0 sm:text-sm sm:leading-6 pl-7 pr-12 focus:ring-2 focus:ring-inset focus:ring-black ",
                            errors.hourlyRate
                              ? "ring-red-300"
                              : "focus:ring-2 focus:ring-inset focus:ring-black"
                          )}
                        />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <span
                            className="text-gray-500 sm:text-sm"
                            id="price-currency"
                          >
                            USD
                          </span>
                        </div>
                      </div>
                    </div>
                    {errors.hourlyRate && (
                      <p
                        className="mt-2 text-sm text-red-600 absolute"
                        id="email-error"
                      >
                        {errors.hourlyRate.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 5 Fields */}
              {currentStep === 4 && (
                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-8">
                  <div className="sm:col-span-3 !col-start-1 sm:!col-start-3 sm:!col-end-7">
                    <label
                      htmlFor="last-name"
                      className="text-base font-semibold leading-7 text-gray-900 "
                    >
                      Weekly Hours Available
                    </label>
                    <div className="mt-4">
                      <div className="flex items-center mb-4">
                        <input
                          id="more-than-thirty"
                          type="radio"
                          value="MORE_THAN_30"
                          {...register("hoursPerWeek")}
                          className="w-4 h-4 text-black bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2"
                        />
                        <label
                          htmlFor="more-than-thirty"
                          className="ms-2 text-sm font-medium text-gray-900"
                        >
                          More than 30 hrs/week
                        </label>
                      </div>
                      <div className="flex items-center mb-4">
                        <input
                          id="less-than-thirty"
                          type="radio"
                          {...register("hoursPerWeek")}
                          value="LESS_THAN_30"
                          className="w-4 h-4 text-black bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 "
                        />
                        <label
                          htmlFor="less-than-thirty"
                          className="ms-2 text-sm font-medium text-gray-900"
                        >
                          Less than 30 hrs/week
                        </label>
                      </div>
                      <div className="flex items-center mb-4">
                        <input
                          id="as-needed"
                          type="radio"
                          {...register("hoursPerWeek")}
                          value="OPEN_OFFERS"
                          className="w-4 h-4 text-black bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2"
                        />
                        <label
                          htmlFor="as-needed"
                          className="ms-2 text-sm font-medium text-gray-900"
                        >
                          As needed - open to offers
                        </label>
                      </div>
                    </div>
                    {errors.hoursPerWeek && (
                      <p
                        className="mt-2 text-sm text-red-600 absolute"
                        id="email-error"
                      >
                        {errors.hoursPerWeek.message}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Navigation Buttons */}
            <div className="mt-8 pt-5 w-full bottom-0">
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
                  <button
                    disabled={isLoading || showSetupComplete}
                    type="submit"
                    key="btn-submit"
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
                ) : (
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
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
      <OnboardingComplete
        open={showSetupComplete}
        setOpen={setShowSetupComplete}
      />
    </>
  );
};

export default FreelancerOnboardingForm;
