"use client";
import ComboSelect from "@/app/components/ui/shared/ComboSelect";
import { CreateJobSchema, CreateJobType } from "@/app/schema/CreateJobSchema";
import { notFound } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Fragment, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { classNames } from "@/app/utils";
import {
  CheckIcon,
  ChevronUpDownIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { Job } from "@prisma/client";
import { Listbox, Transition } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { categories_clean, skills } from "@/app/constants";

type JobFormProps = {
  data?: Job;
  handleAddJob: any;
  handleSaveAsDraft: any;
  type: string;
};
const JobForm = ({
  data,
  handleAddJob,
  handleSaveAsDraft,
  type,
}: JobFormProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string[]>(
    data?.categories || []
  );
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    data?.skills || []
  );

  const router = useRouter();
  useEffect(() => {
    if (data) {
      setValue("title", data.title);
      setValue("description", data.description);
      setValue("categories", data.categories);
      setValue("skills", data.skills);
      setValue("projectDuration", data.duration);
      setValue("compensation", "HOURLY");
      if (data.compType === "HOURLY") {
        setValue("hourlyMinRate", data.hourlyMinRate as number);
        setValue("hourlyMaxRate", data.hourlyMaxRate as number);
      } else if (data.compType === "FIXED") {
        setValue("projectCost", data.projectCost as number);
      }
      setSelectedCategory(data.categories || []);
      setSelectedSkills(data?.skills || []);
    } else {
      setValue("compensation", "HOURLY");
    }
  }, [data?.id]);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    watch,
    reset
  } = useForm<CreateJobType>({
    resolver: zodResolver(CreateJobSchema),
  });

  const categoryOnSelect = (val: any) => {
    let temp = [...selectedCategory];
    let indx = temp.findIndex((elem) => elem === val);
    if (indx != -1) {
      temp.splice(indx, 1);
    } else {
      temp.push(val);
    }
    setSelectedCategory(temp);
    setValue("categories", temp);
  };

  function removeSkill(value: string) {
    let temp = selectedSkills.filter((skill) => skill != value);
    setValue("skills", temp);
    setSelectedSkills(temp);
  }

  function handleSkillSelect(val: any) {
    setSelectedSkills(val);
    setValue("skills", val);
  }

  const handleCancel = () => {
    reset();
    router.push('/client-dashboard');
  };

  const parseFormValue = (data: any) => {
    if (!data.hourlyMinRate) {
      data.hourlyMinRate = null;
    } else {
      data.hourlyMinRate = Number(data.hourlyMinRate);
    }
    if (!data.hourlyMaxRate) {
      data.hourlyMaxRate = null;
    } else {
      data.hourlyMaxRate = Number(data.hourlyMaxRate);
    }
    if (!data.projectCost) {
      data.projectCost = null;
    } else {
      data.projectCost = Number(data.projectCost);
    }
    return data;
  }

  const onSubmit: SubmitHandler<CreateJobType> = async (data: any, event: any) => {
    const name = event.nativeEvent?.submitter?.name;

    data = parseFormValue(data);

    if (name === "draft") {
      handleSaveAsDraft(data);
    } else {
      handleAddJob(data);
    }
  };

  const handleSaveAsDraftJob = () => {
    const data: any = parseFormValue(getValues());
    if (!data.projectDuration) {
      data.projectDuration = "ONE_TO_THREE_MONTHS";
    }
    handleSaveAsDraft(data);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit((data) => onSubmit(data, e!))(e);
      }}
    >
      <div className="space-y-12">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
          <div>
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Create new job
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              This information will be displayed publicly so be careful what you
              share.
            </p>
          </div>

          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
            <div className="sm:col-span-4">
              <label
                htmlFor="jobPostTitle"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Write a title for your job post
              </label>
              <div className="mt-2 relative">
                <div
                  className={classNames(
                    "flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset sm:max-w-md",
                    errors.title
                      ? "ring-red-300"
                      : "focus:ring-2 focus:ring-inset focus:ring-black"
                  )}
                >
                  <input
                    type="text"
                    {...register("title")}
                    id="jobPostTitle"
                    className="block flex-1 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 focus:outline-0 px-3"
                    defaultValue={data?.title}
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
              </div>
              {errors.title && (
                <p className="mt-2 text-sm text-red-600" id="title-error">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="col-span-full">
              <label
                htmlFor="description"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Enter job description
              </label>
              <div className="mt-2 relative">
                <textarea
                  id="description"
                  {...register("description")}
                  rows={12}
                  className={classNames(
                    "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 focus:outline-0 px-3",
                    errors.description
                      ? "ring-red-300"
                      : "focus:ring-2 focus:ring-inset focus:ring-black"
                  )}
                  defaultValue={data?.description}
                />
                {errors.description && (
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ExclamationCircleIcon
                      className="h-5 w-5 text-red-500"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </div>
              {errors.description && (
                <p className="mt-2 text-sm text-red-600" id="decription-error">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
          <div>
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Expertise
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              What are the main skills required for this project?
            </p>
          </div>

          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
            <div className="col-span-full">
              <label
                htmlFor="categories"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Category
              </label>
              <div className="relative">
                <Listbox value={selectedCategory} onChange={categoryOnSelect}>
                  {({ open }) => (
                    <>
                      <div className="relative mt-2">
                        <Listbox.Button
                          className={classNames(
                            errors.categories
                              ? "ring-red-300"
                              : "focus:ring-2  focus:ring-gray-500",
                            "relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none sm:text-sm sm:leading-6 min-h-[32px]"
                          )}
                        >
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
                            {Object.keys(categories_clean).map((group: any) => {
                              return (
                                <div key={group}>
                                  <li className="block m-0 px-2 py-0 font-bold leading-loose bg-gray-200">
                                    {group}
                                  </li>
                                  {Object.values(categories_clean[group]).map(
                                    (cat: any) => (
                                      <Listbox.Option
                                        key={cat}
                                        className={({ active }) =>
                                          classNames(
                                            active
                                              ? "bg-black text-white"
                                              : "text-gray-900",
                                            "relative cursor-default select-none py-2 pl-3 pr-9"
                                          )
                                        }
                                        value={cat}
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
                                                {cat}
                                              </span>
                                            </div>

                                            {selectedCategory.includes(cat) ? (
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
                                    )
                                  )}
                                </div>
                              );
                            })}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </>
                  )}
                </Listbox>
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
                          categoryOnSelect(item);
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
            <br />
            <div className="col-span-full">
              <ComboSelect
                label="Search skills or add your own"
                options={skills}
                selectedOptions={selectedSkills}
                setSelectedOptions={handleSkillSelect}
                inputClasses={
                  errors.skills
                    ? "ring-red-300"
                    : "focus:ring-2 focus:ring-inset focus:ring-black"
                }
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
              {errors.skills && selectedSkills.length < 1 && (
                <p className="mt-2 text-sm text-red-600" id="decription-error">
                  {errors.skills.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
          <div>
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Project scope
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Please estimate your project time and cost, this will help us
              narrow down the search.
            </p>
          </div>

          <div className="max-w-2xl space-y-10 md:col-span-2">
            <fieldset>
              <legend className="text-sm font-semibold leading-6 text-gray-900">
                How long will the work take?
              </legend>
              <div className="mt-6 space-y-6">
                <div className="flex items-center gap-x-3">
                  <input
                    id="ONE_TO_THREE_MONTHS"
                    {...register("projectDuration")}
                    value="ONE_TO_THREE_MONTHS"
                    type="radio"
                    className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                    defaultChecked={data?.duration === "ONE_TO_THREE_MONTHS"}
                  />
                  <label
                    htmlFor="ONE_TO_THREE_MONTHS"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    1 to 3 months
                  </label>
                </div>
                <div className="flex items-center gap-x-3">
                  <input
                    id="THREE_TO_SIX_MONTHS"
                    value="THREE_TO_SIX_MONTHS"
                    {...register("projectDuration")}
                    type="radio"
                    className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                    defaultChecked={data?.duration === "THREE_TO_SIX_MONTHS"}
                  />
                  <label
                    htmlFor="THREE_TO_SIX_MONTHS"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    3 to 6 months
                  </label>
                </div>
                <div className="flex items-center gap-x-3">
                  <input
                    id="MORE_THAN_6_MONTHS"
                    value="MORE_THAN_6_MONTHS"
                    {...register("projectDuration")}
                    type="radio"
                    className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                    defaultChecked={data?.duration === "MORE_THAN_6_MONTHS"}
                  />
                  <label
                    htmlFor="MORE_THAN_6_MONTHS"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    More than 6 months
                  </label>
                </div>
              </div>
              {errors.projectDuration && (
                <p className="mt-8 text-sm text-red-600" id="decription-error">
                  {errors.projectDuration.message}
                </p>
              )}
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold leading-6 text-gray-900">
                Select Compensation Type
              </legend>

              <div className="mt-6 space-y-6">
                <div className="flex items-center gap-x-3">
                  <input
                    id="HOURLY"
                    value="HOURLY"
                    {...register("compensation")}
                    type="radio"
                    className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                    defaultChecked={data?.compType === "HOURLY"}
                  />
                  <label
                    htmlFor="HOURLY"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Hourly Rate
                  </label>
                </div>
                <div className="grid sm:grid-cols-6 gap-x-4 gap-y-2">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="hourly-min-rate"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      From
                    </label>
                    <div className="flex relative rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-black sm:max-w-md">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        id="hourly-min-rate"
                        {...register("hourlyMinRate")}
                        className="remove-arrow block pl-7 flex-1 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 focus:outline-0 px-3"
                        defaultValue={
                          data?.compType === "HOURLY"
                            ? data?.hourlyMinRate ?? ""
                            : ""
                        }
                      />
                    </div>
                    {errors.hourlyMinRate && (
                      <p
                        className="mt-2 text-sm text-red-600"
                        id="decription-error"
                      >
                        {errors.hourlyMinRate.message}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="hourly-max-rate"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      To
                    </label>
                    <div className="relative flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-black sm:max-w-md sm:col-span-2">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        id="hourly-max-rate"
                        {...register("hourlyMaxRate")}
                        className="remove-arrow  block pl-7 flex-1 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 focus:outline-0 px-3"
                        defaultValue={
                          data?.compType === "HOURLY"
                            ? data?.hourlyMaxRate ?? ""
                            : ""
                        }
                      />
                    </div>
                    {errors.hourlyMaxRate && (
                      <p
                        className="mt-2 text-sm text-red-600"
                        id="decription-error"
                      >
                        {errors.hourlyMaxRate.message}
                      </p>
                    )}
                  </div>
                </div>
                {/* <div className="flex items-center gap-x-3">
                  <input
                    id="FIXED"
                    value="FIXED"
                    {...register("compensation")}
                    type="radio"
                    className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                    defaultChecked={data?.compType === "FIXED"}
                  />
                  <label
                    htmlFor="FIXED"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Project fixed price
                  </label>
                </div> */}
                {/* {watch("compensation") === "FIXED" && (
                  <>
                    <div className="grid sm:grid-cols-6 gap-x-4">
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="project-cost"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          Project Cost
                        </label>
                        <div className="relative  flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-black sm:max-w-md">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            id="project-cost"
                            {...register("projectCost")}
                            className="remove-arrow block pl-7 flex-1 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 focus:outline-0 px-3"
                            defaultValue={
                              data?.compType === "FIXED"
                                ? data?.projectCost ?? ""
                                : ""
                            }
                          />
                        </div>
                      </div>
                    </div>
                    {errors.projectCost && (
                      <p
                        className="!mt-4 text-sm text-red-600"
                        id="project-cost-error"
                      >
                        {errors.projectCost.message}
                      </p>
                    )}
                  </>
                )} */}
              </div>
              {errors.compensation && (
                <p className="mt-8 text-sm text-red-600" id="decription-error">
                  {errors.compensation.message}
                </p>
              )}
            </fieldset>
          </div>
        </div>
      </div>

      {/* type Add, Reuse => yes
          type Edit isPublished = false && status !== Active => Yes

      
      */}

      <div className="mt-6 flex items-center justify-end gap-x-6">
        {type === "reuse" && (
          <button
            className="text-sm font-semibold leading-6 text-red-500"
            onClick={handleCancel}
          >
            Cancel
          </button>
        )}
        {(type === "add" ||
          type === "reuse" ||
          (type === "edit" &&
            !data?.isPublished &&
            data?.status !== "ACTIVE")) && (
          <button
            type="button"
            className="text-sm font-semibold leading-6 text-gray-900"
            name="draft"
            onClick={handleSaveAsDraftJob}
          >
            Save as a draft
          </button>
        )}
        {(type === "edit" || type === "add") && (
          <button
            className="text-sm font-semibold leading-6 text-gray-900"
            onClick={handleCancel}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
          name="update"
        >
          {data?.isPublished && data?.status === "ACTIVE" && type !== "reuse"
            ? "Save"
            : "Post this job"}
        </button>
      </div>
    </form>
  );
};

export default JobForm;
