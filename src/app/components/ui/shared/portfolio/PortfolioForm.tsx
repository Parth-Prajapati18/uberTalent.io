import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  fileExtensionValidator,
  fileSizeValidator,
  PortfolioSchema,
  PortfolioType,
} from "@/app/schema/PortfolioSchema";
import ComboMultiSelect from "@/app/components/ui/shared/ComboMultiSelect";
import { skills } from "@/app/constants";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { useParams, useRouter } from "next/navigation";
import { useUserContext } from "@/app/providers/UserProvider";
import { createPortfolio, getPortfolioById, updatePortfolio } from "@/app/lib/api";
import Link from "next/link";
import { upload } from "@vercel/blob/client";
import Loader from "../Loader";
import { classNames } from "@/app/utils";

const PortfolioForm: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { user, fetchUser } = useUserContext();
  const [data, setData] = useState<any>();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isPortfolioSaving, setIsPortfolioSaving] = useState<boolean>(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PortfolioType>({
    resolver: zodResolver(PortfolioSchema),
    defaultValues: {
      content: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "content",
    keyName: "_id",
  });

  const removeSkill = (value: string) => {
    const temp = selectedSkills.filter((skill) => skill !== value);
    setSelectedSkills(temp);
    setValue("skills", temp);
  };

  const handleSkillSelect = (val: any) => {
    setSelectedSkills(val);
    setValue("skills", val);
  };

  const onDrop = (acceptedFiles: any) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      appendFile(acceptedFiles?.[0]);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    appendFile(file);
  };

  const appendFile = (file: any) => {
    if (file) {
      const id = `file_${Date.now()}`;
      const content = URL.createObjectURL(file);
      const type = file.type.includes("pdf") ? "PDF" : "IMAGE";

      const fileExtensionError = fileExtensionValidator.safeParse({
        type: file.type,
      });
      const fileSizeError = fileSizeValidator.safeParse({ size: file.size });

      if (!fileExtensionError.success || !fileSizeError.success) {
        // Remove previous error if any
        const removePrevErrIndx = fields.findIndex((c: any) => c.error);
        if (removePrevErrIndx > -1) {
          remove(removePrevErrIndx);
        }

        if (!fileExtensionError.success) {
          append({
            id,
            type,
            content,
            error: fileExtensionError.error.errors[0].message,
          });
        }

        if (!fileSizeError.success) {
          append({
            id,
            type,
            content,
            error: fileSizeError.error.errors[0].message,
          });
        }
      } else {
        append({
          id,
          type,
          content,
          attachment: file,
        });
      }
    }
  };

  const onSubmit = async (data: PortfolioType) => {
    try {
      setIsPortfolioSaving(true);
      const content: any = await Promise.all(
        fields
          .filter((field: any) => !field.error)
          .map(async (field: any) => {
            const file = field.attachment;
            if (file) {
              try {
                const newBlob = await upload(`portfolio/${file?.name}`, file, {
                  access: "public",
                  handleUploadUrl: "/api/freelancer/portfolio/attachment",
                });
                return { type: field.type, content: newBlob.url };
              } catch (error) {
                console.error("Error uploading file", error);
                return null;
              }
            }
            return field;
          })
      );

      const portfolio: any = { ...data, content: content.filter((c: any) => c) };

      if (user?.freelancerProfile) {
        portfolio.freelancerId = user?.freelancerProfile.id;
        if (params.id) {
          await updatePortfolio(params.id, portfolio);
        } else {
          await createPortfolio(portfolio);
        }
        fetchUser();
        router.push("/settings/freelancer/portfolio");
      }
    } catch (error) {
      console.error("Error while portfolio save ::: ", error);
    } finally {
      setIsPortfolioSaving(false);
    }
  };

  useEffect(() => {
    if (data) {
      setValue("title", data.title);
      setValue("description", data.description);
      setValue("url", data.url);
      setValue("skills", data.skills);
      setSelectedSkills(data.skills);
      if (Array.isArray(data.content)) {
        data.content.forEach((c: any) => {
          const index = fields.findIndex((field) => field.id === c.id);
          if (index === -1) {
            append({ id: c.id, type: c.type, content: c.content });
          }
        });
      }
    } else {
      setValue("skills", []);
    }
  }, [data]);

  useEffect(() => {
    (async () => {
      if (params.id) {
        try {
          const data = await getPortfolioById(params.id as string);
          setData(data);
        } catch (err) {
          alert("Something went wrong");
        }
      }
    })();
  }, [params.id]);

  const { content } = watch();
  const fileError = content.find((c: any) => c.error);
  const contentList = fields.filter((f: any) => !f.error);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            {params.id ? "Edit" : "Add"} Portfolio
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            This information will be displayed publicly so be careful what you
            share.
          </p>

          {/* Basic Fields */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">
              Portfolio Title
            </label>
            <input
              {...register("title")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-black sm:text-sm"
            />
            {errors.title && (
              <p className="mt-2 text-sm text-red-600">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">
              Portfolio Description
            </label>
            <textarea
              {...register("description")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-black sm:text-sm"
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">
              Portfolio URL
            </label>
            <input
              {...register("url")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-black sm:text-sm"
            />
            {errors.url && (
              <p className="mt-2 text-sm text-red-600">{errors.url.message}</p>
            )}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">
              Skills
            </label>
            <ComboMultiSelect
              label=""
              options={skills}
              selectedOptions={selectedSkills}
              setSelectedOptions={handleSkillSelect}
            />

            {selectedSkills.length > 0 && (
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
            )}
            {errors.skills && (
              <p className="mt-2 text-sm text-red-600" id="email-error">
                {errors.skills.message}
              </p>
            )}
          </div>

          {/* Media Content Upload */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">
              Media Content
            </label>
            {/* List of Uploaded Files */}
            {contentList.length > 0 && (
              <div className="my-4">
                <ul className="mt-2 space-y-2">
                  {contentList.map((field, index) => (
                    <li
                      key={field._id}
                      className="flex items-center justify-between"
                    >
                      {field.type === "IMAGE" && (
                        <img
                          src={field.content}
                          alt="Uploaded file"
                          className="h-20 w-20 object-cover"
                        />
                      )}
                      {field.type === "PDF" && (
                        <a
                          href={field.content}
                          target="_blank"
                          className="text-sm font-medium text-indigo-500"
                        >
                          View PDF
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-sm text-red-500"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div
              className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10"
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                onDrop(Array.from(e.dataTransfer.files));
              }}
            >
              <div className="text-center">
                <PhotoIcon
                  aria-hidden="true"
                  className="mx-auto h-12 w-12 text-gray-300"
                />
                <div className="mt-4 flex text-sm leading-6 text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md bg-white font-semibold text-black focus-within:outline-none focus-within:ring-2 focus-within:ring-black focus-within:ring-offset-2 hover:text-indigo-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs leading-5 text-gray-600">
                  PNG, JPG, PDF up to 4.5MB
                </p>
              </div>
            </div>
          </div>

          {fileError?.error && (
            <p className="mt-2 text-sm text-red-600">{fileError?.error}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <Link
          href={`/settings/freelancer/portfolio`}
          className="text-sm font-semibold leading-6 text-gray-900"
        >
          Cancel
        </Link>
        <button
          type={isPortfolioSaving ? "button" : "submit"}
          disabled={isPortfolioSaving}
          className={classNames(
            "flex items-center justify-center rounded-md min-w-16 bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
            isPortfolioSaving ? "opacity-70 cursor-wait" : ""
          )}
        >
          {isPortfolioSaving ? (
            <Loader className="w-5 h-5 text-white animate-spin dark:white fill-rose-400" />
          ) : (
            "Save"
          )}
        </button>
      </div>
    </form>
  );
};

export default PortfolioForm;
