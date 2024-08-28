"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Params = {
  [key: string]: string;
};

const useParamsManager = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const getSearchParams = (key: string) => {
    return params.get(key);
  };

  const setSearchParams = (paramObj: Params) => {
    Object.entries(paramObj).forEach(([key, value]) => {
      params.set(key, value);
    });
  };

  const deleteSearchParam = (key: string) => {
    params.delete(key);
  };

  const commit = () => {
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    // replace(`${pathname}?${params.toString()}`);
  };

  return { getSearchParams, setSearchParams, deleteSearchParam, commit };
};

export default useParamsManager;
