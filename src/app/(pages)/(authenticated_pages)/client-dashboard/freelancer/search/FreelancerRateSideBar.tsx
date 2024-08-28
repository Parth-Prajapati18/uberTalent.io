import RangeSlider from "react-range-slider-input";

interface FreelancerRateProps {
  rate: any;
  setHourlyRate: (value: number[]) => void;
  hourlyRate: number[];
}

const FreelancerRateSideBar: React.FC<FreelancerRateProps> = ({
  rate,
  hourlyRate,
  setHourlyRate,
}) => {
  return (
    <div className="px-3">
      <label htmlFor="category" className="text-sm font-semibold text-gray-900">
        Hourly Rate (Min: {hourlyRate[0]}, Max: {hourlyRate[1]})
      </label>
      <div className="relative">
        <div className="flex justify-between mb-3">
          <span className="ml-2">1</span>
          <span>{rate?.max}</span>
        </div>
        <div className="flex pb-4">
          <RangeSlider
            id="range-slider"
            min={1}
            max={rate?.max}
            step={1}
            value={hourlyRate}
            onInput={setHourlyRate}
          />
        </div>
      </div>
    </div>
  );
};

export default FreelancerRateSideBar;
