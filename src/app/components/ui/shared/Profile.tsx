"use client";
import { useUser } from "@clerk/clerk-react";
import { useUserContext } from "@/app/providers/UserProvider";
import React, {
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { upload } from "@vercel/blob/client";
import EditProfile from "@/app/(pages)/(authenticated_pages)/settings/freelancer/EditProfile";
import { useAlert } from "@/app/providers/AlertProvider";
import { countriesData, countries } from "@/app/constants";
import Image from "next/image";
import { userService } from "@/app/services/userService";
import { updateProfileImage } from "@/app/lib/api";
import { Listbox, Switch, Transition } from "@headlessui/react";
import {
  CheckIcon,
  ChevronUpDownIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { classNames } from "@/app/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  EditUserProfileSchema,
  EditUserProfileType,
} from "@/app/schema/EditUserProfileSchema";
import { useSelector } from "react-redux";
import { AppState } from "@/app/(pages)/(authenticated_pages)/messages/store";
import { Client } from "@twilio/conversations";
import { MessagesContext } from "@/app/providers/MessagesProvider";

const Profile = ({ children }: { children: React.ReactNode }) => {
  const profileImgRef = useRef<HTMLInputElement>(null);
  const { user, fetchUser, userType } = useUserContext();
  const [editProfile, setEditProfile] = useState(false);
  const [profileImgUrl, setProfileImgUrl] = useState(user?.profileImg);
  const [imageLoading, setImageLoading] = useState(false);
  const showAlert = useAlert();
  const { isLoaded, user: authUser } = useUser();
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<any>();
  const token = useSelector((state: AppState) => state.token);
  const { client: twilioClient } = useContext(MessagesContext);
  const [isPrivate, setIsPrivate] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<EditUserProfileType>({
    resolver: zodResolver(EditUserProfileSchema),
  });

  useEffect(() => {
    setProfileImgUrl(user?.profileImg);
  }, [user?.profileImg]);

  useEffect(() => {
    if (user?.client?.id) {
      setValue("firstName", user?.firstName || "");
      setValue("lastName", user?.lastName || "");
      setValue("country", user?.client?.country || "");
      setSelectedCountry(user?.client?.country);
    }
  }, [user?.client?.id]);

  useEffect(() => {
    if (user?.freelancerProfile?.id) {
      setValue("firstName", user?.firstName || "");
      setValue("lastName", user?.lastName || "");
      setValue("country", user?.freelancerProfile?.country || "");
      setSelectedCountry(user?.freelancerProfile?.country);
      setValue("isPrivate", user?.freelancerProfile.isPrivate || false);
      setIsPrivate(user?.freelancerProfile.isPrivate || false);
    }
  }, [user?.freelancerProfile?.id]);

  function toggleEditProfile() {
    setEditProfile((prev) => !prev);
  }

  const handleButtonClick = () => {
    if (profileImgRef.current) {
      profileImgRef.current.click();
    }
  };

  const handleImageChange = async (e: any) => {
    setImageLoading(true);
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setProfileImgUrl(reader.result as string);
      };
      // const newBlob = await upload(file.name, file, {
      //   access: "public",
      //   handleUploadUrl: "/api/user/avatar",
      // });
      // const response = await fetch(`/api/user/avatar`, {
      //   method: "PUT",
      //   body: JSON.stringify({
      //     profileImg: newBlob.url,
      //   }),
      // });
      // if (!response.ok) {
      //   showAlert("error", "Error in uploading image");
      //   alert("Something went wrong");
      // }

      const imageResource = await authUser?.setProfileImage({
        file: file,
      });
      if (!imageResource) {
        showAlert("error", "Error in uploading image");
        alert("Something went wrong");
      }

      await updateProfileImage(imageResource?.publicUrl || "");
      if (twilioClient) {
        const twilioUser = await twilioClient.getUser(user.email);
        await twilioUser.updateAttributes({
          avatar: imageResource?.publicUrl || "",
        });
      }

      await fetchUser();
      // setUser({ ...user, profileImg: newBlob.url });
      setImageLoading(false);
      showAlert("success", "Profile picture updated successfully");
    }
  };

  const handleUpdateClick = () => {
    setIsEdit(!isEdit);
  };

  const handlePrivate = (value: any) => {
    setIsPrivate(value);
    setValue("isPrivate", value);
    onSubmit(getValues());
  };

  async function onSubmit(data: EditUserProfileType) {
    try {
      const response = await fetch(`/api/user/settings/profile`, {
        method: "PUT",
        body: JSON.stringify({
          id: user?.client?.id ? user?.client?.id : user?.freelancerProfile?.id,
          ...data,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        setIsEdit(false);
        showAlert("error", "Error in updating profile");
        alert("Something went wrong");
        return;
      }
      await fetchUser();
      if (twilioClient) {
        const twilioUser = await twilioClient.getUser(user.email);
        await twilioUser.updateFriendlyName(
          `${data.firstName} ${data.lastName}`
        );
      }
      // setUser({ ...user, freelancerProfile: resData });
      setIsEdit(false);
      showAlert("success", "Profile updated successfully");
    } catch (err) {
      console.log("ERROR", err);
    }
  }

  return editProfile ? (
    <EditProfile />
  ) : (
    <div className="mx-auto max-w-xl space-y-16 sm:space-y-20 lg:mx-0">
      <div>
        <div className="flex justify-between items-start gap-x-8">
          <div>
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Personal Details
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              This information will be displayed publicly so be careful what you
              share.
            </p>
          </div>
        </div>

        <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
          <div className="pt-6 sm:flex justify-between">
            <div className="col-span-full flex items-center gap-x-8">
              <Image
                src={profileImgUrl || "/images/default-avatar.jpg"}
                alt=""
                height={100}
                width={100}
                className="h-24 w-24 flex-none rounded-lg bg-gray-800 object-cover"
              />
              <div>
                <input
                  style={{ display: "none" }}
                  type="file"
                  name="profileImg"
                  ref={profileImgRef}
                  onChange={(e) => {
                    handleImageChange(e);
                  }}
                />

                <button
                  className="min-w-28 rounded-md px-3 py-2 text-sm font-semibold shadow-sm bg-black hover:bg-stone-800 text-white focus:outline-none focus:ring-2 focus:ring-white"
                  type="button"
                  onClick={handleButtonClick}
                >
                  {imageLoading ? (
                    <span className="ml-2">Uploading...</span>
                  ) : (
                    "Edit Photo"
                  )}
                </button>
                {/* <button
                  type="button"
                  className="rounded-md px-3 py-2 text-sm font-semibold shadow-sm bg-black hover:bg-stone-800 text-white focus:outline-none focus:ring-2 focus:ring-white"
                  onClick={toggleEditProfile}
                >
                  Change avatar
                </button> */}
                <p className="mt-2 text-xs leading-5 text-gray-400">
                  JPG, GIF or PNG. 1MB max.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4 sm:mt-0">
              {user?.freelancerProfile?.status === "ON_HOLD" && (
                <a
                  href="mailto:UberTalent<support@ubertalent.io>"
                  className="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:col-start-2 disabled:opacity-50 disabled:cursor-wait"
                >
                  Reactivation
                </a>
              )}
              {userType === "FREELANCER" && (
                <div className="sm:col-span-4">
                  <label
                    htmlFor="jobTitle"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Private
                  </label>
                  <Switch
                    checked={isPrivate}
                    onChange={handlePrivate}
                    className={classNames(
                      isPrivate ? "bg-black" : "bg-gray-200",
                      "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    )}
                  >
                    <span className="sr-only">Use setting</span>
                    <span
                      aria-hidden="true"
                      className={classNames(
                        isPrivate ? "translate-x-5" : "translate-x-0",
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                      )}
                    />
                  </Switch>
                </div>
              )}
            </div>
          </div>
        </dl>
        <form
          className="mt-6 space-y-6 border-t border-gray-200 text-sm leading-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="pt-6 sm:flex">
            <dt className="font-medium text-gray-900 sm:w-32 sm:flex-none sm:pr-6">
              Full name
            </dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              {isEdit ? (
                <div className="flex gap-3">
                  <div className="mt-0">
                    <div className="flex flex-col relative rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-black sm:max-w-md">
                      <input
                        type="text"
                        id="first-name"
                        placeholder="First Name"
                        className="block flex-1 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 outline-none pl-3 w-24 md:w-32"
                        {...register("firstName")}
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
                  <div className="mt-0">
                    <div className="flex flex-col relative rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-black sm:max-w-md">
                      <input
                        type="text"
                        id="last-name"
                        placeholder="Last Name"
                        className="block flex-1 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 outline-none pl-3 w-24 md:w-32"
                        {...register("lastName")}
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
                  <button
                    type="submit"
                    className="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateClick}
                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <button
                    type="button"
                    className="font-semibold text-black hover:text-black"
                    onClick={handleUpdateClick}
                  >
                    Update
                  </button>
                </>
              )}
            </dd>
          </div>
          <div className="pt-6 sm:flex">
            <dt className="font-medium text-gray-900 sm:w-32 sm:flex-none sm:pr-6">
              Country
            </dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              {isEdit ? (
                <div className="relative w-full">
                  <Listbox
                    value={selectedCountry}
                    onChange={(val) => {
                      setSelectedCountry(val.id);
                      setValue("country", val.id);
                    }}
                    by="id"
                  >
                    {({ open }) => (
                      <>
                        <div className="relative w-full max-w-52">
                          <Listbox.Button className="relative w-full cursor-default focus:ring-2  focus:ring-gray-500 rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none sm:text-sm sm:leading-6">
                            <span className="flex items-center">
                              <span className="ml-3 block truncate">
                                {countriesData[selectedCountry]}
                              </span>
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                              {errors.country ? (
                                <ExclamationCircleIcon
                                  className="h-5 w-5 text-red-500"
                                  aria-hidden="true"
                                />
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
              ) : (
                <div className="text-gray-900">
                  {user?.client?.country
                    ? countriesData[user?.client?.country]
                    : user?.freelancerProfile?.country &&
                      countriesData[user?.freelancerProfile?.country]}
                </div>
              )}
            </dd>
          </div>
        </form>
        <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-100 text-sm leading-6">
          <div className="pt-6 sm:flex">
            <dt className="font-medium text-gray-900 sm:w-32 sm:flex-none sm:pr-6">
              Email address
            </dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <div className="text-gray-900">{user?.email}</div>
            </dd>
          </div>
          <div className="pt-6 sm:flex"></div>
        </dl>
      </div>

      <div>
        {/* <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
          <div className="pt-6 sm:flex">
            <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
              Position Title
            </dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <div className="text-gray-900">{freelancerProfile?.title}</div>
              <button
                type="button"
                className="font-semibold text-black hover:text-black"
                onClick={toggleEditProfile}
              >
                Update
              </button>
            </dd>
          </div>
          <div className="pt-6 sm:flex">
            <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
              Bio
            </dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <div className="text-gray-900">{freelancerProfile?.overview}</div>
              <button
                type="button"
                className="font-semibold text-black hover:text-black"
                onClick={toggleEditProfile}
              >
                Update
              </button>
            </dd>
          </div>
        </dl> */}
      </div>
      {children}

      {/* <div>
        <h2 className="text-base font-semibold leading-7 text-gray-900">
          Skills
        </h2>

        <ul
          role="list"
          className="mt-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6"
        >
          <li className="flex justify-between gap-x-6 py-6">
            <div className="font-medium text-gray-900 flex gap-x-3 gap-y-4 whitespace-nowrap flex-col sm:flex-row">
              {freelancerProfile?.skills.map((skill: any) => (
                <div
                  className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  key={skill?.id}
                >
                  {skill?.value}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="font-semibold text-black hover:text-black"
              onClick={toggleEditProfile}
            >
              Update
            </button>
          </li>
        </ul>
      </div>

      <div>
        <h2 className="text-base font-semibold leading-7 text-gray-900">
          Compensation
        </h2>
        <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
          <div className="pt-6 sm:flex">
            <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
              Hourly Rate
            </dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <div className="text-gray-900">${freelancerProfile?.rate}</div>
              <button
                type="button"
                className="font-semibold text-black hover:text-black"
                onClick={toggleEditProfile}
              >
                Update
              </button>
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h2 className="text-base font-semibold leading-7 text-gray-900">
          Availability
        </h2>
        <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
          <div className="pt-6 sm:flex">
            <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
              Weekly Availability
            </dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <div className="text-gray-900">
                {freelancerProfile?.availability &&
                  AVAILABILITY[freelancerProfile?.availability]}
              </div>
              <button
                type="button"
                className="font-semibold text-black hover:text-black"
                onClick={toggleEditProfile}
              >
                Update
              </button>
            </dd>
          </div>
        </dl>
      </div> */}
    </div>
  );
};

export default Profile;
