import SortButton from "./SortButton";
import SearchInput from "./SearchInput";
import { RefObject, FC } from "react";
import { useUserContext } from "@/app/providers/UserProvider";

interface SearchHandlerComponentProps {
  searchHandlerRef?: RefObject<typeof SearchInput>;
}

const JobFilterSection: FC<SearchHandlerComponentProps> = ({
  searchHandlerRef,
}) => {
  const { user } = useUserContext();
  return (
    <div className="border-b border-gray-200 pb-3 grid grid-cols-3 items-center justify-between">
      <h3 className="text-base font-semibold leading-6 text-gray-900">
        Job Postings
      </h3>
    </div>
  );
};

export default JobFilterSection;
