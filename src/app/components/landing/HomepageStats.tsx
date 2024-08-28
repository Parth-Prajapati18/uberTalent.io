import Image from "next/image";

const stats = [
  { id: 1, name: "Industries served", value: "100+" },
  { id: 2, name: "Fees", value: "0" },
  { id: 3, name: "Countries: Global presence", value: "190+" },
  { id: 4, name: "Earnings Retention", value: "100%" },
];

export default function HomepageStats() {
  return (
    <div className="relative bg-white">
      <div className="h-56 w-full bg-gray-50 object-cover relative lg:absolute lg:inset-y-0 lg:left-0 lg:h-full lg:w-1/2">
        <Image
          src="/images/our-track-record-new.jpg"
          alt=""
          className="object-cover"
          fill={true}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
        <div className="px-6 pb-24 pt-16 sm:pb-32 sm:pt-20 lg:col-start-2 lg:px-8 lg:pt-32">
          <div className="mx-auto max-w-2xl lg:mr-0 lg:max-w-lg">
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Designed to benefit the independent talent and businesses worldwide
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
            At UberTalent, we&apos;re not just a platform; we&apos;re a global ecosystem where independent professionals and businesses thrive together. Our approach is tailored to nurture success for all parties involved.
            </p>
            <dl className="mt-16 grid max-w-xl grid-cols-1 gap-8 sm:mt-20 sm:grid-cols-2 xl:mt-16">
              {stats.map((stat) => (
                <div
                  key={stat.id}
                  className="flex flex-col gap-y-3 border-l border-gray-900/10 pl-6"
                >
                  <dt className="text-sm leading-6 text-gray-600">
                    {stat.name}
                  </dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
