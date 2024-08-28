import { classNames } from "@/app/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
}
const SectionContainer = ({ children, className }: Props) => {
  return (
    <div
      className={classNames(
        "shadow rounded-lg py-5 mt-7 flex flex-col justify-center ",
        className ?? ""
      )}
    >
      {children}
    </div>
  );
};

export default SectionContainer;