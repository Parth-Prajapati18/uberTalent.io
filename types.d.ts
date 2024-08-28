// import type { DefaultUser } from 'next-auth';

// declare module 'next-auth' {
//   interface Session {
//     user?: DefaultUser & {
//       id: string;
//     };
//   }
// }

// declare module 'next-auth/jwt/types' {
//   interface JWT {
//     uid: string;
//   }
// }

declare module "react-range-slider-input" {
  export interface RangeSliderProps {
    id?: string;
    min?: number;
    max?: number;
    step?: number;
    value?: any;
    onInput?: any;
    onChange?: (value: number) => void;
  }

  const RangeSlider: React.FC<RangeSliderProps>;

  export default RangeSlider;
}
