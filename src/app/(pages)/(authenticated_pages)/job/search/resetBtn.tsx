"use client";
import EmptyState from "@/app/components/ui/shared/EmptyState";
import { usePathname, useRouter } from "next/navigation";

/**
 *
 * Note: currently not showing the reset button as the path maybe reset but the left search sidebar is not stying in sync with what is the url praaameters
 */
const ResetBtn = () => {
  const router = useRouter();
  const { replace } = useRouter();
  const pathname = usePathname();

  const handleReset = () => {
    replace(`${pathname}`);
  };

  return (
    <div className="text-base text-gray-800 my-8">
      <EmptyState
        label={`NO RESULTS`}
        // ctaText="Reset Filters"
        type="search"
        // handleCTA={handleReset}
      />
    </div>
  );
};

export default ResetBtn;
