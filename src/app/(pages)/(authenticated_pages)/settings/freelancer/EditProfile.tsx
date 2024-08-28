"use client";
import ComboSelect from "@/app/components/ui/shared/ComboSelect";
import { Fragment, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  EditFreelancerProfileSchema,
  EditFreelancerProfileType,
} from "@/app/schema/EditFreelancerProfileSchema";
import {
  CheckIcon,
  ChevronUpDownIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { useUserContext } from "@/app/providers/UserProvider";
import { useAlert } from "@/app/providers/AlertProvider";
import { Listbox, Switch, Transition } from "@headlessui/react";
import { classNames, filterNumericInput } from "@/app/utils";
import { categories_clean, skills } from "@/app/constants";
import ComboMultiSelect from "@/app/components/ui/shared/ComboMultiSelect";
import CategoryComboSelect from "@/app/components/ui/shared/CategoryComboSelect";
import LanguageComboSelect from "@/app/components/ui/shared/LanguageComboSelect";

export default function EditProfile() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { user, fetchUser } = useUserContext();
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    user?.freelancerProfile?.skills || []
  );
  const [selectedCategory, setSelectedCategory] = useState<string[]>(
    user?.freelancerProfile?.category || []
  );
  const [langCounter, setLangCounter] = useState(0);
  const [availability, setAvailability] = useState(
    user?.freelancerProfile?.availability
  );
  const showAlert = useAlert();
  const profileImgRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<EditFreelancerProfileType>({
    resolver: zodResolver(EditFreelancerProfileSchema),
  });
  const [languageComponents, setLanguageComponents] = useState<{id?: string, compId: number, language: string, proficiency: string}[]>([]);

  const addLanguageComponent = (lang?: { language: string, proficiency: string, id?: string }) => {
    const languages = [...languageComponents];
    if (lang) {
      languages.push({ compId: langCounter, language: lang.language || '', proficiency: lang.proficiency || 'BASIC', id: lang.id || '' });
    } else {
      languages.push({ compId: langCounter, language: '', proficiency: 'BASIC', id: '' });
    }
    setLanguageComponents([...languages]);
    setValue("languages", languages.map((l) => { return { language: l.language, proficiency: l.proficiency, id: l.id || '' } }));
    setLangCounter(langCounter + 1);
  };

  const removeLanguage = (id: number) => {
    const lc = languageComponents.filter((comp) => comp.compId !== id);
    setLanguageComponents(lc);
    setValue("languages", lc.map((lang) => { return { language: lang.language, proficiency: lang.proficiency, id: lang.id || '' } }));
  };

  useEffect(() => {
    if (user?.freelancerProfile && user?.freelancerProfile?.languages) {
      const languages: {id?: string, compId: number, language: string, proficiency: string}[] = [];
      user?.freelancerProfile?.languages.forEach((l, index) => {
        languages.push({ id: l.id, compId: index, language: l.language, proficiency: l.proficiency });
      });
      setLanguageComponents([...languages])
      setLangCounter(user?.freelancerProfile?.languages.length);
      setValue("languages", languages.map((lang) => { return { language: lang.language, proficiency: lang.proficiency, id: lang.id || '' } }));
    }
  }, [user?.freelancerProfile?.languages]);

  useEffect(() => {
    if (user?.freelancerProfile) {
      setValue("title", user?.freelancerProfile.title);
      setValue("profileSummary", user?.freelancerProfile.overview || "");
      setValue("skills", user?.freelancerProfile.skills);
      // setValue("languages", user?.freelancerProfile.languages);
      setValue("category", user?.freelancerProfile.category || []);
      setValue("hourlyRate", user?.freelancerProfile.rate);
      setValue("hoursPerWeek", user?.freelancerProfile.availability || "");

      setAvailability(user?.freelancerProfile.availability);
      setSelectedSkills(user?.freelancerProfile.skills || []);
      setSelectedCategory(user?.freelancerProfile?.category || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.freelancerProfile?.id]);

  function removeSkill(value: string) {
    let temp = selectedSkills.filter((skill) => skill != value);
    setSelectedSkills(temp);
    setValue("skills", temp);
  }

  function handleSkillSelect(val: any) {
    setSelectedSkills(val);
    setValue("skills", val);
  }

  function handleCategorySelect(val: any) {
    setSelectedCategory(val);
    setValue("category", val);
  }

  function handleLanguageSelect(id: number, val: string) {
    let languages: {id?: string, compId: number, language: string, proficiency: string}[] = [];
    languageComponents.forEach((lc) => {
      if (lc.compId === id) {
        lc.language = val;
      }
      languages.push(lc);
    });
    setLanguageComponents([...languages]);
    setValue("languages", languages.map((lang) => { return { language: lang.language, proficiency: lang.proficiency, id: lang.id || '' } }))
  }

  function handleProficiencySelect(id: number, val: string) {
    let languages: {id?: string, compId: number, language: string, proficiency: string}[] = [];
    languageComponents.forEach((lc) => {
      if (lc.compId === id) {
        lc.proficiency = val;
      }
      languages.push(lc);
    });
    setLanguageComponents([...languages]);
    setValue("languages", languages.map((lang) => { return { language: lang.language, proficiency: lang.proficiency, id: lang.id || '' } }))
  }

  const removeCategory = (val: any) => {
    let temp = selectedCategory.filter((cat) => cat != val);
    setSelectedCategory(temp);
    setValue("category", temp);
  };

  const handleAvailability = (e: any) => {
    setAvailability(e.target.value);
    setValue("hoursPerWeek", e.target.value);
  };

  const profileSummaryInput = watch("profileSummary");
  useEffect(() => {
    if (profileSummaryInput?.trim()?.split(/\s+/)?.length) {
      clearErrors("profileSummary");
    }
  }, [profileSummaryInput]);

  async function onSubmit(data: EditFreelancerProfileType) {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/freelancer/settings/profile`, {
        method: "PUT",
        body: JSON.stringify({
          id: user?.freelancerProfile?.id,
          ...data,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        setIsLoading(false);
        showAlert("error", "Error in updating profile");
        alert("Something went wrong");
        return;
      }
      const resData = await response.json();
      router.refresh();
      

      await fetchUser();
      // setUser({ ...user, freelancerProfile: resData });
      setIsLoading(false);
      showAlert("success", "Profile updated successfully");
    } catch (err) {
      console.log("ERROR", err);
    }
  }

  return (
    <div>
      {/* <h2 className="text-base font-semibold leading-7 text-gray-900 mb-12 space-y-6">
        Profile Summary
      </h2> */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-12">
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 border-b border-gray-900/10 pb-6">
            <div>
              <h2 className="text-base font-semibold leading-7 text-gray-900">
                {/* Profile Summary */}
                Profile
              </h2>
              {/* <p className="mt-1 text-sm leading-6 text-gray-600">
              This information will be displayed publicly so be careful what you
              share.
            </p> */}
            </div>

            {/*  PROFILE SUMMARY SECTION  */}
            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
              <div className="sm:col-span-4">
                <label
                  htmlFor="jobTitle"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Title
                </label>
                <div className="mt-2">
                  <div className="flex flex-col relative rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-black sm:max-w-md">
                    <input
                      type="text"
                      id="jobTitle"
                      className="block flex-1 border-0 bg-transparent py-1.5  text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 outline-none pl-3"
                      placeholder="HR Manager"
                      {...register("title")}
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
              <div className="col-span-full">
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Profile Summary
                </label>
                <div className="mt-2 relative">
                  <textarea
                    id="bio"
                    rows={3}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 outline-0 pl-3"
                    defaultValue={""}
                    {...register("profileSummary")}
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
                {errors.profileSummary ? (
                  <p
                    className="mt-2 text-sm text-red-600 absolute"
                    id="email-error"
                  >
                    {errors.profileSummary.message}
                  </p>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    Write a few sentences about yourself.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/*  SKILLS SECTION  */}
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 border-b border-gray-900/10 pb-6">
            <div>
              <h2 className="text-base font-semibold leading-7 text-gray-900">
                Skills
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

          {/* Category Section */}
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 border-b border-gray-900/10 pb-6">
            <label
              htmlFor="category"
              className="block text-base font-semibold leading-7 text-gray-900"
            >
              Category
            </label>
            <div className="col-span-2 relative">
              <CategoryComboSelect
                selectedCategory={selectedCategory}
                setSelectedCategory={handleCategorySelect}
                errors={errors.category}
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
                        removeCategory(item);
                      }}
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
              {errors.category && (
                <p
                  className="mt-2 text-sm text-red-600 absolute"
                  id="email-error"
                >
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>
          {/* Languages Section */}
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 border-b border-gray-900/10 pb-12">
            <label
              htmlFor="category"
              className="block text-base font-semibold leading-7 text-gray-900"
            >
              Languages
            </label>
            <div className="col-span-2 relative">
              {languageComponents.length === 0 && (
                <div>
                  <p className="text-sm text-gray-800">No Languages saved</p>
                </div>
              )}
              {languageComponents.map((comp, index) => {
                return (
                  <div key={comp.compId}>
                    <LanguageComboSelect
                      langId={comp.compId}
                      selectedLanguage={comp.language}
                      setSelectedLanguage={handleLanguageSelect}
                      selectedProficiency={comp.proficiency}
                      setSelectedProficiency={handleProficiencySelect}
                      removeLanguage={removeLanguage}
                      errors={errors.languages}
                    />
                    {errors.languages && errors.languages[index] && (
                      <p
                        className="mt-2 text-sm text-red-600"
                        id="language-error"
                      >
                        {errors.languages[index]?.language?.message}
                      </p>
                    )}
                  </div>
                )
              })
              }
              
              <button type="button" onClick={() => addLanguageComponent()} className="rounded bg-black px-2 py-1 hover:bg-stone-800 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 mt-3">Add Language</button>
            </div>
          </div>
          {/*  COMPENSATION SECTION  */}
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 border-b border-gray-900/10 pb-6">
            <div>
              <h2 className="text-base font-semibold leading-7 text-gray-900">
                Compensation
              </h2>
            </div>
            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
              <div className="sm:col-span-4">
                <label
                  htmlFor="hourly-rate"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Hourly Rate
                </label>
                <div className="mt-2 relative flex">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <span className="text-gray-900">$</span>
                  </div>
                  <input
                    type="text"
                    id="hourly-rate"
                    className="block w-full pl-7 pr-10 rounded-md border-gray-300 py-1.5 text-gray-900 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                    placeholder="0.00"
                    {...register("hourlyRate")}
                    onInput={filterNumericInput}
                    style={{
                      paddingRight: errors.hourlyRate ? "2.5rem" : undefined,
                    }} // Adjust paddingRight based on error icon presence
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span
                      className="text-gray-500 sm:text-sm"
                      id="price-currency"
                    >
                      USD
                    </span>
                  </div>
                  {errors.hourlyRate && (
                    <div className="pointer-events-none absolute inset-y-0 right-0 pr-3 flex items-center">
                      <ExclamationCircleIcon
                        className="h-5 w-5 text-red-500"
                        aria-hidden="true"
                      />
                    </div>
                  )}
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
          </div>

          {/* NOTIFICATION SECTION  */}
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 border-b border-gray-900/10 pb-6">
            <div>
              <h2 className="text-base font-semibold leading-7 text-gray-900">
                Availability
              </h2>
            </div>

            <div className="max-w-2xl space-y-10 md:col-span-2">
              <fieldset>
                <legend className="text-sm font-semibold leading-6 text-gray-900">
                  How many hours per week are you available?
                </legend>
                <div className="mt-6 space-y-6">
                  <div className="flex items-center gap-x-3">
                    <input
                      id="more-than-thirty"
                      type="radio"
                      className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                      value="MORE_THAN_30"
                      checked={availability === "MORE_THAN_30"}
                      onChange={handleAvailability}
                    />
                    <label
                      htmlFor="more-than-thirty"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      More than 30 hrs/week
                    </label>
                  </div>
                  <div className="flex items-center gap-x-3">
                    <input
                      id="less-than-thirty"
                      type="radio"
                      className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                      value="LESS_THAN_30"
                      checked={availability === "LESS_THAN_30"}
                      onChange={handleAvailability}
                    />
                    <label
                      htmlFor="less-than-thirty"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Less than 30 hrs/week
                    </label>
                  </div>
                  <div className="flex items-center gap-x-3">
                    <input
                      id="open-to-offers"
                      type="radio"
                      className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                      value="OPEN_OFFERS"
                      checked={availability === "OPEN_OFFERS"}
                      onChange={handleAvailability}
                    />
                    <label
                      htmlFor="open-to-offers"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Open to offers
                    </label>
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
              </fieldset>
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
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
