import { ExclamationTriangleIcon } from '@heroicons/react/20/solid'

export default function BetaCTA({ message, title }: 
  { 
    message: string,
    title: string,
  }) {
  return (
    <div className="bg-gray-100 mb-10 -mt-5 rounded-lg">
      <div className="mx-auto max-w-7xl px-6 py-8 sm:py-8 lg:px-8">
        <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-xl">
          {title}
        </h2>
        <p className="mx-auto mt-2 text-sm leading-6 text-gray-900">
          {message}
        </p>
      </div>
    </div>
  );
}
