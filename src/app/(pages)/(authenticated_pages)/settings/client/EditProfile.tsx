"use client";
import { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserContext } from "@/app/providers/UserProvider";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";

import {
  EditClientProfileSchema,
  EditClientProfileType,
} from "@/app/schema/EditCientProfileSchema";
import { classNames } from "@/app/utils/index";
// import industries from "@/app/constants/industries";
import { useAlert } from "@/app/providers/AlertProvider";
import { industries } from "@/app/constants";

interface Option {
  id: number;
  value: string;
}

export default function EditProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, fetchUser } = useUserContext();
  const [selectedIndustry, setSelectedIndustry] = useState(
    user?.client?.industry
  );
  const showAlert = useAlert();

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<EditClientProfileType>({
    resolver: zodResolver(EditClientProfileSchema),
  });

  useEffect(() => {
    if (user?.client) {
      setValue("companyName", user?.client.companyName);
      setValue("industry", user?.client.industry);
      setSelectedIndustry(user?.client.industry);
    }
  }, [user?.client?.id]);

  async function onSubmit(data: EditClientProfileType) {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/client/settings/profile`, {
        method: "PUT",
        body: JSON.stringify({
          id: user?.client?.id,
          ...data,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        showAlert("error", "Error in updating profile");
        alert("Something went wrong");
        return;
      }
      const resData = await response.json();
      setIsLoading(false);
      showAlert("success", "Profile updated successfully");
      await fetchUser();
      // setUser({ ...user, client: resData });
    } catch (err) {
      console.log("ERROR", err);
    }
  }

  return (
    <div>
      {/* <h2 className="text-base font-semibold leading-7 text-gray-900 mb-12 space-y-6">
        Company Information
      </h2> */}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-12">
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
            <div>
              <h2 className="text-base font-semibold leading-7 text-gray-900">
                Company Details
              </h2>
            </div>

            {/*  PROFILE SUMMARY SECTION  */}
            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
              <div className="sm:col-span-4">
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Company Name
                </label>
                <div className="mt-2">
                  <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-black sm:max-w-md">
                    <input
                      type="text"
                      id="companyName"
                      className="block flex-1 border-0 bg-transparent py-1.5  text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 outline-none pl-3"
                      placeholder="Company Name"
                      {...register("companyName")}
                    />
                  </div>
                </div>
              </div>
              <div className="sm:col-span-4">
                <div className="mt-2">
                  {selectedIndustry && (
                    <Listbox
                      value={selectedIndustry}
                      onChange={(val) => {
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
                  )}

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
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          {/* <button
          type="button"
          className="text-sm font-semibold leading-6 text-gray-900"
          onClick={toggleEditProfile}
        >
          Cancel
        </button> */}
          <button
            type="submit"
            className="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            onClick={() => {}}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
